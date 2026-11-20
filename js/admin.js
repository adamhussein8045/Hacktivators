
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
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const ADMIN_UID = "t09cS5GynEfyM6AbNGeiCzzwEGI2";
const $ = id => document.getElementById(id);

const loginPanel = $("loginPanel");
const dashboard = $("dashboard");
const loginForm = $("loginForm");
const loginButton = $("loginButton");
const loginMessage = $("loginMessage");
const logoutButton = $("logoutButton");

const teamForm = $("teamForm");
const teamList = $("teamList");
const teamId = $("teamId");
const memberNameEn = $("memberNameEn");
const memberNameAr = $("memberNameAr");
const memberRoleEn = $("memberRoleEn");
const memberRoleAr = $("memberRoleAr");
const memberDepartment = $("memberDepartment");
const memberInitials = $("memberInitials");
const teamFormTitle = $("teamFormTitle");
const saveMemberButton = $("saveMemberButton");
const cancelMemberEdit = $("cancelMemberEdit");

const eventForm = $("eventForm");
const eventsList = $("eventsList");
const eventId = $("eventId");
const eventTitle = $("eventTitle");
const eventDate = $("eventDate");
const eventStatus = $("eventStatus");
const eventTopics = $("eventTopics");
const eventDescription = $("eventDescription");
const eventFormTitle = $("eventFormTitle");
const saveEventButton = $("saveEventButton");
const cancelEventEdit = $("cancelEventEdit");

const connectionStatus = $("connectionStatus");
const globalMessage = $("globalMessage");
const pageTitle = $("pageTitle");
const arabicButton = $("adminArabic");
const englishButton = $("adminEnglish");

const socialForm = $("socialForm");
const socialVisibility = $("socialVisibility");
const contentForm = $("contentForm");

let unsubscribeTeam = null;
let unsubscribeEvents = null;
let latestTeamDocs = [];
let latestEventsDocs = [];
let currentLanguage = localStorage.getItem("hacktivators_admin_language") || "en";
let currentSection = "team";

if (!["ar", "en"].includes(currentLanguage)) currentLanguage = "en";

const translations = {
  "Team Management": "إدارة الفريق",
  "Events Management": "إدارة الفعاليات",
  "Social Links": "روابط التواصل",
  "Website Content": "محتوى الموقع",
  "Dashboard": "لوحة التحكم",
  "Add Team Member": "إضافة عضو للفريق",
  "Edit Team Member": "تعديل عضو الفريق",
  "Save Member": "حفظ العضو",
  "Update Member": "تحديث العضو",
  "Clear Form": "مسح النموذج",
  "Add Event": "إضافة فعالية",
  "Edit Event": "تعديل الفعالية",
  "Save Event": "حفظ الفعالية",
  "Update Event": "تحديث الفعالية",
  "Saving...": "جاري الحفظ...",
  "Edit": "تعديل",
  "Delete": "حذف",
  "Upcoming": "قادمة",
  "Completed": "مكتملة",
  "No team members found.": "لم يتم العثور على أعضاء.",
  "No events found.": "لم يتم العثور على فعاليات.",
  "Loading...": "جاري التحميل...",
  "Initials:": "الأحرف الأولى:",
  "Unnamed member": "عضو بدون اسم",
  "Untitled event": "فعالية بدون عنوان",
  "Save Social Links": "حفظ روابط التواصل",
  "Save Website Content": "حفظ محتوى الموقع",
  "Reload": "إعادة تحميل",
  "Instagram": "إنستجرام",
  "TikTok": "تيك توك",
  "Facebook": "فيسبوك",
  "WhatsApp": "واتساب",
  "Email": "البريد الإلكتروني",
  "Enabled": "مفعّل",
  "Disabled": "مخفي",
  "Enable": "إظهار",
  "Disable": "إخفاء"
};

const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([en, ar]) => [ar, en])
);

function t(text) {
  if (currentLanguage === "en") return reverseTranslations[text] || text;
  return translations[text] || text;
}

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("hacktivators_admin_language", language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-ar]").forEach(element => {
    element.textContent = element.dataset[language];
  });

  document.title = language === "ar"
    ? "Hacktivators | لوحة تحكم الإدارة"
    : "Hacktivators | Admin Dashboard";

  arabicButton.classList.toggle("active", language === "ar");
  englishButton.classList.toggle("active", language === "en");

  updatePageTitle();
  renderTeamMembers();
  renderEvents();
  renderSocialVisibility();
  updateFormButtonLabels();
}

