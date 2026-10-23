# Mexico Luxe Stays — sitio web

Sitio de renta de villas de lujo en Playa del Carmen y Valle de Guadalupe:
https://www.mexicoluxestays.com, en inglés y en español (`/es/`).

Las villas con dominio propio muestran su página en ese dominio:

| Villa | Dominio |
|---|---|
| Villa Aqua | https://www.villaaqua.com (también `villaaqua.com.mx`) |
| Kasa Kefi | https://www.kasakefi.mx |
| Casa Corazón | https://www.casacorazonpdc.com |
| Casa de las Estrellas | https://www.mexicoluxestays.com/villas/casa-de-las-estrellas.html |

## Cómo está hecho

- **HTML, CSS y JavaScript sin framework ni paso de build.** Cada página es un
  archivo `.html` en la raíz o en `villas/`. Los estilos están en
  `assets/css/styles.css` y el comportamiento en `assets/js/main.js`.
- **Textos y traducciones:** `assets/js/i18n.js` contiene los diccionarios en
  inglés y en español. Los elementos llevan `data-i18n="clave"`.
- **Datos de las villas** (fotos, descripciones, amenidades): `assets/js/villas-data.js`.
- **Versión en español (`es/`):** se genera con `npm run build:es` a partir de
  las páginas en inglés, `i18n.js` y `scripts/es-meta.mjs` (títulos y
  descripciones en español). Ese mismo comando regenera `sitemap.xml`.
  **No hay que editar nada dentro de `es/` a mano.**
- **Funciones serverless (Vercel), en `api/`:**
  - `villa-live-data`: disponibilidad, precio "desde" y reseñas, leídos de Hostaway.
  - `villa-quote`: precio exacto para unas fechas, calculado por Hostaway.
  - `booking-request`: los formularios de reserva, de consulta y de "Contact us"
    crean una *inquiry* en Hostaway. No confirma ninguna reserva.
- **`middleware.js`:** sirve cada villa bajo su dominio propio y redirige al
  sitio principal todo lo que no es esa villa.
- **`vercel.json`:** cabeceras de seguridad (CSP, etc.), caché de los assets,
  `noindex` en las *previews* (`*.vercel.app`) y redirecciones 301: desde las
  URLs del sitio anterior y desde `mexico-luxe-stays.vercel.app` hacia
  `www.mexicoluxestays.com`.
- **`.vercelignore`** funciona como lista blanca: solo se publica lo que la web
  necesita. Si se añade una carpeta o un archivo nuevo en la raíz, hay que
  incluirlo ahí o no se desplegará.

## Trabajar en local

Requisitos: Node.js 18 o superior.

```bash
npm install
git config core.hooksPath .githooks   # una vez por clon: activa el hook que regenera es/
node serve.mjs                        # vista previa en http://localhost:3000
```

`serve.mjs` sirve solo los archivos estáticos. Para probar también las
funciones de `api/` y el middleware, usa `npx vercel dev`, con las variables
de entorno de abajo en un `.env.local`.

## Cambios habituales

- **Cambiar un texto:** edita la clave en `assets/js/i18n.js`, en inglés (`en`)
  y en español (`es`), y el texto por defecto del HTML en inglés.
- **Cambiar `main.js`, `i18n.js`, `villas-data.js`, `hostaway-sync.js` o
  `styles.css`:** sube el número `?v=N` con que los cargan todas las páginas
  `.html` de la raíz y de `villas/`. Esos archivos se cachean un año, y sin
  ese cambio los visitantes seguirían viendo la versión anterior.
- **Página nueva:** añade su entrada en `scripts/es-meta.mjs`, o fallará el
  build en español.
- **Commit:** el hook `pre-commit` ejecuta `npm run build:es` y añade `es/` y
  `sitemap.xml` al commit.

## Despliegue

Vercel despliega automáticamente cada push a la rama `main` del repositorio de
GitHub (`mvertex/mexico-luxe-stays`). Las demás ramas generan *previews* con
`noindex`. No hay comando de build: Vercel publica los archivos tal cual e
instala las dependencias de `api/` desde `package.json`.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `HOSTAWAY_CLIENT_ID` | Sí | ID de cuenta de la API de Hostaway (Settings → Hostaway API). `HOSTAWAY_ACCOUNT_ID` se acepta como alternativa. |
| `HOSTAWAY_CLIENT_SECRET` | Sí | Clave secreta de esa cuenta de API. |
| `BOOKING_EMAIL_FALLBACK` | No | Si vale `1` y Hostaway no responde, las solicitudes se envían por correo a info@mexicoluxestays.com. |
| `RESEND_API_KEY` | Solo con el fallback | Clave de Resend para enviar ese correo. |
| `RESEND_FROM_EMAIL` | Solo con el fallback | Remitente, en un dominio verificado en Resend. |

Las claves nunca van en el código ni en git (`.env*` está en `.gitignore`).

## Servicios y cuentas que usa la web

| Servicio | Para qué | Quién tiene acceso |
|---|---|---|
| **Vercel** (proyecto `mexico-luxe-stays`) | Hosting, funciones `api/`, dominios | Equipo de la web |
| **GitHub** (`mvertex/mexico-luxe-stays`) | Código fuente | Equipo de la web |
| **GoDaddy** | Registro y DNS de los dominios | Propietaria |
| **Hostaway** | Reservas, calendario, precios, reseñas, inquiries y Booking Engine (checkout en `reservas.mexicoluxestays.com`; ver AUDITORIA-FINAL.md, sección 3) | Propietaria |
| **Stripe** (vía Hostaway) | Pagos con tarjeta en el checkout | Propietaria |
| **Google Workspace** | Correo `info@mexicoluxestays.com` | Propietaria |
| **Resend** | Solo para el correo de respaldo (opcional, hoy desactivado) | — |
| **OpenStreetMap / unpkg** | Teselas de los mapas y la librería Leaflet | Públicos, sin cuenta |

La web no usa analítica, píxeles de seguimiento ni cookies propias. Solo guarda
el idioma elegido en `localStorage`.
