/* Maison d'Mist — PWA registration and localized update prompt. */
(function () {
  "use strict";

  function start() {
    if (!("serviceWorker" in navigator) || document.documentElement.dataset.pwaStarted === "true") return;
    document.documentElement.dataset.pwaStarted = "true";
    var lang = (document.documentElement.lang || "en").toLowerCase();
    var text = {
      en: { update: "A new version is ready.", reload: "Reload", wait: "Finishing playback…" },
      fr: { update: "Une nouvelle version est prête.", reload: "Recharger", wait: "Lecture en cours…" },
      ar: { update: "يوجد إصدار جديد جاهز.", reload: "إعادة التحميل", wait: "جارٍ إنهاء التشغيل…" }
    }[lang.indexOf("ar") === 0 ? "ar" : (lang.indexOf("fr") === 0 ? "fr" : "en")];

    function activate(worker) {
      var playing = Array.prototype.slice.call(document.querySelectorAll("video")).filter(function (video) {
        return !video.paused && !video.ended;
      });
      if (!playing.length) {
        worker.postMessage("SKIP_WAITING");
        navigator.serviceWorker.addEventListener("controllerchange", function () {
          window.location.reload();
        }, { once: true });
      } else {
        var button = document.querySelector(".pwa-update");
        if (button) {
          button.disabled = true;
          button.textContent = text.wait;
        }
        Promise.all(playing.map(function (video) {
          return new Promise(function (resolve) { video.addEventListener("pause", resolve, { once: true }); });
        })).then(function () { activate(worker); });
      }
    }

    function showUpdate(worker) {
      if (document.querySelector(".pwa-update")) return;
      var banner = document.createElement("aside");
      banner.className = "pwa-update";
      banner.setAttribute("role", "status");
      banner.innerHTML = "<span>" + text.update + "</span><button type=\"button\">" + text.reload + "</button>";
      banner.querySelector("button").addEventListener("click", function () { activate(worker); });
      document.body.appendChild(banner);
    }

    navigator.serviceWorker.register("/sw.js", { updateViaCache: "all" }).then(function (registration) {
      function checkWorker(worker) {
        console.log('PWA UPDATE CHECK', worker && worker.state, !!navigator.serviceWorker.controller);
        if (worker && worker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdate(registration.waiting || worker);
        }
      }
      registration.addEventListener("updatefound", function () {
        var worker = registration.installing;
        checkWorker(worker);
        if (worker) worker.addEventListener("statechange", function () { checkWorker(worker); });
      });
      if (registration.waiting) showUpdate(registration.waiting);
    }).catch(function () {});
  }

  window.MDM_PWA = { start: start };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