function updatePageTitle() {
  const titles = {
    team: "Team Management",
    events: "Events Management",
    social: "Social Links",
    content: "Website Content"
  };

  pageTitle.textContent = t(titles[currentSection] || "Dashboard");
}

function updateFormButtonLabels() {
  if (teamId.value) {
    teamFormTitle.textContent = t("Edit Team Member");
    saveMemberButton.textContent = t("Update Member");
  } else {
    teamFormTitle.textContent = t("Add Team Member");
    saveMemberButton.textContent = t("Save Member");
  }

  if (eventId.value) {
    eventFormTitle.textContent = t("Edit Event");
    saveEventButton.textContent = t("Update Event");
  } else {
    eventFormTitle.textContent = t("Add Event");
    saveEventButton.textContent = t("Save Event");
  }
}

arabicButton.addEventListener("click", () => setLanguage("ar"));
englishButton.addEventListener("click", () => setLanguage("en"));

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showMessage(message, isError = false) {
  globalMessage.textContent = message;
  globalMessage.classList.remove("hidden");
  globalMessage.style.color = isError ? "#a93248" : "#68452f";
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (unsubscribeTeam) unsubscribeTeam();
  if (unsubscribeEvents) unsubscribeEvents();

  unsubscribeTeam = null;
  unsubscribeEvents = null;
  latestTeamDocs = [];
  latestEventsDocs = [];
}

// NAVIGATION
document.querySelectorAll(".nav-btn[data-section]").forEach(button => {
  button.addEventListener("click", async () => {
    currentSection = button.dataset.section;

    document.querySelectorAll(".nav-btn[data-section]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".content-section").forEach(section => {
      section.classList.add("hidden");
    });

    $(`${currentSection}Section`)?.classList.remove("hidden");

    updatePageTitle();
    hideMessage();

    if (currentSection === "social") await loadSocialLinks();
    if (currentSection === "content") await loadWebsiteContent();
  });
});

// LOGIN
loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  loginButton.disabled = true;
  loginButton.textContent = currentLanguage === "ar"
    ? "جاري تسجيل الدخول..."
    : "Signing in...";

  loginMessage.textContent = "";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      $("email").value.trim(),
      $("password").value
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);

      showLogin(currentLanguage === "ar"
        ? "هذا الحساب غير مصرح له بالدخول."
        : "This account is not an authorized admin.");
    }
  } catch (error) {
    console.error("Login error:", error);

    const messages = {
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/invalid-email": "Please enter a valid email.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/network-request-failed": "Network error. Check your internet."
    };

    const message = messages[error.code] || "Login failed. Please try again.";

    loginMessage.textContent = currentLanguage === "ar"
      ? ({
          "Incorrect email or password.": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
          "Please enter a valid email.": "أدخل بريدًا إلكترونيًا صحيحًا.",
          "Too many attempts. Try again later.": "محاولات كثيرة. حاول لاحقًا.",
          "Network error. Check your internet.": "تحقق من اتصال الإنترنت.",
          "Login failed. Please try again.": "فشل تسجيل الدخول. حاول مرة أخرى."
        }[message] || message)
      : message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = currentLanguage === "ar"
      ? "تسجيل الدخول"
      : "Sign In";
  }
});

