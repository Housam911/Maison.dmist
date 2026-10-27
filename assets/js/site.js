/* Maison d'Mist — site behaviour.
   No framework, no build step, no network calls. The page reads
   data/site.js and data/products.js, which are the only files you edit
   to change contact details or the collection. */

(function () {
  "use strict";

  var html = document.documentElement;
  var LANG_KEY = html.getAttribute("lang") || "en";
  var LANG = LANG_KEY.indexOf("ar") === 0 ? "ar" : (LANG_KEY.indexOf("fr") === 0 ? "fr" : "en");
  var ROOT = html.getAttribute("data-root") || ".";
  var SITE = window.MDM_SITE || {};
  var PRODUCTS = window.MDM_PRODUCTS || [];

  var T = {
    en: {
      comingSoon: "Coming soon",
      all: "All",
      filterLabel: "Show products by category",
      play: "Play",
      soldOut: "Sold out",
      order: "Order on WhatsApp",
      orderGeneral: "Order on WhatsApp",
      noProducts: "The collection is being prepared. Follow us to see it first.",
      waMessage: function (p) { return "Hello Maison d'Mist, I would like to order " + p.name + (p.size ? " (" + p.size + ")" : "") + "."; },
      waGeneral: "Hello Maison d'Mist, I would like to ask about your mists.",
      whatsappTitle: "WhatsApp",
      whatsappBlurb: "The quickest way to order or ask a question.",
      instagramTitle: "Instagram",
      instagramBlurb: "New scents, photos and restocks.",
      emailTitle: "Email",
      emailBlurb: "For wholesale, gifting and anything longer.",
      phoneTitle: "Phone",
      pending: "Our phone number and social accounts are being set up and will appear here shortly.",
      visit: "Open",
      follow: "Follow"
    },
    ar: {
      comingSoon: "قريبًا",
      all: "الكل",
      filterLabel: "عرض المنتجات حسب الفئة",
      play: "تشغيل",
      soldOut: "نفدت الكمية",
      order: "الطلب عبر واتساب",
      orderGeneral: "الطلب عبر واتساب",
      noProducts: "المجموعة قيد التحضير. تابعونا لتكونوا أول من يراها.",
      waMessage: function (p) { return "مرحبًا Maison d'Mist، أرغب بطلب " + p.name + (p.size ? " (" + p.size + ")" : "") + "."; },
      waGeneral: "مرحبًا Maison d'Mist، أود الاستفسار عن منتجاتكم.",
      whatsappTitle: "واتساب",
      whatsappBlurb: "أسرع طريقة للطلب أو السؤال.",
      instagramTitle: "إنستغرام",
      instagramBlurb: "العطور الجديدة والصور وتجديد الكميات.",
      emailTitle: "البريد الإلكتروني",
      emailBlurb: "للجملة والهدايا وكل ما يحتاج تفصيلًا.",
      phoneTitle: "الهاتف",
      pending: "رقم الهاتف وحسابات التواصل قيد الإعداد وستظهر هنا قريبًا.",
      visit: "فتح",
      follow: "متابعة"
    },
    fr: {
      comingSoon: "Bientôt",
      all: "Tout",
      filterLabel: "Afficher les produits par catégorie",
      play: "Lire",
      soldOut: "Épuisé",
      order: "Commander sur WhatsApp",
      orderGeneral: "Commander sur WhatsApp",
      noProducts: "La collection est en préparation. Suivez-nous pour la découvrir en avant-première.",
      waMessage: function (p) { return "Bonjour Maison d'Mist, je souhaite commander " + p.name + (p.size ? " (" + p.size + ")" : "") + "."; },
      waGeneral: "Bonjour Maison d'Mist, j’aimerais poser une question sur vos soins.",
      whatsappTitle: "WhatsApp",
      whatsappBlurb: "Le moyen le plus rapide de commander ou de poser une question.",
      instagramTitle: "Instagram",
      instagramBlurb: "Nouveaux soins, photos et retours en stock.",
      emailTitle: "E-mail",
      emailBlurb: "Pour les commandes professionnelles, les cadeaux et les messages détaillés.",
      phoneTitle: "Téléphone",
      pending: "Nos coordonnées seront bientôt disponibles.",
      visit: "Ouvrir",
      follow: "Suivre"
    }
  }[LANG];

  /* Icons are drawn with DOM calls from these constant descriptions. */
  var ICONS = {
    "whatsapp": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" }]]],
    "instagram": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["rect", { x: "2.4", y: "2.4", width: "19.2", height: "19.2", rx: "5.4", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }], ["circle", { cx: "12", cy: "12", r: "4.3", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }], ["circle", { cx: "17.4", cy: "6.6", r: "1.25" }]]],
    "tiktok": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" }]]],
    "facebook": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }]]],
    "telegram": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" }]]],
    "email": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5v-13zm2.6.5 7.4 5.7L19.4 6H4.6z" }]]],
    "phone": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.6a1 1 0 0 1-.25 1l-2.22 2.2z" }]]]
  };

  var LABELS = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", telegram: "Telegram" };

  var PLACEHOLDER =
    ["svg", { viewBox: "0 0 120 150", "aria-hidden": "true", focusable: "false" }, [["g", { fill: "none", stroke: "#8f8d60", "stroke-width": "1.6", "stroke-linecap": "round" }, [["path", { d: "M48 34h24v8c0 4 6 8 6 16v62a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8V58c0-8 6-12 6-16z" }], ["path", { d: "M52 22h16v12H52z" }], ["path", { d: "M60 66v34M50 78h20" }]]], ["g", { fill: "#8f8d60", opacity: ".55" }, [["circle", { cx: "86", cy: "26", r: "2.4" }], ["circle", { cx: "95", cy: "38", r: "1.8" }], ["circle", { cx: "90", cy: "52", r: "1.3" }]]]]];

  var DOM = window.MDM_DOM;
  var el = DOM.el;
  function icon(name) { return DOM.draw(ICONS[name]); }

  function digits(s) { return String(s || "").replace(/[^0-9]/g, ""); }
  function has(key) { return !!String(SITE[key] || "").trim(); }
  function waLink(text) {
    var n = digits(SITE.whatsapp);
    return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(text) : "";
  }
  var SOCIAL_BASE = {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/@",
    facebook: "https://facebook.com/",
    telegram: "https://t.me/"
  };
  function socialUrl(key) {
    var v = String(SITE[key] || "").trim().replace(/^@/, "");
    if (!v || !DOM.own(SOCIAL_BASE, key)) return "";
    // A full address is used only when it is https; a handle is appended.
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return /^https:\/\//i.test(v) ? v : "";
    return SOCIAL_BASE[key] + encodeURIComponent(v);
  }
  function external(attrs) {
    attrs.target = "_blank";
    attrs.rel = "noopener";
    return attrs;
  }

  /* ---------- Collection ---------- */

  function productCard(p) {
    var t = p[LANG] || p.en || {};
    var name = t.name || "";
    var badge = null;
    if (p.status === "coming-soon") badge = el("span", { "class": "badge" }, T.comingSoon);
    if (p.status === "sold-out") badge = el("span", { "class": "badge badge--muted" }, T.soldOut);

    var media;
    if (p.video && p.video.webm) {
      var video = el("video", {
        "data-product-video": true, muted: true, playsinline: true, preload: "none",
        width: p.video.width, height: p.video.height,
        poster: ROOT + "/" + (p.poster || p.image), "aria-label": name
      }, [
        el("source", { src: ROOT + "/" + p.video.webm, type: "video/webm" }),
        el("source", { src: ROOT + "/" + p.video.mp4, type: "video/mp4" })
      ]);
      // The muted attribute alone does not mute a video made by a script.
      video.muted = true;
      video.defaultMuted = true;
      media = el("div", { "class": "product-stage", "data-media-stage": true }, [
        video,
        el("button", { "class": "media-play", type: "button", "data-media-play": true, "aria-pressed": "false", "aria-label": "Play video" }, "Play"),
        el("p", { "class": "media-error", hidden: true })
      ]);
    } else if (p.image && p.animation) {
      var bits = [];
      for (var b = 0; b < 9; b++) bits.push(el("b", null, el("i")));
      media = el("div", { "class": "anim-stage anim--" + p.animation, "data-anim-stage": true }, [
        el("img", { src: ROOT + "/" + p.image, alt: name, loading: "lazy", decoding: "async" }),
        el("span", { "class": "anim-layer", "aria-hidden": "true" }, bits),
        el("button", { "class": "media-play", type: "button", "data-anim-play": true, "aria-pressed": "false", "aria-label": T.play }, T.play)
      ]);
    } else {
      media = p.image
        ? el("img", { src: ROOT + "/" + p.image, alt: name, loading: "lazy", decoding: "async" })
        : DOM.draw(PLACEHOLDER);
    }

    var meta = null;
    if (p.price || p.size) {
      meta = el("div", { "class": "card__meta" }, [
        p.price ? el("span", { "class": "card__price" }, p.price) : el("span"),
        p.size ? el("span", { "class": "card__size" }, p.size) : null
      ]);
    }

    var ingredients = null;
    if (p.ingredients && p.ingredients.length) {
      ingredients = [
        el("div", { "class": "ingredients", "data-ingredients": true }, p.ingredients.map(function (item, index) {
          var localized = item[LANG] || item.en || {};
          return el("button", {
            "class": "ingredient", type: "button", "data-ingredient-index": index, "aria-expanded": "false",
            "aria-controls": "ingredient-detail-" + p.id, "aria-label": localized.name + ". " + localized.detail
          }, [
            el("span", { "class": "ingredient__icon", "data-icon": (item.en || {}).name, "aria-hidden": "true" }),
            el("span", { "class": "ingredient__name" }, localized.name)
          ]);
        })),
        el("div", { "class": "ingredient-detail", id: "ingredient-detail-" + p.id, "aria-live": "polite" }, [el("strong"), el("p")])
      ];
    }

    var action = null;
    if (p.status === "available") {
      var href = waLink(T.waMessage({ name: name, size: p.size }));
      if (href) {
        action = el("div", { "class": "card__action" },
          el("a", external({ "class": "btn btn--sm", href: href }), [icon("whatsapp"), el("span", null, T.order)]));
      }
    }

    return el("article", { "class": "card reveal", id: "product-" + p.id, "data-product-id": p.id, "data-category": p.category || "" }, [
      el("div", { "class": "card__media" }, [media, badge]),
      el("div", { "class": "card__body" }, [
        el("h3", { "class": "card__name" }, name),
        t.notes ? el("p", { "class": "card__notes" }, t.notes) : null,
        t.description ? el("p", { "class": "card__desc" }, t.description) : null,
        meta, ingredients, action
      ])
    ]);
  }

  /* Product list for search engines (schema.org JSON-LD): data, never run.
     MDM_DOM.jsonLd makes the element; nothing parses it as HTML. */
  function renderProductSchema(list) {
    var origin = "https://maisondmist.com";
    var canonical = document.querySelector('link[rel="canonical"]').href;
    var heading = document.querySelector("#collection h2");
    var schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": canonical + "#collection",
      "name": heading ? heading.textContent.trim() : "Collection",
      "numberOfItems": list.length,
      "itemListElement": list.map(function (p, index) {
        var localized = p[LANG] || p.en || {};
        var category = (window.MDM_CATEGORIES || []).find(function (item) { return item.id === p.category; });
        var url = canonical + "#product-" + p.id;
        var product = {
          "@type": "Product",
          "@id": url,
          "url": url,
          "name": localized.name || "",
          "description": localized.description || "",
          "image": origin + "/" + p.image,
          "category": category ? (category[LANG] || category.en) : "",
          "brand": { "@id": origin + "/#brand" }
        };
        if (p.size) product.size = p.size;
        return { "@type": "ListItem", "position": index + 1, "item": product };
      })
    };
    var old = document.getElementById("product-item-list-schema");
    if (old) old.remove();
    document.head.appendChild(DOM.jsonLd("product-item-list-schema", schema));
  }

  function renderProducts() {
    var host = document.getElementById("collection-grid");
    if (!host) return;
    var list = PRODUCTS.filter(function (p) { return p && p.status !== "hidden"; });
    DOM.fill(host, list.length
      ? list.map(productCard)
      : el("p", { "class": "empty-note" }, T.noProducts));
    renderFilters(host, list);
    renderProductSchema(list);
  }

  /* One button per category that has products, plus "All". Filtering only hides
     cards, so every product stays in the page for search engines and print. */
  function renderFilters(host, list) {
    var cats = (window.MDM_CATEGORIES || []).filter(function (c) {
      return list.some(function (p) { return p.category === c.id; });
    });
    var old = document.getElementById("collection-filters");
    if (old) old.remove();
    if (cats.length < 2) return;
    var chips = [{ id: "all", label: T.all, count: list.length }].concat(cats.map(function (c) {
      return { id: c.id, label: c[LANG] || c.en, count: list.filter(function (p) { return p.category === c.id; }).length };
    }));
    var bar = el("div", { id: "collection-filters", "class": "filters", role: "group", "aria-label": T.filterLabel },
      chips.map(function (c) {
        return el("button", { type: "button", "class": "filter", "data-filter": c.id, "aria-pressed": String(c.id === "all") },
          [c.label + " ", el("span", { "class": "filter__count" }, c.count)]);
      }));
    host.parentNode.insertBefore(bar, host);
    bar.addEventListener("click", function (e) {
      var button = e.target.closest("[data-filter]");
      if (!button) return;
      var id = button.getAttribute("data-filter");
      Array.prototype.forEach.call(bar.querySelectorAll("[data-filter]"), function (b) {
        b.setAttribute("aria-pressed", String(b === button));
      });
      Array.prototype.forEach.call(host.querySelectorAll(".card"), function (card) {
        card.hidden = id !== "all" && card.getAttribute("data-category") !== id;
        if (!card.hidden) card.classList.add("is-in");
      });
    });
  }

  /* ---------- Contact ---------- */

  function contactCard(iconName, title, blurb, value, href, isExternal) {
    var attrs = { "class": "btn btn--ghost btn--sm", href: href };
    return el("div", { "class": "contact__item reveal" }, [
      el("h3", null, title),
      blurb ? el("p", null, blurb) : null,
      el("a", isExternal ? external(attrs) : attrs, [icon(iconName), el("span", null, value)])
    ]);
  }

  function renderContact() {
    var host = document.getElementById("contact-grid");
    if (!host) return;
    var out = [];

    if (has("whatsapp")) {
      out.push(contactCard("whatsapp", T.whatsappTitle, T.whatsappBlurb,
        SITE.phone || ("+" + digits(SITE.whatsapp)), waLink(T.waGeneral), true));
    } else if (has("phone")) {
      out.push(contactCard("phone", T.phoneTitle, "", SITE.phone,
        "tel:" + digits(SITE.phone), false));
    }
    if (has("instagram") && socialUrl("instagram")) {
      out.push(contactCard("instagram", T.instagramTitle, T.instagramBlurb,
        "@" + String(SITE.instagram).replace(/^@/, ""), socialUrl("instagram"), true));
    }
    if (has("email")) {
      out.push(contactCard("email", T.emailTitle, T.emailBlurb,
        SITE.email, "mailto:" + encodeURIComponent(String(SITE.email).trim()).replace(/%40/g, "@"), false));
    }

    DOM.fill(host, out.length ? out : el("p", { "class": "notice" }, T.pending));

    var where = document.getElementById("contact-where");
    if (where) {
      var loc = SITE["location_" + LANG] || "";
      var hrs = SITE["hours_" + LANG] || "";
      var line = [loc, hrs].filter(Boolean).join(" · ");
      where.textContent = line;
      where.hidden = !line;
    }
  }

  function socialLinks() {
    var keys = ["instagram", "tiktok", "facebook", "telegram"];
    var links = keys.filter(function (k) { return has(k) && socialUrl(k); }).map(function (k) {
      return el("a", external({ href: socialUrl(k), "aria-label": LABELS[k] }), icon(k));
    });
    if (has("whatsapp")) {
      links.unshift(el("a", external({ href: waLink(T.waGeneral), "aria-label": "WhatsApp" }), icon("whatsapp")));
    }
    if (has("email")) {
      links.push(el("a", { href: "mailto:" + encodeURIComponent(String(SITE.email).trim()).replace(/%40/g, "@"), "aria-label": "Email" }, icon("email")));
    }
    return links;
  }

  function renderSocials() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-socials]"), function (node) {
      var links = socialLinks();
      if (links.length) DOM.fill(node, links);
      else node.remove();
    });
  }

  function renderOrderButtons() {
    var href = DOM.safeUrl(waLink(T.waGeneral));
    Array.prototype.forEach.call(document.querySelectorAll("[data-order-btn]"), function (node) {
      if (!href) { node.remove(); return; }
      node.setAttribute("href", href);
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener");
      DOM.fill(node, [icon("whatsapp"), el("span", null, T.orderGeneral)]);
      node.hidden = false;
    });
  }

  /* ---------- Chrome ---------- */

  function navMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { var f = nav.querySelector("a"); if (f) f.focus(); } else { toggle.focus(); }
    }
    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") || e.target.closest("[data-nav-close]")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && nav.getAttribute("data-open") === "true") setOpen(false);
    });
  }

  function stickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var tick = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
  }

  function reveal() {
    var items = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    html.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  function year() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function start() {
    renderProducts();
    renderContact();
    renderSocials();
    renderOrderButtons();
    navMenu();
    stickyHeader();
    year();
    reveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
