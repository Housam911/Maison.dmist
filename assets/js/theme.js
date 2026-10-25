/* Maison d'Mist — System, Original Light, and Dark Luxury preferences. */
(function () {
  "use strict";

  function storedTheme() {
    try {
      var value = localStorage.getItem("mdm-theme");
      return value === "light" || value === "dark" ? value : "system";
    } catch (e) {
      return "system";
    }
  }

  function storeTheme(value) {
    try {
      if (value === "system") localStorage.removeItem("mdm-theme");
      else localStorage.setItem("mdm-theme", value);
    } catch (e) {}
  }

  function isDark(value) {
    return value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function apply(value) {
    var root = document.documentElement;
    var scheme = document.querySelector('meta[name="color-scheme"]');
    var color = document.querySelector('meta[name="theme-color"]');
    var select = document.getElementById("theme-select");
    root.dataset.theme = value;
    if (scheme) scheme.content = value === "system" ? "light dark" : value;
    if (color) color.content = isDark(value) ? "#15170f" : "#fefdf9";
    if (select) select.value = value;
  }

  function start() {
    if (document.documentElement.dataset.themeStarted === "true") return;
    document.documentElement.dataset.themeStarted = "true";
    var select = document.getElementById("theme-select");
    apply(storedTheme());
    if (select) {
      select.addEventListener("change", function () {
        var value = select.value === "light" || select.value === "dark" ? select.value : "system";
        storeTheme(value);
        apply(value);
      });
    }
    window.addEventListener("storage", function (event) {
      if (event.key === "mdm-theme" || event.key === null) apply(storedTheme());
    });
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    function followSystem() {
      if (storedTheme() === "system") apply("system");
    }
    if (media.addEventListener) media.addEventListener("change", followSystem);
    else if (media.addListener) media.addListener(followSystem);
  }

  window.MDM_Theme = { start: start };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