// ORIGINAL TEAM DATA
const originalMembers = [
  {id:"celia-ahmed",nameEn:"Celia Ahmed",nameAr:"سيليا أحمد",roleEn:"Leader Of Team",roleAr:"قائدة الفريق",department:"Leadership",initials:"CA"},
  {id:"omar-mohamed",nameEn:"Omar Mohamed",nameAr:"عمر محمد",roleEn:"Co-Leader",roleAr:"نائب قائد الفريق",department:"Leadership",initials:"OM"},
  {id:"salma-emad",nameEn:"Salma Emad",nameAr:"سلمى عماد",roleEn:"Co-Leader",roleAr:"نائبة قائد الفريق",department:"Leadership",initials:"SE"},
  {id:"logien-mohamed",nameEn:"Logien Mohamed",nameAr:"لوجين محمد",roleEn:"Co-Leader",roleAr:"نائبة قائد الفريق",department:"Leadership",initials:"LM"},
  {id:"adam-hussein",nameEn:"Adam Hussein",nameAr:"آدم حسين",roleEn:"Member Of Programming Department",roleAr:"عضو بقسم البرمجة",department:"Programming",initials:"AH"},
  {id:"youssef-khaled",nameEn:"Youssef Khaled",nameAr:"يوسف خالد",roleEn:"Photographer",roleAr:"مصور",department:"Photography",initials:"YK"},
  {id:"lamar-abd-elmohsen",nameEn:"Lamar Abd Elmohsen",nameAr:"لمار عبد المحسن",roleEn:"Photographer",roleAr:"مصورة",department:"Photography",initials:"LA"},
  {id:"saleen-ahmed",nameEn:"Saleen Ahmed",nameAr:"سالين أحمد",roleEn:"Designer & Video Editor",roleAr:"مصممة ومحررة فيديو",department:"Design & Media",initials:"SA"},
  {id:"sagda-ahmed",nameEn:"Sagda Ahmed",nameAr:"سجدة أحمد",roleEn:"Designer & Organizer",roleAr:"مصممة ومنظمة",department:"Design & Organization",initials:"SA"},
  {id:"omar-mostafa",nameEn:"Omar Mostafa",nameAr:"عمر مصطفى",roleEn:"Member Of Programming Department",roleAr:"عضو بقسم البرمجة",department:"Programming",initials:"OM"},
  {id:"yassin-mohamed",nameEn:"Yassin Mohamed",nameAr:"ياسين محمد",roleEn:"Member Of Programming Department",roleAr:"عضو بقسم البرمجة",department:"Programming",initials:"YM"},
  {id:"hana-ahmed",nameEn:"Hana Ahmed",nameAr:"هنا أحمد",roleEn:"Designer",roleAr:"مصممة",department:"Design",initials:"HA"}
];

const originalEvents = [
  {
    id:"event-27-october-2026",
    title:"Discover Your Potential",
    date:"2026-10-27",
    status:"Completed",
    description:"An introductory learning experience covering communication, creativity, programming, and game development.",
    topics:["🧠 Emotional Intelligence","🎨 Design Basics","🧩 Block-Based Programming","🎮 Game Development"]
  },
  {
    id:"event-12-november-2026",
    title:"Creative Skills & Technology",
    date:"2026-11-12",
    status:"Completed",
    description:"A practical learning experience introducing participants to video editing, programming, and game creation.",
    topics:["🎬 Video Editing","💻 Block-Based Programming","🎮 Game Development"]
  },
  {
    id:"event-23-november-2026",
    title:"Presentation Skills & Technology Awareness",
    date:"2026-11-23",
    status:"Upcoming",
    description:"An upcoming learning experience focused on presentation skills, computer hardware, and understanding artificial intelligence.",
    topics:["🎤 Presentation Skills","🖥️ Inside a Computer","🤖 Understanding AI","⚠️ Technology Risks"]
  }
];

async function importOriginalData() {
  const teamSnapshot = await getDocs(collection(db, "team_members"));
  const eventsSnapshot = await getDocs(collection(db, "events"));

  let importedMembers = 0;
  let importedEvents = 0;

  if (teamSnapshot.empty) {
    for (const member of originalMembers) {
      await setDoc(doc(db, "team_members", member.id), {
        ...member,
        name: member.nameEn,
        role: member.roleEn
      });

      importedMembers++;
    }
  } else {
    const migrationRef = doc(db, "site_content", "team_bilingual_v1");
    const migrationSnapshot = await getDoc(migrationRef);

    if (!migrationSnapshot.exists()) {
      for (const member of originalMembers) {
        const memberRef = doc(db, "team_members", member.id);
        const existing = await getDoc(memberRef);

        if (!existing.exists()) continue;

        const old = existing.data();

        await setDoc(memberRef, {
          nameEn: old.nameEn || old.name || member.nameEn,
          nameAr: old.nameAr || member.nameAr,
          roleEn: old.roleEn || old.role || member.roleEn,
          roleAr: old.roleAr || member.roleAr,
          name: old.name || member.nameEn,
          role: old.role || member.roleEn
        }, { merge: true });

        importedMembers++;
      }

      await setDoc(migrationRef, {
        completed: true,
        completedAt: new Date().toISOString()
      });
    }
  }

  if (eventsSnapshot.empty) {
    for (const item of originalEvents) {
      const { id, ...data } = item;

      await setDoc(doc(db, "events", id), data);
      importedEvents++;
    }
  }

  return { importedMembers, importedEvents };
}

