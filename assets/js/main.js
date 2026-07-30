/* ==========================================================================
   MEXICO LUXE STAYS — shared behaviors
   Header state, mobile nav, hero entrance, scroll reveal, featured carousel,
   testimonials, villa filtering, FAQ accordion, contact form.
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lightbox: full-image viewer for the villa gallery showcase ---------- */
  let mlsOpenLightbox = null;
  const lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    const lbImg = lightbox.querySelector("[data-lightbox-img]");
    const counter = lightbox.querySelector("[data-lightbox-counter]");
    let lbImages = [];
    let lbIndex = 0;

    const renderLightbox = () => {
      const current = lbImages[lbIndex];
      lbImg.src = current.src;
      lbImg.alt = current.alt;
      counter.textContent = `${lbIndex + 1} / ${lbImages.length}`;
    };
    const closeLightbox = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    };
    const nextImage = () => { lbIndex = (lbIndex + 1) % lbImages.length; renderLightbox(); };
    const prevImage = () => { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLightbox(); };

    mlsOpenLightbox = (images, startIndex) => {
      if (!images || !images.length) return;
      lbImages = images;
      lbIndex = startIndex || 0;
      renderLightbox();
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    };

    lightbox.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
    lightbox.querySelector("[data-lightbox-next]").addEventListener("click", nextImage);
    lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", prevImage);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    });
  }

  /* ---------- Quick actions: phone / WhatsApp popovers (hover-intent) ---------- */
  const quickActions = document.querySelector("[data-quick-actions]");
  if (quickActions) {
    quickActions.querySelectorAll("[data-qa-item]").forEach((item) => {
      const toggleBtn = item.querySelector("[data-qa-toggle]");
      const closeBtn = item.querySelector("[data-qa-close]");
      if (!toggleBtn) return;

      let closeTimer = null;
      let openedAt = 0;
      const cancelClose = () => {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      };
      const closePanel = () => {
        cancelClose();
        item.classList.remove("is-open");
        toggleBtn.setAttribute("aria-expanded", "false");
        /* :focus-within keeps the panel visible for keyboard users — if the
           element being closed (e.g. the X button) still has focus, blur it
           so closing actually works, whether triggered by mouse or keyboard. */
        if (item.contains(document.activeElement)) document.activeElement.blur();
      };
      const openPanel = () => {
        cancelClose();
        item.classList.add("is-open");
        toggleBtn.setAttribute("aria-expanded", "true");
        openedAt = Date.now();
      };
      /* Grace period so moving the cursor from the button to the panel
         (crossing the gap between them) doesn't lose hover and close it early. */
      const scheduleClose = () => {
        cancelClose();
        closeTimer = setTimeout(closePanel, 350);
      };

      item.addEventListener("mouseenter", openPanel);
      item.addEventListener("mouseleave", scheduleClose);
      item.addEventListener("focusin", cancelClose);

      toggleBtn.addEventListener("click", () => {
        /* Moving the mouse onto the button fires mouseenter (→ openPanel)
           a few ms before the click event itself, so a plain toggle here
           would immediately re-close whatever hover just opened. Only
           treat it as a close if it was already open before this hover. */
        const justOpenedByHover = Date.now() - openedAt < 300;
        if (item.classList.contains("is-open") && !justOpenedByHover) {
          closePanel();
        } else if (!item.classList.contains("is-open")) {
          openPanel();
        }
      });
      closeBtn?.addEventListener("click", closePanel);

      document.addEventListener("click", (e) => {
        if (item.classList.contains("is-open") && !item.contains(e.target)) closePanel();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && item.classList.contains("is-open")) {
          closePanel();
          toggleBtn.focus();
        }
      });
    });

    const qrToggle = quickActions.querySelector("[data-wa-qr-toggle]");
    const qrBox = quickActions.querySelector(".wa-qr");
    qrToggle?.addEventListener("click", () => {
      const show = !qrBox.classList.contains("is-visible");
      qrBox.classList.toggle("is-visible", show);
      qrToggle.setAttribute("aria-expanded", String(show));
    });
  }

  /* ---------- Phone CTA: dial on touch devices, just reveal the number on desktop ---------- */
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  document.querySelectorAll("[data-phone-reveal]").forEach((el) => {
    if (isTouchDevice) return; // let the tel: link open the dialer as usual
    el.addEventListener("click", (e) => {
      e.preventDefault();
      el.textContent = el.dataset.phoneNumber;
    });
  });

  /* ---------- WhatsApp-on-the-phone CTA: show a QR to scan on desktop,
     open the WhatsApp app directly on touch devices ---------- */
  document.querySelectorAll("[data-whatsapp-reveal]").forEach((el) => {
    if (isTouchDevice) return; // let the wa.me link open the app as usual
    const popover = document.getElementById(el.dataset.qrTarget);
    if (!popover) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      popover.hidden = !popover.hidden;
    });
    popover.querySelector("[data-qr-close]")?.addEventListener("click", () => { popover.hidden = true; });
    document.addEventListener("click", (e) => {
      if (!popover.hidden && !popover.contains(e.target) && e.target !== el) popover.hidden = true;
    });
  });

  /* ---------- Header: transparent over hero → solid after scroll ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const hasHero = document.body.classList.contains("has-hero");
    const setHeaderState = () => {
      header.classList.toggle("is-solid", !hasHero || window.scrollY > 40);
    };
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    const toggle = header.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open);
        document.body.style.overflow = open ? "hidden" : "";
      });
      header.querySelectorAll(".main-nav a").forEach((a) =>
        a.addEventListener("click", () => {
          header.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        })
      );
    }
  }

  /* ---------- Hero entrance ---------- */
  const hero = document.querySelector(".hero");
  if (hero) requestAnimationFrame(() => hero.classList.add("is-ready"));

  /* ---------- Scroll reveal (single observer, animates once) ---------- */
  const initReveal = () => {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  };

  const t = (key) => (typeof window.mlsT === "function" ? window.mlsT(key) : key);

  /* ---------- Featured villas showcase (home): hover a name to preview it ---------- */
  const featuredShowcase = document.querySelector("[data-featured-showcase]");
  let renderFeaturedShowcase = null;
  if (featuredShowcase && typeof MLS_VILLAS !== "undefined") {
    const list = featuredShowcase.querySelector("[data-featured-list]");
    const imgEl = featuredShowcase.querySelector("[data-featured-img]");
    let swapTimer = null;

    const previewVilla = (villa) => {
      clearTimeout(swapTimer);
      if (imgEl.src === villa.image) return;
      imgEl.style.opacity = "0";
      swapTimer = setTimeout(() => {
        imgEl.src = villa.image;
        imgEl.alt = villa.imageAlt;
        imgEl.style.opacity = "1";
      }, prefersReducedMotion ? 0 : 220);
    };

    renderFeaturedShowcase = () => {
      /* HOSTAWAY: featured listings come from MLS_VILLAS (see villas-data.js) */
      const villas = MLS_VILLAS.filter((v) => v.featured);

      list.innerHTML = villas
        .map(
          (v, i) => `
        <li>
          <a class="featured-item${i === 0 ? " is-active" : ""}" href="villas/${v.slug}.html" data-index="${i}">
            <span class="featured-item-label">${v.name}</span>
            <span class="featured-item-line" aria-hidden="true"></span>
          </a>
        </li>`
        )
        .join("");

      imgEl.src = villas[0].image;
      imgEl.alt = villas[0].imageAlt;

      const items = list.querySelectorAll(".featured-item");
      items.forEach((item, i) => {
        const activate = () => {
          items.forEach((other) => other.classList.remove("is-active"));
          item.classList.add("is-active");
          previewVilla(villas[i]);
        };
        item.addEventListener("mouseenter", activate);
        item.addEventListener("focus", activate);
      });
    };
    renderFeaturedShowcase();
  }

  /* ---------- Villa grid + filters (Our Villas) ---------- */
  const villaGrid = document.querySelector("[data-villa-grid]");
  let renderVillaGrid = null;
  if (villaGrid && typeof MLS_VILLAS !== "undefined") {
    const selDest = document.querySelector("#filter-destination");
    const selGuests = document.querySelector("#filter-guests");
    const selBeds = document.querySelector("#filter-bedrooms");
    const countEl = document.querySelector("[data-filter-count]");

    /* Pre-fill from query string (home search widget lands here).
       HOSTAWAY: checkin/checkout params are captured below — feed them to the
       availability endpoint once connected; today they only inform the inquiry. */
    const params = new URLSearchParams(window.location.search);
    if (params.get("destination")) selDest.value = params.get("destination");
    if (params.get("guests")) {
      const g = parseInt(params.get("guests"), 10);
      const opt = [...selGuests.options].reverse().find((o) => o.value && parseInt(o.value, 10) <= g);
      if (g && opt) selGuests.value = [...selGuests.options].find((o) => parseInt(o.value, 10) >= g)?.value || opt.value;
    }

    renderVillaGrid = () => {
      const dest = selDest.value;
      const minGuests = parseInt(selGuests.value, 10) || 0;
      const minBeds = parseInt(selBeds.value, 10) || 0;
      const list = MLS_VILLAS.filter(
        (v) =>
          (!dest || v.destination === dest) &&
          v.guests >= minGuests &&
          v.bedrooms >= minBeds
      );
      countEl.textContent = list.length
        ? t("villas.count.showing").replace("{count}", list.length).replace("{total}", MLS_VILLAS.length)
        : "";
      villaGrid.innerHTML = list.length
        ? list.map((v, i) => mlsVillaShowcaseRow(v, i)).join("")
        : `<div class="empty-state">
             <p class="h3" style="color:var(--ink)">${t("villas.empty.title")}</p>
             <p>${t("villas.empty.body")}</p>
             <a class="btn btn-solid" href="contact.html">${t("villas.empty.cta")}</a>
           </div>`;
      villaGrid.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    };

    [selDest, selGuests, selBeds].forEach((s) => s.addEventListener("change", renderVillaGrid));
    document.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
      selDest.value = ""; selGuests.value = ""; selBeds.value = "";
      history.replaceState(null, "", window.location.pathname);
      renderVillaGrid();
    });
    renderVillaGrid();

    /* Per-row photo carousel (prev/next + dots). Delegated on the grid
       container so it survives re-renders triggered by the filters. */
    villaGrid.addEventListener("click", (e) => {
      const prevBtn = e.target.closest("[data-carousel-prev]");
      const nextBtn = e.target.closest("[data-carousel-next]");
      const dotBtn = e.target.closest("[data-carousel-dot]");
      if (!prevBtn && !nextBtn && !dotBtn) return;
      const row = e.target.closest("[data-villa-row]");
      if (!row) return;
      const slides = [...row.querySelectorAll(".villa-row-slide")];
      const dots = [...row.querySelectorAll(".carousel-dot")];
      const current = slides.findIndex((s) => s.classList.contains("is-active"));
      let next = current;
      if (prevBtn) next = (current - 1 + slides.length) % slides.length;
      if (nextBtn) next = (current + 1) % slides.length;
      if (dotBtn) next = parseInt(dotBtn.dataset.carouselDot, 10);
      if (next === current) return;
      slides[current]?.classList.remove("is-active");
      slides[next]?.classList.add("is-active");
      dots[current]?.classList.remove("is-active");
      dots[next]?.classList.add("is-active");
    });
  }

  /* ---------- Amenity icons: keyword-matched against the English label ---------- */
  const MLS_AMENITY_ICON_DEFS = {
    pool: '<path d="M2 8c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/><path d="M2 14c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/><path d="M2 20c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/>',
    squash: '<circle cx="9" cy="8" r="5"/><line x1="9" y1="13" x2="9" y2="21"/><line x1="6" y1="21" x2="12" y2="21"/>',
    gym: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><line x1="8" y1="12" x2="16" y2="12" stroke-width="3"/>',
    grill: '<path d="M12 3c-1 2.5-4 4-4 7.5a4 4 0 0 0 8 0c0-1.2-.5-2-1-2.7.1 1-.4 2-1.3 2.3-1 .3-1.9-.4-1.7-1.4C12.3 7 13 5 12 3z"/>',
    chef: '<path d="M8 21h8v-6H8v6z"/><path d="M7 15a4 4 0 0 1-1-7.9A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 6 3.1A4 4 0 0 1 17 15H7z"/>',
    sparkle: '<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.7 2.1L22 18l-2.3.9L19 21l-.7-2.1L16 18l2.3-.9L19 15z"/>',
    bell: '<path d="M12 3a5 5 0 0 0-5 5v3c0 1.5-.6 2.9-1.6 4h13.2c-1-1.1-1.6-2.5-1.6-4V8a5 5 0 0 0-5-5z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    bar: '<path d="M4 4h16"/><path d="M4 4l8 9 8-9"/><line x1="12" y1="13" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M19.5 6.5a8 8 0 0 1 0 11"/>',
    beach: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    view: '<path d="M3 18l5-7 4 5 3-4 6 6H3z"/><circle cx="8" cy="7" r="1.6"/>',
    wine: '<path d="M10 2h4v3l1.5 2.5V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V7.5L10 5V2z"/><line x1="10" y1="2" x2="14" y2="2"/>',
    kitchen: '<path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-3z"/><line x1="2" y1="11" x2="22" y2="11"/><path d="M8 11V8M16 11V8"/>',
    wifi: '<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5.5 12a10 10 0 0 1 13 0"/><path d="M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/>',
    bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><line x1="2" y1="19" x2="22" y2="19"/>',
    cinema: '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M9 5v12M15 5v12M3 9h6M3 13h6M15 9h6M15 13h6"/>',
    game: '<rect x="3" y="8" width="18" height="9" rx="4"/><line x1="7" y1="11" x2="7" y2="14"/><line x1="5.5" y1="12.5" x2="8.5" y2="12.5"/><circle cx="16" cy="11" r="1"/><circle cx="18.5" cy="13.5" r="1"/>',
    transfer: '<path d="M3 16v-3l2-4h10l2 4v3"/><rect x="3" y="16" width="14" height="3" rx="1"/><circle cx="6.5" cy="19" r="1.3"/><circle cx="14.5" cy="19" r="1.3"/>',
    jacuzzi: '<path d="M3 15c1.2 1.2 2.5 1.2 3.7 0s2.5-1.2 3.7 0 2.5 1.2 3.7 0 2.5-1.2 3.7 0"/><circle cx="7" cy="7" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="17" cy="8" r="1"/><rect x="2" y="15" width="20" height="4" rx="1"/>',
    door: '<rect x="6" y="3" width="12" height="18" rx="1"/><circle cx="14.5" cy="12" r="1"/>',
    spa: '<path d="M4 20c0-9 6-15 15-15 0 9-6 15-15 15z"/><path d="M4 20c4-4 8-8 15-15"/>',
    basket: '<path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 8z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    sports: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.3 6.3c2 2 2 9.4 0 11.4M17.7 6.3c-2 2-2 9.4 0 11.4"/>',
    ac: '<path d="M12 2v20M4.5 6l15 12M19.5 6l-15 12"/>',
    baby: '<rect x="4" y="10" width="16" height="8" rx="2"/><path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
    ev: '<circle cx="12" cy="12" r="9"/><path d="M13 7l-4 6h3l-1 4 4-6h-3l1-4z"/>',
    safe: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v1.5M12 13.5V15M9 12h1.5M13.5 12H15"/>',
    parking: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 16V8h3.5a2.5 2.5 0 0 1 0 5H9"/>',
    laundry: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><circle cx="12" cy="13" r="2"/><circle cx="7" cy="6" r=".8"/><circle cx="10" cy="6" r=".8"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 4c0 1-1 1-1 2M12 4c0 1-1 1-1 2"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8M12 17v4"/>',
    sofa: '<path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 12h18v5a1 1 0 0 1-1 1h-1v2h-2v-2H7v2H5v-2H4a1 1 0 0 1-1-1v-5z"/>',
    family: '<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><path d="M3 20c0-3 2-5 5-5s5 2 5 5M11 20c0-3 2-5 5-5s5 2 5 5"/>',
    default: '<circle cx="12" cy="12" r="8"/><path d="M9 12l2 2 4-4"/>'
  };
  const MLS_AMENITY_ICON_RULES = [
    ["pool", "pool"],
    ["squash", "squash"], ["tennis", "squash"],
    ["gym", "gym"],
    ["grill", "grill"], ["oven", "grill"], ["bbq", "grill"], ["al fresco", "grill"],
    ["chef", "chef"],
    ["housekeeping", "sparkle"], ["event", "sparkle"], ["celebrat", "sparkle"],
    ["concierge", "bell"],
    ["bartender", "bar"], ["honor bar", "bar"],
    ["sonos", "sound"], ["bose", "sound"], ["sound", "sound"],
    ["beach", "beach"], ["quinta avenida", "beach"], ["sun bed", "beach"], ["hammock", "beach"],
    ["view", "view"],
    ["fire-pit", "grill"], ["fireplace", "grill"],
    ["winer", "wine"], ["wine cellar", "wine"],
    ["dining", "kitchen"], ["kitchen", "kitchen"],
    ["wi-fi", "wifi"], ["wifi", "wifi"], ["starlink", "wifi"],
    ["ensuite", "bath"], ["bathroom", "bath"], ["hair dryer", "bath"],
    ["cinema", "cinema"],
    ["ping pong", "game"], ["foosball", "game"], ["board game", "game"], ["game room", "game"],
    ["airport transfer", "transfer"],
    ["jacuzzi", "jacuzzi"], ["hot tub", "jacuzzi"],
    ["entrance", "door"], ["studio", "door"],
    ["sauna", "spa"], ["spa", "spa"],
    ["grocery", "basket"],
    ["basketball", "sports"],
    ["air conditioning", "ac"], ["heating", "ac"],
    ["crib", "baby"], ["high chair", "baby"],
    ["electric vehicle", "ev"],
    ["safe", "safe"],
    ["parking", "parking"], ["garage", "parking"],
    ["washer", "laundry"],
    ["nespresso", "coffee"],
    ["smart tv", "tv"],
    ["living room", "sofa"],
    ["family friendly", "family"]
  ];
  const mlsAmenityIconKey = (enText) => {
    const lower = (enText || "").toLowerCase();
    const hit = MLS_AMENITY_ICON_RULES.find(([kw]) => lower.includes(kw));
    return hit ? hit[1] : "default";
  };
  const mlsAmenityIcon = (enText) => MLS_AMENITY_ICON_DEFS[mlsAmenityIconKey(enText)];

  /* ---------- Amenity categories: grouped by icon concept for the categorized showcase ---------- */
  const MLS_AMENITY_CATEGORY_BY_ICON = {
    pool: "wellness", squash: "wellness", gym: "wellness", jacuzzi: "wellness",
    spa: "wellness", sports: "wellness", beach: "wellness", view: "wellness", bath: "wellness",
    grill: "dining", chef: "dining", bar: "dining", wine: "dining", kitchen: "dining",
    coffee: "dining", basket: "dining",
    sparkle: "services", bell: "services", safe: "services", parking: "services",
    laundry: "services", transfer: "services", door: "services", baby: "services",
    ac: "services", ev: "services",
    sound: "entertainment", cinema: "entertainment", game: "entertainment",
    tv: "entertainment", wifi: "entertainment", family: "entertainment", sofa: "entertainment"
  };
  const MLS_AMENITY_CATEGORY_ORDER = ["wellness", "dining", "services", "entertainment", "other"];
  const mlsAmenityCategory = (enText) => MLS_AMENITY_CATEGORY_BY_ICON[mlsAmenityIconKey(enText)] || "other";

  /* ---------- Villa detail: specs + amenities + related, driven by data ---------- */
  const detailRoot = document.querySelector("[data-villa-slug]");
  let renderVillaDetail = null;
  if (detailRoot && typeof MLS_VILLAS !== "undefined") {
    const villa = MLS_VILLAS.find((v) => v.slug === detailRoot.dataset.villaSlug);
    if (villa) {
      let amenitiesExpanded = false;
      const amenitiesToggle = document.querySelector("[data-amenities-toggle]");

      const updateAmenitiesToggleLabel = () => {
        if (!amenitiesToggle) return;
        const key = amenitiesExpanded ? "detail.amenities.showLess" : "detail.amenities.showAll";
        /* keep data-i18n in sync so a language switch re-applies the right label */
        amenitiesToggle.setAttribute("data-i18n", key);
        amenitiesToggle.textContent = t(key);
      };

      renderVillaDetail = () => {
        const lang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
        const pick = (item) => (lang === "es" && item.es) || item.en;
        const specsEl = detailRoot.querySelector("[data-villa-specs]");
        if (specsEl) {
          const baths = villa.baths % 1 === 0 ? villa.baths : villa.baths.toFixed(1);
          const destinationLabel = (lang === "es" && villa.destinationLabelEs) || villa.destinationLabel;
          specsEl.innerHTML = `
            <div class="spec"><div class="spec-num">${villa.guests}</div><div class="spec-label">${t("detail.specs.guests")}</div></div>
            <div class="spec"><div class="spec-num">${villa.bedrooms}</div><div class="spec-label">${t("detail.specs.bedrooms")}</div></div>
            <div class="spec"><div class="spec-num">${villa.beds}</div><div class="spec-label">${t("detail.specs.beds")}</div></div>
            <div class="spec"><div class="spec-num">${baths}</div><div class="spec-label">${t("detail.specs.bathrooms")}</div></div>
            <div class="spec"><div class="spec-num">${villa.area}</div><div class="spec-label">${t("detail.specs.area")}</div><div class="spec-alt">${Math.round(villa.area * 10.7639).toLocaleString("en-US")} ${t("card.sqft")}</div></div>
            <div class="spec"><div class="spec-num">${villa.destination === "playa-del-carmen" ? t("detail.specs.beach") : t("detail.specs.vines")}</div><div class="spec-label">${destinationLabel}</div></div>`;
        }
        const amenitiesEl = detailRoot.querySelector("[data-villa-amenities]");
        if (amenitiesEl) {
          const allAmenities = [...(villa.amenities || []), ...(villa.amenitiesMore || [])];
          const half = Math.ceil(allAmenities.length / 2);

          /* Group into fixed categories (wellness/dining/services/entertainment),
             falling back to "other" — while keeping each item's original index so
             the existing "show all" split (first half visible) still applies. */
          const groups = {};
          allAmenities.forEach((a, i) => {
            const cat = mlsAmenityCategory(a.en);
            (groups[cat] = groups[cat] || []).push({ item: a, more: i >= half });
          });

          amenitiesEl.innerHTML = MLS_AMENITY_CATEGORY_ORDER.filter((cat) => groups[cat] && groups[cat].length)
            .map((cat) => {
              const rows = groups[cat]
                .map(
                  ({ item, more }) => `<li${more ? ' class="amenity-more"' : ""} tabindex="0"><span class="amenity-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${mlsAmenityIcon(item.en)}</svg></span><span class="amenity-text">${pick(item)}</span></li>`
                )
                .join("");
              return `<div class="amenity-category">
                <h3 class="amenity-category-title">${t("detail.amenities.category." + cat)}</h3>
                <span class="amenity-category-rule" aria-hidden="true"></span>
                <ul class="amenity-category-list">${rows}</ul>
              </div>`;
            })
            .join("");

          amenitiesEl.classList.toggle("is-expanded", amenitiesExpanded);
          if (amenitiesToggle) {
            amenitiesToggle.hidden = allAmenities.length <= half;
            updateAmenitiesToggleLabel();
          }
        }

        /* Gallery showcase: hover (or focus) a category to preview it on the right;
           "View Gallery" opens the full set for that category in the lightbox. */
        const galleryShowcase = document.querySelector("[data-gallery-showcase]");
        if (galleryShowcase && villa.gallery && villa.gallery.length) {
          const list = galleryShowcase.querySelector("[data-gallery-list]");
          const imgEl = galleryShowcase.querySelector("[data-gallery-img]");
          const viewBtn = galleryShowcase.querySelector("[data-gallery-view]");
          const categories = villa.gallery;
          const pickImg = (im) => ({ src: im.src, alt: (lang === "es" && im.altEs) || im.alt });

          list.innerHTML = categories
            .map(
              (g, i) => `
            <li>
              <button type="button" class="gallery-item${i === 0 ? " is-active" : ""}" data-index="${i}">
                <span class="gallery-item-label">${t("detail.gallery." + g.key)}</span>
                <span class="gallery-item-line" aria-hidden="true"></span>
              </button>
            </li>`
            )
            .join("");

          let activeCategory = categories[0];
          imgEl.src = categories[0].images[0].src;
          imgEl.alt = pickImg(categories[0].images[0]).alt;

          let galleryTimer = null;
          const previewCategory = (g) => {
            clearTimeout(galleryTimer);
            activeCategory = g;
            const first = pickImg(g.images[0]);
            if (imgEl.src === g.images[0].src) return;
            imgEl.style.opacity = "0";
            galleryTimer = setTimeout(() => {
              imgEl.src = g.images[0].src;
              imgEl.alt = first.alt;
              imgEl.style.opacity = "1";
            }, prefersReducedMotion ? 0 : 220);
          };

          const galleryItems = list.querySelectorAll(".gallery-item");
          galleryItems.forEach((item, i) => {
            const activate = () => {
              galleryItems.forEach((other) => other.classList.remove("is-active"));
              item.classList.add("is-active");
              previewCategory(categories[i]);
            };
            item.addEventListener("mouseenter", activate);
            item.addEventListener("focus", activate);
          });

          viewBtn?.addEventListener("click", () => {
            if (typeof mlsOpenLightbox === "function") {
              mlsOpenLightbox(activeCategory.images.map(pickImg));
            }
          });
        }
      };

      amenitiesToggle?.addEventListener("click", () => {
        amenitiesExpanded = !amenitiesExpanded;
        detailRoot.querySelector("[data-villa-amenities]")?.classList.toggle("is-expanded", amenitiesExpanded);
        amenitiesToggle.setAttribute("aria-expanded", String(amenitiesExpanded));
        updateAmenitiesToggleLabel();
      });

      renderVillaDetail();
    }
  }

  /* ---------- Re-render dynamic (data-driven) content when the language toggles ---------- */
  document.addEventListener("mls:languagechange", () => {
    renderFeaturedShowcase && renderFeaturedShowcase();
    renderVillaGrid && renderVillaGrid();
    renderVillaDetail && renderVillaDetail();
  });

  /* ---------- Testimonials rotator ---------- */
  const slides = document.querySelectorAll(".testimonial-slide");
  if (slides.length) {
    const dots = document.querySelectorAll(".testimonial-dots button");
    let current = 0;
    let timer = null;
    const show = (i) => {
      slides[current].classList.remove("is-active");
      dots[current]?.classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current]?.classList.add("is-active");
    };
    const play = () => {
      if (prefersReducedMotion) return;
      timer = setInterval(() => show(current + 1), 7000);
    };
    dots.forEach((dot, i) =>
      dot.addEventListener("click", () => {
        clearInterval(timer);
        show(i);
        play();
      })
    );
    show(0);
    play();
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = document.getElementById(btn.getAttribute("aria-controls"));
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      /* close siblings for a tidy, one-open accordion */
      document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          document.getElementById(other.getAttribute("aria-controls")).style.maxHeight = "0px";
        }
      });
      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? "0px" : answer.scrollHeight + "px";
    });
  });

  /* ---------- Contact form ---------- */
  /* ┌───────────────────────────────────────────────────────────────────┐
     │ FORM BACKEND INTEGRATION POINT                                    │
     │ No backend is wired yet. On submit we open WhatsApp with a        │
     │ prefilled message (the team's fastest channel). To capture leads  │
     │ server-side, POST the FormData to your endpoint / Formspree /     │
     │ Hostaway inquiry API here instead.                                │
     └───────────────────────────────────────────────────────────────────┘ */
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    /* Preselect villa when arriving from a detail page (?villa=slug) */
    const params = new URLSearchParams(window.location.search);
    const villaSel = contactForm.querySelector("#cf-villa");
    if (params.get("villa") && villaSel) villaSel.value = params.get("villa");

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(contactForm);
      const lines = [
        `Hello Mexico Luxe Stays — I'd like to plan a stay.`,
        `Name: ${f.get("name")}`,
        `Email: ${f.get("email")}`,
        f.get("phone") ? `Phone: ${f.get("phone")}` : "",
        f.get("villa") ? `Villa of interest: ${villaSel.options[villaSel.selectedIndex].text}` : "",
        f.get("checkin") || f.get("checkout") ? `Dates: ${f.get("checkin") || "?"} to ${f.get("checkout") || "?"}` : "",
        f.get("adults") ? `Adults: ${f.get("adults")}` : "",
        f.get("children") ? `Children under 12: ${f.get("children")}` : "",
        f.get("rooms") ? `Rooms needed: ${f.get("rooms")}` : "",
        f.get("message") ? `Comments: ${f.get("message")}` : ""
      ].filter(Boolean);
      window.open("https://wa.me/5219848079475?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      const status = contactForm.querySelector(".form-status");
      if (status) status.textContent = t("contact.form.status");
    });
  }

  /* ---------- Villa detail: booking CTA lead form ---------- */
  /* No backend wired yet — submit opens WhatsApp with a prefilled message,
     same pattern as the main contact form. Swap for a POST to your CRM /
     Hostaway inquiry API once connected. */
  document.querySelectorAll("[data-booking-cta-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const villaName = form.dataset.villaName || "";
      const lines = [
        `Hello Mexico Luxe Stays — I'd like to request information${villaName ? ` about ${villaName}` : ""}.`,
        `Name: ${f.get("name")}`,
        `Mobile: ${f.get("phone")}`
      ];
      window.open("https://wa.me/5219848079475?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      const status = form.querySelector("[data-form-status]");
      if (status) status.textContent = t("detail.bookingCta.status");
    });
  });

  /* ---------- Services carousel: bleed-scroll track + prev/next + dots ---------- */
  document.querySelectorAll("[data-svc-carousel]").forEach((root) => {
    const track = root.querySelector("[data-svc-track]");
    const prevBtn = root.querySelector("[data-svc-prev]");
    const nextBtn = root.querySelector("[data-svc-next]");
    const dotsWrap = root.querySelector("[data-svc-dots]");
    if (!track) return;

    const cards = [...track.children];
    if (dotsWrap) {
      dotsWrap.innerHTML = cards
        .map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " is-active" : ""}" data-svc-dot="${i}" aria-label="${i + 1}"></button>`)
        .join("");
    }
    const dots = dotsWrap ? [...dotsWrap.children] : [];

    const cardStep = () => {
      const card = track.querySelector(".svc-card");
      if (!card) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      return card.getBoundingClientRect().width + gap;
    };

    const updateNav = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 2;
      if (dots.length) {
        const idx = Math.min(Math.round(track.scrollLeft / cardStep()), dots.length - 1);
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      }
    };

    prevBtn?.addEventListener("click", () => track.scrollBy({ left: -cardStep(), behavior: "smooth" }));
    nextBtn?.addEventListener("click", () => track.scrollBy({ left: cardStep(), behavior: "smooth" }));
    dotsWrap?.addEventListener("click", (e) => {
      const dotBtn = e.target.closest("[data-svc-dot]");
      if (!dotBtn) return;
      track.scrollTo({ left: parseInt(dotBtn.dataset.svcDot, 10) * cardStep(), behavior: "smooth" });
    });

    let ticking = false;
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateNav(); ticking = false; });
    });
    window.addEventListener("resize", updateNav);
    updateNav();
  });

  initReveal();
})();
