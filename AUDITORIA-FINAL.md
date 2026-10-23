# Auditoría final y traspaso — Mexico Luxe Stays

**Fecha:** 23 de octubre de 2026 · **En producción:** `main` @ `abca7e7` (www.mexicoluxestays.com, villaaqua.com, kasakefi.mx, casacorazonpdc.com)

Este documento sustituye a [AUDITORIA.md](AUDITORIA.md) (16 de octubre). Resume el estado de la web tras la auditoría previa a la entrega, todo lo que se configuró fuera del código y **lo que falta**, con los pasos para hacerlo. Cómo funciona el proyecto está en el [README](README.md).

---

## 1. Estado

La web está publicada y verificada. Sin errores en el navegador, en móvil y escritorio, en las páginas EN y ES. Lighthouse da 100 en accesibilidad, buenas prácticas y SEO, y 88–100 en rendimiento.

**Lo único abierto con impacto:** el checkout de Hostaway se está mudando a `reservas.mexicoluxestays.com` y **Hostaway todavía no ha emitido el certificado SSL**. Mientras tanto, "Book Now" envía una **solicitud de reserva** en lugar de llevar al pago. Ver la sección 3.

---

## 2. Preparar tu computadora

```bash
git clone https://github.com/mvertex/mexico-luxe-stays.git
cd mexico-luxe-stays
npm install
git config core.hooksPath .githooks   # regenera es/ y sitemap.xml en cada commit
node serve.mjs                        # http://localhost:3000 (solo estáticos)
```

- Las variables de entorno están en Vercel (lista en el README). No hacen falta para editar la web.
- Para probar `api/` en local: `npx vercel dev` con un `.env.local`.
- **Producción = rama `main`.** Vercel publica cada push a `main`. Hoy se trabajó en `auditoria-correcciones`, que es idéntica a `main`.

---

## 3. URGENTE: terminar el dominio del checkout

**Qué se hizo el 23 de octubre:**

1. **GoDaddy (DNS de mexicoluxestays.com):** registro `CNAME reservas → proxy3.holidayfuture.com`. Ya resuelve en todo el mundo.
2. **Hostaway → Booking Website → RESERVAS MLS → Settings → Domain & Security:** *Own domain → Subdomain → `reservas.mexicoluxestays.com`*. Guardado y **Republish**.
3. Al publicarlo, Hostaway **apagó** `reservas-mls.holidayfuture.com` (da 404), y el dominio nuevo **aún no tiene SSL**.
4. Para no perder reservas, la web tiene **temporalmente** `MLS_BOOKING_ENGINE_URL = null` en `assets/js/villas-data.js`. Con eso el formulario de reserva queda en modo *Inquire*: la solicitud entra a Hostaway como *inquiry*, con fechas y datos del huésped, y el equipo la confirma y cobra.

**Cómo saber si ya está el SSL:**

