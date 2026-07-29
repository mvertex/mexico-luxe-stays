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
   └─────────────────────────────────────────────────────────────────────┘

   Content sourced from the client's Hostaway listings (July 2026).
   Images are verified stock PLACEHOLDERS — replace with real photography.

   Villa names are proper nouns and stay identical in both languages;
   `*Es` fields hold the Spanish counterpart used by the language toggle.
   `amenities` renders visible by default; `amenitiesMore` sits behind
   the "Show all amenities" button on detail pages.
   ========================================================================== */

const MLS_VILLAS = [
  {
    slug: "villa-aqua",
    name: "Villa Aqua",
    destination: "playa-del-carmen",
    destinationLabel: "Playa del Carmen",
    destinationLabelEs: "Playa del Carmen",
    guests: 18,
    bedrooms: 6,
    beds: 11,
    baths: 6,
    area: 1200,
    featured: true,
    short: "A fully staffed private resort in gated Playacar — pool and jacuzzi, squash court and gym, with a chef and butler who make every day effortless.",
    shortEs: "Un resort privado con personal completo en Playacar — alberca y jacuzzi, cancha de squash y gimnasio, con chef y mayordomo que hacen cada día sin esfuerzo.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Villa Aqua's pool terrace in full Caribbean daylight",
    imageAltEs: "La terraza de la alberca de Villa Aqua bajo la luz del Caribe",
    showcaseImages: [
      { src: "assets/img/villas/villa-aqua-1.webp", alt: "Villa Aqua's pool deck and jacuzzi framed by palm trees", altEs: "La terraza de la alberca y el jacuzzi de Villa Aqua, enmarcados por palmeras" },
      { src: "assets/img/villas/villa-aqua-2.webp", alt: "Villa Aqua's curved facade and circular garden entrance at dusk", altEs: "La fachada curva y el jardín circular de entrada a Villa Aqua al atardecer" },
      { src: "assets/img/villas/villa-aqua-3.webp", alt: "Villa Aqua glowing at night around the reflecting pool", altEs: "Villa Aqua iluminada de noche alrededor de la alberca" },
      { src: "assets/img/villas/villa-aqua-4.webp", alt: "The glass-walled living pavilion at Villa Aqua opening onto the pool", altEs: "El pabellón de estar con muros de cristal en Villa Aqua, abierto hacia la alberca" },
      { src: "assets/img/villas/villa-aqua-5.webp", alt: "Villa Aqua's terrace and pool at sunset", altEs: "La terraza y la alberca de Villa Aqua al atardecer" }
    ],
    amenities: [
      { en: "Private pool & jacuzzi", es: "Alberca privada y jacuzzi" },
      { en: "Private squash court", es: "Cancha de squash privada" },
      { en: "Fully equipped gym", es: "Gimnasio totalmente equipado" },
      { en: "Wood-fired oven & outdoor grill", es: "Horno de leña y parrilla exterior" },
      { en: "Chef & butler included", es: "Chef y mayordomo incluidos" },
      { en: "Daily housekeeping", es: "Limpieza diaria" },
      { en: "24/7 concierge", es: "Concierge 24/7" },
      { en: "Honor bar", es: "Honor bar" },
      { en: "Sonos & Bose sound system", es: "Sistema de sonido Sonos y Bose" },
      { en: "Minutes from the beach & Quinta Avenida", es: "A minutos de la playa y la Quinta Avenida" }
    ],
    amenitiesMore: [
      { en: "Bartender included", es: "Bartender incluido" },
      { en: "Grocery pre-stocking on request", es: "Despensa precargada bajo solicitud" },
      { en: "Outdoor dining areas", es: "Comedores al aire libre" },
      { en: "Basketball hoop", es: "Aro de básquetbol" },
      { en: "Ping pong & board games", es: "Ping pong y juegos de mesa" },
      { en: "Smart TVs & fast Wi-Fi (100+ Mbps)", es: "Smart TVs y Wi-Fi rápido (100+ Mbps)" },
      { en: "Air conditioning throughout", es: "Aire acondicionado en toda la villa" },
      { en: "Baby crib & high chair", es: "Cuna y silla alta" },
      { en: "Electric vehicle charger", es: "Cargador para auto eléctrico" },
      { en: "Communal tennis court", es: "Cancha de tenis comunitaria" },
      { en: "In-villa safe", es: "Caja fuerte" },
      { en: "Free private parking", es: "Estacionamiento privado gratuito" },
      { en: "Washer & dryer", es: "Lavadora y secadora" },
      { en: "Complimentary airport transfer (4+ nights)", es: "Traslado al aeropuerto de cortesía (4+ noches)" }
    ],
    gallery: [
      { key: "outdoor", images: [
        { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80",
          alt: "The pool deck at Villa Aqua, framed by palms", altEs: "La terraza de la alberca en Villa Aqua, enmarcada por palmeras" },
        { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
          alt: "The outdoor lounge at golden hour", altEs: "El salón exterior a la hora dorada" },
        { src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80",
          alt: "The infinity edge, waiting for its next swimmer", altEs: "La orilla infinita, esperando a su próximo nadador" }
      ] },
      { key: "rooms", images: [
        { src: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1400&q=80",
          alt: "One of Villa Aqua's six suites, dressed in linen", altEs: "Una de las seis suites de Villa Aqua, vestida en lino" },
        { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80",
          alt: "A suite dressed for arrival night", altEs: "Una suite lista para la noche de llegada" },
        { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80",
          alt: "An ensuite bath, quiet in the afternoon", altEs: "Un baño privado, tranquilo por la tarde" }
      ] },
      { key: "interiors", images: [
        { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
          alt: "The great room, layered in stone and linen", altEs: "La sala principal, en capas de piedra y lino" },
        { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
          alt: "The double-height living room in warm wood", altEs: "La sala de doble altura en madera cálida" },
        { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80",
          alt: "A quiet corner, reset for the afternoon", altEs: "Un rincón tranquilo, listo para la tarde" }
      ] },
      { key: "multipurpose", images: [
        { src: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1400&q=80",
          alt: "The honor bar, poured and ready", altEs: "El honor bar, servido y listo" },
        { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
          alt: "The dining table, set for a chef's dinner", altEs: "La mesa, puesta para una cena de chef" },
        { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
          alt: "A flexible lounge, ready for its next use", altEs: "Un salón flexible, listo para su próximo uso" }
      ] }
    ]
  },
  {
    slug: "kasa-kefi",
    name: "Kasa Kefi",
    destination: "valle-de-guadalupe",
    destinationLabel: "Valle de Guadalupe",
    destinationLabelEs: "Valle de Guadalupe",
    guests: 12,
    bedrooms: 4,
    beds: 7,
    baths: 4,
    area: 400,
    featured: true,
    short: "A contemporary villa on a private vineyard estate — infinity plunge pool, fire-pit terraces, and Valle de Guadalupe's finest wineries minutes away.",
    shortEs: "Villa contemporánea en una finca vinícola privada — alberca infinita, terrazas con fogata y las mejores bodegas del Valle de Guadalupe a minutos.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Kasa Kefi overlooking the Kasa Kava vineyards",
    imageAltEs: "Kasa Kefi con vista a los viñedos de Kasa Kava",
    showcaseImages: [
      { src: "assets/img/villas/kasa-kefi-1.webp", alt: "Kasa Kefi perched above the vineyard, mountains behind", altEs: "Kasa Kefi asomada sobre el viñedo, con las montañas detrás" },
      { src: "assets/img/villas/kasa-kefi-2.webp", alt: "Kasa Kefi's living room with a wine rack and desert view", altEs: "La sala de Kasa Kefi con cava de vinos y vista al desierto" },
      { src: "assets/img/villas/kasa-kefi-3.webp", alt: "Kasa Kefi's rooftop terrace and pool overlooking the Valle de Guadalupe at dusk", altEs: "La terraza y alberca en la azotea de Kasa Kefi con vista al Valle de Guadalupe al atardecer" },
      { src: "assets/img/villas/kasa-kefi-4.webp", alt: "Kasa Kefi's rooftop lounge and fire pit overlooking the valley", altEs: "La sala exterior y fogata en la azotea de Kasa Kefi con vista al valle" }
    ],
    amenities: [
      { en: "Infinity plunge pool over the vineyard", es: "Alberca infinita sobre el viñedo" },
      { en: "Panoramic vineyard views", es: "Vistas panorámicas al viñedo" },
      { en: "Private fire-pit terrace in every suite", es: "Terraza privada con fogata en cada suite" },
      { en: "Wine cellar", es: "Cava de vinos" },
      { en: "Gourmet kitchen", es: "Cocina gourmet" },
      { en: "Ethanol fireplace", es: "Chimenea de etanol" },
      { en: "Al fresco dining & BBQ terrace", es: "Comedor al aire libre y terraza con BBQ" },
      { en: "Starlink high-speed Wi-Fi", es: "Wi-Fi de alta velocidad Starlink" },
      { en: "Sonos sound in living areas", es: "Sonido Sonos en las áreas comunes" },
      { en: "Ensuite bathrooms in every suite", es: "Baño propio en cada suite" }
    ],
    amenitiesMore: [
      { en: "Nespresso machines", es: "Máquinas Nespresso" },
      { en: "Smart TVs & Amazon Echo", es: "Smart TVs y Amazon Echo" },
      { en: "Heating & air conditioning", es: "Calefacción y aire acondicionado" },
      { en: "Sun beds & lounge seating", es: "Camastros y salas lounge" },
      { en: "In-suite safes", es: "Cajas fuertes en las suites" },
      { en: "Steamers & hair dryers", es: "Vaporizadores y secadoras de pelo" },
      { en: "Washer & dryer", es: "Lavadora y secadora" },
      { en: "Board games", es: "Juegos de mesa" },
      { en: "Master suite with private entrance", es: "Suite principal con entrada propia" },
      { en: "Minutes from top wineries & Michelin-starred dining", es: "A minutos de las mejores bodegas y restaurantes con estrella Michelin" },
      { en: "Free parking", es: "Estacionamiento gratuito" }
    ],
    gallery: [
      { key: "outdoor", images: [
        { src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=80",
          alt: "Vineyard rows surrounding the estate", altEs: "Hileras de viñedo rodeando la finca" },
        { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80",
          alt: "The infinity plunge pool above the vines", altEs: "La alberca infinita sobre los viñedos" },
        { src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80",
          alt: "A fire-pit terrace at dusk", altEs: "Una terraza con fogata al atardecer" }
      ] },
      { key: "rooms", images: [
        { src: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1400&q=80",
          alt: "One of Kasa Kefi's four suites", altEs: "Una de las cuatro suites de Kasa Kefi" },
        { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80",
          alt: "An ensuite bath, quiet in the afternoon", altEs: "Un baño privado, tranquilo por la tarde" },
        { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80",
          alt: "A suite dressed for arrival night", altEs: "Una suite lista para la noche de llegada" }
      ] },
      { key: "interiors", images: [
        { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
          alt: "The loft living room with its ethanol fireplace", altEs: "La sala tipo loft con su chimenea de etanol" },
        { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80",
          alt: "A quiet corner, reset for the afternoon", altEs: "Un rincón tranquilo, listo para la tarde" },
        { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
          alt: "The dining room, built around its own cellar", altEs: "El comedor, construido alrededor de su propia cava" }
      ] },
      { key: "multipurpose", images: [
        { src: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1400&q=80",
          alt: "The wine cellar, waiting downstairs", altEs: "La cava de vino, esperando abajo" },
        { src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
          alt: "A glass poured before sunset", altEs: "Una copa servida antes del atardecer" },
        { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
          alt: "The dining table, set for a tasting", altEs: "La mesa, puesta para una cata" }
      ] }
    ]
  },
  {
    slug: "casa-corazon-luxe",
    name: "Casa Corazon Luxe",
    destination: "playa-del-carmen",
    destinationLabel: "Playa del Carmen",
    destinationLabelEs: "Playa del Carmen",
    guests: 22,
    bedrooms: 11,
    beds: 16,
    baths: 12,
    area: 1486,
    featured: true,
    short: "Our grandest beachfront address — eleven ensuite bedrooms, an infinity pool over the Caribbean, home cinema, and staff for twenty-two.",
    shortEs: "Nuestra dirección más grandiosa frente al mar — once recámaras con baño propio, alberca infinita sobre el Caribe, cine privado y personal para veintidós.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Casa Corazon Luxe's white courtyard architecture in afternoon light",
    imageAltEs: "La arquitectura blanca del patio de Casa Corazon Luxe en la luz de la tarde",
    showcaseImages: [
      { src: "assets/img/villas/casa-corazon-luxe-1.webp", alt: "Casa Corazon Luxe's palapa living room opening to the pool and the Caribbean", altEs: "La sala palapa de Casa Corazon Luxe, abierta hacia la alberca y el Caribe" },
      { src: "assets/img/villas/casa-corazon-luxe-2.webp", alt: "The tiled lap pool between Casa Corazon Luxe's casitas", altEs: "La alberca de azulejo entre las casitas de Casa Corazon Luxe" },
      { src: "assets/img/villas/casa-corazon-luxe-3.webp", alt: "A bedroom at Casa Corazon Luxe with a brick dome ceiling and an ocean-view hammock", altEs: "Una recámara en Casa Corazon Luxe con techo abovedado de ladrillo y hamaca con vista al mar" },
      { src: "assets/img/villas/casa-corazon-luxe-4.webp", alt: "The entrance and carport at Casa Corazon Luxe", altEs: "La entrada y el garage de Casa Corazon Luxe" },
      { src: "assets/img/villas/casa-corazon-luxe-5.webp", alt: "Casa Corazon Luxe's casitas seen from the beach", altEs: "Las casitas de Casa Corazon Luxe vistas desde la playa" }
    ],
    amenities: [
      { en: "Private beachfront access", es: "Acceso privado a la playa" },
      { en: "Infinity pool with ocean views", es: "Alberca infinita con vista al mar" },
      { en: "Home cinema", es: "Cine en casa" },
      { en: "Game room", es: "Salón de juegos" },
      { en: "Fully equipped gym", es: "Gimnasio totalmente equipado" },
      { en: "Private chef & butler (8 am–4 pm)", es: "Chef y mayordomo privados (8 am–4 pm)" },
      { en: "Daily housekeeping", es: "Limpieza diaria" },
      { en: "24/7 concierge & security", es: "Concierge y seguridad 24/7" },
      { en: "Complimentary round-trip airport transfer", es: "Traslado redondo al aeropuerto de cortesía" },
      { en: "Ensuite bathrooms in every bedroom", es: "Baño propio en cada recámara" }
    ],
    amenitiesMore: [
      { en: "Three living rooms", es: "Tres salas" },
      { en: "Two dining areas & two full kitchens", es: "Dos comedores y dos cocinas completas" },
      { en: "Hot tub", es: "Jacuzzi" },
      { en: "Foosball & ping pong", es: "Futbolito y ping pong" },
      { en: "Outdoor kitchen & grill", es: "Cocina exterior y parrilla" },
      { en: "Hammocks & outdoor lounges", es: "Hamacas y salas exteriores" },
      { en: "Suitable for events & celebrations", es: "Ideal para eventos y celebraciones" },
      { en: "Family friendly", es: "Ideal para familias" },
      { en: "Massage & spa on request", es: "Masajes y spa bajo solicitud" },
      { en: "Smart TVs & fast Wi-Fi (100+ Mbps)", es: "Smart TVs y Wi-Fi rápido (100+ Mbps)" },
      { en: "In-villa safe", es: "Caja fuerte" },
      { en: "Garage & free parking", es: "Cochera y estacionamiento gratuito" },
      { en: "Washer & dryer", es: "Lavadora y secadora" }
    ],
    gallery: [
      { key: "outdoor", images: [
        { src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80",
          alt: "The infinity pool at golden hour", altEs: "La alberca infinita a la hora dorada" },
        { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80",
          alt: "The private beachfront, steps from the terrace", altEs: "La playa privada, a pasos de la terraza" },
        { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
          alt: "The pool terrace by night", altEs: "La terraza de la alberca por la noche" }
      ] },
      { key: "rooms", images: [
        { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80",
          alt: "One of eleven ensuite bedrooms", altEs: "Una de las once recámaras con baño propio" },
        { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80",
          alt: "A suite dressed for arrival night", altEs: "Una suite lista para la noche de llegada" },
        { src: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1400&q=80",
          alt: "A bedroom in linen and morning light", altEs: "Una recámara en lino y luz de la mañana" }
      ] },
      { key: "interiors", images: [
        { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80",
          alt: "One of three living rooms", altEs: "Una de las tres salas" },
        { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
          alt: "The salon, in stone and warm wood", altEs: "El salón, en piedra y madera cálida" },
        { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
          alt: "One of two dining areas", altEs: "Uno de los dos comedores" }
      ] },
      { key: "multipurpose", images: [
        { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
          alt: "The home cinema, ready for movie night", altEs: "El cine en casa, listo para noche de película" },
        { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
          alt: "The dining table, set for a celebration", altEs: "La mesa, puesta para una celebración" },
        { src: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1400&q=80",
          alt: "The game room, ready for the evening", altEs: "El salón de juegos, listo para la noche" }
      ] }
    ]
  },
  {
    slug: "casa-de-las-estrellas",
    name: "Casa de las Estrellas",
    destination: "playa-del-carmen",
    destinationLabel: "Playa del Carmen",
    destinationLabelEs: "Playa del Carmen",
    guests: 10,
    bedrooms: 4,
    beds: 5,
    baths: 4,
    area: 460,
    featured: true,
    short: "A serene escape in gated Playacar — rooftop jacuzzi, heated plunge pool, and the beach a thirty-second walk from your door.",
    shortEs: "Un escape sereno en la comunidad cerrada de Playacar — jacuzzi en la azotea, alberca climatizada y la playa a treinta segundos de tu puerta.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Casa de las Estrellas' pool terrace framed by palms",
    imageAltEs: "La terraza de la alberca de Casa de las Estrellas enmarcada por palmeras",
    showcaseImages: [
      { src: "assets/img/villas/casa-de-las-estrellas-1.webp", alt: "Casa de las Estrellas' dining and lounge area opening to the pool", altEs: "El comedor y la sala de estar de Casa de las Estrellas, abiertos hacia la alberca" },
      { src: "assets/img/villas/casa-de-las-estrellas-2.webp", alt: "A suite at Casa de las Estrellas with a wood headboard and garden view", altEs: "Una suite en Casa de las Estrellas con cabecera de madera y vista al jardín" },
      { src: "assets/img/villas/casa-de-las-estrellas-3.webp", alt: "The covered terrace and plunge pool at Casa de las Estrellas", altEs: "La terraza cubierta y la alberca chica de Casa de las Estrellas" }
    ],
    amenities: [
      { en: "Thirty seconds from the beach", es: "A treinta segundos de la playa" },
      { en: "Rooftop terrace with private jacuzzi", es: "Terraza en la azotea con jacuzzi privado" },
      { en: "Heated plunge pool", es: "Alberca climatizada" },
      { en: "Ocean views", es: "Vistas al mar" },
      { en: "Independent studio with private entrance", es: "Estudio independiente con entrada propia" },
      { en: "Ensuite bathrooms in every suite", es: "Baño propio en cada suite" },
      { en: "Daily housekeeping", es: "Limpieza diaria" },
      { en: "24/7 concierge", es: "Concierge 24/7" },
      { en: "Private chef on request", es: "Chef privado bajo solicitud" },
      { en: "In-villa spa treatments on request", es: "Tratamientos de spa en la villa bajo solicitud" }
    ],
    amenitiesMore: [
      { en: "Sauna", es: "Sauna" },
      { en: "Outdoor grill & al fresco dining", es: "Parrilla y comidas al aire libre" },
      { en: "Fully equipped kitchen", es: "Cocina totalmente equipada" },
      { en: "Smart TVs & sound system", es: "Smart TVs y sistema de sonido" },
      { en: "Fast Wi-Fi (100+ Mbps)", es: "Wi-Fi rápido (100+ Mbps)" },
      { en: "Air conditioning throughout", es: "Aire acondicionado en toda la villa" },
      { en: "Beach essentials provided", es: "Artículos de playa incluidos" },
      { en: "Grocery pre-stocking on request", es: "Despensa precargada bajo solicitud" },
      { en: "Bartender on request", es: "Bartender bajo solicitud" },
      { en: "In-villa safe", es: "Caja fuerte" },
      { en: "Washer & dryer", es: "Lavadora y secadora" },
      { en: "Board games", es: "Juegos de mesa" },
      { en: "Free parking", es: "Estacionamiento gratuito" }
    ],
    gallery: [
      { key: "outdoor", images: [
        { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
          alt: "The pool terrace at Casa de las Estrellas", altEs: "La terraza de la alberca en Casa de las Estrellas" },
        { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
          alt: "The rooftop jacuzzi, saved for the stars", altEs: "El jacuzzi en la azotea, reservado para las estrellas" },
        { src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=80",
          alt: "Grounds and gardens at Casa de las Estrellas", altEs: "Jardines y áreas verdes en Casa de las Estrellas" }
      ] },
      { key: "rooms", images: [
        { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80",
          alt: "A guest suite dressed for arrival night", altEs: "Una suite de huéspedes lista para la noche de llegada" },
        { src: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1400&q=80",
          alt: "A suite dressed in linen and morning light", altEs: "Una suite vestida en lino y luz de la mañana" },
        { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80",
          alt: "An ensuite bath, quiet in the afternoon", altEs: "Un baño privado, tranquilo por la tarde" }
      ] },
      { key: "interiors", images: [
        { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
          alt: "The living area in stone and warm wood", altEs: "La sala en piedra y madera cálida" },
        { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
          alt: "The main salon, layered in stone and linen", altEs: "El salón principal, en capas de piedra y lino" },
        { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80",
          alt: "A quiet corner, reset for the afternoon", altEs: "Un rincón tranquilo, listo para la tarde" }
      ] },
      { key: "multipurpose", images: [
        { src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
          alt: "The independent studio, ready for extra guests", altEs: "El estudio independiente, listo para huéspedes extra" },
        { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
          alt: "The dining table, set for a private dinner", altEs: "La mesa, puesta para una cena privada" },
        { src: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1400&q=80",
          alt: "A glass poured before sunset", altEs: "Una copa servida antes del atardecer" }
      ] }
    ]
  }
];


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

  const slidesHtml = slides
    .map((s, i) => `<img class="villa-row-slide${i === 0 ? " is-active" : ""}" src="${s.src}" alt="${s.alt}" loading="${i === 0 ? "eager" : "lazy"}" width="1200" height="900" data-slide-index="${i}">`)
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
        <h3 class="h2"><a href="${basePath}villas/${villa.slug}.html">${villa.name}</a></h3>
        <p class="villa-row-desc">${short}</p>
        <div class="villa-row-specs">
          <span>${villa.area} m&sup2; (${Math.round(villa.area * 10.7639).toLocaleString("en-US")} ${t("card.sqft", lang)})</span>
          <span>${villa.bedrooms} ${t("card.bedrooms", lang)}</span>
          <span>${villa.guests} ${t("card.guests", lang)}</span>
        </div>
        <a class="btn btn-solid" href="${basePath}villas/${villa.slug}.html">${t("villas.showcase.explore", lang)}</a>
      </div>
    </article>`;
}
