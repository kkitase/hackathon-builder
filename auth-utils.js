import { auth, db } from "./firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * 管理者の初期設定が必要かどうかをチェックする
 */
export const checkNeedsSetup = async () => {
  const adminRef = doc(db, "config", "admin");
  const adminSnap = await getDoc(adminRef);
  return !adminSnap.exists();
};

/**
 * ユーザー名とパスワードでログインする (簡易実装)
 */
export const loginWithIdPass = async (userid, password) => {
  const adminRef = doc(db, "config", "admin");
  const adminSnap = await getDoc(adminRef);

  if (adminSnap.exists()) {
    const data = adminSnap.data();
    if (data.defaultUser === userid && data.defaultPass === password) {
      // ログイン成功
      localStorage.setItem("admin_mode", "true");
      localStorage.setItem("admin_user", userid);
      return true;
    }
  }
  return false;
};

/**
 * ログアウト処理
 */
export const logoutAdmin = async () => {
  await auth.signOut();
  localStorage.removeItem("admin_mode");
  localStorage.removeItem("admin_user");
  window.location.reload();
};

/**
 * ユーザーが管理者かどうかを判定する
 */
export const checkIsAdmin = async (user) => {
  // admin_mode が有効なら管理者とみなす
  if (localStorage.getItem("admin_mode") === "true") return true;

  if (!user) return false;

  // Google 認証ユーザー等のメールアドレス判定
  const adminRef = doc(db, "config", "admin");
  const adminSnap = await getDoc(adminRef);

  if (adminSnap.exists()) {
    const data = adminSnap.data();
    return data.authorizedEmails?.includes(user.email);
  }

  return false;
};
