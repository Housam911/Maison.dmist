/* Maison d'Mist v3 — the iOS edition. One page in three languages, rendered
   from the same data/products.js and data/site.js as the main site. */
(function () {
  "use strict";

  var VERSION = "0.11";
  var SITE = window.MDM_SITE || {};
  var PRODUCTS = (window.MDM_PRODUCTS || []).filter(function (p) { return p && p.status !== "hidden"; });
  var CATS = (window.MDM_CATEGORIES || []).filter(function (c) {
    return PRODUCTS.some(function (p) { return p.category === c.id; });
  });
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var html = document.documentElement;

  var LANGS = { en: "English", ar: "العربية", fr: "Français" };
  var T = {
    en: {
      skip: "Skip to the collection", tagline: "Scent. Soft skin.",
      lead: "Botanical body care made to be worn close to the skin.",
      collection: "Collection", all: "All", shop: "Shop", ritual: "Ritual", contact: "Contact",
      ritualTitle: "How to apply",
      steps: [["Start warm", "Apply to clean, dry skin. Warmth helps the texture melt in and the scent come through."],
              ["Find the right touch", "Smooth the lotion in, or let the butter melt between your palms, then apply to the shoulders, collarbone and the inside of the wrists."],
              ["Layer, don't overdo it", "A little is enough. Add more later in the day when you want the comfort and the scent back."]],
      contactTitle: "Talk to us", contactNote: "No prices online: message us and we reply with availability, price and delivery.",
      contactPending: "Our contact details are being set up.",
      whatsapp: "WhatsApp", phone: "Phone", instagram: "Instagram",
      about: "The house", aboutBody: "Maison d'Mist began with a simple wish: light, everyday body care that feels like it belongs to your skin rather than sitting on top of it.",
      done: "Done", order: "Order", soon: "Soon", comingSoon: "Coming soon", soldOut: "Sold out",
      details: "details", ingredients: "Ingredients", orderWhatsApp: "Order on WhatsApp", askInstagram: "Ask on Instagram",
      soonNote: "Coming soon. Follow us on Instagram to hear when it launches.",
      play: "Play", pause: "Pause", language: "Language", version: "Version",
      film: "Film", animation: "Animation",
      waOrder: function (name, size) { return "Hello Maison d'Mist, I would like to order " + name + (size ? " (" + size + ")" : "") + "."; },
      waGeneral: "Hello Maison d'Mist, I would like to ask about your products."
    },
    ar: {
      skip: "تخطّي إلى المجموعة", tagline: "عِطر. بشرة ناعمة.",
      lead: "عناية نباتية بالجسم تُستعمل قريبًا من البشرة.",
      collection: "المجموعة", all: "الكل", shop: "المتجر", ritual: "الطقس", contact: "تواصل",
      ritualTitle: "طريقة الاستخدام",
      steps: [["على بشرة دافئة", "يُوضع على بشرة نظيفة وجافة؛ الدفء يساعد القوام على الذوبان والعطر على الظهور."],
              ["اللمسة المناسبة", "يُدلَّك اللوشن على البشرة، أو تُذاب الزبدة بين الكفّين، ثم يُوضع على الكتفين وعظمة الترقوة وباطن المعصم."],
              ["طبقات بلا إفراط", "كمية صغيرة تكفي. ويُضاف القليل خلال اليوم عند الرغبة بعودة النعومة والعطر."]],
      contactTitle: "للتواصل معنا", contactNote: "لا أسعار على الموقع: راسلونا ونردّ بالتوفّر والسعر والتوصيل.",
      contactPending: "بيانات التواصل قيد الإعداد.",
      whatsapp: "واتساب", phone: "الهاتف", instagram: "إنستغرام",
      about: "عن الدار", aboutBody: "بدأت Maison d'Mist من رغبة بسيطة: عناية يومية خفيفة بالجسم تبدو جزءًا من البشرة لا طبقة فوقها.",
      done: "تم", order: "طلب", soon: "قريبًا", comingSoon: "قريبًا", soldOut: "نفدت الكمية",
      details: "التفاصيل", ingredients: "المكوّنات", orderWhatsApp: "الطلب عبر واتساب", askInstagram: "السؤال عبر إنستغرام",
      soonNote: "قريبًا. تابعونا على إنستغرام لمعرفة موعد الإطلاق.",
      play: "تشغيل", pause: "إيقاف", language: "اللغة", version: "الإصدار",
      film: "فيلم", animation: "حركة",
      waOrder: function (name, size) { return "مرحبًا Maison d'Mist، أرغب بطلب " + name + (size ? " (" + size + ")" : "") + "."; },
      waGeneral: "مرحبًا Maison d'Mist، أود الاستفسار عن منتجاتكم."
    },
    fr: {
      skip: "Aller à la collection", tagline: "Soin. Peau douce.",
      lead: "Des soins botaniques pour le corps, pensés pour être portés près de la peau.",
      collection: "Collection", all: "Tout", shop: "Boutique", ritual: "Rituel", contact: "Contact",
      ritualTitle: "Comment l’appliquer",
      steps: [["Commencer par la chaleur", "Appliquez le soin sur une peau propre et sèche. La chaleur aide la texture à se déployer et le parfum à se révéler."],
              ["Trouver le bon geste", "Faites pénétrer la lotion ou laissez fondre le beurre entre vos paumes, puis appliquez sur les épaules, la clavicule et l’intérieur des poignets."],
              ["Superposer sans excès", "Une petite quantité suffit. Ajoutez-en lorsque vous souhaitez retrouver le confort et le parfum au cours de la journée."]],
      contactTitle: "Nous écrire", contactNote: "Pas de prix en ligne : écrivez-nous, nous répondons avec la disponibilité, le prix et la livraison.",
      contactPending: "Nos coordonnées sont en cours de préparation.",
      whatsapp: "WhatsApp", phone: "Téléphone", instagram: "Instagram",
      about: "La maison", aboutBody: "Maison d'Mist est née d’une envie simple : des soins légers au quotidien, qui semblent appartenir à la peau plutôt que former une couche de plus.",
      done: "OK", order: "Commander", soon: "Bientôt", comingSoon: "Bientôt", soldOut: "Épuisé",
      details: "détails", ingredients: "Ingrédients", orderWhatsApp: "Commander sur WhatsApp", askInstagram: "Demander sur Instagram",
      soonNote: "Bientôt disponible. Suivez-nous sur Instagram pour connaître la date de sortie.",
      play: "Lire", pause: "Pause", language: "Langue", version: "Version",
      film: "Film", animation: "Animation",
      waOrder: function (name, size) { return "Bonjour Maison d'Mist, je souhaite commander " + name + (size ? " (" + size + ")" : "") + "."; },
      waGeneral: "Bonjour Maison d'Mist, j’aimerais en savoir plus sur vos produits."
    }
  };

  /* Icons are drawn with DOM calls from these constant descriptions. */
  var I = {
    "chev": ["svg", { class: "row__chev", viewBox: "0 0 8 13", "aria-hidden": "true" }, [["path", { d: "m1.5 1.5 5 5-5 5" }]]],
    "check": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "m5 12.5 4.5 4.5L19 7.5" }]]],
    "play": ["svg", { viewBox: "0 0 16 16", "aria-hidden": "true" }, [["path", { d: "M4 2.5v11l9.5-5.5Z" }]]],
    "pause": ["svg", { viewBox: "0 0 16 16", "aria-hidden": "true" }, [["path", { d: "M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" }]]],
    "sparkle": ["svg", { viewBox: "0 0 16 16", "aria-hidden": "true" }, [["path", { d: "M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z" }]]],
    "wa": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true", class: "icon-solid" }, [["path", { d: "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3ZM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm8.4-18.2A11.8 11.8 0 0 0 .2 11.9c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.4c6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.6-8.2Z" }]]],
    "phone": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["path", { d: "M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1Z" }]]],
    "ig": ["svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [["rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "5" }], ["circle", { cx: "12", cy: "12", r: "3.8" }], ["circle", { cx: "17.2", cy: "6.8", r: ".9", fill: "currentColor" }]]]
  };
  var ING = {
    "Rose Water": [["path", { d: "M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" }]],
    "Shea Butter": [["path", { d: "M5 15.5h14v4H5zM7 11.5h10v4H7zM9 7.5h6v4H9z" }]],
    "Rose Oil": [["circle", { cx: "12", cy: "11", r: "2.2" }], ["path", { d: "M12 8.8c-4-4-8 .5-4 2.5-5 1-3 7 1 5 .5 5 7 4 7 0 5 1 6-5 1-5 1-4-3-6-5-2.5Z" }]],
    "Coconut Oil": [["path", { d: "M4 11a8 8 0 0 0 16 0Z" }], ["path", { d: "M9 7.5 7 4M12 7V3M15 7.5 17 4" }]],
    "Sweet Almond Oil": [["path", { d: "M12 2.5C6 7 6 14 12 21.5 18 14 18 7 12 2.5Z" }], ["path", { d: "M12 6v11" }]],
    "Glycerin": [["path", { d: "M9 3S5 8 5 11a4 4 0 0 0 8 0C13 8 9 3 9 3Z" }], ["path", { d: "M16 10s-4 5-4 8a4 4 0 0 0 8 0c0-3-4-8-4-8Z" }]],
    "Panthenol": [["circle", { cx: "7", cy: "8", r: "3" }], ["circle", { cx: "17", cy: "7", r: "3" }], ["circle", { cx: "13", cy: "17", r: "3" }]],
    "Beeswax": [["path", { d: "m12 2.5 8 4.5v9l-8 4.5L4 16V7Z" }], ["path", { d: "M4 7l8 4.5L20 7M12 11.5v9" }]],
    "Cocoa Butter": [["path", { d: "M16.5 3.5c-8-2-13 7-9 13 4 6 14 2 13-5-.5-4-1-6-4-8Z" }], ["path", { d: "M15 5c-4 3-6 7-5 12" }]]
  };

  var DOM = window.MDM_DOM, el = DOM.el;
  function icon(name) { return DOM.draw(I[name]); }
  function ingIcon(name) { return DOM.draw(["svg", { viewBox: "0 0 24 24" }, DOM.own(ING, name) ? ING[name] : ING["Rose Water"]]); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function wa(text) { var n = digits(SITE.whatsapp); return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(text) : ""; }
  function ig() { var h = String(SITE.instagram || "").trim().replace(/^@/, ""); return h ? "https://instagram.com/" + encodeURIComponent(h) : ""; }
  function store(key, value) { try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { return null; } }

  /* ---------- language ---------- */
  function pickLang() {
    var q = (location.search.match(/[?&]lang=(en|ar|fr)\b/) || [])[1];
    if (q) return q;
    var saved = store("mdm-v3-lang");
    if (saved && DOM.own(T, saved)) return saved;
    var nav = (navigator.language || "en").slice(0, 2);
    return DOM.own(T, nav) ? nav : "en";
  }
  var lang = pickLang(), t = T[lang], filter = "all";

  function applyLang(next) {
    lang = next; t = T[lang];
    html.lang = lang; html.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = "Maison d'Mist · " + t.collection;
    Array.prototype.forEach.call(document.querySelectorAll("[data-t]"), function (el) {
      var v = t[el.getAttribute("data-t")]; if (typeof v === "string") el.textContent = v;
    });
    document.getElementById("lang-code").textContent = lang.toUpperCase();
    document.getElementById("lang-btn").setAttribute("aria-label", t.language + ": " + LANGS[lang]);
    document.getElementById("version").textContent = "v3 · " + t.version + " " + VERSION;
    document.getElementById("year").textContent = new Date().getFullYear();
    renderMenu(); renderSegmented(); renderGrid(); renderRitual(); renderContact();
  }

  function renderMenu() {
    var menu = document.getElementById("lang-menu");
    menu.setAttribute("aria-label", t.language);
    DOM.fill(menu, Object.keys(LANGS).map(function (code) {
      return el("button", { "class": "menu__item", type: "button", role: "menuitemradio", "data-lang": code, "aria-checked": String(code === lang), lang: code },
        [el("span", null, LANGS[code]), icon("check")]);
    }));
  }

  /* ---------- segmented filter ---------- */
  function renderSegmented() {
    var seg = document.getElementById("segmented");
    var items = [{ id: "all", label: t.all, n: PRODUCTS.length }].concat(CATS.map(function (c) {
      return { id: c.id, label: c[lang] || c.en, n: PRODUCTS.filter(function (p) { return p.category === c.id; }).length };
    }));
    DOM.fill(seg, [el("span", { "class": "segmented__thumb", "aria-hidden": "true" })].concat(items.map(function (it) {
      var on = it.id === filter;
      return el("button", { "class": "segment", type: "button", role: "tab", "data-filter": it.id, "aria-selected": String(on), tabindex: on ? 0 : -1 },
        [it.label, el("span", { "class": "segment__count" }, it.n)]);
    })));
    requestAnimationFrame(moveThumb);
  }
  function moveThumb() {
    var seg = document.getElementById("segmented");
    var on = seg.querySelector('[aria-selected="true"]'), thumb = seg.querySelector(".segmented__thumb");
    if (!on || !thumb) return;
    thumb.style.width = on.offsetWidth + "px";
    thumb.style.transform = "translateX(" + on.offsetLeft + "px)";
  }
  function choose(id, focus) {
    filter = id;
    Array.prototype.forEach.call(document.querySelectorAll(".segment"), function (b) {
      var on = b.getAttribute("data-filter") === id;
      b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1;
      if (on && focus) { b.focus(); b.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    });
    moveThumb();
    Array.prototype.forEach.call(document.querySelectorAll(".pcard"), function (card) {
      card.hidden = id !== "all" && card.getAttribute("data-category") !== id;
    });
  }

  /* ---------- product cards ---------- */
  function kind(p) { return p.video ? "film" : (p.animation ? "animation" : ""); }
  function badge(p) { return p.status === "coming-soon" ? t.comingSoon : (p.status === "sold-out" ? t.soldOut : ""); }
  function renderGrid() {
    DOM.fill(document.getElementById("grid"), PRODUCTS.map(function (p, i) {
      var l = p[lang] || p.en, b = badge(p), k = kind(p);
      var href = p.status === "available" ? wa(t.waOrder(l.name, p.size)) : "";
      var order = href
        ? el("a", { "class": "get", href: href, target: "_blank", rel: "noopener", "aria-label": t.orderWhatsApp + ": " + l.name }, t.order)
        : el("span", { "class": "get get--soon" }, b || t.soon);
      return el("article", { "class": "pcard", "data-category": p.category, "data-index": i, hidden: filter !== "all" && p.category !== filter }, [
        el("div", { "class": "pcard__media" }, [
          el("img", { src: p.poster || p.image, alt: "", loading: "lazy", decoding: "async" }),
          b ? el("span", { "class": "pcard__badge" }, b) : null,
          k ? el("span", { "class": "pcard__kind", title: t[k] }, icon(k === "film" ? "play" : "sparkle")) : null
        ]),
        el("div", { "class": "pcard__body" }, [
          el("h3", { "class": "pcard__name" },
            el("button", { "class": "pcard__open", type: "button", "data-open": i, "aria-label": l.name + ", " + t.details }, l.name)),
          l.notes ? el("p", { "class": "pcard__sub" }, l.notes) : null,
          el("div", { "class": "pcard__row" }, [el("span", { "class": "pcard__size", dir: "auto" }, p.size || ""), order])
        ])
      ]);
    }));
  }

  /* ---------- lists ---------- */
  function renderRitual() {
    DOM.fill(document.getElementById("ritual-list"), t.steps.map(function (s, n) {
      return el("li", { "class": "row" }, [
        el("span", { "class": "row__icon", "aria-hidden": "true" }, n + 1),
        el("span", { "class": "row__text" }, [el("span", { "class": "row__title" }, s[0]), el("span", { "class": "row__detail" }, s[1])])
      ]);
    }));
  }
  function renderContact() {
    var rows = [];
    var w = wa(t.waGeneral), g = ig(), tel = digits(SITE.phone);
    if (w) rows.push(["wa", t.whatsapp, SITE.phone || ("+" + digits(SITE.whatsapp)), w, true]);
    if (tel) rows.push(["phone", t.phone, SITE.phone, "tel:" + tel, false]);
    if (g) rows.push(["ig", t.instagram, "@" + String(SITE.instagram).trim().replace(/^@/, ""), g, true]);
    DOM.fill(document.getElementById("contact-list"), rows.length ? rows.map(function (r) {
      var attrs = { "class": "row", href: r[3] };
      if (r[4]) { attrs.target = "_blank"; attrs.rel = "noopener"; }
      return el("li", null, el("a", attrs, [
        el("span", { "class": "row__icon row__icon--" + r[0], "aria-hidden": "true" }, icon(r[0])),
        el("span", { "class": "row__text" }, el("span", { "class": "row__title" }, r[1])),
        el("span", { "class": "row__value", dir: "ltr" }, r[2]),
        icon("chev")
      ]));
    }) : el("li", { "class": "row" }, el("span", { "class": "row__text" }, t.contactPending)));
  }

  /* ---------- sheet ---------- */
  var sheet = document.getElementById("sheet"), backdrop = document.getElementById("sheet-backdrop"), body = document.getElementById("sheet-body");
  var opener = null, closing = 0, animTimer = 0;

  function sheetNodes(p) {
    var l = p[lang] || p.en, b = badge(p), media;
    function playButton() { return el("button", { "class": "media-btn", type: "button", "data-media": true, "aria-label": t.play }, icon("play")); }
    if (p.video) {
      var video = el("video", { muted: true, playsinline: true, loop: true, preload: "metadata", poster: p.poster || p.image, "aria-label": l.name }, [
        el("source", { src: p.video.webm, type: "video/webm" }),
        el("source", { src: p.video.mp4, type: "video/mp4" })
      ]);
      // The muted attribute alone does not mute a video made by a script.
      video.muted = true;
      video.defaultMuted = true;
      media = el("div", { "class": "sheet__media" }, [video, playButton()]);
    } else if (p.animation) {
      var bits = [];
      for (var n = 0; n < 9; n++) bits.push(el("b", null, el("i")));
      media = el("div", { "class": "sheet__media anim--" + p.animation, "data-anim": true }, [
        el("img", { src: p.image, alt: l.name }),
        el("span", { "class": "anim-layer", "aria-hidden": "true" }, bits),
        playButton()
      ]);
    } else {
      media = el("div", { "class": "sheet__media" }, el("img", { src: p.image, alt: l.name }));
    }
    var cat = CATS.filter(function (c) { return c.id === p.category; })[0];
    var chips = [cat ? (cat[lang] || cat.en) : "", p.size, b].filter(Boolean).map(function (c) { return el("span", { "class": "chip", dir: "auto" }, c); });
    var ings = (p.ingredients || []).map(function (it) {
      var x = it[lang] || it.en;
      return el("li", { "class": "row" }, [
        el("span", { "class": "row__icon", "aria-hidden": "true" }, ingIcon((it.en || {}).name)),
        el("span", { "class": "row__text" }, [el("span", { "class": "row__title" }, x.name), el("span", { "class": "row__detail" }, x.detail)])
      ]);
    });
    var order = p.status === "available" ? wa(t.waOrder(l.name, p.size)) : "", g = ig();
    return [
      media,
      el("h2", { "class": "sheet__title", id: "sheet-title" }, l.name),
      l.notes ? el("p", { "class": "sheet__sub" }, l.notes) : null,
      el("div", { "class": "chips" }, chips),
      l.description ? el("p", { "class": "sheet__desc" }, l.description) : null,
      ings.length ? [el("h3", { "class": "group-head" }, t.ingredients), el("ul", { "class": "list" }, ings)] : null,
      order ? el("a", { "class": "cta", href: order, target: "_blank", rel: "noopener" }, [icon("wa"), t.orderWhatsApp]) : null,
      !order && p.status !== "available" ? el("p", { "class": "note" }, t.soonNote) : null,
      g ? el("a", { "class": "cta cta--plain", href: g, target: "_blank", rel: "noopener" }, t.askInstagram) : null
    ];
  }

  function setMediaButton(btn, playing) {
    if (!btn) return;
    DOM.fill(btn, icon(playing ? "pause" : "play"));
    btn.setAttribute("aria-label", playing ? t.pause : t.play);
  }
  function runAnim(stage) {
    clearTimeout(animTimer);
    stage.classList.remove("is-animating"); void stage.offsetWidth; stage.classList.add("is-animating");
    setMediaButton(stage.querySelector("[data-media]"), true);
    animTimer = setTimeout(function () { stage.classList.remove("is-animating"); setMediaButton(stage.querySelector("[data-media]"), false); }, 6500);
  }

  function openSheet(index, from) {
    var p = PRODUCTS[index]; if (!p) return;
    clearTimeout(closing);
    opener = from || document.activeElement;
    DOM.fill(body, sheetNodes(p)); body.scrollTop = 0;
    sheet.hidden = false; backdrop.hidden = false; sheet.style.transform = "";
    void sheet.offsetWidth;
    sheet.classList.add("is-open"); backdrop.classList.add("is-open");
    html.style.overflow = "hidden";
    document.getElementById("sheet-done").focus({ preventScroll: true });
    var video = body.querySelector("video"), stage = body.querySelector("[data-anim]"), btn = body.querySelector("[data-media]");
    if (video) {
      video.addEventListener("play", function () { setMediaButton(btn, true); });
      video.addEventListener("pause", function () { setMediaButton(btn, false); });
      if (!reduced.matches) { var r = video.play(); if (r && r.catch) r.catch(function () {}); }
      btn.addEventListener("click", function () { if (video.paused) { var q = video.play(); if (q && q.catch) q.catch(function () {}); } else video.pause(); });
    }
    if (stage) {
      if (!reduced.matches) runAnim(stage);
      btn.addEventListener("click", function () {
        if (stage.classList.contains("is-animating")) { clearTimeout(animTimer); stage.classList.remove("is-animating"); setMediaButton(btn, false); } else runAnim(stage);
      });
    }
  }
  function closeSheet() {
    if (sheet.hidden) return;
    var video = body.querySelector("video"); if (video) video.pause();
    clearTimeout(animTimer);
    sheet.classList.remove("is-open"); backdrop.classList.remove("is-open"); sheet.style.transform = "";
    html.style.overflow = "";
    closing = setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; DOM.fill(body, null); }, reduced.matches ? 0 : 450);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  // drag the handle down to dismiss
  (function () {
    var handle = document.getElementById("sheet-handle"), y0 = 0, dy = 0, t0 = 0, dragging = false;
    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest("#sheet-done")) return;
      dragging = true; y0 = e.clientY; dy = 0; t0 = Date.now();
      handle.setPointerCapture(e.pointerId); sheet.style.transition = "none";
    });
    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - y0); sheet.style.transform = "translateY(" + dy + "px)";
    });
    function end() {
      if (!dragging) return;
      dragging = false; sheet.style.transition = "";
      var fast = dy / Math.max(1, Date.now() - t0) > 0.6;
      if (dy > 110 || (fast && dy > 30)) closeSheet(); else sheet.style.transform = "";
    }
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  })();

  /* ---------- wiring ---------- */
  document.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open]");
    if (open) { openSheet(+open.getAttribute("data-open"), open); return; }
    var seg = e.target.closest(".segment");
    if (seg) { choose(seg.getAttribute("data-filter")); return; }
    var item = e.target.closest("[data-lang]");
    if (item) {
      var code = item.getAttribute("data-lang"); store("mdm-v3-lang", code);
      if (history.replaceState) history.replaceState(null, "", "?lang=" + code + location.hash);
      toggleMenu(false); applyLang(code); return;
    }
    if (e.target.closest("#lang-btn")) { toggleMenu(); return; }
    if (!e.target.closest("#lang-menu")) toggleMenu(false);
  });
  backdrop.addEventListener("click", closeSheet);
  document.getElementById("sheet-done").addEventListener("click", closeSheet);

  function toggleMenu(force) {
    var menu = document.getElementById("lang-menu"), btn = document.getElementById("lang-btn");
    var show = typeof force === "boolean" ? force : menu.hidden;
    menu.hidden = !show; btn.setAttribute("aria-expanded", String(show));
    if (show) { var on = menu.querySelector('[aria-checked="true"]'); if (on) on.focus(); }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!document.getElementById("lang-menu").hidden) { toggleMenu(false); document.getElementById("lang-btn").focus(); return; }
      if (!sheet.hidden) closeSheet();
      return;
    }
    if (e.key === "Tab" && !sheet.hidden) {
      var f = Array.prototype.filter.call(sheet.querySelectorAll("button, a[href], video"), function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      return;
    }
    var seg = e.target.closest && e.target.closest(".segment");
    if (seg && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      var all = Array.prototype.slice.call(document.querySelectorAll(".segment")), i = all.indexOf(seg);
      var step = (e.key === "ArrowRight") === (html.dir !== "rtl") ? 1 : -1;
      var next = all[(i + step + all.length) % all.length];
      e.preventDefault(); choose(next.getAttribute("data-filter"), true);
    }
  });

  // navigation bar: glass once scrolled, small logo once the big one is gone
  var navbar = document.getElementById("navbar");
  function onScroll() { navbar.classList.toggle("is-scrolled", window.scrollY > 6); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  window.addEventListener("resize", moveThumb);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { navbar.classList.toggle("is-titled", !en[0].isIntersecting); }, { rootMargin: "-60px 0px 0px 0px" })
      .observe(document.querySelector(".hero__title"));
    var tabs = document.querySelectorAll(".tab");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Array.prototype.forEach.call(tabs, function (tb) { tb.setAttribute("aria-current", String(tb.getAttribute("data-tab") === en.target.id)); });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    ["shop", "ritual", "contact"].forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  applyLang(lang);
})();
