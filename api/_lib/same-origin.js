/* Form endpoints only take submissions from this site's own pages. Browsers
   send an Origin header on every cross-site POST, so a form on another website
   posting here is rejected; requests without Origin (curl, server-to-server)
   still go through the honeypot, validation and rate limit as before.
   Compares against the request's own host, so it works the same on the real
   domain, the villa domains, previews and `vercel dev`. */
function crossSite(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.host;
  } catch {
    return true;
  }
}

module.exports = { crossSite };
