
import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const teamGrid = document.getElementById("teamGrid");
const teamCount = document.getElementById("teamCount");

const arabicButton = document.getElementById("teamArabic");
const englishButton = document.getElementById("teamEnglish");

const LANGUAGE_KEY = "hacktivators_admin_language";

let currentLanguage =
  localStorage.getItem(LANGUAGE_KEY) || "en";

if (!["ar", "en"].includes(currentLanguage)) {
  currentLanguage = "en";
}

let members = [];
let unsubscribe = null;

const departmentNames = {
  Leadership: {
    en: "Leadership",
    ar: "القيادة"
  },
  Programming: {
    en: "Programming",
    ar: "البرمجة"
  },
  Photography: {
    en: "Photography",
    ar: "التصوير"
  },
  Design: {
    en: "Design",
    ar: "التصميم"
  },
  "Design & Media": {
    en: "Design & Media",
    ar: "التصميم والإعلام"
  },
  "Design & Organization": {
    en: "Design & Organization",
    ar: "التصميم والتنظيم"
  }
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function translatePage(language) {
  currentLanguage = language;

  localStorage.setItem(LANGUAGE_KEY, language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-ar]").forEach(element => {
    element.textContent = element.dataset[language];
  });

  englishButton.classList.toggle("active", language === "en");
  arabicButton.classList.toggle("active", language === "ar");

  renderMembers();
}

function renderMembers() {
  if (!teamGrid) return;

  if (!members.length) {
    teamGrid.innerHTML = `
      <div class="team-empty">
        ${currentLanguage === "ar"
          ? "لا يوجد أعضاء لعرضهم حاليًا."
          : "There are currently no members to display."}
      </div>
    `;

    teamCount.textContent = currentLanguage === "ar"
      ? "0 أعضاء"
      : "0 Members";

    return;
  }

  teamCount.textContent = currentLanguage === "ar"
    ? `${members.length} عضو`
    : `${members.length} Members`;

  teamGrid.innerHTML = members.map(member => {
    const name = currentLanguage === "ar"
      ? member.nameAr || member.name || ""
      : member.nameEn || member.name || "";

    const role = currentLanguage === "ar"
      ? member.roleAr || member.role || ""
      : member.roleEn || member.role || "";

    const department = departmentNames[member.department]
      ? departmentNames[member.department][currentLanguage]
      : member.department || "";

    const initials = member.initials || "H";

    return `
      <article class="team-card">

        <span class="team-label">
          ${escapeHTML(department)}
        </span>

        <div class="team-avatar">
          ${escapeHTML(initials)}
        </div>

        <h3>${escapeHTML(name)}</h3>

        <p class="team-role">
          ${escapeHTML(role)}
        </p>

      </article>
    `;
  }).join("");
}

function showError() {
  teamGrid.innerHTML = `
    <div class="team-error">
      ${currentLanguage === "ar"
        ? "حدث خطأ أثناء تحميل أعضاء الفريق. حاول تحديث الصفحة."
        : "Something went wrong while loading the team. Please refresh the page."}
    </div>
  `;
}

function startTeamListener() {
  const teamQuery = query(
    collection(db, "team_members"),
    orderBy("name")
  );

  unsubscribe = onSnapshot(
    teamQuery,
    snapshot => {
      members = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));

      // Keep the approved team order.
      const preferredOrder = [
        "Celia Ahmed",
        "Omar Mohamed",
        "Salma Emad",
        "Logien Mohamed",
        "Adam Hussein",
        "Youssef Khaled",
        "Lamar Abd Elmohsen",
        "Saleen Ahmed",
        "Sagda Ahmed",
        "Omar Mostafa",
        "Yassin Mohamed",
        "Hana Ahmed"
      ];

      members.sort((a, b) => {
        const nameA = a.nameEn || a.name || "";
        const nameB = b.nameEn || b.name || "";

        const indexA = preferredOrder.indexOf(nameA);
        const indexB = preferredOrder.indexOf(nameB);

        if (indexA === -1 && indexB === -1) {
          return nameA.localeCompare(nameB);
        }

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });

      renderMembers();
    },
    error => {
      console.error("Team loading error:", error);
      showError();
    }
  );
}

arabicButton.addEventListener("click", () => {
  translatePage("ar");
});

englishButton.addEventListener("click", () => {
  translatePage("en");
});

// Start page.
translatePage(currentLanguage);
startTeamListener();

// Clean up listener when leaving page.
window.addEventListener("pagehide", () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
});
