/* Maison d'Mist — the only way the site's scripts put content into a page.
   Text always goes in as text, never as markup, and every link or file
   address is checked, so nothing in data/*.js (or a mistake in it) can become
   HTML or run as code. No script here uses innerHTML, document.write or eval:
   the release checks refuse them, and each page's Content-Security-Policy
   (Trusted Types) makes the browser refuse them as well. */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  // Links may leave the site; files the page loads (src, poster) may not.
  var LINK_ATTRS = { href: true, action: true, formaction: true, "xlink:href": true };
  var FILE_ATTRS = { src: true, poster: true };
  var SCHEMES = { "https:": true, "mailto:": true, "tel:": true };

  function own(map, key) { return Object.prototype.hasOwnProperty.call(map, key); }

  /* A link is kept only when it is https, mailto or tel, or a page on this
     site; a file address only when it is on this site. The browser's own URL
     parser decides, so tricks such as "java\tscript:", "//other.site" or odd
     upper case are caught; anything else is dropped. */
  function safeUrl(value, fileOnly) {
    var text = String(value == null ? "" : value);
    var url;
    try { url = new URL(text, document.baseURI); } catch (e) { return ""; }
    if (url.protocol === location.protocol && url.host === location.host) return text;
    if (!fileOnly && own(SCHEMES, url.protocol)) return text;
    return "";
  }

  function append(node, children) {
    if (children == null || children === false) return node;
    if (Array.isArray(children)) {
      children.forEach(function (child) { append(node, child); });
      return node;
    }
    node.appendChild(children instanceof Node ? children : document.createTextNode(String(children)));
    return node;
  }

  function build(node, attrs, children) {
    if (attrs) {
      Object.keys(attrs).forEach(function (name) {
        var value = attrs[name];
        var key = name.toLowerCase();
        if (value == null || value === false) return;
        if (key.indexOf("on") === 0 || key === "style" || key === "srcdoc") {
          throw new Error("safe-dom: attribute not allowed: " + name);
        }
        if (own(LINK_ATTRS, key) || own(FILE_ATTRS, key)) {
          value = safeUrl(value, own(FILE_ATTRS, key));
          if (!value) return;
        }
        node.setAttribute(name, value === true ? "" : String(value));
      });
    }
    return append(node, children);
  }

  /* el("a", { href: url, "class": "btn" }, [icon, "Order"]) */
  function el(tag, attrs, children) { return build(document.createElement(tag), attrs, children); }

  /* Draws an icon from a constant description: [tag, attrs, children]. */
  function draw(spec) {
    return build(document.createElementNS(SVG_NS, spec[0]), spec[1], (spec[2] || []).map(draw));
  }

  /* Replaces everything inside node. */
  function fill(node, children) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return append(node, children);
  }

  window.MDM_DOM = Object.freeze({ el: el, draw: draw, fill: fill, safeUrl: safeUrl, own: own });
})();
