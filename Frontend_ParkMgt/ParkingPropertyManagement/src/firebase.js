// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {browserLocalPersistence, getAuth, setPersistence} from "firebase/auth"
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGE_SENDER_ID,
  appId: import.meta.VITE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore();

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set!");
  })
  .catch((error) => {
    console.error(`Failed to set auth persistence, code : ${error.code}`);
  });

export {app, auth, db}