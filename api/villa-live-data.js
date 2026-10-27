/* GET /api/villa-live-data?listingId=<hostawayListingId>
   Proxies Hostaway's Calendar API (availability, per-date minimum stay,
   closed-to-arrival/departure days, lowest nightly price) and
   Reviews API (testimonials) for one listing, merged into the shape
   assets/js/villas-data.js already uses so the frontend needs no
   per-field mapping. Credentials stay server-side (see api/_lib/hostaway.js);
   review fetching, filtering and name shortening live in
   api/_lib/hostaway-reviews.js. */

const { hostawayGet } = require("./_lib/hostaway");
const { getListingTestimonials } = require("./_lib/hostaway-reviews");
const { clientIp, createRateLimiter } = require("./_lib/rate-limit");

/* Normally served from the edge cache; a client that keeps missing it
   (e.g. junk query strings) would call Hostaway every time. A page view
   needs one or two of these. */
const rateLimited = createRateLimiter({ windowMs: 60 * 1000, max: 60 });

/* Only these listings are proxied — the four villas in villas-data.js. */
const KNOWN_LISTINGS = new Set(["145234", "305921", "144272", "456289"]);
const REVIEWS_BUDGET_MS = 5000;

const nextDay = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/* Collapse calendar days into { start, end } runs of consecutive dates
   that share the same key (true for "matches", or a value like a
   minimum stay); days whose key is null are skipped. */
function toRanges(calendarDays, keyOf) {
  const ranges = [];
  [...calendarDays].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((d) => {
    const key = keyOf(d);
    if (key === null || key === undefined || key === false) return;
    const last = ranges[ranges.length - 1];
    if (last && last.key === key && nextDay(last.end) === d.date) last.end = d.date;
    else ranges.push({ start: d.date, end: d.date, key });
  });
  return ranges;
}
const plainRanges = (ranges) => ranges.map(({ start, end }) => ({ start, end }));

const isOpen = (d) => d.status === "available" && d.isAvailable !== 0;

/* The Booking Engine's own public calendar also closes the first days
   by each listing's advance notice, which the Calendar API above doesn't.
   Without this the site offers e.g. a check-in today that the checkout
   then drops, leaving its total spinning on "Select dates". Optional: if
   it fails, availability ships from the Calendar API alone. */
const BOOKING_ENGINE_CALENDAR_URL = "https://booking-engine.hostaway.com/bookingEngines/reservas.mexicoluxestays.com/listings";
const BOOKING_ENGINE_TIMEOUT_MS = 4000;
async function getBookingEngineClosedDates(listingId, today) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BOOKING_ENGINE_TIMEOUT_MS);
  try {
    const res = await fetch(`${BOOKING_ENGINE_CALENDAR_URL}/${listingId}/calendar?startingDate=${today}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const days = Object.values((await res.json()).result || {});
    return new Set(days.filter((d) => !isOpen(d)).map((d) => d.date));
  } catch (err) {
    console.error(`[villa-live-data] booking engine calendar for ${listingId} skipped:`, err.message);
    return new Set();
  } finally {
    clearTimeout(timer);
  }
}

/* "From" price: the lowest nightly rate on any bookable night in the next
   12 months (not an average, which overstated the entry price). */
function toPriceFromPerNight(calendarDays) {
  const prices = calendarDays.filter((d) => isOpen(d) && Number(d.price) > 0).map((d) => Number(d.price));
  return prices.length ? Math.round(Math.min(...prices)) : null;
}

/* Minimum stay varies by date (e.g. 7 nights over Christmas). Hostaway
   applies the arrival day's minimumStay, so ship it per date: the most
   common value as the default plus the date runs that differ from it. */
function toMinStay(calendarDays) {
  const counts = {};
  calendarDays.forEach((d) => {
    const n = Number(d.minimumStay);
    if (n > 0) counts[n] = (counts[n] || 0) + 1;
  });
  const values = Object.keys(counts).map(Number);
  if (!values.length) return { minStay: null, minStayRanges: [] };
  const minStay = values.sort((a, b) => counts[b] - counts[a] || a - b)[0];
  const minStayRanges = toRanges(calendarDays, (d) => {
    const n = Number(d.minimumStay);
    return n > 0 && n !== minStay ? n : null;
  }).map(({ start, end, key }) => ({ start, end, nights: key }));
  return { minStay, minStayRanges };
}

module.exports = async (req, res) => {
  if (rateLimited(clientIp(req))) {
    res.setHeader("Cache-Control", "no-store");
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  const listingId = String(req.query.listingId || "");
  if (!KNOWN_LISTINGS.has(listingId)) {
    res.setHeader("Cache-Control", "no-store");
    res.status(404).json({ error: "Unknown listing" });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const oneYearOut = new Date();
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
  const endDate = oneYearOut.toISOString().slice(0, 10);

  try {
    // Reviews are optional: if they fail or outrun their time budget,
    // availability still ships (the browser gives up after 8s) and the
    // read keeps warming the cache for the next request.
    let budgetTimer;
    const reviewsWithinBudget = Promise.race([
      getListingTestimonials(listingId),
      new Promise((_, reject) => {
        budgetTimer = setTimeout(() => reject(new Error(`exceeded ${REVIEWS_BUDGET_MS}ms`)), REVIEWS_BUDGET_MS);
      }),
    ]).catch((err) => {
      console.error(`[villa-live-data] reviews for ${listingId} skipped:`, err.message);
      return null;
    }).finally(() => clearTimeout(budgetTimer));
    const [calendarRes, reviewsResult, engineClosed] = await Promise.all([
      hostawayGet(`/listings/${listingId}/calendar`, { startDate: today, endDate }),
      reviewsWithinBudget,
      getBookingEngineClosedDates(listingId, today),
    ]);

    const calendarDays = (calendarRes.result || []).map((d) => (engineClosed.has(d.date) && isOpen(d) ? { ...d, isAvailable: 0 } : d));
    const { minStay, minStayRanges } = toMinStay(calendarDays);
    const payload = {
      availability: {
        minStay,
        minStayRanges,
        blockedRanges: plainRanges(toRanges(calendarDays, (d) => !isOpen(d))),
        closedOnArrival: plainRanges(toRanges(calendarDays, (d) => Boolean(d.closedOnArrival))),
        closedOnDeparture: plainRanges(toRanges(calendarDays, (d) => Boolean(d.closedOnDeparture))),
      },
      priceFromPerNight: toPriceFromPerNight(calendarDays),
      testimonials: reviewsResult ? reviewsResult.testimonials : null,
      reviewsMeta: reviewsResult ? reviewsResult.meta : null,
    };

    // Without reviews (budget exceeded or failed) cache only briefly, so the
    // edge doesn't keep serving a reviewless page for the next half hour.
    res.setHeader("Cache-Control", reviewsResult
      ? "s-maxage=300, stale-while-revalidate=1800"
      : "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(payload);
  } catch (err) {
    // Details stay in the server log; the browser only learns it failed.
    console.error(`[villa-live-data] ${listingId} failed:`, err.message);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "Live data is temporarily unavailable" });
  }
};
