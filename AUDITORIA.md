# Auditoría previa a la entrega — Mexico Luxe Stays

- **Negocio:** renta de villas de lujo (Playa del Carmen y Valle de Guadalupe), México. Público en inglés y español.
- **Staging auditado:** https://mexico-luxe-stays.vercel.app (coincide byte a byte con `main` @ `cdd5472`).
- **Producción:** `www.mexicoluxestays.com` **todavía sirve el sitio viejo (Hostinger)**. Esta auditoría trata el cambio de dominio como parte de la entrega.
- **Stack:** HTML estático, sin build (salvo `npm run build:es`, que genera `/es/` y `sitemap.xml` en el pre-commit), CSS y JS sin framework, funciones serverless de Vercel en `api/` (Hostaway + Resend).
- **Fecha:** 2026-10-16.

## Qué se ejecutó

| Herramienta | Resultado |
|---|---|
| `npm audit` | 0 vulnerabilidades |
| `npm outdated` | `libphonenumber-js` 1.13.14 → 1.13.15 (parche); `node-html-parser` 6.1.13 → 9.0.4 (solo dev) |
| `node --check` sobre todo el JS | Sin errores de sintaxis |
| `html-validate` (13 páginas EN) | Sin errores estructurales graves (ver hallazgos Bajos) |
| Script propio de SEO (28 páginas EN + ES) | title, description, H1, alt, canonical, hreflang, OG, JSON-LD |
| Verificación de enlaces locales (`href`, `src`, `srcset`, `url()`) | 0 rotos |
| Lighthouse 12 (4 páginas × móvil/escritorio, contra staging) | Rendimiento 89–100, Accesibilidad 96–100, Buenas prácticas 96–100, SEO 100 |
| Chrome headless (18 URLs × 360/768/1366 px) | 0 páginas con scroll horizontal, 0 errores de consola, 0 peticiones fallidas |
| Sondeo de rutas sensibles en staging (`.git`, `.env`, `.md`, `package.json`, `api/_lib`, scripts) | Todas 404 (el allowlist de `.vercelignore` funciona) |
| Búsqueda de secretos en todo el historial de git (202 commits) | Nada encontrado |
| Cabeceras HTTP de staging y del sitio viejo | Ver hallazgos de seguridad |

### Lighthouse (staging)

| Página | Móvil (Perf / LCP / CLS) | Escritorio (Perf / LCP) |
|---|---|---|
| `/` | 89 / **3.7 s** / 0.05 | 96 / 1.4 s |
| `/villas/villa-aqua.html` | 95 / 2.9 s / 0.006 | 99 / 1.0 s |
| `/contact.html` | 97 / 2.3 s / 0 | 100 / 0.5 s |
| `/es/villas.html` | 97 / 2.6 s / 0.006 | 100 / 0.7 s |

TBT ≈ 0 ms en todas, así que el INP no debería ser problema. Con datos de laboratorio no se puede confirmar el INP real.

---

## 1. Resumen ejecutivo

| Categoría | Nota | Comentario |
|---|---|---|
| Código y estructura | **8/10** | Código limpio y bien comentado, sin `console.log` olvidados ni TODOs. Hay algunos archivos muertos y HTML con detalles menores. |
| Seguridad | **7/10** | No hay secretos expuestos. La validación en servidor, el honeypot y el escape contra XSS son correctos. Faltan casi todas las cabeceras de seguridad y el límite de envíos es por instancia. |
| SEO | **6/10** | El on-page es muy bueno (títulos únicos, un H1, hreflang, schema). Pero no hay ninguna redirección desde las ~100 URLs del sitio viejo, falta `og:url` y el contenido de las villas lo pinta JavaScript. |
| Rendimiento | **8/10** | Imágenes WebP con `srcset`, fuentes locales y Brotli. El LCP móvil de la home es de 3.7 s y la regla de caché de assets no aplica en inglés. |
| Responsive y accesibilidad | **9/10** | Accesibilidad 100 en Lighthouse, sin overflow, con skip-link, `aria-label` y `prefers-reduced-motion`. Algunos campos quitan el foco visible y los puntos del carrusel son muy pequeños. |
| Funcionalidad | **8/10** | La 404 está personalizada, los enlaces `tel:`, `mailto:` y WhatsApp son coherentes, sin lorem ipsum ni `href="#"`. No se probaron envíos reales (crearían reservas o correos de verdad). |
| Legal y analítica | **4/10** | El Aviso de Privacidad describe un flujo de datos que ya no existe y omite transferencias a terceros. No hay analítica ni Search Console. |

