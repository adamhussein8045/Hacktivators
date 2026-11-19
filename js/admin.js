
import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// The authorized administrator UID
const ADMIN_UID = "t09cS5GynEfyM6AbNGeiCzzwEGI2";

const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");

function showLogin(message = "") {
  loginPanel.style.display = "block";
  dashboard.style.display = "none";
  loginMessage.textContent = message;
}

function showDashboard() {
  loginPanel.style.display = "none";
  dashboard.style.display = "block";
  loginMessage.textContent = "";
}

// Check the current Firebase login
onAuthStateChanged(auth, async (user) => {
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
});

// Admin login
loginForm.addEventListener("submit", async (event) => {
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
    console.error("Admin login error:", error);

    const messages = {
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your internet connection."
    };

    showLogin(messages[error.code] || "Login failed. Please try again.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

// Admin logout
logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showLogin();
  } catch (error) {
    console.error("Logout error:", error);
    alert("Could not sign out. Please try again.");
  }
});
