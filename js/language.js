/* HACKTIVATORS bilingual language switcher */
(() => {
  "use strict";
  const translations = {
    "index.html": {
      ".navbar nav a": ["الرئيسية", "من نحن", "فريقنا", "الفعاليات", "تواصل معنا"],
      ".home-tag": ["مرحبًا بكم في هاكتيفيتورز"],
      ".home-title": ["نصنع<br>المستقبل."],
      ".home-description": ["فريق يجمعه الشغف بالتكنولوجيا والإبداع وحب الاستكشاف. نتعلم ونتعاون ونكتشف إمكانيات جديدة، ونحوّل الأفكار إلى تجارب لها معنى."],
      ".home-actions a": ["اكتشف قصتنا", "تعرّف على فريقنا"],
      ".home-stat span": ["أعضاء الفريق", "فعاليات للفريق", "إمكانيات بلا حدود"],
      ".home-about .eyebrow": ["من نحن"],
      ".home-about .section-heading h2": ["نقود الطريق بـ <span>الابتكار.</span>"],
      ".home-about-content": ["هاكتيفيتورز فريق برمجة يجمعه الشغف بالتكنولوجيا والتعلم المستمر. نؤمن بقوة العمل الجماعي والإبداع، وبمساعدة الآخرين على اكتشاف ما يمكنهم تحقيقه باستخدام التكنولوجيا."],
      ".home-sections .eyebrow": ["اكتشف هاكتيفيتورز"],
      ".home-sections .section-heading h2": ["اكتشف <span>عالمنا.</span>"],
      ".home-sections .section-heading > p:last-child": ["تعرّف على فريقنا وقصتنا وأنشطتنا."],
      ".home-section-card h3": ["من نحن", "فريقنا", "الفعاليات", "تواصل معنا"],
      ".home-section-card p": [
        "اكتشف رؤيتنا ورسالتنا وقيمنا وما يجعل هاكتيفيتورز مميزًا.",
        "تعرّف على أعضاء هاكتيفيتورز الاثني عشر واكتشف أدوارهم المختلفة.",
        "استكشف ورش العمل وتجارب التعلم في التكنولوجيا والإبداع.",
        "لديك سؤال أو فكرة؟ تواصل مع فريق هاكتيفيتورز."
      ],
      ".home-card-link": ["اكتشف المزيد ←", "تعرّف على الفريق ←", "استكشف الفعاليات ←", "تواصل معنا ←"],
      ".home-contact .eyebrow": ["لنبقَ على تواصل"],
      ".home-contact h2": ["تابعنا <span>في كل مكان.</span>"],
      ".home-contact .home-description": ["تابع هاكتيفيتورز على منصات التواصل الاجتماعي لتصلك آخر أخبارنا وفعالياتنا وأنشطتنا."],
      ".social-info small": ["@hacktivators", "@hacktivators.5", "انضم إلى قناتنا", "فريق هاكتيفيتورز"],
      ".email-contact": ["تواصل معنا عبر البريد الإلكتروني ↗"],
      ".footer p": ["© <span id=\"year\"></span> هاكتيفيتورز. جميع الحقوق محفوظة."],
      ".footer a": ["العودة للأعلى ↑"]
    },
    "about.html": {
      ".navbar nav a": ["الرئيسية", "من نحن", "فريقنا", "الفعاليات", "تواصل معنا"],
      ".hero .eyebrow": ["تعرّف علينا"],
      ".hero h1": ["أكثر من مجرد <span>برمجة.</span>"],
      ".hero-content > p:not(.eyebrow)": ["نؤمن أن التكنولوجيا أكبر من مجرد كتابة الأكواد؛ فهي إبداع وعمل جماعي وتعلّم وتحويل الأفكار إلى تجارب مفيدة."],
      ".hero .primary-btn": ["اكتشف رؤيتنا"],
      ".about .eyebrow": ["من نحن"],
      ".about .section-heading h2": ["عن <span>هاكتيفيتورز</span>"],
      ".about-content p": [
        "هاكتيفيتورز فريق برمجة يجمعه الشغف بالتكنولوجيا والإبداع والتعلم المستمر.",
        "نسعى إلى توفير بيئة تتيح للجميع استكشاف البرمجة وتبادل المعرفة وتطوير المهارات والعمل معًا على أفكار مفيدة.",
        "رحلتنا يقودها الفضول والتعاون والإيمان بأن لكل شخص القدرة على المساهمة في مستقبل التكنولوجيا."
      ],
      "main > section:nth-of-type(3) .eyebrow": ["هدفنا"],
      "main > section:nth-of-type(3) .section-heading h2": ["الرؤية و<span>الرسالة</span>"],
      ".project-card h3": ["رؤيتنا", "رسالتنا", "قيمنا"],
      ".project-card p": [
        "إلهام مجتمع يستخدم التكنولوجيا والإبداع والابتكار لصناعة مستقبل أفضل.",
        "تشجيع التعلم ومشاركة المعرفة البرمجية ودعم المبتدئين وخلق فرص للتطور.",
        "الإبداع والعمل الجماعي والفضول والاحترام والتطور المستمر هي القيم التي توجهنا."
      ],
      ".contact .eyebrow": ["كن جزءًا من الرحلة"],
      ".contact h2": ["لنبنِ <span>المستقبل معًا.</span>"],
      ".contact .section-heading > p:not(.eyebrow)": ["لديك سؤال أو فكرة؟ يسعدنا التواصل معك."],
      ".contact .primary-btn": ["تواصل معنا"],
      ".footer p": ["© <span id=\"year\"></span> هاكتيفيتورز. جميع الحقوق محفوظة."],
      ".footer a": ["العودة للرئيسية ↑"]
    },
    "team.html": {
      ".navbar nav a": ["الرئيسية", "من نحن", "فريقنا", "الفعاليات", "تواصل معنا"],
      ".team-intro .eyebrow": ["الأشخاص وراء الرؤية"],
      ".team-intro h1": ["تعرّف على <span>فريقنا.</span>"],
      ".team-intro > p:not(.eyebrow)": ["اثنا عشر شخصًا، ومهارات مختلفة، وشغف واحد بالتكنولوجيا والإبداع والابتكار."],
      ".team-intro .primary-btn": ["تعرّف على الأعضاء"],
      ".team-section .eyebrow": ["مجتمع هاكتيفيتورز"],
      ".team-section .section-heading h2": ["العقول وراء <span>هاكتيفيتورز</span>"],
      ".team-section .section-heading > p:last-child": ["تعرّف على الأشخاص الذين يجمعون فريقنا. <span class=\"team-count\">12 عضوًا</span>"],
      ".team-label": ["قائد الفريق", "القيادة", "القيادة", "البرمجة", "التصوير", "التصوير", "التصميم والإعلام", "التصميم والتنظيم", "البرمجة", "البرمجة", "التصميم", "القيادة"],
      ".team-role": ["قائد الفريق", "نائب قائد الفريق", "نائب قائد الفريق", "عضو بقسم البرمجة", "مصور", "مصور", "مصمم ومحرر فيديو", "مصممة ومنظمة", "عضو بقسم البرمجة", "عضو بقسم البرمجة", "مصممة", "نائب قائد الفريق"],
      ".footer p": ["© <span id=\"year\"></span> هاكتيفيتورز. جميع الحقوق محفوظة."],
      ".footer a": ["العودة للرئيسية ↑"]
    },
    "events.html": {
      ".navbar nav a": ["الرئيسية", "من نحن", "فريقنا", "الفعاليات", "تواصل معنا"],
      ".hero .eyebrow": ["تعلّم • ابتكر • تطوّر"],
      ".hero h1": ["<span>فعالياتنا.</span>"],
      ".hero-content > p:not(.eyebrow)": ["كل فعالية هي فرصة لتعلّم شيء جديد واكتشاف مهارات مختلفة والتطور معًا."],
      ".hero .primary-btn": ["استكشف الفعاليات"],
      ".events-container .eyebrow": ["رحلتنا"],
      ".events-container .section-heading h2": ["ورش عمل و<span>تجارب</span>"],
      ".events-container .section-heading > p:last-child": ["استكشف التجارب التعليمية التي ينظمها فريق هاكتيفيتورز."],
      ".event-status": ["انتهت", "انتهت", "قادمة"],
      ".event-card h2": ["اكتشف إمكانياتك", "مهارات إبداعية وتكنولوجيا", "مهارات العرض والوعي التكنولوجي"],
      ".event-description": ["تجربة تعليمية تمهيدية تتناول التواصل والإبداع والبرمجة وتطوير الألعاب.", "تجربة تعليمية عملية للتعرّف على تحرير الفيديو والبرمجة وصناعة الألعاب.", "تجربة تعليمية قادمة تركز على مهارات العرض ومكونات الحاسوب وفهم الذكاء الاصطناعي."],
      ".topic h3": ["🧠 الذكاء العاطفي", "🎨 أساسيات التصميم", "🧩 البرمجة بالكتل", "🎮 تطوير الألعاب", "🎬 تحرير الفيديو", "💻 البرمجة بالكتل", "🎮 تطوير الألعاب", "🎤 مهارات العرض", "🖥️ مكونات الحاسوب", "🤖 فهم الذكاء الاصطناعي", "⚠️ مخاطر التكنولوجيا"],
      ".topic p": ["تنمية الذكاء العاطفي ومهارات التواصل الفعّال.", "اكتشاف أساسيات التصميم وتحويل الأفكار إلى إبداعات بصرية.", "استكشاف أساسيات البرمجة بطريقة ممتعة وتفاعلية.", "التعرّف على تطوير الألعاب وصناعة تجارب تفاعلية.", "تعلّم تحرير الفيديو باستخدام InShot وCapCut.", "اكتشاف أساسيات البرمجة باستخدام الكتل البرمجية.", "تعلّم كيفية إنشاء لعبتك الخاصة واستكشاف مجال تطوير الألعاب.", "تطوير مهارات العرض وتعلّم كيفية توصيل الأفكار بثقة.", "استكشاف المكونات الداخلية للحاسوب وفهم وظائفها الأساسية.", "التعرّف على الذكاء الاصطناعي واستكشاف فوائده وأضراره المحتملة.", "فهم مخاطر التكنولوجيا والمخاطر المحتملة للذكاء الاصطناعي."],
      ".footer p": ["© <span id=\"year\"></span> هاكتيفيتورز. جميع الحقوق محفوظة."],
      ".footer a": ["العودة للرئيسية ↑"]
    }
  };

  const page = location.pathname.split("/").pop() || "index.html";
  const pageMap = translations[page] || translations["index.html"];
  const toggle = document.getElementById("languageToggle");
  let currentLanguage = localStorage.getItem("hacktivators-language") === "ar" ? "ar" : "en";

  // Save original English HTML so switching back restores every original phrase.
  Object.keys(pageMap).forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.dataset.originalEnglish = el.innerHTML;
    });
  });

  function applyLanguage(language) {
    currentLanguage = language;
    const arabic = language === "ar";
    document.documentElement.lang = arabic ? "ar" : "en";
    document.documentElement.dir = arabic ? "rtl" : "ltr";
    document.body.classList.toggle("arabic-mode", arabic);

    Object.entries(pageMap).forEach(([selector, values]) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        if (arabic && values[index] !== undefined) el.innerHTML = values[index];
        if (!arabic && el.dataset.originalEnglish !== undefined) el.innerHTML = el.dataset.originalEnglish;
      });
    });

    if (toggle) {
      toggle.textContent = arabic ? "English" : "العربية";
      toggle.setAttribute("aria-label", arabic ? "Switch to English" : "التبديل إلى العربية");
    }
    localStorage.setItem("hacktivators-language", language);
  }

  toggle?.addEventListener("click", () => applyLanguage(currentLanguage === "en" ? "ar" : "en"));
  applyLanguage(currentLanguage);
})();