### ¿Está lista para entregar?

**Staging está en muy buen estado, pero no está lista para apuntar el dominio.** Antes del cambio de DNS hacen falta:

1. Las redirecciones 301 del sitio viejo (C-1).
2. Corregir el Aviso de Privacidad (C-2).
3. Las cabeceras de seguridad (A-1).
4. Search Console y la analítica (A-2).

Lo demás puede ir en una segunda iteración.

---

## 2. Hallazgos

Las rutas son relativas a `mexico-luxe-stays/`. Cuando el mismo problema aparece en la versión `es/`, se indica una sola vez: las páginas `es/` se regeneran con `npm run build:es`, así que se corrige en la página EN o en `assets/js/i18n.js` / `scripts/es-meta.mjs`.

### Crítico

| # | Prioridad | Categoría | Problema | Ubicación | Solución |
|---|---|---|---|---|---|
| C-1 | **Crítico** | SEO | **No hay ninguna redirección desde las URLs del sitio viejo.** El sitemap actual de `www.mexicoluxestays.com` tiene ~100 URLs indexadas (`/about-us`, `/contact-us`, `/reserve`, `/properties`, `/properties/location/playa-del-carmen`, `/terms-and-conditions`, `/privacy-policy`, `/blogs`, `/blog/...`, `/attractions/...`, `/galleries`, `/service`, `/special-offer(s)`, `/properties/detail/...`). El sitio nuevo usa `.html` y no tiene `cleanUrls`: comprobado, `/about` y `/contact-us` dan 404 en staging. Al cambiar el DNS, todo ese tráfico y posicionamiento caerá en 404. | `vercel.json` (bloque `redirects`, líneas 33–54, que hoy solo cubre `casa-corazon-luxe`) | Añadir redirecciones 301 en `vercel.json`: `/about-us`→`/about.html`, `/contact-us`→`/contact-us.html`, `/reserve`→`/contact.html`, `/properties`, `/property-list-new`, `/galleries`, `/special-offer` y `/special-offers`→`/villas.html`, `/properties/location/playa-del-carmen` y `/attractions/location/playa-del-carmen`→`/playa-del-carmen.html` (lo mismo para Valle), `/terms-and-conditions`→`/terms.html`, `/privacy-policy`→`/privacy.html`, `/service`→`/about.html`, `/blogs`, `/blog/:slug*` y `/attractions/:path*`→la página de destino o `/`, `/properties/detail/:slug*`→`/villas.html`. Antes, exportar de Search Console las URLs con clics del sitio viejo para no dejar ninguna fuera. |
| C-2 | **Crítico** | Legal | **El Aviso de Privacidad afirma algo falso sobre el tratamiento de datos.** Dice que el planeador «no guarda estos datos en un servidor; al enviarlo se abre un mensaje de WhatsApp». En realidad, `contact.html` y las páginas de villa envían nombre, email, teléfono, fechas y notas a **Hostaway** (`api/booking-request.js`), `contact-us.html` los envía por correo vía **Resend** (`api/contact-message.js`) y el pago lo procesa el Booking Engine de Hostaway con **Stripe**. Además, la sección «Con quién los compartimos» no menciona estos encargados ni la transferencia internacional (EE. UU.), y no separa finalidades primarias y secundarias («Mejorar nuestro servicio…») ni da un mecanismo para negarse a las secundarias, como pide la LFPDPPP. | `privacy.html:78` y `privacy.html:87-89`; textos en `assets/js/i18n.js:393`, `:395`, `:397` (EN) y `:921`, `:923`, `:925` (ES) | Reescribir con la dueña o su abogado: (1) describir el flujo real (formulario → Hostaway / Resend; pago → Hostaway/Stripe; alojamiento → Vercel; mapas → OpenStreetMap/unpkg); (2) listar encargados y transferencias internacionales; (3) separar finalidades primarias y secundarias, con un medio para oponerse (p. ej. un correo); (4) indicar el plazo de conservación y el medio para comunicar cambios al aviso. Revisarlo contra la LFPDPPP vigente (reforma publicada en el DOF el 20-mar-2025). |

