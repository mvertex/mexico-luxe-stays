/* GET /api/villa-live-data?listingId=<hostawayListingId>
   Proxies Hostaway's Calendar API (availability, per-date minimum stay,
   closed-to-arrival/departure days, lowest nightly price) and
   Reviews API (testimonials) for one listing, merged into the shape
   assets/js/villas-data.js already uses so the frontend needs no
   per-field mapping. Credentials stay server-side (see lib/hostaway.js);
   review fetching, filtering and name shortening live in
   lib/hostaway-reviews.js. */

const { hostawayGet } = require("../lib/hostaway");
const { getListingTestimonials } = require("../lib/hostaway-reviews");

/* Only these listings are proxied — the four villas in villas-data.js. */
const KNOWN_LISTINGS = new Set(["145234", "305921", "144272", "456289"]);

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
    // Reviews are optional: if only they fail, availability still ships.
    const [calendarRes, reviewsResult] = await Promise.all([
      hostawayGet(`/listings/${listingId}/calendar`, { startDate: today, endDate }),
      getListingTestimonials(listingId).catch((err) => {
        console.error(`[villa-live-data] reviews for ${listingId} failed:`, err.message);
        return null;
      }),
    ]);

    const calendarDays = calendarRes.result || [];
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

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    res.status(200).json(payload);
  } catch (err) {
    // Details stay in the server log; the browser only learns it failed.
    console.error(`[villa-live-data] ${listingId} failed:`, err.message);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "Live data is temporarily unavailable" });
  }
};
