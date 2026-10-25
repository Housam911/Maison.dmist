/* Maison d'Mist — supplied video playback and localized ingredient details. */
(function () {
  "use strict";

  var html = document.documentElement;
  var LANG_KEY = html.getAttribute("lang") || "en";
  var LANG = LANG_KEY.indexOf("ar") === 0 ? "ar" : (LANG_KEY.indexOf("fr") === 0 ? "fr" : "en");
  var PRODUCTS = window.MDM_PRODUCTS || [];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var T = {
    en: { play: "Play", pause: "Pause", unavailable: "Video unavailable offline.", notesTitle: "Inside the formula", notesBody: "Hover or tap an ingredient to discover its role." },
    fr: { play: "Lire", pause: "Pause", unavailable: "Vidéo indisponible hors ligne.", notesTitle: "Dans la formule", notesBody: "Survolez ou touchez un ingrédient pour découvrir son rôle." },
    ar: { play: "تشغيل", pause: "إيقاف", unavailable: "الفيديو غير متاح دون اتصال.", notesTitle: "داخل التركيبة", notesBody: "مرّر أو اضغط على أي مكوّن لاكتشاف دوره." }
  }[LANG];

  var ICONS = {
    "Rose Water": '<svg viewBox="0 0 24 24"><path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z"/><path d="M9 15.5c.6 1.5 1.7 2.2 3.4 2.2"/></svg>',
    "Shea Butter": '<svg viewBox="0 0 24 24"><path d="M5 15.5h14v4H5zM7 11.5h10v4H7zM9 7.5h6v4H9zM12 7.5v-3M10 4.5h4"/></svg>',
    "Rose Oil": '<svg viewBox="0 0 24 24"><circle cx="12" cy="11" r="2.2"/><path d="M12 8.8c-4-4-8 .5-4 2.5-5 1-3 7 1 5 .5 5 7 4 7 0 5 1 6-5 1-5 1-4-3-6-5-2.5ZM12 18.5v3M10 21.5h4"/></svg>',
    "Coconut Oil": '<svg viewBox="0 0 24 24"><path d="M4 11a8 8 0 0 0 16 0Z"/><path d="M6 11a6 6 0 0 0 12 0M9 7.5 7 4M12 7V3M15 7.5 17 4"/></svg>',
    "Sweet Almond Oil": '<svg viewBox="0 0 24 24"><path d="M12 2.5C6 7 6 14 12 21.5 18 14 18 7 12 2.5Z"/><path d="M12 6v11M12 10l-2-2M12 14l2-2"/></svg>',
    "Glycerin": '<svg viewBox="0 0 24 24"><path d="M9 3S5 8 5 11a4 4 0 0 0 8 0C13 8 9 3 9 3Z"/><path d="M16 10s-4 5-4 8a4 4 0 0 0 8 0c0-3-4-8-4-8Z"/></svg>',
    "Panthenol": '<svg viewBox="0 0 24 24"><circle cx="7" cy="8" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="13" cy="17" r="3"/><path d="m9.5 7.7 4.5-.4M8.5 10.5l3 4M15.5 9.5l-1.5 4.5"/></svg>',
    "Beeswax": '<svg viewBox="0 0 24 24"><path d="m12 2.5 8 4.5v9l-8 4.5L4 16V7Z"/><path d="m12 7 4 2.3v4.5L12 16l-4-2.2V9.3ZM4 7l8 4.5L20 7M12 11.5v9"/></svg>',
    "Cocoa Butter": '<svg viewBox="0 0 24 24"><path d="M16.5 3.5c-8-2-13 7-9 13 4 6 14 2 13-5-.5-4-1-6-4-8Z"/><path d="M15 5c-4 3-6 7-5 12M17 7c-3 2-5 5-5 8M11 4.5c-2 3-4 7-3 12"/></svg>'
  };

  function renderIcons() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-icon]"), function (el) {
      var name = el.getAttribute("data-icon");
      if (ICONS[name]) el.innerHTML = ICONS[name];
    });
  }

  function initIngredients() {
    Array.prototype.forEach.call(document.querySelectorAll(".ingredient-detail"), function (panel) {
      panel.querySelector("strong").textContent = T.notesTitle;
      panel.querySelector("p").textContent = T.notesBody;
    });

    function reset(button) {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      button.classList.remove("is-active");
      button.setAttribute("aria-expanded", "false");
      if (panel) {
        panel.querySelector("strong").textContent = T.notesTitle;
        panel.querySelector("p").textContent = T.notesBody;
      }
    }

    function show(button) {
      var card = button.closest("[data-product-id]");
      var product = PRODUCTS.find(function (p) { return p.id === card.dataset.productId; });
      if (!product) return;
      var item = product.ingredients[Number(button.dataset.ingredientIndex)];
      if (!item) return;
      var localized = item[LANG] || item.en;
      card.querySelectorAll(".ingredient").forEach(function (other) {
        if (other !== button) {
          other.classList.remove("is-active");
          other.setAttribute("aria-expanded", "false");
        }
      });
      button.classList.add("is-active");
      button.setAttribute("aria-expanded", "true");
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (panel) {
        panel.querySelector("strong").textContent = localized.name;
        panel.querySelector("p").textContent = localized.detail;
      }
    }

    Array.prototype.forEach.call(document.querySelectorAll(".ingredient"), function (button) {
      button.addEventListener("pointerenter", function () { show(button); });
      button.addEventListener("focus", function () { show(button); });
      button.addEventListener("click", function () {
        if (button.classList.contains("is-active")) reset(button); else show(button);
      });
      button.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          reset(button);
          button.focus();
        }
      });
    });
  }

  function showError(video) {
    console.log('SHOW ERROR CALLED');
    var stage = video.closest("[data-media-stage]");
    if (!stage || stage.dataset.failed === "true") return;
    stage.dataset.failed = "true";
    var image = document.createElement("img");
    image.className = "product-poster";
    image.src = video.poster;
    image.alt = video.getAttribute("aria-label") || "";
    video.replaceWith(image);
    stage.classList.add("is-media-error");
    var button = stage.querySelector("[data-media-play]");
    if (button) button.hidden = true;
    var message = stage.querySelector(".media-error");
    if (message) {
      message.textContent = T.unavailable;
      message.hidden = false;
    }
  }

  function initOneVideo(video) {
    console.log('INIT VIDEO', !!video.closest("[data-media-stage]"), !!video.closest("[data-media-stage]").querySelector("[data-media-play]"));
    var stage = video.closest("[data-media-stage]");
    var button = stage.querySelector("[data-media-play]");
    var observer;

    function sync() {
      var playing = !video.paused && !video.ended;
      stage.classList.toggle("is-playing", playing);
      if (button) {
        button.setAttribute("aria-pressed", String(playing));
        button.textContent = playing ? T.pause : T.play;
        button.setAttribute("aria-label", playing ? T.pause : T.play);
      }
    }

    function play() {
      console.log('PLAY CALLED', video.currentSrc, stage.dataset.failed);
      if (stage.dataset.failed === "true") return;
      try {
        var request = video.play();
        if (request && request.catch) {
          request.catch(function (error) {
            console.log('MEDIA PLAY ERROR', error && error.name, error && error.message);
            if (error && error.name === "AbortError") { sync(); return; }
            showError(video);
          });
        }
      } catch (error) {
        showError(video);
      }
    }

    function toggle() {
      if (video.paused || video.ended) play(); else video.pause();
    }

    if (button) button.addEventListener("click", function () { console.log('BUTTON CLICK'); toggle(); });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    video.addEventListener("ended", function () {
      video.pause();
      video.currentTime = 0;
      sync();
    });
    stage.addEventListener("error", function (event) {
      if (event.target === video || event.target.tagName === "SOURCE") showError(video);
    }, true);
    Array.prototype.forEach.call(video.querySelectorAll("source"), function (source) {
      source.addEventListener("error", function () { showError(video); }, true);
    });
    stage.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "mouse" && !reduced.matches) play();
    });
    stage.addEventListener("pointerleave", function () { video.pause(); });

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) video.pause();
        });
      }, { threshold: 0 });
      observer.observe(stage);
    }

    function motionChanged() {
      if (reduced.matches) {
        video.pause();
        video.currentTime = 0;
        sync();
      }
    }
    if (reduced.addEventListener) reduced.addEventListener("change", motionChanged);
    else if (reduced.addListener) reduced.addListener(motionChanged);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) video.pause();
    });
    sync();
  }

  function start() {
    renderIcons();
    initIngredients();
    Array.prototype.forEach.call(document.querySelectorAll("video[data-product-video]"), initOneVideo);
  }

  window.MDM_Media = { start: start };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