### Alto

| # | Prioridad | Categoría | Problema | Ubicación | Solución |
|---|---|---|---|---|---|
| A-1 | **Alto** | Seguridad | **Faltan cabeceras de seguridad.** Staging solo envía HSTS (lo pone Vercel). No hay `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy`. Sin `frame-ancestors`, otra web puede incrustar el formulario de reserva en un iframe (clickjacking). | `vercel.json` (no hay regla `source: "/(.*)"`) | Añadir en `vercel.json` una regla `{"source": "/(.*)", "headers": [...]}` con: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, y una CSP: `default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`. `'unsafe-inline'` en estilos es necesario por los `style=""` y por Leaflet. Si se añade analítica, ampliar `script-src`/`connect-src`. Probar primero con `Content-Security-Policy-Report-Only`. |
| A-2 | **Alto** | Analítica | **No hay ninguna analítica, ni verificación de Search Console.** No hay GA4, GTM, Meta Pixel ni meta `google-site-verification`. Sin esto no se podrá medir el lanzamiento ni ver los 404 del cambio de dominio. | Todas las páginas (`<head>`) | Verificar el dominio en Search Console por DNS (registro TXT; ya existe un `google-site-verification` del correo, conviene confirmarlo) y enviar `sitemap.xml`. Elegir analítica: GA4/GTM (requiere actualizar el Aviso de Privacidad y probablemente un banner, ver M-12) o una opción sin cookies (Vercel Web Analytics, Plausible), que no necesita banner. |
| A-3 | **Alto** | Rendimiento | **La regla de caché de `vercel.json` no aplica a las URLs en inglés.** `"/(es/)?assets/img/(.*)"` solo coincide con `/es/assets/...`. Comprobado en staging: `/assets/img/hero-villas.webp` y `/assets/fonts/montserrat-latin.woff2` devuelven `max-age=0, must-revalidate`, y `/es/assets/img/hero-villas.webp` devuelve `max-age=604800`. El sitio en inglés revalida cada imagen y cada fuente en cada visita. | `vercel.json:4`, `:13`, `:22` | Separar en dos reglas por tipo (`/assets/img/(.*)` y `/es/assets/img/(.*)`), o usar `"/:lang(es)?/assets/img/:path*"`. Añadir también `/assets/(css|js)/(.*)` con `max-age=31536000, immutable`, porque ya llevan `?v=` para invalidar. |

### Medio