// AUTH STATE
onAuthStateChanged(auth, async user => {
  stopListeners();

  if (!user) {
    showLogin();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    await signOut(auth);

    showLogin(currentLanguage === "ar"
      ? "هذا الحساب غير مصرح له بالدخول."
      : "This account is not an authorized admin.");

    return;
  }

  showDashboard();
  hideMessage();

  try {
    await importOriginalData();

    startTeamListener();
    startEventsListener();

    await loadSocialLinks();
    await loadWebsiteContent();
  } catch (error) {
    console.error("Admin initialization error:", error);

    startTeamListener();
    startEventsListener();

    showMessage(currentLanguage === "ar"
      ? "حدثت مشكلة أثناء تحميل بيانات الإدارة. راجع صلاحيات Firebase."
      : "Could not initialize admin data. Check Firebase permissions.", true);
  }

  setLanguage(currentLanguage);
});

// LOGOUT
logoutButton.addEventListener("click", async () => {
  try {
    stopListeners();
    await signOut(auth);
    showLogin();
  } catch (error) {
    console.error("Logout error:", error);

    showMessage(currentLanguage === "ar"
      ? "تعذر تسجيل الخروج."
      : "Could not sign out.", true);
  }
});

// TEAM RENDER
function renderTeamMembers() {
  if (!latestTeamDocs.length) {
    teamList.innerHTML = `<div class="empty">${escapeHTML(t("No team members found."))}</div>`;
    return;
  }

  teamList.innerHTML = latestTeamDocs.map(memberDoc => {
    const member = memberDoc.data();

    const name = currentLanguage === "ar"
      ? member.nameAr || member.name || ""
      : member.nameEn || member.name || "";

    const role = currentLanguage === "ar"
      ? member.roleAr || member.role || ""
      : member.roleEn || member.role || "";

    return `
      <article class="item">
        <div class="item-info">
          <h3>${escapeHTML(name || t("Unnamed member"))}</h3>
          <p>${escapeHTML(role)} · ${escapeHTML(member.department || "")}</p>
          <p>${escapeHTML(t("Initials:"))} ${escapeHTML(member.initials || "")}</p>
        </div>

        <div class="item-actions">
          <button class="secondary-btn" type="button"
            data-action="edit-member"
            data-id="${escapeHTML(memberDoc.id)}">
            ${escapeHTML(t("Edit"))}
          </button>

          <button class="danger-btn" type="button"
            data-action="delete-member"
            data-id="${escapeHTML(memberDoc.id)}">
            ${escapeHTML(t("Delete"))}
          </button>
        </div>
      </article>`;
  }).join("");
}

function startTeamListener() {
  teamList.innerHTML = `<div class="empty">${escapeHTML(t("Loading..."))}</div>`;

  unsubscribeTeam = onSnapshot(
    query(collection(db, "team_members"), orderBy("name")),
    snapshot => {
      latestTeamDocs = snapshot.docs;

      connectionStatus.textContent = currentLanguage === "ar"
        ? "● متصل بـ Firebase"
        : "● Firebase Connected";

      renderTeamMembers();
    },
    error => {
      console.error("Team listener:", error);

      connectionStatus.textContent = currentLanguage === "ar"
        ? "خطأ في الاتصال"
        : "Connection error";

      showMessage(currentLanguage === "ar"
        ? "تعذر تحميل أعضاء الفريق. تحقق من قواعد Firestore."
        : "Could not load team members. Check Firestore rules.", true);
    }
  );
}

