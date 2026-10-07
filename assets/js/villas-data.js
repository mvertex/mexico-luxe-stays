/* ==========================================================================
   MEXICO LUXE STAYS — Villa data (single source for cards, grids & detail specs)

   ┌─────────────────────────────────────────────────────────────────────┐
   │ HOSTAWAY INTEGRATION POINT                                          │
   │ Replace this static array with a fetch to the Hostaway Listings     │
   │ API (GET /v1/listings). Map: name, address→location, personCapacity │
   │ →guests, bedroomsNumber→bedrooms, bedsNumber→beds, bathroomsNumber  │
   │ →baths, squareMeters→area, listingAmenities→amenities,              │
   │ listingImages→image/gallery.                                        │
   │ Docs: https://api.hostaway.com/documentation                        │
   │                                                                      │
   │ Guest reviews are NOT stored here: they come only from Hostaway     │
   │ (api/villa-live-data.js → lib/hostaway-reviews.js) and the section  │
   │ stays hidden on a villa with no real reviews. Never add sample or   │
   │ invented testimonials to this file.                                 │
   │                                                                      │
   │ `priceFromPerNight` and `availability` are filled live from         │
   │ Hostaway by assets/js/hostaway-sync.js (/api/villa-live-data); the  │
   │ stay quote comes from /api/villa-quote (Hostaway priceDetails).     │
   └─────────────────────────────────────────────────────────────────────┘

   Content sourced from the client's Hostaway listings (July 2026).
   Images are verified stock PLACEHOLDERS — replace with real photography.

   Villa names are proper nouns and stay identical in both languages;
   `*Es` fields hold the Spanish counterpart used by the language toggle.
   `amenities` renders visible by default; `amenitiesMore` sits behind
   the "Show all amenities" button on detail pages.
   ========================================================================== */

/* ---------- Responsive images ----------
   Mobile-sized WebP copies (NAME-800w.webp, and NAME-1200w.webp for
   full-bleed heroes) exist for the photos shown on-page; this table maps
   each original (relative to assets/img/) to [originalWidth, ...variantWidths].
   mlsSrcAttrs() turns a src into srcset/sizes attributes so phones download
   the small copy while desktop keeps picking the original. Lightbox images
   aren't listed (they stay full size). Regenerate both together. */
const MLS_IMG_VARIANTS = {"about-cta.webp":[2000,800,1200],"about-story-2.webp":[1254,800],"cta-infinity-pool.webp":[1536,800],"dest-valle-guadalupe.webp":[1400,800],"hero-casa-corazon.jpg":[1752,800,1200],"hero-dest-playa.webp":[1870,800,1200],"hero-dest-valle.webp":[1774,800,1200],"hero-estrellas.webp":[1752,800,1200],"hero-kasa-kefi.webp":[1752,800,1200],"hero-villa-aqua.webp":[1752,800,1200],"hero-villas.webp":[1900,800,1200],"home-dest-playa.webp":[1400,800],"intro-central-landing.webp":[1254,800],"services/spa-massage.webp":[1600,800],"villas/bg-desierto.webp":[1870,800],"villas/bg-playa-turtles.webp":[1536,800],"villas/casa-corazon-luxe-1.webp":[1200,800],"villas/casa-corazon-luxe-2.webp":[1200,800],"villas/casa-corazon-luxe-3.webp":[1200,800],"villas/casa-corazon-luxe-4.webp":[1200,800],"villas/casa-corazon-luxe-5.webp":[1200,800],"villas/casa-corazon-luxe-interiors-02.webp":[1400,800],"villas/casa-corazon-luxe-interiors-03.webp":[1400,800],"villas/casa-corazon-luxe-interiors-33.webp":[1400,800],"villas/casa-corazon-luxe-interiors-35.webp":[1400,800],"villas/casa-corazon-luxe-multipurpose-01.webp":[1400,800],"villas/casa-corazon-luxe-outdoor-02.webp":[1400,800],"villas/casa-corazon-luxe-rooms-01.webp":[1400,800],"villas/casa-corazon-luxe-rooms-03.webp":[1400,800],"villas/casa-corazon-luxe-rooms-04.webp":[1400,800],"villas/casa-corazon-luxe-rooms-06.webp":[1400,800],"villas/casa-corazon-luxe-rooms-15.webp":[1400,800],"villas/casa-corazon-luxe-rooms-19.webp":[1400,800],"villas/casa-corazon-luxe-rooms-27.webp":[1400,800],"villas/casa-corazon-luxe-rooms-38.webp":[1200,800],"villas/casa-corazon-luxe-rooms-40.webp":[1200,800],"villas/casa-corazon-luxe-rooms-42.webp":[1200,800],"villas/casa-corazon-luxe-rooms-44.webp":[1400,800],"villas/casa-corazon-luxe-rooms-52.webp":[1400,800],"villas/casa-de-las-estrellas-1.webp":[1350,800],"villas/casa-de-las-estrellas-2.webp":[1350,800],"villas/casa-de-las-estrellas-3.webp":[1280,800],"villas/casa-de-las-estrellas-interiors-01.webp":[1280,800],"villas/casa-de-las-estrellas-kitchen-02.webp":[1349,800],"villas/casa-de-las-estrellas-kitchen-03.webp":[1351,800],"villas/casa-de-las-estrellas-living-01.webp":[1350,800],"villas/casa-de-las-estrellas-multipurpose-01.webp":[1350,800],"villas/casa-de-las-estrellas-outdoor-01.webp":[1350,800],"villas/casa-de-las-estrellas-rooms-01.webp":[1350,800],"villas/casa-de-las-estrellas-rooms-06.webp":[1349,800],"villas/casa-de-las-estrellas-rooms-14.webp":[1350,800],"villas/casa-de-las-estrellas-rooms-20.webp":[1351,800],"villas/casa-de-las-estrellas-rooms-26.webp":[1280,800],"villas/casa-de-las-estrellas-rooms-27.webp":[1350,800],"villas/kasa-kefi-interiors-01.webp":[1920,800],"villas/kasa-kefi-kitchen-01.webp":[1920,800],"villas/kasa-kefi-living-01.webp":[1920,800],"villas/kasa-kefi-living-05.webp":[1920,800],"villas/kasa-kefi-multipurpose-01.webp":[1920,800],"villas/kasa-kefi-outdoor-01.webp":[1920,800],"villas/kasa-kefi-outdoor-02.webp":[1920,800],"villas/kasa-kefi-outdoor-04.webp":[1920,800],"villas/kasa-kefi-outdoor-07.webp":[1920,800],"villas/kasa-kefi-rooms-01.webp":[1920,800],"villas/villa-aqua-1.webp":[1350,800],"villas/villa-aqua-2.webp":[1350,800],"villas/villa-aqua-3.webp":[1350,800],"villas/villa-aqua-4.webp":[1280,800],"villas/villa-aqua-5.webp":[1350,800],"villas/villa-aqua-interiors-01.webp":[1350,800],"villas/villa-aqua-kitchen-01.webp":[1349,800],"villas/villa-aqua-kitchen-02.webp":[1280,800],"villas/villa-aqua-living-02.webp":[1350,800],"villas/villa-aqua-living-11.webp":[1350,800],"villas/villa-aqua-multipurpose-01.webp":[1350,800],"villas/villa-aqua-outdoor-01.webp":[1350,800],"villas/villa-aqua-rooms-01.webp":[1350,800]};
function mlsSrcAttrs(src) {
  const m = /^((?:\.\.\/)*)assets\/img\/(.+)$/.exec(src || "");
  const entry = m && MLS_IMG_VARIANTS[m[2]];
  if (!entry) return "";
  const [origW, ...widths] = entry;
  const stem = src.replace(/\.(webp|jpe?g)$/i, "");
  const srcset = widths.map((w) => `${stem}-${w}w.webp ${w}w`).concat(`${src} ${origW}w`).join(", ");
  return ` srcset="${srcset}" sizes="(max-width: 780px) 100vw, ${origW}px"`;
}

/* ---------- Hostaway Booking Engine ----------
   "Book now" sends guests to the owner's Hostaway Booking Engine checkout
   for the villa, with dates and guests prefilled — the same URL Hostaway's
   own calendar widget builds: {base}checkout/{listingId}?start=&end=&numberOfGuests=
   null until the owner publishes the Booking Engine (on its own subdomain,
   e.g. "https://reservas.mexicoluxestays.com/"); until then Book now falls
   back to the contact page's booking request. */
const MLS_BOOKING_ENGINE_URL = null;
function mlsBookingEngineUrl(villa, checkin, checkout, guests) {
  if (!MLS_BOOKING_ENGINE_URL || !villa || !villa.hostawayListingId) return null;
  const url = new URL(`checkout/${villa.hostawayListingId}`, MLS_BOOKING_ENGINE_URL);
  if (checkin) url.searchParams.set("start", checkin);
  if (checkout) url.searchParams.set("end", checkout);
  url.searchParams.set("numberOfGuests", String(guests || 1));
  return url.toString();
}

