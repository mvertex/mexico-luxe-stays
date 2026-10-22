/* Generates the Spanish site under /es/ so every page has its own indexable URL.
   Runs automatically on every commit (.githooks/pre-commit). By hand:

     npm run build:es

   For each English page it:
   - bakes the Spanish strings from i18n.js into every data-i18n* element,
   - swaps the <head> metadata for scripts/es-meta.mjs and translates JSON-LD,
   - writes the result to es/<same path>.
   It also adds hreflang links to both language versions, bakes the villa content
   into the static HTML of both (scripts/prerender.mjs) and rewrites sitemap.xml.
   Never edit files in es/ by hand: they are overwritten on every run. */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { parse } from "node-html-parser";
import { PAGES, LD_STRINGS } from "./es-meta.mjs";
import { createPrerender } from "./prerender.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.mexicoluxestays.com";
const OUT = join(ROOT, "es");

/* ---------- Dictionaries from i18n.js (only the data, not the browser engine) ---------- */
const i18nSrc = readFileSync(join(ROOT, "assets/js/i18n.js"), "utf8");
const dataSrc = i18nSrc.slice(0, i18nSrc.indexOf("/* ---------- Engine"));
const { en: EN, es: ES } = vm.runInNewContext(`${dataSrc}; MLS_I18N`);

const prerender = createPrerender(ROOT, { en: EN, es: ES });

const stripTags = (s) => s.replace(/<[^>]+>/g, "");
const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => escapeText(s).replace(/"/g, "&quot;");

/* English copy → Spanish copy, for JSON-LD strings that repeat page text (FAQ answers). */
const EN_TO_ES = new Map(Object.entries(LD_STRINGS));
for (const [key, value] of Object.entries(EN)) {
  if (ES[key] != null && !EN_TO_ES.has(stripTags(value))) EN_TO_ES.set(stripTags(value), stripTags(ES[key]));
}

/* ---------- URLs ---------- */
/* Villa pages whose own domain is live: that domain is their URL (served by
   middleware.js, which holds the same list). */
const VILLA_DOMAINS = {
  "villas/casa-corazon.html": "https://www.casacorazonpdc.com",
  "villas/kasa-kefi.html": "https://www.kasakefi.mx"
};
const enUrl = (page) => VILLA_DOMAINS[page] ? `${VILLA_DOMAINS[page]}/` : `${SITE}/${page === "index.html" ? "" : page}`;
const esUrl = (page) => VILLA_DOMAINS[page] ? `${VILLA_DOMAINS[page]}/es/` : `${SITE}/es/${page === "index.html" ? "" : page}`;

/* A site page URL in JSON-LD (not an asset) → its Spanish counterpart. */
function toEsUrl(url) {
  const villaPage = Object.keys(VILLA_DOMAINS).find((page) => url === enUrl(page));
  if (villaPage) return esUrl(villaPage);
  if (!url.startsWith(`${SITE}/`) || url.startsWith(`${SITE}/es/`)) return url;
  const path = url.slice(SITE.length + 1);
  return path === "" || path.endsWith(".html") ? `${SITE}/es/${path}` : url;
}

function hreflangBlock(page) {
  return [
    `<link rel="alternate" hreflang="en" href="${enUrl(page)}">`,
    `<link rel="alternate" hreflang="es" href="${esUrl(page)}">`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl(page)}">`
  ].map((l) => `  ${l}`).join("\n");
}

/* Replaces any previous hreflang links with a fresh set right after the canonical. */
function withHreflang(html, page) {
  html = html.replace(/^[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n/gm, "");
  return html.replace(/^([ \t]*<link rel="canonical" href="[^"]*">\n)/m, `$1${hreflangBlock(page)}\n`);
}

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(">)`);
  if (!re.test(html)) return html;
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

/* ---------- JSON-LD ---------- */
function translateLd(node, meta) {
  if (Array.isArray(node)) return node.map((n) => translateLd(n, meta));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "description" && node["@type"] === "LodgingBusiness" && meta.ldDesc) out[k] = meta.ldDesc;
      else if ((k === "url" || k === "item") && typeof v === "string") out[k] = toEsUrl(v);
      else out[k] = translateLd(v, meta);
    }
    return out;
  }
  if (typeof node === "string" && EN_TO_ES.has(node)) return EN_TO_ES.get(node);
  return node;
}