// TEAM SAVE
teamForm.addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    nameEn: memberNameEn.value.trim(),
    nameAr: memberNameAr.value.trim(),
    roleEn: memberRoleEn.value.trim(),
    roleAr: memberRoleAr.value.trim(),
    name: memberNameEn.value.trim(),
    role: memberRoleEn.value.trim(),
    department: memberDepartment.value.trim(),
    initials: memberInitials.value.trim().toUpperCase()
  };

  if (!data.nameEn || !data.nameAr || !data.roleEn || !data.roleAr || !data.department) {
    showMessage(currentLanguage === "ar"
      ? "أكمل جميع الحقول المطلوبة."
      : "Please fill in all required fields.", true);

    return;
  }

  saveMemberButton.disabled = true;
  saveMemberButton.textContent = t("Saving...");

  try {
    if (teamId.value) {
      await updateDoc(doc(db, "team_members", teamId.value), data);

      showMessage(currentLanguage === "ar"
        ? "تم تحديث العضو بنجاح."
        : "Team member updated successfully.");
    } else {
      await addDoc(collection(db, "team_members"), data);

      showMessage(currentLanguage === "ar"
        ? "تمت إضافة العضو بنجاح."
        : "Team member added successfully.");
    }

    resetTeamForm();
  } catch (error) {
    console.error("Save member:", error);

    showMessage(currentLanguage === "ar"
      ? "تعذر حفظ العضو. تحقق من صلاحيات Firebase."
      : "Could not save member. Check Firebase permissions.", true);
  } finally {
    saveMemberButton.disabled = false;
    updateFormButtonLabels();
  }
});

teamList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const selected = latestTeamDocs.find(item => item.id === button.dataset.id);
  if (!selected) return;

  if (button.dataset.action === "edit-member") {
    const member = selected.data();

    teamId.value = selected.id;
    memberNameEn.value = member.nameEn || member.name || "";
    memberNameAr.value = member.nameAr || "";
    memberRoleEn.value = member.roleEn || member.role || "";
    memberRoleAr.value = member.roleAr || "";
    memberDepartment.value = member.department || "";
    memberInitials.value = member.initials || "";

    updateFormButtonLabels();
    teamForm.scrollIntoView({ behavior: "smooth" });
  }

  if (button.dataset.action === "delete-member") {
    if (!confirm(currentLanguage === "ar"
      ? "هل تريد حذف هذا العضو؟"
      : "Delete this member?")) return;

    try {
      await deleteDoc(doc(db, "team_members", selected.id));

      showMessage(currentLanguage === "ar"
        ? "تم حذف العضو."
        : "Member deleted.");
    } catch (error) {
      console.error(error);

      showMessage(currentLanguage === "ar"
        ? "تعذر حذف العضو."
        : "Could not delete member.", true);
    }
  }
});

function resetTeamForm() {
  teamForm.reset();
  teamId.value = "";
  updateFormButtonLabels();
}

cancelMemberEdit.addEventListener("click", resetTeamForm);

// EVENTS RENDER
function renderEvents() {
  if (!latestEventsDocs.length) {
    eventsList.innerHTML = `<div class="empty">${escapeHTML(t("No events found."))}</div>`;
    return;
  }

  eventsList.innerHTML = latestEventsDocs.map(eventDoc => {
    const item = eventDoc.data();

    return `
      <article class="item">
        <div class="item-info">
          <h3>${escapeHTML(item.title || t("Untitled event"))}</h3>
          <p>${escapeHTML(item.date || "")} · ${escapeHTML(t(item.status || ""))}</p>
          <p>${escapeHTML(item.description || "")}</p>
          <p>${Array.isArray(item.topics) ? item.topics.map(escapeHTML).join(" · ") : ""}</p>
        </div>

        <div class="item-actions">
          <button class="secondary-btn" type="button"
            data-action="edit-event"
            data-id="${escapeHTML(eventDoc.id)}">
            ${escapeHTML(t("Edit"))}
          </button>

          <button class="danger-btn" type="button"
            data-action="delete-event"
            data-id="${escapeHTML(eventDoc.id)}">
            ${escapeHTML(t("Delete"))}
          </button>
        </div>
      </article>`;
  }).join("");
}

