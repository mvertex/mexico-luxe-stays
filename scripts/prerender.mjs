/* Bakes the villa content that main.js paints at runtime into the static HTML,
   so crawlers that don't run JavaScript (AI crawlers, link previews, Google's
   first pass) still see the villa links, specs, amenities and FAQs.
   Called by build-es.mjs for every page, in English (written back to the
   source page) and in Spanish (es/). main.js replaces each container's content
   on load, so the baked markup only has to be readable, not interactive. */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

/* Swaps the inner HTML of the first element whose opening tag matches `openRe`,
   finding its closing tag by nesting depth (the baked content can contain the
   same tag, so a lazy regex isn't enough). Re-running replaces the old bake. */
function replaceInner(html, openRe, inner) {
  const m = openRe.exec(html);
  if (!m) return html;
  const tag = /^<([a-z0-9]+)/i.exec(m[0])[1];
  const start = m.index + m[0].length;
  const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  tagRe.lastIndex = start;
  let depth = 1;
  let t;
  while ((t = tagRe.exec(html))) {
    depth += t[1] ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + inner + html.slice(t.index);
  }
  throw new Error(`prerender: unclosed <${tag}> for ${openRe}`);
}

export function createPrerender(root, dicts) {
  const dataSrc = readFileSync(join(root, "assets/js/villas-data.js"), "utf8");

  /* villas-data.js reads the language and strings from window; give each
     language its own sandbox so mlsVillaShowcaseRow renders the same markup
     the browser does. */
  const sandboxFor = (lang) => {
    const dict = dicts[lang];
    const window = { mlsCurrentLang: () => lang, mlsT: (key) => dict[key] ?? key };
    return vm.runInNewContext(`${dataSrc}; ({ MLS_VILLAS, MLS_SERVICE_DEFS, mlsVillaShowcaseRow })`, { window });
  };
  const sandboxes = { en: sandboxFor("en"), es: sandboxFor("es") };

  return function prerender(html, lang) {
    const { MLS_VILLAS, MLS_SERVICE_DEFS, mlsVillaShowcaseRow } = sandboxes[lang];
    const t = (key) => dicts[lang][key] ?? dicts.en[key] ?? key;
    const pick = (item) => (lang === "es" && item.es) || item.en;

    /* Home: featured villa names (same markup as renderFeaturedShowcase). */
    html = replaceInner(html, /<ul class="featured-list" data-featured-list>/, MLS_VILLAS.filter((v) => v.featured)
      .map((v, i) => `\n          <li><a class="featured-item${i === 0 ? " is-active" : ""}" href="villas/${v.slug}.html" data-index="${i}"><span class="featured-item-label">${v.name}</span><span class="featured-item-line" aria-hidden="true"></span></a></li>`)
      .join("") + "\n        ");

    /* Our Villas and the destination pages: the showcase rows. */
    html = replaceInner(html, /<div class="villa-showcase" data-villa-grid>/,
      MLS_VILLAS.map((v, i) => mlsVillaShowcaseRow(v, i)).join("") + "\n        ");
    const dest = /data-destination-grid="([^"]+)"/.exec(html);
    if (dest) {
      html = replaceInner(html, /<div class="villa-showcase" data-destination-grid="[^"]+">/,
        MLS_VILLAS.filter((v) => v.destination === dest[1]).map((v, i) => mlsVillaShowcaseRow(v, i)).join("") + "\n        ");
    }

    /* Villa page: specs, services & amenities, first FAQs. */
    const slug = /<main id="main" data-villa-slug="([^"]+)"/.exec(html);
    const villa = slug && MLS_VILLAS.find((v) => v.slug === slug[1]);
    if (!villa) return html;

    const baths = villa.baths % 1 === 0 ? villa.baths : villa.baths.toFixed(1);
    const area = lang === "es"
      ? [villa.area, t("detail.specs.area")]
      : [Math.round(villa.area * 10.7639).toLocaleString("en-US"), t("detail.specs.sqft")];
    const spec = (num, label) => `<div class="spec"><div class="spec-text"><div class="spec-num">${num}</div>${label ? `<div class="spec-label">${label}</div>` : ""}</div></div>`;
    html = replaceInner(html, /<div class="specs-bar" data-villa-specs>/, [
      spec(villa.guests, t("detail.specs.guests")),
      spec(villa.bedrooms, t("detail.specs.bedrooms")),
      spec(villa.beds, t("detail.specs.beds")),
      spec(baths, t("detail.specs.bathrooms")),
      spec(...area),
      spec((lang === "es" && villa.destinationLabelEs) || villa.destinationLabel, "")
    ].join(""));

    const services = (villa.services || []).filter((id) => MLS_SERVICE_DEFS[id]);
    const serviceList = (included) => services.filter((id) => MLS_SERVICE_DEFS[id].included === included)
      .map((id) => `<li>${t("services." + id + ".title")}</li>`).join("");
    const amenities = [...(villa.amenities || []), ...(villa.amenitiesMore || [])];
    html = replaceInner(html, /<div class="sa-cards" data-sa-cards>/, `
          <div class="sa-static">
            <h3>${t("detail.services.included")}</h3><ul>${serviceList(true)}</ul>
            <h3>${t("detail.services.extra")}</h3><ul>${serviceList(false)}</ul>
            <h3>${t("detail.amenities.title")}</h3><ul>${amenities.map((a) => `<li>${pick(a)}</li>`).join("")}</ul>
          </div>
        `);

    const faqs = (villa.faqs || []).slice(0, 5);
    if (faqs.length) {
      html = replaceInner(html, /<ul class="villa-faq-list" data-faq-list>/, faqs
        .map((f, i) => `<li><button type="button" class="villa-faq-item${i === 0 ? " is-active" : ""}" data-faq-index="${i}"><span>${pick(f.q)}</span><span class="villa-faq-item-line" aria-hidden="true"></span></button></li>`)
        .join(""));
      const answer = pick(faqs[0].a).replace(/&/g, "&amp;").replace(/</g, "&lt;");
      html = replaceInner(html, /<p class="villa-faq-card-answer" data-faq-answer>/, answer);
    }
    return html;
  };
}
