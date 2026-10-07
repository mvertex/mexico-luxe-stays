/* GET /api/villa-live-data?listingId=<hostawayListingId>
   Proxies Hostaway's Calendar API (availability, per-date minimum stay,
   closed-to-arrival/departure days, lowest nightly price) and
   Reviews API (testimonials) for one listing, merged into the shape
   assets/js/villas-data.js already uses so the frontend needs no
   per-field mapping. Credentials stay server-side (see lib/hostaway.js). */

const { hostawayGet } = require("../lib/hostaway");

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

function toTestimonials(reviews) {
  return reviews
    .filter((r) => r.type === "guest-to-host" && r.status === "published" && (r.publicReview || r.comment))
    .map((r) => {
      const text = r.publicReview || r.comment || "";
      const rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      const guestName = r.guestName || r.reviewerName || "Verified guest";
      const context = [r.channelName, r.departureDate ? r.departureDate.slice(0, 7) : null]
        .filter(Boolean)
        .join(" · ");
      return {
        name: guestName,
        rating,
        quote: { en: text, es: text },
        context: { en: context, es: context },
      };
    });
}

module.exports = async (req, res) => {
  const listingId = String(req.query.listingId || "");
  if (!KNOWN_LISTINGS.has(listingId)) {
    res.status(400).json({ error: "Unknown listingId" });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const oneYearOut = new Date();
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
  const endDate = oneYearOut.toISOString().slice(0, 10);

  try {
    const [calendarRes, reviewsRes] = await Promise.all([
      hostawayGet(`/listings/${listingId}/calendar`, { startDate: today, endDate }),
      hostawayGet("/reviews", { listingMapId: listingId }),
    ]);

    const calendarDays = calendarRes.result || [];
    // Hostaway's /reviews "listingMapId" query param is not a reliable
    // server-side filter — it can return reviews for the whole account.
    // Filter explicitly by the review's own listingMapId field instead.
    const reviews = (reviewsRes.result || []).filter(
      (r) => String(r.listingMapId) === String(listingId)
    );

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
      testimonials: toTestimonials(reviews),
    };

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    res.status(200).json(payload);
  } catch (err) {
    console.error("[villa-live-data]", listingId, err.message);
    res.status(502).json({ error: "Live availability is unavailable right now" });
  }
};
