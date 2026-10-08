/* ==========================================================================
   MEXICO LUXE STAYS — shared behaviors
   Header state, mobile nav, hero entrance, scroll reveal, featured carousel,
   testimonials, villa filtering, FAQ accordion, contact form.
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* srcset/sizes for photos that have mobile-sized copies (see
     MLS_IMG_VARIANTS / mlsSrcAttrs in villas-data.js). */
  const mlsImgAttrs = (src) => (typeof mlsSrcAttrs === "function" ? mlsSrcAttrs(src) : "");
  function mlsSetImg(img, src) {
    const attrs = /srcset="([^"]+)" sizes="([^"]+)"/.exec(mlsImgAttrs(src));
    if (attrs) { img.sizes = attrs[2]; img.srcset = attrs[1]; } else { img.removeAttribute("srcset"); }
    img.src = src;
  }

  /* ---------- Touch swipe: calls onSwipe(+1 | -1, touchEndEvent) for a
     clearly horizontal swipe; mostly-vertical drags are left alone so page
     scrolling is unaffected. ---------- */
  function mlsOnSwipe(el, onSwipe) {
    let x0 = null;
    let y0 = 0;
    el.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1, e);
    }, { passive: true });
  }

  /* ---------- Villa showcase rows (Our Villas + destination pages): photo
     carousel driven by arrows, dots and swipe. Slides after the first carry
     their source in data-src/data-srcset (see mlsVillaShowcaseRow) and are
     loaded when shown, with the following one prefetched. ---------- */
  function mlsLoadSlide(img) {
    if (!img || !img.dataset.src) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
    img.removeAttribute("data-srcset");
  }
  function mlsShowRowSlide(row, target) {
    const slides = [...row.querySelectorAll(".villa-row-slide")];
    const dots = [...row.querySelectorAll(".carousel-dot")];
    const current = slides.findIndex((s) => s.classList.contains("is-active"));
    const next = typeof target === "function" ? target(current, slides.length) : target;
    if (next === current || !slides[next]) return;
    mlsLoadSlide(slides[next]);
    mlsLoadSlide(slides[(next + 1) % slides.length]);
    slides[current]?.classList.remove("is-active");
    slides[next].classList.add("is-active");
    dots[current]?.classList.remove("is-active");
    dots[next]?.classList.add("is-active");
  }
  const mlsStepRow = (dir) => (current, n) => (current + dir + n) % n;
  function mlsWireRowCarousels(container) {
    container.addEventListener("click", (e) => {
      const prevBtn = e.target.closest("[data-carousel-prev]");
      const nextBtn = e.target.closest("[data-carousel-next]");
      const dotBtn = e.target.closest("[data-carousel-dot]");
      if (!prevBtn && !nextBtn && !dotBtn) return;
      const row = e.target.closest("[data-villa-row]");
      if (!row) return;
      if (prevBtn) mlsShowRowSlide(row, mlsStepRow(-1));
      if (nextBtn) mlsShowRowSlide(row, mlsStepRow(1));
      if (dotBtn) mlsShowRowSlide(row, parseInt(dotBtn.dataset.carouselDot, 10));
    });
    mlsOnSwipe(container, (dir, e) => {
      const row = e.target.closest && e.target.closest("[data-villa-row]");
      if (row && e.target.closest(".villa-row-media")) mlsShowRowSlide(row, mlsStepRow(dir));
    });
  }

  /* ---------- Custom select: replaces the native dropdown's OS-styled option
     list with a listbox that matches the filter bar's own look. The original
     <select> stays in the DOM (visually hidden) as the single source of
     truth, so existing filter logic (.value reads, "change" listeners, URL
     prefill) keeps working untouched. ---------- */
  function mlsEnhanceSelect(select) {
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const label = document.createElement("span");
    label.className = "custom-select-label";
    trigger.appendChild(label);

    const list = document.createElement("ul");
    list.className = "custom-select-list";
    list.setAttribute("role", "listbox");
    list.hidden = true;

    [...select.options].forEach((opt) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.tabIndex = -1;
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      list.appendChild(li);
    });

    /* Name the trigger after the field's <label> (plus its current value):
       with an empty placeholder option, as on the home hero, the button
       would otherwise have no accessible name at all. */
    const fieldLabel = select.id && document.querySelector(`label[for="${select.id}"]`);
    if (fieldLabel) {
      fieldLabel.id = fieldLabel.id || `${select.id}-label`;
      label.id = `${select.id}-value`;
      trigger.setAttribute("aria-labelledby", `${fieldLabel.id} ${label.id}`);
    }

    wrapper.appendChild(trigger);
    wrapper.appendChild(list);
    select.insertAdjacentElement("afterend", wrapper);
    select.classList.add("visually-hidden-select");
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;

    const syncFromSelect = () => {
      const selectedOpt = select.options[select.selectedIndex];
      label.textContent = selectedOpt ? selectedOpt.textContent : "";
      list.querySelectorAll("li").forEach((li) => {
        li.setAttribute("aria-selected", li.dataset.value === select.value ? "true" : "false");
      });
      select.closest(".hero-search-field")?.classList.toggle("has-value", !!select.value);
    };

    const closeList = () => {
      list.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };
    const openList = () => {
      document.querySelectorAll(".custom-select-list").forEach((l) => { l.hidden = true; });
      document.querySelectorAll(".custom-select-trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
      list.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    };

    trigger.addEventListener("click", () => {
      if (list.hidden) openList(); else closeList();
    });

    list.addEventListener("click", (e) => {
      const li = e.target.closest("li[role='option']");
      if (!li) return;
      select.value = li.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncFromSelect();
      closeList();
      trigger.focus();
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) closeList();
    });

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openList();
        (list.querySelector("li[aria-selected='true']") || list.querySelector("li"))?.focus();
      } else if (e.key === "Escape") {
        closeList();
      }
    });

    list.addEventListener("keydown", (e) => {
      const items = [...list.querySelectorAll("li")];
      const idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[idx + 1] || items[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[idx - 1] || items[items.length - 1]).focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.activeElement.click();
      } else if (e.key === "Escape") {
        closeList();
        trigger.focus();
      }
    });

    syncFromSelect();

    return {
      syncFromSelect,
      rebuildLabels: () => {
        [...select.options].forEach((opt, i) => {
          if (list.children[i]) list.children[i].textContent = opt.textContent;
        });
        syncFromSelect();
      },
    };
  }

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
    mlsOnSwipe(lightbox, (dir) => (dir > 0 ? nextImage() : prevImage()));
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    });
  }

  /* ---------- Room picker: the "Rooms" gallery tile doesn't jump straight
     into the lightbox — it opens a full-screen picker with one photo card
     per bedroom (Bedroom 1, Bedroom 2, ...), then hands that room's photos
     to the same lightbox. Room count comes from villa.bedrooms so this
     scales automatically as villas are added or resized. ---------- */
  let mlsOpenRoomPicker = null;
  const roomPicker = document.querySelector("[data-room-picker]");
  if (roomPicker) {
    const listEl = roomPicker.querySelector("[data-room-picker-list]");
    const prevBtn = roomPicker.querySelector("[data-room-picker-prev]");
    const nextBtn = roomPicker.querySelector("[data-room-picker-next]");
    let rpLastFocused = null;
    const closeRoomPicker = () => {
      roomPicker.hidden = true;
      document.body.style.overflow = "";
      rpLastFocused?.focus();
    };
    const updateRoomNav = () => {
      if (!prevBtn || !nextBtn) return;
      const max = listEl.scrollWidth - listEl.clientWidth;
      prevBtn.disabled = listEl.scrollLeft <= 4;
      nextBtn.disabled = max <= 4 || listEl.scrollLeft >= max - 4;
    };
    const scrollRoomsBy = (dir) => {
      const card = listEl.querySelector(".room-picker-item");
      const gap = parseFloat(getComputedStyle(listEl).columnGap) || 24;
      const amount = card ? card.getBoundingClientRect().width + gap : listEl.clientWidth * 0.8;
      listEl.scrollBy({ left: dir * amount, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };
    prevBtn?.addEventListener("click", () => scrollRoomsBy(-1));
    nextBtn?.addEventListener("click", () => scrollRoomsBy(1));
    listEl.addEventListener("scroll", updateRoomNav);
    /* `rooms` is one cover image per bedroom: [{ src, alt }, ...]. */
    mlsOpenRoomPicker = (rooms, onPick, trigger) => {
      if (!rooms || !rooms.length) return;
      rpLastFocused = trigger || null;
      listEl.scrollLeft = 0;
      listEl.innerHTML = rooms.map((room, i) => `
        <button type="button" class="room-picker-item" data-room-index="${i}">
          <span class="room-picker-item-media">
            <img src="${room.src}"${mlsImgAttrs(room.src)} alt="${room.alt}" loading="lazy">
          </span>
          <span class="room-picker-item-body">
            <span class="room-picker-item-label">${t("detail.gallery.roomLabel").replace("{n}", i + 1)}</span>
          </span>
        </button>`).join("");
      listEl.querySelectorAll(".room-picker-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          closeRoomPicker();
          onPick(Number(btn.dataset.roomIndex));
        });
      });
      roomPicker.hidden = false;
      document.body.style.overflow = "hidden";
      roomPicker.querySelector("button[data-room-picker-dismiss]")?.focus();
      requestAnimationFrame(updateRoomNav);
    };
    roomPicker.querySelectorAll("[data-room-picker-dismiss]").forEach((el) => el.addEventListener("click", closeRoomPicker));
    document.addEventListener("keydown", (e) => {
      if (roomPicker.hidden) return;
      if (e.key === "Escape") closeRoomPicker();
    });
  }

  /* ---------- Villa detail: "more questions" popup — the villa-specific
     questions/answers are built by renderVillaDetail below (it has the
     current language in scope); this just wires the modal shell once. ---------- */
  let mlsOpenFaqModal = null;
  const faqModal = document.querySelector("[data-faq-modal]");
  if (faqModal) {
    const faqModalList = faqModal.querySelector("[data-faq-extra]");
    const faqModalTitle = faqModal.querySelector("[data-faq-modal-title]");
    let faqModalLastFocused = null;
    const closeFaqModal = () => {
      faqModal.hidden = true;
      document.body.style.overflow = "";
      faqModalLastFocused?.focus();
    };
    faqModal.querySelectorAll("[data-faq-modal-dismiss]").forEach((el) => el.addEventListener("click", closeFaqModal));
    document.addEventListener("keydown", (e) => {
      if (faqModal.hidden) return;
      if (e.key === "Escape") closeFaqModal();
    });
    mlsOpenFaqModal = (title, listHtml, trigger) => {
      faqModalLastFocused = trigger || null;
      if (faqModalTitle) faqModalTitle.textContent = title;
      faqModalList.innerHTML = listHtml;
      faqModal.hidden = false;
      document.body.style.overflow = "hidden";
      faqModal.querySelector("[data-faq-modal-close]")?.focus();
    };
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

    /* Phones: the three-button stack covered the right edge of forms and
       steppers, so it collapses behind a single button (CSS shows it only
       ≤600px; on larger screens the stack is unchanged). */
    const tr = (key, fallback) => (typeof window.mlsT === "function" ? window.mlsT(key) : fallback);
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "qa-btn qa-fab";
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-label", tr("qa.contactMenu", "Contact options"));
    fab.setAttribute("data-i18n-aria-label", "qa.contactMenu");
    fab.innerHTML =
      '<svg class="qa-fab-open" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>' +
      '<svg class="qa-fab-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    quickActions.appendChild(fab);
    const setExpanded = (open) => {
      quickActions.classList.toggle("is-expanded", open);
      fab.setAttribute("aria-expanded", String(open));
      if (!open) {
        quickActions.querySelectorAll("[data-qa-item].is-open").forEach((item) => {
          item.classList.remove("is-open");
          item.querySelector("[data-qa-toggle]")?.setAttribute("aria-expanded", "false");
        });
      }
    };
    fab.addEventListener("click", () => setExpanded(!quickActions.classList.contains("is-expanded")));
    document.addEventListener("click", (e) => {
      if (quickActions.classList.contains("is-expanded") && !quickActions.contains(e.target)) setExpanded(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && quickActions.classList.contains("is-expanded")) { setExpanded(false); fab.focus(); }
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

  /* ---------- Hero background video ----------
     Only wired up on wide viewports, without prefers-reduced-motion, and off
     Data Saver — everyone else (most phones, slow connections) just gets the
     poster image and never downloads a single video byte. */
  const wantsHeroVideo =
    !prefersReducedMotion &&
    window.matchMedia("(min-width: 768px)").matches &&
    !(navigator.connection && navigator.connection.saveData);
  document.querySelectorAll("[data-hero-video]").forEach((video) => {
    if (!wantsHeroVideo) return;
    video.querySelectorAll("source").forEach((source) => {
      source.src = source.dataset.src;
    });
    video.load();
    video.closest(".hero-media")?.classList.add("has-video");
    video.play().catch(() => {
      /* Autoplay blocked (rare with muted video) — poster stays put. */
      video.closest(".hero-media")?.classList.remove("has-video");
    });
  });

  /* ---------- Home hero: auto-rotating photo carousel ----------
     The first slide ships eagerly (LCP). The other three only start
     downloading once the page has finished loading, and only rotate
     if the visitor hasn't asked for reduced motion — no controls, no
     indicator, it just quietly cycles. */
  const heroCarousel = document.querySelector("[data-hero-carousel]");
  if (heroCarousel) {
    const slides = [...heroCarousel.querySelectorAll(".hero-slide")];
    if (slides.length > 1) {
      const startCarousel = () => {
        slides.forEach((slide) => {
          if (slide.dataset.src) {
            if (slide.dataset.srcset) slide.srcset = slide.dataset.srcset;
            slide.src = slide.dataset.src;
            slide.removeAttribute("data-src");
            slide.removeAttribute("data-srcset");
          }
        });
        if (prefersReducedMotion) return;
        let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
        setInterval(() => {
          const next = (index + 1) % slides.length;
          slides[index].classList.remove("is-active");
          slides[next].classList.add("is-active");
          index = next;
        }, 6000);
      };
      if (document.readyState === "complete") {
        startCarousel();
      } else {
        window.addEventListener("load", startCarousel, { once: true });
      }
    }
  }

  /* ---------- Home hero search: submits a plain GET to villas.html, which
     already reads ?destination/?guests to pre-fill its own filters (see the
     villa grid block below); ?checkin/?checkout ride along for later. */
  const heroSearchSelects = document.querySelector(".hero-search")
    ? [...document.querySelectorAll(".hero-search select")].map(mlsEnhanceSelect)
    : [];
  /* ---------- Home hero search: check-in/check-out calendar popovers ----------
     Same pattern as the contact page's trip-calendar date pickers, wired to
     each destination's combined villa availability so already-booked dates
     show disabled with a strikethrough. A date only counts as unavailable
     when every villa matching the chosen destination (or all villas, if none
     is chosen yet) is blocked that day — see MLS_VILLAS.availability in
     villas-data.js (HOSTAWAY INTEGRATION POINT there covers this too). */
  const heroSearchForm = document.querySelector(".hero-search");
  if (heroSearchForm && typeof MLS_VILLAS !== "undefined") {
    const heroDestinationSelect = heroSearchForm.querySelector("#hs-destination");
    const heroIsoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const heroSameDay = (a, b) => a && b && heroIsoDay(a) === heroIsoDay(b);
    const heroToday = new Date();
    heroToday.setHours(0, 0, 0, 0);

    const heroVillasInScope = () => {
      const dest = heroDestinationSelect ? heroDestinationSelect.value : "";
      return MLS_VILLAS.filter((v) => !dest || v.destination === dest);
    };
    const heroDateIsUnavailable = (dateStr) => {
      const villas = heroVillasInScope();
      return villas.length > 0 && villas.every((v) =>
        (v.availability?.blockedRanges || []).some((r) => dateStr >= r.start && dateStr <= r.end)
      );
    };

    const heroDateFields = {};
    heroSearchForm.querySelectorAll("[data-hero-date-field]").forEach((fieldEl) => {
      const key = fieldEl.dataset.heroDateField;
      const trigger = fieldEl.querySelector("[data-hero-date-trigger]");
      const textEl = fieldEl.querySelector("[data-hero-date-text]");
      const defaultLabel = textEl.textContent;
      const panel = fieldEl.querySelector("[data-hero-calendar]");
      const monthEl = panel.querySelector("[data-cal-month]");
      const weekdaysEl = panel.querySelector("[data-cal-weekdays]");
      const daysEl = panel.querySelector("[data-cal-days]");
      const prevBtn = panel.querySelector("[data-cal-prev]");
      const nextBtn = panel.querySelector("[data-cal-next]");
      const hiddenInput = fieldEl.querySelector("[data-hero-date-value]");

      const api = { key, fieldEl, trigger, textEl, defaultLabel, hiddenInput, selected: null, minDate: heroToday, viewDate: new Date(heroToday) };

      const lang = () => (typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en");
      const locale = () => (lang() === "es" ? "es-MX" : "en-US");

      const renderWeekdays = () => {
        const base = new Date(2026, 0, 4); // a Sunday
        weekdaysEl.innerHTML = "";
        for (let i = 0; i < 7; i++) {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          const span = document.createElement("span");
          span.textContent = d.toLocaleDateString(locale(), { weekday: "narrow" });
          weekdaysEl.appendChild(span);
        }
      };

      const render = () => {
        monthEl.textContent = api.viewDate.toLocaleDateString(locale(), { month: "long", year: "numeric" });
        daysEl.innerHTML = "";
        const year = api.viewDate.getFullYear(), month = api.viewDate.getMonth();
        const firstWeekday = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstWeekday; i++) {
          const spacer = document.createElement("span");
          spacer.className = "trip-calendar-day-empty";
          daysEl.appendChild(spacer);
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const cellDate = new Date(year, month, d);
          const unavailable = heroDateIsUnavailable(heroIsoDay(cellDate));
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "trip-calendar-day";
          btn.textContent = d;
          if (cellDate < api.minDate || unavailable) btn.disabled = true;
          if (unavailable) btn.classList.add("is-unavailable");
          if (heroSameDay(cellDate, heroToday)) btn.classList.add("is-today");
          if (heroSameDay(cellDate, api.selected)) btn.classList.add("is-selected");
          btn.addEventListener("click", () => selectDate(cellDate));
          daysEl.appendChild(btn);
        }
        const firstOfMinMonth = new Date(api.minDate.getFullYear(), api.minDate.getMonth(), 1);
        prevBtn.disabled = api.viewDate <= firstOfMinMonth;
      };

      const selectDate = (date) => {
        api.selected = date;
        api.hiddenInput.value = heroIsoDay(date);
        api.textEl.textContent = date.toLocaleDateString(locale(), { month: "short", day: "numeric" });
        fieldEl.classList.add("has-value");
        close();
        onHeroDateSelected(key, date);
      };

      const open = () => {
        Object.values(heroDateFields).forEach((other) => { if (other !== api) other.close(); });
        renderWeekdays();
        render();
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      };
      const close = () => {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      };

      trigger.addEventListener("click", () => (panel.hidden ? open() : close()));
      prevBtn.addEventListener("click", () => { api.viewDate.setMonth(api.viewDate.getMonth() - 1); render(); });
      nextBtn.addEventListener("click", () => { api.viewDate.setMonth(api.viewDate.getMonth() + 1); render(); });

      api.render = render;
      api.close = close;
      api.reset = () => {
        api.selected = null;
        api.hiddenInput.value = "";
        api.textEl.textContent = api.defaultLabel;
        fieldEl.classList.remove("has-value");
      };
      heroDateFields[key] = api;
    });

    function onHeroDateSelected(key, date) {
      if (key === "checkin" && heroDateFields.checkout) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        heroDateFields.checkout.minDate = next;
        if (heroDateFields.checkout.selected && heroDateFields.checkout.selected < next) {
          heroDateFields.checkout.reset();
        }
        if (heroDateFields.checkout.viewDate < next) {
          heroDateFields.checkout.viewDate = new Date(next.getFullYear(), next.getMonth(), 1);
        }
      }
    }

    /* Switching destination changes which villas' availability applies —
       re-render so blocked/available shading stays accurate. */
    heroDestinationSelect?.addEventListener("change", () => {
      Object.values(heroDateFields).forEach((api) => api.render());
    });

    document.addEventListener("click", (e) => {
      if (heroSearchForm.contains(e.target)) return;
      Object.values(heroDateFields).forEach((api) => api.close());
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") Object.values(heroDateFields).forEach((api) => api.close());
    });

    /* Guests accepts free-form numeric input instead of preset options —
       validated against the largest villa in the collection, same pattern as
       the villas.html filter bar (#filter-guests). */
    const heroGuestsInput = heroSearchForm.querySelector("#hs-guests");
    const heroGuestsField = heroGuestsInput?.closest(".hero-search-field");
    const heroGuestsErrorEl = heroSearchForm.querySelector("[data-hero-guests-error]");
    let heroGuestsHasError = false;
    if (heroGuestsInput) {
      const heroMaxGuests = Math.max(...MLS_VILLAS.map((v) => v.guests));
      const heroClearGuestsError = () => {
        heroGuestsHasError = false;
        heroGuestsErrorEl.hidden = true;
        heroGuestsErrorEl.innerHTML = "";
        heroGuestsField.classList.remove("has-error");
      };
      const heroShowGuestsError = (overMax) => {
        heroGuestsHasError = true;
        heroGuestsErrorEl.innerHTML = overMax
          ? `${t("home.search.guestsMaxError").replace("{max}", heroMaxGuests)}<br><a href="contact.html">${t("home.search.guestsContactCta")}</a>`
          : t("home.search.guestsInvalidError");
        heroGuestsErrorEl.hidden = false;
        heroGuestsField.classList.add("has-error");
      };
      heroGuestsInput.addEventListener("input", () => {
        const raw = heroGuestsInput.value.trim();
        heroGuestsField.classList.toggle("has-value", !!raw);
        if (!raw) { heroClearGuestsError(); return; }
        if (!/^\d+$/.test(raw)) { heroShowGuestsError(false); return; }
        if (parseInt(raw, 10) > heroMaxGuests) { heroShowGuestsError(true); return; }
        heroClearGuestsError();
      });
    }

    /* Valle de Guadalupe has a single villa (Kasa Kefi) — skip the villas.html
       listing and go straight to its page instead of a one-result grid. */
    heroSearchForm.addEventListener("submit", (e) => {
      if (heroGuestsHasError) {
        e.preventDefault();
        return;
      }
      if (heroDestinationSelect?.value === "valle-de-guadalupe") {
        e.preventDefault();
        window.location.href = "villas/kasa-kefi.html";
      }
    });
  }

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
        mlsSetImg(imgEl, villa.image);
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

      mlsSetImg(imgEl, villas[0].image);
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
  let filterCustomSelects = [];
  if (villaGrid && typeof MLS_VILLAS !== "undefined") {
    const selDest = document.querySelector("#filter-destination");
    const inputGuests = document.querySelector("#filter-guests");
    const guestsField = inputGuests.closest(".filter-field");
    const guestsErrorEl = document.querySelector("[data-guests-error]");
    const selBeds = document.querySelector("#filter-bedrooms");
    const countEl = document.querySelector("[data-filter-count]");

    /* Guests accepts free-form numeric input instead of preset options —
       validated against the largest villa in the collection. */
    const maxGuests = Math.max(...MLS_VILLAS.map((v) => v.guests));
    let guestsValue = 0;

    const clearGuestsError = () => {
      guestsErrorEl.hidden = true;
      guestsErrorEl.innerHTML = "";
      guestsField.classList.remove("has-error");
    };
    const showGuestsError = (overMax) => {
      const msg = t("villas.filter.guestsError").replace("{max}", maxGuests);
      guestsErrorEl.innerHTML = overMax
        ? `${msg}<br><a href="contact.html">${t("villas.filter.guestsContactCta")}</a>`
        : msg;
      guestsErrorEl.hidden = false;
      guestsField.classList.add("has-error");
    };
    const validateGuests = () => {
      const raw = inputGuests.value.trim();
      if (!raw) { clearGuestsError(); guestsValue = 0; return; }
      if (!/^\d+$/.test(raw)) { showGuestsError(false); guestsValue = 0; return; }
      const n = parseInt(raw, 10);
      if (n > maxGuests) { showGuestsError(true); guestsValue = 0; return; }
      clearGuestsError();
      guestsValue = n;
    };

    /* Pre-fill from query string (home search widget lands here).
       HOSTAWAY: checkin/checkout params are captured below — feed them to the
       availability endpoint once connected; today they only inform the inquiry. */
    const params = new URLSearchParams(window.location.search);
    if (params.get("destination")) selDest.value = params.get("destination");
    if (params.get("guests")) {
      const g = parseInt(params.get("guests"), 10);
      if (g) inputGuests.value = g;
    }
    validateGuests();

    filterCustomSelects = [selDest, selBeds].map(mlsEnhanceSelect);

    renderVillaGrid = () => {
      const dest = selDest.value;
      const minGuests = guestsValue;
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

    [selDest, selBeds].forEach((s) => s.addEventListener("change", renderVillaGrid));
    inputGuests.addEventListener("input", () => {
      validateGuests();
      renderVillaGrid();
    });
    document.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
      selDest.value = ""; inputGuests.value = ""; selBeds.value = "";
      clearGuestsError(); guestsValue = 0;
      filterCustomSelects.forEach((cs) => cs.syncFromSelect());
      history.replaceState(null, "", window.location.pathname);
      renderVillaGrid();
    });
    renderVillaGrid();

    /* Per-row photo carousel (prev/next + dots + swipe). Delegated on the
       grid container so it survives re-renders triggered by the filters. */
    mlsWireRowCarousels(villaGrid);
  }

  /* ---------- Destination landing pages (Playa del Carmen / Valle de Guadalupe) ---------- */
  const destinationGrid = document.querySelector("[data-destination-grid]");
  let renderDestinationGrid = null;
  if (destinationGrid && typeof MLS_VILLAS !== "undefined") {
    const dest = destinationGrid.dataset.destinationGrid;

    renderDestinationGrid = () => {
      const list = MLS_VILLAS.filter((v) => v.destination === dest);
      destinationGrid.innerHTML = list.map((v, i) => mlsVillaShowcaseRow(v, i)).join("");
      destinationGrid.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    };
    renderDestinationGrid();

    /* Per-row photo carousel (prev/next + dots + swipe) — same delegated
       pattern as the main villa grid above, so rows keep working after a
       language re-render. */
    mlsWireRowCarousels(destinationGrid);
  }

  /* ---------- Map pin click target: every brand-pin marker on the site opens
     Google Maps in a new tab, rather than an in-page popup. Each villa's own
     Google Maps place (googleMapsUrl in villas-data.js) is used when set, so
     guests land on that villa's real listing with its name and info; falls
     back to a coordinate search if a villa has no place link yet. ---------- */
  function mlsGoogleMapsUrl(villa) {
    if (villa.googleMapsUrl) return villa.googleMapsUrl;
    return `https://www.google.com/maps/search/?api=1&query=${villa.lat},${villa.lng}`;
  }

  /* ---------- Destination villa map: pins from villas-data.js, lazy-loaded Leaflet
     (CSS/JS injected only once the map container nears the viewport, so it never
     costs first paint or blocks SEO-critical content). ---------- */
  const destinationMapEl = document.querySelector("[data-destination-map]");
  if (destinationMapEl && typeof MLS_VILLAS !== "undefined") {
    const mapDest = destinationMapEl.dataset.destinationMap;
    const mapVillas = MLS_VILLAS.filter(
      (v) => v.destination === mapDest && typeof v.lat === "number" && typeof v.lng === "number"
    );

    let leafletMap = null;
    let mapMarkers = [];

    function mlsBrandPinIcon(villa) {
      const iconSrc = villa.mapIcon || "assets/img/brand/icon-positive.png";
      return L.divIcon({
        className: "mls-map-pin",
        html: `<span class="mls-map-pin-dot mls-map-pin-dot--${villa.slug}"><img src="${iconSrc}" alt="" loading="lazy"></span>`,
        iconSize: [44, 62],
        iconAnchor: [22, 60],
        popupAnchor: [0, -56]
      });
    }

    function renderMapMarkers() {
      if (!leafletMap) return;
      mapMarkers.forEach((m) => m.remove());
      mapMarkers = mapVillas.map((villa) => {
        const marker = L.marker([villa.lat, villa.lng], { icon: mlsBrandPinIcon(villa), title: villa.name })
          .addTo(leafletMap);
        marker.on("click", () => window.open(mlsGoogleMapsUrl(villa), "_blank", "noopener"));
        return marker;
      });
    }

    function initDestinationMap() {
      if (leafletMap || !mapVillas.length) return;
      destinationMapEl.innerHTML = "";
      leafletMap = L.map(destinationMapEl, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(leafletMap);

      renderMapMarkers();
      if (mapVillas.length > 1) {
        leafletMap.fitBounds(L.latLngBounds(mapVillas.map((v) => [v.lat, v.lng])), { padding: [40, 40], maxZoom: 15 });
      } else {
        leafletMap.setView([mapVillas[0].lat, mapVillas[0].lng], 15);
      }
    }

    function loadLeafletThenInit() {
      if (window.L) { initDestinationMap(); return; }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = initDestinationMap;
      document.head.appendChild(script);
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      loadLeafletThenInit();
    } else {
      const mapObserver = new IntersectionObserver(
        (entries, obs) => {
          if (entries.some((e) => e.isIntersecting)) {
            obs.disconnect();
            loadLeafletThenInit();
          }
        },
        { rootMargin: "300px" }
      );
      mapObserver.observe(destinationMapEl);
    }

    document.addEventListener("mls:languagechange", () => {
      if (leafletMap) renderMapMarkers();
    });

    /* Leaflet sizes its tiles from the container's dimensions at init time;
       if the map was created while its section was still animating in
       (or the viewport later resizes across the tablet/desktop breakpoint),
       nudge it to recompute so tiles don't stay cropped or offset. */
    window.addEventListener("resize", () => { leafletMap && leafletMap.invalidateSize(); });
  }

  /* ---------- Property page map: brand-pin marker for this villa, plus its
     sibling villas in the same destination (e.g. Playa del Carmen's other two
     villas), so guests see the whole area at a glance — the current villa's
     pin is enlarged to stand out. Reuses the same lazy-loaded Leaflet as the
     destination map. */
  const propertyMapEls = document.querySelectorAll("[data-property-map]");
  if (propertyMapEls.length && typeof MLS_VILLAS !== "undefined") {
    propertyMapEls.forEach((el) => {
      const villa = MLS_VILLAS.find((v) => v.slug === el.dataset.villaSlug);
      if (!villa || typeof villa.lat !== "number" || typeof villa.lng !== "number") return;

      const destVillas = MLS_VILLAS.filter(
        (v) => v.destination === villa.destination && typeof v.lat === "number" && typeof v.lng === "number"
      );

      function propertyPinIcon(v, isCurrent) {
        const iconSrc = v.mapIcon ? `../${v.mapIcon}` : "../assets/img/brand/icon-positive.png";
        return L.divIcon({
          className: "mls-map-pin",
          html: `<span class="mls-map-pin-dot mls-map-pin-dot--${v.slug}${isCurrent ? " mls-map-pin-dot--current" : ""}"><img src="${iconSrc}" alt="" loading="lazy"></span>`,
          iconSize: isCurrent ? [52, 62] : [44, 62],
          iconAnchor: isCurrent ? [26, 60] : [22, 60]
        });
      }

      function initPropertyMap() {
        el.innerHTML = "";
        const map = L.map(el, {
          scrollWheelZoom: false,
          zoomControl: false,
          attributionControl: true
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
        }).addTo(map);

        destVillas.forEach((v) => {
          const isCurrent = v.slug === villa.slug;
          const marker = L.marker([v.lat, v.lng], { icon: propertyPinIcon(v, isCurrent), title: v.name }).addTo(map);
          marker.on("click", () => window.open(mlsGoogleMapsUrl(v), "_blank", "noopener"));
        });

        if (destVillas.length > 1) {
          map.fitBounds(L.latLngBounds(destVillas.map((v) => [v.lat, v.lng])), { padding: [50, 50], maxZoom: 15 });
        } else {
          map.setView([villa.lat, villa.lng], 14);
        }

        window.addEventListener("resize", () => map.invalidateSize());
      }

      function loadLeafletThenInitProperty() {
        if (window.L) { initPropertyMap(); return; }
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }
        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (existingScript) { existingScript.addEventListener("load", initPropertyMap); return; }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        script.onload = initPropertyMap;
        document.head.appendChild(script);
      }

      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        loadLeafletThenInitProperty();
      } else {
        const observer = new IntersectionObserver(
          (entries, obs) => {
            if (entries.some((e) => e.isIntersecting)) {
              obs.disconnect();
              loadLeafletThenInitProperty();
            }
          },
          { rootMargin: "300px" }
        );
        observer.observe(el);
      }
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
    ["safe", "safe"], ["gated", "safe"], ["security", "safe"],
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

  /* ---------- Amenity categories: keyword-matched against the English label ---------- */
  const MLS_AMENITY_CATEGORY_RULES = [
    ["beach essentials", "comfort"],
    ["outdoor kitchen", "outdoor"], ["outdoor grill", "outdoor"],
    ["pool", "outdoor"], ["hammock", "outdoor"],
    ["game room", "outdoor"], ["foosball", "outdoor"], ["ping pong", "outdoor"], ["board game", "outdoor"],
    ["exercise equipment", "outdoor"],
    ["squash", "outdoor"], ["tennis", "outdoor"], ["basketball", "outdoor"], ["sports", "outdoor"],
    ["jacuzzi", "outdoor"], ["hot tub", "outdoor"],
    ["grill", "outdoor"], ["bbq", "outdoor"], ["al fresco", "outdoor"], ["fire-pit", "outdoor"], ["fireplace", "outdoor"],
    ["beachfront", "beach"], ["oceanfront", "beach"], ["waterfront", "beach"],
    ["kayak", "beach"], ["canoe", "beach"], ["water sports", "beach"],
    ["quinta avenida", "beach"], ["beach", "beach"],
    ["coffee", "kitchen"], ["tea maker", "kitchen"], ["toaster", "kitchen"], ["dishwasher", "kitchen"],
    ["microwave", "kitchen"], ["oven", "kitchen"], ["blender", "kitchen"], ["winer", "kitchen"], ["wine", "kitchen"],
    ["honor bar", "kitchen"], ["nespresso", "kitchen"], ["grocery", "kitchen"],
    ["dining", "kitchen"], ["kitchen", "kitchen"],
    ["cleaning", "services"], ["housekeeping", "services"], ["chef", "services"], ["butler", "services"],
    ["concierge", "services"], ["massage", "services"], ["spa", "services"], ["sauna", "services"],
    ["airport transfer", "services"], ["transfer", "services"], ["event", "services"], ["celebrat", "services"],
    ["security", "services"], ["gated", "services"]
  ];
  const MLS_AMENITY_CATEGORY_ORDER = ["comfort", "kitchen", "outdoor", "views", "beach", "family", "services", "safety"];
  const mlsAmenityCategory = (enText) => {
    const lower = (enText || "").toLowerCase();
    const hit = MLS_AMENITY_CATEGORY_RULES.find(([kw]) => lower.includes(kw));
    return hit ? hit[1] : "comfort";
  };

  /* ---------- Spec squares: guests/bedrooms/beds/bathrooms/area/destination row ---------- */
  const MLS_SPEC_ICON = {
    guests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="7.4" r="3.15"/><path d="M5.4 20c0-4 3-6.8 6.6-6.8s6.6 2.8 6.6 6.8" stroke-linecap="round"/></svg>',
    bedrooms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.4 20.6V4.4L15.6 3v17.6"/><path d="M3.6 20.6h16.8"/><circle cx="13.4" cy="12.4" r=".55" fill="currentColor" stroke="none"/></svg>',
    beds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-5.3A2 2 0 0 1 5 10.7h14a2 2 0 0 1 2 2V18"/><path d="M3 18h18"/><path d="M3 15v-8.2A1.4 1.4 0 0 1 4.4 5.4h4a1.4 1.4 0 0 1 1.4 1.4V10"/><path d="M3 20.4V18M21 20.4V18"/></svg>',
    bathrooms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.4 12V6.6A2.4 2.4 0 0 1 6.8 4.2c1 0 1.8.5 2.3 1.3"/><path d="M3 12h18v1.8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V12z"/><path d="M6.4 19v1.8M17.6 19v1.8"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.2 9V4.2H9"/><path d="M19.8 9V4.2H15"/><path d="M4.2 15v4.8H9"/><path d="M19.8 15v4.8H15"/></svg>',
    destination: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.6s6.6-5.75 6.6-10.9a6.6 6.6 0 1 0-13.2 0c0 5.15 6.6 10.9 6.6 10.9z"/><circle cx="12" cy="9.6" r="2.15"/></svg>'
  };
  const mlsSpecHTML = (key, numHtml, labelHtml) =>
    `<div class="spec${key === "destination" ? " spec--wide" : ""}"><span class="spec-icon" aria-hidden="true">${MLS_SPEC_ICON[key] || ""}</span><div class="spec-text"><div class="spec-num">${numHtml}</div>${labelHtml ? `<div class="spec-label">${labelHtml}</div>` : ""}</div></div>`;

  /* ---------- Villa detail: specs + amenities + related, driven by data ---------- */
  const MLS_VILLA_I18N_KEY = {
    "villa-aqua": "aqua",
    "kasa-kefi": "kefi",
    "casa-corazon-luxe": "corazon",
    "casa-de-las-estrellas": "estrellas"
  };
  const detailRoot = document.querySelector("[data-villa-slug]");
  let renderVillaDetail = null;
  let renderTripShowcase = null;
  let updateTripCapacityNotice = null;
  if (detailRoot && typeof MLS_VILLAS !== "undefined") {
    const villa = MLS_VILLAS.find((v) => v.slug === detailRoot.dataset.villaSlug);
    if (villa) {
      /* Services & Amenities cards: built fresh on every render (including a
         language switch) and cached here so the delegated click handler
         below — bound once, outside this render function — always shows
         content in whatever language is currently active. */
      let saModalContent = { included: "", extra: "", amenities: "" };

      /* Testimonials rotator, scoped to whichever container holds this villa's
         slides. Re-bound on every render (including a language switch, which
         rebuilds the slide markup from scratch) rather than queried once at
         page load, so the dots/interval never point at detached nodes. */
      let testimonialTimer = null;
      const initTestimonialRotator = (scope) => {
        clearInterval(testimonialTimer);
        const tSlides = scope.querySelectorAll(".testimonial-slide");
        const tDots = scope.querySelectorAll(".testimonial-dots button");
        if (!tSlides.length) return;
        let current = 0;
        const show = (i) => {
          tSlides[current].classList.remove("is-active");
          tDots[current]?.classList.remove("is-active");
          current = (i + tSlides.length) % tSlides.length;
          tSlides[current].classList.add("is-active");
          tDots[current]?.classList.add("is-active");
        };
        const play = () => {
          if (prefersReducedMotion) return;
          testimonialTimer = setInterval(() => show(current + 1), 7000);
        };
        tDots.forEach((dot, i) =>
          dot.addEventListener("click", () => {
            clearInterval(testimonialTimer);
            show(i);
            play();
          })
        );
        play();
      };

      /* Availability calendar: month-grid view built from villa.availability
         .blockedRanges (see the HOSTAWAY INTEGRATION POINT note above that
         field in villas-data.js — swap for a live Hostaway Calendar API
         fetch once wired through the /api proxy). Nav only moves the
         displayed month; there's no date-picker/selection since booking
         still happens through the inquiry form below.

         calendarMonth is shared with the price-box date pickers below (see
         syncCalendarViews) so navigating either one moves both, and the
         price box disables dates this calendar shows as booked — one
         source of truth instead of two calendars that can disagree. */
      let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const mlsDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const mlsDateIsBlocked = (dateStr, ranges) => ranges.some((r) => dateStr >= r.start && dateStr <= r.end);
      const priceCalRenders = [];

      /* Check-in/check-out picked directly on the Availability calendar
         (see the day-click wiring below) — kept outside renderCalendar so
         the selection survives a month-navigation or language re-render. */
      let calSelectedCheckin = null;
      let calSelectedCheckout = null;

      const renderCalendar = () => {
        const calEl = detailRoot.querySelector("[data-villa-calendar]");
        if (!calEl || !villa.availability) return;
        const { blockedRanges = [], minStay } = villa.availability;
        const months = t("detail.calendar.months").split(",");
        const weekdays = t("detail.calendar.weekdays").split(",");
        const todayStr = mlsDateStr(new Date());

        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const leadingBlanks = firstDay.getDay();

        let cellsHtml = "";
        for (let i = 0; i < leadingBlanks; i++) cellsHtml += `<span class="villa-calendar-day is-empty" aria-hidden="true"></span>`;
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast = dateStr < todayStr;
          const isBlocked = mlsDateIsBlocked(dateStr, blockedRanges);
          const stateClass = isPast ? "is-past" : isBlocked ? "is-booked" : "is-available";
          cellsHtml += isPast || isBlocked
            ? `<span class="villa-calendar-day ${stateClass}" title="${dateStr}">${day}</span>`
            : `<button type="button" class="villa-calendar-day ${stateClass}" data-cal-day="${dateStr}" title="${dateStr}">${day}</button>`;
        }

        const minStayHtml = minStay ? `<span class="villa-calendar-legend-item"><span class="villa-calendar-legend-dot is-minstay" aria-hidden="true"></span>${t("detail.calendar.legendMinStay").replace("{n}", minStay)}</span>` : "";

        calEl.innerHTML = `
          <div class="villa-calendar-head">
            <p class="villa-calendar-title">${t("detail.calendar.title")}</p>
            <div class="villa-calendar-nav">
              <button type="button" class="villa-calendar-nav-btn" data-cal-prev aria-label="${t("detail.calendar.prev")}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <span class="villa-calendar-month" aria-live="polite">${months[month]} ${year}</span>
              <button type="button" class="villa-calendar-nav-btn" data-cal-next aria-label="${t("detail.calendar.next")}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
          <div class="villa-calendar-weekdays">${weekdays.map((w) => `<span>${w}</span>`).join("")}</div>
          <div class="villa-calendar-grid">${cellsHtml}</div>
          <div class="villa-calendar-legend">
            <span class="villa-calendar-legend-item"><span class="villa-calendar-legend-dot is-available" aria-hidden="true"></span>${t("detail.calendar.legendAvailable")}</span>
            <span class="villa-calendar-legend-item"><span class="villa-calendar-legend-dot is-booked" aria-hidden="true"></span>${t("detail.calendar.legendBooked")}</span>
            ${minStayHtml}
          </div>
          <p class="villa-calendar-note">${t("detail.calendar.note")}</p>
          <p class="villa-calendar-note villa-calendar-note--capacity">${t("detail.calendar.capacityNote").replace("{n}", villa.guests)}</p>
          <div class="villa-calendar-confirm-wrap" data-cal-confirm>
            <div class="villa-calendar-confirm-inner">
              <div class="villa-calendar-confirm">
                <p class="villa-calendar-confirm-text" data-cal-confirm-text></p>
                <a class="villa-calendar-confirm-cta" data-cal-confirm-cta href="#">${t("detail.calendar.confirmCta")}</a>
              </div>
            </div>
          </div>`;

        calEl.querySelector("[data-cal-prev]").addEventListener("click", () => {
          calendarMonth = new Date(year, month - 1, 1);
          syncCalendarViews();
        });
        calEl.querySelector("[data-cal-next]").addEventListener("click", () => {
          calendarMonth = new Date(year, month + 1, 1);
          syncCalendarViews();
        });

        /* Clicking available dates picks a check-in/check-out range (first
           click = check-in, next later click = check-out; clicking again
           after both are set starts a new range) and offers to carry it
           straight into the trip-planner form on the contact page
           (?checkin=&checkout=, read there — see the contact-form
           date-picker init) instead of just showing it here with no next
           step. calSelectedCheckin/-Checkout live outside this function so
           the selection and its highlighting survive a re-render. */
        const confirmEl = calEl.querySelector("[data-cal-confirm]");
        const confirmTextEl = calEl.querySelector("[data-cal-confirm-text]");
        const confirmCtaEl = calEl.querySelector("[data-cal-confirm-cta]");
        const calDateLabel = (dateStr) => {
          const [y, m, d] = dateStr.split("-").map(Number);
          const dLang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
          return new Date(y, m - 1, d).toLocaleDateString(dLang === "es" ? "es-MX" : "en-US", { month: "long", day: "numeric", year: "numeric" });
        };
        const renderCalSelection = () => {
          calEl.querySelectorAll("[data-cal-day]").forEach((b) => {
            const ds = b.dataset.calDay;
            b.classList.toggle("is-day-selected", ds === calSelectedCheckin || ds === calSelectedCheckout);
            b.classList.toggle("is-in-range", !!(calSelectedCheckin && calSelectedCheckout && ds > calSelectedCheckin && ds < calSelectedCheckout));
          });
          if (!calSelectedCheckin) {
            if (confirmEl) confirmEl.classList.remove("is-active");
            return;
          }
          const villaParam = `villa=${encodeURIComponent(villa.slug)}`;
          if (calSelectedCheckout) {
            if (confirmTextEl) confirmTextEl.textContent = t("detail.calendar.confirmRange").replace("{checkin}", calDateLabel(calSelectedCheckin)).replace("{checkout}", calDateLabel(calSelectedCheckout));
            if (confirmCtaEl) confirmCtaEl.href = `../contact.html?${villaParam}&checkin=${calSelectedCheckin}&checkout=${calSelectedCheckout}`;
          } else {
            if (confirmTextEl) confirmTextEl.textContent = t("detail.calendar.confirmNote").replace("{date}", calDateLabel(calSelectedCheckin));
            if (confirmCtaEl) confirmCtaEl.href = `../contact.html?${villaParam}&checkin=${calSelectedCheckin}`;
          }
          if (confirmEl) confirmEl.classList.add("is-active");
        };
        calEl.querySelectorAll("[data-cal-day]").forEach((dayBtn) => {
          dayBtn.addEventListener("click", () => {
            const dateStr = dayBtn.dataset.calDay;
            if (!calSelectedCheckin || calSelectedCheckout || dateStr <= calSelectedCheckin) {
              calSelectedCheckin = dateStr;
              calSelectedCheckout = null;
            } else {
              calSelectedCheckout = dateStr;
            }
            renderCalSelection();
          });
        });
        renderCalSelection();
      };

      /* Keeps the Availability calendar and the price-box date pickers on
         the same displayed month — call after calendarMonth changes from
         either side instead of re-rendering just one of them. */
      const syncCalendarViews = () => {
        renderCalendar();
        priceCalRenders.forEach((render) => render());
      };

      renderVillaDetail = () => {
        const lang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
        const pick = (item) => (lang === "es" && item.es) || item.en;
        renderCalendar();
        const specsEl = detailRoot.querySelector("[data-villa-specs]");
        if (specsEl) {
          const baths = villa.baths % 1 === 0 ? villa.baths : villa.baths.toFixed(1);
          const destinationLabel = (lang === "es" && villa.destinationLabelEs) || villa.destinationLabel;
          const sqft = Math.round(villa.area * 10.7639).toLocaleString("en-US");
          const areaSpecHtml = lang === "es"
            ? mlsSpecHTML("area", villa.area, t("detail.specs.area"))
            : mlsSpecHTML("area", sqft, t("detail.specs.sqft"));
          specsEl.innerHTML = `
            ${mlsSpecHTML("guests", villa.guests, t("detail.specs.guests"))}
            ${mlsSpecHTML("bedrooms", villa.bedrooms, t("detail.specs.bedrooms"))}
            ${mlsSpecHTML("beds", villa.beds, t("detail.specs.beds"))}
            ${mlsSpecHTML("bathrooms", baths, t("detail.specs.bathrooms"))}
            ${areaSpecHtml}
            ${mlsSpecHTML("destination", destinationLabel, "")}`;
        }
        /* Services & Amenities: three big tappable cards (Included / Extra
           cost / Amenities) — clicking one opens a centered modal with that
           category's full detail. Replaces the old separate amenities panel
           and services list; built to be obvious to tap and easy to read at
           a glance, since most guests browsing this site skew older. */
        const saCardsEl = detailRoot.querySelector("[data-sa-cards]");
        if (saCardsEl && typeof MLS_SERVICE_DEFS !== "undefined") {
          const allAmenities = [...(villa.amenities || []), ...(villa.amenitiesMore || [])];
          const groups = {};
          allAmenities.forEach((a) => {
            const cat = a.cat || mlsAmenityCategory(a.en);
            (groups[cat] = groups[cat] || []).push(a);
          });
          const activeCategories = MLS_AMENITY_CATEGORY_ORDER.filter((cat) => groups[cat] && groups[cat].length);
          const amenityRowHtml = (item) => `<li><span>${pick(item)}</span></li>`;
          const villaImgPath = "../" + villa.image;

          const amenitiesModalHtml = `
            <h2 class="sa-modal-title">${t("detail.amenities.title")}</h2>
            <div class="sa-amenities-groups">
              ${activeCategories
                .map(
                  (cat) => `<div class="sa-amenity-category">
                    <h4>${t("detail.amenities.category." + cat)}</h4>
                    <ul>${groups[cat].map(amenityRowHtml).join("")}</ul>
                  </div>`
                )
                .join("")}
            </div>`;

          const knownServices = (villa.services || []).filter((id) => MLS_SERVICE_DEFS[id]);
          const includedIds = knownServices.filter((id) => MLS_SERVICE_DEFS[id].included);
          const extraIds = knownServices.filter((id) => !MLS_SERVICE_DEFS[id].included);

          /* Some services depict an action or an on-call presence — a car
             arriving, a massage in progress, a concierge you ring for —
             that no real-estate photo of the villa itself could show, so
             these use a shared illustrative photo instead of villa-specific
             ones; everything else still uses this villa's own photography.
             Excursions goes further: a small rotating collage (cenote,
             snorkeling, jungle zip-line) since one photo can't represent
             "go explore the area" — see startSaRotation below for how the
             rotation itself is driven. */
          const SA_SHARED_IMAGES = {
            concierge: "../assets/img/services/concierge-bell.webp",
            transfer: "../assets/img/services/transfer-suv.webp",
            spa: "../assets/img/services/spa-massage.webp"
          };
          const SA_EXCURSION_PHOTOS = [
            "../assets/img/services/excursions/cenote.webp",
            "../assets/img/services/excursions/snorkel.webp",
            "../assets/img/services/excursions/zipline.webp"
          ];
          const serviceImg = (id) => SA_SHARED_IMAGES[id] || (villa.serviceImages && villa.serviceImages[id]) || villaImgPath;
          const serviceImgPos = (id) => (villa.serviceImagePositions && villa.serviceImagePositions[id]) || "";
          const serviceItemHtml = (id) => {
            const title = t("services." + id + ".title");
            const pos = serviceImgPos(id);
            const photoHtml =
              id === "excursions"
                ? `<div class="sa-item-photo sa-item-photo--rotate" data-sa-rotate>${SA_EXCURSION_PHOTOS.map(
                    (src, i) => `<img src="${src}"${mlsImgAttrs(src)} alt="${i === 0 ? title : ""}" loading="lazy" class="${i === 0 ? "is-active" : ""}">`
                  ).join("")}</div>`
                : `<div class="sa-item-photo"><img src="${serviceImg(id)}"${mlsImgAttrs(serviceImg(id))} alt="${title}" loading="lazy"${pos ? ` style="object-position:${pos}"` : ""}></div>`;
            return `<div class="sa-item">
              ${photoHtml}
              <div class="sa-item-text">
                <h4>${title}</h4>
                <p>${t("services." + id + ".body")}</p>
              </div>
            </div>`;
          };

          const includedModalHtml = `
            <h2 class="sa-modal-title">${t("detail.services.included")}</h2>
            <p class="sa-modal-intro">${t("detail.sa.included.intro")}</p>
            <div class="sa-item-grid">${includedIds.map(serviceItemHtml).join("")}</div>`;

          const extraModalHtml = `
            <h2 class="sa-modal-title">${t("detail.services.extra")}</h2>
            <p class="sa-modal-intro">${t("detail.sa.extra.intro")}</p>
            <div class="sa-item-grid">${extraIds.map(serviceItemHtml).join("")}</div>
            <div class="sa-contact-cta">
              <p>${t("detail.services.contactNote")}</p>
              <a class="btn btn-solid" href="../contact.html">${t("detail.sa.contactCta")}</a>
            </div>`;

          saModalContent = { included: includedModalHtml, extra: extraModalHtml, amenities: amenitiesModalHtml };

          /* Card visual: a large rounded photo with an arrow button
             straddling the bottom edge and a small caption chip
             overlapping the photo. */
          const cardHtml = (key, mainImg, mainImgPos, chipImg, chipText, title, desc) => `
            <button type="button" class="sa-card" data-sa-open="${key}">
              <span class="sa-card-frame">
                <span class="sa-card-photo-clip"><img src="${mainImg}"${mlsImgAttrs(mainImg)} alt="" loading="lazy"${mainImgPos ? ` style="object-position:${mainImgPos}"` : ""}></span>
                <span class="sa-card-chip"><img src="${chipImg}" alt="" loading="lazy"><span>${chipText}</span></span>
                <span class="sa-card-arrow-btn" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </span>
              <span class="sa-card-body">
                <span class="sa-card-title">${title}</span>
                <span class="sa-card-desc">${desc}</span>
                <span class="sa-card-cta">${t("detail.sa.viewCta")}<span class="sa-card-cta-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></span>
              </span>
            </button>`;

          /* Pulls from a specific gallery *category* (not just an index
             within one category), so the amenities card's three photos —
             and the modal photo — land in genuinely different rooms
             instead of three near-identical angles of the same pool. */
          const catImg = (catIndex, imgIndex = 0) => villa.gallery?.[catIndex]?.images?.[imgIndex]?.src || villaImgPath;
          const includedImgs = includedIds.map(serviceImg);
          const extraImgs = extraIds.map(serviceImg);
          const fallback = (arr, i) => arr[i] || arr[0] || villaImgPath;

          saCardsEl.innerHTML =
            cardHtml(
              "included", fallback(includedImgs, 0), serviceImgPos(includedIds[0]), fallback(includedImgs, 2),
              t("detail.sa.included.teaser"), t("detail.services.included"), t("detail.sa.included.intro")
            ) +
            cardHtml(
              "extra", fallback(extraImgs, 0), serviceImgPos(extraIds[0]), fallback(extraImgs, 2),
              t("detail.sa.extra.teaser"), t("detail.services.extra"), t("detail.sa.extra.intro")
            ) +
            cardHtml(
              "amenities", villaImgPath, "", catImg(2),
              t("detail.sa.amenities.teaser"), t("detail.amenities.title"), t("detail.sa.amenities.intro")
            );
        }

        /* Guest testimonials: real Hostaway reviews only, loaded by
           hostaway-sync.js (see api/_lib/hostaway-reviews.js). The section stays
           hidden until that villa has at least one review. Review text and
           names are written by guests on third-party channels, so they are
           escaped before going into the markup. */
        const testimonialsEl = detailRoot.querySelector("[data-villa-testimonials]");
        const testimonialsSection = testimonialsEl?.closest("section");
        const hasTestimonials = Boolean(villa.testimonials && villa.testimonials.length);
        if (testimonialsSection) testimonialsSection.hidden = !hasTestimonials;
        if (testimonialsEl && !hasTestimonials) {
          testimonialsEl.innerHTML = "";
          initTestimonialRotator(testimonialsEl);
        }
        if (testimonialsEl && hasTestimonials) {
          const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
          ));
          const starsHtml = (rating) =>
            Array.from({ length: 5 }, (_, i) => `<svg class="star${i < rating ? " is-filled" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z"/></svg>`).join("");
          const ratingHtml = (rating) => {
            const n = Math.round(Number(rating));
            if (!Number.isFinite(n) || n < 1 || n > 5) return "";
            return `<div class="testimonial-rating" role="img" aria-label="${t("testimonials.starsLabel").replace("{n}", n)}">${starsHtml(n)}</div>`;
          };
          const quoteHtml = (r) => `<blockquote class="testimonial-quote-block">
                ${ratingHtml(r.rating)}
                <p class="testimonial-quote">${escapeText(pick(r.quote))}</p>
                <footer class="testimonial-attr">
                  <div class="name">${escapeText(r.name)}</div>
                  <div class="villa">${escapeText(pick(r.context))}</div>
                </footer>
              </blockquote>`;
          const pairs = [];
          for (let i = 0; i < villa.testimonials.length; i += 2) {
            pairs.push(villa.testimonials.slice(i, i + 2));
          }
          const slidesHtml = pairs
            .map(
              (pair, i) => `<div class="testimonial-slide${i === 0 ? " is-active" : ""}">
                <div class="testimonial-pair">${pair.map(quoteHtml).join("")}</div>
              </div>`
            )
            .join("");
          const dotsHtml = pairs
            .map((_, i) => `<button type="button" class="${i === 0 ? "is-active" : ""}" aria-label="Testimonial ${i + 1}"></button>`)
            .join("");
          testimonialsEl.innerHTML = `${slidesHtml}<div class="testimonial-dots" role="group" aria-label="${t("detail.testimonials.chooseLabel")}">${dotsHtml}</div>`;
          initTestimonialRotator(testimonialsEl);
        }

        /* FAQ showcase: hover (or focus, or tap) a question to preview its
           answer on the right — same interaction as the gallery showcase,
           but the "photo" is text. Questions/answers are villa-specific. */
        const faqShowcase = detailRoot.querySelector("[data-faq-showcase]");
        if (faqShowcase && villa.faqs && villa.faqs.length) {
          const faqList = faqShowcase.querySelector("[data-faq-list]");
          const faqAnswerEl = faqShowcase.querySelector("[data-faq-answer]");
          /* Only the first 5 faqs (curated, most important, in villas-data.js
             order) show in the showcase; any beyond that live in the
             scrollable "more questions" panel below, revealed on demand. */
          const FAQ_PREVIEW_COUNT = 5;
          const faqs = villa.faqs.slice(0, FAQ_PREVIEW_COUNT);
          const extraFaqs = villa.faqs.slice(FAQ_PREVIEW_COUNT);

          faqList.innerHTML = faqs
            .map(
              (f, i) => `<li><button type="button" class="villa-faq-item${i === 0 ? " is-active" : ""}" data-faq-index="${i}">
                <span>${pick(f.q)}</span><span class="villa-faq-item-line" aria-hidden="true"></span>
              </button></li>`
            )
            .join("");
          faqAnswerEl.textContent = pick(faqs[0].a);

          const faqItems = [...faqList.querySelectorAll(".villa-faq-item")];
          faqItems.forEach((item, i) => {
            const activate = () => {
              faqItems.forEach((other) => other.classList.remove("is-active"));
              item.classList.add("is-active");
              faqAnswerEl.style.opacity = "0";
              setTimeout(() => {
                faqAnswerEl.textContent = pick(faqs[i].a);
                faqAnswerEl.style.opacity = "1";
              }, prefersReducedMotion ? 0 : 180);
            };
            item.addEventListener("mouseenter", activate);
            item.addEventListener("focus", activate);
            item.addEventListener("click", activate);
          });

          const moreBtnRaw = detailRoot.querySelector("[data-faq-more]");
          if (moreBtnRaw) {
            if (extraFaqs.length && typeof mlsOpenFaqModal === "function") {
              /* Clone-and-replace to drop any listener from a previous
                 render (renderVillaDetail re-runs on language change). */
              const moreBtn = moreBtnRaw.cloneNode(true);
              moreBtnRaw.replaceWith(moreBtn);
              const label = `${t("detail.faq.morePrefix")} ${villa.name}`;
              moreBtn.textContent = label;
              moreBtn.hidden = false;
              const extraHtml = extraFaqs
                .map(
                  (f) => `<li class="villa-faq-extra-item">
                    <p class="villa-faq-extra-q">${pick(f.q)}</p>
                    <p class="villa-faq-extra-a">${pick(f.a)}</p>
                  </li>`
                )
                .join("");
              moreBtn.addEventListener("click", () => mlsOpenFaqModal(label, extraHtml, moreBtn));
            } else {
              moreBtnRaw.hidden = true;
            }
          }
        }

        /* Villa gallery: a bento grid of photo tiles, one per category, with
           the villa's name/intro standing in as one of the tiles. Each tile
           opens that category's full set in the lightbox. Tiles are placed
           into fixed grid slots (tall/img1/bottom/small1-3) in a priority
           order, so the layout stays consistent whether a villa has 5 or 6
           categories — see .villa-gallery in styles.css. */
        const villaGallery = document.querySelector("[data-villa-gallery]");
        if (villaGallery && villa.gallery && villa.gallery.length) {
          const eyebrowEl = villaGallery.querySelector("[data-villa-eyebrow]");
          const descEl = villaGallery.querySelector("[data-villa-desc]");
          const i18nKey = MLS_VILLA_I18N_KEY[villa.slug];
          if (eyebrowEl && i18nKey) eyebrowEl.textContent = t("detail." + i18nKey + ".eyebrow");
          if (descEl && i18nKey) descEl.textContent = t("detail." + i18nKey + ".lead");
          const pickImg = (im) => ({ src: im.src, alt: (lang === "es" && im.altEs) || im.alt });

          const SLOT_KEYS = ["outdoor", "living", "kitchen", "rooms", "interiors", "multipurpose"];
          const categories = SLOT_KEYS.map((key) => villa.gallery.find((g) => g.key === key)).filter(Boolean);
          const isFull = categories.length >= 6;
          const positions = isFull
            ? ["tall", "img1", "bottom", "small1", "small2", "small3"]
            : ["tall", "img1", "bottom", "small1", "small2"];
          villaGallery.classList.toggle("villa-gallery--5", !isFull);

          const tilesEl = villaGallery.querySelector("[data-villa-gallery-tiles]");
          tilesEl.innerHTML = categories
            .map((g, i) => {
              const cover = pickImg(g.images[0]);
              /* The "Rooms" tile hides a bedroom picker behind it, which
                 isn't obvious from a photo tile alone (and hover hints don't
                 reach touch devices) — so it gets a badge that's visible
                 without hovering, telling people there's more than one room
                 to browse behind this tile. */
              const roomsBadge = g.key === "rooms"
                ? `<span class="villa-gallery-tile-badge">${t("detail.gallery.roomsBadge").replace("{n}", villa.bedrooms)}</span>`
                : "";
              return `
              <button type="button" class="villa-gallery-tile" data-slot="${positions[i]}" data-cat-index="${i}" aria-haspopup="dialog">
                <img src="${cover.src}"${mlsImgAttrs(cover.src)} alt="${cover.alt}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
                <span class="villa-gallery-tile-scrim" aria-hidden="true"></span>
                ${roomsBadge}
                <span class="villa-gallery-tile-label">
                  <span class="villa-gallery-tile-name">${t("detail.gallery." + g.key)}</span>
                  <span class="villa-gallery-tile-view" aria-hidden="true">${t("detail.gallery.viewGallery")}</span>
                </span>
              </button>`;
            })
            .join("");

          tilesEl.querySelectorAll(".villa-gallery-tile").forEach((btn) => {
            btn.addEventListener("click", () => {
              const i = Number(btn.dataset.catIndex);
              const cat = categories[i];
              /* The "Rooms" tile opens a bedroom picker first (Bedroom 1,
                 Bedroom 2, ...) instead of dumping every room photo into one
                 lightbox — see cat.roomImages in villas-data.js. A room whose
                 photos aren't sorted yet (empty array) falls back to the
                 full pooled set so nothing looks broken in the meantime. */
              if (cat.key === "rooms" && typeof mlsOpenRoomPicker === "function") {
                const roomImageSets = Array.from({ length: villa.bedrooms }, (_, r) => {
                  const idxList = cat.roomImages?.[r];
                  return idxList && idxList.length ? idxList.map((imgIndex) => cat.images[imgIndex]) : cat.images;
                });
                mlsOpenRoomPicker(roomImageSets.map((set) => pickImg(set[0])), (roomIndex) => {
                  if (typeof mlsOpenLightbox === "function") mlsOpenLightbox(roomImageSets[roomIndex].map(pickImg));
                }, btn);
              } else if (typeof mlsOpenLightbox === "function") {
                mlsOpenLightbox(cat.images.map(pickImg));
              }
            });
          });
        }
      };

      /* Services & Amenities modal: one shared dialog per page, reused for
         all three cards. The click listener lives on the (static) cards
         wrapper rather than the cards themselves, since those get replaced
         wholesale on every render (including a language switch). */
      const saModal = document.querySelector("[data-sa-modal]");
      const saModalBody = document.querySelector("[data-sa-modal-body]");
      const saCardsWrap = document.querySelector("[data-sa-cards]");
      let saLastFocused = null;
      let saRotateTimer = null;
      /* Excursions' little photo collage advances on its own timer while the
         modal is open — started fresh on every open (the DOM under
         saModalBody was just replaced) and cleared on close so it never
         keeps ticking in the background. */
      const startSaRotation = () => {
        clearInterval(saRotateTimer);
        if (prefersReducedMotion) return;
        const groups = saModalBody.querySelectorAll("[data-sa-rotate]");
        if (!groups.length) return;
        saRotateTimer = setInterval(() => {
          groups.forEach((group) => {
            const imgs = group.querySelectorAll("img");
            const activeIndex = [...imgs].findIndex((img) => img.classList.contains("is-active"));
            imgs[activeIndex]?.classList.remove("is-active");
            imgs[(activeIndex + 1) % imgs.length]?.classList.add("is-active");
          });
        }, 3200);
      };
      const closeSaModal = () => {
        if (!saModal || saModal.hidden) return;
        clearInterval(saRotateTimer);
        saModal.hidden = true;
        document.body.classList.remove("sa-modal-open");
        saLastFocused?.focus();
      };
      const openSaModal = (key, trigger) => {
        if (!saModal || !saModalBody) return;
        saModalBody.innerHTML = saModalContent[key] || "";
        saModalBody.scrollTop = 0;
        saLastFocused = trigger;
        saModal.hidden = false;
        document.body.classList.add("sa-modal-open");
        saModal.querySelector("[data-sa-modal-close]")?.focus();
        startSaRotation();
      };
      saCardsWrap?.addEventListener("click", (e) => {
        const card = e.target.closest("[data-sa-open]");
        if (!card) return;
        openSaModal(card.dataset.saOpen, card);
      });
      saModal?.querySelectorAll("[data-sa-modal-dismiss]").forEach((el) => el.addEventListener("click", closeSaModal));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSaModal();
      });

      /* ---------- Price box: standalone price + check-in/check-out date
         pickers + guests stepper, next to the (unchanged) Amenities panel.
         Shares calendarMonth with the Availability calendar above (see
         syncCalendarViews) and disables dates blocked in villa.availability
         so the two never disagree — own small popovers, reusing the same
         calendar look as the contact page's date pickers. Prices are
         Hostaway's: the lowest live nightly rate, then a real quote
         (/api/villa-quote) once dates + guests are picked. */
      const priceBox = detailRoot.querySelector("[data-price-box]");
      if (priceBox) {
        const priceEl = priceBox.querySelector("[data-price-amount]");
        const priceFromEl = priceBox.querySelector(".villa-price-from");
        const priceUnitEl = priceBox.querySelector(".villa-price-unit");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        const lang = () => (typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en");
        const locale = () => (lang() === "es" ? "es-MX" : "en-US");

        let selectedCheckin = null;
        let selectedCheckout = null;
        let updatePriceDisplay = () => {};
        const priceDateFields = {};

        /* Stay helpers. Availability is read on every call, not captured
           once, so the pickers and the booking checks follow the live
           Hostaway calendar as soon as hostaway-sync.js swaps it in. */
        const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
        const nightsBetween = (a, b) => Math.round((b - a) / (24 * 60 * 60 * 1000));
        const nightIsBlocked = (d) => mlsDateIsBlocked(mlsDateStr(d), villa.availability?.blockedRanges || []);
        const stayHasBlockedNight = (checkin, checkout) => {
          for (let d = checkin; d < checkout; d = addDays(d, 1)) if (nightIsBlocked(d)) return true;
          return false;
        };
        const inRanges = (d, ranges) => mlsDateIsBlocked(mlsDateStr(d), ranges || []);
        /* Hostaway applies the arrival day's minimum stay, which changes by
           season (e.g. 7 nights over Christmas) — see minStayRanges in
           api/villa-live-data.js. */
        const minStayFor = (checkin) => {
          const iso = mlsDateStr(checkin);
          const season = (villa.availability?.minStayRanges || []).find((r) => iso >= r.start && iso <= r.end);
          return season ? season.nights : villa.availability?.minStay || 1;
        };

        priceBox.querySelectorAll("[data-price-date-field]").forEach((fieldEl) => {
          const key = fieldEl.dataset.priceDateField;
          const trigger = fieldEl.querySelector("[data-price-date-trigger]");
          const textEl = fieldEl.querySelector("[data-price-date-text]");
          const panel = fieldEl.querySelector("[data-price-calendar]");
          const monthEl = panel.querySelector("[data-price-cal-month]");
          const weekdaysEl = panel.querySelector("[data-price-cal-weekdays]");
          const daysEl = panel.querySelector("[data-price-cal-days]");
          const prevBtn = panel.querySelector("[data-price-cal-prev]");
          const nextBtn = panel.querySelector("[data-price-cal-next]");
          let selected = null;

          /* Check-in: the night itself must be free. Check-out: the night
             before must be free (a booking starting that morning is fine),
             and once a check-in is picked every night in between too.
             Days Hostaway closes to arrival/departure can't be picked. */
          const dayIsSelectable = (cellDate) => {
            const a = villa.availability || {};
            if (key !== "checkout") return !nightIsBlocked(cellDate) && !inRanges(cellDate, a.closedOnArrival);
            if (inRanges(cellDate, a.closedOnDeparture)) return false;
            if (selectedCheckin) return cellDate > selectedCheckin && !stayHasBlockedNight(selectedCheckin, cellDate);
            return !nightIsBlocked(addDays(cellDate, -1));
          };

          const renderWeekdays = () => {
            const base = new Date(2026, 0, 4);
            weekdaysEl.innerHTML = "";
            for (let i = 0; i < 7; i++) {
              const d = new Date(base);
              d.setDate(base.getDate() + i);
              const span = document.createElement("span");
              span.textContent = d.toLocaleDateString(locale(), { weekday: "narrow" });
              weekdaysEl.appendChild(span);
            }
          };

          const render = () => {
            monthEl.textContent = calendarMonth.toLocaleDateString(locale(), { month: "long", year: "numeric" });
            daysEl.innerHTML = "";
            const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth();
            const firstWeekday = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let i = 0; i < firstWeekday; i++) {
              const spacer = document.createElement("span");
              spacer.className = "trip-calendar-day-empty";
              daysEl.appendChild(spacer);
            }
            for (let d = 1; d <= daysInMonth; d++) {
              const cellDate = new Date(year, month, d);
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "trip-calendar-day";
              btn.textContent = d;
              if (cellDate < today || !dayIsSelectable(cellDate)) btn.disabled = true;
              if (btn.disabled && nightIsBlocked(cellDate)) btn.classList.add("is-unavailable");
              if (sameDay(cellDate, today)) btn.classList.add("is-today");
              if (sameDay(cellDate, selected)) btn.classList.add("is-selected");
              btn.addEventListener("click", () => selectDate(cellDate));
              daysEl.appendChild(btn);
            }
            prevBtn.disabled = calendarMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
          };

          /* The label drops its data-i18n key while it shows a date, so a
             language switch re-formats the date instead of resetting it to
             "Check In" (see setText on mls:languagechange below). */
          const setText = () => {
            if (selected) {
              textEl.removeAttribute("data-i18n");
              textEl.textContent = selected.toLocaleDateString(locale(), { month: "short", day: "numeric" });
            } else {
              textEl.setAttribute("data-i18n", `detail.book.${key}`);
              textEl.textContent = t(`detail.book.${key}`);
            }
          };

          const selectDate = (date) => {
            selected = date;
            setText();
            fieldEl.classList.add("has-value");
            if (key === "checkin") {
              selectedCheckin = date;
              if (selectedCheckout && (selectedCheckout <= date || stayHasBlockedNight(date, selectedCheckout))) {
                priceDateFields.checkout.clear();
              }
            } else {
              selectedCheckout = date;
            }
            updatePriceDisplay();
            close();
            if (key === "checkin" && !selectedCheckout) priceDateFields.checkout.open();
          };

          const clear = () => {
            selected = null;
            if (key === "checkin") selectedCheckin = null;
            else selectedCheckout = null;
            fieldEl.classList.remove("has-value");
            setText();
          };

          const open = () => {
            priceBox.querySelectorAll("[data-price-calendar]").forEach((p) => { if (p !== panel) p.hidden = true; });
            renderWeekdays();
            render();
            panel.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
          };
          const close = () => {
            panel.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
          };

          trigger.addEventListener("click", () => (panel.hidden ? open() : close()));
          prevBtn.addEventListener("click", () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); syncCalendarViews(); });
          nextBtn.addEventListener("click", () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); syncCalendarViews(); });

          priceCalRenders.push(render);
          priceDateFields[key] = { open, close, clear, setText, trigger };
        });

        document.addEventListener("click", (e) => {
          if (priceBox.contains(e.target)) return;
          priceBox.querySelectorAll("[data-price-calendar]").forEach((p) => { p.hidden = true; });
          priceBox.querySelectorAll("[data-price-date-trigger]").forEach((b) => b.setAttribute("aria-expanded", "false"));
        });

        const guestsValueEl = priceBox.querySelector("[data-price-guests-value]");
        const guestsDecBtn = priceBox.querySelector("[data-price-guests-dec]");
        const guestsIncBtn = priceBox.querySelector("[data-price-guests-inc]");
        let guests = 1;

        const money = (n) => `$${Number(n).toLocaleString("en-US", Number(n) % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`;
        const nightsLabel = (n) => (n === 1 ? t("detail.book.oneNight") : t("detail.book.totalNights").replace("{n}", n));
        const stayNights = () => (selectedCheckin && selectedCheckout && selectedCheckout > selectedCheckin
          ? nightsBetween(selectedCheckin, selectedCheckout)
          : 0);

        /* What stops this stay from being booked, if anything. Missing
           dates only surface after a Book attempt; the rest show as soon
           as both dates are in. */
        const bookingIssue = () => {
          if (!selectedCheckin) return { key: "detail.book.errCheckin", field: "checkin", needsAttempt: true };
          if (!selectedCheckout) return { key: "detail.book.errCheckout", field: "checkout", needsAttempt: true };
          if (stayHasBlockedNight(selectedCheckin, selectedCheckout)) return { key: "detail.book.errBooked", field: "checkin" };
          const minStay = minStayFor(selectedCheckin);
          const nights = nightsBetween(selectedCheckin, selectedCheckout);
          if (nights < minStay) {
            return { key: "detail.book.errMinStay", field: "checkout", text: t("detail.book.errMinStay").replace("{n}", minStay).replace("{m}", minStay - nights) };
          }
          if (guests > villa.guests) return { key: "detail.book.errCapacity", text: t("detail.book.errCapacity").replace("{n}", villa.guests) };
          return null;
        };

        /* Hostaway Booking Engine checkout once it's published
           (MLS_BOOKING_ENGINE_URL in villas-data.js); until then, the
           contact page's booking request with everything prefilled. */
        const bookHref = () => {
          const engineUrl = typeof mlsBookingEngineUrl === "function"
            ? mlsBookingEngineUrl(villa, selectedCheckin && mlsDateStr(selectedCheckin), selectedCheckout && mlsDateStr(selectedCheckout), guests)
            : null;
          if (engineUrl) return engineUrl;
          const qs = new URLSearchParams({ villa: villa.slug });
          if (selectedCheckin) qs.set("checkin", mlsDateStr(selectedCheckin));
          if (selectedCheckout) qs.set("checkout", mlsDateStr(selectedCheckout));
          qs.set("guests", guests);
          return `../contact.html?${qs}`;
        };

        /* Booking panel: breakdown + validation + Book now, injected under
           the guests stepper (one copy here instead of four villa pages). */
        const bookPanel = document.createElement("div");
        bookPanel.className = "villa-book";
        bookPanel.setAttribute("data-book-panel", "");
        bookPanel.innerHTML = `
          <dl class="villa-book-breakdown" data-book-breakdown hidden></dl>
          <p class="villa-book-error" data-book-error role="alert" hidden></p>
          <a class="btn btn-solid villa-book-cta" id="villa-book-now" data-book-cta href="${bookHref()}" data-i18n="detail.book.cta">${t("detail.book.cta")}</a>`;
        priceBox.querySelector(".villa-price-guests")?.after(bookPanel);
        const breakdownEl = bookPanel.querySelector("[data-book-breakdown]");
        const bookErrorEl = bookPanel.querySelector("[data-book-error]");

        /* Phones/tablets: the same CTA as a fixed bottom bar while the
           card's own controls are off-screen (hidden by CSS above 900px). */
        const bookBar = document.createElement("div");
        bookBar.className = "book-bar";
        bookBar.setAttribute("data-book-bar", "");
        bookBar.setAttribute("role", "region");
        bookBar.setAttribute("aria-label", t("detail.book.barLabel"));
        bookBar.innerHTML = `
          <div class="book-bar-summary">
            <span class="book-bar-amount" data-book-bar-amount></span>
            <span class="book-bar-meta" data-book-bar-meta></span>
          </div>
          <a class="btn btn-solid book-bar-cta" id="villa-book-now-bar" data-book-cta href="${bookHref()}" data-i18n="detail.book.cta">${t("detail.book.cta")}</a>`;
        document.body.appendChild(bookBar);
        document.body.classList.add("has-book-bar");
        const barAmountEl = bookBar.querySelector("[data-book-bar-amount]");
        const barMetaEl = bookBar.querySelector("[data-book-bar-meta]");
        let bookAttempted = false;

        /* ---------- Stay quote: Hostaway's own price ----------
           /api/villa-quote returns Hostaway's breakdown (base rate,
           cleaning, taxes, other fees) for the picked dates + guests — what
           the Booking Engine checkout charges. Fetched once the stay is
           valid, cached per stay; until it answers (or if it can't) the
           box shows no made-up total. */
        const quoteCache = new Map();
        let quote = { key: null, status: "idle", data: null };
        let quoteTimer = null;
        const requestQuote = () => {
          const key = stayNights() > 0 && !bookingIssue()
            ? `${mlsDateStr(selectedCheckin)}_${mlsDateStr(selectedCheckout)}_${guests}`
            : null;
          if (key === quote.key) return;
          clearTimeout(quoteTimer);
          if (!key) { quote = { key: null, status: "idle", data: null }; return; }
          if (quoteCache.has(key)) { quote = { key, status: "ready", data: quoteCache.get(key) }; return; }
          quote = { key, status: "loading", data: null };
          quoteTimer = setTimeout(() => {
            const [checkin, checkout, g] = key.split("_");
            const qs = new URLSearchParams({ listingId: villa.hostawayListingId, checkin, checkout, guests: g });
            fetch(`/api/villa-quote?${qs}`)
              .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`))))
              .then((data) => {
                quoteCache.set(key, data);
                if (quote.key === key) quote = { key, status: "ready", data };
              })
              .catch(() => { if (quote.key === key) quote = { key, status: "error", data: null }; })
              .finally(() => updatePriceDisplay());
          }, 250);
        };

        updatePriceDisplay = () => {
          requestQuote();
          const nights = stayNights();
          const q = quote.status === "ready" ? quote.data : null;
          const from = typeof villa.priceFromPerNight === "number" ? villa.priceFromPerNight : null;

          if (priceEl) priceEl.textContent = q ? money(q.total) : from !== null ? money(from) : "—";
          if (q) {
            if (priceFromEl) { priceFromEl.setAttribute("data-i18n", "detail.book.total"); priceFromEl.textContent = t("detail.book.total"); }
            if (priceUnitEl) { priceUnitEl.removeAttribute("data-i18n"); priceUnitEl.textContent = nightsLabel(q.nights); }
          } else {
            if (priceFromEl) { priceFromEl.setAttribute("data-i18n", "detail.book.from"); priceFromEl.textContent = t("detail.book.from"); }
            if (priceUnitEl) { priceUnitEl.setAttribute("data-i18n", "detail.book.perNight"); priceUnitEl.textContent = t("detail.book.perNight"); }
          }

          const row = (label, value, cls = "") => `<div class="villa-book-row${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
          let rows = "";
          if (q) {
            rows = row(`${money(Math.round((q.accommodation / q.nights) * 100) / 100)} × ${nightsLabel(q.nights)}`, money(q.accommodation))
              + (q.cleaning !== null ? row(t("detail.book.cleaning"), money(q.cleaning)) : "")
              + q.fees.map((f) => row(f.title, money(f.amount))).join("")
              + q.discounts.map((f) => row(f.title, `−${money(Math.abs(f.amount))}`)).join("")
              + (q.taxes !== null ? row(t("detail.book.taxes"), money(q.taxes)) : "")
              + row(t("detail.book.total"), money(q.total), " villa-book-row--total")
              + q.notIncluded.map((f) => row(`${f.title} <span class="is-pending">${t("detail.book.notIncluded")}</span>`, money(f.amount), " villa-book-row--aside")).join("");
          } else if (quote.status === "loading") {
            rows = `<p class="villa-book-status">${t("detail.book.quoteLoading")}</p>`;
          } else if (quote.status === "error") {
            rows = `<p class="villa-book-status">${t("detail.book.quoteUnavailable")}</p>`;
          }
          breakdownEl.hidden = !rows;
          breakdownEl.innerHTML = rows;

          const issue = bookingIssue();
          const showIssue = issue && (bookAttempted || !issue.needsAttempt);
          bookErrorEl.hidden = !showIssue;
          bookErrorEl.textContent = showIssue ? (issue.text || t(issue.key)) : "";
          bookPanel.classList.toggle("has-issue", Boolean(issue));

          const href = bookHref();
          document.querySelectorAll("[data-book-cta]").forEach((a) => { a.href = href; });

          const fmt = (d) => d.toLocaleDateString(locale(), { month: "short", day: "numeric" });
          barAmountEl.textContent = q ? money(q.total) : from !== null ? `${t("detail.book.from")} ${money(from)}` : "—";
          barMetaEl.textContent = nights > 0
            ? `${fmt(selectedCheckin)} – ${fmt(selectedCheckout)} · ${nightsLabel(nights)}`
            : `${t("detail.book.perNight")} · ${t("detail.book.addDates")}`;
        };

        /* Book now (card or bar): go straight to the booking form with
           villa, dates and guests prefilled — or, if something's missing or
           invalid, bring the card into view and point at what to fix. */
        document.querySelectorAll("[data-book-cta]").forEach((cta) => {
          cta.addEventListener("click", (e) => {
            const issue = bookingIssue();
            const notes = priceBox.querySelector("[data-price-notes]")?.value.trim();
            if (!issue) {
              // Notes ride along in sessionStorage, not the URL (free text
              // shouldn't end up in server logs or analytics).
              try { notes ? sessionStorage.setItem("mlsBookNotes", notes) : sessionStorage.removeItem("mlsBookNotes"); } catch (_) {}
              return;
            }
            e.preventDefault();
            bookAttempted = true;
            updatePriceDisplay();
            const fromBar = bookBar.contains(cta);
            if (fromBar) {
              const top = priceBox.getBoundingClientRect().top + window.scrollY - 96;
              window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
            }
            // A missing date opens its picker; other issues leave the
            // message in view (an open picker would cover it).
            if (issue.needsAttempt) setTimeout(() => priceDateFields[issue.field]?.open(), fromBar && !prefersReducedMotion ? 450 : 0);
          });
        });

        /* Bar visibility: shown only while neither the date pickers nor the
           card's own Book button are on screen, and it lifts the floating
           contact button by its own height so the two never overlap. */
        const setBarHeight = () => document.body.style.setProperty("--book-bar-h", `${bookBar.offsetHeight}px`);
        const setBarVisible = (visible) => {
          document.body.classList.toggle("book-bar-visible", visible);
          bookBar.inert = !visible;
          setBarHeight();
        };
        if ("IntersectionObserver" in window) {
          const onScreen = new Set();
          const barObserver = new IntersectionObserver((entries) => {
            entries.forEach((en) => (en.isIntersecting ? onScreen.add(en.target) : onScreen.delete(en.target)));
            setBarVisible(onScreen.size === 0);
          });
          [priceBox.querySelector(".villa-price-dates"), bookPanel].forEach((el) => el && barObserver.observe(el));
        } else {
          setBarVisible(true);
        }
        window.addEventListener("resize", setBarHeight);

        /* Live Hostaway data or a language switch: redraw pickers, labels
           and the quote with the new availability / wording. */
        /* Structured data: priceRange only once Hostaway's live "from"
           rate is known (no hardcoded figure in the page's JSON-LD). */
        const syncStructuredPrice = () => {
          if (typeof villa.priceFromPerNight !== "number") return;
          document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
            try {
              const data = JSON.parse(el.textContent);
              if (data["@type"] !== "LodgingBusiness") return;
              data.priceRange = `From $${villa.priceFromPerNight} USD/night`;
              el.textContent = JSON.stringify(data, null, 2);
            } catch (_) {}
          });
        };
        document.addEventListener("mls:livedata", () => {
          priceCalRenders.forEach((render) => render());
          updatePriceDisplay();
          syncStructuredPrice();
        });
        document.addEventListener("mls:languagechange", () => {
          Object.values(priceDateFields).forEach((f) => f.setText());
          bookBar.setAttribute("aria-label", t("detail.book.barLabel"));
          updatePriceDisplay();
        });

        const updateGuests = () => {
          if (guestsValueEl) guestsValueEl.textContent = guests;
          if (guestsDecBtn) guestsDecBtn.disabled = guests <= 1;
          if (guestsIncBtn) guestsIncBtn.disabled = guests >= villa.guests;
          updatePriceDisplay();
        };
        guestsDecBtn?.addEventListener("click", () => { guests = Math.max(1, guests - 1); updateGuests(); });
        guestsIncBtn?.addEventListener("click", () => { guests = Math.min(villa.guests, guests + 1); updateGuests(); });
        updateGuests();
      }

      renderVillaDetail();
    }
  }

  /* ---------- About page: real guest reviews ----------
     about.html ships a snapshot of real Hostaway reviews so the cards
     render instantly and survive an outage. Once live data lands, the
     cards are refreshed with the same rule used for that snapshot: per
     villa, the newest public review short enough for a card (no rating
     filter), newest villa first. The snapshot stays if fewer reviews than
     cards come back. Text is set with textContent — guest-written. */
  const aboutTestimonials = document.querySelector("[data-about-testimonials]");
  const ABOUT_QUOTE_MAX_CHARS = 200;
  const renderAboutTestimonials = () => {
    if (!aboutTestimonials || typeof MLS_VILLAS === "undefined") return;
    const cards = [...aboutTestimonials.querySelectorAll(".testimonial-card")];
    const lang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
    const pickText = (field) => (lang === "es" && field.es) || field.en || "";
    const monthOf = (r) => (pickText(r.context).match(/\d{4}-\d{2}/) || [""])[0];
    const fits = (r) => pickText(r.quote).trim().length <= ABOUT_QUOTE_MAX_CHARS;

    const perVilla = MLS_VILLAS
      .map((villa) => ({ villa, reviews: (villa.testimonials || []).filter(fits) }))
      .filter((v) => v.reviews.length);
    const chosen = perVilla
      .map(({ villa, reviews }) => ({ villa, review: reviews[0] }))
      .sort((a, b) => monthOf(b.review).localeCompare(monthOf(a.review)));
    // Fewer villas with reviews than cards: fill with each villa's next one.
    for (let depth = 1; chosen.length < cards.length; depth++) {
      const extra = perVilla.filter((v) => v.reviews[depth]).map(({ villa, reviews }) => ({ villa, review: reviews[depth] }));
      if (!extra.length) break;
      chosen.push(...extra.slice(0, cards.length - chosen.length));
    }

    if (chosen.length >= cards.length) {
      cards.forEach((card, i) => {
        const { villa, review } = chosen[i];
        card.querySelector(".testimonial-quote").textContent = pickText(review.quote).trim();
        card.querySelector(".name").textContent = review.name;
        card.querySelector(".villa").textContent = `${villa.name}, ${(lang === "es" && villa.destinationLabelEs) || villa.destinationLabel}`;
        const ratingEl = card.querySelector(".testimonial-rating");
        const n = Math.round(Number(review.rating));
        const valid = Number.isFinite(n) && n >= 1 && n <= 5;
        ratingEl.hidden = !valid;
        ratingEl.dataset.rating = valid ? n : "";
        ratingEl.querySelectorAll(".star").forEach((star, s) => star.classList.toggle("is-filled", valid && s < n));
      });
    }
    aboutTestimonials.querySelectorAll(".testimonial-rating[data-rating]").forEach((el) => {
      if (el.dataset.rating) el.setAttribute("aria-label", t("testimonials.starsLabel").replace("{n}", el.dataset.rating));
    });
  };
  renderAboutTestimonials();

  /* ---------- Re-render dynamic (data-driven) content once live Hostaway
     data lands (see hostaway-sync.js) — same render calls as a language
     change, since both mean "MLS_VILLAS data changed, redraw." ---------- */
  document.addEventListener("mls:livedata", () => {
    renderFeaturedShowcase && renderFeaturedShowcase();
    renderAboutTestimonials();
    renderVillaGrid && renderVillaGrid();
    renderDestinationGrid && renderDestinationGrid();
    renderVillaDetail && renderVillaDetail();
    renderTripShowcase && renderTripShowcase();
    updateTripCapacityNotice && updateTripCapacityNotice();
  });

  /* ---------- Re-render dynamic (data-driven) content when the language toggles ---------- */
  document.addEventListener("mls:languagechange", () => {
    renderFeaturedShowcase && renderFeaturedShowcase();
    renderAboutTestimonials();
    document.querySelector("#filter-guests") && !document.querySelector("[data-guests-error]")?.hidden &&
      document.querySelector("#filter-guests").dispatchEvent(new Event("input"));
    renderVillaGrid && renderVillaGrid();
    renderDestinationGrid && renderDestinationGrid();
    renderVillaDetail && renderVillaDetail();
    renderTripShowcase && renderTripShowcase();
    updateTripCapacityNotice && updateTripCapacityNotice();
    filterCustomSelects.forEach((cs) => cs.rebuildLabels());
    heroSearchSelects.forEach((cs) => cs.rebuildLabels());
    /* i18n.js applies the page's initial language from a DOMContentLoaded
       listener, which fires after this script's own initReveal() call —
       so any .reveal markup rebuilt just now (villa rows, service cards)
       was never handed to that first IntersectionObserver. Re-run it so
       freshly-created elements still fade in instead of staying at
       opacity:0 forever. */
    initReveal();
  });

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
    const priceValueEl = contactForm.querySelector("[data-trip-price-value]");
    const bedroomsStepper = contactForm.querySelector('[data-trip-stepper][data-name="bedrooms"]');
    const adultsStepper = contactForm.querySelector('[data-trip-stepper][data-name="adults"]');
    const childrenStepper = contactForm.querySelector('[data-trip-stepper][data-name="children"]');
    const capacityNoticeEl = contactForm.querySelector("[data-trip-capacity-notice]");
    let currentVillaGuests = Infinity;

    /* ---------- Guest/room steppers (Bedrooms, Adults, Children, Infants) ---------- */
    const setStepperValue = (stepper, value) => {
      const min = Number(stepper.dataset.min || 0);
      const max = stepper.dataset.max ? Number(stepper.dataset.max) : Infinity;
      const clamped = Math.min(max, Math.max(min, value));
      stepper.dataset.value = clamped;
      stepper.querySelector("[data-stepper-value]").textContent = clamped;
      stepper.querySelector("[data-stepper-input]").value = clamped;
      const decBtn = stepper.querySelector("[data-stepper-dec]");
      const incBtn = stepper.querySelector("[data-stepper-inc]");
      if (decBtn) decBtn.disabled = clamped <= min;
      if (incBtn) incBtn.disabled = clamped >= max;
    };
    /* Bedrooms default to double occupancy (2 guests/room, rounded up) —
       e.g. 2 adults = 1 bedroom, 8 adults = 4 bedrooms — clamped to the
       selected villa's bedroom count via bedroomsStepper's own max. */
    const syncBedroomsFromAdults = () => {
      if (!bedroomsStepper || !adultsStepper) return;
      const adults = Number(adultsStepper.dataset.value || 1);
      setStepperValue(bedroomsStepper, Math.ceil(adults / 2));
    };
    /* Group (adults + children) hit the villa's real capacity — inviting a
       personalized quote instead of just silently blocking the stepper. */
    updateTripCapacityNotice = () => {
      if (!capacityNoticeEl || !adultsStepper || !childrenStepper) return;
      const adults = Number(adultsStepper.dataset.value || 1);
      const children = Number(childrenStepper.dataset.value || 0);
      const atCapacity = Number.isFinite(currentVillaGuests) && adults + children >= currentVillaGuests;
      if (!atCapacity) {
        capacityNoticeEl.hidden = true;
        capacityNoticeEl.innerHTML = "";
        return;
      }
      const msg = t("contact.form.capacityNotice").replace("{max}", currentVillaGuests);
      capacityNoticeEl.innerHTML =
        `${msg} <a href="https://wa.me/5219848079475" target="_blank" rel="noopener">${t("contact.form.capacityNoticeCta")}</a>.`;
      capacityNoticeEl.hidden = false;
    };
    /* Adults + children combined can't exceed the selected villa's real
       guest capacity (villa.guests). Infants aren't counted (lap/crib,
       standard hospitality practice). If a villa switch shrinks capacity
       below the current total, children are trimmed first, then adults. */
    const syncGuestCapacity = () => {
      if (!adultsStepper || !childrenStepper) return;
      const cap = currentVillaGuests;
      const adultsMin = Number(adultsStepper.dataset.min || 1);
      let adults = Number(adultsStepper.dataset.value || adultsMin);
      let children = Number(childrenStepper.dataset.value || 0);
      if (Number.isFinite(cap)) {
        while (adults + children > cap && children > 0) children -= 1;
        while (adults + children > cap && adults > adultsMin) adults -= 1;
      }
      adultsStepper.dataset.max = Number.isFinite(cap) ? Math.max(adultsMin, cap - children) : "";
      childrenStepper.dataset.max = Number.isFinite(cap) ? Math.max(0, cap - adults) : "";
      setStepperValue(adultsStepper, adults);
      setStepperValue(childrenStepper, children);
      updateTripCapacityNotice();
    };
    contactForm.querySelectorAll("[data-trip-stepper]").forEach((stepper) => {
      setStepperValue(stepper, Number(stepper.dataset.value || 0));
      stepper.querySelector("[data-stepper-dec]")?.addEventListener("click", () => {
        setStepperValue(stepper, Number(stepper.dataset.value) - 1);
        if (stepper === adultsStepper || stepper === childrenStepper) syncGuestCapacity();
        if (stepper === adultsStepper) syncBedroomsFromAdults();
      });
      stepper.querySelector("[data-stepper-inc]")?.addEventListener("click", () => {
        setStepperValue(stepper, Number(stepper.dataset.value) + 1);
        if (stepper === adultsStepper || stepper === childrenStepper) syncGuestCapacity();
        if (stepper === adultsStepper) syncBedroomsFromAdults();
      });
    });
    syncGuestCapacity();
    syncBedroomsFromAdults();

    /* ---------- Check-in / check-out: custom calendar popovers ----------
       A native <input type="date"> hands the picker's look to the browser/OS
       and can't be styled — swapped for an on-brand calendar dropdown (same
       pattern as the villa listbox below), backed by a hidden input. */
    const isoDay = (d) => {
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const sameDay = (a, b) => a && b && isoDay(a) === isoDay(b);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* A date is unavailable once a villa is chosen if it falls in that
       villa's own blockedRanges; before a villa is chosen, only dates
       blocked for every villa count (same "combined availability" logic
       as the home hero search above). */
    const contactDateIsUnavailable = (dateStr) => {
      if (typeof MLS_VILLAS === "undefined") return false;
      const chosen = villaValueInput?.value
        ? MLS_VILLAS.find((v) => v.slug === villaValueInput.value)
        : null;
      const villas = chosen ? [chosen] : MLS_VILLAS;
      return villas.length > 0 && villas.every((v) =>
        (v.availability?.blockedRanges || []).some((r) => dateStr >= r.start && dateStr <= r.end)
      );
    };

    const dateFields = {};
    contactForm.querySelectorAll("[data-trip-date-field]").forEach((fieldEl) => {
      const key = fieldEl.dataset.tripDateField;
      const trigger = fieldEl.querySelector("[data-date-trigger]");
      const textEl = fieldEl.querySelector(`[data-trip-date-text="${key}"]`);
      const defaultLabel = textEl.textContent;
      const panel = fieldEl.querySelector("[data-trip-calendar]");
      const monthEl = panel.querySelector("[data-cal-month]");
      const weekdaysEl = panel.querySelector("[data-cal-weekdays]");
      const daysEl = panel.querySelector("[data-cal-days]");
      const prevBtn = panel.querySelector("[data-cal-prev]");
      const nextBtn = panel.querySelector("[data-cal-next]");
      const hiddenInput = fieldEl.querySelector("[data-date-value]");

      /* i18nKey: the label's data-i18n key, dropped while it shows a picked
         date so i18n.js's DOMContentLoaded pass doesn't reset a date
         prefilled from the URL back to "Check-In". */
      const i18nKey = textEl.getAttribute("data-i18n");
      const api = { key, fieldEl, trigger, textEl, defaultLabel, i18nKey, hiddenInput, selected: null, minDate: today, viewDate: new Date(today) };

      const lang = () => (typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en");
      const locale = () => (lang() === "es" ? "es-MX" : "en-US");

      const renderWeekdays = () => {
        const base = new Date(2026, 0, 4); // a Sunday
        weekdaysEl.innerHTML = "";
        for (let i = 0; i < 7; i++) {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          const span = document.createElement("span");
          span.textContent = d.toLocaleDateString(locale(), { weekday: "narrow" });
          weekdaysEl.appendChild(span);
        }
      };

      const render = () => {
        monthEl.textContent = api.viewDate.toLocaleDateString(locale(), { month: "long", year: "numeric" });
        daysEl.innerHTML = "";
        const year = api.viewDate.getFullYear(), month = api.viewDate.getMonth();
        const firstWeekday = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstWeekday; i++) {
          const spacer = document.createElement("span");
          spacer.className = "trip-calendar-day-empty";
          daysEl.appendChild(spacer);
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const cellDate = new Date(year, month, d);
          const unavailable = contactDateIsUnavailable(isoDay(cellDate));
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "trip-calendar-day";
          btn.textContent = d;
          if (cellDate < api.minDate || unavailable) btn.disabled = true;
          if (unavailable) btn.classList.add("is-unavailable");
          if (sameDay(cellDate, today)) btn.classList.add("is-today");
          if (sameDay(cellDate, api.selected)) btn.classList.add("is-selected");
          btn.addEventListener("click", () => selectDate(cellDate));
          daysEl.appendChild(btn);
        }
        const firstOfMinMonth = new Date(api.minDate.getFullYear(), api.minDate.getMonth(), 1);
        prevBtn.disabled = api.viewDate <= firstOfMinMonth;
      };

      const selectDate = (date) => {
        api.selected = date;
        api.hiddenInput.value = isoDay(date);
        api.textEl.removeAttribute("data-i18n");
        api.textEl.textContent = date.toLocaleDateString(locale(), { month: "short", day: "numeric", year: "numeric" });
        close();
        onDateSelected(key, date);
      };

      const open = () => {
        Object.values(dateFields).forEach((other) => { if (other !== api) other.close(); });
        renderWeekdays();
        render();
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      };
      const close = () => {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      };

      trigger.addEventListener("click", () => (panel.hidden ? open() : close()));
      prevBtn.addEventListener("click", () => {
        api.viewDate.setMonth(api.viewDate.getMonth() - 1);
        render();
      });
      nextBtn.addEventListener("click", () => {
        api.viewDate.setMonth(api.viewDate.getMonth() + 1);
        render();
      });

      api.render = render;
      api.close = close;
      api.selectDate = selectDate;
      api.setMinDate = (date) => {
        api.minDate = date;
        if (api.selected && api.selected < date) {
          api.selected = null;
          api.hiddenInput.value = "";
          if (api.i18nKey) api.textEl.setAttribute("data-i18n", api.i18nKey);
          api.textEl.textContent = api.i18nKey ? t(api.i18nKey) : api.defaultLabel;
        }
        if (api.viewDate < date) api.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
        if (!panel.hidden) render();
      };
      dateFields[key] = api;
    });

    function onDateSelected(key, date) {
      if (key === "checkin" && dateFields.checkout) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        dateFields.checkout.setMinDate(next);
      }
    }

    document.addEventListener("click", (e) => {
      Object.values(dateFields).forEach((api) => {
        if (!api.fieldEl.contains(e.target)) api.close();
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") Object.values(dateFields).forEach((api) => api.close());
    });

    /* ---------- Villa selection (custom listbox, same essence as the rest
       of the panel — a native <select>'s dropdown can't be themed) ---------- */
    const villaField = contactForm.querySelector("[data-trip-villa-field]");
    const villaTrigger = contactForm.querySelector("[data-villa-trigger]");
    const villaTriggerText = contactForm.querySelector("[data-villa-trigger-text]");
    const villaListbox = contactForm.querySelector("[data-villa-listbox]");
    const villaValueInput = contactForm.querySelector("[data-villa-value]");
    const villaOptions = villaListbox ? [...villaListbox.querySelectorAll("[role=option]")] : [];

    const closeVillaListbox = () => {
      villaListbox.hidden = true;
      villaTrigger.setAttribute("aria-expanded", "false");
    };
    const openVillaListbox = () => {
      villaListbox.hidden = false;
      villaTrigger.setAttribute("aria-expanded", "true");
      villaOptions.find((o) => o.dataset.value === villaValueInput.value)?.focus();
    };
    const selectVilla = (option) => {
      villaValueInput.value = option.dataset.value;
      villaTriggerText.removeAttribute("data-i18n"); // keep the villa name through i18n.js's DOMContentLoaded pass
      villaTriggerText.textContent = option.textContent.trim();
      villaOptions.forEach((o) => o.setAttribute("aria-selected", o === option ? "true" : "false"));
      closeVillaListbox();
      villaTrigger.focus();
      syncTripVilla();
    };

    if (villaTrigger) {
      villaTrigger.addEventListener("click", () => {
        villaListbox.hidden ? openVillaListbox() : closeVillaListbox();
      });
      villaOptions.forEach((option) => {
        option.tabIndex = -1;
        option.addEventListener("click", () => selectVilla(option));
        option.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectVilla(option); }
          else if (e.key === "Escape") { closeVillaListbox(); villaTrigger.focus(); }
          else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const dir = e.key === "ArrowDown" ? 1 : -1;
            const idx = villaOptions.indexOf(option) + dir;
            villaOptions[Math.min(villaOptions.length - 1, Math.max(0, idx))]?.focus();
          }
        });
      });
      document.addEventListener("click", (e) => {
        if (!villaField.contains(e.target)) closeVillaListbox();
      });
    }

    /* ---------- Villa showcase: carousel + specs shown once a specific
       villa is chosen, so the picker's dates/guests/price form can move
       alongside it. Photos come from villa.showcaseImages (see MLS_VILLAS
       in villas-data.js — HOSTAWAY swap point once real listings are wired
       up). ---------- */
    const contactLayoutEl = contactForm.closest("[data-contact-layout]");
    const showcaseEl = contactLayoutEl?.querySelector("[data-trip-showcase]");
    const showcaseImgEl = showcaseEl?.querySelector("[data-showcase-img]");
    const showcaseDotsEl = showcaseEl?.querySelector("[data-showcase-dots]");
    const showcaseLocationEl = showcaseEl?.querySelector("[data-showcase-location]");
    const showcaseNameEl = showcaseEl?.querySelector("[data-showcase-name]");
    const showcaseSpecsEl = showcaseEl?.querySelector("[data-showcase-specs]");
    const showcaseDescEl = showcaseEl?.querySelector("[data-showcase-desc]");
    let showcaseImages = [];
    let showcaseIndex = 0;

    const renderShowcaseSlide = () => {
      if (!showcaseEl || !showcaseImages.length) return;
      const lang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
      const img = showcaseImages[showcaseIndex];
      showcaseImgEl.src = img.src;
      showcaseImgEl.alt = (lang === "es" && img.altEs) || img.alt || "";
      showcaseDotsEl.querySelectorAll("button").forEach((dot, i) => {
        dot.setAttribute("aria-current", String(i === showcaseIndex));
      });
    };
    const goShowcase = (delta) => {
      if (!showcaseImages.length) return;
      showcaseIndex = (showcaseIndex + delta + showcaseImages.length) % showcaseImages.length;
      renderShowcaseSlide();
    };
    showcaseEl?.querySelector("[data-showcase-prev]")?.addEventListener("click", () => goShowcase(-1));
    showcaseEl?.querySelector("[data-showcase-next]")?.addEventListener("click", () => goShowcase(1));

    const applyVillaShowcase = (villa, { resetImages }) => {
      if (!showcaseEl) return;
      if (!villa) {
        contactLayoutEl.classList.remove("has-showcase");
        showcaseEl.hidden = true;
        return;
      }
      const lang = typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en";
      if (resetImages) {
        showcaseImages = (villa.showcaseImages && villa.showcaseImages.length)
          ? villa.showcaseImages
          : [{ src: villa.image, alt: villa.imageAlt, altEs: villa.imageAltEs }];
        showcaseIndex = 0;
        showcaseDotsEl.innerHTML = showcaseImages
          .map((_, i) => `<button type="button" aria-label="${t("contact.form.showcasePhoto")} ${i + 1}" aria-current="${i === 0}"></button>`)
          .join("");
        [...showcaseDotsEl.querySelectorAll("button")].forEach((dot, i) => {
          dot.addEventListener("click", () => { showcaseIndex = i; renderShowcaseSlide(); });
        });
      }
      renderShowcaseSlide();

      showcaseLocationEl.textContent = (lang === "es" && villa.destinationLabelEs) || villa.destinationLabel;
      showcaseNameEl.textContent = villa.name;
      const baths = villa.baths % 1 === 0 ? villa.baths : villa.baths.toFixed(1);
      showcaseSpecsEl.innerHTML = `
        ${mlsSpecHTML("guests", villa.guests, t("detail.specs.guests"))}
        ${mlsSpecHTML("bedrooms", villa.bedrooms, t("detail.specs.bedrooms"))}
        ${mlsSpecHTML("beds", villa.beds, t("detail.specs.beds"))}
        ${mlsSpecHTML("bathrooms", baths, t("detail.specs.bathrooms"))}
      `;
      showcaseDescEl.textContent = (lang === "es" && villa.shortEs) || villa.short || "";

      contactLayoutEl.classList.add("has-showcase");
      showcaseEl.hidden = false;
    };

    /* "Starting from" is Hostaway's live lowest rate (no static figure),
       so it's also redrawn when live data lands — see renderTripShowcase. */
    const renderTripPrice = (villa) => {
      if (!priceValueEl) return;
      priceValueEl.textContent = villa && typeof villa.priceFromPerNight === "number"
        ? `$${villa.priceFromPerNight.toLocaleString("en-US")}`
        : "—";
    };

    renderTripShowcase = () => {
      const villa = typeof MLS_VILLAS !== "undefined"
        ? MLS_VILLAS.find((v) => v.slug === villaValueInput.value)
        : null;
      renderTripPrice(villa);
      applyVillaShowcase(villa, { resetImages: false });
    };

    /* ---------- Villa selection: sync bedrooms max + nightly rate + showcase ----------
       HOSTAWAY INTEGRATION POINT: once live pricing is wired up, replace
       villa.priceFromPerNight with a fetch to the pricing API for the
       selected villa + chosen dates. */
    function syncTripVilla() {
      const villa = typeof MLS_VILLAS !== "undefined"
        ? MLS_VILLAS.find((v) => v.slug === villaValueInput.value)
        : null;
      currentVillaGuests = villa ? villa.guests : Infinity;
      syncGuestCapacity();
      if (bedroomsStepper) {
        bedroomsStepper.dataset.max = villa ? villa.bedrooms : "";
        syncBedroomsFromAdults();
      }
      renderTripPrice(villa);
      applyVillaShowcase(villa, { resetImages: true });
      /* Switching villas can make a previously-picked date unavailable for
         the new villa — drop it rather than silently keep a blocked date. */
      Object.values(dateFields).forEach((api) => {
        if (api.selected && contactDateIsUnavailable(isoDay(api.selected))) {
          api.selected = null;
          api.hiddenInput.value = "";
          if (api.i18nKey) api.textEl.setAttribute("data-i18n", api.i18nKey);
          api.textEl.textContent = api.i18nKey ? t(api.i18nKey) : api.defaultLabel;
        }
        if (!api.fieldEl.querySelector("[data-trip-calendar]").hidden) api.render();
      });
    }
    if (params.get("villa") && villaValueInput) {
      const preselected = villaOptions.find((o) => o.dataset.value === params.get("villa"));
      if (preselected) selectVilla(preselected);
    } else {
      syncTripVilla();
    }

    /* Check-in/check-out carried over from a villa's Availability calendar
       (?checkin=&checkout=YYYY-MM-DD, see the day-click handler in
       renderCalendar). Checkin is applied first so its onDateSelected
       bumps checkout's minDate before checkout is validated against it. */
    if (params.get("checkin") && dateFields.checkin) {
      const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.get("checkin"));
      if (isoMatch) {
        const picked = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
        if (picked >= today) {
          dateFields.checkin.viewDate = new Date(picked.getFullYear(), picked.getMonth(), 1);
          dateFields.checkin.selectDate(picked);
        }
      }
    }
    if (params.get("checkout") && dateFields.checkout) {
      const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.get("checkout"));
      if (isoMatch) {
        const picked = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
        if (picked >= dateFields.checkout.minDate) {
          dateFields.checkout.viewDate = new Date(picked.getFullYear(), picked.getMonth(), 1);
          dateFields.checkout.selectDate(picked);
        }
      }
    }
    /* Guest count from a villa page's Book now (?guests=N) lands as adults,
       clamped to the villa's capacity; notes typed there come through
       sessionStorage (kept out of the URL). */
    const guestsParam = parseInt(params.get("guests"), 10);
    if (guestsParam > 0 && adultsStepper) {
      setStepperValue(adultsStepper, guestsParam);
      syncGuestCapacity();
      syncBedroomsFromAdults();
    }
    try {
      const carriedNotes = sessionStorage.getItem("mlsBookNotes");
      const notesEl = contactForm.querySelector("#cf-notes");
      if (carriedNotes && notesEl && !notesEl.value) notesEl.value = carriedNotes;
      sessionStorage.removeItem("mlsBookNotes");
    } catch (_) {}

    const consentInput = contactForm.querySelector("[data-trip-consent]");
    contactForm.addEventListener("input", (e) => {
      if (e.target.getAttribute && e.target.getAttribute("aria-invalid") === "true") e.target.removeAttribute("aria-invalid");
    });

    /* Submit: "Book Now" sends a booking request, "Inquire" a question;
       both go to /api/booking-request, which files them in Hostaway as an
       inquiry (no calendar block, nothing confirmed). The server re-checks
       everything below plus live availability, minimum stay and capacity. */
    const statusEl = contactForm.querySelector(".form-status");
    const submitBtns = [...contactForm.querySelectorAll('button[type="submit"]')];
    const CONTACT_LINKS = {
      whatsapp: { text: "+52 984 807 9475", href: "https://wa.me/5219848079475" },
      email: { text: "info@mexicoluxestays.com", href: "mailto:info@mexicoluxestays.com" },
    };
    /* Messages are fixed i18n strings; {whatsapp}/{email} become real links,
       {n} a number — built as DOM nodes, never as HTML. vars.waText, when
       given, pre-writes the WhatsApp chat (wa.me ?text=). */
    const setStatus = (key, vars = {}) => {
      if (!statusEl) return;
      statusEl.textContent = "";
      t(key).split(/(\{whatsapp\}|\{email\}|\{n\})/).forEach((part) => {
        const name = part.slice(1, -1);
        if (CONTACT_LINKS[name] && part === `{${name}}`) {
          const a = document.createElement("a");
          a.href = name === "whatsapp" && vars.waText
            ? `${CONTACT_LINKS.whatsapp.href}?text=${encodeURIComponent(vars.waText)}`
            : CONTACT_LINKS[name].href;
          a.textContent = CONTACT_LINKS[name].text;
          if (name === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
          statusEl.appendChild(a);
        } else if (part === "{n}") {
          statusEl.appendChild(document.createTextNode(String(vars.n ?? "")));
        } else if (part) {
          statusEl.appendChild(document.createTextNode(part));
        }
      });
    };
    const setBusy = (busy) => submitBtns.forEach((b) => { b.disabled = busy; b.setAttribute("aria-busy", String(busy)); });
    const field = (sel) => (sel ? contactForm.querySelector(sel) : null);
    const markInvalid = (input, msgKey, vars) => {
      if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
      setStatus(msgKey, vars);
    };
    const SERVER_FIELD_INPUTS = { firstName: "#cf-first-name", lastName: "#cf-last-name", email: "#cf-email", phone: "#cf-phone", notes: "#cf-notes" };
    const SERVER_FIELD_MESSAGES = {
      firstName: "contact.form.firstNameRequired", lastName: "contact.form.lastNameRequired",
      email: "contact.form.emailRequired", phone: "contact.form.phoneInvalid",
      notes: "contact.form.questionRequired", villa: "contact.form.villaRequired",
      dates: "contact.form.datesRequired", guests: "contact.form.errInvalid",
    };
    let lastSentKey = null;

    /* WhatsApp fallback when the request can't reach Hostaway: the chat opens
       with the guest's request already written, in their language, so
       nothing they typed is lost. */
    const whatsappText = (payload) => {
      const lang = payload.lang === "es" ? "es" : "en";
      const villaName = villaOptions.find((o) => o.dataset.value === payload.villa)?.textContent.trim() || payload.villa;
      const fmt = (iso) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
        return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric" }) : "";
      };
      const dates = payload.checkin && payload.checkout ? `${fmt(payload.checkin)} → ${fmt(payload.checkout)}` : t("contact.form.wa.noDates");
      const guests = t("contact.form.wa.guestsLine")
        .replace("{adults}", payload.adults || 0)
        .replace("{children}", payload.children || 0)
        .replace("{infants}", payload.infants || 0);
      return [
        t(payload.intent === "book" ? "contact.form.wa.introBook" : "contact.form.wa.introQuestion"),
        "",
        `${t("contact.form.wa.name")}: ${`${payload.firstName} ${payload.lastName}`.trim()}`,
        `${t("contact.form.wa.villa")}: ${villaName}`,
        `${t("contact.form.wa.dates")}: ${dates}`,
        `${t("contact.form.wa.guests")}: ${guests}`,
        payload.notes ? `${t("contact.form.wa.notes")}: ${payload.notes}` : null,
      ].filter((line) => line !== null).join("\n");
    };

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submitBtns.some((b) => b.disabled)) return; // a request is already in flight
      const intent = e.submitter?.dataset.tripIntent === "book" ? "book" : "question";
      if (consentInput && !consentInput.checked) {
        setStatus("contact.form.consentRequired");
        consentInput.focus();
        return;
      }
      if (!villaValueInput.value) {
        setStatus(intent === "book" ? "contact.form.villaRequired" : "contact.form.questionVillaRequired");
        openVillaListbox();
        return;
      }
      const hasCheckin = !!dateFields.checkin?.selected;
      const hasCheckout = !!dateFields.checkout?.selected;
      if ((intent === "book" && (!hasCheckin || !hasCheckout)) || (intent === "question" && hasCheckin !== hasCheckout)) {
        setStatus("contact.form.datesRequired");
        (hasCheckin ? dateFields.checkout : dateFields.checkin)?.trigger.click();
        return;
      }
      /* Guest contact details — the team needs a way to reach the guest. */
      const checks = [
        ["#cf-first-name", (v) => v.length >= 1, "contact.form.firstNameRequired"],
        ["#cf-last-name", (v) => v.length >= 1, "contact.form.lastNameRequired"],
        ["#cf-email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "contact.form.emailRequired"],
        ["#cf-phone", (v) => v.length > 0, "contact.form.phoneRequired"],
        /* Same shape the server accepts before its full per-country check
           (api/booking-request.js normalizePhone): "+" + country code. */
        ["#cf-phone", (v) => {
          let p = v.replace(/[^\d+]/g, "");
          if (p.startsWith("00")) p = `+${p.slice(2)}`;
          return /^\+[1-9]\d{6,14}$/.test(p);
        }, "contact.form.phoneInvalid"],
      ];
      if (intent === "question") checks.push(["#cf-notes", (v) => v.length >= 2, "contact.form.questionRequired"]);
      let firstInvalid = null;
      checks.forEach(([sel, isValid, msgKey]) => {
        const input = field(sel);
        if (!input) return;
        const ok = isValid(input.value.trim());
        input.setAttribute("aria-invalid", String(!ok));
        if (!ok && !firstInvalid) firstInvalid = [input, msgKey];
      });
      if (firstInvalid) { markInvalid(firstInvalid[0], firstInvalid[1]); return; }

      const f = new FormData(contactForm);
      const payload = {
        intent,
        villa: f.get("villa"),
        checkin: f.get("checkin") || "",
        checkout: f.get("checkout") || "",
        bedrooms: f.get("bedrooms"),
        adults: f.get("adults"),
        children: f.get("children"),
        infants: f.get("infants"),
        firstName: f.get("firstName")?.trim() || "",
        lastName: f.get("lastName")?.trim() || "",
        email: f.get("email")?.trim() || "",
        phone: f.get("phone")?.trim() || "",
        notes: f.get("notes")?.trim() || "",
        company: f.get("company") || "",
        lang: typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en",
      };
      const successKey = intent === "book" ? "contact.form.bookSuccess" : "contact.form.questionSuccess";
      /* Same request again right after a success: just repeat the
         confirmation instead of sending a duplicate. */
      const sendKey = JSON.stringify(payload);
      if (sendKey === lastSentKey) { setStatus(successKey); return; }

      setBusy(true);
      setStatus(intent === "book" ? "contact.form.sending" : "contact.form.sendingQuestion");
      fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.ok) {
            lastSentKey = sendKey;
            setStatus(successKey);
            return;
          }
          switch (data.code) {
            case "unavailable": setStatus("contact.form.errUnavailable"); break;
            case "min_stay": setStatus("contact.form.errMinStay", { n: data.minNights }); break;
            case "closed_arrival":
            case "closed_departure": setStatus("contact.form.errClosedDates"); break;
            case "capacity": setStatus("contact.form.errCapacity", { n: data.maxGuests }); break;
            case "rate_limited": setStatus("contact.form.errRateLimited", { waText: whatsappText(payload) }); break;
            case "invalid":
              markInvalid(field(SERVER_FIELD_INPUTS[data.field]), SERVER_FIELD_MESSAGES[data.field] || "contact.form.errInvalid");
              break;
            default: setStatus("contact.form.bookError", { waText: whatsappText(payload) });
          }
        })
        .catch(() => setStatus("contact.form.bookError", { waText: whatsappText(payload) }))
        .finally(() => setBusy(false));
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
