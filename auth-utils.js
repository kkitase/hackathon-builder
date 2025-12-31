import { auth, db } from "./firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * 初期管理者データを Firestore に作成するシード関数
 * デフォルトの ID/Password ユーザーを管理するための設定
 */
export const seedAdminData = async () => {
  const adminRef = doc(db, "config", "admin");
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    await setDoc(adminRef, {
      defaultUser: "antigravity",
      defaultPass: "JetSki#555",
      authorizedEmails: [],
    });
    console.log("Initial admin data seeded to Firestore.");
  }
};

/**
 * ユーザーが管理者かどうかを判定する
 * 1. authorizedEmails に含まれるメールアドレスか
 * 2. defaultUser としてログインしているか (ID/Pass 認証時)
 */
export const checkIsAdmin = async (user) => {
  if (!user) return false;

  // ID/Pass 認証のダミーユーザー判定 (Firebase Auth ではなくカスタムロジック)
  if (user.uid === "default-admin-uid") return true;

  // Google 認証ユーザー等のメールアドレス判定
  const adminRef = doc(db, "config", "admin");
  const adminSnap = await getDoc(adminRef);

  if (adminSnap.exists()) {
    const data = adminSnap.data();
    return data.authorizedEmails.includes(user.email);
  }

  return false;
};
