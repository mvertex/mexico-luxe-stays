/* GET /api/villa-live-data?listingId=<hostawayListingId>
   Proxies Hostaway's Calendar API (availability + nightly price) and
   Reviews API (testimonials) for one listing, merged into the shape
   assets/js/villas-data.js already uses so the frontend needs no
   per-field mapping. Credentials stay server-side (see lib/hostaway.js). */

const { hostawayGet } = require("../lib/hostaway");

function toBlockedRanges(calendarDays) {
  const blockedDates = calendarDays
    .filter((d) => d.status && d.status !== "available")
    .map((d) => d.date)
    .sort();

  const ranges = [];
  for (const date of blockedDates) {
    const last = ranges[ranges.length - 1];
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayStr = prevDay.toISOString().slice(0, 10);
    if (last && last.end === prevDayStr) {
      last.end = date;
    } else {
      ranges.push({ start: date, end: date });
    }
  }
  return ranges;
}

function toPriceFromPerNight(calendarDays) {
  const prices = calendarDays
    .filter((d) => d.status === "available" && Number(d.price) > 0)
    .map((d) => Number(d.price));
  if (!prices.length) return null;
  return Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
}

function toTestimonials(reviews) {
  return reviews
    .filter((r) => r.publicReview || r.comment)
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
  const listingId = req.query.listingId;
  if (!listingId) {
    res.status(400).json({ error: "Missing listingId" });
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
    const reviews = reviewsRes.result || [];

    const payload = {
      availability: {
        minStay: calendarDays[0]?.minimumStay || null,
        blockedRanges: toBlockedRanges(calendarDays),
      },
      priceFromPerNight: toPriceFromPerNight(calendarDays),
      testimonials: toTestimonials(reviews),
    };

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    res.status(200).json(payload);
  } catch (err) {
    res.status(502).json({ error: err.message || "Hostaway request failed" });
  }
};
