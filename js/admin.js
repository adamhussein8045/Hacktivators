
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

// Only this Firebase UID is authorized.
const ADMIN_UID = "t09cS5GynEfyM6AbNGeiCzzwEGI2";

// ========================================
// DOM ELEMENTS
// ========================================

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

let unsubscribeTeam = null;
let unsubscribeEvents = null;

let latestTeamDocs = [];
let latestEventsDocs = [];

let currentLanguage =
  localStorage.getItem("hacktivators_admin_language") || "en";

if (!["ar", "en"].includes(currentLanguage)) {
  currentLanguage = "en";
}

// ========================================
// TRANSLATIONS
// ========================================

const translations = {
  "Official Website Administration": "إدارة الموقع الرسمي",
  "Admin Login": "تسجيل دخول المسؤول",
  "Email Address": "البريد الإلكتروني",
  "Password": "كلمة المرور",
  "Sign In": "تسجيل الدخول",
  "Signing in...": "جاري تسجيل الدخول...",
  "Access denied. This account is not an authorized admin.": "تم رفض الدخول. هذا الحساب غير مصرح له بالدخول.",
  "Incorrect email or password.": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "Please enter a valid email.": "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.",
  "Too many attempts. Try again later.": "محاولات كثيرة. حاول مرة أخرى لاحقًا.",
  "Network error. Check your internet.": "مشكلة في الاتصال. تحقق من الإنترنت.",
  "Login failed. Please try again.": "فشل تسجيل الدخول. حاول مرة أخرى.",
  "MAIN MENU": "القائمة الرئيسية",
  "Team Management": "إدارة الفريق",
  "Events Management": "إدارة الفعاليات",
  "Social Links": "روابط التواصل",
  "Website Content": "محتوى الموقع",
  "Sign Out": "تسجيل الخروج",
  "Manage your Hacktivators website.": "تحكم في موقع Hacktivators.",
  "Connecting...": "جاري الاتصال...",
  "● Firebase Connected": "● متصل بـ Firebase",
  "Connection error": "خطأ في الاتصال",
  "Add Team Member": "إضافة عضو للفريق",
  "Edit Team Member": "تعديل عضو الفريق",
  "Add a new member or edit an existing one.": "أضف عضوًا جديدًا أو عدّل بيانات عضو موجود.",
  "Full Name (English)": "الاسم بالكامل (إنجليزي)",
  "الاسم بالعربي": "الاسم بالعربي",
  "Role (English)": "الوظيفة (إنجليزي)",
  "الوظيفة بالعربي": "الوظيفة بالعربي",
  "Department": "القسم",
  "Initials": "الأحرف الأولى",
  "Save Member": "حفظ العضو",
  "Saving...": "جاري الحفظ...",
  "Update Member": "تحديث العضو",
  "Clear Form": "مسح النموذج",
  "Team Members": "أعضاء الفريق",
  "Members currently stored in Firebase.": "الأعضاء المسجلون حاليًا في Firebase.",
  "Loading team members...": "جاري تحميل أعضاء الفريق...",
  "No team members found in Firebase yet.": "لم يتم العثور على أعضاء في Firebase حتى الآن.",
  "Edit": "تعديل",
  "Delete": "حذف",
  "Member not found.": "لم يتم العثور على العضو.",
  "Team member updated successfully.": "تم تحديث بيانات العضو بنجاح.",
  "Team member added successfully.": "تمت إضافة العضو بنجاح.",
  "Team member deleted successfully.": "تم حذف العضو بنجاح.",
  "Could not save member. Check your Firebase permissions.": "تعذر حفظ العضو. تحقق من صلاحيات Firebase.",
  "Could not load member details.": "تعذر تحميل بيانات العضو.",
  "Could not delete member.": "تعذر حذف العضو.",
  "Please fill in all required member fields.": "من فضلك أكمل جميع الحقول المطلوبة للعضو.",
  "Are you sure you want to delete this member?": "هل أنت متأكد أنك تريد حذف هذا العضو؟",
  "Events": "الفعاليات",
  "Add Event": "إضافة فعالية",
  "Edit Event": "تعديل الفعالية",
  "Create or update a Hacktivators event.": "أنشئ فعالية جديدة أو عدّل فعالية موجودة.",
  "Event Title": "عنوان الفعالية",
  "Event Date": "تاريخ الفعالية",
  "Status": "الحالة",
  "Upcoming": "قادمة",
  "Completed": "مكتملة",
  "Topics": "الموضوعات",
  "Description": "الوصف",
  "Save Event": "حفظ الفعالية",
  "Update Event": "تحديث الفعالية",
  "Events currently stored in Firebase.": "الفعاليات المسجلة حاليًا في Firebase.",
  "Loading events...": "جاري تحميل الفعاليات...",
  "No events found in Firebase yet.": "لم يتم العثور على فعاليات في Firebase حتى الآن.",
  "Untitled event": "فعالية بدون عنوان",
  "Event updated successfully.": "تم تحديث الفعالية بنجاح.",
  "Event added successfully.": "تمت إضافة الفعالية بنجاح.",
  "Event deleted successfully.": "تم حذف الفعالية بنجاح.",
  "Could not save event. Check your Firebase permissions.": "تعذر حفظ الفعالية. تحقق من صلاحيات Firebase.",
  "Could not load event details.": "تعذر تحميل بيانات الفعالية.",
  "Could not delete event.": "تعذر حذف الفعالية.",
  "Please complete all event fields and add at least one topic.": "من فضلك أكمل بيانات الفعالية وأضف موضوعًا واحدًا على الأقل.",
  "Are you sure you want to delete this event?": "هل أنت متأكد أنك تريد حذف هذه الفعالية؟",
  "This section will be connected in the next stage.": "سيتم تفعيل هذا القسم في المرحلة القادمة.",
  "Could not load team members. Check Firestore rules.": "تعذر تحميل أعضاء الفريق. تحقق من قواعد Firestore.",
  "Could not load events. Check Firestore rules.": "تعذر تحميل الفعاليات. تحقق من قواعد Firestore.",
  "Could not sign out. Please try again.": "تعذر تسجيل الخروج. حاول مرة أخرى.",
  "Original data imported successfully:": "تم استيراد البيانات الأصلية بنجاح:",
  "members and": "أعضاء و",
  "events.": "فعاليات.",
  "Initials:": "الأحرف الأولى:",
  "Member of": "عضو في"
};

