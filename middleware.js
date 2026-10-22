/* Villa domains (casacorazonpdc.com, kasakefi.mx, villaaqua.com) open
   straight on their villa page while the address bar keeps the villa's own
   domain. Runs before static files, so "/" is served the villa page instead
   of index.html. Every other path (assets, other pages, /api) is untouched. */

const VILLA_HOSTS = [
  [/^(www\.)?casacorazonpdc\.com$/, "casa-corazon.html"],
  [/^(www\.)?kasakefi\.mx$/, "kasa-kefi.html"],
  [/^(www\.)?villaaqua\.com(\.mx)?$/, "villa-aqua.html"],
];

export const config = { matcher: ["/", "/es", "/es/"] };

export default function middleware(request) {
  const url = new URL(request.url);
  const villa = VILLA_HOSTS.find(([host]) => host.test(url.hostname));
  if (!villa) return;

  const es = url.pathname.startsWith("/es");
  url.pathname = (es ? "/es/villas/" : "/villas/") + villa[1];
  return new Response(null, { headers: { "x-middleware-rewrite": url.toString() } });
}
