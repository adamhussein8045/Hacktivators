import { db } from "./firebase.js";
import {
  doc,
  onSnapshot,
  collection
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const LANGUAGE_KEY = "hacktivators-language";

function getLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) === "ar" ? "ar" : "en";
}

function getField(data, field, language) {
  const translatedField = `${field}${language === "ar" ? "Ar" : "En"}`;
  return data?.[translatedField] || data?.[field] || "";
}

function updateText(selector, value) {
  const element = document.querySelector(selector);

  if (element && typeof value === "string" && value.trim()) {
    element.textContent = value;
  }
}

// الصفحة الرئيسية
function applyHomeContent(data) {
  const language = getLanguage();

  updateText(".home-hero .home-title", getField(data, "title", language));
  updateText(
    ".home-hero .home-description",
    getField(data, "description", language)
  );
}

// صفحة About
function applyAboutContent(data) {
  const language = getLanguage();

  updateText(".hero-content h1", getField(data, "title", language));
  updateText(".hero-content p", getField(data, "description", language));
}

// قسم التواصل في الصفحة الرئيسية
function applyContactContent(data) {
  const language = getLanguage();

  updateText(
    ".home-contact-content h2",
    getField(data, "title", language)
  );

  updateText(
    ".home-contact-content .home-description",
    getField(data, "description", language)
  );
}

function listenToPageContent(documentId, callback) {
  onSnapshot(
    doc(db, "site_content", documentId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    },
    (error) => {
      console.error(`Error loading ${documentId}:`, error);
    }
  );
}

function listenToSocialLinks() {
  const socialLinks = {
    instagram: ".social-card[href*='instagram.com']",
    tiktok: ".social-card[href*='tiktok.com']",
    facebook: ".social-card[href*='facebook.com']",
    whatsapp: ".social-card[href*='whatsapp.com']",
    email: ".email-contact"
  };

  onSnapshot(
    collection(db, "social_links"),
    (snapshot) => {
      snapshot.forEach((documentSnapshot) => {
        const id = documentSnapshot.id;
        const data = documentSnapshot.data();
        const selector = socialLinks[id];

        if (!selector) return;

        const element = document.querySelector(selector);
        if (!element) return;

        const enabled = data.enabled !== false;
        element.hidden = !enabled;

        if (id === "email") {
          const email = data.url || data.email || "";
          if (email) {
            element.href = email.startsWith("mailto:")
              ? email
              : `mailto:${email}`;
          }
        } else if (data.url) {
          element.href = data.url;
        }
      });
    },
    (error) => {
      console.error("Error loading social links:", error);
    }
  );
}

function startLiveContent() {
  const page = window.location.pathname.split("/").pop();

  if (page === "" || page === "index.html") {
    listenToPageContent("home_page", applyHomeContent);
    listenToPageContent("contact_page", applyContactContent);
  }

  if (page === "about.html") {
    listenToPageContent("about_page", applyAboutContent);
  }

  listenToSocialLinks();
}

startLiveContent();

// إعادة تطبيق اللغة عند تغييرها من نفس الصفحة
window.addEventListener("storage", (event) => {
  if (event.key === LANGUAGE_KEY) {
    window.location.reload();
  }
});
