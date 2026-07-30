/* ==========================================================================
   MEXICO LUXE STAYS — i18n engine (English default, Spanish toggle)

   Usage in HTML:
     data-i18n="key"        → sets element.textContent
     data-i18n-html="key"   → sets element.innerHTML (for text containing <em>, <br>, etc.)
     data-i18n-placeholder="key" / data-i18n-aria-label="key" / data-i18n-alt="key" / data-i18n-title="key"
                            → sets that attribute instead

   Add new pages by writing data-i18n attributes in the markup and adding the
   matching key to both MLS_I18N.en and MLS_I18N.es below. Keys are flat
   strings namespaced by page/section, e.g. "home.hero.title".
   ========================================================================== */

const MLS_I18N = {
  en: {
    /* ---------- Shared: header / nav ---------- */
    "skip": "Skip to content",
    "nav.home": "Home",
    "nav.villas": "Our Villas",
    "nav.services": "Our Services",
    "nav.about": "About Us",
    "nav.faq": "FAQ",
    "nav.contact": "Contact Us",
    "nav.book": "Book",
    "nav.openMenu": "Open menu",
    "lang.en": "EN",
    "lang.es": "ES",
    "lang.toggleLabel": "Select language",

    /* ---------- Shared: footer ---------- */
    "footer.tagline": "Where luxury, comfort, and exclusivity meet.",
    "footer.explore": "Explore",
    "footer.plan": "Plan",
    "footer.reachUs": "Reach us",
    "footer.callText": "Call, text or WhatsApp",
    "footer.locations": "Playa del Carmen · Riviera Maya<br>Valle de Guadalupe · Baja California",
    "footer.copyright": "© 2026 Mexico Luxe Stays. All rights reserved.",
    "footer.tag": "Estancias de autor en México",

    /* ---------- Shared: quick actions (phone / WhatsApp / FAQ) ---------- */
    "qa.callUs": "Call us",
    "qa.chatWhatsapp": "Chat with us on WhatsApp",
    "qa.close": "Close",
    "qa.whatsapp.title": "We reply fast.",
    "qa.whatsapp.web": "WhatsApp Web",
    "qa.whatsapp.webHint": "Opens in a new browser tab",
    "qa.whatsapp.scan": "Scan with my phone",
    "qa.whatsapp.scanHint": "Opens the WhatsApp app",
    "qa.whatsapp.qrHint": "Point your phone's camera here",
    "qa.faq": "Frequently Asked Questions",
    "qa.faq.label": "Frequently asked questions",

    /* ---------- Home ---------- */
    "home.hero.title": "Welcome to<br><em>Mexico Luxe Stays</em>",
    "home.hero.reserveButton": "Reserve Your Stay",
    "home.scroll": "Scroll",
    "home.destinations.title": "Choose your <em>Mexico</em>",
    "home.destinations.playa.name": "Playa del Carmen",
    "home.destinations.playa.desc": "White-sand beaches, turquoise water, and the vibrant pulse of the Riviera Maya — steps from your private pool.",
    "home.destinations.playa.link": "Beachfront villas",
    "home.destinations.valle.name": "Valle de Guadalupe",
    "home.destinations.valle.desc": "Mexico's premier wine region — world-class vineyards, farm-to-table dining, and star-filled desert nights.",
    "home.destinations.valle.link": "Wine country villas",
    "home.intro.heading1": "Luxury",
    "home.intro.heading2": "Comfort",
    "home.intro.heading3": "Exclusivity",
    "home.intro.heading4": "together",
    "home.intro.heading5": "in Mexico.",
    "home.intro.copy": "Mexico Luxe Stays offers a curated collection of luxury properties, personalized service, and exceptional experiences in the Riviera Maya and Baja California's renowned wine country. Every stay is designed to deliver privacy, sophistication, and unforgettable moments.",
    "home.featured.eyebrow": "The collection",
    "home.featured.title": "Featured <em>villas</em>",
    "home.featured.viewAll": "View all villas",
    "home.featured.browseAll": "Browse all villas →",
    "home.testimonials.eyebrow": "Guest stories",
    "home.testimonials.hidden": "What our guests say",
    "home.testimonials.chooseLabel": "Choose testimonial",
    "home.testimonials.1.quote": "An incredible villa in an unbeatable location. The staff were endlessly warm and made every single day feel effortless.",
    "home.testimonials.1.name": "Keller M.",
    "home.testimonials.1.villa": "Villa Aqua · Playa del Carmen",
    "home.testimonials.2.quote": "A peaceful retreat from start to finish. Carlos had the jacuzzi warmed before we even asked, and the fire pit lit at sunset. The team thought of everything.",
    "home.testimonials.2.name": "Kelly M.",
    "home.testimonials.2.villa": "Kasa Kefi · Valle de Guadalupe",
    "home.testimonials.3.quote": "We were treated like royalty. Able arranged a private chef and organized my daughter's birthday down to the last candle — better than any restaurant in town.",
    "home.testimonials.3.name": "Elizabeth F.",
    "home.testimonials.3.villa": "Casa Corazon Luxe · Playa del Carmen",
    "home.cta.eyebrow": "Your getaway deserves nothing less",
    "home.cta.title": "The villa is <em>waiting</em>.",
    "home.cta.plan": "Make an enquiry",
    "home.cta.whatsappTitle": "Talk to us on <em>WhatsApp</em>",
    "home.cta.whatsapp": "WhatsApp us",

    /* ---------- Our Villas (villas.html) ---------- */
    "villas.hero.eyebrow": "The collection",
    "villas.hero.title": "Our <em>villas</em>",
    "villas.hero.lead": "Every residence is handpicked, privately managed, and staffed to the standard we'd demand ourselves.",
    "villas.filter.destination": "Destination",
    "villas.filter.allDestinations": "All destinations",
    "villas.filter.guests": "Guests",
    "villas.filter.any": "Any",
    "villas.filter.bedrooms": "Bedrooms",
    "villas.filter.clear": "Clear all",
    "villas.count.showing": "Showing {count} of {total} residences",
    "villas.empty.title": "No residence matches that combination — yet.",
    "villas.empty.body": "Tell us what you're dreaming of and we'll open doors that aren't listed.",
    "villas.empty.cta": "Contact our team",
    "villas.showcase.explore": "Explore the villa",
    "villas.showcase.prevPhoto": "Previous photo",
    "villas.showcase.nextPhoto": "Next photo",
    "villas.showcase.photo": "Photo {n}",
    "villas.cta.eyebrow": "Not seeing the one?",
    "villas.cta.title": "Some doors open only by <em>request</em>.",
    "villas.cta.ask": "Ask our team",
    "villas.cta.whatsapp": "WhatsApp us",

    /* ---------- Villa cards (rendered by villas-data.js) ---------- */
    "card.guests": "guests",
    "card.bedrooms": "bedrooms",
    "card.sqft": "sq ft",

    /* ---------- Villa detail pages (shared strings) ---------- */
    "detail.breadcrumb.home": "Home",
    "detail.breadcrumb.villas": "Our Villas",
    "detail.specs.guests": "Guests",
    "detail.specs.bedrooms": "Bedrooms",
    "detail.specs.beds": "Beds",
    "detail.specs.bathrooms": "Bathrooms",
    "detail.specs.area": "Square meters",
    "detail.specs.beach": "Beach",
    "detail.specs.vines": "Vines",
    "detail.amenities.title": "Amenities",
    "detail.amenities.showAll": "Show all amenities",
    "detail.amenities.showLess": "Show fewer amenities",
    "detail.gallery.title": "Explore the villa",
    "detail.gallery.outdoor": "Outdoor areas",
    "detail.gallery.rooms": "Rooms",
    "detail.gallery.interiors": "Interiors",
    "detail.gallery.multipurpose": "Multipurpose rooms",
    "detail.gallery.viewGallery": "View Gallery",
    "detail.gallery.close": "Close gallery",
    "detail.gallery.prev": "Previous image",
    "detail.gallery.next": "Next image",
    "detail.map.eyebrow": "Where you'll stay",
    "detail.map.badge": "Open in Google Maps",
    "detail.booking.inquire": "Inquire about this villa",
    "detail.bookingCta.trustBig": "Trust us",
    "detail.bookingCta.trustSmall": "to",
    "detail.bookingCta.guideBig": "Guide",
    "detail.bookingCta.guideSmall": "you",
    "detail.bookingCta.eyebrow": "To your",
    "detail.bookingCta.heading": "Future home",
    "detail.bookingCta.note": "Our specialist will contact you as soon as possible.",
    "detail.bookingCta.namePlaceholder": "Type your name...",
    "detail.bookingCta.phonePlaceholder": "Type your mobile number...",
    "detail.bookingCta.submit": "Request",
    "detail.bookingCta.legal": "By sending your request, you're agreeing to our privacy policy. We promise to keep your personal information safe and secure.",
    "detail.bookingCta.status": "Thank you — opening WhatsApp to confirm your request.",
    "detail.residence.eyebrow": "The residence",

    /* ---------- Villa detail: Villa Aqua ---------- */
    "detail.aqua.gallery1": "Villa Aqua glowing at night around the reflecting pool",
    "detail.aqua.gallery2": "Villa Aqua's pool deck and jacuzzi framed by palm trees",
    "detail.aqua.gallery3": "The glass-walled living pavilion at Villa Aqua opening onto the pool",
    "detail.aqua.heading": "Your own<br>private<br><em>resort</em>",
    "detail.aqua.lead2": "<strong>Six bedrooms</strong>, resort-style amenities, and a full staff. Minutes from the beach and the pulse of Quinta Avenida.",
    "detail.aqua.body1": "Villa Aqua pairs the space of a modern residence with the amenities of a private resort: a <strong>pool and jacuzzi</strong> at the center, a <strong>squash court and gym</strong> for the mornings, and a <strong>wood-fired oven</strong> where dinner becomes an event. However many bedrooms you reserve, the entire property remains exclusively yours.",
    "detail.aqua.body2": "<strong>A dedicated team</strong>: chef, butler, and 24/7 concierge. Curates every detail, from in-villa spa treatments to private tours. Sleeping up to <strong>eighteen</strong>, with flexible bedroom configurations for smaller groups, it adapts to family gatherings and private retreats alike. Airport transfer is on the house for stays of four nights or more.",
    "detail.aqua.mapTitle": "Villa Aqua in <em>Playacar</em>",
    "detail.aqua.mapAlt": "Map showing Villa Aqua's location in Playacar, Playa del Carmen, near Quinta Avenida and Cancún International Airport",

    /* ---------- Villa detail: Casa de las Estrellas ---------- */
    "detail.estrellas.eyebrow": "Playa del Carmen · Playacar Phase I · Steps from the Beach",
    "detail.estrellas.lead": "A serene beachfront escape in gated Playacar — thirty seconds from the sand, with a rooftop jacuzzi saved for the stars.",
    "detail.estrellas.gallery1": "A suite at Casa de las Estrellas with a wood headboard and garden view",
    "detail.estrellas.gallery2": "Casa de las Estrellas' dining and lounge area opening to the pool",
    "detail.estrellas.gallery3": "The covered terrace and plunge pool at Casa de las Estrellas",
    "detail.estrellas.heading": "Evenings under the <em>stars</em>",
    "detail.estrellas.lead2": "<strong>Three ensuite suites</strong>, an independent studio, and a rooftop terrace with a private jacuzzi. The beach a thirty-second walk away.",
    "detail.estrellas.body1": "Casa de las Estrellas balances comfort, privacy, and curated luxury in Playacar Phase I. The main house holds three beautifully appointed suites; a <strong>self-contained ground-floor studio</strong> with its own entrance joins the villa when your group grows. Between the <strong>heated plunge pool</strong> below and the <strong>ocean-view jacuzzi</strong> above, the day arranges itself.",
    "detail.estrellas.body2": "<strong>Daily housekeeping</strong> and a <strong>24/7 concierge</strong> carry the stay — a private chef, in-villa spa treatments, or a Riviera Maya adventure are one message away. And when the villa lets you go, Quinta Avenida is a short walk down the beach.",
    "detail.estrellas.mapTitle": "Casa de las Estrellas in <em>Playacar</em>",
    "detail.estrellas.mapAlt": "Map showing Casa de las Estrellas' location in Playacar, Playa del Carmen, near Quinta Avenida and Cancún International Airport",

    /* ---------- Villa detail: Casa Corazon Luxe ---------- */
    "detail.corazon.eyebrow": "Playa del Carmen · Riviera Maya · Beachfront",
    "detail.corazon.lead": "Our grandest address — eleven suites directly on the Caribbean, with an infinity pool, home cinema, and staff for twenty-two.",
    "detail.corazon.gallery1": "The tiled lap pool between Casa Corazon Luxe's casitas",
    "detail.corazon.gallery2": "Casa Corazon Luxe's palapa living room opening to the pool and the Caribbean",
    "detail.corazon.gallery3": "A bedroom at Casa Corazon Luxe with a brick dome ceiling and an ocean-view hammock",
    "detail.corazon.heading": "Made for <em>celebrations</em>",
    "detail.corazon.lead2": "<strong>Twenty-two guests</strong>, eleven ensuite bedrooms, three living rooms. A private beach that begins where the terrace ends.",
    "detail.corazon.body1": "Casa Corazon Luxe is built on a grand scale: an <strong>infinity pool</strong> facing the Caribbean, a <strong>home cinema</strong> with a popcorn machine, a game room, a gym, and direct access to soft white sand. Three living rooms, two dining areas, and two full kitchens give every generation of a gathering its own corner.",
    "detail.corazon.body2": "Service runs on a <strong>5-star rhythm</strong> — private chef and butler from morning to mid-afternoon, daily housekeeping, 24/7 concierge and security, and a <strong>complimentary round-trip airport transfer</strong>. Configurations flex from five to eleven bedrooms, so you only reserve the space your celebration needs.",
    "detail.corazon.mapTitle": "Casa Corazon Luxe on the <em>Caribbean</em>",
    "detail.corazon.mapAlt": "Map showing Casa Corazon Luxe's location in Playa del Carmen, near Quinta Avenida and Cancún International Airport",

    /* ---------- Villa detail: Kasa Kefi ---------- */
    "detail.kefi.eyebrow": "Valle de Guadalupe · Kasa Kava Estate · Wine Country",
    "detail.kefi.lead": "A contemporary villa on a private vineyard estate — fire pits on every terrace and Valle's finest wineries minutes away.",
    "detail.kefi.gallery1": "Kasa Kefi's rooftop terrace and pool overlooking the Valle de Guadalupe at dusk",
    "detail.kefi.gallery2": "Kasa Kefi perched above the vineyard, mountains behind",
    "detail.kefi.gallery3": "Kasa Kefi's living room with a wine rack and desert view",
    "detail.kefi.heading": "Between the <em>vines</em>",
    "detail.kefi.lead2": "<strong>Four suites</strong> with private fire-pit terraces, an infinity plunge pool above the vines. A wine cellar waiting downstairs.",
    "detail.kefi.body1": "Kasa Kefi opens itself to the valley — floor-to-ceiling glass, seamless indoor-outdoor living, a <strong>loft living room</strong> with an ethanol fireplace, and a dining room built around its own <strong>wine cellar</strong>. On the terrace: al fresco dining, a BBQ, sun beds, and fire pits pointed at the sunset.",
    "detail.kefi.body2": "Every suite comes with an ensuite bath, plush bedding, and its own lounge terrace; comforts run from <strong>Starlink Wi-Fi</strong> and Sonos sound to Nespresso in the mornings. Acclaimed wineries, Michelin-starred dining, and hiking trails are all a short drive from the gate.",
    "detail.kefi.mapTitle": "Kasa Kefi in the <em>Valle</em>",
    "detail.kefi.mapAlt": "Map showing Kasa Kefi's location in the Valle de Guadalupe, Baja California, near Viñedos Guadalupe and Finca Altozano",

    /* ---------- Our Services (services.html) ---------- */
    "services.hero.title": "Our <em>services</em>",
    "services.hero.lead": "The villa is only half the stay",
    "services.chef.tag": "In villa",
    "services.chef.title": "Private Chef",
    "services.chef.body": "Breakfast before the beach, ceviche at the pool, a tasting menu at eight. Your chef shops, cooks, and disappears — the kitchen stays spotless.",
    "services.transfer.tag": "Arrival &amp; around town",
    "services.transfer.title": "Airport Transfers &amp; Drivers",
    "services.transfer.body": "A driver meets you at arrivals, name on card, cooler in the trunk. Keep him for the week — nobody in your group needs to think about keys.",
    "services.housekeeping.tag": "In villa",
    "services.housekeeping.title": "Housekeeping",
    "services.housekeeping.body": "Daily service timed around your plans, not ours. Fresh linens, towels by the pool, and the villa reset to perfect every afternoon.",
    "services.spa.tag": "In villa",
    "services.spa.title": "Spa &amp; Massage",
    "services.spa.body": "Therapists come to you — massages on the terrace, facials before dinner, yoga at sunrise. The soundtrack is the ocean or the vines.",
    "services.grocery.tag": "Before you arrive",
    "services.grocery.title": "Grocery Pre-Stocking",
    "services.grocery.body": "Send a list — or just tell us how you eat. The fridge, the bar, and the fruit bowl are full before your plane touches down.",
    "services.events.tag": "Occasions",
    "services.events.title": "Events &amp; Weddings",
    "services.events.body": "Birthdays, proposals, vow renewals, the wedding itself — we coordinate florals, music, photography, and the moment nobody forgets.",
    "services.wine.tag": "Valle de Guadalupe",
    "services.wine.title": "Wine Tours",
    "services.wine.body": "Cellars that don't take walk-ins, winemakers who pour their own bottles, and a driver for the ride home. The valley, done properly.",
    "services.excursions.tag": "Playa del Carmen",
    "services.excursions.title": "Excursions",
    "services.excursions.body": "Private cenotes, reef dives, Mayan ruins before the tour buses, catamarans at golden hour. Skip every line; we already called ahead.",
    "services.cta.title": "If it can be arranged in Mexico, we <em>arrange</em> it.",
    "services.cta.tell": "Tell us what you need",
    "services.cta.whatsapp": "WhatsApp us",
    "services.gallery.prev": "Previous service",
    "services.gallery.next": "Next service",
    "services.between.body": "We elevate your stay with personalized services designed for comfort, luxury, and effortless living. Every detail is thoughtfully arranged to create an exceptional experience from arrival to departure.",

    /* ---------- About Us (about.html) ---------- */
    "about.hero.title": "About <em>us</em>",
    "about.hero.lead": "A small, passionate team that has spent twenty years learning exactly what extraordinary feels like — and how to deliver it twice.",
    "about.hero.scroll": "Scroll for more",
    "about.story.title": "Twenty years of opening <em>doors</em>",
    "about.story.lead": "Mexico Luxe Stays began with a single beachfront property and a stubborn belief: a villa should be hosted, not just rented.",
    "about.story2.title": "One team, every step of the <em>way</em>",
    "about.story2.lead": "Two decades later, we manage a handpicked collection across two of Mexico's most breathtaking destinations — the Riviera Maya and Valle de Guadalupe.",
    "about.stats.1.num": "20+",
    "about.stats.1.label": "Years of experience",
    "about.stats.2.num": "1",
    "about.stats.2.label": "Dedicated team",
    "about.stats.3.num": "∞",
    "about.stats.3.label": "Returning guests",
    "about.values.eyebrow": "Mission &amp; values",
    "about.values.title": "Luxury is <em>personal</em>, or it isn't luxury",
    "about.values.lead": "Our mission is simple: seamless elegance, total privacy, and hospitality that feels like it was invented for you — from first inquiry to final departure.",
    "about.values.1.title": "Exclusivity without coldness",
    "about.values.1.body": "Private doesn't mean distant. Every villa is gated, staffed, and yours alone — and every welcome is warm, by name, with your favorite drink already chilled.",
    "about.values.2.title": "End-to-end, one team",
    "about.values.2.body": "No call centers, no handoffs. The person who plans your stay is the person who hosts it. Twenty years taught us that details survive only when they never change hands.",
    "about.values.3.title": "Two destinations, one standard",
    "about.values.3.body": "Beachfront or vineyard, the promise is identical: handpicked properties, immaculate upkeep, and service that anticipates rather than reacts.",
    "about.cta.eyebrow": "Twenty years in — your stay is next",
    "about.cta.title": "Let's plan the trip they'll <em>envy</em>.",
    "about.cta.contact": "Contact us",
    "about.cta.browse": "Browse the villas",

    /* ---------- FAQ (faq.html) ---------- */
    "faq.hero.title": "Questions, <em>answered</em>",
    "faq.q1": "How does the booking process work?",
    "faq.a1": "Send us your dates, group size, and preferred villa — by form, email, or WhatsApp. We confirm availability within hours, hold the villa while you decide, and secure the reservation with a signed agreement and deposit. From that moment, your concierge takes over planning: transfers, chef menus, grocery lists, and any occasion we should know about.",
    "faq.q2": "What is the cancellation policy?",
    "faq.a2": "Reservations canceled 60 or more days before arrival receive a full refund of amounts paid, less processing fees. Between 59 and 30 days, the deposit is retained; within 30 days, payments are non-refundable. We always try to rebook your dates — if we succeed, we return what the calendar allows. Holiday weeks carry their own terms, confirmed at booking.",
    "faq.q3": "What are the check-in and check-out times?",
    "faq.a3": "Check-in from 3:00 PM, check-out by 11:00 AM. Early arrivals and late departures are often possible outside peak season — tell us your flight times and we'll do our best to stretch the day. Your villa host meets you personally at check-in; there are no lockboxes at Mexico Luxe Stays.",
    "faq.q4": "Is there a security deposit?",
    "faq.a4": "Yes — a refundable security deposit is held per stay (amount varies by villa and is confirmed at booking). It's released in full within 7 days of departure, assuming the villa is left as loved as it was found. In twenty years, that's been nearly every stay.",
    "faq.q5": "Are pets welcome?",
    "faq.a5": "Several of our villas welcome well-traveled dogs by prior approval — just tell us who's coming when you inquire. A pet fee and a few house rules apply (they vary by property). Where the answer is no, it's the owner's call, not ours, and we'll point you to the villas where it's a yes.",
    "faq.q6": "Is there a minimum stay?",
    "faq.a6": "Most villas ask for 3 nights; holiday periods (Christmas, New Year's, Easter) typically require 5 to 7. Shorter stays occasionally fit between reservations — ask, and we'll check the calendar for you.",
    "faq.q7": "What's included in the rate?",
    "faq.a7": "Every stay includes daily housekeeping, a dedicated concierge, utilities, Wi-Fi, and a fully equipped villa — linens, towels, beach or pool gear included. Chef services, transfers, spa, tours, and grocery pre-stocking are arranged à la carte, so you pay only for what your trip actually needs.",
    "faq.q8": "Which payment methods do you accept?",
    "faq.a8": "Bank transfer (USD or MXN) and major credit cards; card payments carry the processor's fee. A deposit secures your dates and the balance is due 30 days before arrival — book inside 30 days and the full amount settles at reservation. Every payment is documented with a formal agreement and receipt.",
    "faq.q9": "How do we get around locally?",
    "faq.a9": "In Playa del Carmen, most guests pair our airport transfer with a private driver on call — the beach, cenotes, and Quinta Avenida are all short rides. In Valle de Guadalupe a driver is the difference between tasting and abstaining; ours know every unmarked winery gate. Rental cars can be delivered to the villa if you'd rather drive.",
    "faq.cta.eyebrow": "Still curious?",
    "faq.cta.title": "Ask a human — we answer <em>fast</em>.",
    "faq.cta.whatsappWeb": "WhatsApp Web",
    "faq.cta.whatsappPhone": "WhatsApp on the phone",
    "faq.cta.phoneNumber": "Phone number (MX)",
    "faq.cta.phoneNumberUs": "Phone number (USA)",

    /* ---------- Contact Us (contact.html) ---------- */
    "contact.hero.eyebrow": "We reply fast",
    "contact.hero.title": "Contact <em>us</em>",
    "contact.hero.lead": "Tell us your dates and your dream. We'll handle everything between.",
    "contact.channels.eyebrow": "Direct lines",
    "contact.channels.title": "Reach a <em>person</em>, not a portal",
    "contact.channels.lead": "Call, text, WhatsApp, or write — the same small team answers every channel, usually within the hour.",
    "contact.channels.call": "Call or text",
    "contact.channels.whatsapp": "WhatsApp",
    "contact.channels.whatsappCta": "Chat with us now",
    "contact.channels.email": "Email",
    "contact.channels.social": "Social",
    "contact.form.eyebrow": "Plan my stay",
    "contact.form.title": "Send an inquiry",
    "contact.form.name": "Full name *",
    "contact.form.namePh": "Your name",
    "contact.form.email": "Email *",
    "contact.form.emailPh": "you@email.com",
    "contact.form.phone": "Phone / WhatsApp",
    "contact.form.phonePh": "+1 ...",
    "contact.form.villa": "Preferred villa",
    "contact.form.villaAdvise": "Not sure yet — advise me",
    "contact.form.checkin": "Check-in",
    "contact.form.checkout": "Check-out",
    "contact.form.message": "Your message",
    "contact.form.messagePh": "Group size, the occasion, anything we should know...",
    "contact.form.submit": "Send inquiry",
    "contact.form.note": "Submitting opens WhatsApp with your message ready to send — our fastest channel. Prefer email? Write to <a href=\"mailto:info@mexicoluxestays.com\" style=\"color:var(--gold)\">info@mexicoluxestays.com</a>.",
    "contact.form.status": "Opening WhatsApp with your inquiry — we typically reply within the hour.",
    "contact.locations.eyebrow": "Where to find us",
    "contact.locations.title": "Two <em>destinations</em>",
    "contact.locations.playaMap": "Map — Playa del Carmen<br>Riviera Maya, Quintana Roo",
    "contact.locations.playaName": "Playa del Carmen",
    "contact.locations.playaDesc": "Riviera Maya · Quintana Roo · 45 min from Cancún International (CUN)",
    "contact.locations.valleMap": "Map — Valle de Guadalupe<br>Ensenada, Baja California",
    "contact.locations.valleName": "Valle de Guadalupe",
    "contact.locations.valleDesc": "Baja California · 90 min from Tijuana (TIJ) / San Diego border"
  },

  es: {
    /* ---------- Shared: header / nav ---------- */
    "skip": "Saltar al contenido",
    "nav.home": "Inicio",
    "nav.villas": "Nuestras Villas",
    "nav.services": "Servicios",
    "nav.about": "Nosotros",
    "nav.faq": "Preguntas",
    "nav.contact": "Contáctanos",
    "nav.book": "Reservar",
    "nav.openMenu": "Abrir menú",
    "lang.en": "EN",
    "lang.es": "ES",
    "lang.toggleLabel": "Elegir idioma",

    /* ---------- Shared: footer ---------- */
    "footer.tagline": "Donde el lujo, el confort y la exclusividad se encuentran.",
    "footer.explore": "Explorar",
    "footer.plan": "Planea tu viaje",
    "footer.reachUs": "Contáctanos",
    "footer.callText": "Llama, escribe o por WhatsApp",
    "footer.locations": "Playa del Carmen · Riviera Maya<br>Valle de Guadalupe · Baja California",
    "footer.copyright": "© 2026 Mexico Luxe Stays. Todos los derechos reservados.",
    "footer.tag": "Estancias de autor en México",

    /* ---------- Shared: quick actions (phone / WhatsApp / FAQ) ---------- */
    "qa.callUs": "Llámanos",
    "qa.chatWhatsapp": "Escríbenos por WhatsApp",
    "qa.close": "Cerrar",
    "qa.whatsapp.title": "Respondemos rápido.",
    "qa.whatsapp.web": "WhatsApp Web",
    "qa.whatsapp.webHint": "Se abre en una pestaña nueva",
    "qa.whatsapp.scan": "Escanear con mi teléfono",
    "qa.whatsapp.scanHint": "Abre la app de WhatsApp",
    "qa.whatsapp.qrHint": "Apunta la cámara de tu teléfono aquí",
    "qa.faq": "Preguntas Frecuentes",
    "qa.faq.label": "Preguntas frecuentes",

    /* ---------- Home ---------- */
    "home.hero.title": "Bienvenido a<br><em>Mexico Luxe Stays</em>",
    "home.hero.reserveButton": "Reserva tu Estancia",
    "home.scroll": "Desliza",
    "home.destinations.title": "Elige tu <em>México</em>",
    "home.destinations.playa.name": "Playa del Carmen",
    "home.destinations.playa.desc": "Playas de arena blanca, aguas turquesa y el pulso vibrante de la Riviera Maya — a pasos de tu alberca privada.",
    "home.destinations.playa.link": "Villas frente al mar",
    "home.destinations.valle.name": "Valle de Guadalupe",
    "home.destinations.valle.desc": "La región vinícola por excelencia de México — viñedos de clase mundial, gastronomía del campo a la mesa y noches estrelladas en el desierto.",
    "home.destinations.valle.link": "Villas en la ruta del vino",
    "home.intro.heading1": "Lujo",
    "home.intro.heading2": "Confort",
    "home.intro.heading3": "Exclusividad",
    "home.intro.heading4": "juntos",
    "home.intro.heading5": "en México.",
    "home.intro.copy": "Mexico Luxe Stays ofrece una colección curada de propiedades de lujo, servicio personalizado y experiencias excepcionales en la Riviera Maya y la reconocida ruta del vino de Baja California. Cada estancia está diseñada para ofrecer privacidad, sofisticación y momentos inolvidables.",
    "home.featured.eyebrow": "La colección",
    "home.featured.title": "Villas <em>destacadas</em>",
    "home.featured.viewAll": "Ver todas las villas",
    "home.featured.browseAll": "Ver todas las villas →",
    "home.testimonials.eyebrow": "Historias de huéspedes",
    "home.testimonials.hidden": "Lo que dicen nuestros huéspedes",
    "home.testimonials.chooseLabel": "Elegir testimonio",
    "home.testimonials.1.quote": "Una villa increíble en una ubicación inmejorable. El personal fue cálido en todo momento e hizo que cada día se sintiera sin esfuerzo.",
    "home.testimonials.1.name": "Keller M.",
    "home.testimonials.1.villa": "Villa Aqua · Playa del Carmen",
    "home.testimonials.2.quote": "Un retiro tranquilo de principio a fin. Carlos ya había calentado el jacuzzi antes de que lo pidiéramos, y encendió la fogata al atardecer. El equipo pensó en todo.",
    "home.testimonials.2.name": "Kelly M.",
    "home.testimonials.2.villa": "Kasa Kefi · Valle de Guadalupe",
    "home.testimonials.3.quote": "Nos trataron como realeza. Able organizó un chef privado y el cumpleaños de mi hija hasta el último detalle — mejor que cualquier restaurante de la ciudad.",
    "home.testimonials.3.name": "Elizabeth F.",
    "home.testimonials.3.villa": "Casa Corazon Luxe · Playa del Carmen",
    "home.cta.eyebrow": "Tu escapada merece lo extraordinario",
    "home.cta.title": "La villa te está <em>esperando</em>.",
    "home.cta.plan": "Envía tu consulta",
    "home.cta.whatsappTitle": "Escríbenos por <em>WhatsApp</em>",
    "home.cta.whatsapp": "Escríbenos por WhatsApp",

    /* ---------- Our Villas (villas.html) ---------- */
    "villas.hero.eyebrow": "La colección",
    "villas.hero.title": "Nuestras <em>villas</em>",
    "villas.hero.lead": "Cada residencia es seleccionada a mano, administrada de forma privada, y atendida con el estándar que exigiríamos para nosotros mismos.",
    "villas.filter.destination": "Destino",
    "villas.filter.allDestinations": "Todos los destinos",
    "villas.filter.guests": "Huéspedes",
    "villas.filter.any": "Cualquiera",
    "villas.filter.bedrooms": "Recámaras",
    "villas.filter.clear": "Limpiar filtros",
    "villas.count.showing": "Mostrando {count} de {total} residencias",
    "villas.empty.title": "Ninguna residencia coincide con esa combinación — todavía.",
    "villas.empty.body": "Cuéntanos qué estás buscando y te abriremos puertas que no están listadas.",
    "villas.empty.cta": "Contacta a nuestro equipo",
    "villas.showcase.explore": "Explorar la villa",
    "villas.showcase.prevPhoto": "Foto anterior",
    "villas.showcase.nextPhoto": "Foto siguiente",
    "villas.showcase.photo": "Foto {n}",
    "villas.cta.eyebrow": "¿No ves la indicada?",
    "villas.cta.title": "Algunas puertas solo se abren por <em>solicitud</em>.",
    "villas.cta.ask": "Pregunta a nuestro equipo",
    "villas.cta.whatsapp": "Escríbenos por WhatsApp",

    /* ---------- Villa cards (rendered by villas-data.js) ---------- */
    "card.guests": "huéspedes",
    "card.bedrooms": "recámaras",
    "card.sqft": "pies²",

    /* ---------- Villa detail pages (shared strings) ---------- */
    "detail.breadcrumb.home": "Inicio",
    "detail.breadcrumb.villas": "Nuestras Villas",
    "detail.specs.guests": "Huéspedes",
    "detail.specs.bedrooms": "Recámaras",
    "detail.specs.beds": "Camas",
    "detail.specs.bathrooms": "Baños",
    "detail.specs.area": "Metros cuadrados",
    "detail.specs.beach": "Playa",
    "detail.specs.vines": "Viñedos",
    "detail.amenities.title": "Amenidades",
    "detail.amenities.showAll": "Ver todas las amenidades",
    "detail.amenities.showLess": "Ver menos amenidades",
    "detail.gallery.title": "Explora la villa",
    "detail.gallery.outdoor": "Áreas exteriores",
    "detail.gallery.rooms": "Habitaciones",
    "detail.gallery.interiors": "Interiores",
    "detail.gallery.multipurpose": "Salones multiusos",
    "detail.gallery.viewGallery": "Ver galería",
    "detail.gallery.close": "Cerrar galería",
    "detail.gallery.prev": "Imagen anterior",
    "detail.gallery.next": "Imagen siguiente",
    "detail.map.eyebrow": "Dónde te hospedarás",
    "detail.map.badge": "Abrir en Google Maps",
    "detail.booking.inquire": "Preguntar por esta villa",
    "detail.bookingCta.trustBig": "Confía en",
    "detail.bookingCta.trustSmall": "nosotros",
    "detail.bookingCta.guideBig": "Para",
    "detail.bookingCta.guideSmall": "guiarte",
    "detail.bookingCta.eyebrow": "Hacia tu",
    "detail.bookingCta.heading": "Futuro hogar",
    "detail.bookingCta.note": "Nuestro especialista te contactará lo antes posible.",
    "detail.bookingCta.namePlaceholder": "Escribe tu nombre...",
    "detail.bookingCta.phonePlaceholder": "Escribe tu número celular...",
    "detail.bookingCta.submit": "Enviar",
    "detail.bookingCta.legal": "Al enviar tu solicitud, aceptas nuestro aviso de privacidad. Prometemos mantener tu información personal segura y protegida.",
    "detail.bookingCta.status": "Gracias — abriendo WhatsApp para confirmar tu solicitud.",
    "detail.residence.eyebrow": "La residencia",

    /* ---------- Villa detail: Villa Aqua ---------- */
    "detail.aqua.gallery1": "Villa Aqua iluminada de noche alrededor de la alberca",
    "detail.aqua.gallery2": "La terraza de la alberca y el jacuzzi de Villa Aqua, enmarcados por palmeras",
    "detail.aqua.gallery3": "El pabellón de estar con muros de cristal en Villa Aqua, abierto hacia la alberca",
    "detail.aqua.heading": "Tu propio<br><em>resort</em><br>privado",
    "detail.aqua.lead2": "<strong>Seis recámaras</strong>, amenidades estilo resort y personal completo. A minutos de la playa y del pulso de la Quinta Avenida.",
    "detail.aqua.body1": "Villa Aqua combina el espacio de una residencia moderna con las amenidades de un resort privado: una <strong>alberca y jacuzzi</strong> al centro, una <strong>cancha de squash y gimnasio</strong> para las mañanas, y un <strong>horno de leña</strong> donde la cena se convierte en un evento. Sin importar cuántas recámaras reserves, la propiedad completa es exclusivamente tuya.",
    "detail.aqua.body2": "<strong>Un equipo dedicado</strong>: chef, mayordomo y concierge 24/7. Cuida cada detalle, desde tratamientos de spa en la villa hasta tours privados. Con capacidad hasta para <strong>dieciocho</strong> huéspedes y configuraciones flexibles para grupos más pequeños, se adapta igual a reuniones familiares que a retiros privados. El traslado al aeropuerto es cortesía en estancias de cuatro noches o más.",
    "detail.aqua.mapTitle": "Villa Aqua en <em>Playacar</em>",
    "detail.aqua.mapAlt": "Mapa con la ubicación de Villa Aqua en Playacar, Playa del Carmen, cerca de Quinta Avenida y el Aeropuerto Internacional de Cancún",

    /* ---------- Villa detail: Casa de las Estrellas ---------- */
    "detail.estrellas.eyebrow": "Playa del Carmen · Playacar Fase I · A pasos de la playa",
    "detail.estrellas.lead": "Un refugio sereno frente al mar en Playacar — a treinta segundos de la arena, con un jacuzzi en la azotea reservado para las estrellas.",
    "detail.estrellas.gallery1": "Una suite en Casa de las Estrellas con cabecera de madera y vista al jardín",
    "detail.estrellas.gallery2": "El comedor y la sala de estar de Casa de las Estrellas, abiertos hacia la alberca",
    "detail.estrellas.gallery3": "La terraza cubierta y la alberca chica de Casa de las Estrellas",
    "detail.estrellas.heading": "Noches bajo las <em>estrellas</em>",
    "detail.estrellas.lead2": "<strong>Tres suites con baño propio</strong>, un estudio independiente y una terraza en la azotea con jacuzzi privado. La playa a treinta segundos caminando.",
    "detail.estrellas.body1": "Casa de las Estrellas equilibra confort, privacidad y lujo curado en Playacar Fase I. La casa principal alberga tres suites bellamente decoradas; un <strong>estudio independiente en planta baja</strong>, con entrada propia, se suma a la villa cuando el grupo crece. Entre la <strong>alberca climatizada</strong> abajo y el <strong>jacuzzi con vista al mar</strong> arriba, el día se organiza solo.",
    "detail.estrellas.body2": "La <strong>limpieza diaria</strong> y un <strong>concierge 24/7</strong> sostienen la estancia — un chef privado, tratamientos de spa en la villa o una aventura por la Riviera Maya están a un mensaje de distancia. Y cuando la villa te deje ir, la Quinta Avenida queda a una corta caminata por la playa.",
    "detail.estrellas.mapTitle": "Casa de las Estrellas en <em>Playacar</em>",
    "detail.estrellas.mapAlt": "Mapa con la ubicación de Casa de las Estrellas en Playacar, Playa del Carmen, cerca de Quinta Avenida y el Aeropuerto Internacional de Cancún",

    /* ---------- Villa detail: Casa Corazon Luxe ---------- */
    "detail.corazon.eyebrow": "Playa del Carmen · Riviera Maya · Frente al mar",
    "detail.corazon.lead": "Nuestra dirección más grandiosa — once suites directamente sobre el Caribe, con alberca infinita, cine privado y personal para veintidós.",
    "detail.corazon.gallery1": "La alberca de azulejo entre las casitas de Casa Corazon Luxe",
    "detail.corazon.gallery2": "La sala palapa de Casa Corazon Luxe, abierta hacia la alberca y el Caribe",
    "detail.corazon.gallery3": "Una recámara en Casa Corazon Luxe con techo abovedado de ladrillo y hamaca con vista al mar",
    "detail.corazon.heading": "Hecha para <em>celebrar</em>",
    "detail.corazon.lead2": "<strong>Veintidós huéspedes</strong>, once recámaras con baño propio, tres salas. Una playa privada que comienza donde termina la terraza.",
    "detail.corazon.body1": "Casa Corazon Luxe está construida a gran escala: una <strong>alberca infinita</strong> frente al Caribe, un <strong>cine en casa</strong> con máquina de palomitas, salón de juegos, gimnasio y acceso directo a la arena blanca. Tres salas, dos comedores y dos cocinas completas le dan a cada generación de la reunión su propio rincón.",
    "detail.corazon.body2": "El servicio corre a <strong>ritmo de 5 estrellas</strong> — chef y mayordomo privados de la mañana a media tarde, limpieza diaria, concierge y seguridad 24/7, y <strong>traslado redondo al aeropuerto de cortesía</strong>. Las configuraciones se ajustan de cinco a once recámaras, así solo reservas el espacio que tu celebración necesita.",
    "detail.corazon.mapTitle": "Casa Corazon Luxe frente al <em>Caribe</em>",
    "detail.corazon.mapAlt": "Mapa con la ubicación de Casa Corazon Luxe en Playa del Carmen, cerca de Quinta Avenida y el Aeropuerto Internacional de Cancún",

    /* ---------- Villa detail: Kasa Kefi ---------- */
    "detail.kefi.eyebrow": "Valle de Guadalupe · Finca Kasa Kava · Ruta del Vino",
    "detail.kefi.lead": "Una villa contemporánea en una finca vinícola privada — fogatas en cada terraza y las mejores bodegas del Valle a minutos.",
    "detail.kefi.gallery1": "La terraza y alberca en la azotea de Kasa Kefi con vista al Valle de Guadalupe al atardecer",
    "detail.kefi.gallery2": "Kasa Kefi asomada sobre el viñedo, con las montañas detrás",
    "detail.kefi.gallery3": "La sala de Kasa Kefi con cava de vinos y vista al desierto",
    "detail.kefi.heading": "Entre los <em>viñedos</em>",
    "detail.kefi.lead2": "<strong>Cuatro suites</strong> con terrazas privadas con fogata, una alberca infinita sobre los viñedos. Una cava de vino esperando abajo.",
    "detail.kefi.body1": "Kasa Kefi se abre al valle — cristal de piso a techo, vida interior-exterior sin costuras, una <strong>sala tipo loft</strong> con chimenea de etanol y un comedor construido alrededor de su propia <strong>cava</strong>. En la terraza: comidas al aire libre, BBQ, camastros y fogatas apuntando al atardecer.",
    "detail.kefi.body2": "Cada suite cuenta con baño propio, ropa de cama de lujo y su propia terraza con sala; las comodidades van del <strong>Wi-Fi Starlink</strong> y el sonido Sonos al Nespresso por las mañanas. Bodegas reconocidas, restaurantes con estrella Michelin y senderos para caminar están a un corto trayecto de la puerta.",
    "detail.kefi.mapTitle": "Kasa Kefi en el <em>Valle</em>",
    "detail.kefi.mapAlt": "Mapa con la ubicación de Kasa Kefi en el Valle de Guadalupe, Baja California, cerca de Viñedos Guadalupe y Finca Altozano",

    /* ---------- Our Services (services.html) ---------- */
    "services.hero.title": "Nuestros <em>servicios</em>",
    "services.hero.lead": "La villa es solo la mitad de la estancia",
    "services.chef.tag": "En la villa",
    "services.chef.title": "Chef Privado",
    "services.chef.body": "Desayuno antes de la playa, ceviche junto a la alberca, un menú de degustación a las ocho. Tu chef compra, cocina y desaparece — la cocina queda impecable.",
    "services.transfer.tag": "Llegada y en la ciudad",
    "services.transfer.title": "Traslados al Aeropuerto y Choferes",
    "services.transfer.body": "Un chofer te recibe en llegadas, con tu nombre en un letrero y la hielera lista en la cajuela. Consérvalo toda la semana — nadie en tu grupo necesita pensar en llaves.",
    "services.housekeeping.tag": "En la villa",
    "services.housekeeping.title": "Limpieza y Mantenimiento",
    "services.housekeeping.body": "Servicio diario que se ajusta a tus planes, no al revés. Toallas frescas junto a la alberca y la villa impecable cada tarde.",
    "services.spa.tag": "En la villa",
    "services.spa.title": "Spa y Masajes",
    "services.spa.body": "Los terapeutas vienen a ti — masajes en la terraza, faciales antes de la cena, yoga al amanecer. La música de fondo es el mar o los viñedos.",
    "services.grocery.tag": "Antes de llegar",
    "services.grocery.title": "Despensa Precargada",
    "services.grocery.body": "Envíanos una lista — o solo cuéntanos cómo comen. El refrigerador, el bar y el frutero estarán listos antes de que aterrice tu avión.",
    "services.events.tag": "Ocasiones especiales",
    "services.events.title": "Eventos y Bodas",
    "services.events.body": "Cumpleaños, propuestas, renovación de votos, la boda misma — coordinamos flores, música, fotografía y el momento que nadie olvida.",
    "services.wine.tag": "Valle de Guadalupe",
    "services.wine.title": "Tours de Vino",
    "services.wine.body": "Bodegas que no reciben visitas sin cita, vinicultores que sirven sus propias botellas, y un chofer para el regreso. El valle, como se debe.",
    "services.excursions.tag": "Playa del Carmen",
    "services.excursions.title": "Excursiones",
    "services.excursions.body": "Cenotes privados, buceo en el arrecife, ruinas mayas antes de que lleguen los camiones de turistas, catamaranes a la hora dorada. Sin filas; nosotros ya llamamos con anticipación.",
    "services.cta.title": "Si se puede organizar en México, lo <em>organizamos</em>.",
    "services.cta.tell": "Cuéntanos qué necesitas",
    "services.cta.whatsapp": "Escríbenos por WhatsApp",
    "services.gallery.prev": "Servicio anterior",
    "services.gallery.next": "Servicio siguiente",
    "services.between.body": "Elevamos tu estancia con servicios personalizados, diseñados para el confort, el lujo y una vida sin esfuerzo. Cada detalle está cuidadosamente organizado para crear una experiencia excepcional, desde la llegada hasta la partida.",

    /* ---------- About Us (about.html) ---------- */
    "about.hero.title": "Sobre <em>nosotros</em>",
    "about.hero.lead": "Un equipo pequeño y apasionado que ha pasado veinte años aprendiendo exactamente cómo se siente lo extraordinario — y cómo entregarlo dos veces.",
    "about.hero.scroll": "Desliza para ver más",
    "about.story.title": "Veinte años abriendo <em>puertas</em>",
    "about.story.lead": "Mexico Luxe Stays comenzó con una sola propiedad frente al mar y una convicción firme: una villa debe ser recibida por un anfitrión, no solo rentada.",
    "about.story2.title": "Un solo equipo, en cada <em>paso</em>",
    "about.story2.lead": "Dos décadas después, administramos una colección seleccionada a mano en dos de los destinos más impresionantes de México — la Riviera Maya y el Valle de Guadalupe.",
    "about.stats.1.num": "20+",
    "about.stats.1.label": "Años de experiencia",
    "about.stats.2.num": "1",
    "about.stats.2.label": "Equipo dedicado",
    "about.stats.3.num": "∞",
    "about.stats.3.label": "Huéspedes que regresan",
    "about.values.eyebrow": "Misión y valores",
    "about.values.title": "El lujo es <em>personal</em>, o no es lujo",
    "about.values.lead": "Nuestra misión es simple: elegancia sin fricciones, privacidad total, y una hospitalidad que se siente hecha para ti — desde la primera consulta hasta la salida final.",
    "about.values.1.title": "Exclusividad sin frialdad",
    "about.values.1.body": "Privado no significa distante. Cada villa está bardeada, atendida y es solo tuya — y cada bienvenida es cálida, por tu nombre, con tu bebida favorita ya fría.",
    "about.values.2.title": "De principio a fin, un solo equipo",
    "about.values.2.body": "Sin centros de llamadas, sin transferencias. La persona que planea tu estancia es la misma que te recibe. Veinte años nos enseñaron que los detalles solo sobreviven cuando nunca cambian de manos.",
    "about.values.3.title": "Dos destinos, un mismo estándar",
    "about.values.3.body": "Frente al mar o entre viñedos, la promesa es idéntica: propiedades seleccionadas a mano, mantenimiento impecable, y un servicio que se anticipa en lugar de reaccionar.",
    "about.cta.eyebrow": "Veinte años después — sigue tu estancia",
    "about.cta.title": "Planeemos el viaje que todos <em>envidiarán</em>.",
    "about.cta.contact": "Contáctanos",
    "about.cta.browse": "Ver las villas",

    /* ---------- FAQ (faq.html) ---------- */
    "faq.hero.title": "Preguntas, <em>resueltas</em>",
    "faq.q1": "¿Cómo funciona el proceso de reservación?",
    "faq.a1": "Envíanos tus fechas, tamaño del grupo y villa de preferencia — por formulario, correo o WhatsApp. Confirmamos disponibilidad en cuestión de horas, apartamos la villa mientras decides, y aseguramos la reservación con un contrato firmado y un depósito. Desde ese momento, tu concierge se encarga de la planeación: traslados, menús del chef, listas de despensa, y cualquier ocasión especial que debamos saber.",
    "faq.q2": "¿Cuál es la política de cancelación?",
    "faq.a2": "Las reservaciones canceladas con 60 días o más de anticipación reciben reembolso completo de lo pagado, menos comisiones de procesamiento. Entre 59 y 30 días, se retiene el depósito; dentro de los 30 días, los pagos no son reembolsables. Siempre intentamos reagendar tus fechas — si lo logramos, devolvemos lo que el calendario permita. Las semanas de temporada alta tienen sus propios términos, confirmados al reservar.",
    "faq.q3": "¿Cuáles son los horarios de entrada y salida?",
    "faq.a3": "Entrada a partir de las 3:00 PM, salida antes de las 11:00 AM. Llegadas tempranas y salidas tardías suelen ser posibles fuera de temporada alta — dinos tus horarios de vuelo y haremos lo posible por ajustar el día. Tu anfitrión te recibe personalmente al llegar; en Mexico Luxe Stays no hay cajas de seguridad con llaves.",
    "faq.q4": "¿Se requiere un depósito de garantía?",
    "faq.a4": "Sí — se retiene un depósito de garantía reembolsable por estancia (el monto varía según la villa y se confirma al reservar). Se libera por completo dentro de los 7 días posteriores a la salida, siempre que la villa se entregue tan cuidada como se recibió. En veinte años, eso ha pasado en casi todas las estancias.",
    "faq.q5": "¿Se aceptan mascotas?",
    "faq.a5": "Varias de nuestras villas reciben perros bien educados con aprobación previa — solo dinos quién viene al hacer tu consulta. Aplica una tarifa por mascota y algunas reglas de la casa (varían según la propiedad). Cuando la respuesta es no, es decisión del propietario, no nuestra, y te indicaremos en qué villas sí es posible.",
    "faq.q6": "¿Hay una estancia mínima?",
    "faq.a6": "La mayoría de las villas piden 3 noches mínimo; los periodos vacacionales (Navidad, Año Nuevo, Semana Santa) suelen requerir de 5 a 7. A veces hay estancias más cortas disponibles entre reservaciones — pregúntanos y revisamos el calendario por ti.",
    "faq.q7": "¿Qué incluye la tarifa?",
    "faq.a7": "Cada estancia incluye limpieza diaria, un concierge dedicado, servicios básicos, Wi-Fi, y una villa completamente equipada — sábanas, toallas y equipo de playa o alberca incluidos. Los servicios de chef, traslados, spa, tours y despensa precargada se organizan por separado, así que solo pagas por lo que tu viaje realmente necesita.",
    "faq.q8": "¿Qué métodos de pago aceptan?",
    "faq.a8": "Transferencia bancaria (USD o MXN) y las principales tarjetas de crédito; los pagos con tarjeta incluyen la comisión del procesador. Un depósito asegura tus fechas y el saldo se paga 30 días antes de la llegada — si reservas dentro de esos 30 días, se liquida el total al momento de reservar. Cada pago queda documentado con un contrato formal y un recibo.",
    "faq.q9": "¿Cómo nos movemos localmente?",
    "faq.a9": "En Playa del Carmen, la mayoría de nuestros huéspedes combinan nuestro traslado del aeropuerto con un chofer privado disponible — la playa, los cenotes y la Quinta Avenida están a distancias cortas. En el Valle de Guadalupe, un chofer marca la diferencia entre catar y abstenerse; los nuestros conocen cada puerta de viñedo sin letrero. También podemos entregar un auto rentado en la villa si prefieres manejar.",
    "faq.cta.eyebrow": "¿Sigues con dudas?",
    "faq.cta.title": "Pregúntale a una persona real — respondemos <em>rápido</em>.",
    "faq.cta.whatsappWeb": "WhatsApp Web",
    "faq.cta.whatsappPhone": "WhatsApp en el teléfono",
    "faq.cta.phoneNumber": "Número de teléfono (MX)",
    "faq.cta.phoneNumberUs": "Número de teléfono (USA)",

    /* ---------- Contact Us (contact.html) ---------- */
    "contact.hero.eyebrow": "Respondemos rápido",
    "contact.hero.title": "Contáctanos",
    "contact.hero.lead": "Cuéntanos tus fechas y tu idea de viaje soñado. Nosotros nos encargamos de todo lo demás.",
    "contact.channels.eyebrow": "Líneas directas",
    "contact.channels.title": "Habla con una <em>persona</em>, no con un portal",
    "contact.channels.lead": "Llama, escribe, manda WhatsApp, o correo — el mismo equipo pequeño responde en cualquier canal, normalmente en menos de una hora.",
    "contact.channels.call": "Llamar o mensaje de texto",
    "contact.channels.whatsapp": "WhatsApp",
    "contact.channels.whatsappCta": "Escríbenos ahora",
    "contact.channels.email": "Correo",
    "contact.channels.social": "Redes sociales",
    "contact.form.eyebrow": "Planear mi estancia",
    "contact.form.title": "Envía tu consulta",
    "contact.form.name": "Nombre completo *",
    "contact.form.namePh": "Tu nombre",
    "contact.form.email": "Correo *",
    "contact.form.emailPh": "tu@correo.com",
    "contact.form.phone": "Teléfono / WhatsApp",
    "contact.form.phonePh": "+52 ...",
    "contact.form.villa": "Villa de preferencia",
    "contact.form.villaAdvise": "Aún no lo sé — asesórenme",
    "contact.form.checkin": "Llegada",
    "contact.form.checkout": "Salida",
    "contact.form.message": "Tu mensaje",
    "contact.form.messagePh": "Tamaño del grupo, la ocasión, cualquier cosa que debamos saber...",
    "contact.form.submit": "Enviar consulta",
    "contact.form.note": "Al enviar se abre WhatsApp con tu mensaje listo para enviar — nuestro canal más rápido. ¿Prefieres correo? Escribe a <a href=\"mailto:info@mexicoluxestays.com\" style=\"color:var(--gold)\">info@mexicoluxestays.com</a>.",
    "contact.form.status": "Abriendo WhatsApp con tu consulta — normalmente respondemos en menos de una hora.",
    "contact.locations.eyebrow": "Dónde encontrarnos",
    "contact.locations.title": "Dos <em>destinos</em>",
    "contact.locations.playaMap": "Mapa — Playa del Carmen<br>Riviera Maya, Quintana Roo",
    "contact.locations.playaName": "Playa del Carmen",
    "contact.locations.playaDesc": "Riviera Maya · Quintana Roo · 45 min desde el Aeropuerto Internacional de Cancún (CUN)",
    "contact.locations.valleMap": "Mapa — Valle de Guadalupe<br>Ensenada, Baja California",
    "contact.locations.valleName": "Valle de Guadalupe",
    "contact.locations.valleDesc": "Baja California · 90 min desde Tijuana (TIJ) / frontera con San Diego"
  }
};