const MLS_VILLAS = [
  {
    slug: "villa-aqua",
    name: "Villa Aqua",
    destination: "playa-del-carmen",
    destinationLabel: "Playa del Carmen",
    destinationLabelEs: "Playa del Carmen",
    lat: 20.6183853,
    lng: -87.0837676,
    mapIcon: "assets/img/brand/villa-aqua-icon.png",
    googleMapsUrl: "https://maps.app.goo.gl/A6LuW87UDhajc8tb9",
    guests: 18,
    bedrooms: 6,
    hostawayListingId: 145234,
    // Live from Hostaway (hostaway-sync.js): lowest bookable nightly rate,
    // per-date minimum stay and booked nights. Empty until it lands, so
    // the site never shows a made-up price or booking.
    priceFromPerNight: null,
    availability: { minStay: null, minStayRanges: [], blockedRanges: [] },
    beds: 11,
    baths: 6,
    area: 1200,
    featured: true,
    short: "Arrive and never lift a finger again. Chef, butler and concierge handle everything inside this private resort in Playacar, with pool, jacuzzi and even a squash court.",
    shortEs: "Llega y no vuelvas a levantar un dedo. Chef, mayordomo y concierge se encargan de todo dentro de este resort privado en Playacar, con alberca, jacuzzi y hasta cancha de squash.",
    image: "assets/img/villas/villa-aqua-1.webp",
    imageAlt: "Villa Aqua's curved white facade framing the free-form pool",
    imageAltEs: "La fachada blanca curva de Villa Aqua enmarcando la alberca de forma libre",
    showcaseImages: [
      { src: "assets/img/villas/villa-aqua-1.webp", alt: "Villa Aqua's curved white facade framing the free-form pool", altEs: "La fachada blanca curva de Villa Aqua enmarcando la alberca de forma libre" },
      { src: "assets/img/villas/villa-aqua-2.webp", alt: "Poolside umbrellas and loungers beneath the palms at Villa Aqua", altEs: "Sombrillas y camastros junto a la alberca bajo las palmeras en Villa Aqua" },
      { src: "assets/img/villas/villa-aqua-3.webp", alt: "Golden hour light through the palms over Villa Aqua's pool deck", altEs: "Luz dorada entre las palmeras sobre el área de alberca de Villa Aqua" },
      { src: "assets/img/villas/villa-aqua-4.webp", alt: "Villa Aqua's sculptural architecture glowing at dusk", altEs: "La arquitectura escultórica de Villa Aqua iluminada al atardecer" },
      { src: "assets/img/villas/villa-aqua-5.webp", alt: "The double-height living room beneath Villa Aqua's spiral staircase", altEs: "La sala de doble altura bajo la escalera de caracol de Villa Aqua" }
    ],
    amenities: [
      { en: "Private pool", es: "Alberca privada", cat: "outdoor" },
      { en: "Jacuzzi", es: "Jacuzzi", cat: "outdoor" },
      { en: "High-Speed WiFi", es: "Wi-Fi de alta velocidad", cat: "comfort" },
      { en: "Air conditioning", es: "Aire acondicionado", cat: "comfort" },
      { en: "Gym", es: "Gimnasio", cat: "comfort" },
      { en: "Cleaning included", es: "Limpieza incluida", cat: "services" },
      { en: "Private chef on request", es: "Chef privado bajo solicitud", cat: "services" },
      { en: "Smart TV", es: "Smart TV", cat: "comfort" }
    ],
    amenitiesMore: [
      { en: "Fitness equipment", es: "Equipo de ejercicio", cat: "comfort" },
      { en: "Sound system", es: "Sistema de sonido", cat: "comfort" },
      { en: "Safe", es: "Caja fuerte", cat: "comfort" },
      { en: "Washing machine", es: "Lavadora", cat: "comfort" },
      { en: "Dryer", es: "Secadora", cat: "comfort" },
      { en: "Hair dryer", es: "Secadora de pelo", cat: "comfort" },
      { en: "Iron", es: "Plancha", cat: "comfort" },
      { en: "Room-darkening shades", es: "Cortinas blackout", cat: "comfort" },
      { en: "Board games", es: "Juegos de mesa", cat: "comfort" },
      { en: "Ping pong table", es: "Mesa de ping pong", cat: "comfort" },
      { en: "Coffee/tea maker", es: "Cafetera/tetera", cat: "kitchen" },
      { en: "Toaster", es: "Tostador", cat: "kitchen" },
      { en: "Dishwasher", es: "Lavavajillas", cat: "kitchen" },
      { en: "Microwave", es: "Microondas", cat: "kitchen" },
      { en: "Oven", es: "Horno", cat: "kitchen" },
      { en: "Stove", es: "Estufa", cat: "kitchen" },
      { en: "Refrigerator", es: "Refrigerador", cat: "kitchen" },
      { en: "Electric kettle", es: "Hervidor eléctrico", cat: "kitchen" },
      { en: "Blender", es: "Licuadora", cat: "kitchen" },
      { en: "Rice maker", es: "Arrocera", cat: "kitchen" },
      { en: "Basketball court", es: "Cancha de básquetbol", cat: "outdoor" },
      { en: "Communal tennis court", es: "Cancha de tenis comunitaria", cat: "outdoor" },
      { en: "Outdoor grill", es: "Parrilla exterior", cat: "outdoor" },
      { en: "Outdoor kitchen", es: "Cocina exterior", cat: "outdoor" },
      { en: "Hammock", es: "Hamaca", cat: "outdoor" },
      { en: "Outdoor sun loungers", es: "Camastros exteriores", cat: "outdoor" },
      { en: "Garden / backyard", es: "Jardín / patio", cat: "outdoor" },
      { en: "Balcony", es: "Balcón", cat: "outdoor" },
      { en: "Private parking", es: "Estacionamiento privado", cat: "outdoor" },
      { en: "Electric vehicle charger", es: "Cargador para auto eléctrico", cat: "outdoor" },
      { en: "Baby crib", es: "Cuna", cat: "family" },
      { en: "Toddler bed", es: "Cama para niños pequeños", cat: "family" },
      { en: "High chair", es: "Silla alta", cat: "family" },
      { en: "Butler included", es: "Mayordomo incluido", cat: "services" },
      { en: "Housekeeper included", es: "Personal de limpieza incluido", cat: "services" },
      { en: "Site staff included", es: "Personal en sitio incluido", cat: "services" },
      { en: "Bartender on request", es: "Bartender bajo solicitud", cat: "services" },
      { en: "Grocery service on request", es: "Servicio de despensa bajo solicitud", cat: "services" },
      { en: "Massage", es: "Masajes", cat: "services" },
      { en: "Meal delivery", es: "Entrega de comidas", cat: "services" },
      { en: "Smoke detector", es: "Detector de humo", cat: "safety" },
      { en: "Carbon monoxide detector", es: "Detector de monóxido de carbono", cat: "safety" },
      { en: "First aid kit", es: "Botiquín de primeros auxilios", cat: "safety" },
      { en: "Fire extinguisher", es: "Extintor", cat: "safety" },
      { en: "Disabled parking", es: "Estacionamiento para discapacitados", cat: "safety" }
    ],
    services: ["housekeeping", "concierge", "itinerary", "chef", "transfer", "spa", "grocery", "excursions"],
    /* Real Villa Aqua photography per service (not stock) — picked by hand,
       one per service, so guests see this actual property, not a generic
       stand-in. HOSTAWAY swap point if a future integration supplies these. */
    serviceImages: {
      housekeeping: "../assets/img/villas/villa-aqua-rooms-01.webp",
      itinerary: "../assets/img/villas/villa-aqua-living-11.webp",
      chef: "../assets/img/villas/villa-aqua-kitchen-02.webp",
      grocery: "../assets/img/villas/villa-aqua-kitchen-15.webp",
      excursions: "../assets/img/villas/villa-aqua-outdoor-02.webp"
    },
    /* Non-default focal point so the crop favors this part of the source
       image (e.g. keeping a person's face in frame on a tight square crop). */
    serviceImagePositions: { chef: "center 22%" },
    gallery: [
      { key: "outdoor", images: [
        { src: "../assets/img/villas/villa-aqua-outdoor-01.webp",
          alt: "Villa Aqua's curved white facade framing the free-form pool", altEs: "La fachada blanca curva de Villa Aqua enmarcando la alberca de forma libre" },
        { src: "../assets/img/villas/villa-aqua-outdoor-02.webp",
          alt: "The rear facade and pool framed by royal palms", altEs: "La fachada trasera y la alberca enmarcadas por palmas reales" },
        { src: "../assets/img/villas/villa-aqua-outdoor-03.webp",
          alt: "Alfresco dining under the covered terrace, steps from the grill", altEs: "Comedor al aire libre bajo la terraza techada, junto a la parrilla" },
        { src: "../assets/img/villas/villa-aqua-outdoor-04.webp",
          alt: "The pool and grounds at Villa Aqua — photo 1", altEs: "La alberca y los jardines en Villa Aqua — foto 1" },
        { src: "../assets/img/villas/villa-aqua-outdoor-05.webp",
          alt: "The pool and grounds at Villa Aqua — photo 2", altEs: "La alberca y los jardines en Villa Aqua — foto 2" },
        { src: "../assets/img/villas/villa-aqua-outdoor-06.webp",
          alt: "The pool and grounds at Villa Aqua — photo 3", altEs: "La alberca y los jardines en Villa Aqua — foto 3" },
        { src: "../assets/img/villas/villa-aqua-outdoor-07.webp",
          alt: "The pool and grounds at Villa Aqua — photo 4", altEs: "La alberca y los jardines en Villa Aqua — foto 4" },
        { src: "../assets/img/villas/villa-aqua-outdoor-08.webp",
          alt: "The pool and grounds at Villa Aqua — photo 5", altEs: "La alberca y los jardines en Villa Aqua — foto 5" },
        { src: "../assets/img/villas/villa-aqua-outdoor-09.webp",
          alt: "The pool and grounds at Villa Aqua — photo 6", altEs: "La alberca y los jardines en Villa Aqua — foto 6" },
        { src: "../assets/img/villas/villa-aqua-outdoor-10.webp",
          alt: "The pool and grounds at Villa Aqua — photo 7", altEs: "La alberca y los jardines en Villa Aqua — foto 7" },
        { src: "../assets/img/villas/villa-aqua-outdoor-11.webp",
          alt: "The pool and grounds at Villa Aqua — photo 8", altEs: "La alberca y los jardines en Villa Aqua — foto 8" },
        { src: "../assets/img/villas/villa-aqua-outdoor-12.webp",
          alt: "The pool and grounds at Villa Aqua — photo 9", altEs: "La alberca y los jardines en Villa Aqua — foto 9" },
        { src: "../assets/img/villas/villa-aqua-outdoor-13.webp",
          alt: "The pool and grounds at Villa Aqua — photo 10", altEs: "La alberca y los jardines en Villa Aqua — foto 10" },
        { src: "../assets/img/villas/villa-aqua-outdoor-14.webp",
          alt: "The pool and grounds at Villa Aqua — photo 11", altEs: "La alberca y los jardines en Villa Aqua — foto 11" },
        { src: "../assets/img/villas/villa-aqua-outdoor-15.webp",
          alt: "The pool and grounds at Villa Aqua — photo 12", altEs: "La alberca y los jardines en Villa Aqua — foto 12" },
        { src: "../assets/img/villas/villa-aqua-outdoor-16.webp",
          alt: "The pool and grounds at Villa Aqua — photo 13", altEs: "La alberca y los jardines en Villa Aqua — foto 13" },
        { src: "../assets/img/villas/villa-aqua-outdoor-17.webp",
          alt: "The pool and grounds at Villa Aqua — photo 14", altEs: "La alberca y los jardines en Villa Aqua — foto 14" },
        { src: "../assets/img/villas/villa-aqua-outdoor-18.webp",
          alt: "The pool and grounds at Villa Aqua — photo 15", altEs: "La alberca y los jardines en Villa Aqua — foto 15" },
        { src: "../assets/img/villas/villa-aqua-outdoor-19.webp",
          alt: "The pool and grounds at Villa Aqua — photo 16", altEs: "La alberca y los jardines en Villa Aqua — foto 16" },
        { src: "../assets/img/villas/villa-aqua-outdoor-20.webp",
          alt: "The pool and grounds at Villa Aqua — photo 17", altEs: "La alberca y los jardines en Villa Aqua — foto 17" },
        { src: "../assets/img/villas/villa-aqua-outdoor-21.webp",
          alt: "The pool and grounds at Villa Aqua — photo 18", altEs: "La alberca y los jardines en Villa Aqua — foto 18" },
        { src: "../assets/img/villas/villa-aqua-outdoor-22.webp",
          alt: "The pool and grounds at Villa Aqua — photo 19", altEs: "La alberca y los jardines en Villa Aqua — foto 19" },
        { src: "../assets/img/villas/villa-aqua-outdoor-23.webp",
          alt: "The pool and grounds at Villa Aqua — photo 20", altEs: "La alberca y los jardines en Villa Aqua — foto 20" },
        { src: "../assets/img/villas/villa-aqua-outdoor-24.webp",
          alt: "The pool and grounds at Villa Aqua — photo 21", altEs: "La alberca y los jardines en Villa Aqua — foto 21" },
        { src: "../assets/img/villas/villa-aqua-outdoor-25.webp",
          alt: "The pool and grounds at Villa Aqua — photo 22", altEs: "La alberca y los jardines en Villa Aqua — foto 22" },
        { src: "../assets/img/villas/villa-aqua-outdoor-26.webp",
          alt: "The pool and grounds at Villa Aqua — photo 23", altEs: "La alberca y los jardines en Villa Aqua — foto 23" },
        { src: "../assets/img/villas/villa-aqua-outdoor-27.webp",
          alt: "The pool and grounds at Villa Aqua — photo 24", altEs: "La alberca y los jardines en Villa Aqua — foto 24" },
        { src: "../assets/img/villas/villa-aqua-outdoor-28.webp",
          alt: "The barbecue pergola and lounge in the garden", altEs: "La pérgola con parrilla y la sala exterior en el jardín" },
        { src: "../assets/img/villas/villa-aqua-outdoor-29.webp",
          alt: "The pool glowing at twilight", altEs: "La alberca iluminada al atardecer" },
        { src: "../assets/img/villas/villa-aqua-outdoor-30.webp",
          alt: "The pool and grounds at Villa Aqua — photo 25", altEs: "La alberca y los jardines en Villa Aqua — foto 25" },
        { src: "../assets/img/villas/villa-aqua-outdoor-31.webp",
          alt: "The pool and grounds at Villa Aqua — photo 26", altEs: "La alberca y los jardines en Villa Aqua — foto 26" },
        { src: "../assets/img/villas/villa-aqua-outdoor-32.webp",
          alt: "The pool and grounds at Villa Aqua — photo 27", altEs: "La alberca y los jardines en Villa Aqua — foto 27" },
        { src: "../assets/img/villas/villa-aqua-outdoor-33.webp",
          alt: "The pool and grounds at Villa Aqua — photo 28", altEs: "La alberca y los jardines en Villa Aqua — foto 28" },
        { src: "../assets/img/villas/villa-aqua-outdoor-34.webp",
          alt: "The pool and grounds at Villa Aqua — photo 29", altEs: "La alberca y los jardines en Villa Aqua — foto 29" },
        { src: "../assets/img/villas/villa-aqua-outdoor-35.webp",
          alt: "The pool and grounds at Villa Aqua — photo 30", altEs: "La alberca y los jardines en Villa Aqua — foto 30" },
        { src: "../assets/img/villas/villa-aqua-outdoor-36.webp",
          alt: "The pool and grounds at Villa Aqua — photo 31", altEs: "La alberca y los jardines en Villa Aqua — foto 31" },
        { src: "../assets/img/villas/villa-aqua-outdoor-37.webp",
          alt: "The pool and grounds at Villa Aqua — photo 32", altEs: "La alberca y los jardines en Villa Aqua — foto 32" },
        { src: "../assets/img/villas/villa-aqua-outdoor-38.webp",
          alt: "The pool and grounds at Villa Aqua — photo 33", altEs: "La alberca y los jardines en Villa Aqua — foto 33" },
        { src: "../assets/img/villas/villa-aqua-outdoor-39.webp",
          alt: "The pool and grounds at Villa Aqua — photo 34", altEs: "La alberca y los jardines en Villa Aqua — foto 34" },
        { src: "../assets/img/villas/villa-aqua-outdoor-40.webp",
          alt: "The pool and grounds at Villa Aqua — photo 35", altEs: "La alberca y los jardines en Villa Aqua — foto 35" },
        { src: "../assets/img/villas/villa-aqua-outdoor-41.webp",
          alt: "The pool and grounds at Villa Aqua — photo 36", altEs: "La alberca y los jardines en Villa Aqua — foto 36" },
        { src: "../assets/img/villas/villa-aqua-outdoor-42.webp",
          alt: "The pool and grounds at Villa Aqua — photo 37", altEs: "La alberca y los jardines en Villa Aqua — foto 37" },
        { src: "../assets/img/villas/villa-aqua-outdoor-43.webp",
          alt: "The pool and grounds at Villa Aqua — photo 38", altEs: "La alberca y los jardines en Villa Aqua — foto 38" },
        { src: "../assets/img/villas/villa-aqua-outdoor-44.webp",
          alt: "The pool and grounds at Villa Aqua — photo 39", altEs: "La alberca y los jardines en Villa Aqua — foto 39" },
        { src: "../assets/img/villas/villa-aqua-outdoor-45.webp",
          alt: "The pool and grounds at Villa Aqua — photo 40", altEs: "La alberca y los jardines en Villa Aqua — foto 40" },
        { src: "../assets/img/villas/villa-aqua-outdoor-46.webp",
          alt: "The pool and grounds at Villa Aqua — photo 41", altEs: "La alberca y los jardines en Villa Aqua — foto 41" },
        { src: "../assets/img/villas/villa-aqua-outdoor-47.webp",
          alt: "The pool and grounds at Villa Aqua — photo 42", altEs: "La alberca y los jardines en Villa Aqua — foto 42" },
        { src: "../assets/img/villas/villa-aqua-outdoor-48.webp",
          alt: "The pool and grounds at Villa Aqua — photo 43", altEs: "La alberca y los jardines en Villa Aqua — foto 43" },
        { src: "../assets/img/villas/villa-aqua-outdoor-49.webp",
          alt: "The pool and grounds at Villa Aqua — photo 44", altEs: "La alberca y los jardines en Villa Aqua — foto 44" },
        { src: "../assets/img/villas/villa-aqua-outdoor-50.webp",
          alt: "The pool and grounds at Villa Aqua — photo 45", altEs: "La alberca y los jardines en Villa Aqua — foto 45" },
        { src: "../assets/img/villas/villa-aqua-outdoor-51.webp",
          alt: "The pool and grounds at Villa Aqua — photo 46", altEs: "La alberca y los jardines en Villa Aqua — foto 46" },
        { src: "../assets/img/villas/villa-aqua-outdoor-52.webp",
          alt: "The pool and grounds at Villa Aqua — photo 47", altEs: "La alberca y los jardines en Villa Aqua — foto 47" },
        { src: "../assets/img/villas/villa-aqua-outdoor-53.webp",
          alt: "The pool and grounds at Villa Aqua — photo 48", altEs: "La alberca y los jardines en Villa Aqua — foto 48" },
        { src: "../assets/img/villas/villa-aqua-outdoor-54.webp",
          alt: "The pool and grounds at Villa Aqua — photo 49", altEs: "La alberca y los jardines en Villa Aqua — foto 49" }
      ] },
      { key: "living", images: [
        { src: "../assets/img/villas/villa-aqua-living-02.webp",
          alt: "The grand double-height living room, anchored by a sculptural spiral staircase", altEs: "La gran sala de doble altura, centrada por una escalera de caracol escultórica" },
        { src: "../assets/img/villas/villa-aqua-living-01.webp",
          alt: "A closer view of the sunken living room seating area", altEs: "Una vista más cercana del área de estar de la sala hundida" },
        { src: "../assets/img/villas/villa-aqua-living-03.webp",
          alt: "A poolside lounge nook tucked beneath the curved glass walls", altEs: "Un rincón de descanso junto a la alberca bajo los muros curvos de cristal" },
        { src: "../assets/img/villas/villa-aqua-living-04.webp",
          alt: "A living area at Villa Aqua — photo 1", altEs: "Una sala en Villa Aqua — foto 1" },
        { src: "../assets/img/villas/villa-aqua-living-05.webp",
          alt: "A living area at Villa Aqua — photo 2", altEs: "Una sala en Villa Aqua — foto 2" },
        { src: "../assets/img/villas/villa-aqua-living-06.webp",
          alt: "A living area at Villa Aqua — photo 3", altEs: "Una sala en Villa Aqua — foto 3" },
        { src: "../assets/img/villas/villa-aqua-living-07.webp",
          alt: "A living area at Villa Aqua — photo 4", altEs: "Una sala en Villa Aqua — foto 4" },
        { src: "../assets/img/villas/villa-aqua-living-08.webp",
          alt: "A living area at Villa Aqua — photo 5", altEs: "Una sala en Villa Aqua — foto 5" },
        { src: "../assets/img/villas/villa-aqua-living-09.webp",
          alt: "A living area at Villa Aqua — photo 6", altEs: "Una sala en Villa Aqua — foto 6" },
        { src: "../assets/img/villas/villa-aqua-living-10.webp",
          alt: "A living area at Villa Aqua — photo 7", altEs: "Una sala en Villa Aqua — foto 7" },
        { src: "../assets/img/villas/villa-aqua-living-11.webp",
          alt: "The reading nook, with a wall of design and architecture books", altEs: "El rincón de lectura, con un muro de libros de diseño y arquitectura" },
        { src: "../assets/img/villas/villa-aqua-living-12.webp",
          alt: "A second, more casual living room in coral and cream tones", altEs: "Una segunda sala, más informal, en tonos coral y crema" },
        { src: "../assets/img/villas/villa-aqua-living-13.webp",
          alt: "A living area at Villa Aqua — photo 8", altEs: "Una sala en Villa Aqua — foto 8" },
        { src: "../assets/img/villas/villa-aqua-living-14.webp",
          alt: "The second living room, opening onto its own dining nook and bar", altEs: "La segunda sala, conectada con su propio rincón de comedor y bar" },
        { src: "../assets/img/villas/villa-aqua-living-15.webp",
          alt: "A living area at Villa Aqua — photo 9", altEs: "Una sala en Villa Aqua — foto 9" },
        { src: "../assets/img/villas/villa-aqua-living-16.webp",
          alt: "A living area at Villa Aqua — photo 10", altEs: "Una sala en Villa Aqua — foto 10" },
        { src: "../assets/img/villas/villa-aqua-living-17.webp",
          alt: "A living area at Villa Aqua — photo 11", altEs: "Una sala en Villa Aqua — foto 11" },
        { src: "../assets/img/villas/villa-aqua-living-18.webp",
          alt: "A living area at Villa Aqua — photo 12", altEs: "Una sala en Villa Aqua — foto 12" },
        { src: "../assets/img/villas/villa-aqua-living-19.webp",
          alt: "A living area at Villa Aqua — photo 13", altEs: "Una sala en Villa Aqua — foto 13" },
        { src: "../assets/img/villas/villa-aqua-living-20.webp",
          alt: "A living area at Villa Aqua — photo 14", altEs: "Una sala en Villa Aqua — foto 14" },
        { src: "../assets/img/villas/villa-aqua-living-21.webp",
          alt: "A living area at Villa Aqua — photo 15", altEs: "Una sala en Villa Aqua — foto 15" },
        { src: "../assets/img/villas/villa-aqua-living-22.webp",
          alt: "A living area at Villa Aqua — photo 16", altEs: "Una sala en Villa Aqua — foto 16" }
      ] },
      { key: "kitchen", images: [
        { src: "../assets/img/villas/villa-aqua-kitchen-01.webp",
          alt: "The curved dining room overlooking the pool and gardens", altEs: "El comedor curvo con vista a la alberca y los jardines" },
        { src: "../assets/img/villas/villa-aqua-kitchen-02.webp",
          alt: "Villa Aqua's chef plating breakfast for the table", altEs: "El chef de Villa Aqua sirviendo el desayuno en la mesa" },
        { src: "../assets/img/villas/villa-aqua-kitchen-03.webp",
          alt: "The formal dining table, set for twelve with garden views", altEs: "La mesa de comedor formal, puesta para doce con vista al jardín" },
        { src: "../assets/img/villas/villa-aqua-kitchen-04.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 1", altEs: "La cocina y el comedor en Villa Aqua — foto 1" },
        { src: "../assets/img/villas/villa-aqua-kitchen-05.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 2", altEs: "La cocina y el comedor en Villa Aqua — foto 2" },
        { src: "../assets/img/villas/villa-aqua-kitchen-06.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 3", altEs: "La cocina y el comedor en Villa Aqua — foto 3" },
        { src: "../assets/img/villas/villa-aqua-kitchen-07.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 4", altEs: "La cocina y el comedor en Villa Aqua — foto 4" },
        { src: "../assets/img/villas/villa-aqua-kitchen-08.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 5", altEs: "La cocina y el comedor en Villa Aqua — foto 5" },
        { src: "../assets/img/villas/villa-aqua-kitchen-09.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 6", altEs: "La cocina y el comedor en Villa Aqua — foto 6" },
        { src: "../assets/img/villas/villa-aqua-kitchen-10.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 7", altEs: "La cocina y el comedor en Villa Aqua — foto 7" },
        { src: "../assets/img/villas/villa-aqua-kitchen-11.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 8", altEs: "La cocina y el comedor en Villa Aqua — foto 8" },
        { src: "../assets/img/villas/villa-aqua-kitchen-12.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 9", altEs: "La cocina y el comedor en Villa Aqua — foto 9" },
        { src: "../assets/img/villas/villa-aqua-kitchen-13.webp",
          alt: "The built-in ovens and microwave, framed by teak cabinetry", altEs: "Los hornos empotrados y el microondas, enmarcados por gabinetes de teca" },
        { src: "../assets/img/villas/villa-aqua-kitchen-14.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 10", altEs: "La cocina y el comedor en Villa Aqua — foto 10" },
        { src: "../assets/img/villas/villa-aqua-kitchen-15.webp",
          alt: "The chef's kitchen, in cheerful lime green with a marble island", altEs: "La cocina del chef, en verde lima alegre con isla de mármol" },
        { src: "../assets/img/villas/villa-aqua-kitchen-16.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 11", altEs: "La cocina y el comedor en Villa Aqua — foto 11" },
        { src: "../assets/img/villas/villa-aqua-kitchen-17.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 12", altEs: "La cocina y el comedor en Villa Aqua — foto 12" },
        { src: "../assets/img/villas/villa-aqua-kitchen-18.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 13", altEs: "La cocina y el comedor en Villa Aqua — foto 13" },
        { src: "../assets/img/villas/villa-aqua-kitchen-19.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 14", altEs: "La cocina y el comedor en Villa Aqua — foto 14" },
        { src: "../assets/img/villas/villa-aqua-kitchen-20.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 15", altEs: "La cocina y el comedor en Villa Aqua — foto 15" },
        { src: "../assets/img/villas/villa-aqua-kitchen-21.webp",
          alt: "The kitchen island, with bar stools for casual breakfasts", altEs: "La isla de cocina, con banquitos para desayunos informales" },
        { src: "../assets/img/villas/villa-aqua-kitchen-22.webp",
          alt: "The second wet bar, glassware ready for cocktail hour", altEs: "El segundo bar húmedo, con cristalería lista para la hora del cóctel" },
        { src: "../assets/img/villas/villa-aqua-kitchen-23.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 16", altEs: "La cocina y el comedor en Villa Aqua — foto 16" },
        { src: "../assets/img/villas/villa-aqua-kitchen-24.webp",
          alt: "The kitchen and dining area at Villa Aqua — photo 17", altEs: "La cocina y el comedor en Villa Aqua — foto 17" },
        { src: "../assets/img/villas/villa-aqua-kitchen-25.webp",
          alt: "Cocktails lined up at the bar, ready for the evening", altEs: "Cocteles alineados en la barra, listos para la noche" }
      ] },
      { key: "rooms", images: [
        { src: "../assets/img/villas/villa-aqua-rooms-01.webp",
          alt: "A bedroom suite with its own sitting area beneath a brick dome ceiling", altEs: "Una suite con sala de estar propia bajo un techo abovedado de ladrillo" },
        { src: "../assets/img/villas/villa-aqua-rooms-02.webp",
          alt: "The private terrace off one of the bedroom suites", altEs: "La terraza privada de una de las suites" },
        { src: "../assets/img/villas/villa-aqua-rooms-03.webp",
          alt: "The bedroom's lounge corner, facing the pool through floor-to-ceiling glass", altEs: "El rincón de descanso de la recámara, frente a la alberca a través de ventanales de piso a techo" },
        { src: "../assets/img/villas/villa-aqua-rooms-04.webp",
          alt: "A bedroom at Villa Aqua — photo 1", altEs: "Una recámara en Villa Aqua — foto 1" },
        { src: "../assets/img/villas/villa-aqua-rooms-05.webp",
          alt: "A bedroom at Villa Aqua — photo 2", altEs: "Una recámara en Villa Aqua — foto 2" },
        { src: "../assets/img/villas/villa-aqua-rooms-06.webp",
          alt: "A bedroom at Villa Aqua — photo 3", altEs: "Una recámara en Villa Aqua — foto 3" },
        { src: "../assets/img/villas/villa-aqua-rooms-07.webp",
          alt: "A bedroom at Villa Aqua — photo 4", altEs: "Una recámara en Villa Aqua — foto 4" },
        { src: "../assets/img/villas/villa-aqua-rooms-08.webp",
          alt: "A bedroom at Villa Aqua — photo 5", altEs: "Una recámara en Villa Aqua — foto 5" },
        { src: "../assets/img/villas/villa-aqua-rooms-09.webp",
          alt: "A bedroom at Villa Aqua — photo 6", altEs: "Una recámara en Villa Aqua — foto 6" },
        { src: "../assets/img/villas/villa-aqua-rooms-10.webp",
          alt: "A bedroom at Villa Aqua — photo 7", altEs: "Una recámara en Villa Aqua — foto 7" },
        { src: "../assets/img/villas/villa-aqua-rooms-11.webp",
          alt: "A bedroom at Villa Aqua — photo 8", altEs: "Una recámara en Villa Aqua — foto 8" },
        { src: "../assets/img/villas/villa-aqua-rooms-12.webp",
          alt: "A bedroom at Villa Aqua — photo 9", altEs: "Una recámara en Villa Aqua — foto 9" },
        { src: "../assets/img/villas/villa-aqua-rooms-13.webp",
          alt: "A bedroom at Villa Aqua — photo 10", altEs: "Una recámara en Villa Aqua — foto 10" },
        { src: "../assets/img/villas/villa-aqua-rooms-14.webp",
          alt: "A bedroom at Villa Aqua — photo 11", altEs: "Una recámara en Villa Aqua — foto 11" },
        { src: "../assets/img/villas/villa-aqua-rooms-15.webp",
          alt: "A bedroom at Villa Aqua — photo 12", altEs: "Una recámara en Villa Aqua — foto 12" },
        { src: "../assets/img/villas/villa-aqua-rooms-16.webp",
          alt: "A bedroom at Villa Aqua — photo 13", altEs: "Una recámara en Villa Aqua — foto 13" },
        { src: "../assets/img/villas/villa-aqua-rooms-17.webp",
          alt: "A bedroom at Villa Aqua — photo 14", altEs: "Una recámara en Villa Aqua — foto 14" },
        { src: "../assets/img/villas/villa-aqua-rooms-18.webp",
          alt: "A bedroom at Villa Aqua — photo 15", altEs: "Una recámara en Villa Aqua — foto 15" },
        { src: "../assets/img/villas/villa-aqua-rooms-19.webp",
          alt: "A bedroom at Villa Aqua — photo 16", altEs: "Una recámara en Villa Aqua — foto 16" },
        { src: "../assets/img/villas/villa-aqua-rooms-20.webp",
          alt: "A bedroom at Villa Aqua — photo 17", altEs: "Una recámara en Villa Aqua — foto 17" },
        { src: "../assets/img/villas/villa-aqua-rooms-21.webp",
          alt: "A bedroom at Villa Aqua — photo 18", altEs: "Una recámara en Villa Aqua — foto 18" },
        { src: "../assets/img/villas/villa-aqua-rooms-22.webp",
          alt: "A bedroom at Villa Aqua — photo 19", altEs: "Una recámara en Villa Aqua — foto 19" },
        { src: "../assets/img/villas/villa-aqua-rooms-23.webp",
          alt: "A bedroom at Villa Aqua — photo 20", altEs: "Una recámara en Villa Aqua — foto 20" },
        { src: "../assets/img/villas/villa-aqua-rooms-24.webp",
          alt: "A bedroom at Villa Aqua — photo 21", altEs: "Una recámara en Villa Aqua — foto 21" },
        { src: "../assets/img/villas/villa-aqua-rooms-25.webp",
          alt: "A bedroom at Villa Aqua — photo 22", altEs: "Una recámara en Villa Aqua — foto 22" },
        { src: "../assets/img/villas/villa-aqua-rooms-26.webp",
          alt: "A bedroom at Villa Aqua — photo 23", altEs: "Una recámara en Villa Aqua — foto 23" },
        { src: "../assets/img/villas/villa-aqua-rooms-27.webp",
          alt: "A bedroom at Villa Aqua — photo 24", altEs: "Una recámara en Villa Aqua — foto 24" },
        { src: "../assets/img/villas/villa-aqua-rooms-28.webp",
          alt: "A bedroom at Villa Aqua — photo 25", altEs: "Una recámara en Villa Aqua — foto 25" },
        { src: "../assets/img/villas/villa-aqua-rooms-29.webp",
          alt: "A bedroom at Villa Aqua — photo 26", altEs: "Una recámara en Villa Aqua — foto 26" },
        { src: "../assets/img/villas/villa-aqua-rooms-30.webp",
          alt: "An ensuite bathroom shower at Villa Aqua", altEs: "Una regadera del baño en Villa Aqua" },
        { src: "../assets/img/villas/villa-aqua-rooms-31.webp",
          alt: "A bedroom at Villa Aqua — photo 28", altEs: "Una recámara en Villa Aqua — foto 28" },
        { src: "../assets/img/villas/villa-aqua-rooms-32.webp",
          alt: "A bedroom at Villa Aqua — photo 29", altEs: "Una recámara en Villa Aqua — foto 29" },
        { src: "../assets/img/villas/villa-aqua-rooms-33.webp",
          alt: "A bedroom at Villa Aqua — photo 30", altEs: "Una recámara en Villa Aqua — foto 30" },
        { src: "../assets/img/villas/villa-aqua-rooms-34.webp",
          alt: "A bedroom at Villa Aqua — photo 31", altEs: "Una recámara en Villa Aqua — foto 31" },
        { src: "../assets/img/villas/villa-aqua-rooms-35.webp",
          alt: "A bedroom at Villa Aqua — photo 32", altEs: "Una recámara en Villa Aqua — foto 32" },
        { src: "../assets/img/villas/villa-aqua-rooms-36.webp",
          alt: "A bedroom at Villa Aqua — photo 33", altEs: "Una recámara en Villa Aqua — foto 33" },
        { src: "../assets/img/villas/villa-aqua-rooms-37.webp",
          alt: "A bedroom at Villa Aqua — photo 34", altEs: "Una recámara en Villa Aqua — foto 34" },
        { src: "../assets/img/villas/villa-aqua-rooms-38.webp",
          alt: "A bedroom at Villa Aqua — photo 35", altEs: "Una recámara en Villa Aqua — foto 35" },
        { src: "../assets/img/villas/villa-aqua-rooms-39.webp",
          alt: "A bedroom at Villa Aqua — photo 36", altEs: "Una recámara en Villa Aqua — foto 36" },
        { src: "../assets/img/villas/villa-aqua-rooms-40.webp",
          alt: "A twin bedroom, bright and colorful with local artwork", altEs: "Una recámara con camas gemelas, luminosa y colorida con arte local" },
        { src: "../assets/img/villas/villa-aqua-rooms-41.webp",
          alt: "A bedroom at Villa Aqua — photo 37", altEs: "Una recámara en Villa Aqua — foto 37" },
        { src: "../assets/img/villas/villa-aqua-rooms-42.webp",
          alt: "A bedroom at Villa Aqua — photo 38", altEs: "Una recámara en Villa Aqua — foto 38" },
        { src: "../assets/img/villas/villa-aqua-rooms-43.webp",
          alt: "A bedroom at Villa Aqua — photo 39", altEs: "Una recámara en Villa Aqua — foto 39" },
        { src: "../assets/img/villas/villa-aqua-rooms-44.webp",
          alt: "A bedroom at Villa Aqua — photo 40", altEs: "Una recámara en Villa Aqua — foto 40" },
        { src: "../assets/img/villas/villa-aqua-rooms-45.webp",
          alt: "A bedroom at Villa Aqua — photo 41", altEs: "Una recámara en Villa Aqua — foto 41" },
        { src: "../assets/img/villas/villa-aqua-rooms-46.webp",
          alt: "A bedroom at Villa Aqua — photo 42", altEs: "Una recámara en Villa Aqua — foto 42" },
        { src: "../assets/img/villas/villa-aqua-rooms-47.webp",
          alt: "A bedroom at Villa Aqua — photo 43", altEs: "Una recámara en Villa Aqua — foto 43" },
        { src: "../assets/img/villas/villa-aqua-rooms-48.webp",
          alt: "A bedroom at Villa Aqua — photo 44", altEs: "Una recámara en Villa Aqua — foto 44" },
        { src: "../assets/img/villas/villa-aqua-rooms-49.webp",
          alt: "A bedroom at Villa Aqua — photo 45", altEs: "Una recámara en Villa Aqua — foto 45" },
        { src: "../assets/img/villas/villa-aqua-rooms-50.webp",
          alt: "A bedroom at Villa Aqua — photo 46", altEs: "Una recámara en Villa Aqua — foto 46" },
        { src: "../assets/img/villas/villa-aqua-rooms-51.webp",
          alt: "A bathroom at Villa Aqua — photo 1", altEs: "Un baño en Villa Aqua — foto 1" },
        { src: "../assets/img/villas/villa-aqua-rooms-52.webp",
          alt: "A bathroom at Villa Aqua — photo 2", altEs: "Un baño en Villa Aqua — foto 2" },
        { src: "../assets/img/villas/villa-aqua-rooms-53.webp",
          alt: "A freestanding soaking tub on a screened terrace, framed by the jungle", altEs: "Una tina independiente en una terraza cerrada, enmarcada por la selva" },
        { src: "../assets/img/villas/villa-aqua-rooms-54.webp",
          alt: "A bathroom at Villa Aqua — photo 3", altEs: "Un baño en Villa Aqua — foto 3" },
        { src: "../assets/img/villas/villa-aqua-rooms-55.webp",
          alt: "A bathroom at Villa Aqua — photo 4", altEs: "Un baño en Villa Aqua — foto 4" },
        { src: "../assets/img/villas/villa-aqua-rooms-56.webp",
          alt: "A bathroom at Villa Aqua — photo 5", altEs: "Un baño en Villa Aqua — foto 5" },
        { src: "../assets/img/villas/villa-aqua-rooms-57.webp",
          alt: "A bathroom at Villa Aqua — photo 6", altEs: "Un baño en Villa Aqua — foto 6" },
        { src: "../assets/img/villas/villa-aqua-rooms-58.webp",
          alt: "A bathroom at Villa Aqua — photo 7", altEs: "Un baño en Villa Aqua — foto 7" },
        { src: "../assets/img/villas/villa-aqua-rooms-59.webp",
          alt: "A bathroom at Villa Aqua — photo 8", altEs: "Un baño en Villa Aqua — foto 8" },
        { src: "../assets/img/villas/villa-aqua-rooms-60.webp",
          alt: "A bathroom at Villa Aqua — photo 9", altEs: "Un baño en Villa Aqua — foto 9" },
        { src: "../assets/img/villas/villa-aqua-rooms-61.webp",
          alt: "A bathroom at Villa Aqua — photo 10", altEs: "Un baño en Villa Aqua — foto 10" },
        { src: "../assets/img/villas/villa-aqua-rooms-62.webp",
          alt: "A walk-in rain shower, dressed in handmade terracotta tile", altEs: "Una regadera de lluvia, vestida con azulejo de terracota hecho a mano" },
        { src: "../assets/img/villas/villa-aqua-rooms-63.webp",
          alt: "A bathroom at Villa Aqua — photo 11", altEs: "Un baño en Villa Aqua — foto 11" },
        { src: "../assets/img/villas/villa-aqua-rooms-64.webp",
          alt: "A bathroom at Villa Aqua — photo 12", altEs: "Un baño en Villa Aqua — foto 12" },
        { src: "../assets/img/villas/villa-aqua-rooms-65.webp",
          alt: "A bathroom at Villa Aqua — photo 13", altEs: "Un baño en Villa Aqua — foto 13" },
        { src: "../assets/img/villas/villa-aqua-rooms-66.webp",
          alt: "A bathroom at Villa Aqua — photo 14", altEs: "Un baño en Villa Aqua — foto 14" },
        { src: "../assets/img/villas/villa-aqua-rooms-67.webp",
          alt: "A bathroom at Villa Aqua — photo 15", altEs: "Un baño en Villa Aqua — foto 15" },
        { src: "../assets/img/villas/villa-aqua-rooms-68.webp",
          alt: "A bathroom at Villa Aqua — photo 16", altEs: "Un baño en Villa Aqua — foto 16" },
        { src: "../assets/img/villas/villa-aqua-rooms-69.webp",
          alt: "A bathroom at Villa Aqua — photo 17", altEs: "Un baño en Villa Aqua — foto 17" },
        { src: "../assets/img/villas/villa-aqua-rooms-70.webp",
          alt: "A bathroom at Villa Aqua — photo 18", altEs: "Un baño en Villa Aqua — foto 18" },
        { src: "../assets/img/villas/villa-aqua-rooms-71.webp",
          alt: "A bathroom at Villa Aqua — photo 19", altEs: "Un baño en Villa Aqua — foto 19" },
        { src: "../assets/img/villas/villa-aqua-rooms-72.webp",
          alt: "A bathroom at Villa Aqua — photo 20", altEs: "Un baño en Villa Aqua — foto 20" },
        { src: "../assets/img/villas/villa-aqua-rooms-73.webp",
          alt: "A bathroom at Villa Aqua — photo 21", altEs: "Un baño en Villa Aqua — foto 21" },
        { src: "../assets/img/villas/villa-aqua-rooms-74.webp",
          alt: "A bathroom at Villa Aqua — photo 22", altEs: "Un baño en Villa Aqua — foto 22" },
        { src: "../assets/img/villas/villa-aqua-rooms-75.webp",
          alt: "A bathroom at Villa Aqua — photo 23", altEs: "Un baño en Villa Aqua — foto 23" },
        { src: "../assets/img/villas/villa-aqua-rooms-76.webp",
          alt: "A bathroom at Villa Aqua — photo 24", altEs: "Un baño en Villa Aqua — foto 24" },
        { src: "../assets/img/villas/villa-aqua-rooms-77.webp",
          alt: "A robe, monogrammed with the Villa Aqua crest, ready for guests", altEs: "Una bata, bordada con el emblema de Villa Aqua, lista para los huéspedes" },
        { src: "../assets/img/villas/villa-aqua-rooms-78.webp",
          alt: "A bathroom at Villa Aqua — photo 25", altEs: "Un baño en Villa Aqua — foto 25" },
        { src: "../assets/img/villas/villa-aqua-rooms-79.webp",
          alt: "A bathroom vanity with rainforest views at Villa Aqua", altEs: "Un tocador con vista a la selva en Villa Aqua" },
        { src: "../assets/img/villas/villa-aqua-rooms-80.webp",
          alt: "A bathroom at Villa Aqua — photo 26", altEs: "Un baño en Villa Aqua — foto 26" }
      ],
        // Per-bedroom split for the room picker — fill with image indices (into `images` above) once each bedroom's photos are sorted; empty arrays fall back to the full "rooms" list.
        roomImages: [[], [], [], [], [], []]
      },
      { key: "interiors", images: [
        { src: "../assets/img/villas/villa-aqua-interiors-01.webp",
          alt: "The entrance hall beneath the sweeping spiral staircase", altEs: "El vestíbulo de entrada bajo la escalera de caracol" },
        { src: "../assets/img/villas/villa-aqua-interiors-02.webp",
          alt: "The foyer, with its wooden front door and rock garden light well", altEs: "El recibidor, con la puerta de madera principal y el jardín de rocas iluminado" },
        { src: "../assets/img/villas/villa-aqua-interiors-03.webp",
          alt: "The laundry room, fully equipped for longer stays", altEs: "El cuarto de lavado, totalmente equipado para estancias largas" }
      ] },
      { key: "multipurpose", images: [
        { src: "../assets/img/villas/villa-aqua-multipurpose-01.webp",
          alt: "The private squash court", altEs: "La cancha de squash privada" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-02.webp",
          alt: "A second angle of the squash and games room, with a ping-pong table and basketball hoop", altEs: "Otro ángulo de la cancha de squash y sala de juegos, con mesa de ping-pong y aro de básquetbol" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-03.webp",
          alt: "The gym at Villa Aqua — photo 1", altEs: "El gimnasio en Villa Aqua — foto 1" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-04.webp",
          alt: "The gym at Villa Aqua — photo 2", altEs: "El gimnasio en Villa Aqua — foto 2" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-05.webp",
          alt: "The gym at Villa Aqua — photo 3", altEs: "El gimnasio en Villa Aqua — foto 3" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-06.webp",
          alt: "The gym at Villa Aqua — photo 4", altEs: "El gimnasio en Villa Aqua — foto 4" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-07.webp",
          alt: "The gym at Villa Aqua — photo 5", altEs: "El gimnasio en Villa Aqua — foto 5" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-08.webp",
          alt: "The gym at Villa Aqua — photo 6", altEs: "El gimnasio en Villa Aqua — foto 6" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-09.webp",
          alt: "The gym at Villa Aqua — photo 7", altEs: "El gimnasio en Villa Aqua — foto 7" },
        { src: "../assets/img/villas/villa-aqua-multipurpose-10.webp",
          alt: "The gym at Villa Aqua — photo 8", altEs: "El gimnasio en Villa Aqua — foto 8" }
      ] }
    ],
    /* First 5 faqs are the curated "most important" set shown in the
       villa-detail FAQ showcase; the rest appear in the scrollable
       "more questions" panel when a visitor clicks to expand it (see
       main.js FAQ_PREVIEW_COUNT). Order matters — keep the top 5 first. */
    faqs: [
      {
        q: { en: "How many guests can Villa Aqua accommodate?", es: "¿Cuántos huéspedes puede alojar Villa Aqua?" },
        a: { en: "Villa Aqua accommodates up to 18 guests across 6 bedrooms, ideal for families, groups of friends and special celebrations.", es: "Villa Aqua recibe hasta 18 huéspedes en 6 recámaras, ideal para familias, grupos de amigos y celebraciones especiales." }
      },
      {
        q: { en: "Where is Villa Aqua located, and how far are the beach, Fifth Avenue and the airport?", es: "¿Dónde está ubicada Villa Aqua y qué tan lejos están la playa, Quinta Avenida y el aeropuerto?" },
        a: { en: "Villa Aqua is located in Playacar Phase II, Playa del Carmen, a private, gated community with 24/7 security, known for its peaceful atmosphere and its bike paths and walking routes around the golf course. It sits in a lush, quiet setting close to downtown Playa del Carmen. The beach is about 15 minutes on foot or 5 minutes by car, Quinta Avenida is about 20 minutes on foot or 5 minutes by car, and Cancun International Airport (CUN) is roughly 45 minutes to 1 hour 15 minutes by car depending on traffic.", es: "Villa Aqua está ubicada en Playacar Fase II, Playa del Carmen, un fraccionamiento privado con seguridad 24/7, conocido por su ambiente tranquilo y por su ciclopista y rutas para caminar alrededor del campo de golf. Se encuentra en un entorno frondoso y tranquilo, cerca del centro de Playa del Carmen. La playa está a unos 15 minutos caminando o 5 en coche, Quinta Avenida a unos 20 minutos caminando o 5 en coche, y el Aeropuerto Internacional de Cancún (CUN) está entre 45 minutos y 1 hora 15 minutos en coche según el tráfico." }
      },
      {
        q: { en: "What services are included, and what happens when we arrive?", es: "¿Qué servicios están incluidos y qué pasa cuando llegamos?" },
        a: { en: "Villa Aqua includes a concierge available by phone and WhatsApp 24/7, daily housekeeping, private chef and bartender/butler service, maintenance support and welcome amenities. Your concierge meets you at the villa, shows you around, explains the house guidelines and helps you settle in, with a welcome snack and refreshing drinks waiting for you. Beyond check-in, the concierge stays available in person during the day and by phone or WhatsApp around the clock, and can arrange transportation, restaurant reservations, excursions, spa treatments and special celebrations.", es: "Villa Aqua incluye un concierge disponible por teléfono y WhatsApp 24/7, housekeeping diario, servicio de chef privado y bartender/mayordomo, soporte de mantenimiento y amenidades de bienvenida. Tu concierge te recibe en la villa, te muestra el lugar, explica las reglas de la casa y te ayuda a instalarte, con un snack de bienvenida y bebidas refrescantes esperándote. Además del check-in, el concierge sigue disponible en persona durante el día y por teléfono o WhatsApp las 24 horas, y puede coordinar transporte, reservaciones de restaurantes, excursiones, tratamientos de spa y celebraciones especiales." }
      },
      {
        q: { en: "Does Villa Aqua have a pool and jacuzzi, and are they heated?", es: "¿Villa Aqua tiene alberca y jacuzzi, y están climatizados?" },
        a: { en: "Yes, a large private swimming pool approximately 1.10 meters (3.6 feet) deep. The pool is not heated, though its temperature is generally pleasant year-round, including winter months. There's also a heated jacuzzi that accommodates up to 10 guests.", es: "Sí, una gran alberca privada de aproximadamente 1.10 metros de profundidad. La alberca no está climatizada, aunque su temperatura suele ser agradable todo el año, incluyendo el invierno. También hay un jacuzzi climatizado con capacidad para hasta 10 personas." }
      },
      {
        q: { en: "What payment methods do you accept, and what is the cancellation policy?", es: "¿Qué métodos de pago aceptan y cuál es la política de cancelación?" },
        a: { en: "We accept wire transfer or credit card, in USD or MXN. Reservations are fully refundable up to 60 days before arrival. From 59 to 45 days before arrival, a 50% cancellation penalty applies. Reservations cancelled 44 days or less before arrival are non-refundable.", es: "Aceptamos transferencia bancaria o tarjeta de crédito, en USD o MXN. Las reservaciones son totalmente reembolsables hasta 60 días antes de la llegada. De 59 a 45 días antes de la llegada, aplica una penalización de cancelación del 50%. Las reservaciones canceladas 44 días o menos antes de la llegada no son reembolsables." }
      },
      {
        q: { en: "What is the bedroom and bed configuration?", es: "¿Cuál es la configuración de recámaras y camas?" },
        a: { en: "Villa Aqua has six bedrooms. The master bedroom has 1 king bed, Bedroom 2 has 2 double beds, Bedroom 3 has 2 double beds, Bedroom 4 has 1 king bed plus 2 twin pull-out beds, Bedroom 5 has 1 king bed, and Bedroom 6 has 1 king bed. Two baby cribs are available on request.", es: "Villa Aqua tiene seis recámaras. La recámara principal tiene 1 cama king, la Recámara 2 tiene 2 camas matrimoniales, la Recámara 3 tiene 2 camas matrimoniales, la Recámara 4 tiene 1 cama king más 2 camas individuales plegables, la Recámara 5 tiene 1 cama king y la Recámara 6 tiene 1 cama king. Dos cunas están disponibles bajo solicitud." }
      },
      {
        q: { en: "Is Villa Aqua suitable for families and groups of friends?", es: "¿Villa Aqua es adecuada para familias con niños y grupos de amigos?" },
        a: { en: "Both. Villa Aqua is very family-friendly, with spacious indoor and outdoor areas for children, though young children should always be supervised given the stairs and several water features. It's also well suited for groups of friends, with generous communal spaces. Bachelor and bachelorette groups are welcome with prior approval and must follow the villa's house rules.", es: "Para ambos. Villa Aqua es muy familiar, con amplias áreas interiores y exteriores para niños, aunque los niños pequeños siempre deben estar supervisados por las escaleras y varias zonas de agua. También es ideal para grupos de amigos, con generosos espacios comunes. Los grupos de despedida de soltero o soltera son bienvenidos con aprobación previa y deben seguir las reglas de la casa." }
      },
      {
        q: { en: "Is airport transportation included?", es: "¿El transporte de aeropuerto está incluido?" },
        a: { en: "Yes, for stays of 4 nights or more, for the confirmed number of guests, provided everyone travels together in the same vehicle and arrives/departs at the same time. Guests may choose one round-trip transfer to/from Cancun International Airport (CUN) or one one-way transfer to/from Tulum International Airport (TQO). Additional transfers, separate arrival/departure times, or transport for guests traveling separately can be arranged for an extra cost.", es: "Sí, para estancias de 4 noches o más, para el número confirmado de huéspedes, siempre que todos viajen juntos en el mismo vehículo y lleguen/salgan al mismo tiempo. Los huéspedes pueden elegir un traslado redondo hacia/desde el Aeropuerto Internacional de Cancún (CUN) o un traslado sencillo hacia/desde el Aeropuerto Internacional de Tulum (TQO). Traslados adicionales, horarios de llegada/salida distintos, o transporte para huéspedes que viajen por separado se pueden coordinar con un costo extra." }
      },
      {
        q: { en: "What time is check-in and check-out?", es: "¿A qué hora son el check-in y el check-out?" },
        a: { en: "Check-in is at 3:00 PM and check-out at 11:00 AM. Early check-in and late check-out may be available depending on occupancy and availability.", es: "El check-in es a las 3:00 PM y el check-out a las 11:00 AM. Puede haber check-in anticipado o check-out tardío según disponibilidad y ocupación." }
      },
      {
        q: { en: "Is a private chef included, and can dietary needs (including kosher) be accommodated?", es: "¿El chef privado está incluido y se pueden atender necesidades dietéticas (incluyendo kosher)?" },
        a: { en: "Yes, private chef service is included from 8:00 AM to 4:00 PM, covering breakfast and lunch preparation; dinner and additional chef hours are available at extra cost. Groceries are not included, but our team can coordinate shopping and delivery for a fee. We can accommodate most dietary preferences, including vegetarian, vegan and gluten-free, with advance notice. Kosher guests are welcome too; Villa Aqua is not a kosher villa, but special arrangements such as kitchen kosherization, specialized equipment or a kosher chef can be coordinated at an additional cost.", es: "Sí, el servicio de chef privado está incluido de 8:00 AM a 4:00 PM, cubriendo la preparación de desayuno y comida; la cena y horas adicionales de chef tienen costo extra. Los ingredientes y la despensa no están incluidos, pero nuestro equipo puede coordinar la compra y entrega por una tarifa. Podemos atender la mayoría de preferencias dietéticas, incluyendo vegetariano, vegano y sin gluten, con aviso previo. También recibimos huéspedes kosher; Villa Aqua no es una villa kosher, pero se pueden coordinar arreglos especiales como kosherización de cocina, equipo especializado o chef kosher, con costo adicional." }
      },
      {
        q: { en: "What other amenities does Villa Aqua offer?", es: "¿Qué otras amenidades ofrece Villa Aqua?" },
        a: { en: "A private gym, private squash court, large outdoor living areas, gas BBQ grill, Argentine charcoal grill, wood-fired pizza oven, sunken trampoline, SONOS/Bose sound system indoors and outdoors, high-speed Wi-Fi, air conditioning throughout, beach towels, safes in every bedroom and hair dryers in every bathroom.", es: "Gimnasio privado, cancha de squash privada, amplias áreas de convivencia al aire libre, asador de gas, asador de carbón estilo argentino, horno de pizza de leña, trampolín hundido, sistema de sonido SONOS/Bose interior y exterior, Wi-Fi de alta velocidad, aire acondicionado en toda la villa, toallas de playa, cajas fuertes en cada recámara y secadoras de cabello en cada baño." }
      },
      {
        q: { en: "Is there parking, laundry and baby equipment?", es: "¿Hay estacionamiento, lavandería y equipo para bebés?" },
        a: { en: "Yes, all three. There's covered parking for 2 cars plus 2 additional open-air spaces, a washer and dryer available for guest use after housekeeping hours (at guests' own risk), and 2 baby cribs plus 2 high chairs available on request.", es: "Sí, a los tres. Hay estacionamiento techado para 2 autos más 2 espacios adicionales al aire libre, lavadora y secadora disponibles para uso de los huéspedes fuera del horario de housekeeping (bajo su propio riesgo), y 2 cunas más 2 sillas altas disponibles bajo solicitud." }
      },
      {
        q: { en: "Is there a beach club nearby, and what about sargassum?", es: "¿Hay un beach club cerca y qué pasa si hay sargazo?" },
        a: { en: "Yes, The Reef Beach Club is located within Playacar Phase II and offers day passes; our concierge can also arrange visits to other beach clubs. Sargassum is a natural seasonal phenomenon in the Caribbean, and beach conditions vary by season, but since Villa Aqua isn't directly on the beach, it doesn't affect your experience at the villa itself. The Riviera Maya also offers plenty beyond the beach, including cenotes, ruins and adventure parks.", es: "Sí, The Reef Beach Club está dentro de Playacar Fase II y ofrece pases de día; nuestro concierge también puede coordinar visitas a otros beach clubs. El sargazo es un fenómeno estacional natural del Caribe y las condiciones de playa varían según la temporada, pero como Villa Aqua no está directamente sobre la playa, esto no afecta tu experiencia en la villa. La Riviera Maya también ofrece mucho más allá de la playa, incluyendo cenotes, ruinas y parques de aventura." }
      },
      {
        q: { en: "What is there to do near Villa Aqua?", es: "¿Qué se puede hacer cerca de Villa Aqua?" },
        a: { en: "The Riviera Maya offers golf (Villa Aqua overlooks a green of the Hard Rock Playacar golf course, with more renowned courses nearby), Mayan archaeological sites (Tulum, Cobá, Chichén Itzá), adventure and family parks (Xcaret, Xplor, Xenses, Río Secreto, Nickelodeon, Xel-Há, Xoximilco, among others), cenotes and underground rivers, snorkeling, diving, yacht excursions, fishing, and shopping and dining at Quinta Avenida, Paseo del Carmen and Quinta Alegría in Playa del Carmen, or Premium Outlets and Luxury Avenue in Cancun. Our concierge team can help select and arrange experiences based on your group's interests.", es: "La Riviera Maya ofrece golf (Villa Aqua tiene vista a un green del campo de golf Hard Rock Playacar, con más campos reconocidos cerca), sitios arqueológicos mayas (Tulum, Cobá, Chichén Itzá), parques de aventura y familiares (Xcaret, Xplor, Xenses, Río Secreto, Nickelodeon, Xel-Há, Xoximilco, entre otros), cenotes y ríos subterráneos, esnórquel, buceo, excursiones en yate, pesca, y compras y gastronomía en Quinta Avenida, Paseo del Carmen y Quinta Alegría en Playa del Carmen, o Premium Outlets y Luxury Avenue en Cancún. Nuestro equipo de concierge puede ayudarte a elegir y coordinar experiencias según los intereses de tu grupo." }
      },
      {
        q: { en: "Can Villa Aqua host private events and weddings?", es: "¿Villa Aqua puede recibir eventos privados y bodas?" },
        a: { en: "Yes, Villa Aqua can host private events and weddings for up to 70 guests, subject to prior approval and the villa's event guidelines. The event fee covers use of the villa as the venue only; accommodation, catering, entertainment and additional event services are quoted separately. Guests staying 3 or more nights in connection with their event may receive a 20% discount on the event fee. Outside vendors may be permitted depending on the event type and logistics, but all vendors require prior approval.", es: "Sí, Villa Aqua puede recibir eventos privados y bodas para hasta 70 personas, sujeto a aprobación previa y a los lineamientos de eventos de la villa. La tarifa de evento cubre únicamente el uso de la villa como sede; hospedaje, catering, entretenimiento y servicios adicionales se cotizan por separado. Los huéspedes que se hospeden 3 noches o más en relación con su evento pueden recibir 20% de descuento en la tarifa de evento. Se pueden permitir proveedores externos según el tipo de evento y la logística, pero todos requieren aprobación previa." }
      },
      {
        q: { en: "Are pets allowed?", es: "¿Se aceptan mascotas?" },
        a: { en: "Pets may be accepted with prior approval, up to 2 pets with a maximum of 20 kg (44 lb) each. A pet fee applies depending on the type and size of the pet.", es: "Las mascotas pueden aceptarse con aprobación previa, hasta 2 mascotas con un máximo de 20 kg cada una. Aplica una tarifa según el tipo y tamaño de la mascota." }
      },
      {
        q: { en: "What are the important house rules?", es: "¿Cuáles son las reglas importantes de la casa?" },
        a: { en: "Villa Aqua is a non-smoking property, illegal drugs are prohibited, only registered guests may stay overnight, and quiet hours begin at 11:00 PM. A refundable $2,000 USD security deposit is required.", es: "Villa Aqua es una propiedad libre de humo, las drogas ilegales están prohibidas, solo los huéspedes registrados pueden pernoctar, y el horario de silencio comienza a las 11:00 PM. Se requiere un depósito de garantía reembolsable de $2,000 USD." }
      },
      {
        q: { en: "Can I change my dates, add guests, extend my stay, or get a returning-guest rate?", es: "¿Puedo cambiar mis fechas, agregar huéspedes, extender mi estancia u obtener una tarifa de huésped recurrente?" },
        a: { en: "Yes, in all of those cases. We'll always do our best to accommodate date changes subject to availability, and fees may apply. Guests can be added before or during your stay as long as you stay within the villa's maximum occupancy, and charges may apply. Extensions are welcome whenever availability allows, and we're happy to offer special rates to returning guests; just contact our team for details.", es: "Sí, en todos esos casos. Siempre haremos lo posible por acomodar cambios de fecha sujeto a disponibilidad, y pueden aplicar cargos. Se pueden agregar huéspedes antes o durante tu estancia mientras no se exceda la ocupación máxima de la villa, y pueden aplicar cargos adicionales. Las extensiones son bienvenidas cuando la disponibilidad lo permita, y con gusto ofrecemos tarifas especiales a huéspedes recurrentes; solo contacta a nuestro equipo para más detalles." }
      }
    ]
  },
  {
    slug: "kasa-kefi",
    name: "Kasa Kefi",
    destination: "valle-de-guadalupe",
    destinationLabel: "Valle de Guadalupe",
    destinationLabelEs: "Valle de Guadalupe",
    lat: 32.107065,
    lng: -116.5662757,
    googleMapsUrl: "https://www.google.com/maps/place/Kasa+Kefi,+Luxurious+Vineyard+Oasis+in+Kasa+Kava+Valle+d+Guadalupe/@32.1081276,-116.5731073,18z/data=!4m14!1m2!2m1!1sKasa+Kava+Valle+de+Guadalupe!3m10!1s0x80d8fa8e45ca2775:0xe24a0aa5abaee451!5m2!4m1!1i2!8m2!3d32.1081276!4d-116.5708542!15sChxLYXNhIEthdmEgVmFsbGUgZGUgR3VhZGFsdXBlkgEPdmFjYXRpb25fcmVudGFs4AEA!16s%2Fg%2F11z524ws2q!17BQ0FF",
    mapIcon: "assets/img/brand/kasa-kefi-icon.png",
    guests: 12,
    bedrooms: 4,
    hostawayListingId: 305921,
    // Live from Hostaway (hostaway-sync.js): lowest bookable nightly rate,
    // per-date minimum stay and booked nights. Empty until it lands, so
    // the site never shows a made-up price or booking.
    priceFromPerNight: null,
    availability: { minStay: null, minStayRanges: [], blockedRanges: [] },
    beds: 7,
    baths: 4.5,
    area: 400,
    featured: true,
    short: "Surrounded by vineyards in the heart of Valle de Guadalupe. Three suites have their own balcony with a fire pit to watch the sunset, glass of wine in hand, plus a studio with a full bathroom.",
    shortEs: "Rodeada de viñedos en el corazón del Valle de Guadalupe. Tres suites tienen su propio balcón con fogata para ver el atardecer con una copa de vino en mano, más un estudio con baño completo.",
    image: "assets/img/villas/kasa-kefi-outdoor-01.webp",
    imageAlt: "Aerial view of Kasa Kefi's concrete silhouette above the Valle de Guadalupe vineyards",
    imageAltEs: "Vista aérea de la silueta de concreto de Kasa Kefi sobre los viñedos del Valle de Guadalupe",
    showcaseImages: [
      { src: "assets/img/villas/kasa-kefi-outdoor-01.webp", alt: "Aerial view of Kasa Kefi's concrete silhouette above the Valle de Guadalupe vineyards", altEs: "Vista aérea de la silueta de concreto de Kasa Kefi sobre los viñedos del Valle de Guadalupe" },
      { src: "assets/img/villas/kasa-kefi-outdoor-02.webp", alt: "Kasa Kefi seen from above, set into the hillside among the vine rows", altEs: "Kasa Kefi vista desde el aire, asentada en la ladera entre las hileras de vid" },
      { src: "assets/img/villas/kasa-kefi-outdoor-04.webp", alt: "The plunge pool at Kasa Kefi overlooking the valley", altEs: "La alberca tipo plunge pool en Kasa Kefi con vista al valle" },
      { src: "assets/img/villas/kasa-kefi-outdoor-07.webp", alt: "The master suite terrace at Kasa Kefi at golden hour", altEs: "La terraza de la suite master en Kasa Kefi a la hora dorada" }
    ],
    amenities: [
      { en: "Jacuzzi", es: "Jacuzzi", cat: "outdoor" },
      { en: "Fire pit", es: "Fogata", cat: "outdoor" },
      { en: "High-Speed WiFi", es: "Wi-Fi de alta velocidad", cat: "comfort" },
      { en: "Air conditioning", es: "Aire acondicionado", cat: "comfort" },
      { en: "Smart TV", es: "Smart TV", cat: "comfort" },
      { en: "Fireplace", es: "Chimenea", cat: "comfort" },
      { en: "Outdoor grill", es: "Parrilla exterior", cat: "outdoor" },
      { en: "Sound system", es: "Sistema de sonido", cat: "comfort" }
    ],
    amenitiesMore: [
      { en: "Heating", es: "Calefacción", cat: "comfort" },
      { en: "Safe", es: "Caja fuerte", cat: "comfort" },
      { en: "Washing machine", es: "Lavadora", cat: "comfort" },
      { en: "Dryer", es: "Secadora", cat: "comfort" },
      { en: "Hair dryer", es: "Secadora de pelo", cat: "comfort" },
      { en: "Iron", es: "Plancha", cat: "comfort" },
      { en: "Room-darkening shades", es: "Cortinas blackout", cat: "comfort" },
      { en: "Board games", es: "Juegos de mesa", cat: "comfort" },
      { en: "Coffee/tea maker", es: "Cafetera/tetera", cat: "kitchen" },
      { en: "Toaster", es: "Tostador", cat: "kitchen" },
      { en: "Dishwasher", es: "Lavavajillas", cat: "kitchen" },
      { en: "Microwave", es: "Microondas", cat: "kitchen" },
      { en: "Oven", es: "Horno", cat: "kitchen" },
      { en: "Stove", es: "Estufa", cat: "kitchen" },
      { en: "Refrigerator", es: "Refrigerador", cat: "kitchen" },
      { en: "Electric kettle", es: "Hervidor eléctrico", cat: "kitchen" },
      { en: "Blender", es: "Licuadora", cat: "kitchen" },
      { en: "Garden / backyard", es: "Jardín / patio", cat: "outdoor" },
      { en: "Balcony", es: "Balcón", cat: "outdoor" },
      { en: "Private parking", es: "Estacionamiento privado", cat: "outdoor" }
    ],
    services: ["housekeeping", "concierge", "itinerary", "chef", "transfer", "spa", "grocery", "wine"],
    /* Real Kasa Kefi photography per service — see the note on Villa Aqua above. */
    serviceImages: {
      housekeeping: "../assets/img/villas/kasa-kefi-rooms-01.webp",
      itinerary: "../assets/img/villas/kasa-kefi-living-05.webp",
      chef: "../assets/img/villas/kasa-kefi-kitchen-01.webp",
      grocery: "../assets/img/villas/kasa-kefi-kitchen-02.webp",
      wine: "../assets/img/villas/kasa-kefi-living-09.webp"
    },
    gallery: [
      { key: "outdoor", images: [
        { src: "../assets/img/villas/kasa-kefi-outdoor-01.webp", alt: "Aerial view of Kasa Kefi", altEs: "Vista aérea de Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-02.webp", alt: "Aerial view of Kasa Kefi — photo 2", altEs: "Vista aérea de Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-03.webp", alt: "Aerial view of Kasa Kefi — photo 3", altEs: "Vista aérea de Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-04.webp", alt: "The plunge pool at Kasa Kefi", altEs: "La alberca tipo plunge pool en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-05.webp", alt: "The plunge pool at Kasa Kefi — photo 2", altEs: "La alberca tipo plunge pool en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-06.webp", alt: "The plunge pool at Kasa Kefi — photo 3", altEs: "La alberca tipo plunge pool en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-07.webp", alt: "The master suite terrace at Kasa Kefi", altEs: "La terraza de la suite master en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-08.webp", alt: "The master suite terrace at Kasa Kefi — photo 2", altEs: "La terraza de la suite master en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-09.webp", alt: "The master suite terrace at Kasa Kefi — photo 3", altEs: "La terraza de la suite master en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-outdoor-10.webp", alt: "The master suite terrace at Kasa Kefi — photo 4", altEs: "La terraza de la suite master en Kasa Kefi — foto 4" }
      ] },
      { key: "rooms", images: [
        { src: "../assets/img/villas/kasa-kefi-rooms-01.webp", alt: "The master suite bedroom at Kasa Kefi", altEs: "La recámara de la suite master en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-rooms-02.webp", alt: "The master suite bedroom at Kasa Kefi — photo 2", altEs: "La recámara de la suite master en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-rooms-03.webp", alt: "The master suite bedroom at Kasa Kefi — photo 3", altEs: "La recámara de la suite master en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-rooms-04.webp", alt: "Suite 2's bedroom at Kasa Kefi", altEs: "La recámara de la Suite 2 en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-rooms-05.webp", alt: "Suite 2's bedroom at Kasa Kefi — photo 2", altEs: "La recámara de la Suite 2 en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-rooms-06.webp", alt: "Suite 2's bedroom at Kasa Kefi — photo 3", altEs: "La recámara de la Suite 2 en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-rooms-07.webp", alt: "Suite 2's bedroom at Kasa Kefi — photo 4", altEs: "La recámara de la Suite 2 en Kasa Kefi — foto 4" },
        { src: "../assets/img/villas/kasa-kefi-rooms-08.webp", alt: "Suite 3's bedroom at Kasa Kefi", altEs: "La recámara de la Suite 3 en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-rooms-09.webp", alt: "Suite 3's bedroom at Kasa Kefi — photo 2", altEs: "La recámara de la Suite 3 en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-rooms-10.webp", alt: "Suite 3's bedroom at Kasa Kefi — photo 3", altEs: "La recámara de la Suite 3 en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-rooms-11.webp", alt: "Suite 3's bedroom at Kasa Kefi — photo 4", altEs: "La recámara de la Suite 3 en Kasa Kefi — foto 4" },
        { src: "../assets/img/villas/kasa-kefi-rooms-12.webp", alt: "Suite 3's bedroom at Kasa Kefi — photo 5", altEs: "La recámara de la Suite 3 en Kasa Kefi — foto 5" },
        { src: "../assets/img/villas/kasa-kefi-rooms-13.webp", alt: "The studio suite at Kasa Kefi", altEs: "El estudio en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-rooms-14.webp", alt: "The studio suite at Kasa Kefi — photo 2", altEs: "El estudio en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-rooms-15.webp", alt: "The studio suite at Kasa Kefi — photo 3", altEs: "El estudio en Kasa Kefi — foto 3" }
      ] },
      { key: "kitchen", images: [
        { src: "../assets/img/villas/kasa-kefi-kitchen-01.webp", alt: "The full kitchen at Kasa Kefi", altEs: "La cocina completa en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-02.webp", alt: "The full kitchen at Kasa Kefi — photo 2", altEs: "La cocina completa en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-03.webp", alt: "The full kitchen at Kasa Kefi — photo 3", altEs: "La cocina completa en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-04.webp", alt: "The full kitchen at Kasa Kefi — photo 4", altEs: "La cocina completa en Kasa Kefi — foto 4" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-05.webp", alt: "The full kitchen at Kasa Kefi — photo 5", altEs: "La cocina completa en Kasa Kefi — foto 5" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-06.webp", alt: "The ground-floor kitchenette at Kasa Kefi", altEs: "La cocineta de planta baja en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-07.webp", alt: "The ground-floor kitchenette at Kasa Kefi — photo 2", altEs: "La cocineta de planta baja en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-kitchen-08.webp", alt: "The ground-floor kitchenette at Kasa Kefi — photo 3", altEs: "La cocineta de planta baja en Kasa Kefi — foto 3" }
      ] },
      { key: "living", images: [
        { src: "../assets/img/villas/kasa-kefi-living-01.webp", alt: "The ground-floor living area at Kasa Kefi", altEs: "La sala de planta baja en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-living-02.webp", alt: "The ground-floor living area at Kasa Kefi — photo 2", altEs: "La sala de planta baja en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-living-03.webp", alt: "The ground-floor living area at Kasa Kefi — photo 3", altEs: "La sala de planta baja en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-living-04.webp", alt: "The ground-floor living area at Kasa Kefi — photo 4", altEs: "La sala de planta baja en Kasa Kefi — foto 4" },
        { src: "../assets/img/villas/kasa-kefi-living-05.webp", alt: "The main living room at Kasa Kefi", altEs: "La sala principal en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-living-06.webp", alt: "The main living room at Kasa Kefi — photo 2", altEs: "La sala principal en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-living-07.webp", alt: "The main living room at Kasa Kefi — photo 3", altEs: "La sala principal en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-living-08.webp", alt: "The main living room at Kasa Kefi — photo 4", altEs: "La sala principal en Kasa Kefi — foto 4" },
        { src: "../assets/img/villas/kasa-kefi-living-09.webp", alt: "The main dining room at Kasa Kefi", altEs: "El comedor principal en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-living-10.webp", alt: "The main dining room at Kasa Kefi — photo 2", altEs: "El comedor principal en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-living-11.webp", alt: "The main dining room at Kasa Kefi — photo 3", altEs: "El comedor principal en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-living-12.webp", alt: "The main dining room at Kasa Kefi — photo 4", altEs: "El comedor principal en Kasa Kefi — foto 4" }
      ] },
      { key: "interiors", images: [
        { src: "../assets/img/villas/kasa-kefi-interiors-01.webp", alt: "The master suite bathroom at Kasa Kefi", altEs: "El baño de la suite master en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-interiors-02.webp", alt: "The master suite bathroom at Kasa Kefi — photo 2", altEs: "El baño de la suite master en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-interiors-03.webp", alt: "The master suite bathroom at Kasa Kefi — photo 3", altEs: "El baño de la suite master en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-interiors-04.webp", alt: "The master suite bathroom at Kasa Kefi — photo 4", altEs: "El baño de la suite master en Kasa Kefi — foto 4" },
        { src: "../assets/img/villas/kasa-kefi-interiors-05.webp", alt: "Suite 2's bathroom at Kasa Kefi", altEs: "El baño de la Suite 2 en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-interiors-06.webp", alt: "Suite 2's bathroom at Kasa Kefi — photo 2", altEs: "El baño de la Suite 2 en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-interiors-07.webp", alt: "Suite 2's bathroom at Kasa Kefi — photo 3", altEs: "El baño de la Suite 2 en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-interiors-08.webp", alt: "Suite 3's bathroom at Kasa Kefi", altEs: "El baño de la Suite 3 en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-interiors-09.webp", alt: "Suite 3's bathroom at Kasa Kefi — photo 2", altEs: "El baño de la Suite 3 en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-interiors-10.webp", alt: "Suite 3's bathroom at Kasa Kefi — photo 3", altEs: "El baño de la Suite 3 en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-interiors-11.webp", alt: "The studio suite's bathroom at Kasa Kefi", altEs: "El baño del estudio en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-interiors-12.webp", alt: "The studio suite's bathroom at Kasa Kefi — photo 2", altEs: "El baño del estudio en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-interiors-13.webp", alt: "The studio suite's bathroom at Kasa Kefi — photo 3", altEs: "El baño del estudio en Kasa Kefi — foto 3" },
        { src: "../assets/img/villas/kasa-kefi-interiors-14.webp", alt: "The half bathroom at Kasa Kefi", altEs: "El medio baño en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-interiors-15.webp", alt: "The half bathroom at Kasa Kefi — photo 2", altEs: "El medio baño en Kasa Kefi — foto 2" },
        { src: "../assets/img/villas/kasa-kefi-interiors-16.webp", alt: "The half bathroom at Kasa Kefi — photo 3", altEs: "El medio baño en Kasa Kefi — foto 3" }
      ] },
      { key: "multipurpose", images: [
        { src: "../assets/img/villas/kasa-kefi-multipurpose-01.webp", alt: "The parking access to the upper level at Kasa Kefi", altEs: "El acceso de estacionamiento al nivel superior en Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-multipurpose-02.webp", alt: "The welcome entrance at the upper level of Kasa Kefi", altEs: "La entrada de bienvenida en el nivel superior de Kasa Kefi" },
        { src: "../assets/img/villas/kasa-kefi-multipurpose-03.webp", alt: "The ground-floor parking area at Kasa Kefi", altEs: "El estacionamiento en planta baja de Kasa Kefi" }
      ] }
    ],
    /* First 5 faqs are the curated "most important" set shown in the
       villa-detail FAQ showcase; the rest appear in the scrollable
       "more questions" panel when a visitor clicks to expand it (see
       main.js FAQ_PREVIEW_COUNT). Order matters — keep the top 5 first. */
    faqs: [
      {
        q: { en: "How many guests can Kasa Kefi accommodate, and how are rates determined?", es: "¿Cuántos huéspedes puede alojar Kasa Kefi y cómo se determinan las tarifas?" },
        a: { en: "Kasa Kefi comfortably accommodates up to 12 guests, including children. If your group is larger, let us know — Kasa Kefi is one of two neighboring private residences, and reserving the sister villa too allows both properties to host up to 22 guests. Rates are based on the number of bedrooms your group needs; your reservation always gives you exclusive private use of the entire property, and any bedrooms not included stay closed rather than being occupied by other guests.", es: "Kasa Kefi aloja cómodamente hasta 12 huéspedes, incluyendo niños. Si tu grupo es más grande, avísanos — Kasa Kefi es una de dos residencias privadas vecinas, y reservar también la villa hermana permite alojar hasta 22 huéspedes entre ambas propiedades. Las tarifas se basan en el número de recámaras que tu grupo necesite; tu reservación siempre te da uso privado exclusivo de toda la propiedad, y las recámaras que no incluyas permanecen cerradas en lugar de ser ocupadas por otros huéspedes." }
      },
      {
        q: { en: "What is the bedroom configuration?", es: "¿Cuál es la configuración de recámaras?" },
        a: { en: "The Master Suite has a king bed, private bathroom and a private terrace with lounge seating and a fire pit (max. 2 guests). Suite 1 has a king bed plus an XL twin bed in a private sleeping nook, an ensuite bathroom and a private fire-pit terrace (max. 3 guests). Suite 2 has two double beds plus an XL twin bed in a private sleeping nook, an ensuite bathroom and a private fire-pit terrace (max. 5 guests). The Studio has a queen sofa bed, a full bathroom and private outdoor space (max. 2 guests).", es: "La Suite Principal tiene cama king, baño privado y terraza propia con área de estar y fogata (máx. 2 huéspedes). La Suite 1 tiene cama king más una cama individual XL en un rincón privado, baño propio y terraza con fogata (máx. 3 huéspedes). La Suite 2 tiene dos camas matrimoniales más una cama individual XL en un rincón privado, baño propio y terraza con fogata (máx. 5 huéspedes). El Estudio tiene sofá cama queen, baño completo y espacio exterior privado (máx. 2 huéspedes)." }
      },
      {
        q: { en: "Where is Kasa Kefi located, and what makes it unique?", es: "¿Dónde está ubicada Kasa Kefi y qué la hace especial?" },
        a: { en: "Kasa Kefi sits within the private, gated Kasa Kava estate in Valle de Guadalupe, surrounded by vineyards, close to some of the Valle's finest wineries, restaurants and experiences, including establishments featured in the MICHELIN Guide. It's a distinctive retreat built around its natural setting, with striking architecture, carefully selected materials and sophisticated finishes — a private sanctuary designed to enjoy the vineyards, mountains and character of the Valle.", es: "Kasa Kefi está dentro del fraccionamiento privado Kasa Kava, en el Valle de Guadalupe, rodeada de viñedos y cerca de algunas de las mejores bodegas, restaurantes y experiencias del Valle, incluyendo establecimientos reconocidos por la Guía MICHELIN. Es un refugio distintivo diseñado alrededor de su entorno natural, con arquitectura llamativa, materiales cuidadosamente seleccionados y acabados sofisticados — un santuario privado pensado para disfrutar los viñedos, las montañas y el carácter del Valle." }
      },
      {
        q: { en: "What services are included with my stay?", es: "¿Qué servicios están incluidos en mi estancia?" },
        a: { en: "Every stay includes a dedicated villa concierge, housekeeping, pre-arrival assistance and personalized planning, help with winery and restaurant reservations, recommendations for the best experiences in the Valle, and support throughout your stay. Additional experiences and services can also be arranged to make your visit your own.", es: "Cada estancia incluye concierge dedicado a la villa, housekeeping, asistencia previa a la llegada y planeación personalizada, ayuda con reservaciones de bodegas y restaurantes, recomendaciones de las mejores experiencias del Valle, y soporte durante toda tu estancia. También se pueden organizar experiencias y servicios adicionales para hacer tu visita a tu medida." }
      },
      {
        q: { en: "Can you arrange breakfast and a private chef?", es: "¿Pueden organizar desayuno y chef privado?" },
        a: { en: "Yes to both. Our staff can prepare and serve breakfast at the villa for an additional fee, and a private chef can be arranged for special dinners and customized culinary experiences, whether for a celebration or simply an exceptional meal in the privacy of the villa.", es: "Sí, a ambos. Nuestro personal puede preparar y servir el desayuno en la villa por un costo adicional, y se puede organizar un chef privado para cenas especiales y experiencias culinarias personalizadas, ya sea para una celebración o simplemente para disfrutar una comida excepcional en la privacidad de la villa." }
      },
      {
        q: { en: "What amenities does Kasa Kefi offer?", es: "¿Qué amenidades ofrece Kasa Kefi?" },
        a: { en: "Outdoors: an expansive terrace with mountain and vineyard views, a private infinity plunge pool, lounge areas, fire pits, sun loungers, an outdoor dining area and a BBQ. Indoors: a fully equipped kitchen, two living rooms with TV and Sonos sound, heating and air conditioning throughout, an ethanol fireplace and Starlink high-speed internet. Every bedroom has luxury linens, a private ensuite bathroom, Smart TV, Amazon Echo with Alexa, a Nespresso machine, a safe, a hair dryer, a garment steamer, bathrobes and its own fire-pit terrace.", es: "Al aire libre: amplia terraza con vista a las montañas y viñedos, alberca infinita tipo plunge pool, áreas de estar, fogatas, camastros, área de comedor exterior y asador. Interior: cocina totalmente equipada, dos salas con TV y sonido Sonos, calefacción y aire acondicionado en toda la villa, chimenea de etanol e internet de alta velocidad Starlink. Cada recámara tiene blancos de lujo, baño propio, Smart TV, Amazon Echo con Alexa, cafetera Nespresso, caja fuerte, secadora de pelo, vaporizador de ropa, batas y su propia terraza con fogata." }
      },
      {
        q: { en: "Is Kasa Kefi suitable for families, groups of friends, or bachelor/bachelorette parties?", es: "¿Kasa Kefi es adecuada para familias, grupos de amigos o despedidas de soltero/soltera?" },
        a: { en: "Yes to all three. Children are welcome and included in the maximum occupancy of 12 guests, and must be supervised by an adult at all times. The spacious terrace, plunge pool, fire pits and outdoor living areas make it especially well suited to groups of friends looking for a private, sophisticated getaway, and bachelor/bachelorette groups are welcome provided they respect the villa's guidelines and the peaceful character of the estate.", es: "Sí, para los tres. Los niños son bienvenidos y están incluidos en la ocupación máxima de 12 huéspedes, y deben estar supervisados por un adulto en todo momento. La amplia terraza, la alberca tipo plunge pool, las fogatas y las áreas exteriores la hacen especialmente adecuada para grupos de amigos que buscan una escapada privada y sofisticada, y los grupos de despedida de soltero o soltera son bienvenidos siempre que respeten los lineamientos de la villa y el carácter tranquilo del fraccionamiento." }
      },
      {
        q: { en: "What can we do near Kasa Kefi, and can you arrange winery tours and transportation?", es: "¿Qué podemos hacer cerca de Kasa Kefi y pueden organizar tours de bodegas y transporte?" },
        a: { en: "Valle de Guadalupe offers an exceptional mix of wine, gastronomy, nature and wellness. Our concierge can arrange private winery and wine-tasting experiences, restaurants (including MICHELIN Guide establishments), farm-to-table dining, private chef experiences, spa and wellness treatments, horseback riding, scenic hikes, olive oil and artisanal food experiences, hot-air balloon rides, private transportation and customized excursions.", es: "El Valle de Guadalupe ofrece una mezcla excepcional de vino, gastronomía, naturaleza y bienestar. Nuestro concierge puede organizar experiencias privadas de cata de vinos, restaurantes (incluyendo establecimientos de la Guía MICHELIN), comida de granja a mesa, experiencias con chef privado, tratamientos de spa y bienestar, cabalgatas, caminatas escénicas, experiencias de aceite de oliva y productos artesanales, paseos en globo aerostático, transporte privado y excursiones personalizadas." }
      },
      {
        q: { en: "Can Kasa Kefi host celebrations or events?", es: "¿Kasa Kefi puede recibir celebraciones o eventos?" },
        a: { en: "Private celebrations, small weddings and corporate gatherings may be possible with prior approval, subject to the property's capacity, availability and applicable fees. Accommodation and event services are handled separately — contact our team with your plans and we'll discuss what can be arranged.", es: "Las celebraciones privadas, bodas pequeñas y reuniones corporativas pueden ser posibles con aprobación previa, sujeto a la capacidad de la propiedad, disponibilidad y tarifas aplicables. El hospedaje y los servicios del evento se manejan por separado — contacta a nuestro equipo con tus planes y platicamos qué se puede organizar." }
      },
      {
        q: { en: "What time is check-in and check-out?", es: "¿A qué hora son el check-in y el check-out?" },
        a: { en: "Check-in is at 3:00 PM and check-out at 11:00 AM. A complimentary late check-out until 1:00 PM may be available depending on the schedule, and a later check-out can sometimes be arranged for an additional fee, subject to availability.", es: "El check-in es a las 3:00 PM y el check-out a las 11:00 AM. Puede haber check-out tardío gratuito hasta la 1:00 PM según el calendario, y a veces se puede organizar un check-out aún más tarde por un costo adicional, sujeto a disponibilidad." }
      },
      {
        q: { en: "Can we have visitors or bring outside vendors?", es: "¿Podemos recibir visitas o traer proveedores externos?" },
        a: { en: "Visitors are allowed only with prior authorization, must be registered in advance with our concierge, and are subject to an additional fee. Outside vendors and service providers aren't permitted unless previously authorized — let us know in advance if you'd like to bring a specific provider, as additional fees may apply.", es: "Las visitas se permiten solo con autorización previa, deben registrarse con anticipación con nuestro concierge y tienen un cargo adicional. Los proveedores externos no están permitidos a menos que se autoricen previamente — avísanos con anticipación si quieres traer un proveedor específico, ya que pueden aplicar cargos adicionales." }
      },
      {
        q: { en: "Are pets allowed?", es: "¿Se aceptan mascotas?" },
        a: { en: "Pets may be accepted with prior authorization and an additional fee, depending on the pet and the circumstances of the stay. Let us know before booking so we can confirm what can be accommodated.", es: "Las mascotas pueden aceptarse con autorización previa y una tarifa adicional, dependiendo de la mascota y las circunstancias de la estancia. Avísanos antes de reservar para confirmar qué se puede acomodar." }
      },
      {
        q: { en: "Is a security deposit required?", es: "¿Se requiere un depósito de garantía?" },
        a: { en: "A refundable security deposit may be required, depending on the reservation. Our team will confirm the applicable amount and details before your stay.", es: "Puede requerirse un depósito de garantía reembolsable, dependiendo de la reservación. Nuestro equipo confirmará el monto y los detalles aplicables antes de tu estancia." }
      }
    ]
  },
  {
    slug: "casa-corazon-luxe",
    name: "Casa Corazon Luxe",
    destination: "playa-del-carmen",
    destinationLabel: "Playa del Carmen",
    destinationLabelEs: "Playa del Carmen",
    lat: 20.613413,
    lng: -87.080674,
    mapIcon: "assets/img/brand/casa-corazon-icon.png",
    googleMapsUrl: "https://maps.app.goo.gl/fB3C6WZ5AK9Awcyp6",
    guests: 22,
    bedrooms: 11,
    hostawayListingId: 144272,
    // Live from Hostaway (hostaway-sync.js): lowest bookable nightly rate,
    // per-date minimum stay and booked nights. Empty until it lands, so
    // the site never shows a made-up price or booking.
    priceFromPerNight: null,
    availability: { minStay: null, minStayRanges: [], blockedRanges: [] },
    beds: 16,
    baths: 12,
    area: 1486,
    featured: true,
    short: "Facing the Caribbean, with room to spare for large gatherings — from family reunions to company retreats. Home cinema, infinity pool, and a team that cooks and takes care of everything all day.",
    shortEs: "Frente al Caribe, con espacio de sobra para reuniones grandes — desde reuniones familiares hasta retiros de empresa. Cine en casa, alberca infinity y un equipo que cocina y atiende todo el día.",
    image: "assets/img/villas/casa-corazon-luxe-1.webp",
    imageAlt: "Casa Corazon Luxe's palapa living room opening to the pool and the Caribbean",
    imageAltEs: "La sala palapa de Casa Corazon Luxe, abierta hacia la alberca y el Caribe",
    showcaseImages: [
      { src: "assets/img/villas/casa-corazon-luxe-1.webp", alt: "Casa Corazon Luxe's palapa living room opening to the pool and the Caribbean", altEs: "La sala palapa de Casa Corazon Luxe, abierta hacia la alberca y el Caribe" },
      { src: "assets/img/villas/casa-corazon-luxe-2.webp", alt: "The tiled lap pool between Casa Corazon Luxe's casitas", altEs: "La alberca de azulejo entre las casitas de Casa Corazon Luxe" },
      { src: "assets/img/villas/casa-corazon-luxe-3.webp", alt: "A bedroom at Casa Corazon Luxe with a brick dome ceiling and an ocean-view hammock", altEs: "Una recámara en Casa Corazon Luxe con techo abovedado de ladrillo y hamaca con vista al mar" },
      { src: "assets/img/villas/casa-corazon-luxe-4.webp", alt: "The entrance and carport at Casa Corazon Luxe", altEs: "La entrada y el garage de Casa Corazon Luxe" },
      { src: "assets/img/villas/casa-corazon-luxe-5.webp", alt: "Casa Corazon Luxe's casitas seen from the beach", altEs: "Las casitas de Casa Corazon Luxe vistas desde la playa" }
    ],
    amenities: [
      { en: "Private pool", es: "Alberca privada" },
      { en: "Beachfront", es: "Frente a la playa" },
      { en: "Oceanfront", es: "Frente al mar" },
      { en: "Gym", es: "Gimnasio" },
      { en: "Cleaning included", es: "Limpieza incluida" },
      { en: "Private chef", es: "Chef privado" },
      { en: "Air conditioning", es: "Aire acondicionado" },
      { en: "Internet", es: "Internet" }
    ],
    amenitiesMore: [
      { en: "Washing machine", es: "Lavadora" },
      { en: "Dryer", es: "Secadora" },
      { en: "Hair dryer", es: "Secadora de pelo" },
      { en: "Iron", es: "Plancha" },
      { en: "Smart TV", es: "Smart TV" },
      { en: "Sound system", es: "Sistema de sonido" },
      { en: "Safe", es: "Caja fuerte" },
      { en: "Linens", es: "Ropa de cama" },
      { en: "Towels", es: "Toallas" },
      { en: "Beach essentials", es: "Esenciales de playa" },
      { en: "Room-darkening shades", es: "Cortinas blackout" },
      { en: "Coffee/tea maker", es: "Cafetera/tetera" },
      { en: "Toaster", es: "Tostador" },
      { en: "Dishwasher", es: "Lavavajillas" },
      { en: "Microwave", es: "Microondas" },
      { en: "Oven", es: "Horno" },
      { en: "Blender", es: "Licuadora" },
      { en: "Outdoor grill", es: "Parrilla exterior" },
      { en: "Outdoor kitchen", es: "Cocina exterior" },
      { en: "Hammock", es: "Hamaca" },
      { en: "Game room", es: "Salón de juegos" },
      { en: "Foosball", es: "Futbolito" },
      { en: "Ping pong table", es: "Mesa de ping pong" },
      { en: "Board games", es: "Juegos de mesa" },
      { en: "Exercise equipment", es: "Equipo de ejercicio" },
      { en: "Waterfront", es: "Frente al agua" },
      { en: "Kayak / canoe", es: "Kayak / canoa" },
      { en: "Water sports gear", es: "Equipo de deportes acuáticos" },
      { en: "Massage", es: "Masajes" }
    ],
    services: ["housekeeping", "concierge", "itinerary", "chef", "transfer", "spa", "grocery", "events", "excursions"],
    /* Real Casa Corazon Luxe photography per service — see the note on Villa Aqua above. */
    serviceImages: {
      housekeeping: "../assets/img/villas/casa-corazon-luxe-rooms-03.webp",
      itinerary: "../assets/img/villas/casa-corazon-luxe-interiors-35.webp",
      chef: "../assets/img/villas/casa-corazon-luxe-interiors-03.webp",
      grocery: "../assets/img/villas/casa-corazon-luxe-interiors-02.webp",
      events: "../assets/img/villas/casa-corazon-luxe-outdoor-04.webp",
      excursions: "../assets/img/villas/casa-corazon-luxe-rooms-02.webp"
    },
    gallery: [
      { key: "outdoor", images: [
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-02.webp",
          alt: "The lap pool between the casitas, framed by palm trees and the Caribbean beyond", altEs: "La alberca de nado entre las casitas, enmarcada por palmeras y el Caribe al fondo" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-03.webp",
          alt: "The palapa lounge, steps from the private beach", altEs: "La sala palapa, a pasos de la playa privada" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-04.webp",
          alt: "The infinity-edge pool reflecting the sky", altEs: "La alberca infinita reflejando el cielo" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-05.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 1", altEs: "La playa en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-06.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 2", altEs: "La playa en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-07.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 3", altEs: "La playa en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-08.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 4", altEs: "La playa en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-09.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 5", altEs: "La playa en Casa Corazon Luxe — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-10.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 6", altEs: "La playa en Casa Corazon Luxe — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-11.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 7", altEs: "La playa en Casa Corazon Luxe — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-12.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 8", altEs: "La playa en Casa Corazon Luxe — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-13.webp",
          alt: "The beachfront at Casa Corazon Luxe — photo 9", altEs: "La playa en Casa Corazon Luxe — foto 9" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-14.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 1", altEs: "La sala palapa en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-15.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 2", altEs: "La sala palapa en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-16.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 3", altEs: "La sala palapa en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-17.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 4", altEs: "La sala palapa en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-18.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 5", altEs: "La sala palapa en Casa Corazon Luxe — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-19.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 6", altEs: "La sala palapa en Casa Corazon Luxe — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-20.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 7", altEs: "La sala palapa en Casa Corazon Luxe — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-21.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 8", altEs: "La sala palapa en Casa Corazon Luxe — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-22.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 9", altEs: "La sala palapa en Casa Corazon Luxe — foto 9" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-23.webp",
          alt: "The palapa lounge at Casa Corazon Luxe — photo 10", altEs: "La sala palapa en Casa Corazon Luxe — foto 10" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-24.webp",
          alt: "A common area at Casa Corazon Luxe — photo 1", altEs: "Un área común en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-outdoor-25.webp",
          alt: "A common area at Casa Corazon Luxe — photo 2", altEs: "Un área común en Casa Corazon Luxe — foto 2" }
      ] },
      { key: "rooms", images: [
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-01.webp",
          alt: "The master suite, with a brick dome ceiling and direct ocean views", altEs: "La suite principal, con techo abovedado de ladrillo y vista directa al mar" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-02.webp",
          alt: "A master bathroom with a stained-glass skylight above the soaking tub", altEs: "Un baño principal con tragaluz de vitral sobre la tina" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-03.webp",
          alt: "A bedroom in linen and morning light", altEs: "Una recámara en lino y luz de la mañana" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-04.webp",
          alt: "The master bedroom (Bedroom 1) — photo 1", altEs: "La recámara principal (Recámara 1) — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-05.webp",
          alt: "The master bedroom (Bedroom 1) — photo 2", altEs: "La recámara principal (Recámara 1) — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-06.webp",
          alt: "Bedroom 2 (Master) — photo 1", altEs: "Recámara 2 (Principal) — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-07.webp",
          alt: "Bedroom 2 (Master) — photo 2", altEs: "Recámara 2 (Principal) — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-08.webp",
          alt: "Bedroom 2 (Master) — photo 3", altEs: "Recámara 2 (Principal) — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-09.webp",
          alt: "Bedroom 2 (Master) — photo 4", altEs: "Recámara 2 (Principal) — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-10.webp",
          alt: "Bedroom 2 (Master) — photo 5", altEs: "Recámara 2 (Principal) — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-11.webp",
          alt: "Bedroom 2 (Master) — photo 6", altEs: "Recámara 2 (Principal) — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-12.webp",
          alt: "Bedroom 2 (Master) — photo 7", altEs: "Recámara 2 (Principal) — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-13.webp",
          alt: "Bedroom 2 (Master) — photo 8", altEs: "Recámara 2 (Principal) — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-14.webp",
          alt: "Bedroom 2 (Master) — photo 9", altEs: "Recámara 2 (Principal) — foto 9" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-15.webp",
          alt: "Bedroom 3 — photo 1", altEs: "Recámara 3 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-16.webp",
          alt: "Bedroom 3 — photo 2", altEs: "Recámara 3 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-17.webp",
          alt: "Bedroom 3 — photo 3", altEs: "Recámara 3 — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-18.webp",
          alt: "Bedroom 3 — photo 4", altEs: "Recámara 3 — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-19.webp",
          alt: "Bedroom 4 — photo 1", altEs: "Recámara 4 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-20.webp",
          alt: "Bedroom 4 — photo 2", altEs: "Recámara 4 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-21.webp",
          alt: "Bedroom 4 — photo 3", altEs: "Recámara 4 — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-22.webp",
          alt: "Bedroom 4 — photo 4", altEs: "Recámara 4 — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-23.webp",
          alt: "Bedroom 4 — photo 5", altEs: "Recámara 4 — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-24.webp",
          alt: "Bedroom 4 — photo 6", altEs: "Recámara 4 — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-25.webp",
          alt: "Bedroom 4 — photo 7", altEs: "Recámara 4 — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-26.webp",
          alt: "Bedroom 4 — photo 8", altEs: "Recámara 4 — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-27.webp",
          alt: "Bedroom 5 — photo 1", altEs: "Recámara 5 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-28.webp",
          alt: "Bedroom 5 — photo 2", altEs: "Recámara 5 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-29.webp",
          alt: "Bedroom 5 — photo 3", altEs: "Recámara 5 — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-30.webp",
          alt: "Bedroom 5 — photo 4", altEs: "Recámara 5 — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-31.webp",
          alt: "Bedroom 6 — photo 1", altEs: "Recámara 6 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-32.webp",
          alt: "Bedroom 6 — photo 2", altEs: "Recámara 6 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-33.webp",
          alt: "Bedroom 6 — photo 3", altEs: "Recámara 6 — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-34.webp",
          alt: "Bedroom 6 — photo 4", altEs: "Recámara 6 — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-35.webp",
          alt: "Bedroom 6 — photo 5", altEs: "Recámara 6 — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-36.webp",
          alt: "Bedroom 6 — photo 6", altEs: "Recámara 6 — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-37.webp",
          alt: "Bedroom 6 — photo 7", altEs: "Recámara 6 — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-38.webp",
          alt: "Bedroom 7 — photo 1", altEs: "Recámara 7 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-39.webp",
          alt: "Bedroom 7 — photo 2", altEs: "Recámara 7 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-40.webp",
          alt: "Bedroom 8 — photo 1", altEs: "Recámara 8 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-41.webp",
          alt: "Bedroom 8 — photo 2", altEs: "Recámara 8 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-42.webp",
          alt: "Bedroom 9 — photo 1", altEs: "Recámara 9 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-43.webp",
          alt: "Bedroom 9 — photo 2", altEs: "Recámara 9 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-44.webp",
          alt: "Bedroom 10 — photo 1", altEs: "Recámara 10 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-45.webp",
          alt: "Bedroom 10 — photo 2", altEs: "Recámara 10 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-46.webp",
          alt: "Bedroom 10 — photo 3", altEs: "Recámara 10 — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-47.webp",
          alt: "Bedroom 10 — photo 4", altEs: "Recámara 10 — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-48.webp",
          alt: "Bedroom 10 — photo 5", altEs: "Recámara 10 — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-49.webp",
          alt: "Bedroom 10 — photo 6", altEs: "Recámara 10 — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-50.webp",
          alt: "Bedroom 10 — photo 7", altEs: "Recámara 10 — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-51.webp",
          alt: "Bedroom 10 — photo 8", altEs: "Recámara 10 — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-52.webp",
          alt: "Bedroom 11 — photo 1", altEs: "Recámara 11 — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-53.webp",
          alt: "Bedroom 11 — photo 2", altEs: "Recámara 11 — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-54.webp",
          alt: "Bedroom 11 — photo 3", altEs: "Recámara 11 — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-55.webp",
          alt: "Bedroom 11 — photo 4", altEs: "Recámara 11 — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-56.webp",
          alt: "Bedroom 11 — photo 5", altEs: "Recámara 11 — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-57.webp",
          alt: "Bedroom 11 — photo 6", altEs: "Recámara 11 — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-rooms-58.webp",
          alt: "Bedroom 11 — photo 7", altEs: "Recámara 11 — foto 7" }
      ],
        // Per-bedroom split for the room picker, derived from each photo's "Bedroom N" alt tag above.
        roomImages: [
          [3, 4],
          [5, 6, 7, 8, 9, 10, 11, 12, 13],
          [14, 15, 16, 17],
          [18, 19, 20, 21, 22, 23, 24, 25],
          [26, 27, 28, 29],
          [30, 31, 32, 33, 34, 35, 36],
          [37, 38],
          [39, 40],
          [41, 42],
          [43, 44, 45, 46, 47, 48, 49, 50],
          [51, 52, 53, 54, 55, 56, 57]
        ]
      },
      { key: "kitchen", images: [
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-02.webp",
          alt: "One of two dining areas, opening to the courtyard garden", altEs: "Uno de los dos comedores, abierto hacia el jardín del patio" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-03.webp",
          alt: "One of two full kitchens, dressed in hand-painted talavera tile", altEs: "Una de las dos cocinas completas, vestida con azulejo de talavera pintado a mano" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-04.webp",
          alt: "The kitchen at Casa Corazon Luxe — photo 1", altEs: "La cocina en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-05.webp",
          alt: "The kitchen at Casa Corazon Luxe — photo 2", altEs: "La cocina en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-06.webp",
          alt: "The kitchen at Casa Corazon Luxe — photo 3", altEs: "La cocina en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-07.webp",
          alt: "The kitchen at Casa Corazon Luxe — photo 4", altEs: "La cocina en Casa Corazon Luxe — foto 4" }
      ] },
      { key: "living", images: [
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-01.webp",
          alt: "One of three living rooms, open-air beneath the palapa roof", altEs: "Una de las tres salas, al aire libre bajo el techo de palapa" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-08.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 1", altEs: "Sala 1 en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-09.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 2", altEs: "Sala 1 en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-10.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 3", altEs: "Sala 1 en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-11.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 4", altEs: "Sala 1 en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-12.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 5", altEs: "Sala 1 en Casa Corazon Luxe — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-13.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 6", altEs: "Sala 1 en Casa Corazon Luxe — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-14.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 7", altEs: "Sala 1 en Casa Corazon Luxe — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-15.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 8", altEs: "Sala 1 en Casa Corazon Luxe — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-16.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 9", altEs: "Sala 1 en Casa Corazon Luxe — foto 9" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-17.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 10", altEs: "Sala 1 en Casa Corazon Luxe — foto 10" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-18.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 11", altEs: "Sala 1 en Casa Corazon Luxe — foto 11" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-19.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 12", altEs: "Sala 1 en Casa Corazon Luxe — foto 12" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-20.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 13", altEs: "Sala 1 en Casa Corazon Luxe — foto 13" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-21.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 14", altEs: "Sala 1 en Casa Corazon Luxe — foto 14" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-22.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 15", altEs: "Sala 1 en Casa Corazon Luxe — foto 15" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-23.webp",
          alt: "Living room 1 at Casa Corazon Luxe — photo 16", altEs: "Sala 1 en Casa Corazon Luxe — foto 16" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-24.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 1", altEs: "Sala 2 en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-25.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 2", altEs: "Sala 2 en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-26.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 3", altEs: "Sala 2 en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-27.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 4", altEs: "Sala 2 en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-28.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 5", altEs: "Sala 2 en Casa Corazon Luxe — foto 5" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-29.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 6", altEs: "Sala 2 en Casa Corazon Luxe — foto 6" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-30.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 7", altEs: "Sala 2 en Casa Corazon Luxe — foto 7" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-31.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 8", altEs: "Sala 2 en Casa Corazon Luxe — foto 8" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-32.webp",
          alt: "Living room 2 at Casa Corazon Luxe — photo 9", altEs: "Sala 2 en Casa Corazon Luxe — foto 9" }
      ] },
      { key: "interiors", images: [
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-33.webp",
          alt: "The entrance doors framing the pool and Caribbean beyond", altEs: "Las puertas de entrada enmarcando la alberca y el Caribe al fondo" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-34.webp",
          alt: "A covered walkway lined with beams, steps from the beach", altEs: "Un pasillo techado con vigas de madera, a pasos de la playa" },
        { src: "../assets/img/villas/casa-corazon-luxe-interiors-35.webp",
          alt: "A stone courtyard nook along the entrance walkway", altEs: "Un rincón de piedra junto al pasillo de entrada" }
      ] },
      { key: "multipurpose", images: [
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-01.webp",
          alt: "The home cinema, ready for movie night", altEs: "El cine en casa, listo para noche de película" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-02.webp",
          alt: "The game room, with foosball, ping pong and air hockey", altEs: "El salón de juegos, con futbolito, ping pong y hockey de mesa" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-03.webp",
          alt: "The fully equipped home gym", altEs: "El gimnasio totalmente equipado" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-04.webp",
          alt: "The home cinema at Casa Corazon Luxe — photo 1", altEs: "El cine en casa en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-05.webp",
          alt: "The home cinema at Casa Corazon Luxe — photo 2", altEs: "El cine en casa en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-06.webp",
          alt: "The home cinema at Casa Corazon Luxe — photo 3", altEs: "El cine en casa en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-07.webp",
          alt: "The home cinema at Casa Corazon Luxe — photo 4", altEs: "El cine en casa en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-08.webp",
          alt: "The game room at Casa Corazon Luxe — photo 1", altEs: "El salón de juegos en Casa Corazon Luxe — foto 1" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-09.webp",
          alt: "The game room at Casa Corazon Luxe — photo 2", altEs: "El salón de juegos en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-10.webp",
          alt: "The game room at Casa Corazon Luxe — photo 3", altEs: "El salón de juegos en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-11.webp",
          alt: "The game room at Casa Corazon Luxe — photo 4", altEs: "El salón de juegos en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-13.webp",
          alt: "The gym at Casa Corazon Luxe — photo 2", altEs: "El gimnasio en Casa Corazon Luxe — foto 2" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-14.webp",
          alt: "The gym at Casa Corazon Luxe — photo 3", altEs: "El gimnasio en Casa Corazon Luxe — foto 3" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-15.webp",
          alt: "The gym at Casa Corazon Luxe — photo 4", altEs: "El gimnasio en Casa Corazon Luxe — foto 4" },
        { src: "../assets/img/villas/casa-corazon-luxe-multipurpose-16.webp",
          alt: "The gym at Casa Corazon Luxe — photo 5", altEs: "El gimnasio en Casa Corazon Luxe — foto 5" }
      ] }
    ],
    /* First 5 faqs are the curated "most important" set shown in the
       villa-detail FAQ showcase; the rest appear in the scrollable
       "more questions" panel when a visitor clicks to expand it (see
       main.js FAQ_PREVIEW_COUNT). Order matters — keep the top 5 first. */
    faqs: [
      {
        q: { en: "How many guests can Casa Corazon Luxe accommodate?", es: "¿Cuántos huéspedes puede alojar Casa Corazón Luxe?" },
        a: { en: "Up to 22 guests across 11 bedrooms with 14 full bathrooms. The villa offers flexible configurations from 5 to 11 bedrooms, so groups can reserve exactly the space that suits their needs.", es: "Hasta 22 huéspedes en 11 recámaras con 14 baños completos. La villa ofrece configuraciones flexibles de 5 a 11 recámaras, para que cada grupo reserve exactamente el espacio que necesita." }
      },
      {
        q: { en: "Is Casa Corazon Luxe beachfront, and how secure is the area?", es: "¿Casa Corazón Luxe está frente al mar y qué tan segura es la zona?" },
        a: { en: "Yes, it's a direct beachfront villa in Playacar Phase I, with direct beach access, ocean views and a private pool overlooking the Caribbean. Security is two-layered: the gated Playacar Phase I community provides 24/7 private security and controlled access, and Casa Corazon Luxe also has its own dedicated private security guard exclusively for the villa, around the clock.", es: "Sí, es una villa frente al mar en Playacar Fase I, con acceso directo a la playa, vista al mar y una alberca privada frente al Caribe. La seguridad tiene dos niveles: el fraccionamiento privado Playacar Fase I ofrece seguridad 24/7 y acceso controlado, y Casa Corazón Luxe también cuenta con su propio guardia de seguridad privado exclusivo para la villa, las 24 horas." }
      },
      {
        q: { en: "What services are included, and is a private chef part of the stay?", es: "¿Qué servicios están incluidos y el chef privado forma parte de la estancia?" },
        a: { en: "Every stay includes a private concierge, a private chef, sous-chef and waiter for breakfast and lunch, daily housekeeping, pool and beach service, dedicated 24/7 private security, gardening and maintenance, Wi-Fi and air conditioning, plus beach towels and basic toiletries. Groceries and ingredients are additional, with grocery delivery available for a 20% delivery fee, and dietary restrictions or allergies can be accommodated with advance notice. Your concierge can also arrange transportation, private dinners, excursions, spa treatments and special celebrations.", es: "Cada estancia incluye concierge privado, chef privado, sous-chef y mesero para desayuno y comida, housekeeping diario, servicio de alberca y playa, seguridad privada dedicada 24/7, jardinería y mantenimiento, Wi-Fi y aire acondicionado, además de toallas de playa y artículos básicos de tocador. Los ingredientes y despensa son adicionales, con entrega a domicilio disponible por un cargo del 20%, y se pueden atender restricciones alimenticias o alergias con aviso previo. Tu concierge también puede organizar transporte, cenas privadas, excursiones, tratamientos de spa y celebraciones especiales." }
      },
      {
        q: { en: "What amenities does Casa Corazon Luxe offer?", es: "¿Qué amenidades ofrece Casa Corazón Luxe?" },
        a: { en: "A private ocean-view swimming pool, direct beach access, a private gym, game room, home cinema, bar and lounge, two kayaks with life jackets, a BBQ and outdoor dining areas, multiple indoor and outdoor living spaces, high-speed Wi-Fi and air conditioning throughout.", es: "Alberca privada con vista al mar, acceso directo a la playa, gimnasio privado, salón de juegos, cine en casa, bar y lounge, dos kayaks con chalecos salvavidas, asador y áreas de comedor al aire libre, múltiples espacios de convivencia interiores y exteriores, Wi-Fi de alta velocidad y aire acondicionado en toda la villa." }
      },
      {
        q: { en: "Is Casa Corazon Luxe suitable for families, groups of friends, or corporate retreats?", es: "¿Casa Corazón Luxe es adecuada para familias, grupos de amigos o retiros corporativos?" },
        a: { en: "Yes to all of them. Children are welcome, with family-friendly amenities such as a high chair, Pack 'n Play and life jackets available. The villa's generous common areas, flexible bedroom configuration, beachfront location and full-service staff also make it ideal for groups of friends, corporate retreats and private gatherings.", es: "Sí, para todos. Los niños son bienvenidos, con amenidades familiares como silla alta, cuna de viaje y chalecos salvavidas disponibles. Las amplias áreas comunes, la configuración flexible de recámaras, la ubicación frente al mar y el personal de servicio completo también la hacen ideal para grupos de amigos, retiros corporativos y reuniones privadas." }
      },
      {
        q: { en: "Can Casa Corazon Luxe host private events?", es: "¿Casa Corazón Luxe puede recibir eventos privados?" },
        a: { en: "Yes, private events of up to 50 guests can be hosted with prior approval; the event fee is $6,000 USD. Additional services such as catering, décor, entertainment and transportation can be arranged separately.", es: "Sí, se pueden organizar eventos privados de hasta 50 personas con aprobación previa; la tarifa del evento es de $6,000 USD. Servicios adicionales como catering, decoración, entretenimiento y transporte se pueden coordinar por separado." }
      },
      {
        q: { en: "Is there a concern about sargassum?", es: "¿Hay algún problema con el sargazo?" },
        a: { en: "As with all beachfront properties in the Riviera Maya, sargassum conditions vary naturally by season, currents and weather. The beach is maintained regularly, but completely seaweed-free conditions can't be guaranteed.", es: "Como en todas las propiedades frente al mar de la Riviera Maya, las condiciones de sargazo varían naturalmente según la temporada, las corrientes y el clima. La playa se mantiene de forma regular, pero no se pueden garantizar condiciones completamente libres de sargazo." }
      },
      {
        q: { en: "Are pets or smoking allowed?", es: "¿Se permiten mascotas o fumar?" },
        a: { en: "No, neither is permitted at the property.", es: "No, ninguna de las dos está permitida en la propiedad." }
      },
      {
        q: { en: "What time is check-in and check-out, and are there quiet hours?", es: "¿A qué hora son el check-in y el check-out, y hay horario de silencio?" },
        a: { en: "Check-in is at 3:00 PM and check-out at 11:00 AM; early check-in and late check-out may be available depending on availability. Casa Corazon Luxe sits within a private residential community, so quiet hours begin at 10:00 PM and loud music or excessive noise isn't permitted after that time.", es: "El check-in es a las 3:00 PM y el check-out a las 11:00 AM; puede haber check-in anticipado o check-out tardío según disponibilidad. Casa Corazón Luxe está dentro de un fraccionamiento residencial privado, así que el horario de silencio comienza a las 10:00 PM y no se permite música alta o ruido excesivo después de esa hora." }
      },
      {
        q: { en: "Is a security deposit required?", es: "¿Se requiere un depósito de garantía?" },
        a: { en: "Yes, a refundable security deposit of $3,000 USD is required.", es: "Sí, se requiere un depósito de garantía reembolsable de $3,000 USD." }
      },
      {
        q: { en: "How does pricing work, and what's the minimum stay?", es: "¿Cómo funciona el precio y cuál es la estancia mínima?" },
        a: { en: "Casa Corazon Luxe offers flexible pricing based on the number of bedrooms and guests, with reservations possible from 5 to 11 bedrooms subject to availability. The minimum stay varies by season, ranging from 3 to 7 nights; Christmas and New Year's require a 7-night minimum.", es: "Casa Corazón Luxe ofrece precios flexibles según el número de recámaras y huéspedes, con reservaciones posibles de 5 a 11 recámaras sujeto a disponibilidad. La estancia mínima varía según la temporada, de 3 a 7 noches; Navidad y Año Nuevo requieren un mínimo de 7 noches." }
      },
      {
        q: { en: "What is the cancellation policy?", es: "¿Cuál es la política de cancelación?" },
        a: { en: "The cancellation policy varies depending on the timing of the cancellation; the applicable terms are confirmed at the time of booking.", es: "La política de cancelación varía según el momento de la cancelación; los términos aplicables se confirman al momento de reservar." }
      }
    ]
  },
  {
    slug: "casa-de-las-estrellas",
    name: "Casa de las Estrellas",
    destination: "playa-del-carmen",
    destinationLabel: "Playa del Carmen",
    destinationLabelEs: "Playa del Carmen",
    lat: 20.6124935,
    lng: -87.0828781,
    mapIcon: "assets/img/brand/casa-de-las-estrellas-pin.png",
    googleMapsUrl: "https://www.google.com/maps/place/Home+in+Playa+del+Carmen,+MX/@20.6134124,-87.0875142,16.2z/data=!4m14!1m2!2m1!1scasa+de+las+estrellas!3m10!1s0x8f4e434044c42bef:0x388f20b80006b76c!5m2!4m1!1i2!8m2!3d20.6142178!4d-87.0805817!15sChVjYXNhIGRlIGxhcyBlc3RyZWxsYXOSAQ92YWNhdGlvbl9yZW50YWzgAQA!16s%2Fg%2F11zdf51myh!17BQ0FF",
    guests: 10,
    bedrooms: 4,
    hostawayListingId: 456289,
    // Live from Hostaway (hostaway-sync.js): lowest bookable nightly rate,
    // per-date minimum stay and booked nights. Empty until it lands, so
    // the site never shows a made-up price or booking.
    priceFromPerNight: null,
    availability: { minStay: null, minStayRanges: [], blockedRanges: [] },
    beds: 5,
    baths: 4,
    area: 460,
    featured: true,
    short: "A few steps from the sand, inside Playacar Phase I. Head up to the rooftop for the ocean-view jacuzzi, or down to cool off in the heated pool among tropical plants.",
    shortEs: "A unos pasos de la arena, dentro de Playacar Fase I. Sube a la azotea por el jacuzzi con vista al mar, o baja a refrescarte en la alberca climatizada entre plantas tropicales.",
    image: "assets/img/villas/casa-de-las-estrellas-1.webp",
    imageAlt: "Casa de las Estrellas' dining and lounge area opening to the pool",
    imageAltEs: "El comedor y la sala de estar de Casa de las Estrellas, abiertos hacia la alberca",
    showcaseImages: [
      { src: "assets/img/villas/casa-de-las-estrellas-1.webp", alt: "Casa de las Estrellas' dining and lounge area opening to the pool", altEs: "El comedor y la sala de estar de Casa de las Estrellas, abiertos hacia la alberca" },
      { src: "assets/img/villas/casa-de-las-estrellas-2.webp", alt: "A suite at Casa de las Estrellas with a wood headboard and garden view", altEs: "Una suite en Casa de las Estrellas con cabecera de madera y vista al jardín" },
      { src: "assets/img/villas/casa-de-las-estrellas-3.webp", alt: "The covered terrace and plunge pool at Casa de las Estrellas", altEs: "La terraza cubierta y la alberca chica de Casa de las Estrellas" }
    ],
    amenities: [
      { en: "Private heated pool", es: "Alberca privada climatizada", cat: "outdoor" },
      { en: "Jacuzzi", es: "Jacuzzi", cat: "outdoor" },
      { en: "Ocean view", es: "Vista al mar", cat: "views" },
      { en: "Beach view", es: "Vista a la playa", cat: "views" },
      { en: "High-Speed WiFi", es: "Wi-Fi de alta velocidad", cat: "comfort" },
      { en: "Air conditioning", es: "Aire acondicionado", cat: "comfort" },
      { en: "Smart TV", es: "Smart TV", cat: "comfort" },
      { en: "Outdoor grill", es: "Parrilla exterior", cat: "outdoor" }
    ],
    amenitiesMore: [
      { en: "Sound system", es: "Sistema de sonido", cat: "comfort" },
      { en: "Safe", es: "Caja fuerte", cat: "comfort" },
      { en: "Washing machine", es: "Lavadora", cat: "comfort" },
      { en: "Dryer", es: "Secadora", cat: "comfort" },
      { en: "Hair dryer", es: "Secadora de pelo", cat: "comfort" },
      { en: "Iron", es: "Plancha", cat: "comfort" },
      { en: "Room-darkening shades", es: "Cortinas blackout", cat: "comfort" },
      { en: "Board games", es: "Juegos de mesa", cat: "comfort" },
      { en: "Beach essentials", es: "Esenciales de playa", cat: "comfort" },
      { en: "Coffee/tea maker", es: "Cafetera/tetera", cat: "kitchen" },
      { en: "Toaster", es: "Tostador", cat: "kitchen" },
      { en: "Microwave", es: "Microondas", cat: "kitchen" },
      { en: "Oven", es: "Horno", cat: "kitchen" },
      { en: "Stove", es: "Estufa", cat: "kitchen" },
      { en: "Refrigerator", es: "Refrigerador", cat: "kitchen" },
      { en: "Electric kettle", es: "Hervidor eléctrico", cat: "kitchen" },
      { en: "Blender", es: "Licuadora", cat: "kitchen" },
      { en: "Ice maker", es: "Máquina de hielo", cat: "kitchen" },
      { en: "Balcony", es: "Balcón", cat: "outdoor" },
      { en: "Deck / patio", es: "Terraza / patio", cat: "outdoor" },
      { en: "Outdoor sun loungers", es: "Camastros exteriores", cat: "outdoor" },
      { en: "Communal tennis court", es: "Cancha de tenis comunitaria", cat: "outdoor" },
      { en: "Water sports gear", es: "Equipo de deportes acuáticos", cat: "outdoor" }
    ],
    services: ["housekeeping", "concierge", "itinerary", "chef", "transfer", "spa", "grocery", "excursions"],
    /* Real Casa de las Estrellas photography per service — see the note on Villa Aqua above. */
    serviceImages: {
      housekeeping: "../assets/img/villas/casa-de-las-estrellas-rooms-01.webp",
      itinerary: "../assets/img/villas/casa-de-las-estrellas-rooms-26.webp",
      chef: "../assets/img/villas/casa-de-las-estrellas-kitchen-03.webp",
      grocery: "../assets/img/villas/casa-de-las-estrellas-kitchen-02.webp",
      excursions: "../assets/img/villas/casa-de-las-estrellas-kitchen-09.webp"
    },
    gallery: [
      { key: "outdoor", images: [
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-01.webp",
          alt: "The open-air dining and lounge terrace, steps from the heated plunge pool", altEs: "La terraza de comedor y sala al aire libre, a pasos de la alberca climatizada" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-02.webp",
          alt: "The covered outdoor lounge opening into the dining room, steps from the pool", altEs: "La sala exterior cubierta que se abre hacia el comedor, a pasos de la alberca" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-03.webp",
          alt: "The tiled plunge pool framed by palms just off the covered terrace", altEs: "La alberca de azulejo enmarcada por palmeras, junto a la terraza cubierta" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-04.webp",
          alt: "The pool terrace at Casa de las Estrellas — photo 1", altEs: "La terraza de la alberca en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-05.webp",
          alt: "The pool terrace at Casa de las Estrellas — photo 2", altEs: "La terraza de la alberca en Casa de las Estrellas — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-06.webp",
          alt: "The garden entrance at Casa de las Estrellas — photo 1", altEs: "La entrada ajardinada en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-07.webp",
          alt: "The garden entrance at Casa de las Estrellas — photo 2", altEs: "La entrada ajardinada en Casa de las Estrellas — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-outdoor-08.webp",
          alt: "The garden entrance at Casa de las Estrellas — photo 3", altEs: "La entrada ajardinada en Casa de las Estrellas — foto 3" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-09.webp",
          alt: "The plunge pool framed by palms, seen from the covered terrace", altEs: "La alberca chica enmarcada por palmeras, vista desde la terraza cubierta" }
      ] },
      { key: "living", images: [
        { src: "../assets/img/villas/casa-de-las-estrellas-living-01.webp",
          alt: "A sitting area with white slipcovered sofas, opening onto the garden", altEs: "Una sala con sofás blancos, abierta hacia el jardín" },
        { src: "../assets/img/villas/casa-de-las-estrellas-living-02.webp",
          alt: "A quiet lounge with a tall mirror and pampas grass accents", altEs: "Una sala tranquila con espejo alto y detalles de plumas de pampa" },
        { src: "../assets/img/villas/casa-de-las-estrellas-living-03.webp",
          alt: "A media lounge with a stone accent column and garden views", altEs: "Una sala de estar con columna de piedra y vista al jardín" },
        { src: "../assets/img/villas/casa-de-las-estrellas-living-04.webp",
          alt: "A living room at Casa de las Estrellas — photo 1", altEs: "Una sala en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-living-05.webp",
          alt: "A living room at Casa de las Estrellas — photo 2", altEs: "Una sala en Casa de las Estrellas — foto 2" }
      ] },
      { key: "kitchen", images: [
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-02.webp",
          alt: "The dining area seen from the kitchen, open to the tropical garden", altEs: "El área de comedor vista desde la cocina, abierta hacia el jardín tropical" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-03.webp",
          alt: "The fully equipped kitchen, with a wood island and bar seating", altEs: "La cocina totalmente equipada, con isla de madera y barra" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-04.webp",
          alt: "The dining area at Casa de las Estrellas — photo 1", altEs: "El área de comedor en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-05.webp",
          alt: "The dining area at Casa de las Estrellas — photo 2", altEs: "El área de comedor en Casa de las Estrellas — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-06.webp",
          alt: "The dining area at Casa de las Estrellas — photo 3", altEs: "El área de comedor en Casa de las Estrellas — foto 3" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-07.webp",
          alt: "The dining area at Casa de las Estrellas — photo 4", altEs: "El área de comedor en Casa de las Estrellas — foto 4" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-08.webp",
          alt: "The dining area at Casa de las Estrellas — photo 5", altEs: "El área de comedor en Casa de las Estrellas — foto 5" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-09.webp",
          alt: "The dining table set for a family dinner", altEs: "La mesa del comedor puesta para una cena familiar" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-10.webp",
          alt: "The dining area at Casa de las Estrellas — photo 6", altEs: "El área de comedor en Casa de las Estrellas — foto 6" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-11.webp",
          alt: "The dining area at Casa de las Estrellas — photo 7", altEs: "El área de comedor en Casa de las Estrellas — foto 7" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-12.webp",
          alt: "The dining area at Casa de las Estrellas — photo 8", altEs: "El área de comedor en Casa de las Estrellas — foto 8" },
        { src: "../assets/img/villas/casa-de-las-estrellas-kitchen-13.webp",
          alt: "The kitchen at Casa de las Estrellas — photo 1", altEs: "La cocina en Casa de las Estrellas — foto 1" }
      ] },
      { key: "rooms", images: [
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-01.webp",
          alt: "A suite with a brick barrel-vault ceiling and a sitting area beyond", altEs: "Una suite con techo abovedado de ladrillo y una sala de estar al fondo" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-02.webp",
          alt: "The private terrace off a suite, with a hanging egg chair and garden views", altEs: "La terraza privada de una suite, con silla colgante y vista al jardín" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-03.webp",
          alt: "A twin bedroom with butterfly-print pillows and string lights", altEs: "Una recámara con camas dobles, cojines de mariposas y luces de hadas" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-04.webp",
          alt: "A bedroom with a fuchsia pillow arrangement, opening to an ocean-view terrace", altEs: "Una recámara con cojines fucsia, abierta hacia una terraza con vista al mar" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-05.webp",
          alt: "A bedroom with a gray sofa and cowhide rug", altEs: "Una recámara con sofá gris y tapete de piel de vaca" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-06.webp",
          alt: "Bedroom 1 (Master) — photo 1", altEs: "Recámara 1 (Principal) — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-07.webp",
          alt: "Bedroom 1 (Master) — photo 2", altEs: "Recámara 1 (Principal) — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-08.webp",
          alt: "Bedroom 1 (Master) — photo 3", altEs: "Recámara 1 (Principal) — foto 3" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-09.webp",
          alt: "Bedroom 1 (Master) — photo 4", altEs: "Recámara 1 (Principal) — foto 4" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-10.webp",
          alt: "Bedroom 1 (Master) — photo 5", altEs: "Recámara 1 (Principal) — foto 5" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-11.webp",
          alt: "Bedroom 1 (Master) — photo 6", altEs: "Recámara 1 (Principal) — foto 6" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-12.webp",
          alt: "The ensuite bathroom of Bedroom 1, with dual vessel sinks", altEs: "El baño de la Recámara 1, con doble lavabo tipo vessel" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-13.webp",
          alt: "Bedroom 1 (Master) — photo 7", altEs: "Recámara 1 (Principal) — foto 7" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-14.webp",
          alt: "Bedroom 2 — photo 1", altEs: "Recámara 2 — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-15.webp",
          alt: "Bedroom 2 — photo 2", altEs: "Recámara 2 — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-16.webp",
          alt: "Bedroom 2 — photo 3", altEs: "Recámara 2 — foto 3" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-17.webp",
          alt: "The private terrace off Bedroom 2, with a wicker armchair", altEs: "La terraza privada de la Recámara 2, con sillón de mimbre" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-18.webp",
          alt: "The ensuite bathroom of Bedroom 2", altEs: "El baño de la Recámara 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-19.webp",
          alt: "Bedroom 2 — photo 4", altEs: "Recámara 2 — foto 4" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-20.webp",
          alt: "Bedroom 3 — photo 1", altEs: "Recámara 3 — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-21.webp",
          alt: "Bedroom 3 — photo 2", altEs: "Recámara 3 — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-22.webp",
          alt: "The private terrace off Bedroom 3, with palm-tree views", altEs: "La terraza privada de la Recámara 3, con vista a las palmeras" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-23.webp",
          alt: "Bedroom 3 — photo 3", altEs: "Recámara 3 — foto 3" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-24.webp",
          alt: "Bedroom 3 — photo 4", altEs: "Recámara 3 — foto 4" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-25.webp",
          alt: "Bedroom 3 — photo 5", altEs: "Recámara 3 — foto 5" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-26.webp",
          alt: "The ensuite bathroom of Bedroom 3, with a rainfall shower", altEs: "El baño de la Recámara 3, con regadera de lluvia" },
        { src: "../assets/img/villas/casa-de-las-estrellas-rooms-27.webp",
          alt: "Bedroom 4 — photo 1", altEs: "Recámara 4 — foto 1" }
      ],
        // Per-bedroom split for the room picker, derived from each photo's "Bedroom N" alt tag above.
        roomImages: [
          [5, 6, 7, 8, 9, 10, 11, 12],
          [13, 14, 15, 16, 17, 18],
          [19, 20, 21, 22, 23, 24, 25],
          [26]
        ]
      },
      { key: "interiors", images: [
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-01.webp",
          alt: "The entrance hall, dressed in stacked stone and warm travertine", altEs: "El vestíbulo de entrada, con piedra apilada y travertino cálido" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-02.webp",
          alt: "A powder room with a live-edge wood vanity and woven pendant lights", altEs: "Un medio baño con tocador de madera de borde vivo y lámparas de fibra tejida" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-03.webp",
          alt: "The staircase, lit by a sculptural chandelier and backlit onyx niches", altEs: "La escalera, iluminada por un candelabro escultural y nichos de ónix" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-04.webp",
          alt: "A detail view at Casa de las Estrellas — photo 1", altEs: "Un detalle en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-05.webp",
          alt: "A stairwell detail at Casa de las Estrellas", altEs: "Un detalle de la escalera en Casa de las Estrellas" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-06.webp",
          alt: "A hallway detail at Casa de las Estrellas — photo 1", altEs: "Un detalle del pasillo en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-07.webp",
          alt: "The corridor leading to the independent studio's private entrance", altEs: "El pasillo hacia la entrada privada del estudio independiente" },
        { src: "../assets/img/villas/casa-de-las-estrellas-interiors-08.webp",
          alt: "The covered carport and front entrance, framed by palms", altEs: "La cochera techada y la entrada principal, enmarcadas por palmeras" }
      ] },
      { key: "multipurpose", images: [
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-01.webp",
          alt: "The independent studio's kitchenette, with its own dining table", altEs: "La kitchenette del estudio independiente, con su propia mesa de comedor" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-02.webp",
          alt: "The independent studio's dining nook, with a live-edge wood table", altEs: "El rincón de comedor del estudio independiente, con mesa de madera de borde vivo" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-03.webp",
          alt: "The independent studio's bedroom, with a frosted-glass sliding door", altEs: "La recámara del estudio independiente, con puerta corrediza de vidrio esmerilado" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-04.webp",
          alt: "The independent studio at Casa de las Estrellas — photo 1", altEs: "El estudio independiente en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-05.webp",
          alt: "The independent studio at Casa de las Estrellas — photo 2", altEs: "El estudio independiente en Casa de las Estrellas — foto 2" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-06.webp",
          alt: "The independent studio at Casa de las Estrellas — photo 3", altEs: "El estudio independiente en Casa de las Estrellas — foto 3" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-07.webp",
          alt: "The independent studio's kitchenette at Casa de las Estrellas — photo 1", altEs: "La kitchenette del estudio independiente en Casa de las Estrellas — foto 1" },
        { src: "../assets/img/villas/casa-de-las-estrellas-multipurpose-08.webp",
          alt: "The independent studio's kitchenette at Casa de las Estrellas — photo 2", altEs: "La kitchenette del estudio independiente en Casa de las Estrellas — foto 2" }
      ] }
    ],
    /* First 5 faqs are the curated "most important" set shown in the
       villa-detail FAQ showcase; the rest appear in the scrollable
       "more questions" panel when a visitor clicks to expand it (see
       main.js FAQ_PREVIEW_COUNT). Order matters — keep the top 5 first. */
    faqs: [
      {
        q: { en: "How many guests can Casa de las Estrellas accommodate, and what's the bedroom configuration?", es: "¿Cuántos huéspedes puede alojar Casa de las Estrellas y cuál es la configuración de recámaras?" },
        a: { en: "Up to 10 guests, across 3 bedrooms in the main house plus an independent studio. The Master Bedroom has a king bed with ensuite bathroom, Bedroom 2 has 2 double beds with ensuite bathroom, and Bedroom 3 has a queen bed with ensuite bathroom. The studio has its own exterior entrance and access to the main house's ground floor, making it a comfortable option for guests who want extra privacy.", es: "Hasta 10 huéspedes, en 3 recámaras en la casa principal más un estudio independiente. La Recámara Principal tiene cama king con baño propio, la Recámara 2 tiene 2 camas matrimoniales con baño propio, y la Recámara 3 tiene cama queen con baño propio. El estudio tiene su propia entrada exterior y acceso a la planta baja de la casa principal, lo que lo hace una opción cómoda para huéspedes que buscan privacidad extra." }
      },
      {
        q: { en: "Where is Casa de las Estrellas located, and how close is the beach?", es: "¿Dónde está ubicada Casa de las Estrellas y qué tan cerca está la playa?" },
        a: { en: "In Playacar Phase I, one of Playa del Carmen's exclusive gated communities with 24-hour security and controlled access. The villa isn't beachfront, but it's exceptionally close — the beach access is just steps away, with the sand roughly 50 meters or less from the property. Fifth Avenue and Playa del Carmen's restaurants and shops are also within a short walk.", es: "En Playacar Fase I, uno de los fraccionamientos exclusivos y privados de Playa del Carmen, con seguridad 24 horas y acceso controlado. La villa no está frente al mar, pero está excepcionalmente cerca — el acceso a la playa está a pasos, con la arena a unos 50 metros o menos de la propiedad. La Quinta Avenida y los restaurantes y tiendas de Playa del Carmen también están a una caminata corta." }
      },
      {
        q: { en: "Is Casa de las Estrellas completely private?", es: "¿Casa de las Estrellas es completamente privada?" },
        a: { en: "If reserved with the full 4-bedroom configuration (main house plus studio), the villa is exclusively for your group. If you reserve 3 bedrooms or fewer, the studio may be leased to another guest — but it has its own independent entrance and that guest won't have access to the main house, so your privacy isn't affected.", es: "Si se reserva con la configuración completa de 4 recámaras (casa principal más estudio), la villa es exclusiva para tu grupo. Si reservas 3 recámaras o menos, el estudio puede rentarse a otro huésped — pero tiene su propia entrada independiente y ese huésped no tendrá acceso a la casa principal, así que tu privacidad no se ve afectada." }
      },
      {
        q: { en: "What services are included, and who assists us during our stay?", es: "¿Qué servicios están incluidos y quién nos asiste durante la estancia?" },
        a: { en: "Every stay includes daily housekeeping, maintenance and concierge service. Our concierge team is available to help with anything related to the villa, plus transportation, restaurant reservations, activities and special arrangements to make your stay effortless.", es: "Cada estancia incluye housekeeping diario, mantenimiento y servicio de concierge. Nuestro equipo de concierge está disponible para ayudarte con cualquier cosa relacionada con la villa, además de transporte, reservaciones de restaurantes, actividades y arreglos especiales para que tu estancia sea sin complicaciones." }
      },
      {
        q: { en: "Can you arrange a private chef?", es: "¿Pueden organizar un chef privado?" },
        a: { en: "Yes, private chef service can be arranged on request for breakfast, lunch, dinner or customized culinary experiences, at an additional cost. Our team can help coordinate the menu and service to your group's preferences.", es: "Sí, el servicio de chef privado se puede organizar bajo solicitud para desayuno, comida, cena o experiencias culinarias personalizadas, con costo adicional. Nuestro equipo puede ayudar a coordinar el menú y el servicio según las preferencias de tu grupo." }
      },
      {
        q: { en: "What amenities does Casa de las Estrellas offer?", es: "¿Qué amenidades ofrece Casa de las Estrellas?" },
        a: { en: "Outdoors: cozy lounge areas, a heated plunge pool, a rooftop terrace with a private jacuzzi and ocean views, a grill and beach essentials. Indoors: a fully equipped kitchen, living room, sound system, air conditioning, Wi-Fi, washer/dryer and cable TV. Every bedroom has a private ensuite bathroom, luxury linens, air conditioning, a hair dryer and room-darkening shades.", es: "Al aire libre: acogedoras áreas de estar, alberca climatizada, terraza en la azotea con jacuzzi privado y vista al mar, parrilla y esenciales de playa. Interior: cocina totalmente equipada, sala, sistema de sonido, aire acondicionado, Wi-Fi, lavadora/secadora y TV por cable. Cada recámara tiene baño propio, blancos de lujo, aire acondicionado, secadora de pelo y cortinas blackout." }
      },
      {
        q: { en: "Is Casa de las Estrellas suitable for families, groups of friends, or bachelor/bachelorette parties?", es: "¿Casa de las Estrellas es adecuada para familias, grupos de amigos o despedidas de soltero/soltera?" },
        a: { en: "Yes to all three. It's very family-friendly — the independent studio is especially convenient for families who want extra privacy while staying connected to the main house — and the mix of shared and private spaces suits groups of friends well. Bachelor and bachelorette groups may be welcome with prior approval, provided the group respects the villa guidelines and Playacar's peaceful residential character.", es: "Sí, para los tres. Es muy familiar — el estudio independiente es especialmente conveniente para familias que buscan privacidad extra sin dejar de estar conectadas con la casa principal — y la mezcla de espacios compartidos y privados funciona bien para grupos de amigos. Los grupos de despedida de soltero o soltera pueden ser bienvenidos con aprobación previa, siempre que respeten los lineamientos de la villa y el carácter residencial y tranquilo de Playacar." }
      },
      {
        q: { en: "Can we have visitors or bring outside vendors?", es: "¿Podemos recibir visitas o traer proveedores externos?" },
        a: { en: "Only registered guests are permitted to stay; visitors require prior authorization, must be registered in advance with our concierge, and are subject to an additional fee. Outside vendors and service providers aren't permitted unless previously authorized — let us know in advance if you'd like to bring a specific provider, as additional fees may apply.", es: "Solo los huéspedes registrados pueden hospedarse; las visitas requieren autorización previa, deben registrarse con anticipación con nuestro concierge y tienen un cargo adicional. Los proveedores externos no están permitidos a menos que se autoricen previamente — avísanos con anticipación si quieres traer un proveedor específico, ya que pueden aplicar cargos adicionales." }
      },
      {
        q: { en: "Is sargassum a concern on the beach?", es: "¿El sargazo es un problema en la playa?" },
        a: { en: "Sargassum is a natural seasonal phenomenon in the Riviera Maya, and its presence varies with weather and ocean currents, so we can't guarantee sargassum-free beaches. The beach is regularly maintained when conditions allow.", es: "El sargazo es un fenómeno estacional natural de la Riviera Maya, y su presencia varía según el clima y las corrientes marinas, por lo que no podemos garantizar playas libres de sargazo. La playa se mantiene regularmente cuando las condiciones lo permiten." }
      },
      {
        q: { en: "What can we do near Casa de las Estrellas?", es: "¿Qué podemos hacer cerca de Casa de las Estrellas?" },
        a: { en: "Our concierge can arrange beach clubs, restaurants and Fifth Avenue, Mayan archaeological sites, cenotes and underground rivers, snorkeling and diving, yacht and boat excursions, golf, spa and wellness experiences, and day trips to Tulum, Cozumel, Cancún and other destinations.", es: "Nuestro concierge puede organizar beach clubs, restaurantes y la Quinta Avenida, sitios arqueológicos mayas, cenotes y ríos subterráneos, esnórquel y buceo, excursiones en yate o lancha, golf, experiencias de spa y bienestar, y viajes de un día a Tulum, Cozumel, Cancún y otros destinos." }
      },
      {
        q: { en: "What time is check-in and check-out?", es: "¿A qué hora son el check-in y el check-out?" },
        a: { en: "Check-in is at 3:00 PM and check-out at 11:00 AM. Early check-in or late check-out may be possible depending on availability.", es: "El check-in es a las 3:00 PM y el check-out a las 11:00 AM. Puede haber check-in anticipado o check-out tardío según disponibilidad." }
      },
      {
        q: { en: "Are pets allowed?", es: "¿Se aceptan mascotas?" },
        a: { en: "Please contact our team regarding pets, as any accommodation is subject to prior approval and applicable fees.", es: "Por favor contacta a nuestro equipo respecto a mascotas, ya que cualquier acomodo está sujeto a aprobación previa y tarifas aplicables." }
      },
      {
        q: { en: "Is a security deposit required?", es: "¿Se requiere un depósito de garantía?" },
        a: { en: "Yes, a refundable security deposit of $1,000 USD is required for the stay.", es: "Sí, se requiere un depósito de garantía reembolsable de $1,000 USD para la estancia." }
      },
      {
        q: { en: "How does pricing work, and what's the minimum stay?", es: "¿Cómo funciona el precio y cuál es la estancia mínima?" },
        a: { en: "Casa de las Estrellas offers flexible accommodation options, with rates based on the number of guests and bedrooms required — contact our team for the rate applicable to your group and dates. Minimum stays vary by season; during the Christmas and New Year's period, a 7-night minimum may apply.", es: "Casa de las Estrellas ofrece opciones de hospedaje flexibles, con tarifas según el número de huéspedes y recámaras requeridas — contacta a nuestro equipo para la tarifa aplicable a tu grupo y fechas. La estancia mínima varía según la temporada; durante el periodo de Navidad y Año Nuevo puede aplicar un mínimo de 7 noches." }
      }
    ]
  }
];

