/* ==========================================================================
   MEXICO LUXE STAYS — shared behaviors
   Header state, mobile nav, hero entrance, scroll reveal, featured carousel,
   testimonials, villa filtering, FAQ accordion, contact form.
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    /* Per-row photo carousel (prev/next + dots) — same delegated pattern as the
       main villa grid above, so rows keep working after a language re-render. */
    destinationGrid.addEventListener("click", (e) => {
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

  /* ---------- Map pin click target: every brand-pin marker on the site opens
     Google Maps in a new tab, rather than an in-page popup. Coordinates are
     rounded to ~100m before building the link (and the exact-address
     googleMapsUrl data field is ignored) so guests only ever see the
     approximate zone, not the exact villa address, before booking. ---------- */
  function mlsGoogleMapsUrl(villa) {
    const approxLat = Math.round(villa.lat * 1000) / 1000;
    const approxLng = Math.round(villa.lng * 1000) / 1000;
    return `https://www.google.com/maps/search/?api=1&query=${approxLat},${approxLng}`;
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

    function mlsBrandPinIcon() {
      return L.divIcon({
        className: "mls-map-pin",
        html: '<span class="mls-map-pin-dot"><img src="assets/img/brand/icon-positive.png" alt="" width="16" height="13" loading="lazy"></span>',
        iconSize: [44, 62],
        iconAnchor: [22, 60],
        popupAnchor: [0, -56]
      });
    }

    function renderMapMarkers() {
      if (!leafletMap) return;
      mapMarkers.forEach((m) => m.remove());
      mapMarkers = mapVillas.map((villa) => {
        const marker = L.marker([villa.lat, villa.lng], { icon: mlsBrandPinIcon(), title: villa.name })
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

      function propertyPinIcon(isCurrent) {
        return L.divIcon({
          className: "mls-map-pin",
          html: `<span class="mls-map-pin-dot${isCurrent ? " mls-map-pin-dot--current" : ""}"><img src="../assets/img/brand/icon-positive.png" alt="" width="16" height="13" loading="lazy"></span>`,
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
          const marker = L.marker([v.lat, v.lng], { icon: propertyPinIcon(isCurrent), title: v.name }).addTo(map);
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
            const cat = mlsAmenityCategory(a.en);
            (groups[cat] = groups[cat] || []).push(a);
          });
          const activeCategories = MLS_AMENITY_CATEGORY_ORDER.filter((cat) => groups[cat] && groups[cat].length);
          const amenityRowHtml = (item) =>
            `<li><span class="sa-amenity-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${mlsAmenityIcon(item.en)}</svg></span><span>${pick(item)}</span></li>`;
          const villaImgPath = "../" + villa.image;

          const amenitiesModalHtml = `
            <h2 class="sa-modal-title">${t("detail.amenities.title")}</h2>
            <p class="sa-modal-intro">${t("detail.sa.amenities.intro")}</p>
            <div class="sa-amenities-photo"><img src="${villaImgPath}" alt="${villa.imageAlt || ""}" loading="lazy"></div>
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

          /* A couple of services depict an action (a car arriving, a massage
             in progress) that no real-estate photo of the villa itself could
             show — those two use a shared illustrative photo instead of
             villa-specific ones; everything else still uses this villa's
             own photography. */
          const SA_SHARED_IMAGES = {
            transfer: "../assets/img/services/transfer-suv.webp",
            spa: "../assets/img/services/spa-massage.webp"
          };
          const serviceImg = (id) => SA_SHARED_IMAGES[id] || (villa.serviceImages && villa.serviceImages[id]) || villaImgPath;
          const serviceImgPos = (id) => (villa.serviceImagePositions && villa.serviceImagePositions[id]) || "";
          const serviceItemHtml = (id) => {
            const title = t("services." + id + ".title");
            const pos = serviceImgPos(id);
            return `<div class="sa-item">
              <div class="sa-item-photo"><img src="${serviceImg(id)}" alt="${title}" loading="lazy"${pos ? ` style="object-position:${pos}"` : ""}></div>
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

          /* Card visual: a large rounded photo with a smaller detail shot
             floating over its top-left corner, a category badge floating
             top-right, an arrow button straddling the bottom edge, and a
             small caption chip overlapping the photo — the layered,
             floating-element composition from the reference layout,
             reapplied to three peer cards instead of one hero. */
          const SA_BADGE_ICON = {
            included: '<circle cx="12" cy="12" r="9"/><path d="M8.3 12.4l2.3 2.3L16 9.2"/>',
            extra: '<path d="M12 3h6a2 2 0 0 1 2 2v6L11 20l-8-8L12 3z"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/>',
            amenities: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 3z"/>'
          };
          const cardHtml = (key, mainImg, mainImgPos, thumbImg, chipImg, chipText, title, desc) => `
            <button type="button" class="sa-card" data-sa-open="${key}">
              <span class="sa-card-frame">
                <span class="sa-card-badge-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${SA_BADGE_ICON[key]}</svg></span>
                <span class="sa-card-thumb-float"><img src="${thumbImg}" alt="" loading="lazy"></span>
                <span class="sa-card-photo-clip"><img src="${mainImg}" alt="" loading="lazy"${mainImgPos ? ` style="object-position:${mainImgPos}"` : ""}></span>
                <span class="sa-card-chip"><img src="${chipImg}" alt="" loading="lazy"><span>${chipText}</span></span>
                <span class="sa-card-arrow-btn" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </span>
              <span class="sa-card-body">
                <span class="sa-card-title">${title}</span>
                <span class="sa-card-desc">${desc}</span>
                <span class="sa-card-cta">${t("detail.sa.viewCta")}<span class="sa-card-cta-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></span>
              </span>
            </button>`;

          const galleryImg = (i) => villa.gallery?.[0]?.images?.[i]?.src || villaImgPath;
          const includedImgs = includedIds.map(serviceImg);
          const extraImgs = extraIds.map(serviceImg);
          const fallback = (arr, i) => arr[i] || arr[0] || villaImgPath;

          saCardsEl.innerHTML =
            cardHtml(
              "included", fallback(includedImgs, 0), serviceImgPos(includedIds[0]), fallback(includedImgs, 1), fallback(includedImgs, 2),
              t("detail.sa.included.teaser"), t("detail.services.included"), t("detail.sa.included.intro")
            ) +
            cardHtml(
              "extra", fallback(extraImgs, 0), serviceImgPos(extraIds[0]), fallback(extraImgs, 1), fallback(extraImgs, 2),
              t("detail.sa.extra.teaser"), t("detail.services.extra"), t("detail.sa.extra.intro")
            ) +
            cardHtml(
              "amenities", villaImgPath, "", galleryImg(0), galleryImg(1),
              t("detail.sa.amenities.teaser"), t("detail.amenities.title"), t("detail.sa.amenities.intro")
            );
        }

        /* Guest testimonials: rendered from villa.testimonials (see the
           HOSTAWAY INTEGRATION POINT note at the top of villas-data.js —
           swap this array for the Hostaway Reviews API once it's live). */
        const testimonialsEl = detailRoot.querySelector("[data-villa-testimonials]");
        if (testimonialsEl && villa.testimonials && villa.testimonials.length) {
          const starsHtml = (rating) =>
            Array.from({ length: 5 }, (_, i) => `<svg class="star${i < rating ? " is-filled" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z"/></svg>`).join("");
          const quoteHtml = (r) => `<blockquote class="testimonial-quote-block">
                <div class="testimonial-rating" role="img" aria-label="${r.rating} out of 5 stars">${starsHtml(r.rating)}</div>
                <p class="testimonial-quote">${pick(r.quote)}</p>
                <footer class="testimonial-attr">
                  <div class="name">${r.name}</div>
                  <div class="villa">${pick(r.context)}</div>
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
          testimonialsEl.innerHTML = `${slidesHtml}<div class="testimonial-dots" role="tablist" aria-label="${t("detail.testimonials.chooseLabel")}">${dotsHtml}</div>`;
          initTestimonialRotator(testimonialsEl);
        }

        /* FAQ showcase: hover (or focus, or tap) a question to preview its
           answer on the right — same interaction as the gallery showcase,
           but the "photo" is text. Questions/answers are villa-specific. */
        const faqShowcase = detailRoot.querySelector("[data-faq-showcase]");
        if (faqShowcase && villa.faqs && villa.faqs.length) {
          const faqList = faqShowcase.querySelector("[data-faq-list]");
          const faqAnswerEl = faqShowcase.querySelector("[data-faq-answer]");
          const faqs = villa.faqs;

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
              return `
              <button type="button" class="villa-gallery-tile" data-slot="${positions[i]}" data-cat-index="${i}" aria-haspopup="dialog">
                <img src="${cover.src}" alt="${cover.alt}" loading="${i === 0 ? "eager" : "lazy"}">
                <span class="villa-gallery-tile-scrim" aria-hidden="true"></span>
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
              if (typeof mlsOpenLightbox === "function") {
                mlsOpenLightbox(categories[i].images.map(pickImg));
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
      const closeSaModal = () => {
        if (!saModal || saModal.hidden) return;
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
         calendar look as the contact page's date pickers.
         HOSTAWAY INTEGRATION POINT (via Vercel): swap
         villa.priceFromPerNight for a live quote once dates + guests are
         picked here. */
      const priceBox = detailRoot.querySelector("[data-price-box]");
      if (priceBox) {
        const priceEl = priceBox.querySelector("[data-price-amount]");
        const priceFromEl = priceBox.querySelector(".villa-price-from");
        const priceUnitEl = priceBox.querySelector(".villa-price-unit");
        if (priceEl) priceEl.textContent = `$${villa.priceFromPerNight.toLocaleString("en-US")}`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        const lang = () => (typeof window.mlsCurrentLang === "function" ? window.mlsCurrentLang() : "en");
        const locale = () => (lang() === "es" ? "es-MX" : "en-US");

        /* Live estimate: nightly rate steps up by guest-count tier (see
           TIER_RATE_MULTIPLIERS below) and, once both dates are picked,
           the display switches from a per-night rate to the stay's total.
           Placeholder math — see HOSTAWAY INTEGRATION POINT above — but
           wired end-to-end so swapping in a real quote later is a one-line
           change in updatePriceDisplay. */
        let selectedCheckin = null;
        let selectedCheckout = null;
        let updatePriceDisplay = () => {};

        priceBox.querySelectorAll("[data-price-date-field]").forEach((fieldEl) => {
          const trigger = fieldEl.querySelector("[data-price-date-trigger]");
          const textEl = fieldEl.querySelector("[data-price-date-text]");
          const panel = fieldEl.querySelector("[data-price-calendar]");
          const monthEl = panel.querySelector("[data-price-cal-month]");
          const weekdaysEl = panel.querySelector("[data-price-cal-weekdays]");
          const daysEl = panel.querySelector("[data-price-cal-days]");
          const prevBtn = panel.querySelector("[data-price-cal-prev]");
          const nextBtn = panel.querySelector("[data-price-cal-next]");
          let selected = null;
          const blockedRanges = villa.availability?.blockedRanges || [];

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
              const isBlocked = mlsDateIsBlocked(mlsDateStr(cellDate), blockedRanges);
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "trip-calendar-day";
              btn.textContent = d;
              if (cellDate < today || isBlocked) btn.disabled = true;
              if (isBlocked) btn.classList.add("is-unavailable");
              if (sameDay(cellDate, today)) btn.classList.add("is-today");
              if (sameDay(cellDate, selected)) btn.classList.add("is-selected");
              btn.addEventListener("click", () => selectDate(cellDate));
              daysEl.appendChild(btn);
            }
            prevBtn.disabled = calendarMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
          };

          const selectDate = (date) => {
            selected = date;
            textEl.textContent = date.toLocaleDateString(locale(), { month: "short", day: "numeric" });
            fieldEl.classList.add("has-value");
            if (fieldEl.dataset.priceDateField === "checkin") selectedCheckin = date;
            else selectedCheckout = date;
            updatePriceDisplay();
            close();
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
        });

        document.addEventListener("click", (e) => {
          if (priceBox.contains(e.target)) return;
          priceBox.querySelectorAll("[data-price-calendar]").forEach((p) => { p.hidden = true; });
          priceBox.querySelectorAll("[data-price-date-trigger]").forEach((b) => b.setAttribute("aria-expanded", "false"));
        });

        /* Tiered-by-occupancy indicator: split the villa's real guest cap
           into three ascending bands and highlight whichever band the
           guests stepper currently lands in. TIER_RATE_MULTIPLIERS below
           turns that band into an actual rate step-up — placeholder
           percentages (see HOSTAWAY INTEGRATION POINT above) until real
           per-occupancy pricing is wired in, at which point they're
           replaced by whatever the API quotes for that band. */
        const tierEls = Array.from(priceBox.querySelectorAll("[data-price-tier]"));
        const tierRangesEl = priceBox.querySelector("[data-price-tiers-ranges]");
        const tierBounds = (() => {
          const max = villa.guests;
          const step = Math.ceil(max / 3);
          const b1 = Math.min(step, max);
          const b2 = Math.min(step * 2, max);
          const b3min = Math.min(b2 + 1, max);
          return [
            { min: 1, max: b1 },
            { min: Math.min(b1 + 1, max), max: b2 },
            { min: b3min, max },
          ];
        })();
        if (tierRangesEl) {
          tierRangesEl.innerHTML = tierBounds
            .map((b) => `<span>${b.min >= b.max ? b.max : `${b.min}–${b.max}`}</span>`)
            .join("");
        }
        const tierRangeEls = tierRangesEl ? Array.from(tierRangesEl.children) : [];
        const TIER_RATE_MULTIPLIERS = [1, 1.15, 1.3];
        const activeTierIndex = (guestCount) => {
          const i = tierBounds.findIndex((b) => guestCount >= b.min && guestCount <= b.max);
          return i === -1 ? 0 : i;
        };
        const updateTiers = (guestCount) => {
          const activeIndex = activeTierIndex(guestCount);
          tierEls.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
          tierRangeEls.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
        };

        const guestsValueEl = priceBox.querySelector("[data-price-guests-value]");
        const guestsDecBtn = priceBox.querySelector("[data-price-guests-dec]");
        const guestsIncBtn = priceBox.querySelector("[data-price-guests-inc]");
        let guests = 1;

        updatePriceDisplay = () => {
          if (!priceEl) return;
          const nightlyRate = villa.priceFromPerNight * TIER_RATE_MULTIPLIERS[activeTierIndex(guests)];
          const oneDay = 24 * 60 * 60 * 1000;
          const nights = selectedCheckin && selectedCheckout && selectedCheckout > selectedCheckin
            ? Math.round((selectedCheckout - selectedCheckin) / oneDay)
            : 0;

          if (nights > 0) {
            priceEl.textContent = `$${Math.round(nightlyRate * nights).toLocaleString("en-US")}`;
            if (priceFromEl) { priceFromEl.setAttribute("data-i18n", "detail.book.total"); priceFromEl.textContent = t("detail.book.total"); }
            if (priceUnitEl) { priceUnitEl.setAttribute("data-i18n", "detail.book.totalNights"); priceUnitEl.textContent = t("detail.book.totalNights").replace("{n}", nights); }
          } else {
            priceEl.textContent = `$${Math.round(nightlyRate).toLocaleString("en-US")}`;
            if (priceFromEl) { priceFromEl.setAttribute("data-i18n", "detail.book.from"); priceFromEl.textContent = t("detail.book.from"); }
            if (priceUnitEl) { priceUnitEl.setAttribute("data-i18n", "detail.book.perNight"); priceUnitEl.textContent = t("detail.book.perNight"); }
          }
        };

        const updateGuests = () => {
          if (guestsValueEl) guestsValueEl.textContent = guests;
          if (guestsDecBtn) guestsDecBtn.disabled = guests <= 1;
          if (guestsIncBtn) guestsIncBtn.disabled = guests >= villa.guests;
          updateTiers(guests);
          updatePriceDisplay();
        };
        guestsDecBtn?.addEventListener("click", () => { guests = Math.max(1, guests - 1); updateGuests(); });
        guestsIncBtn?.addEventListener("click", () => { guests = Math.min(villa.guests, guests + 1); updateGuests(); });
        updateGuests();
      }

      renderVillaDetail();
    }
  }

  /* ---------- Re-render dynamic (data-driven) content once live Hostaway
     data lands (see hostaway-sync.js) — same render calls as a language
     change, since both mean "MLS_VILLAS data changed, redraw." ---------- */
  document.addEventListener("mls:livedata", () => {
    renderFeaturedShowcase && renderFeaturedShowcase();
    renderVillaGrid && renderVillaGrid();
    renderDestinationGrid && renderDestinationGrid();
    renderVillaDetail && renderVillaDetail();
    renderTripShowcase && renderTripShowcase();
    updateTripCapacityNotice && updateTripCapacityNotice();
  });

  /* ---------- Re-render dynamic (data-driven) content when the language toggles ---------- */
  document.addEventListener("mls:languagechange", () => {
    renderFeaturedShowcase && renderFeaturedShowcase();
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

      const api = { key, fieldEl, trigger, textEl, defaultLabel, hiddenInput, selected: null, minDate: today, viewDate: new Date(today) };

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
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "trip-calendar-day";
          btn.textContent = d;
          if (cellDate < api.minDate) btn.disabled = true;
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
          api.textEl.textContent = api.defaultLabel;
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

    renderTripShowcase = () => {
      const villa = typeof MLS_VILLAS !== "undefined"
        ? MLS_VILLAS.find((v) => v.slug === villaValueInput.value)
        : null;
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
      if (priceValueEl) {
        priceValueEl.textContent = villa
          ? `$${villa.priceFromPerNight.toLocaleString("en-US")}`
          : "—";
      }
      applyVillaShowcase(villa, { resetImages: true });
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

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const intent = e.submitter?.dataset.tripIntent || "inquire";
      const f = new FormData(contactForm);
      const selectedVillaOption = villaOptions.find((o) => o.dataset.value === f.get("villa"));
      const lines = [
        intent === "book"
          ? `Hello Mexico Luxe Stays — I'd like to book a stay.`
          : `Hello Mexico Luxe Stays — I'd like more information about a stay.`,
        f.get("villa") ? `Villa of interest: ${selectedVillaOption?.textContent.trim()}` : "",
        f.get("checkin") || f.get("checkout") ? `Dates: ${f.get("checkin") || "?"} to ${f.get("checkout") || "?"}` : "",
        f.get("bedrooms") ? `Bedrooms: ${f.get("bedrooms")}` : "",
        f.get("adults") ? `Adults: ${f.get("adults")}` : "",
        f.get("children") ? `Children (2–12): ${f.get("children")}` : "",
        f.get("infants") ? `Infants (under 2): ${f.get("infants")}` : ""
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