| # | Prioridad | Categoría | Problema | Ubicación | Solución |
|---|---|---|---|---|---|
| M-1 | Medio | SEO | Ninguna página tiene `og:url`, y `og:image` es WebP en casi todas (o un JPG de 1752×897 en la home). Algunas apps de mensajería y redes no muestran WebP en la vista previa, y falta `og:image:width/height`. | `<head>` de las 26 páginas (p. ej. `index.html:12-19`) | Añadir `<meta property="og:url">` igual al canonical (puede hacerlo `scripts/build-es.mjs` para ES). Usar un JPG de 1200×630 por página como `og:image`, con `og:image:width`, `og:image:height` y `og:locale` (`en_US` / `es_MX`). |
| M-2 | Medio | SEO | **El contenido principal de las villas lo genera JavaScript.** El HTML de `villas/villa-aqua.html` solo tiene ~250 palabras en `<main>`: descripción, especificaciones, galería y amenidades llegan desde `assets/js/villas-data.js`. La home tiene ~135 palabras y no enlaza a ninguna villa en el HTML (las villas destacadas se pintan con JS). Google renderiza JS, pero tarda más, y los crawlers de IA (el sitio publica `llms.txt`) y las vistas previas sociales no lo hacen. | `villas/*.html` (`data-villa-gallery`, `data-villa-specs` en las líneas 112-124), `index.html:218` | Ampliar `scripts/build-es.mjs` (o crear un script hermano) para escribir en el HTML estático la descripción, las especificaciones y las primeras fotos de cada villa desde `villas-data.js`, en EN y ES. Como mínimo, poner en la home enlaces `<a href="villas/...">` estáticos a las 4 villas. |
| M-3 | Medio | Rendimiento | **LCP móvil de la home: 3.7 s** (objetivo < 2.5 s). El elemento LCP es el logotipo del H1 y el 78 % del tiempo es *render delay*: el hero empieza con `opacity:0` hasta que `main.js` (187 KB, `defer`) añade `.is-ready`. | `assets/css/styles.css:417`; `assets/js/main.js:504` | Mostrar el H1 sin esperar a JS: excluir `[data-hero-reveal="2"]` del estado inicial `opacity:0`, o hacer la animación solo con CSS (`@keyframes` con `animation-delay`), sin depender de la clase. |
| M-4 | Medio | Rendimiento | `sizes` sobredimensionado en escritorio: `sizes="(max-width: 780px) 100vw, 1400px"` en imágenes que se muestran mucho más pequeñas. Lighthouse estima ~870 KB de sobra en la home y ~950 KB en `/es/villas.html`. | `index.html:159`, `:167`, `:183`, `:229`; tarjetas de `villas.html`; `villas-data.js:46` | Ajustar `sizes` al ancho real del layout (p. ej. `(max-width: 780px) 100vw, 50vw` en tarjetas de dos columnas) y añadir una variante de 1200w donde falte. |
| M-5 | Medio | Seguridad | **`/api/villa-quote` no tiene ningún límite de peticiones** y cada combinación nueva de fechas es un fallo de caché que hace un POST a Hostaway. Un bot puede agotar la cuota de API de Hostaway y dejar sin precios ni reservas a los clientes reales. El límite de `booking-request` y `contact-message` es por instancia y en memoria, como ya anota `PENDIENTES-HOSTAWAY.md`. | `api/villa-quote.js:60`; `api/booking-request.js:46`; `api/contact-message.js:18` | Activar en el Firewall de Vercel una regla de rate limit sobre `/api/*` (p. ej. 30 peticiones/min por IP en `villa-quote` y 5/10 min en los formularios). No requiere código. Alternativa: un contador en Upstash Redis. |
| M-6 | Medio | Accesibilidad | **Foco invisible** en el buscador del hero y en los filtros de villas: `outline: none` sin sustituto. Al enfocar, la etiqueta incluso se oculta. Un usuario de teclado no sabe dónde está. | `assets/css/styles.css:462`, `:469`, `:1255`, `:1261` | Añadir `.hero-search-field:focus-within { box-shadow: 0 0 0 2px var(--cream); }` y algo equivalente en `.filter-field:focus-within`. Dejar el `outline` en `:focus-visible`. |
| M-7 | Medio | SEO | **Staging es indexable** y sus canonicals apuntan a `www.mexicoluxestays.com/*.html`, que hoy dan 404 en el sitio viejo (comprobado con `/villas.html`). Si Google rastrea `*.vercel.app` antes del cambio, recibe señales contradictorias. | Despliegue de Vercel (no hay `X-Robots-Tag`) | Hasta el cambio de DNS, añadir en `vercel.json` `X-Robots-Tag: noindex` condicionado al host (`"has": [{"type": "host", "value": "mexico-luxe-stays.vercel.app"}]`). Después del cambio, redirigir `*.vercel.app` → `www`. |
| M-8 | Medio | Funcionalidad | El checkout de reserva vive en `reservas-mls.holidayfuture.com` (dominio de un tercero). El huésped sale del sitio hacia un dominio desconocido para pagar, lo que resta confianza. Ya está documentado como pendiente. | `assets/js/villas-data.js:57` | Completar el CNAME `reservas.mexicoluxestays.com` (requiere acceso a Cloudflare o mover los NS, ver `PENDIENTES-HOSTAWAY.md`) y cambiar la constante. |
| M-9 | Medio | SEO | Schema mejorable. `Organization` en la home no lleva dirección ni razón social (que sí están en el aviso legal). Los `LodgingBusiness` de las villas no tienen `priceRange`, `checkinTime`/`checkoutTime`, `petsAllowed` ni `aggregateRating`, aunque las reseñas de Hostaway se muestran en la página. | `index.html:24-39`; `villas/*.html:20-56` | `Organization` → añadir `legalName: "FLASH WORKS CUN"` y `address`. Villas → añadir `priceRange`, horarios confirmados y `aggregateRating` solo si se renderiza en el HTML estático (ver M-2). Validar en Rich Results Test. |
| M-10 | Medio | Rendimiento | Los JS y CSS se sirven sin minificar: `main.js` 187 KB, `villas-data.js` 175 KB, `i18n.js` 102 KB y `styles.css` 140 KB (≈ 50 KB con Brotli en el caso de `main.js`). Además, todas las páginas cargan los diccionarios EN y ES y los datos de las 4 villas. | `assets/js/*.js`, `assets/css/styles.css` | Prioridad baja frente a lo anterior. Añadir un paso de minificado (esbuild) en el build de Vercel, o dividir `i18n.js` por idioma, ya que las páginas `es/` ya están pretraducidas. |
| M-11 | Medio | Legal | **Términos:** varias cláusulas siguen «por confirmar» o sin fuente (depósito de Kasa Kefi «(por confirmar)», plan de pago de Casa Corazón y Casa de las Estrellas, horarios de check-in, contrato firmado). Además, el checkout de Hostaway muestra para Villa Aqua otra política de cancelación distinta a la de la web. | `terms.html` (secciones de pago, cancelación y depósito); `PENDIENTES-HOSTAWAY.md` | Cerrar con la dueña la lista de preguntas de `PENDIENTES-HOSTAWAY.md` antes de entregar. Una discrepancia entre la web y el checkout en la política de cancelación es motivo de queja ante PROFECO. |
| M-12 | Medio | Legal | No hay banner de cookies. **Hoy no hace falta**: el sitio no usa cookies y solo guarda el idioma en `localStorage`, como dice el aviso. Pasará a ser necesario si se instala GA4, GTM o Meta Pixel (A-2). | — | Si se elige analítica con cookies, añadir un aviso de consentimiento y actualizar la sección de cookies del Aviso de Privacidad. |

