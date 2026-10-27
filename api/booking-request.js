/* POST /api/booking-request
   Website "Book Now" requests, guest questions and "Contact us" messages
   → Hostaway, as an inquiry
   on the villa's listing (POST /v1/reservations, status "inquiry" — per the
   Hostaway docs "a guest question which doesn't block the calendar"). The
   team sees it, with its conversation, in the owner's Hostaway account and
   approves or replies from there. Nothing here confirms a booking.

   Body (JSON), sent by the contact form (assets/js/main.js):
     intent      "book" | "question"
     villa       villa slug (mapped to the Hostaway listing below)
     checkin, checkout   YYYY-MM-DD (required for "book", optional for "question")
     adults, children, infants, bedrooms
     firstName, lastName, email, phone (optional), phoneCountry, notes, lang
     company     honeypot — real visitors never see or fill it
     source      "contact-us" from contact-us.html: always a question, with an
                 optional subject; villa may be empty (general message, filed
                 under GENERAL_MESSAGE_VILLA since Hostaway needs a listing)

   Hostaway endpoints used (https://api.hostaway.com/documentation):
     POST /v1/accessTokens                       (api/_lib/hostaway.js)
     GET  /v1/listings/{id}                      personCapacity
     GET  /v1/listings/{id}/calendar             availability + minimumStay
     GET  /v1/reservations?listingId=&arrival…   duplicate check
     POST /v1/reservations?provider=Website      create the inquiry */

const { parsePhoneNumberFromString } = require("libphonenumber-js/max");
const { hostawayGet, hostawayPost } = require("./_lib/hostaway");
const { sendFallbackEmail } = require("./_lib/email-fallback");
const { crossSite } = require("./_lib/same-origin");
const { clientIp, createRateLimiter } = require("./_lib/rate-limit");

/* Villa slug → Hostaway listing (same IDs as hostawayListingId in
   assets/js/villas-data.js). The listing ID is resolved here, never taken
   from the request. maxGuests is only a fallback if Hostaway's own
   personCapacity can't be read. */
const VILLAS = {
  "villa-aqua": { listingMapId: 145234, name: "Villa Aqua", maxGuests: 18 },
  "kasa-kefi": { listingMapId: 305921, name: "Kasa Kefi", maxGuests: 12 },
  "casa-corazon": { listingMapId: 144272, name: "Casa Corazon", maxGuests: 22 },
  "casa-de-las-estrellas": { listingMapId: 456289, name: "Casa de las Estrellas", maxGuests: 10 },
};

/* "Contact us" messages not about a specific villa still need a listing in
   Hostaway; they land here, flagged as general in the host note. */
const GENERAL_MESSAGE_VILLA = "villa-aqua";

const CONTACT = { whatsapp: "+52 984 807 9475", email: "info@mexicoluxestays.com" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Longest stay that can be booked; a question may ask about any length.
const MAX_NIGHTS = 90;

/* Basic abuse limits (api/_lib/rate-limit.js): 5 submissions per IP every
   10 minutes; the Hostaway-side duplicate check below covers repeats that
   land on another instance. */
const rateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });
const recentSubmissions = new Map(); // dedupe key → timestamp
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

/* Phone (optional): when given, must be a real number for its country
   (Google's libphonenumber rules, full metadata) — Hostaway rejects
   impossible numbers such as +52 000 000 0000 with "Please provide a valid
   phone number". Returns the E.164 form (+529848079475) sent to Hostaway, or
   null. Accepts "00" for "+", the pre-2019 Mexican mobile "+52 1" prefix
   guests still type, and a local number for the country picked in the form
   (two-letter code, e.g. "MX"). */
