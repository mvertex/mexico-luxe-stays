/* POST /api/booking-request
   Website "Book Now" requests and guest questions → Hostaway, as an inquiry
   on the villa's listing (POST /v1/reservations, status "inquiry" — per the
   Hostaway docs "a guest question which doesn't block the calendar"). The
   team sees it, with its conversation, in the owner's Hostaway account and
   approves or replies from there. Nothing here confirms a booking.

   Body (JSON), sent by the contact form (assets/js/main.js):
     intent      "book" | "question"
     villa       villa slug (mapped to the Hostaway listing below)
     checkin, checkout   YYYY-MM-DD (required for "book", optional for "question")
     adults, children, infants, bedrooms
     firstName, lastName, email, phone, notes, lang
     company     honeypot — real visitors never see or fill it

   Hostaway endpoints used (https://api.hostaway.com/documentation):
     POST /v1/accessTokens                       (api/_lib/hostaway.js)
     GET  /v1/listings/{id}                      personCapacity
     GET  /v1/listings/{id}/calendar             availability + minimumStay
     GET  /v1/reservations?listingId=&arrival…   duplicate check
     POST /v1/reservations?provider=Website      create the inquiry */

const { parsePhoneNumberFromString } = require("libphonenumber-js/max");
const { hostawayGet, hostawayPost } = require("./_lib/hostaway");
const { sendFallbackEmail } = require("./_lib/email-fallback");

/* Villa slug → Hostaway listing (same IDs as hostawayListingId in
   assets/js/villas-data.js). The listing ID is resolved here, never taken
   from the request. maxGuests is only a fallback if Hostaway's own
   personCapacity can't be read. */
const VILLAS = {
  "villa-aqua": { listingMapId: 145234, name: "Villa Aqua", maxGuests: 18 },
  "kasa-kefi": { listingMapId: 305921, name: "Kasa Kefi", maxGuests: 12 },
  "casa-corazon-luxe": { listingMapId: 144272, name: "Casa Corazon Luxe", maxGuests: 22 },
  "casa-de-las-estrellas": { listingMapId: 456289, name: "Casa de las Estrellas", maxGuests: 10 },
};

const CONTACT = { whatsapp: "+52 984 807 9475", email: "info@mexicoluxestays.com" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 90;

/* Basic abuse limits. In-memory, so per warm serverless instance — enough
   to stop a double-click or a naive bot loop; Hostaway-side duplicate check
   below covers repeats that land on another instance. */
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const recentByIp = new Map();
const recentSubmissions = new Map(); // dedupe key → timestamp
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recentByIp.set(ip, hits);
  return hits.length > RATE_LIMIT.max;
}

/* Phone: must be a real number for its country (Google's libphonenumber
   rules, full metadata) — Hostaway rejects impossible numbers such as
   +52 000 000 0000 with "Please provide a valid phone number". Returns the
   E.164 form (+529848079475) sent to Hostaway, or null. Accepts "00" for
   "+", and the pre-2019 Mexican mobile "+52 1" prefix guests still type. */