/* Shared service definitions (image + alt) for the per-villa services carousel.
   Copy/title/tag text reuses the same i18n keys as the Our Services page
   (services.<id>.tag / .title / .body), so translations stay in one place.
   Each villa lists which of these it offers via its `services` array above. */
/* Whether each service is included in the rate or an extra-cost add-on.
   Photos are no longer sourced here — each villa now points its own
   `serviceImages` (see above) at real photography of that property, one
   image per service, instead of a shared stock photo. */
const MLS_SERVICE_DEFS = {
  housekeeping: { included: true },
  concierge: { included: true },
  itinerary: { included: true },
  chef: { included: false },
  transfer: { included: false },
  spa: { included: false },
  grocery: { included: false },
  events: { included: false },
  wine: { included: false },
  excursions: { included: false }
};

/* Renders one alternating showcase row (Our Villas page) — a photo carousel
   on one side, name/description/specs/CTA on the other. `index` decides
   which side the photo sits on (even = left, odd = right). */
function mlsVillaShowcaseRow(villa, index, basePath = "") {
  const lang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
  const t = typeof window.mlsT === "function" ? window.mlsT : (key) => key;
  const destinationLabel = (lang === "es" && villa.destinationLabelEs) || villa.destinationLabel;
  const short = (lang === "es" && villa.shortEs) || villa.short;
  const imageAlt = (lang === "es" && villa.imageAltEs) || villa.imageAlt;

  let slides;
  if (villa.showcaseImages && villa.showcaseImages.length) {
    slides = villa.showcaseImages.map((s) => ({ src: s.src, alt: (lang === "es" && s.altEs) || s.alt }));
  } else {
    slides = [{ src: villa.image, alt: imageAlt }];
    (villa.gallery || []).forEach((cat) => {
      const first = cat.images && cat.images[0];
      if (first) slides.push({ src: first.src, alt: (lang === "es" && first.altEs) || first.alt });
    });
  }

  /* Only the first slide loads up front; the rest keep their source in
     data-src/data-srcset until the carousel shows them (see
     mlsShowRowSlide in main.js) — they're stacked in view, so
     loading="lazy" alone would still fetch every photo on page load. */
  const slidesHtml = slides
    .map((s, i) => i === 0
      ? `<img class="villa-row-slide is-active" src="${s.src}"${mlsSrcAttrs(s.src)} alt="${s.alt}" loading="eager" width="1200" height="900" data-slide-index="${i}">`
      : `<img class="villa-row-slide" data-src="${s.src}"${mlsSrcAttrs(s.src).replace(" srcset=", " data-srcset=")} alt="${s.alt}" width="1200" height="900" data-slide-index="${i}">`)
    .join("");
  const dotsHtml = slides.length > 1
    ? `<div class="carousel-dots" data-carousel-dots>${slides
        .map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " is-active" : ""}" data-carousel-dot="${i}" aria-label="${t("villas.showcase.photo", lang).replace("{n}", i + 1)}"></button>`)
        .join("")}</div>`
    : "";
  const arrowsHtml = slides.length > 1
    ? `<button type="button" class="carousel-arrow carousel-prev" data-carousel-prev aria-label="${t("villas.showcase.prevPhoto", lang)}">
         <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </button>
       <button type="button" class="carousel-arrow carousel-next" data-carousel-next aria-label="${t("villas.showcase.nextPhoto", lang)}">
         <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </button>`
    : "";

  return `
    <article class="villa-row reveal${index % 2 === 1 ? " villa-row--reverse" : ""}" data-villa-row>
      <div class="villa-row-media" data-carousel>
        <span class="villa-location">${destinationLabel}</span>
        <a class="villa-row-slides" href="${basePath}villas/${villa.slug}.html" aria-label="${villa.name}">${slidesHtml}</a>
        ${arrowsHtml}
        ${dotsHtml}
      </div>
      <div class="villa-row-body">
        <h2 class="h2"><a href="${basePath}villas/${villa.slug}.html">${villa.name}</a></h2>
        <p class="villa-row-desc">${short}</p>
        <div class="villa-row-specs">
          <span>${lang === "es" ? `${villa.area} m&sup2;` : `${Math.round(villa.area * 10.7639).toLocaleString("en-US")} ${t("card.sqft", lang)}`}</span>
          <span>${villa.bedrooms} ${t("card.bedrooms", lang)}</span>
          <span>${villa.guests} ${t("card.guests", lang)}</span>
        </div>
        <a class="btn btn-solid" href="${basePath}villas/${villa.slug}.html">${t("villas.showcase.explore", lang)}</a>
      </div>
    </article>`;
}
