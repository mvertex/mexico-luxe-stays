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
            <div class="spec"><div class="spec-num">${villa.area}</div><div class="spec-label">${t("detail.specs.area")}</div></div>
            <div class="spec"><div class="spec-num">${villa.destination === "playa-del-carmen" ? t("detail.specs.beach") : t("detail.specs.vines")}</div><div class="spec-label">${destinationLabel}</div></div>`;
        }
        const amenitiesEl = detailRoot.querySelector("[data-villa-amenities]");
        if (amenitiesEl) {
          amenitiesEl.innerHTML =
            (villa.amenities || []).map((a) => `<li>${pick(a)}</li>`).join("") +
            (villa.amenitiesMore || []).map((a) => `<li class="amenity-more">${pick(a)}</li>`).join("");
          amenitiesEl.classList.toggle("is-expanded", amenitiesExpanded);
          if (amenitiesToggle) {
            amenitiesToggle.hidden = !(villa.amenitiesMore && villa.amenitiesMore.length);
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
        f.get("message") ? `Message: ${f.get("message")}` : ""
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

  initReveal();
})();