/* ---------- Engine ---------- */
(function () {
  "use strict";

  function currentLang() {
    return localStorage.getItem("mlsLang") || "en";
  }

  function applyLanguage(lang) {
    const dict = MLS_I18N[lang] || MLS_I18N.en;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      if (dict[key] != null) el.setAttribute("aria-label", dict[key]);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (dict[key] != null) el.setAttribute("alt", dict[key]);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (dict[key] != null) el.setAttribute("title", dict[key]);
    });

    document.querySelectorAll("[data-lang-toggle]").forEach((toggle) => {
      toggle.querySelectorAll("[data-lang-option]").forEach((opt) => {
        const isActive = opt.getAttribute("data-lang-option") === lang;
        opt.classList.toggle("is-active", isActive);
        opt.setAttribute("aria-pressed", String(isActive));
      });
    });

    localStorage.setItem("mlsLang", lang);
    document.dispatchEvent(new CustomEvent("mls:languagechange", { detail: { lang } }));
  }

  function t(key, lang) {
    const dict = MLS_I18N[lang || currentLang()] || MLS_I18N.en;
    return dict[key] != null ? dict[key] : (MLS_I18N.en[key] || key);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(currentLang());
    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang-option")));
    });
  });

  window.mlsT = t;
  window.mlsCurrentLang = currentLang;
  window.mlsApplyLanguage = applyLanguage;
})();