function normalizePhone(raw) {
  let s = String(raw ?? "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (/^\+521\d{10}$/.test(s)) s = `+52${s.slice(4)}`;
  if (!/^\+[1-9]\d{6,14}$/.test(s)) return null;
  const parsed = parsePhoneNumberFromString(s);
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
  const intent = body.intent === "question" ? "question" : "book";
  const villa = VILLAS[body.villa];
  const data = {
    intent,
    villaSlug: body.villa,
    villa,
    firstName: clean(body.firstName, 80),
    lastName: clean(body.lastName, 80),
    email: clean(body.email, 120).toLowerCase(),
    phone: clean(body.phone, 40),
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
  const phoneE164 = normalizePhone(data.phone);
  if (!phoneE164) return { error: "phone" };
  data.phone = phoneE164;
  if (intent === "question" && data.notes.length < 2) return { error: "notes" };

  const hasDates = !!(data.checkin || data.checkout);
  if (intent === "book" || hasDates) {
    if (!validIsoDate(data.checkin) || !validIsoDate(data.checkout)) return { error: "dates" };
    if (data.checkin < isoToday()) return { error: "dates" };
    const nights = nightsBetween(data.checkin, data.checkout);
    if (nights < 1 || nights > MAX_NIGHTS) return { error: "dates" };
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

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "method" });
    return;
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot filled → pretend success, create nothing.
  if (clean(body.company)) {
    res.status(200).json({ ok: true });
    return;
  }
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return fail(res, 429, "rate_limited");

  const { data, error } = validate(body);
  if (error) return fail(res, 400, "invalid", { field: error });

  const today = isoToday();
  const arrivalDate = data.hasDates ? data.checkin : addDaysIso(today, -1);
  const departureDate = data.hasDates ? data.checkout : today;
  const dedupeKey = [data.email, data.villa.listingMapId, data.hasDates ? `${arrivalDate}/${departureDate}` : "nodates", data.intent].join("|");
  const seenAt = recentSubmissions.get(dedupeKey);
  if (seenAt && Date.now() - seenAt < DEDUPE_WINDOW_MS) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  try {
    const capacity = await listingCapacity(data.villa);
    if (data.adults + data.children > capacity) return fail(res, 400, "capacity", { maxGuests: capacity });

    if (data.intent === "book") {
      const availability = await checkAvailability(data.villa.listingMapId, data.checkin, data.checkout, data.nights);
      if (!availability.ok) return fail(res, 409, availability.code, availability.minNights ? { minNights: availability.minNights } : {});
    }

    if (data.hasDates && (await alreadyInHostaway(data, arrivalDate, departureDate))) {
      recentSubmissions.set(dedupeKey, Date.now());
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }

    const kind = data.intent === "book" ? "Booking request" : "Guest question";
    const hostNote = [
      `${kind} from the website contact form (mexicoluxestays.com).`,
      data.intent === "book" ? "Status: inquiry — not confirmed, calendar not blocked. Approve or decline in Hostaway." : "Question only — no stay requested.",
      data.bedrooms ? `Bedrooms requested: ${data.bedrooms}` : null,
      data.hasDates ? null : "No dates given (dates shown are placeholders).",
    ].filter(Boolean).join("\n");

    const reservation = {
      channelId: 2000, // direct — one of the three channels the create endpoint accepts
      listingMapId: data.villa.listingMapId,
      status: "inquiry",
      guestName: `${data.firstName} ${data.lastName}`,
      guestFirstName: data.firstName,
      guestLastName: data.lastName,
      guestEmail: data.email,
      phone: data.phone,
      guestLocale: data.lang,
      numberOfGuests: data.adults + data.children,
      adults: data.adults,
      children: data.children,
      infants: data.infants,
      arrivalDate,
      departureDate,
      ...(data.hasDates ? {} : { isDatesUnspecified: 1 }),
      guestNote: data.notes || null,
      hostNote,
    };

    const created = await hostawayPost("/reservations", reservation, { provider: "Website" });
    const result = created?.result || {};
    recentSubmissions.set(dedupeKey, Date.now());
    console.info("[booking-request] created", JSON.stringify({ id: result.id, status: result.status, listingMapId: result.listingMapId, arrivalDate: result.arrivalDate, departureDate: result.departureDate, source: result.source }));
    res.status(200).json({ ok: true, status: result.status || null, reference: result.id || null });
  } catch (err) {
    console.error("[booking-request] Hostaway failure", JSON.stringify({ message: err.message, status: err.status, path: err.path, body: err.body }));
    const emailed = await sendFallbackEmail({
      subject: `${data.intent === "book" ? "Booking request" : "Guest question"} — ${data.firstName} ${data.lastName} — ${data.villa.name}`,
      replyTo: data.email,
      rows: [
        ["Guest", `${data.firstName} ${data.lastName}`], ["Email", data.email], ["Phone / WhatsApp", data.phone],
        ["Villa", data.villa.name], ["Dates", data.hasDates ? `${data.checkin} to ${data.checkout}` : "—"],
        ["Adults", data.adults], ["Children (2-12)", data.children], ["Infants (0-2)", data.infants],
        ["Bedrooms", data.bedrooms || "—"], ["Message", data.notes || "—"],
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
