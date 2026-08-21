/* ==========================================================================
   MEXICO LUXE STAYS — Hostaway live-data sync

   Runs on every page, after villas-data.js and before main.js. For each
   villa with a hostawayListingId set, fetches live availability, pricing
   and testimonials from /api/villa-live-data (the Vercel serverless proxy
   in /api — see lib/hostaway.js) and overwrites that villa's placeholder
   fields in MLS_VILLAS in place.

   Static placeholder data is what's shown on first render (main.js runs
   right after this script), so a slow or unconfigured Hostaway connection
   never blocks or breaks the page — it just means the placeholder data
   keeps showing. Once fetches settle, an "mls:livedata" event asks main.js
   to re-render with whatever came back.
   ========================================================================== */

(function () {
  if (typeof MLS_VILLAS === "undefined") return;

  const FETCH_TIMEOUT_MS = 8000;

  const fetchLiveData = async (villa) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`/api/villa-live-data?listingId=${encodeURIComponent(villa.hostawayListingId)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();

      if (data.availability && data.availability.blockedRanges) villa.availability = data.availability;
      if (typeof data.priceFromPerNight === "number") villa.priceFromPerNight = data.priceFromPerNight;
      if (Array.isArray(data.testimonials) && data.testimonials.length) villa.testimonials = data.testimonials;
    } catch (err) {
      console.warn(`[hostaway-sync] Falling back to static data for "${villa.slug}":`, err.message || err);
    } finally {
      clearTimeout(timeout);
    }
  };

  const villasToSync = MLS_VILLAS.filter((v) => v.hostawayListingId);
  if (!villasToSync.length) return;

  Promise.allSettled(villasToSync.map(fetchLiveData)).then(() => {
    document.dispatchEvent(new CustomEvent("mls:livedata"));
  });
})();
