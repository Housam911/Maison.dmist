/* Maison d'Mist — service worker registration and automatic updates.
   When a new release takes over (sw.js activates it at once), a page that was
   already open refreshes itself one time, so no one sees old scripts, products
   or films under a new page. It waits while a film plays (showing a short
   note in the page's language) or while the tab is in the background. */
(function () {
  "use strict";

  function start() {
    if (!("serviceWorker" in navigator) || document.documentElement.dataset.pwaStarted === "true") return;
    document.documentElement.dataset.pwaStarted = "true";
    var lang = (document.documentElement.lang || "en").toLowerCase();
    var text = {
      en: "Updating to the new version…",
      fr: "Mise à jour vers la nouvelle version…",
      ar: "جارٍ التحديث إلى الإصدار الجديد…"
    }[lang.indexOf("ar") === 0 ? "ar" : (lang.indexOf("fr") === 0 ? "fr" : "en")];

    // A first visit has nothing old on screen: the worker taking control then
    // needs no refresh. Only a page that was already controlled does.
    var hadController = !!navigator.serviceWorker.controller;
    var reloading = false;

    function playing() {
      return Array.prototype.filter.call(document.querySelectorAll("video"), function (video) {
        return !video.paused && !video.ended;
      });
    }

    function note() {
      if (document.querySelector(".pwa-update")) return;
      var aside = document.createElement("aside");
      aside.className = "pwa-update";
      aside.setAttribute("role", "status");
      aside.textContent = text;
      document.body.appendChild(aside);
    }

    function reloadWhenSafe() {
      if (reloading) return;
      var busy = playing();
      if (busy.length) {
        note();
        busy.forEach(function (video) { video.addEventListener("pause", reloadWhenSafe, { once: true }); });
        return;
      }
      if (document.hidden) {
        document.addEventListener("visibilitychange", reloadWhenSafe, { once: true });
        return;
      }
      reloading = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (hadController) reloadWhenSafe();
      hadController = true;
    });

    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then(function (registration) {
      // A tab or installed app left open looks for a release when it is
      // brought back to the front, at most every ten minutes.
      var checked = Date.now();
      document.addEventListener("visibilitychange", function () {
        if (document.hidden || Date.now() - checked < 600000) return;
        checked = Date.now();
        registration.update().catch(function () {});
      });
    }).catch(function () {});
  }

  window.MDM_PWA = { start: start };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