function startEventsListener() {
  eventsList.innerHTML = `<div class="empty">${escapeHTML(t("Loading..."))}</div>`;

  unsubscribeEvents = onSnapshot(
    query(collection(db, "events"), orderBy("date")),
    snapshot => {
      latestEventsDocs = snapshot.docs;
      renderEvents();
    },
    error => {
      console.error("Events listener:", error);

      showMessage(currentLanguage === "ar"
        ? "تعذر تحميل الفعاليات. تحقق من قواعد Firestore."
        : "Could not load events. Check Firestore rules.", true);
    }
  );
}

// EVENTS SAVE
eventForm.addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    title: eventTitle.value.trim(),
    date: eventDate.value,
    status: eventStatus.value,
    description: eventDescription.value.trim(),
    topics: eventTopics.value.split("\n").map(item => item.trim()).filter(Boolean)
  };

  if (!data.title || !data.date || !data.description || !data.topics.length) {
    showMessage(currentLanguage === "ar"
      ? "أكمل بيانات الفعالية وأضف موضوعًا واحدًا على الأقل."
      : "Complete all event fields and add at least one topic.", true);

    return;
  }

  saveEventButton.disabled = true;
  saveEventButton.textContent = t("Saving...");

  try {
    if (eventId.value) {
      await updateDoc(doc(db, "events", eventId.value), data);

      showMessage(currentLanguage === "ar"
        ? "تم تحديث الفعالية."
        : "Event updated.");
    } else {
      await addDoc(collection(db, "events"), data);

      showMessage(currentLanguage === "ar"
        ? "تمت إضافة الفعالية."
        : "Event added.");
    }

    resetEventForm();
  } catch (error) {
    console.error("Save event:", error);

    showMessage(currentLanguage === "ar"
      ? "تعذر حفظ الفعالية."
      : "Could not save event.", true);
  } finally {
    saveEventButton.disabled = false;
    updateFormButtonLabels();
  }
});

eventsList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const selected = latestEventsDocs.find(item => item.id === button.dataset.id);
  if (!selected) return;

  if (button.dataset.action === "edit-event") {
    const item = selected.data();

    eventId.value = selected.id;
    eventTitle.value = item.title || "";
    eventDate.value = item.date || "";
    eventStatus.value = item.status || "Upcoming";
    eventDescription.value = item.description || "";
    eventTopics.value = Array.isArray(item.topics) ? item.topics.join("\n") : "";

    updateFormButtonLabels();
    eventForm.scrollIntoView({ behavior: "smooth" });
  }

  if (button.dataset.action === "delete-event") {
    if (!confirm(currentLanguage === "ar"
      ? "هل تريد حذف هذه الفعالية؟"
      : "Delete this event?")) return;

    try {
      await deleteDoc(doc(db, "events", selected.id));

      showMessage(currentLanguage === "ar"
        ? "تم حذف الفعالية."
        : "Event deleted.");
    } catch (error) {
      console.error(error);

      showMessage(currentLanguage === "ar"
        ? "تعذر حذف الفعالية."
        : "Could not delete event.", true);
    }
  }
});

function resetEventForm() {
  eventForm.reset();
  eventId.value = "";
  updateFormButtonLabels();
}

cancelEventEdit.addEventListener("click", resetEventForm);

// SOCIAL LINKS
const socialDefaults = {
  instagram: {
    label: "Instagram",
    url: "https://www.instagram.com/hacktivators.5",
    enabled: true
  },
  tiktok: {
    label: "TikTok",
    url: "https://www.tiktok.com/@hacktivators",
    enabled: true
  },
  facebook: {
    label: "Facebook",
    url: "https://www.facebook.com/p/Hacktivators-Team-61590669747612/",
    enabled: true
  },
  whatsapp: {
    label: "WhatsApp",
    url: "https://whatsapp.com/channel/0029Vb8YkXy0LKZ5swUnJ32V",
    enabled: true
  },
  email: {
    label: "Email",
    url: "hacktivators5@gmail.com",
    enabled: true
  }
};

const socialInputIds = {
  instagram: "socialInstagram",
  tiktok: "socialTikTok",
  facebook: "socialFacebook",
  whatsapp: "socialWhatsApp",
  email: "socialEmail"
};

let socialData = {};