function normalizePhone(raw, country) {
  let s = String(raw ?? "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (/^\+521\d{10}$/.test(s)) s = `+52${s.slice(4)}`;
  const cc = /^[A-Z]{2}$/.test(country || "") ? country : undefined;
  if (!/^\+[1-9]\d{6,14}$/.test(s) && !(cc && /^\d{4,15}$/.test(s))) return null;
  let parsed;
  try { parsed = parsePhoneNumberFromString(s, cc); } catch { return null; }
  return parsed && parsed.isValid() ? parsed.number : null;
}

const clean = (v, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const toInt = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : fallback);
const isoToday = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const nightsBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const validIsoDate = (s) => ISO_DATE_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

function fail(res, status, code, extra = {}) {
  res.status(status).json({ ok: false, code, contact: CONTACT, ...extra });
}

function validate(body) {
  const fromContactPage = body.source === "contact-us";
  const intent = fromContactPage || body.intent === "question" ? "question" : "book";
  const general = fromContactPage && !VILLAS[body.villa];
  const villa = VILLAS[general ? GENERAL_MESSAGE_VILLA : body.villa];
  const data = {
    intent,
    fromContactPage,
    general,
    villaSlug: body.villa,
    villa,
    subject: fromContactPage ? clean(body.subject, 150) : "",
    firstName: clean(body.firstName, 80),
    lastName: clean(body.lastName, 80),
    email: clean(body.email, 120).toLowerCase(),
    phone: clean(body.phone, 40),
    phoneCountry: clean(body.phoneCountry, 2).toUpperCase(),
    notes: String(body.notes ?? "").trim().slice(0, 2000),
    lang: body.lang === "es" ? "es" : "en",
    checkin: clean(body.checkin, 10),
    checkout: clean(body.checkout, 10),
    adults: toInt(body.adults, 1),
    children: toInt(body.children),
    infants: toInt(body.infants),
    bedrooms: toInt(body.bedrooms),
  };

  if (!villa) return { error: "villa" };
  if (!data.firstName) return { error: "firstName" };
  if (!data.lastName) return { error: "lastName" };
  if (!EMAIL_RE.test(data.email)) return { error: "email" };
  if (data.phone) {
    const phoneE164 = normalizePhone(data.phone, data.phoneCountry);
    if (!phoneE164) return { error: "phone" };
    data.phone = phoneE164;
  }
  if (intent === "question" && data.notes.length < 2) return { error: "notes" };

  const hasDates = !!(data.checkin || data.checkout);
  if (intent === "book" || hasDates) {
    if (!validIsoDate(data.checkin) || !validIsoDate(data.checkout)) return { error: "dates" };
    if (data.checkin < isoToday()) return { error: "dates" };
    const nights = nightsBetween(data.checkin, data.checkout);
    if (nights < 1 || (intent === "book" && nights > MAX_NIGHTS)) return { error: "dates" };
    data.nights = nights;
    data.hasDates = true;
  }
  if (data.adults < 1) return { error: "guests" };
  return { data };
}

async function listingCapacity(villa) {
  try {
    const res = await hostawayGet(`/listings/${villa.listingMapId}`);
    const cap = Number(res?.result?.personCapacity);
    return cap > 0 ? cap : villa.maxGuests;
  } catch (err) {
    console.warn("[booking-request] personCapacity unavailable, using site value", err.message);
    return villa.maxGuests;
  }
}

/* Every night of the stay must be free; the arrival day sets the minimum
   stay and closed-to-arrival/departure flags (Hostaway calendar day object). */
async function checkAvailability(listingMapId, checkin, checkout, nights) {
  const res = await hostawayGet(`/listings/${listingMapId}/calendar`, { startDate: checkin, endDate: checkout });
  const days = Array.isArray(res?.result) ? res.result : [];
  const byDate = new Map(days.map((d) => [d.date, d]));
  for (let i = 0; i < nights; i += 1) {
    const day = byDate.get(addDaysIso(checkin, i));
    if (!day || day.status !== "available" || Number(day.isAvailable) === 0) return { ok: false, code: "unavailable" };
  }
  const arrival = byDate.get(checkin);
  const minNights = Number(arrival?.minimumStay) || 1;
  if (nights < minNights) return { ok: false, code: "min_stay", minNights };
  if (arrival?.closedOnArrival) return { ok: false, code: "closed_arrival" };
  if (byDate.get(checkout)?.closedOnDeparture) return { ok: false, code: "closed_departure" };
  return { ok: true };
}

/* An inquiry still has to sit on real nights, and Hostaway refuses one that
   overlaps a reservation (403 "Requested dates are not available …
   conflicting with reservations"). So a question without usable dates goes
   on the first free night from today on; the host note says they're
   placeholders. null if nothing is free in the window. */
const PLACEHOLDER_SEARCH_DAYS = 365;
async function firstFreeNight(listingMapId) {
  const start = isoToday();
  const res = await hostawayGet(`/listings/${listingMapId}/calendar`, { startDate: start, endDate: addDaysIso(start, PLACEHOLDER_SEARCH_DAYS) });
  const days = Array.isArray(res?.result) ? res.result : [];
  const free = days
    .filter((d) => d.date >= start && d.status === "available" && Number(d.isAvailable) !== 0)
    .map((d) => d.date)
    .sort();
  return free[0] || null;
}

/* Same guest + villa + dates already in Hostaway (e.g. sent twice, or the
   first attempt timed out after Hostaway had saved it) → don't create again. */
async function alreadyInHostaway(data, arrivalDate, departureDate) {
  try {
    const res = await hostawayGet("/reservations", {
      listingId: data.villa.listingMapId,
      arrivalStartDate: arrivalDate,
      arrivalEndDate: arrivalDate,
      limit: 50,
    });
    return (res?.result || []).some((r) =>
      String(r.guestEmail || "").toLowerCase() === data.email &&
      r.departureDate === departureDate &&
      !["cancelled", "declined", "expired"].includes(r.status));
  } catch (err) {
    console.warn("[booking-request] duplicate check skipped", err.message);
    return false;
  }
}

/* Hostaway often takes longer than the default 8s to create a reservation,
   and still saves it — so the create call gets more room (see maxDuration
   for this function in vercel.json). */
const CREATE_TIMEOUT_MS = 25000;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "method" });
    return;
  }
  if (crossSite(req)) return fail(res, 403, "forbidden");
  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot filled → pretend success, create nothing.
  if (clean(body.company)) {
    res.status(200).json({ ok: true });
    return;
  }
  if (rateLimited(clientIp(req))) return fail(res, 429, "rate_limited");

  const { data, error } = validate(body);
  if (error) return fail(res, 400, "invalid", { field: error });

  let arrivalDate = data.hasDates ? data.checkin : null;
  let departureDate = data.hasDates ? data.checkout : null;
  let placeholderDates = !data.hasDates;
  let askedDatesNote = null;
  let overCapacity = null;
  const dedupeKey = [data.email, data.villa.listingMapId, data.hasDates ? `${data.checkin}/${data.checkout}` : "nodates", data.intent].join("|");
  const seenAt = recentSubmissions.get(dedupeKey);
  if (seenAt && Date.now() - seenAt < DEDUPE_WINDOW_MS) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  try {
    /* A booking must fit the villa; a question may ask for a bigger group
       (the team can still make it work or offer an alternative). Hostaway
       gets a party within capacity and the host note has the real numbers. */
    const capacity = await listingCapacity(data.villa);
    if (data.adults + data.children > capacity) {
      if (data.intent === "book") return fail(res, 400, "capacity", { maxGuests: capacity });
      overCapacity = { adults: data.adults, children: data.children, capacity };
    }

    if (data.intent === "book") {
      const availability = await checkAvailability(data.villa.listingMapId, data.checkin, data.checkout, data.nights);
      if (!availability.ok) return fail(res, 409, availability.code, availability.minNights ? { minNights: availability.minNights } : {});
    } else if (data.hasDates) {
      /* A question about nights that are already booked, or that break the
         minimum stay or arrival/departure rules, could be refused by
         Hostaway; send it anyway on placeholder nights, noting the dates
         asked and why, so the team can make an exception or suggest others. */
      const availability = data.nights > MAX_NIGHTS
        ? { ok: false, code: "too_long" }
        : await checkAvailability(data.villa.listingMapId, data.checkin, data.checkout, data.nights)
          .catch(() => ({ ok: true }));
      if (!availability.ok) {
        placeholderDates = true;
        const why = {
          unavailable: "not available in the calendar",
          min_stay: `${data.nights} night(s), under the ${availability.minNights}-night minimum stay`,
          closed_arrival: "check-in day is closed to arrival",
          closed_departure: "check-out day is closed to departure",
          too_long: `${data.nights} nights, over the ${MAX_NIGHTS}-night maximum for an online booking`,
        }[availability.code] || "not bookable as asked";
        askedDatesNote = `Dates asked about: ${data.checkin} to ${data.checkout} — ${why}, so the dates shown are placeholders.`;
      }
    }

    if (placeholderDates) {
      const night = await firstFreeNight(data.villa.listingMapId);
      if (!night) throw Object.assign(new Error("No free night for a placeholder inquiry"), { status: 409, path: "calendar" });
      arrivalDate = night;
      departureDate = addDaysIso(night, 1);
    }

    if (!placeholderDates && (await alreadyInHostaway(data, arrivalDate, departureDate))) {
      recentSubmissions.set(dedupeKey, Date.now());
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }

    const kind = data.intent === "book" ? "Booking request" : "Guest question";
    const hostNote = [
      data.fromContactPage
        ? "Message from the website's Contact us page (mexicoluxestays.com)."
        : `${kind} from the website contact form (mexicoluxestays.com).`,
      data.general ? `General message, not about a specific villa — filed under ${data.villa.name} only because Hostaway needs a listing.` : null,
      data.subject ? `Subject: ${data.subject}` : null,
      data.intent === "book" ? "Status: inquiry — not confirmed, calendar not blocked. Approve or decline in Hostaway." : "Question only — no stay requested.",
      data.bedrooms ? `Bedrooms requested: ${data.bedrooms}` : null,
      askedDatesNote,
      overCapacity ? `Guests asked about: ${overCapacity.adults} adult(s) + ${overCapacity.children} child(ren) — over the villa's capacity of ${overCapacity.capacity}; the guest count shown is capped.` : null,
      !data.hasDates ? "No dates given (dates shown are placeholders)." : null,
    ].filter(Boolean).join("\n");

    const reservation = {
      channelId: 2000, // direct — one of the three channels the create endpoint accepts
      listingMapId: data.villa.listingMapId,
      status: "inquiry",
      guestName: `${data.firstName} ${data.lastName}`,
      guestFirstName: data.firstName,
      guestLastName: data.lastName,
      guestEmail: data.email,
      ...(data.phone ? { phone: data.phone } : {}),
      guestLocale: data.lang,
      numberOfGuests: overCapacity ? capacity : data.adults + data.children,
      adults: overCapacity ? Math.min(data.adults, capacity) : data.adults,
      children: overCapacity ? Math.max(0, capacity - Math.min(data.adults, capacity)) : data.children,
      infants: data.infants,
      arrivalDate,
      departureDate,
      ...(placeholderDates ? { isDatesUnspecified: 1 } : {}),
      guestNote: data.notes || null,
      hostNote,
    };

    const created = await hostawayPost("/reservations", reservation, { provider: "Website" }, { timeoutMs: CREATE_TIMEOUT_MS });
    const result = created?.result || {};
    recentSubmissions.set(dedupeKey, Date.now());
    console.info("[booking-request] created", JSON.stringify({ id: result.id, status: result.status, listingMapId: result.listingMapId, arrivalDate: result.arrivalDate, departureDate: result.departureDate, source: result.source }));
    res.status(200).json({ ok: true, status: result.status || null, reference: result.id || null });
  } catch (err) {
    /* A slow create often still lands in Hostaway after we gave up waiting:
       look for it before telling the guest it failed. */
    if (err.status === 504 && err.path && err.path.includes("/reservations") && (await alreadyInHostaway(data, arrivalDate, departureDate))) {
      recentSubmissions.set(dedupeKey, Date.now());
      console.info("[booking-request] create timed out but the reservation is in Hostaway", JSON.stringify({ listingMapId: data.villa.listingMapId, arrivalDate, departureDate }));
      res.status(200).json({ ok: true, late: true });
      return;
    }
    console.error("[booking-request] Hostaway failure", JSON.stringify({ message: err.message, status: err.status, path: err.path, body: err.body }));
    const emailed = await sendFallbackEmail({
      subject: `${data.intent === "book" ? "Booking request" : "Guest question"} — ${data.firstName} ${data.lastName} — ${data.general ? "General message" : data.villa.name}`,
      replyTo: data.email,
      rows: [
        ["Guest", `${data.firstName} ${data.lastName}`], ["Email", data.email], ["Phone / WhatsApp", data.phone || "—"],
        ["Villa", data.villa.name], ["Dates", data.hasDates ? `${data.checkin} to ${data.checkout}` : "—"],
        ["Adults", data.adults], ["Children (2-12)", data.children], ["Infants (0-2)", data.infants],
        ["Bedrooms", data.bedrooms || "—"], ["Subject", data.subject || "—"], ["Message", data.notes || "—"],
      ],
    });
    if (emailed) {
      recentSubmissions.set(dedupeKey, Date.now());
      res.status(200).json({ ok: true, via: "email" });
      return;
    }
    fail(res, err.status === 504 ? 504 : 502, "upstream");
  }
};