const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([english, arabic]) => [
    arabic,
    english
  ])
);

function translateText(text, language) {
  const trimmed = text.trim();

  if (!trimmed) return text;

  const translated = language === "ar"
    ? translations[trimmed]
    : reverseTranslations[trimmed];

  return translated
    ? text.replace(trimmed, translated)
    : text;
}

// ========================================
// LANGUAGE SYSTEM
// ========================================

function applyLanguage(language) {
  currentLanguage = language;

  localStorage.setItem("hacktivators_admin_language", language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let node;

  while ((node = walker.nextNode())) {
    node.textContent = translateText(node.textContent, language);
  }

  document.querySelectorAll("[placeholder]").forEach(element => {
    element.placeholder = translateText(
      element.placeholder,
      language
    );
  });

  document.title = language === "ar"
    ? "Hacktivators | لوحة تحكم الإدارة"
    : "Hacktivators | Admin Dashboard";

  arabicButton.classList.toggle("active", language === "ar");
  englishButton.classList.toggle("active", language === "en");

  renderTeamMembers();
  renderEvents();
}

arabicButton.addEventListener("click", () => {
  applyLanguage("ar");
});

englishButton.addEventListener("click", () => {
  applyLanguage("en");
});

// ========================================
// HELPERS
// ========================================

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

  globalMessage.style.color = isError
    ? "#a93248"
    : "#68452f";

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

  latestTeamDocs = [];
  latestEventsDocs = [];
}

// ========================================
// NAVIGATION
// ========================================

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

    const selectedSection = $(`${section}Section`);

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

    applyLanguage(currentLanguage);
    hideMessage();
  });
});

// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("email").value.trim();
  const password = $("password").value;

  loginButton.disabled = true;
  loginButton.textContent = currentLanguage === "ar"
    ? "جاري تسجيل الدخول..."
    : "Signing in...";

  loginMessage.textContent = "";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);

      showLogin(
        currentLanguage === "ar"
          ? "تم رفض الدخول. هذا الحساب غير مصرح له بالدخول."
          : "Access denied. This account is not an authorized admin."
      );
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

    loginMessage.textContent = translateText(
      message,
      currentLanguage
    );
  } finally {
    loginButton.disabled = false;

    loginButton.textContent = currentLanguage === "ar"
      ? "تسجيل الدخول"
      : "Sign In";
  }
});

// ========================================
// ORIGINAL TEAM DATA
// ========================================