### Bajo

| # | Prioridad | Categoría | Problema | Ubicación | Solución |
|---|---|---|---|---|---|
| B-1 | Bajo | SEO | `sitemap.xml` incluye `privacy.html` y `terms.html` (EN y ES), que tienen `noindex`: es una señal contradictoria. | `sitemap.xml:196-223`; se genera en `scripts/build-es.mjs` | Excluir las páginas `noindex` del sitemap en el generador. |
| B-2 | Bajo | SEO | Títulos de más de 60 caracteres: home (74), `es/` (75), `about.html` (62), `es/about.html` (69), `es/villas.html` (65), `es/villas/villa-aqua.html` (68), `es/villas/casa-de-las-estrellas.html` (63). Descripciones ES de más de 160: `es/contact-us` (167), `es/contact` (176), `es/villas/casa-corazon` (169), `es/villas/villa-aqua` (181). | `<title>` / `meta description`; ES en `scripts/es-meta.mjs` | Recortar. Ejemplo para la home: «Luxury Villas in Playa del Carmen & Valle de Guadalupe \| MLS». |
| B-3 | Bajo | SEO | No hay `apple-touch-icon`, `favicon.ico` ni `site.webmanifest`. El favicon es un PNG de 1024×1024 (33 KB). | `index.html:20` y equivalentes | Generar `favicon.ico` (32 px), `apple-touch-icon.png` (180 px) e icono de 192/512 px. Añadir los `<link>` y permitir `/favicon.ico` en `.vercelignore`. |
| B-4 | Bajo | SEO / UX | URLs con `.html` (`/villas/villa-aqua.html`). Las del sitio viejo eran limpias. | Global | Opcional: `"cleanUrls": true` en `vercel.json` y actualizar canonical, hreflang, sitemap y enlaces internos en el generador. Si se hace, combinarlo con C-1 para no encadenar redirecciones. |
| B-5 | Bajo | Accesibilidad | Los puntos del carrusel miden 7×7 px. Lighthouse marca `target-size` en `/es/villas.html` (mínimo WCAG 2.2: 24×24). | `assets/css/styles.css:761-763` | Mantener el punto visual de 7 px pero darle al `<button>` un área de 24×24 (padding + `background-clip: content-box`). |
| B-6 | Bajo | Código | El logotipo del H1 se deforma en móvil (se muestra a 305×36, una relación de 8.47 frente a 9.64 del archivo). Lighthouse lo marca como `image-aspect-ratio`. | `assets/css/styles.css:216` | Añadir `max-width: 100%; object-fit: contain;`, o fijar el ancho en vez del alto. |
| B-7 | Bajo | Código | HTML inválido: `<img src="">` en plantillas que rellena JS y `<h3>` vacíos en el modal de FAQ. | `index.html:218`; `contact.html:64`, `:75`; `villas/*.html:381` (h3) y `:500` (img) | Quitar el atributo `src` hasta que JS lo asigne (o usar `hidden`) y poner un texto por defecto en el `<h3>`. |
| B-8 | Bajo | Código | 24 `<button>` sin `type` (p. ej. `.nav-toggle`), `&` sin escapar y 16 `style=""` inline. | `about.html:35` y equivalentes; `privacy.html:165`; `terms.html:179` | Añadir `type="button"`, `&amp;` y mover los estilos a la hoja. |
| B-9 | Bajo | Código | Archivos muertos o confusos en el repo: `CLAUDE (1).md` (plantilla ajena con rutas de Windows de otro usuario y reglas de Tailwind CDN que no aplican), `.codex/hooks.json` (apunta a `.agents/`, que no existe) y `skills-lock.json`. Hay ~8 imágenes sin referencia (`villas/bg-playa-2/3`, `bg-playa-palms2`, `bg-playa-rays`, `bg-desierto-2`, `kasa-kefi-rooms-84`, `hero-services.webp`, `intro-valle-terrace.jpg`). | Raíz del repo; `assets/img/` | Borrar o renombrar a `CLAUDE.md` con contenido real del proyecto. Confirmar y eliminar las imágenes. No se despliegan, gracias a `.vercelignore` / allowlist. |
| B-10 | Bajo | Rendimiento | Las páginas `es/` piden los assets como `/es/assets/...` (reescrito a `/assets/...`), así que un visitante que cambia de idioma vuelve a descargar las mismas imágenes y fuentes con otra URL. | `vercel.json:58-61`; rutas relativas en `es/*.html` | En el generador ES, reescribir las rutas a `/assets/...` absolutas (o `../assets/`). |
| B-11 | Bajo | Rendimiento | La imagen LCP de la home en escritorio es el JPG de 1752 px (265 KB) porque es el candidato más grande del `srcset`. Ya existe la versión WebP para los demás tamaños. | `index.html:75` | Generar `hero-casa-corazon.webp` a 1752 px y usarla en `src` y `srcset` (mantener el JPG solo para `og:image`). |
| B-12 | Bajo | Seguridad | Las APIs no comprueban `Origin`: cualquier web puede hacer POST a `/api/booking-request`. El honeypot y la validación mitigan el abuso, pero no lo impiden. | `api/booking-request.js:187`; `api/contact-message.js:53` | Rechazar con 403 si `Origin` existe y no es `https://www.mexicoluxestays.com` (ni el dominio de staging). |
| B-13 | Bajo | Dependencias | `libphonenumber-js` tiene un parche pendiente; `node-html-parser` (solo dev, generador ES) va 3 versiones mayores atrás. | `package.json` | `npm i libphonenumber-js@latest`; actualizar `node-html-parser` probando `npm run build:es` y comparando el diff de `es/`. |

