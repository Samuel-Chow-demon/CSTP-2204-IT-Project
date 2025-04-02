import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User-side Firebase config
const userFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_USER,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN_USER,
  projectId: import.meta.env.VITE_PROJECT_ID_USER,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET_USER,
  messagingSenderId: import.meta.env.VITE_MESSAGE_SENDER_ID_USER,
  appId: import.meta.env.VITE_APP_ID_USER,
};

// Admin-side Firebase config (if needed)
const adminFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_ADMIN,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN_ADMIN,
  projectId: import.meta.env.VITE_PROJECT_ID_ADMIN,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET_ADMIN,
  messagingSenderId: import.meta.env.VITE_MESSAGE_SENDER_ID_ADMIN,
  appId: import.meta.env.VITE_APP_ID_ADMIN,
};

// Initialize Firebase for the user side
const userApp = initializeApp(userFirebaseConfig, "userApp"); // Initialize only once
const userAuth = getAuth(userApp);
const userDb = getFirestore(userApp);

// Initialize Firebase for the admin side
const adminApp = initializeApp(adminFirebaseConfig, "adminApp"); // Initialize only once
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { userApp, userAuth, userDb, adminApp, adminAuth, adminDb }; // Exporting instances
