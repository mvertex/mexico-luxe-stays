/* Google Analytics 4 (one web stream for every domain this site is served on).
   Kept in its own file instead of an inline <script> so the Content-Security-Policy
   in vercel.json doesn't need 'unsafe-inline'. Google signals and ad
   personalization are off: measurement only, no advertising cookies — as the
   Privacy Notice (legal.privacy.cookies.body in i18n.js) says. */
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-5NV4701XEZ", {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});
