// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔥 Firebase Config
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcAHctc-qFZ8OUh8iXXSGF3q0BY7D_FF4",
  authDomain: "scrunchiefrills.firebaseapp.com",
  projectId: "scrunchiefrills",
  storageBucket: "scrunchiefrills.firebasestorage.app",
  messagingSenderId: "976496807384",
  appId: "1:976496807384:web:9178334896a85dfa2af6ad",
  measurementId: "G-9QVF90XWWW"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

// 🔐 Auth
export const auth = getAuth(app);

// ☁️ Firestore  ✅ THIS WAS MISSING
export const db = getFirestore(app);