### Lo que está bien (no requiere acción)

- No hay claves en el código, el bundle ni el historial de git. Las credenciales de Hostaway y Resend van en variables de entorno de Vercel. `.env*` está en `.gitignore`.
- `.vercelignore` funciona como allowlist: notas internas, scripts, `package.json` y `api/_lib` no son públicos (verificado con 404 en staging).
- Formularios: validación completa en servidor, honeypot, deduplicación, validación de teléfono con libphonenumber, escape HTML en los correos y en las reseñas renderizadas con `innerHTML`.
- Todos los `target="_blank"` llevan `rel="noopener"`. `window.open` usa `"noopener"`. Leaflet se carga con SRI (`integrity`).
- Un H1 por página, títulos y descripciones únicos, `alt` en todas las imágenes de contenido, `lang` correcto, hreflang EN/ES/x-default recíproco, canonical en todas, `robots.txt` con sitemap, 404 con `noindex`, `FAQPage` + `BreadcrumbList` + `LodgingBusiness`.
- Imágenes WebP con `srcset`, `width`/`height` y `loading="lazy"`; fuentes woff2 locales con `preload`; Brotli activo; CLS ≈ 0.
- HTML semántico (`header`, `nav`, `main`, `footer` en todas), skip-link, `prefers-reduced-motion` y 32 reglas `:focus-visible`.

