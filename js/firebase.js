
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// Hacktivators Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoFbyCtFEI4mPyK0yHQB-qy2P4N3h3FzU",
  authDomain: "hacktivators-d4909.firebaseapp.com",
  projectId: "hacktivators-d4909",
  storageBucket: "hacktivators-d4909.firebasestorage.app",
  messagingSenderId: "1070987643877",
  appId: "1:1070987643877:web:e1efcbe210574170527d0c",
  measurementId: "G-YF2CRES1BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export services for other files
export { app, auth, db };
