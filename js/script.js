
"use strict";

/* =================================
   HACKTIVATORS - MAIN JAVASCRIPT
================================= */

document.addEventListener("DOMContentLoaded", () => {

  // 1. FOOTER YEAR
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 2. DARK / LIGHT MODE
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  if (themeToggle) {

    const savedTheme = localStorage.getItem("hacktivators-theme");

    if (savedTheme === "light") {
      body.classList.add("light-mode");
    }

    updateThemeButton();

    themeToggle.addEventListener("click", () => {

      body.classList.toggle("light-mode");

      const currentTheme = body.classList.contains("light-mode")
        ? "light"
        : "dark";

      localStorage.setItem("hacktivators-theme", currentTheme);

      updateThemeButton();

    });
  }

  function updateThemeButton() {

    if (!themeToggle) return;

    const isLight = body.classList.contains("light-mode");

    themeToggle.textContent = isLight ? "☾" : "☀";

    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode"
    );
  }

  // 3. SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll(
    ".section, .project-card"
  );

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            observerInstance.unobserve(entry.target);

          }

        });

      },
      {
        threshold: 0.12
      }
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });

  } else {

    revealElements.forEach((element) => {
      element.classList.add("visible");
    });

  }

  // 4. NAVIGATION ACTIVE STATE
  const navLinks = document.querySelectorAll(".navbar nav a");

  navLinks.forEach((link) => {

    link.addEventListener("click", () => {

      navLinks.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

    });

  });

  // 5. BUTTON INTERACTION
  const primaryButtons = document.querySelectorAll(".primary-btn");

  primaryButtons.forEach((button) => {

    button.addEventListener("mouseenter", () => {
      button.style.setProperty("--hovered", "1");
    });

    button.addEventListener("mouseleave", () => {
      button.style.removeProperty("--hovered");
    });

  });

  // 6. CONSOLE BRANDING
  console.log(
    "%c HACKTIVATORS ",
    "background:#0878ed;color:white;font-size:20px;font-weight:900;padding:10px;"
  );

  console.log(
    "%c Building the future through technology.",
    "color:#00d5ff;font-size:13px;"
  );

});
