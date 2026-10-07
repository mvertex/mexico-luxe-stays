/* Hostaway guest reviews for the villa pages, used by api/villa-live-data.js.

   Why paginate: GET /v1/reviews returns at most `limit` reviews (default
   100, max 500), oldest first, and its listingMapId query param does not
   filter server-side. Asking for the default page meant only the account's
   first 100 reviews were ever seen, so newer reviews — and newer listings
   such as Kasa Kefi and Casa de las Estrellas — came back empty. We read
   every page once, cache the whole set in memory for a few minutes (one
   pass serves all four villas on a warm instance) and filter by each
   review's own listingMapId.

   Rating scale: Hostaway passes through each channel's own rating, so the
   scale is detected per channel from the data instead of assumed — a
   channel whose ratings go above 5 is on a 10-point scale and is halved
   to stars; otherwise its ratings are already stars. A review without a
   rating is shown without stars rather than defaulting to five. */

const { hostawayGet } = require("./hostaway");

const PAGE_SIZE = 500;
const MAX_PAGES = 20;
const CACHE_MS = 10 * 60 * 1000;

let cachedReviews = null;
let cachedAt = 0;

async function fetchAllReviews() {
  if (cachedReviews && Date.now() - cachedAt < CACHE_MS) return cachedReviews;
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await hostawayGet("/reviews", { limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    const batch = res.result || [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  cachedReviews = all;
  cachedAt = Date.now();
  return all;
}

const isPublicGuestReview = (r) =>
  r.type === "guest-to-host" && r.status === "published" && Boolean((r.publicReview || "").trim());

/* "Sarah O'Leary" → "Sarah O."; "Ami" → "Ami". Never the full surname. */
function shortName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  const first = parts[0];
  const letter = parts[1] ? (parts[1].match(/\p{L}/u) || [""])[0] : "";
  const initial = letter ? `${letter.toLocaleUpperCase()}.` : "";
  return initial ? `${first} ${initial}` : first;
}

/* channelId → true when that channel rates on a 10-point scale. */
function tenPointChannels(reviews) {
  const maxByChannel = {};
  reviews.forEach((r) => {
    const rating = Number(r.rating);
    if (!Number.isFinite(rating)) return;
    const key = String(r.channelId);
    maxByChannel[key] = Math.max(maxByChannel[key] || 0, rating);
  });
  return Object.fromEntries(Object.entries(maxByChannel).map(([k, max]) => [k, max > 5]));
}

function toStars(review, isTenPoint) {
  const rating = Number(review.rating);
  if (review.rating === null || review.rating === undefined || !Number.isFinite(rating) || rating <= 0) return null;
  return Math.round(isTenPoint[String(review.channelId)] ? rating / 2 : rating);
}

const reviewDate = (r) => r.submittedAt || r.departureDate || r.arrivalDate || "";

async function getListingTestimonials(listingId) {
  const all = await fetchAllReviews();
  const published = all.filter(isPublicGuestReview);
  const isTenPoint = tenPointChannels(published);
  const testimonials = published
    .filter((r) => String(r.listingMapId) === String(listingId))
    .sort((a, b) => reviewDate(b).localeCompare(reviewDate(a)))
    .map((r) => {
      const text = r.publicReview.trim();
      const month = (r.departureDate || reviewDate(r)).slice(0, 7);
      const context = [r.channelName, month].filter(Boolean).join(" · ");
      return {
        name: shortName(r.guestName || r.reviewerName) || "Verified guest",
        rating: toStars(r, isTenPoint),
        quote: { en: text, es: text },
        context: { en: context, es: context },
      };
    });
  /* Non-personal summary so the detected scale can be checked against
     live data: reviews read account-wide and each channel's scale. */
  const meta = {
    reviewsRead: all.length,
    ratingScaleByChannel: Object.fromEntries(Object.entries(isTenPoint).map(([k, ten]) => [k, ten ? 10 : 5])),
  };
  return { testimonials, meta };
}

module.exports = { getListingTestimonials, shortName };
