/* Villa domains (casacorazonpdc.com, kasakefi.mx, villaaqua.com) are the home
   of their villa page:
   - on the villa domain, "/" (and "/es/") serve the villa page while the
     address bar keeps the villa's domain; any other page of the site
     (Home, Our Villas, FAQ…) goes back to the main site;
   - on the main site, the villa page sends the visitor to the villa domain.
   Runs before static files, so "/" gets the villa page instead of index.html.
   Assets, /api and other files are never touched.
   Same domain list as VILLA_DOMAINS in scripts/build-es.mjs (canonical URLs). */

/* `live`: the domain already points at this Vercel project. Only live domains
   receive visitors from the main site. */
const VILLAS = [
  { page: "casa-corazon", host: "www.casacorazonpdc.com", match: /^(www\.)?casacorazonpdc\.com$/, live: true },
  { page: "kasa-kefi", host: "www.kasakefi.mx", match: /^(www\.)?kasakefi\.mx$/, live: true },
  { page: "villa-aqua", host: "www.villaaqua.com", match: /^(www\.)?villaaqua\.com(\.mx)?$/, live: true },
];

/* Main site. */
const MAIN_HOST = "www.mexicoluxestays.com";
const MAIN_HOSTS = [MAIN_HOST, "mexicoluxestays.com"];

export const config = { matcher: ["/((?!api/|assets/|es/assets/).*)"] };

const isPage = (path) => path.endsWith("/") || path.endsWith(".html") || !path.split("/").pop().includes(".");

const redirect = (url) => new Response(null, { status: 308, headers: { Location: url } });

export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!isPage(path)) return;

  const es = /^\/es(\/|$)/.test(path);
  const enPath = es ? path.slice(3) || "/" : path;
  const villaAt = (v) => enPath === `/villas/${v.page}.html` || enPath === `/villas/${v.page}`;

  const villa = VILLAS.find((v) => v.match.test(url.hostname));
  if (villa) {
    if (enPath === "/") {
      url.pathname = (es ? "/es/villas/" : "/villas/") + villa.page + ".html";
      return new Response(null, { headers: { "x-middleware-rewrite": url.toString() } });
    }
    if (villaAt(villa)) return redirect(`https://${url.host}${es ? "/es/" : "/"}${url.search}`);
    return redirect(`https://${MAIN_HOST}${path}${url.search}`);
  }

  if (MAIN_HOSTS.includes(url.hostname)) {
    const target = VILLAS.find((v) => v.live && villaAt(v));
    if (target) return redirect(`https://${target.host}${es ? "/es/" : "/"}${url.search}`);
  }
}
