
import { db } from "./firebase.js";
import {
  doc,
  onSnapshot,
  collection
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const LANGUAGE_KEY = "hacktivators-language";

const contentCache = {};

function getLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) === "ar" ? "ar" : "en";
}

function getText(data, field) {
  const language = getLanguage();
  const translatedField = field + (language === "ar" ? "Ar" : "En");

  return data?.[translatedField] || data?.[field] || "";
}

function updateText(selector, value) {
  const element = document.querySelector(selector);

  if (element && typeof value === "string" && value.trim()) {
    element.textContent = value;
  }
}

function applyPageContent() {
  const page = location.pathname.split("/").pop();

  if (page === "" || page === "index.html") {
    const home = contentCache.home_page;
    const contact = contentCache.contact_page;

    if (home) {
      updateText(".home-hero .home-title", getText(home, "title"));
      updateText(".home-hero .home-description", getText(home, "description"));
    }

    if (contact) {
      updateText(".home-contact-content h2", getText(contact, "title"));
      updateText(
        ".home-contact-content .home-description",
        getText(contact, "description")
      );
    }
  }

  if (page === "about.html") {
    const about = contentCache.about_page;

    if (about) {
      updateText(".hero-content h1", getText(about, "title"));
      updateText(".hero-content > p:not(.eyebrow)", getText(about, "description"));
    }
  }
}

function listenToContent(documentId) {
  onSnapshot(
    doc(db, "site_content", documentId),
    (snapshot) => {
      if (snapshot.exists()) {
        contentCache[documentId] = snapshot.data();
        applyPageContent();
      }
    },
    (error) => {
      console.error("Content loading error:", error);
    }
  );
}

function listenToSocialLinks() {
  const selectors = {
    instagram: ".social-card[href*='instagram.com']",
    tiktok: ".social-card[href*='tiktok.com']",
    facebook: ".social-card[href*='facebook.com']",
    whatsapp: ".social-card[href*='whatsapp.com']",
    email: ".email-contact"
  };

  onSnapshot(
    collection(db, "social_links"),
    (snapshot) => {
      snapshot.forEach((item) => {
        const id = item.id;
        const data = item.data();
        const element = document.querySelector(selectors[id]);

        if (!element) return;

        element.hidden = data.enabled === false;

        if (!data.url) return;

        if (id === "email") {
          element.href = data.url.startsWith("mailto:")
            ? data.url
            : `mailto:${data.url}`;
        } else {
          element.href = data.url;
        }
      });
    },
    (error) => {
      console.error("Social links loading error:", error);
    }
  );
}

function start() {
  const page = location.pathname.split("/").pop();

  if (page === "" || page === "index.html") {
    listenToContent("home_page");
    listenToContent("contact_page");
  }

  if (page === "about.html") {
    listenToContent("about_page");
  }

  listenToSocialLinks();

  const languageButton = document.getElementById("languageToggle");

  if (languageButton) {
    languageButton.addEventListener("click", () => {
      setTimeout(applyPageContent, 100);
    });
  }
}

start();
