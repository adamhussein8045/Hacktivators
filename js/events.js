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

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return escapeHTML(value);
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function renderEvents(events) {
    if (!events.length) {
      container.innerHTML = `
        <p class="events-empty">
          No events available right now.
        </p>
      `;
      return;
    }

    container.innerHTML = events.map((event) => {
      const title = escapeHTML(event.title || "Untitled event");
      const description = escapeHTML(event.description || "");
      const date = formatDate(event.date);
      const status = escapeHTML(event.status || "Upcoming");

      const topics = Array.isArray(event.topics)
        ? event.topics
        : [];

      const topicsHTML = topics.map((topic) => `
        <span class="event-topic">${escapeHTML(topic)}</span>
      `).join("");

      return `
        <article class="event-card">
          <div class="event-card-content">
            <span class="event-status">${status}</span>
            <h3>${title}</h3>
            <p class="event-date">${date}</p>
            <p class="event-description">${description}</p>
            <div class="event-topics">${topicsHTML}</div>
          </div>
        </article>
      `;
    }).join("");
  }

  const eventsQuery = query(
    collection(db, "events"),
    orderBy("date", "asc")
  );

  onSnapshot(
    eventsQuery,
    (snapshot) => {
      const events = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      renderEvents(events);
    },
    (error) => {
      console.error("Could not load events:", error);
      container.innerHTML = `
        <p class="events-error">
          Could not load events. Please try again later.
        </p>
      `;
    }
  );
}
