import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAf6-U7z8VyT4QF5PPwbw0bCCMa2qO6_Q",
  authDomain: "webcars-79d9e.firebaseapp.com",
  projectId: "webcars-79d9e",
  storageBucket: "webcars-79d9e.firebasestorage.app",
  messagingSenderId: "283670808769",
  appId: "1:283670808769:web:e23c3cd9a52875ff592c40",
  measurementId: "G-V45N47B4C4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }