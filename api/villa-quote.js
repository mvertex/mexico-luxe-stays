/* GET /api/villa-quote?listingId=<id>&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&guests=N
   Real price for a stay from Hostaway's "Calculate reservation price"
   (POST /v1/listings/{id}/calendar/priceDetails, version 2): base rate,
   cleaning, taxes and any other fees exactly as configured on the listing
   in Hostaway — the same figures the Booking Engine checkout charges.
   Read-only (it calculates, it doesn't hold or book anything), so it's a
   cacheable GET. Credentials stay server-side (see lib/hostaway.js). */

const { hostawayPost } = require("../lib/hostaway");

/* Same allowlist as villa-live-data.js — the four villas in villas-data.js. */
const KNOWN_LISTINGS = new Set(["145234", "305921", "144272", "456289"]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/* Hostaway components → the rows the price box shows. Anything flagged as
   not included in the total (e.g. a refundable damage deposit) is listed
   separately instead of being added. */
function toQuote(result, nights) {
  const flag = (v) => v === true || Number(v) === 1;
  const components = (result.components || []).filter((c) => !flag(c.isDeleted));
  const included = components.filter((c) => flag(c.isIncludedInTotalPrice));
  const sum = (list) => round2(list.reduce((acc, c) => acc + Number(c.total || 0), 0));

  /* Live responses don't always tag the base rate as type "price" (the
     docs' example does), so classify what's unambiguous — taxes, cleaning,
     other fees, discounts — and count everything else that's included in
     the total as accommodation (base rate, extra-guest charges…). */
  const isDiscount = (c) => c.type === "discount" || Number(c.total) < 0;
  const taxes = included.filter((c) => c.type === "tax");
  const cleaning = included.filter((c) => c.name === "cleaningFee");
  const otherFees = included.filter((c) => c.type === "fee" && c.name !== "cleaningFee" && !isDiscount(c));
  const discounts = included.filter((c) => c.type !== "tax" && isDiscount(c));
  const accommodationParts = included.filter((c) => !taxes.includes(c) && !cleaning.includes(c) && !otherFees.includes(c) && !discounts.includes(c));

  const total = round2(result.totalPrice);
  let accommodation = sum(accommodationParts);
  // The parts must add up to Hostaway's total; if they don't, the base
  // rate is whatever is left once cleaning, fees, taxes and discounts are out.
  const others = sum(taxes) + sum(cleaning) + sum(otherFees) - Math.abs(sum(discounts));
  if (Math.abs(accommodation + others - total) > 1) accommodation = round2(total - others);

  return {
    nights,
    total,
    accommodation,
    cleaning: cleaning.length ? sum(cleaning) : null,
    taxes: taxes.length ? sum(taxes) : null,
    fees: otherFees.map((c) => ({ title: c.title || c.name, amount: round2(c.total) })),
    discounts: discounts.map((c) => ({ title: c.title || c.name, amount: -Math.abs(round2(c.total)) })),
    notIncluded: components
      .filter((c) => !c.isIncludedInTotalPrice && Number(c.total) > 0)
      .map((c) => ({ title: c.title || c.name, amount: round2(c.total) })),
  };
}

module.exports = async (req, res) => {
  const listingId = String(req.query.listingId || "");
  const { checkin, checkout } = req.query;
  const guests = Number(req.query.guests);

  const nights = ISO_DATE_RE.test(checkin || "") && ISO_DATE_RE.test(checkout || "")
    ? Math.round((Date.parse(`${checkout}T00:00:00Z`) - Date.parse(`${checkin}T00:00:00Z`)) / DAY_MS)
    : NaN;
  if (!KNOWN_LISTINGS.has(listingId) || !(nights >= 1 && nights <= MAX_NIGHTS)
      || !Number.isInteger(guests) || guests < 1 || guests > 50
      || checkin < new Date().toISOString().slice(0, 10)) {
    res.status(400).json({ error: "Invalid quote request" });
    return;
  }

  try {
    const data = await hostawayPost(`/listings/${listingId}/calendar/priceDetails`, {
      startingDate: checkin,
      endingDate: checkout,
      numberOfGuests: guests,
      version: 2,
    });
    if (!data || !data.result || typeof data.result.totalPrice !== "number") throw new Error("Unexpected priceDetails response");

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.status(200).json(toQuote(data.result, nights));
  } catch (err) {
    console.error("[villa-quote]", listingId, checkin, checkout, guests, err.message, err.body || "");
    res.status(502).json({ error: "Quote unavailable right now" });
  }
};

module.exports.toQuote = toQuote;