const originalMembers = [
  {
    id: "celia-ahmed",
    nameEn: "Celia Ahmed",
    nameAr: "سيليا أحمد",
    roleEn: "Leader Of Team",
    roleAr: "قائدة الفريق",
    department: "Leadership",
    initials: "CA"
  },
  {
    id: "omar-mohamed",
    nameEn: "Omar Mohamed",
    nameAr: "عمر محمد",
    roleEn: "Co-Leader",
    roleAr: "نائب قائد الفريق",
    department: "Leadership",
    initials: "OM"
  },
  {
    id: "salma-emad",
    nameEn: "Salma Emad",
    nameAr: "سلمى عماد",
    roleEn: "Co-Leader",
    roleAr: "نائبة قائد الفريق",
    department: "Leadership",
    initials: "SE"
  },
  {
    id: "logien-mohamed",
    nameEn: "Logien Mohamed",
    nameAr: "لوجين محمد",
    roleEn: "Co-Leader",
    roleAr: "نائبة قائد الفريق",
    department: "Leadership",
    initials: "LM"
  },
  {
    id: "adam-hussein",
    nameEn: "Adam Hussein",
    nameAr: "آدم حسين",
    roleEn: "Member Of Programming Department",
    roleAr: "عضو بقسم البرمجة",
    department: "Programming",
    initials: "AH"
  },
  {
    id: "youssef-khaled",
    nameEn: "Youssef Khaled",
    nameAr: "يوسف خالد",
    roleEn: "Photographer",
    roleAr: "مصور",
    department: "Photography",
    initials: "YK"
  },
  {
    id: "lamar-abd-elmohsen",
    nameEn: "Lamar Abd Elmohsen",
    nameAr: "لمار عبد المحسن",
    roleEn: "Photographer",
    roleAr: "مصورة",
    department: "Photography",
    initials: "LA"
  },
  {
    id: "saleen-ahmed",
    nameEn: "Saleen Ahmed",
    nameAr: "سالين أحمد",
    roleEn: "Designer & Video Editor",
    roleAr: "مصممة ومحررة فيديو",
    department: "Design & Media",
    initials: "SA"
  },
  {
    id: "sagda-ahmed",
    nameEn: "Sagda Ahmed",
    nameAr: "سجدة أحمد",
    roleEn: "Designer & Organizer",
    roleAr: "مصممة ومنظمة",
    department: "Design & Organization",
    initials: "SA"
  },
  {
    id: "omar-mostafa",
    nameEn: "Omar Mostafa",
    nameAr: "عمر مصطفى",
    roleEn: "Member Of Programming Department",
    roleAr: "عضو بقسم البرمجة",
    department: "Programming",
    initials: "OM"
  },
  {
    id: "yassin-mohamed",
    nameEn: "Yassin Mohamed",
    nameAr: "ياسين محمد",
    roleEn: "Member Of Programming Department",
    roleAr: "عضو بقسم البرمجة",
    department: "Programming",
    initials: "YM"
  },
  {
    id: "hana-ahmed",
    nameEn: "Hana Ahmed",
    nameAr: "هنا أحمد",
    roleEn: "Designer",
    roleAr: "مصممة",
    department: "Design",
    initials: "HA"
  }
];

// ========================================
// ORIGINAL EVENTS
// ========================================

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

// ========================================
// IMPORT AND MIGRATE DATA
// ========================================

async function importOriginalData() {
  const teamSnapshot = await getDocs(
    collection(db, "team_members")
  );

  const eventsSnapshot = await getDocs(
    collection(db, "events")
  );

  let importedMembers = 0;
  let importedEvents = 0;

  // Initial team import.
  if (teamSnapshot.empty) {
    for (const member of originalMembers) {
      await setDoc(
        doc(db, "team_members", member.id),
        {
          ...member,
          name: member.nameEn,
          role: member.roleEn
        }
      );

      importedMembers++;
    }
  } else {
    // One-time bilingual migration.
    const migrationRef = doc(
      db,
      "site_content",
      "team_bilingual_v1"
    );

    const migrationSnapshot = await getDoc(migrationRef);

    if (!migrationSnapshot.exists()) {
      for (const member of originalMembers) {
        const memberRef = doc(
          db,
          "team_members",
          member.id
        );

        const existing = await getDoc(memberRef);

        if (!existing.exists()) continue;

        const oldData = existing.data();

        await setDoc(
          memberRef,
          {
            nameEn: oldData.nameEn || oldData.name || member.nameEn,
            nameAr: oldData.nameAr || member.nameAr,
            roleEn: oldData.roleEn || oldData.role || member.roleEn,
            roleAr: oldData.roleAr || member.roleAr,
            name: oldData.name || member.nameEn,
            role: oldData.role || member.roleEn
          },
          { merge: true }
        );

        importedMembers++;
      }

      await setDoc(migrationRef, {
        completed: true,
        completedAt: new Date().toISOString()
      });
    }
  }

  // Initial events import.
  if (eventsSnapshot.empty) {
    for (const item of originalEvents) {
      const { id, ...data } = item;

      await setDoc(
        doc(db, "events", id),
        data
      );

      importedEvents++;
    }
  }

  return {
    importedMembers,
    importedEvents
  };
}

