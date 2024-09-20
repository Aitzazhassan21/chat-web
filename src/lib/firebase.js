import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDpDlnvvEOBnTde_wlsAtgFmlwyAy83EB8",
  authDomain: "reactchat-a3d90.firebaseapp.com",
  projectId: "reactchat-a3d90",
  storageBucket: "reactchat-a3d90.appspot.com",
  messagingSenderId: "790974559677",
  appId: "1:790974559677:web:cd1caa47abb1789bd28ed4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // Ensure 'auth' is correctly exported
export const db = getFirestore(app);
export const storage = getStorage(app);