- Abre https://reservas.mexicoluxestays.com: tiene que verse el checkout con el candado.
- O consulta https://crt.sh/?q=reservas.mexicoluxestays.com: tiene que aparecer al menos un certificado.
- Desde la terminal:

  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' "https://reservas.mexicoluxestays.com/checkout/305921?start=2026-12-10&end=2026-12-15&numberOfGuests=4"   # 200 = listo
  ```

**Si no sale:** la guía de Hostaway habla de hasta 48 h. Si pasan más de 8 h, escribir al soporte (chat en el panel):

> I connected the custom subdomain reservas.mexicoluxestays.com to my Booking Website "RESERVAS MLS". The CNAME points to proxy3.holidayfuture.com and resolves worldwide, and I republished. The SSL certificate hasn't been issued (proxy3 answers TLS "unrecognized name") and the old subdomain reservas-mls.holidayfuture.com returns 404. Could you check the SSL provisioning?

Su guía también sugiere despublicar y volver a publicar la booking website.

**Cuando el SSL funcione:**

1. En `assets/js/villas-data.js`, deja la constante así y borra el comentario *TEMPORARY* de encima:

   ```js
   const MLS_BOOKING_ENGINE_URL = "https://reservas.mexicoluxestays.com/";
   ```

2. Sube `villas-data.js?v=36` → `?v=37` en todos los `.html` de la raíz y de `villas/`. Los JS se cachean un año como *immutable*, así que sin subir el número el navegador seguiría usando la versión vieja.

   ```bash
   sed -i '' 's/villas-data\.js?v=36/villas-data.js?v=37/g' *.html villas/*.html   # macOS
   ```

3. `git commit` (el hook regenera `es/`) y `git push origin main`.
4. **Probar en vivo**, en ventana privada:
   - En una villa en inglés, "Book Now" con fechas debe abrir `reservas.mexicoluxestays.com/en/checkout/…` en inglés.
   - Lo mismo desde `/es/` debe abrir `…/es/checkout/…` en español.
   - La flecha "atrás" del checkout debe volver a la villa, en su idioma y con las fechas. Por ejemplo, `www.villaaqua.com/?checkin=…#book` o `www.kasakefi.mx/es/…`.
   - Un **pago de prueba completo**, cancelándolo después en Hostaway.

El script de "volver a la web" del checkout no hay que tocarlo. Ya apunta a `https://www.mexicoluxestays.com` y está en Hostaway → RESERVAS MLS → Scripts & Widgets → Scripts → Head script.

---

## 4. Pendientes

| # | Qué | Dónde | Quién |
|---|---|---|---|
| 1 | Terminar el dominio del checkout | Sección 3 | Diego |
| 2 | **Pruebas reales:** solicitud de reserva desde una villa (debe llegar a Hostaway con fechas), mensaje desde "Contact us", escanear el QR de WhatsApp, llamar a los dos teléfonos, revisar en un iPhone | Web en vivo | Diego / equipo |
| 3 | **Webs viejas de Hostaway que reclaman nuestros dominios:** "MLS" (`www.mexicoluxestays.com`) y "kasakefi" (`www.kasakefi.mx`). Los dominios ya apuntan a Vercel, así que hoy no afectan, pero conviene despublicarlas o quitarles el dominio. Confirmar antes con la dueña que no las usa. "CasaCorazonpdc.com" figura en `booking.casacorazonpdc.com`, pero ese registro no existe en el DNS. | Hostaway → Booking Website | Diego + dueña |
| 4 | **Políticas de cancelación en Hostaway:** el checkout de Villa Aqua y el de Kasa Kefi muestran "92% refund up to 30 days / 50% up to 15 days", que no es la política de la dueña (la correcta está en la web, Términos y FAQ de cada villa). Corregir en el canal *Direct* sin tocar las de otros canales. | Hostaway → Listings → la villa → Edit → Cancellation policy | Diego |
| 5 | **Kasa Kefi, tarifa no reembolsable 8%:** la dueña quiere un cupón (sugerido `NONREFUNDABLE8`, en Reservations → Coupons, limitado a Kasa Kefi). Falta que se cree y que ella decida si con esa tarifa se cobra el 100% al reservar. El aviso de "no reembolsable" irá en la página de Kasa Kefi junto al código. | Hostaway + web | Dueña → Diego |
| 6 | **Textos de Hostaway en el checkout:** el extra "Late Check Out Fee" de Kasa Kefi sale en inglés en el checkout en español (falta su traducción). En el extra de Casa Corazón (inglés), "Cancelation Fee" debe ser "Cancellation Fee" y "aplies", "applies". Opcional: el título ES de Villa Aqua ("Villa Aqua Luxe") no coincide con el EN. El título ES de Kasa Kefi ("Kasa Kava…") es correcto: Kasa Kefi está dentro del viñedo Kasa Kava. | Hostaway → Listings → la villa (traducción / extras) | Diego o dueña |
| 7 | **Teléfono:** confirmar con la próxima consulta real que Hostaway acepta los números que la web da por válidos (la web valida con libphonenumber). | Hostaway | Diego |
| 8 | Opcional: `http://mexicoluxestays.com` llega a www en 2 saltos, y el HSTS no incluye subdominios. Son ajustes de dominio en Vercel; no urgen. | Vercel | — |

**Decidido, no es pendiente:**

- El límite de peticiones a la API va en el código (sección 5). La regla del Firewall de Vercel solo hará falta si aparecen señales: precios que no cargan o consultas raras.
- La animación del hero se queda como está: el LCP móvil real medido es de ~2,0 s.
- Search Console y la analítica son un proyecto de SEO aparte.

---

## 5. Qué se cambió en la auditoría

Commits `665afad` y `abca7e7`.

**Funcionamiento y contenido**

- **WhatsApp** pasa al formato actual `wa.me/529848079475`, también en el **QR** (`assets/img/whatsapp-qr.png`, regenerado con los mismos colores).
- **Facebook eliminado** de la web y del schema, porque no tienen cuenta.
- **404:** rutas absolutas (antes se veía sin estilos en URLs como `/villas/xyz`) y botones "Volver al inicio" / "Ver villas".
- **Redirecciones nuevas** en `vercel.json`:
  - `mexico-luxe-stays.vercel.app/*` → `www.mexicoluxestays.com/*`
  - `/about`, `/villas`, `/faq`, `/contact`, `/terms`, `/privacy`, `/playa-del-carmen`, `/valle-de-guadalupe` y `/villas/casa-de-las-estrellas`, en EN y ES, → su `.html`
- **Checkout por idioma:** desde `/es/` abre `/es/checkout/…` y desde EN `/en/checkout/…`, siempre explícito, porque Hostaway recuerda el último idioma con la cookie `NEXT_LOCALE`. El español quedó activado en Hostaway (RESERVAS MLS → Translations → Language Settings).
- El HTML estático en inglés coincide con lo que pinta `i18n.js`. Antes, Términos tenía párrafos de relleno y Privacidad mencionaba Resend.
- Títulos ≤ 60 caracteres y descripciones ES ≤ 160 (`<title>` EN y `scripts/es-meta.mjs`).
- El año del copyright es automático (`footer.copyright` en `i18n.js`).
- Botones de WhatsApp en `/es/` con el mensaje en español (`WA_TEXT` en `scripts/build-es.mjs`).

**Accesibilidad**

- Todos los `alt` / `aria-label` traducidos en `/es/`: unas 70 claves nuevas `a11y.*` en `i18n.js`. Antes había ~240 atributos en inglés.
- Corregido el H1 de `/es/about.html`, que salía como `Sobre <em>nosotros</em>`.
- Menú móvil: se cierra con Escape y al pasar a escritorio. Antes la página podía quedarse sin scroll.
- El foco de teclado vuelve a verse en el selector de villa del formulario.
- Botones con `type`, landmarks sin duplicar y teléfonos con espacios no separables.

**Visual**

- La etiqueta "Tap to browse N bedrooms" pasa a dos líneas cuando no cabe, en vez de cortarse.
- Con zoom del navegador ≥ 150 % en escritorio, los tres botones flotantes se agrupan en uno, como en móvil (`qa-compact`, en `main.js` + `styles.css`).

**Seguridad**

- `rel="noopener noreferrer"` en todos los enlaces `target="_blank"` y en `window.open`.
- Límite por IP en las tres funciones, con un helper compartido `api/_lib/rate-limit.js`: formularios 5 cada 10 min, `villa-quote` 30/min, `villa-live-data` 60/min. Al pasarse, la web muestra el estado de error normal (precio no disponible / datos de respaldo).

**Limpieza**

- 150 imágenes y vídeos sin usar eliminados (19,7 MB): fotos viejas de Villa Aqua, vídeo "fogata", fondos.
- `Villa Aqua - Propuesta de fotos/` (originales JPG de la dueña) está en `.gitignore`. Las versiones WebP ya están en `assets/img/villas/`.
- `node-html-parser` 6 → 9; genera un `es/` idéntico byte a byte.
- Comentarios obsoletos corregidos y README nuevo.

---

## 6. Verificación hecha (23 de octubre)

| Prueba | Resultado |
|---|---|
| Sintaxis de todo el JS, `vercel.json`, `npm audit` | OK · 0 vulnerabilidades |
| Enlaces y recursos locales (EN + ES) | 0 rotos |
| Playwright en producción, Chromium (20 páginas × 8 anchos, 320–1920 px) y WebKit/Safari | 0 errores de consola, 0 peticiones fallidas, 0 scroll horizontal, 0 imágenes deformadas |
| Lighthouse móvil / escritorio (home, villa, contact, `/es/villas`) | Rendimiento 88–100 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |
| Cabeceras de seguridad | CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS |
| Rutas sensibles (`.git`, `.env`, `package.json`, `api/_lib`, notas `.md`) | Todas 404 |
| Secretos en código e historial de git | Ninguno |
| `/es/`: atributos idénticos al inglés (sin traducir) | 0, salvo nombres propios |
| Ida y vuelta checkout ↔ web, EN y ES | OK (probado con el dominio viejo antes del cambio) |

---

## 7. Reglas del proyecto (para no romper nada)

- **Nunca editar `es/` a mano.** Se genera con `npm run build:es`, que corre solo en el pre-commit. Los textos en español van en `assets/js/i18n.js` y los títulos o descripciones en `scripts/es-meta.mjs`.
- **Al cambiar `main.js`, `i18n.js`, `villas-data.js`, `hostaway-sync.js` o `styles.css`**, subir su `?v=N` en todos los `.html` de la raíz y de `villas/`.
- **`.vercelignore` es una lista blanca:** un archivo o carpeta nueva en la raíz no se publica hasta que se añade ahí.
- Los textos de una villa (descripciones, FAQs, amenidades, fotos) están en `assets/js/villas-data.js`.
- `PENDIENTES-HOSTAWAY.md` es una nota local de Max (no está en git). Lo relevante de esa nota está en la sección 4.