---

## 3. Para revisar manualmente (no se pudo verificar)

1. **Envío real de los formularios.** No se enviaron para no crear reservas en Hostaway ni correos reales. Probar:
   - `contact.html` en modo «Consulta», y comprobar que llega a Hostaway con `source = Website`.
   - `contact-us.html`, y comprobar que el correo llega a `info@mexicoluxestays.com`. Esto depende de que `RESEND_API_KEY` y `RESEND_FROM_EMAIL` estén configuradas en Vercel **Production**. Si no lo están, el formulario devuelve 503.
   - Revisar también que el correo no caiga en spam (SPF/DKIM del dominio de Resend).
2. **Pago de prueba completo** en el Booking Engine (pendiente según `PENDIENTES-HOSTAWAY.md`).
3. **Números de contacto.**
   - `wa.me/5219848079475` (con el prefijo antiguo «1»): abrirlo en un móvil y confirmar que abre el chat correcto.
   - Confirmar con la dueña que el número de EE. UU. **+1 541 514 9312** (~75 enlaces `tel:` y `sms:`, p. ej. `contact-us.html:125`) es correcto y está atendido.
4. **Perfiles sociales** del schema (`instagram.com/mexicoluxestays`, `facebook.com/mexicoluxestays`): confirmar que existen y son de la marca.
5. **Listado de URLs del sitio viejo con tráfico real** (Search Console o Analytics de Hostinger), para completar C-1. Y despublicar el sitio «MLS» de Hostaway que reclama el dominio `www`.
6. **Acceso a Cloudflare / DNS** del dominio, que es requisito para el cambio de dominio, el subdominio de reservas y la verificación de Search Console.
7. **Revisión legal** del Aviso de Privacidad y los Términos por un abogado mexicano (LFPDPPP 2025, PROFECO y, si aplica, el Registro Nacional de Turismo).
8. **Core Web Vitals de campo (CrUX)**: solo existirán con tráfico real en el dominio definitivo. Revisarlos en Search Console 28 días después del lanzamiento.
9. **Validación del schema** en https://search.google.com/test/rich-results (requiere el dominio público o pegar el código).
10. **Contraste y navegación por teclado** en los paneles dinámicos (calendario, selector de huéspedes, lightbox, modal de FAQ). Lighthouse solo analiza el estado inicial de la página.
11. **Safari iOS y dispositivos reales**: las pruebas se hicieron con Chrome headless emulando anchos de pantalla.