// ========================================
// AUTHENTICATION STATE
// ========================================

onAuthStateChanged(auth, async user => {
  stopListeners();

  if (!user) {
    showLogin();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    await signOut(auth);

    showLogin(
      currentLanguage === "ar"
        ? "تم رفض الدخول. هذا الحساب غير مصرح له بالدخول."
        : "Access denied. This account is not an authorized admin."
    );

    return;
  }

  showDashboard();
  hideMessage();

  try {
    const result = await importOriginalData();

    startTeamListener();
    startEventsListener();

    if (result.importedMembers || result.importedEvents) {
      const message =
        `Original data imported successfully: ${result.importedMembers} members and ${result.importedEvents} events.`;

      showMessage(translateText(message, currentLanguage));
    }
  } catch (error) {
    console.error("Initial data import error:", error);

    startTeamListener();
    startEventsListener();

    showMessage(
      translateText(
        "Could not import original data. Check Firebase permissions.",
        currentLanguage
      ),
      true
    );
  }

  applyLanguage(currentLanguage);
});

// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener("click", async () => {
  try {
    stopListeners();
    await signOut(auth);
    showLogin();
  } catch (error) {
    console.error("Logout error:", error);

    showMessage(
      translateText(
        "Could not sign out. Please try again.",
        currentLanguage
      ),
      true
    );
  }
});

// ========================================
// TEAM: RENDER
// ========================================

function renderTeamMembers() {
  if (!teamList) return;

  if (!latestTeamDocs.length) {
    teamList.innerHTML = `
      <div class="empty">
        ${currentLanguage === "ar"
          ? "لم يتم العثور على أعضاء في Firebase حتى الآن."
          : "No team members found in Firebase yet."}
      </div>
    `;

    return;
  }

  teamList.innerHTML = latestTeamDocs.map(memberDoc => {
    const member = memberDoc.data();
    const id = escapeHTML(memberDoc.id);

    const name = currentLanguage === "ar"
      ? member.nameAr || member.name || ""
      : member.nameEn || member.name || "";

    const role = currentLanguage === "ar"
      ? member.roleAr || member.role || ""
      : member.roleEn || member.role || "";

    return `
      <article class="item">
        <div class="item-info">
          <h3>${escapeHTML(name || "Unnamed member")}</h3>

          <p>
            ${escapeHTML(role)}
            ·
            ${escapeHTML(member.department || "")}
          </p>

          <p>
            ${currentLanguage === "ar" ? "الأحرف الأولى:" : "Initials:"}
            ${escapeHTML(member.initials || "")}
          </p>
        </div>

        <div class="item-actions">
          <button
            class="secondary-btn"
            type="button"
            data-action="edit-member"
            data-id="${id}"
          >${currentLanguage === "ar" ? "تعديل" : "Edit"}</button>

          <button
            class="danger-btn"
            type="button"
            data-action="delete-member"
            data-id="${id}"
          >${currentLanguage === "ar" ? "حذف" : "Delete"}</button>
        </div>
      </article>
    `;
  }).join("");
}

// ========================================
// TEAM: FIRESTORE LISTENER
// ========================================

function startTeamListener() {
  teamList.innerHTML = `
    <div class="empty">
      ${currentLanguage === "ar"
        ? "جاري تحميل أعضاء الفريق..."
        : "Loading team members..."}
    </div>
  `;

  const teamQuery = query(
    collection(db, "team_members"),
    orderBy("name")
  );

  unsubscribeTeam = onSnapshot(
    teamQuery,
    snapshot => {
      latestTeamDocs = snapshot.docs;

      connectionStatus.textContent = "● Firebase Connected";
      connectionStatus.style.color = "#68452f";

      renderTeamMembers();
    },
    error => {
      console.error("Team listener error:", error);

      connectionStatus.textContent = "Connection error";

      showMessage(
        translateText(
          "Could not load team members. Check Firestore rules.",
          currentLanguage
        ),
        true
      );
    }
  );
}

