/* Maison d'Mist — accessible static-language navigation. */
(function () {
  "use strict";

  function start() {
    var root = document.querySelector(".language-select");
    if (!root || root.dataset.ready === "true") return;
    root.dataset.ready = "true";

    var current = root.querySelector("#language-current");
    var menu = root.querySelector("#language-menu");
    var options = Array.prototype.slice.call(menu.querySelectorAll("[data-lang]"));

    function close(restoreFocus) {
      menu.hidden = true;
      current.setAttribute("aria-expanded", "false");
      if (restoreFocus) current.focus();
    }

    function open(focusIndex) {
      menu.hidden = false;
      current.setAttribute("aria-expanded", "true");
      var selected = menu.querySelector('[aria-current="page"]') || options[0];
      var index = typeof focusIndex === "number" ? focusIndex : options.indexOf(selected);
      if (options[index]) options[index].focus();
    }

    current.addEventListener("click", function () {
      if (menu.hidden) open(); else close(false);
    });

    current.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        open();
      }
    });

    menu.addEventListener("keydown", function (event) {
      var index = options.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        var next = (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        options[next].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        options[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        options[options.length - 1].focus();
      }
    });

    options.forEach(function (option) {
      option.addEventListener("click", function (event) {
        if (option.getAttribute("aria-current") === "page") {
          event.preventDefault();
          close(true);
        } else {
          close(false);
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) close(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.hidden) close(true);
    });

    root.addEventListener("focusout", function (event) {
      if (event.relatedTarget && !root.contains(event.relatedTarget)) close(false);
    });
  }

  window.MDM_Languages = { start: start };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
