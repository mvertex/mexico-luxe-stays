/* Per-IP request limits for the /api functions. In-memory, so each warm
   serverless instance counts on its own: enough to stop a double-click, a
   naive bot loop or a scraper hammering one endpoint (which would spend the
   Hostaway API quota the whole site depends on). A bot spread across many
   instances gets through; for that, add a rate-limit rule in the Vercel
   Firewall (dashboard) on the same paths. */

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

/* Returns limited(ip): true once that IP has made more than `max` requests
   in the last `windowMs`. */
function createRateLimiter({ windowMs, max }) {
  const hitsByIp = new Map();
  let lastSweep = Date.now();
  return function limited(ip) {
    const now = Date.now();
    // Forget IPs that have gone quiet, so the map doesn't grow forever.
    if (now - lastSweep > windowMs) {
      for (const [key, hits] of hitsByIp) if (now - hits[hits.length - 1] >= windowMs) hitsByIp.delete(key);
      lastSweep = now;
    }
    const hits = (hitsByIp.get(ip) || []).filter((t) => now - t < windowMs);
    hits.push(now);
    hitsByIp.set(ip, hits);
    return hits.length > max;
  };
}

module.exports = { clientIp, createRateLimiter };