/* ---------- Page build ---------- */
const ATTRS = {
  "data-i18n-placeholder": "placeholder",
  "data-i18n-aria-label": "aria-label",
  "data-i18n-alt": "alt",
  "data-i18n-title": "title"
};

const missing = new Set();
const lookup = (key) => {
  if (ES[key] == null) { missing.add(key); return null; }
  return ES[key];
};

/* Same as fixLinks() in i18n.js: root-relative page links in i18n strings
   need "../" on pages one folder down (villas/). */
function fixLinks(html, page) {
  const up = "../".repeat(page.split("/").length - 1);
  return up ? html.replace(/href="(?![a-z]+:|\/|#|\.\.\/)/g, `href="${up}`) : html;
}

function buildEs(page, enHtml) {
  const meta = PAGES[page];
  if (!meta) throw new Error(`scripts/es-meta.mjs has no entry for ${page}`);

  const root = parse(enHtml, {
    comment: true,
    blockTextElements: { script: true, noscript: true, style: true, pre: true }
  });

  root.querySelector("html").setAttribute("lang", "es");

  for (const el of root.querySelectorAll("[data-i18n]")) {
    const v = lookup(el.getAttribute("data-i18n"));
    if (v != null) el.set_content(escapeText(v));
  }
  for (const el of root.querySelectorAll("[data-i18n-html]")) {
    const v = lookup(el.getAttribute("data-i18n-html"));
    if (v != null) el.set_content(fixLinks(v, page));
  }
  for (const [dataAttr, attr] of Object.entries(ATTRS)) {
    for (const el of root.querySelectorAll(`[${dataAttr}]`)) {
      const v = lookup(el.getAttribute(dataAttr));
      if (v != null) el.setAttribute(attr, v);
    }
  }
  for (const btn of root.querySelectorAll("[data-lang-option]")) {
    const active = btn.getAttribute("data-lang-option") === "es";
    btn.setAttribute("aria-pressed", String(active));
    btn.classList[active ? "add" : "remove"]("is-active");
  }
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    const indent = (script.innerHTML.match(/\n([ \t]*)\S/) || [, "  "])[1];
    const json = JSON.stringify(translateLd(JSON.parse(script.innerHTML), meta), null, 2);
    script.set_content(`\n${json.replace(/^/gm, indent)}\n${indent}`);
  }

  let html = root.toString();

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeText(meta.title)}</title>`);
  html = setMeta(html, "name", "description", meta.description);
  html = setMeta(html, "property", "og:title", meta.og);
  html = setMeta(html, "name", "twitter:title", meta.og);
  html = setMeta(html, "property", "og:description", meta.ogDesc);
  html = setMeta(html, "name", "twitter:description", meta.ogDesc);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${esUrl(page)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${esUrl(page)}$2`);
  html = html.replace(/(<meta property="og:locale" content=")[^"]*(">)/, "$1es_MX$2");
  html = withHreflang(html, page);

  /* Static asset paths become root-absolute so they don't depend on the /es/ depth.
     (Paths built at runtime by main.js / villas-data.js stay relative and are
     served through the /es/assets → /assets rewrite in vercel.json and serve.mjs.) */
  html = html.replace(/(["'\s,(])(?:\.\.\/)*assets\//g, "$1/assets/");

  return `<!-- GENERATED by scripts/build-es.mjs from /${page} — do not edit by hand. -->\n${html}`;
}

/* ---------- Pages ---------- */
const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith(".html") && f !== "404.html"),
  ...readdirSync(join(ROOT, "villas")).filter((f) => f.endsWith(".html")).map((f) => `villas/${f}`)
].sort();

rmSync(OUT, { recursive: true, force: true });

for (const page of pages) {
  const srcPath = join(ROOT, page);
  const enHtml = readFileSync(srcPath, "utf8");

  const enWithLinks = prerender(withHreflang(enHtml, page), "en");
  if (enWithLinks !== enHtml) writeFileSync(srcPath, enWithLinks);

  const outPath = join(OUT, page);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, prerender(buildEs(page, enWithLinks), "es"));
}

/* ---------- Sitemap: every English URL plus its Spanish twin, linked by hreflang ---------- */
const sitemapPath = join(ROOT, "sitemap.xml");
const entries = [...readFileSync(sitemapPath, "utf8").matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map(([, body]) => ({
    loc: body.match(/<loc>([^<]+)<\/loc>/)[1],
    changefreq: (body.match(/<changefreq>([^<]+)<\/changefreq>/) || [])[1],
    priority: (body.match(/<priority>([^<]+)<\/priority>/) || [])[1]
  }))
  .filter((e) => !e.loc.startsWith(`${SITE}/es/`) && !e.loc.endsWith("/es/"));

/* Villa photos live behind the JS gallery/lightbox, so crawlers rarely find them on the
   page — list every one under its villa URL (Google only reads image:loc nowadays). */
const VILLAS = vm.runInNewContext(`${readFileSync(join(ROOT, "assets/js/villas-data.js"), "utf8")}; MLS_VILLAS`);
const villaImages = new Map(VILLAS.map((v) => {
  const srcs = [
    v.image,
    ...(v.showcaseImages || []).map((im) => im.src),
    ...v.gallery.flatMap((g) => [...g.images, ...(g.roomImages || []).flat()].map((im) => im.src)),
    ...Object.values(v.serviceImages || {})
  ];
  return [`villas/${v.slug}.html`, [...new Set(srcs.filter(Boolean))]];
}));
const imagesXml = (page) => (villaImages.get(page) || [])
  .map((src) => `    <image:image><image:loc>${SITE}${encodeURI(src)}</image:loc></image:image>`);

const urlXml = (loc, e, page) => [
  "  <url>",
  `    <loc>${loc}</loc>`,
  `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl(page)}"/>`,
  `    <xhtml:link rel="alternate" hreflang="es" href="${esUrl(page)}"/>`,
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl(page)}"/>`,
  ...imagesXml(page),
  e.changefreq && `    <changefreq>${e.changefreq}</changefreq>`,
  e.priority && `    <priority>${e.priority}</priority>`,
  "  </url>"
].filter(Boolean).join("\n");

/* Pages marked noindex (privacy, terms) are dropped from the sitemap. Since the
   sitemap is also this list's source, a page that later loses its noindex has
   to be added back to sitemap.xml by hand (one <url><loc>…</loc></url>). */
const isNoindex = (page) => pages.includes(page) && /<meta name="robots" content="noindex/.test(readFileSync(join(ROOT, page), "utf8"));

const blocks = [];
for (const e of entries) {
  const villaPage = Object.keys(VILLA_DOMAINS).find((page) => e.loc === enUrl(page));
  const page = villaPage || (e.loc === `${SITE}/` ? "index.html" : e.loc.slice(SITE.length + 1));
  if (isNoindex(page)) continue;
  blocks.push(urlXml(enUrl(page), e, page));
  if (pages.includes(page)) blocks.push(urlXml(esUrl(page), e, page));
}
writeFileSync(sitemapPath, [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...blocks,
  "</urlset>",
  ""
].join("\n"));

console.log(`Built ${pages.length} Spanish pages in es/ and updated sitemap.xml.`);
if (missing.size) console.warn(`Missing Spanish keys in i18n.js (left in English): ${[...missing].join(", ")}`);