// ========================================
// TEAM: ADD OR UPDATE
// ========================================

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

  if (
    !data.nameEn ||
    !data.nameAr ||
    !data.roleEn ||
    !data.roleAr ||
    !data.department
  ) {
    showMessage(
      translateText(
        "Please fill in all required member fields.",
        currentLanguage
      ),
      true
    );

    return;
  }

  saveMemberButton.disabled = true;

  saveMemberButton.textContent = currentLanguage === "ar"
    ? "جاري الحفظ..."
    : "Saving...";

  try {
    if (teamId.value) {
      await updateDoc(
        doc(db, "team_members", teamId.value),
        data
      );

      showMessage(
        translateText(
          "Team member updated successfully.",
          currentLanguage
        )
      );
    } else {
      await addDoc(
        collection(db, "team_members"),
        data
      );

      showMessage(
        translateText(
          "Team member added successfully.",
          currentLanguage
        )
      );
    }

    resetTeamForm();
  } catch (error) {
    console.error("Save member error:", error);

    showMessage(
      translateText(
        "Could not save member. Check your Firebase permissions.",
        currentLanguage
      ),
      true
    );
  } finally {
    saveMemberButton.disabled = false;

    saveMemberButton.textContent = currentLanguage === "ar"
      ? "حفظ العضو"
      : "Save Member";
  }
});

// ========================================
// TEAM: EDIT OR DELETE
// ========================================

teamList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit-member") {
    try {
      const selected = latestTeamDocs.find(
        item => item.id === id
      );

      if (!selected) {
        showMessage(
          translateText("Member not found.", currentLanguage),
          true
        );

        return;
      }

      const member = selected.data();

      teamId.value = id;

      memberNameEn.value = member.nameEn || member.name || "";
      memberNameAr.value = member.nameAr || "";
      memberRoleEn.value = member.roleEn || member.role || "";
      memberRoleAr.value = member.roleAr || "";

      memberDepartment.value = member.department || "";
      memberInitials.value = member.initials || "";

      teamFormTitle.textContent = currentLanguage === "ar"
        ? "تعديل عضو الفريق"
        : "Edit Team Member";

      saveMemberButton.textContent = currentLanguage === "ar"
        ? "تحديث العضو"
        : "Update Member";

      teamForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } catch (error) {
      console.error("Edit member error:", error);

      showMessage(
        translateText(
          "Could not load member details.",
          currentLanguage
        ),
        true
      );
    }
  }

  if (action === "delete-member") {
    const confirmed = confirm(
      currentLanguage === "ar"
        ? "هل أنت متأكد أنك تريد حذف هذا العضو؟"
        : "Are you sure you want to delete this member?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "team_members", id)
      );

      showMessage(
        translateText(
          "Team member deleted successfully.",
          currentLanguage
        )
      );
    } catch (error) {
      console.error("Delete member error:", error);

      showMessage(
        translateText(
          "Could not delete member.",
          currentLanguage
        ),
        true
      );
    }
  }
});

// ========================================
// TEAM: RESET FORM
// ========================================

function resetTeamForm() {
  teamForm.reset();
  teamId.value = "";

  teamFormTitle.textContent = currentLanguage === "ar"
    ? "إضافة عضو للفريق"
    : "Add Team Member";

  saveMemberButton.textContent = currentLanguage === "ar"
    ? "حفظ العضو"
    : "Save Member";
}

cancelMemberEdit.addEventListener("click", resetTeamForm);

// ========================================
// EVENTS: RENDER
// ========================================

function renderEvents() {
  if (!eventsList) return;

  if (!latestEventsDocs.length) {
    eventsList.innerHTML = `
      <div class="empty">
        ${currentLanguage === "ar"
          ? "لم يتم العثور على فعاليات في Firebase حتى الآن."
          : "No events found in Firebase yet."}
      </div>
    `;

    return;
  }

  eventsList.innerHTML = latestEventsDocs.map(eventDoc => {
    const item = eventDoc.data();
    const id = escapeHTML(eventDoc.id);

    return `
      <article class="item">
        <div class="item-info">
          <h3>${escapeHTML(item.title || "Untitled event")}</h3>

          <p>
            ${escapeHTML(item.date || "")}
            ·
            ${escapeHTML(translateText(item.status || "", currentLanguage))}
          </p>

          <p>${escapeHTML(item.description || "")}</p>

          <p>
            ${Array.isArray(item.topics)
              ? item.topics.map(topic => escapeHTML(topic)).join(" · ")
              : ""}
          </p>
        </div>

        <div class="item-actions">
          <button
            class="secondary-btn"
            type="button"
            data-action="edit-event"
            data-id="${id}"
          >${currentLanguage === "ar" ? "تعديل" : "Edit"}</button>

          <button
            class="danger-btn"
            type="button"
            data-action="delete-event"
            data-id="${id}"
          >${currentLanguage === "ar" ? "حذف" : "Delete"}</button>
        </div>
      </article>
    `;
  }).join("");
}