async function loadSocialLinks() {
  socialVisibility.innerHTML = `<div class="empty">${escapeHTML(t("Loading..."))}</div>`;

  try {
    socialData = {};

    for (const [id, defaults] of Object.entries(socialDefaults)) {
      const reference = doc(db, "social_links", id);
      const snapshot = await getDoc(reference);

      if (!snapshot.exists()) {
        await setDoc(reference, defaults);
        socialData[id] = { ...defaults };
      } else {
        socialData[id] = { ...defaults, ...snapshot.data() };
      }

      const input = $(socialInputIds[id]);

      if (input) {
        input.value = socialData[id].url || "";
      }
    }

    renderSocialVisibility();
  } catch (error) {
    console.error("Load social links:", error);

    socialVisibility.innerHTML = `
      <div class="empty">
        ${currentLanguage === "ar"
          ? "تعذر تحميل الروابط. تحقق من صلاحيات Firestore."
          : "Could not load links. Check Firestore permissions."}
      </div>`;
  }
}

// SOCIAL LINKS RENDER
// كل رابط يظهر بجانبه Edit و Disable / Enable
function renderSocialVisibility() {
  if (!socialVisibility) return;

  socialVisibility.innerHTML = Object.entries(socialDefaults).map(([id, defaults]) => {
    const data = socialData[id] || defaults;
    const label = currentLanguage === "ar"
      ? t(defaults.label)
      : defaults.label;

    return `
      <article class="item">
        <div class="item-info">
          <h3>${escapeHTML(label)}</h3>

          <p>${escapeHTML(data.url || "")}</p>

          <p>
            ${data.enabled
              ? (currentLanguage === "ar" ? "ظاهر على الموقع" : "Visible on website")
              : (currentLanguage === "ar" ? "مخفي من الموقع" : "Hidden from website")}
          </p>
        </div>

        <div class="item-actions">
          <button
            class="secondary-btn"
            type="button"
            data-social-edit="${id}">
            ${currentLanguage === "ar" ? "تعديل" : "Edit"}
          </button>

          <button
            class="secondary-btn"
            type="button"
            data-social-toggle="${id}">
            ${data.enabled
              ? (currentLanguage === "ar" ? "إخفاء" : "Disable")
              : (currentLanguage === "ar" ? "إظهار" : "Enable")}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// SOCIAL LINKS SAVE
socialForm.addEventListener("submit", async event => {
  event.preventDefault();

  const button = $("saveSocialButton");

  button.disabled = true;
  button.textContent = t("Saving...");

  try {
    for (const [id, inputId] of Object.entries(socialInputIds)) {
      const url = $(inputId).value.trim();
      const previous = socialData[id] || socialDefaults[id];

      if (url && id !== "email") {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error(`Invalid URL for ${id}`);
        }
      }

      if (id === "email" && url && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) {
        throw new Error("Invalid email address");
      }

      const updated = {
        label: socialDefaults[id].label,
        url,
        enabled: previous.enabled !== false
      };

      await setDoc(doc(db, "social_links", id), updated, { merge: true });

      socialData[id] = updated;
    }

    renderSocialVisibility();

    showMessage(currentLanguage === "ar"
      ? "تم حفظ روابط التواصل في Firebase."
      : "Social links saved to Firebase.");
  } catch (error) {
    console.error("Save social links:", error);

    showMessage(currentLanguage === "ar"
      ? "تعذر حفظ الروابط. راجع صحة الروابط وصلاحيات Firebase."
      : "Could not save links. Check the URLs and Firebase permissions.", true);
  } finally {
    button.disabled = false;
    button.textContent = t("Save Social Links");
  }
});

// SOCIAL LINKS EDIT + ENABLE / DISABLE
socialVisibility.addEventListener("click", async event => {
  const editButton = event.target.closest("[data-social-edit]");
  const toggleButton = event.target.closest("[data-social-toggle]");

  // EDIT
  if (editButton) {
    const id = editButton.dataset.socialEdit;
    const input = $(socialInputIds[id]);

    if (!input) return;

    input.value = socialData[id]?.url || socialDefaults[id].url;

    socialForm.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    setTimeout(() => input.focus(), 400);

    return;
  }

  // ENABLE / DISABLE
  if (toggleButton) {
    const id = toggleButton.dataset.socialToggle;
    const current = socialData[id] || socialDefaults[id];

    try {
      toggleButton.disabled = true;

      const updated = {
        ...current,
        enabled: !current.enabled
      };

      await setDoc(doc(db, "social_links", id), updated, { merge: true });

      socialData[id] = updated;
      renderSocialVisibility();

      showMessage(currentLanguage === "ar"
        ? "تم تحديث ظهور الرابط."
        : "Link visibility updated.");
    } catch (error) {
      console.error("Toggle social link:", error);

      showMessage(currentLanguage === "ar"
        ? "تعذر تحديث الرابط."
        : "Could not update link.", true);
    }
  }
});

$("reloadSocialButton").addEventListener("click", loadSocialLinks);

// WEBSITE CONTENT
const contentDefaults = {
  home_page: {
    titleEn: "Welcome to Hacktivators",
    titleAr: "مرحبًا بكم في Hacktivators",
    descriptionEn: "A team passionate about technology, creativity, and learning.",
    descriptionAr: "فريق شغوف بالتكنولوجيا والإبداع والتعلم."
  },
  about_page: {
    titleEn: "About Hacktivators",
    titleAr: "من نحن",
    descriptionEn: "Hacktivators is a team that brings together young people interested in technology and creative learning.",
    descriptionAr: "Hacktivators هو فريق يجمع الشباب المهتمين بالتكنولوجيا والتعلم الإبداعي."
  },
  contact_page: {
    titleEn: "Contact Us",
    titleAr: "تواصل معنا",
    descriptionEn: "Connect with Hacktivators through our official social media channels.",
    descriptionAr: "تواصل مع Hacktivators من خلال قنوات التواصل الاجتماعي الرسمية."
  }
};

const contentFields = {
  home_page: {
    titleEn: "homeTitleEn",
    titleAr: "homeTitleAr",
    descriptionEn: "homeDescriptionEn",
    descriptionAr: "homeDescriptionAr"
  },
  about_page: {
    titleEn: "aboutTitleEn",
    titleAr: "aboutTitleAr",
    descriptionEn: "aboutDescriptionEn",
    descriptionAr: "aboutDescriptionAr"
  },
  contact_page: {
    titleEn: "contactTitleEn",
    titleAr: "contactTitleAr",
    descriptionEn: "contactDescriptionEn",
    descriptionAr: "contactDescriptionAr"
  }
};

async function loadWebsiteContent() {
  try {
    for (const [documentId, defaults] of Object.entries(contentDefaults)) {
      const reference = doc(db, "site_content", documentId);
      const snapshot = await getDoc(reference);

      let data;

      if (!snapshot.exists()) {
        await setDoc(reference, defaults);
        data = defaults;
      } else {
        data = { ...defaults, ...snapshot.data() };
      }

      for (const [field, inputId] of Object.entries(contentFields[documentId])) {
        const input = $(inputId);

        if (input) {
          input.value = data[field] || "";
        }
      }
    }
  } catch (error) {
    console.error("Load website content:", error);

    showMessage(currentLanguage === "ar"
      ? "تعذر تحميل محتوى الموقع. تحقق من صلاحيات Firestore."
      : "Could not load website content. Check Firestore permissions.", true);
  }
}

contentForm.addEventListener("submit", async event => {
  event.preventDefault();

  const button = $("saveContentButton");

  button.disabled = true;
  button.textContent = t("Saving...");

  try {
    for (const [documentId, fields] of Object.entries(contentFields)) {
      const data = {};

      for (const [field, inputId] of Object.entries(fields)) {
        data[field] = $(inputId).value.trim();
      }

      await setDoc(doc(db, "site_content", documentId), data, { merge: true });
    }

    showMessage(currentLanguage === "ar"
      ? "تم حفظ محتوى الموقع في Firebase."
      : "Website content saved to Firebase.");
  } catch (error) {
    console.error("Save website content:", error);

    showMessage(currentLanguage === "ar"
      ? "تعذر حفظ محتوى الموقع. تحقق من صلاحيات Firebase."
      : "Could not save website content. Check Firebase permissions.", true);
  } finally {
    button.disabled = false;
    button.textContent = t("Save Website Content");
  }
});

$("reloadContentButton").addEventListener("click", loadWebsiteContent);

// INITIAL LANGUAGE
setLanguage(currentLanguage);
