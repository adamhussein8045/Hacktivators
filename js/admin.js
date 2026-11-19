
import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// Only this Firebase UID is authorized to use the dashboard.
const ADMIN_UID = "t09cS5GynEfyM6AbNGeiCzzwEGI2";

// Elements
const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");

const teamForm = document.getElementById("teamForm");
const teamList = document.getElementById("teamList");
const teamId = document.getElementById("teamId");
const memberName = document.getElementById("memberName");
const memberRole = document.getElementById("memberRole");
const memberDepartment = document.getElementById("memberDepartment");
const memberInitials = document.getElementById("memberInitials");
const teamFormTitle = document.getElementById("teamFormTitle");
const saveMemberButton = document.getElementById("saveMemberButton");
const cancelMemberEdit = document.getElementById("cancelMemberEdit");

const eventForm = document.getElementById("eventForm");
const eventsList = document.getElementById("eventsList");
const eventId = document.getElementById("eventId");
const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventStatus = document.getElementById("eventStatus");
const eventTopics = document.getElementById("eventTopics");
const eventDescription = document.getElementById("eventDescription");
const eventFormTitle = document.getElementById("eventFormTitle");
const saveEventButton = document.getElementById("saveEventButton");
const cancelEventEdit = document.getElementById("cancelEventEdit");

const connectionStatus = document.getElementById("connectionStatus");
const globalMessage = document.getElementById("globalMessage");
const pageTitle = document.getElementById("pageTitle");

let unsubscribeTeam = null;
let unsubscribeEvents = null;

