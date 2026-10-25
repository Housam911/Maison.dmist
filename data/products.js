/* Maison d'Mist — launch collection.
   Edit product names, descriptions, prices, and ingredient details here.
   Keep image and poster paths relative to the site root. Leave price empty to hide it. */

window.MDM_PRODUCTS = [
  {
    id: "lotion",
    status: "available",
    image: "assets/img/products/fresh-mist-lotion.webp",
    poster: "assets/img/products/fresh-mist-lotion.webp",
    video: {
      webm: "assets/video/fresh-mist-lotion.webm",
      mp4: "assets/video/fresh-mist-lotion.mp4"
    },
    size: "250 ml",
    price: "",
    en: {
      name: "Fresh Mist Lotion",
      notes: "Rose · Shea · Botanical oils",
      description: "A lightweight body lotion with a fresh floral character and a smooth, easy glide."
    },
    ar: {
      name: "لوشن فريش ميست",
      notes: "الورد · الشيا · زيوت نباتية",
      description: "لوشن خفيف للجسم بطابع زهري منعش وملمس ناعم سهل الانزلاق."
    },
    fr: {
      name: "Lotion Fresh Mist",
      notes: "Rose · Karité · Huiles botaniques",
      description: "Une lotion corporelle légère au caractère floral frais et à l’application fluide."
    },
    ingredients: [
      {
        en: { name: "Rose Water", detail: "A floral water used for a light, fresh character." },
        ar: { name: "ماء الورد", detail: "ماء زهري يمنح التركيبة نفحة خفيفة ومنعشة." },
        fr: { name: "Eau de rose", detail: "Une eau florale au caractère léger et frais." }
      },
      {
        en: { name: "Shea Butter", detail: "A rich plant butter used for a creamy, cushioning texture." },
        ar: { name: "زبدة الشيا", detail: "زبدة نباتية غنية تمنح التركيبة قوامًا كريميًا ناعمًا." },
        fr: { name: "Beurre de karité", detail: "Un beurre végétal riche pour une texture crémeuse et enveloppante." }
      },
      {
        en: { name: "Rose Oil", detail: "A concentrated botanical oil with a floral scent." },
        ar: { name: "زيت الورد", detail: "زيت نباتي مركز برائحة زهرية." },
        fr: { name: "Huile de rose", detail: "Une huile botanique concentrée au parfum floral." }
      },
      {
        en: { name: "Coconut Oil", detail: "A smooth plant oil that brings slip and softness." },
        ar: { name: "زيت جوز الهند", detail: "زيت نباتي يمنح التركيبة انزلاقًا ونعومة." },
        fr: { name: "Huile de coco", detail: "Une huile végétale qui apporte glisse et souplesse." }
      },
      {
        en: { name: "Sweet Almond Oil", detail: "A light-feeling oil used for a smooth glide." },
        ar: { name: "زيت اللوز الحلو", detail: "زيت خفيف الملمس يساعد على انزلاق المنتج بسلاسة." },
        fr: { name: "Huile d’amande douce", detail: "Une huile légère pour une application fluide." }
      },
      {
        en: { name: "Glycerin", detail: "A humectant that helps attract water to the skin." },
        ar: { name: "الجلسرين", detail: "مرطب يساعد على جذب الماء إلى البشرة." },
        fr: { name: "Glycérine", detail: "Un humectant qui aide à attirer l’eau vers la peau." }
      },
      {
        en: { name: "Panthenol", detail: "Pro-vitamin B5, commonly used for skin conditioning." },
        ar: { name: "البانثينول", detail: "بروفيتامين ب5، يُستخدم عادةً للعناية بالبشرة." },
        fr: { name: "Panthénol", detail: "La pro-vitamine B5, utilisée pour le soin de la peau." }
      }
    ]
  },
  {
    id: "butter",
    status: "available",
    image: "assets/img/products/soft-bloom-butter.webp",
    poster: "assets/img/products/soft-bloom-butter.webp",
    video: {
      webm: "assets/video/soft-bloom-butter.webm",
      mp4: "assets/video/soft-bloom-butter.mp4"
    },
    size: "250 g",
    price: "",
    en: {
      name: "Soft Bloom Butter Cream",
      notes: "Beeswax · Shea · Cocoa butter",
      description: "A whipped body butter with a soft pastel look and a rich, creamy texture."
    },
    ar: {
      name: "كريم الزبدة سوفت بلوم",
      notes: "شمع العسل · الشيا · زبدة الكاكاو",
      description: "كريم زبدة مخفوق للجسم بألوان هادئة وقوام غني وكريمي."
    },
    fr: {
      name: "Butter Cream Soft Bloom",
      notes: "Cire d’abeille · Karité · Beurre de cacao",
      description: "Un beurre corporel fouetté aux teintes pastel et à la texture riche et crémeuse."
    },
    ingredients: [
      {
        en: { name: "Beeswax", detail: "A natural wax that gives the blend body and structure." },
        ar: { name: "شمع العسل", detail: "شمع طبيعي يمنح المزيج قوامًا وبنية." },
        fr: { name: "Cire d’abeille", detail: "Une cire naturelle qui donne corps et structure au mélange." }
      },
      {
        en: { name: "Coconut Oil", detail: "A smooth plant oil that brings slip and softness." },
        ar: { name: "زيت جوز الهند", detail: "زيت نباتي يمنح التركيبة انزلاقًا ونعومة." },
        fr: { name: "Huile de coco", detail: "Une huile végétale qui apporte glisse et souplesse." }
      },
      {
        en: { name: "Shea Butter", detail: "A rich plant butter used for a creamy, cushioning texture." },
        ar: { name: "زبدة الشيا", detail: "زبدة نباتية غنية تمنح التركيبة قوامًا كريميًا ناعمًا." },
        fr: { name: "Beurre de karité", detail: "Un beurre végétal riche pour une texture crémeuse et enveloppante." }
      },
      {
        en: { name: "Cocoa Butter", detail: "A firm plant butter with a naturally rich texture." },
        ar: { name: "زبدة الكاكاو", detail: "زبدة نباتية صلبة ذات قوام غني طبيعيًا." },
        fr: { name: "Beurre de cacao", detail: "Un beurre végétal ferme à la texture naturellement riche." }
      }
    ]
  }
];
