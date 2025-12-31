import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 設定情報
const firebaseConfig = {
  apiKey: "AIzaSyAnQRzzEIeIZBdMDojg3PigbcHbi3_6zHQ",
  authDomain: "hackathon-kkitase.firebaseapp.com",
  projectId: "hackathon-kkitase",
  storageBucket: "hackathon-kkitase.firebasestorage.app",
  messagingSenderId: "956789776222",
  appId: "1:956789776222:web:58b61071881e2b40bab9cf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