// Security and display helpers
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function showMessage(message, isError = false) {
  globalMessage.textContent = message;
  globalMessage.classList.remove("hidden");

  globalMessage.style.color = isError ? "#ff9999" : "#a8eaff";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function hideMessage() {
  globalMessage.classList.add("hidden");
  globalMessage.textContent = "";
}

function showLogin(message = "") {
  loginPanel.style.display = "grid";
  dashboard.classList.add("hidden");
  dashboard.style.display = "none";
  loginMessage.textContent = message;
}

function showDashboard() {
  loginPanel.style.display = "none";
  dashboard.classList.remove("hidden");
  dashboard.style.display = "grid";
  loginMessage.textContent = "";
}

function stopListeners() {
  if (unsubscribeTeam) {
    unsubscribeTeam();
    unsubscribeTeam = null;
  }

  if (unsubscribeEvents) {
    unsubscribeEvents();
    unsubscribeEvents = null;
  }
}

// Navigation
document.querySelectorAll(".nav-btn[data-section]").forEach(button => {
  button.addEventListener("click", () => {
    const section = button.dataset.section;

    document.querySelectorAll(".nav-btn[data-section]").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelectorAll(".content-section").forEach(item => {
      item.classList.add("hidden");
    });

    const selectedSection = document.getElementById(
      `${section}Section`
    );

    if (selectedSection) {
      selectedSection.classList.remove("hidden");
    }

    const titles = {
      team: "Team Management",
      events: "Events Management",
      social: "Social Links",
      content: "Website Content"
    };

    pageTitle.textContent = titles[section] || "Dashboard";
    hideMessage();
  });
});

// Login
loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";
  loginMessage.textContent = "";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      showLogin("Access denied. This account is not an authorized admin.");
    }
  } catch (error) {
    console.error("Login error:", error);

    const messages = {
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/invalid-email": "Please enter a valid email.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/network-request-failed": "Network error. Check your internet."
    };

    showLogin(messages[error.code] || "Login failed. Please try again.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

async function importOriginalData() {
  const teamSnapshot = await getDocs(collection(db, "team_members"));
  const eventsSnapshot = await getDocs(collection(db, "events"));

  const originalMembers = [
    ["celia-ahmed", "Celia Ahmed", "Leader Of Team", "Team Leader", "CA"],
    ["omar-mohamed", "Omar Mohamed", "Co-Leader", "Leadership", "OM"],
    ["salma-emad", "Salma Emad", "Co-Leader", "Leadership", "SE"],
    ["logien-mohamed", "Logien Mohamed", "Co-Leader", "Leadership", "LM"],
    ["adam-hussein", "Adam Hussein", "Member Of Programming Department", "Programming", "AH"],
    ["youssef-khaled", "Youssef Khaled", "Photographer", "Photography", "YK"],
    ["lamar-abd-elmohsen", "Lamar Abd Elmohsen", "Photographer", "Photography", "LA"],
    ["saleen-ahmed", "Saleen Ahmed", "Designer & Video Editor", "Design & Media", "SA"],
    ["sagda-ahmed", "Sagda Ahmed", "Designer & Organizer", "Design & Organization", "SA"],
    ["omar-mostafa", "Omar Mostafa", "Member Of Programming Department", "Programming", "OM"],
    ["yassin-mohamed", "Yassin Mohamed", "Member Of Programming Department", "Programming", "YM"],
    ["hana-ahmed", "Hana Ahmed", "Designer", "Design", "HA"]
  ];

  const originalEvents = [
    {
      id: "event-27-october-2026",
      title: "Discover Your Potential",
      date: "2026-10-27",
      status: "Completed",
      description: "An introductory learning experience covering communication, creativity, programming, and game development.",
      topics: [
        "🧠 Emotional Intelligence",
        "🎨 Design Basics",
        "🧩 Block-Based Programming",
        "🎮 Game Development"
      ]
    },
    {
      id: "event-12-november-2026",
      title: "Creative Skills & Technology",
      date: "2026-11-12",
      status: "Completed",
      description: "A practical learning experience introducing participants to video editing, programming, and game creation.",
      topics: [
        "🎬 Video Editing",
        "💻 Block-Based Programming",
        "🎮 Game Development"
      ]
    },
    {
      id: "event-23-november-2026",
      title: "Presentation Skills & Technology Awareness",
      date: "2026-11-23",
      status: "Upcoming",
      description: "An upcoming learning experience focused on presentation skills, computer hardware, and understanding artificial intelligence.",
      topics: [
        "🎤 Presentation Skills",
        "🖥️ Inside a Computer",
        "🤖 Understanding AI",
        "⚠️ Technology Risks"
      ]
    }
  ];

  let importedMembers = 0;
  let importedEvents = 0;

  // Import members only if the collection is empty.
  if (teamSnapshot.empty) {
    for (const member of originalMembers) {
      const [id, name, role, department, initials] = member;

      await setDoc(doc(db, "team_members", id), {
        name,
        role,
        department,
        initials
      });

      importedMembers++;
    }
  }

  // Import events only if the collection is empty.
  if (eventsSnapshot.empty) {
    for (const event of originalEvents) {
      const { id, ...data } = event;

      await setDoc(doc(db, "events", id), data);

      importedEvents++;
    }
  }

  return { importedMembers, importedEvents };
}

// Authentication state
onAuthStateChanged(auth, async user => {
  stopListeners();

  if (!user) {
    showLogin();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    await signOut(auth);
    showLogin("Access denied. This account is not an authorized admin.");
    return;
  }

  showDashboard();
  hideMessage();
  startTeamListener();
  startEventsListener();
});

// Logout
logoutButton.addEventListener("click", async () => {
  try {
    stopListeners();
    await signOut(auth);
    showLogin();
  } catch (error) {
    console.error("Logout error:", error);
    showMessage("Could not sign out. Please try again.", true);
  }
});

// Team: listen for Firestore changes
function startTeamListener() {
  teamList.innerHTML = '<div class="empty">Loading team members...</div>';

  const teamQuery = query(
    collection(db, "team_members"),
    orderBy("name")
  );

  unsubscribeTeam = onSnapshot(
    teamQuery,
    snapshot => {
      connectionStatus.textContent = "● Firebase Connected";
      connectionStatus.style.color = "#36e6ad";

      if (snapshot.empty) {
        teamList.innerHTML = `
          <div class="empty">
            No team members found in Firebase yet.
          </div>
        `;
        return;
      }

      teamList.innerHTML = snapshot.docs.map(memberDoc => {
        const member = memberDoc.data();
        const id = escapeHTML(memberDoc.id);

        return `
          <article class="item">
            <div class="item-info">
              <h3>${escapeHTML(member.name || "Unnamed member")}</h3>
              <p>
                ${escapeHTML(member.role || "")}
                ·
                ${escapeHTML(member.department || "")}
              </p>
              <p>Initials: ${escapeHTML(member.initials || "")}</p>
            </div>

            <div class="item-actions">
              <button
                class="secondary-btn"
                type="button"
                data-action="edit-member"
                data-id="${id}"
              >Edit</button>

              <button
                class="danger-btn"
                type="button"
                data-action="delete-member"
                data-id="${id}"
              >Delete</button>
            </div>
          </article>
        `;
      }).join("");
    },
    error => {
      console.error("Team listener error:", error);
      connectionStatus.textContent = "Connection error";
      showMessage("Could not load team members. Check Firestore rules.", true);
    }
  );
}

// Team: add or update
teamForm.addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    name: memberName.value.trim(),
    role: memberRole.value.trim(),
    department: memberDepartment.value.trim(),
    initials: memberInitials.value.trim().toUpperCase()
  };

  if (!data.name || !data.role || !data.department) {
    showMessage("Please fill in all required member fields.", true);
    return;
  }

  saveMemberButton.disabled = true;
  saveMemberButton.textContent = "Saving...";

  try {
    if (teamId.value) {
      await updateDoc(
        doc(db, "team_members", teamId.value),
        data
      );

      showMessage("Team member updated successfully.");
    } else {
      await addDoc(collection(db, "team_members"), data);
      showMessage("Team member added successfully.");
    }

    resetTeamForm();
  } catch (error) {
    console.error("Save member error:", error);
    showMessage("Could not save member. Check your Firebase permissions.", true);
  } finally {
    saveMemberButton.disabled = false;
    saveMemberButton.textContent = "Save Member";
  }
});

