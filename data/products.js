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
      mp4: "assets/video/fresh-mist-lotion.mp4",
      width: 562,
      height: 748
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
      mp4: "assets/video/soft-bloom-butter.mp4",
      width: 960,
      height: 960
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
  },

  /* Soaps: coming soon. Photos are the label mock-ups; names exactly as printed. */
  {
    id: "ghar-laymoun",
    status: "coming-soon",
    image: "assets/img/products/ghar-laymoun.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Ghar Soap Laymoun",
      notes: "Laurel soap · Lemon",
      description: "A laurel soap bar in Laymoun, our lemon scent."
    },
    ar: {
      name: "صابون غار ليمون",
      notes: "صابون الغار · ليمون",
      description: "قالب صابون غار برائحة الليمون."
    },
    fr: {
      name: "Savon Ghar Laymoun",
      notes: "Savon au laurier · Citron",
      description: "Un pain de savon au laurier, parfum citron."
    }
  },
  {
    id: "ghar-remmen",
    status: "coming-soon",
    image: "assets/img/products/ghar-remmen.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Ghar Soap Remmen",
      notes: "Laurel soap · Pomegranate",
      description: "A laurel soap bar in Remmen, our pomegranate scent."
    },
    ar: {
      name: "صابون غار رمّان",
      notes: "صابون الغار · رمّان",
      description: "قالب صابون غار برائحة الرمّان."
    },
    fr: {
      name: "Savon Ghar Remmen",
      notes: "Savon au laurier · Grenade",
      description: "Un pain de savon au laurier, parfum grenade."
    }
  },
  {
    id: "ghar-misk-fodda",
    status: "coming-soon",
    image: "assets/img/products/ghar-misk-fodda.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Ghar Soap Misk Fodda",
      notes: "Laurel soap · Musk",
      description: "A laurel soap bar in Misk Fodda, a soft musk."
    },
    ar: {
      name: "صابون غار مسك فضّة",
      notes: "صابون الغار · مسك",
      description: "قالب صابون غار برائحة مسك فضّة الناعمة."
    },
    fr: {
      name: "Savon Ghar Misk Fodda",
      notes: "Savon au laurier · Musc",
      description: "Un pain de savon au laurier au doux musc Misk Fodda."
    }
  },
  {
    id: "ghar-misk-tahara",
    status: "coming-soon",
    image: "assets/img/products/ghar-misk-tahara.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Ghar Soap Misk Tahara",
      notes: "Laurel soap · Musk",
      description: "A laurel soap bar in Misk Tahara, a gentle, clean musk."
    },
    ar: {
      name: "صابون غار مسك الطهارة",
      notes: "صابون الغار · مسك",
      description: "قالب صابون غار برائحة مسك الطهارة اللطيفة."
    },
    fr: {
      name: "Savon Ghar Misk Tahara",
      notes: "Savon au laurier · Musc",
      description: "Un pain de savon au laurier au musc délicat Misk Tahara."
    }
  },
  {
    id: "laurel-floral-petals",
    status: "coming-soon",
    image: "assets/img/products/laurel-floral-petals.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Laurel Soap Floral Petals",
      notes: "Laurel soap · Dried petals",
      description: "A handcrafted laurel soap bar set with dried flower petals."
    },
    ar: {
      name: "صابون الغار فلورال بيتالز",
      notes: "صابون الغار · بتلات مجففة",
      description: "قالب صابون غار مصنوع يدويًا ومزيّن ببتلات الزهور المجففة."
    },
    fr: {
      name: "Savon au laurier Floral Petals",
      notes: "Savon au laurier · Pétales séchés",
      description: "Un pain de savon au laurier fait main, parsemé de pétales de fleurs séchées."
    }
  },
  {
    id: "laurel-rose-petal",
    status: "coming-soon",
    image: "assets/img/products/laurel-rose-petal.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Laurel Soap Rose Petal",
      notes: "Laurel soap · Rose",
      description: "A laurel soap bar set with dried rose petals."
    },
    ar: {
      name: "صابون الغار روز بيتال",
      notes: "صابون الغار · ورد",
      description: "قالب صابون غار مزيّن ببتلات الورد المجففة."
    },
    fr: {
      name: "Savon au laurier Rose Petal",
      notes: "Savon au laurier · Rose",
      description: "Un pain de savon au laurier parsemé de pétales de rose séchés."
    }
  },
  {
    id: "laurel-ocean-mist",
    status: "coming-soon",
    image: "assets/img/products/laurel-ocean-mist.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Laurel Soap Ocean Mist",
      notes: "Laurel soap · Fresh",
      description: "A blue laurel soap bar in Ocean Mist."
    },
    ar: {
      name: "صابون الغار أوشن ميست",
      notes: "صابون الغار · منعش",
      description: "قالب صابون غار أزرق برائحة أوشن ميست."
    },
    fr: {
      name: "Savon au laurier Ocean Mist",
      notes: "Savon au laurier · Frais",
      description: "Un pain de savon au laurier bleu, parfum Ocean Mist."
    }
  },
  {
    id: "laurel-lavender-blossom",
    status: "coming-soon",
    image: "assets/img/products/laurel-lavender-blossom.webp",
    size: "100 g",
    price: "",
    en: {
      name: "Laurel Soap Lavender Blossom",
      notes: "Laurel soap · Lavender",
      description: "A violet laurel soap bar in Lavender Blossom."
    },
    ar: {
      name: "صابون الغار لافندر بلوسوم",
      notes: "صابون الغار · لافندر",
      description: "قالب صابون غار بنفسجي برائحة اللافندر."
    },
    fr: {
      name: "Savon au laurier Lavender Blossom",
      notes: "Savon au laurier · Lavande",
      description: "Un pain de savon au laurier violet, parfum lavande."
    }
  }
];
