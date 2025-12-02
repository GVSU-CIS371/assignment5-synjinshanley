import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  // COPY this from your Firebase Console
  apiKey: "AIzaSyBma9lxcHlrc8Hc_f1bxQBgobX2H8IdFCs",
  authDomain: "cis371-3e86f.firebaseapp.com",
  databaseURL: "https://CIS371.firebaseio.com",
  projectId: "cis371-3e86f",
  storageBucket: "cis371-3e86f.firebasestorage.app",
  messagingSenderId: "838184893406",
  appId: "1:838184893406:web:fba4d5dafe550c1ef83b4f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
