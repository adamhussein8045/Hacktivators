import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const container = document.getElementById("eventsContainer");

if (container) {
  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  function renderEvents(events) {
    if (!events.length) {
      container.innerHTML = "<p>No events available right now.</p>";
      return;
    }

    container.innerHTML = events.map((event) => {
      const topics = Array.isArray(event.topics) ? event.topics : [];
      const status = event.status || "Upcoming";
      const date = event.date || "";

      return `
        <article class="event-card">
          <div class="event-top">
            <span class="event-date">${escapeHTML(date)}</span>
            <span class="event-status ${status.toLowerCase() === "upcoming" ? "upcoming" : ""}">
              ${escapeHTML(status)}
            </span>
          </div>

          <h2>${escapeHTML(event.title || "Untitled event")}</h2>

          <p class="event-description">
            ${escapeHTML(event.description || "")}
          </p>

          <div class="event-topics">
            ${topics.map((topic) => `
              <div class="topic">
                <h3>${escapeHTML(topic)}</h3>
              </div>
            `).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  const eventsQuery = query(
    collection(db, "events"),
    orderBy("date", "asc")
  );

  onSnapshot(eventsQuery, (snapshot) => {
    const events = snapshot.docs.map((item) => item.data());
    renderEvents(events);
  }, (error) => {
    console.error("Events loading error:", error);
    container.innerHTML = "<p>Unable to load events.</p>";
  });
}
