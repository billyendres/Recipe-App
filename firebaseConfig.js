// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8BTWZzUGsXn57ZClJkOlf17unJpwLbP8",
  authDomain: "recipes-d2229.firebaseapp.com",
  projectId: "recipes-d2229",
  storageBucket: "recipes-d2229.appspot.com",
  messagingSenderId: "375437305367",
  appId: "1:375437305367:web:f46f18d6bfbaec138bde52",
  measurementId: "G-GRPGNYPQ89",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