// ========================================
// EVENTS: FIRESTORE LISTENER
// ========================================

function startEventsListener() {
  eventsList.innerHTML = `
    <div class="empty">
      ${currentLanguage === "ar"
        ? "جاري تحميل الفعاليات..."
        : "Loading events..."}
    </div>
  `;

  const eventsQuery = query(
    collection(db, "events"),
    orderBy("date")
  );

  unsubscribeEvents = onSnapshot(
    eventsQuery,
    snapshot => {
      latestEventsDocs = snapshot.docs;
      renderEvents();
    },
    error => {
      console.error("Events listener error:", error);

      showMessage(
        translateText(
          "Could not load events. Check Firestore rules.",
          currentLanguage
        ),
        true
      );
    }
  );
}

// ========================================
// EVENTS: ADD OR UPDATE
// ========================================

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

  if (
    !data.title ||
    !data.date ||
    !data.description ||
    data.topics.length === 0
  ) {
    showMessage(
      translateText(
        "Please complete all event fields and add at least one topic.",
        currentLanguage
      ),
      true
    );

    return;
  }

  saveEventButton.disabled = true;

  saveEventButton.textContent = currentLanguage === "ar"
    ? "جاري الحفظ..."
    : "Saving...";

  try {
    if (eventId.value) {
      await updateDoc(
        doc(db, "events", eventId.value),
        data
      );

      showMessage(
        translateText(
          "Event updated successfully.",
          currentLanguage
        )
      );
    } else {
      await addDoc(
        collection(db, "events"),
        data
      );

      showMessage(
        translateText(
          "Event added successfully.",
          currentLanguage
        )
      );
    }

    resetEventForm();
  } catch (error) {
    console.error("Save event error:", error);

    showMessage(
      translateText(
        "Could not save event. Check your Firebase permissions.",
        currentLanguage
      ),
      true
    );
  } finally {
    saveEventButton.disabled = false;

    saveEventButton.textContent = currentLanguage === "ar"
      ? "حفظ الفعالية"
      : "Save Event";
  }
});

// ========================================
// EVENTS: EDIT OR DELETE
// ========================================

eventsList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit-event") {
    try {
      const selected = latestEventsDocs.find(
        item => item.id === id
      );

      if (!selected) {
        showMessage(
          currentLanguage === "ar"
            ? "لم يتم العثور على الفعالية."
            : "Event not found.",
          true
        );

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

      eventFormTitle.textContent = currentLanguage === "ar"
        ? "تعديل الفعالية"
        : "Edit Event";

      saveEventButton.textContent = currentLanguage === "ar"
        ? "تحديث الفعالية"
        : "Update Event";

      eventForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } catch (error) {
      console.error("Edit event error:", error);

      showMessage(
        translateText(
          "Could not load event details.",
          currentLanguage
        ),
        true
      );
    }
  }

  if (action === "delete-event") {
    const confirmed = confirm(
      currentLanguage === "ar"
        ? "هل أنت متأكد أنك تريد حذف هذه الفعالية؟"
        : "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "events", id)
      );

      showMessage(
        translateText(
          "Event deleted successfully.",
          currentLanguage
        )
      );
    } catch (error) {
      console.error("Delete event error:", error);

      showMessage(
        translateText(
          "Could not delete event.",
          currentLanguage
        ),
        true
      );
    }
  }
});

// ========================================
// EVENTS: RESET FORM
// ========================================

function resetEventForm() {
  eventForm.reset();
  eventId.value = "";

  eventFormTitle.textContent = currentLanguage === "ar"
    ? "إضافة فعالية"
    : "Add Event";

  saveEventButton.textContent = currentLanguage === "ar"
    ? "حفظ الفعالية"
    : "Save Event";
}

// ========================================
// INITIAL LANGUAGE
// ========================================

applyLanguage(currentLanguage);