// Team: edit or delete
teamList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit-member") {
    try {
      const snapshot = await getDocs(collection(db, "team_members"));
      const selected = snapshot.docs.find(item => item.id === id);

      if (!selected) {
        showMessage("Member not found.", true);
        return;
      }

      const member = selected.data();

      teamId.value = id;
      memberName.value = member.name || "";
      memberRole.value = member.role || "";
      memberDepartment.value = member.department || "";
      memberInitials.value = member.initials || "";

      teamFormTitle.textContent = "Edit Team Member";
      saveMemberButton.textContent = "Update Member";

      teamForm.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error(error);
      showMessage("Could not load member details.", true);
    }
  }

  if (action === "delete-member") {
    if (!confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "team_members", id));
      showMessage("Team member deleted successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Could not delete member.", true);
    }
  }
});

function resetTeamForm() {
  teamForm.reset();
  teamId.value = "";
  teamFormTitle.textContent = "Add Team Member";
  saveMemberButton.textContent = "Save Member";
}

cancelMemberEdit.addEventListener("click", resetTeamForm);

// Events: listen for Firestore changes
function startEventsListener() {
  eventsList.innerHTML = '<div class="empty">Loading events...</div>';

  const eventsQuery = query(
    collection(db, "events"),
    orderBy("date")
  );

  unsubscribeEvents = onSnapshot(
    eventsQuery,
    snapshot => {
      if (snapshot.empty) {
        eventsList.innerHTML = `
          <div class="empty">
            No events found in Firebase yet.
          </div>
        `;
        return;
      }

      eventsList.innerHTML = snapshot.docs.map(eventDoc => {
        const item = eventDoc.data();
        const id = escapeHTML(eventDoc.id);

        return `
          <article class="item">
            <div class="item-info">
              <h3>${escapeHTML(item.title || "Untitled event")}</h3>
              <p>${escapeHTML(item.date || "")} · ${escapeHTML(item.status || "")}</p>
              <p>${escapeHTML(item.description || "")}</p>
              <p>${Array.isArray(item.topics)
                ? item.topics.map(escapeHTML).join(" · ")
                : ""
              }</p>
            </div>

            <div class="item-actions">
              <button
                class="secondary-btn"
                type="button"
                data-action="edit-event"
                data-id="${id}"
              >Edit</button>

              <button
                class="danger-btn"
                type="button"
                data-action="delete-event"
                data-id="${id}"
              >Delete</button>
            </div>
          </article>
        `;
      }).join("");
    },
    error => {
      console.error("Events listener error:", error);
      showMessage("Could not load events. Check Firestore rules.", true);
    }
  );
}

// Events: add or update
eventForm.addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    title: eventTitle.value.trim(),
    date: eventDate.value,
    status: eventStatus.value,
    description: eventDescription.value.trim(),
    topics: eventTopics.value
      .split("\n")
      .map(topic => topic.trim())
      .filter(Boolean)
  };

  if (!data.title || !data.date || !data.description || data.topics.length === 0) {
    showMessage("Please complete all event fields and add at least one topic.", true);
    return;
  }

  saveEventButton.disabled = true;
  saveEventButton.textContent = "Saving...";

  try {
    if (eventId.value) {
      await updateDoc(
        doc(db, "events", eventId.value),
        data
      );

      showMessage("Event updated successfully.");
    } else {
      await addDoc(collection(db, "events"), data);
      showMessage("Event added successfully.");
    }

    resetEventForm();
  } catch (error) {
    console.error("Save event error:", error);
    showMessage("Could not save event. Check your Firebase permissions.", true);
  } finally {
    saveEventButton.disabled = false;
    saveEventButton.textContent = "Save Event";
  }
});

// Events: edit or delete
eventsList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit-event") {
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const selected = snapshot.docs.find(item => item.id === id);

      if (!selected) {
        showMessage("Event not found.", true);
        return;
      }

      const item = selected.data();

      eventId.value = id;
      eventTitle.value = item.title || "";
      eventDate.value = item.date || "";
      eventStatus.value = item.status || "Upcoming";
      eventDescription.value = item.description || "";
      eventTopics.value = Array.isArray(item.topics)
        ? item.topics.join("\n")
        : "";

      eventFormTitle.textContent = "Edit Event";
      saveEventButton.textContent = "Update Event";

      eventForm.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error(error);
      showMessage("Could not load event details.", true);
    }
  }

  if (action === "delete-event") {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "events", id));
      showMessage("Event deleted successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Could not delete event.", true);
    }
  }
});

function resetEventForm() {
  eventForm.reset();
  eventId.value = "";
  eventFormTitle.textContent = "Add Event";
  saveEventButton.textContent = "Save Event";
}

cancelEventEdit.addEventListener("click", resetEventForm);
