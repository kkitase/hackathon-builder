#!/usr/bin/env node
/**
 * Hackathon Builder - オールインワン初期化スクリプト
 * プロジェクト作成から管理者設定まで一括で処理します。
 */

import { createInterface } from "readline";
import { execSync, spawn } from "child_process";
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");

// 対話式入力のヘルパー
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

// コマンド実行ヘルパー
const exec = (cmd, options = {}) => {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      cwd: ROOT_DIR,
      ...options,
    }).trim();
  } catch (error) {
    return null;
  }
};

// コマンド実行（出力表示）
const execShow = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT_DIR });
    return true;
  } catch (error) {
    return false;
  }
};

// ステップ表示
const step = (num, text) => console.log(`\n\x1b[36m[${num}]\x1b[0m ${text}`);
const success = (text) => console.log(`\x1b[32m✓\x1b[0m ${text}`);
const warn = (text) => console.log(`\x1b[33m⚠\x1b[0m ${text}`);
const error = (text) => console.log(`\x1b[31m✗\x1b[0m ${text}`);

async function main() {
  console.log("\n🚀 \x1b[1mHackathon Builder - オールインワン初期化\x1b[0m\n");
  console.log("このスクリプトは以下を一括で行います:");
  console.log("  1. 依存関係のインストール");
  console.log("  2. Firebase プロジェクトの設定");
  console.log("  3. firebase.js の自動生成");
  console.log("  4. 管理者アカウントの設定\n");

  // ===========================================
  // Step 1: 依存関係のインストール
  // ===========================================
  step(1, "依存関係のインストール");

  if (!existsSync(resolve(ROOT_DIR, "node_modules"))) {
    console.log("   ルートの依存関係をインストール中...");
    execShow("npm install");
  } else {
    success("ルートの依存関係はインストール済み");
  }

  const functionsDir = resolve(ROOT_DIR, "functions");
  if (!existsSync(resolve(functionsDir, "node_modules"))) {
    console.log("   functions/ の依存関係をインストール中...");
    execShow("npm install --prefix functions");
  } else {
    success("functions/ の依存関係はインストール済み");
  }

  // ===========================================
  // Step 2: Firebase CLI 確認
  // ===========================================
  step(2, "Firebase CLI の確認");

  const firebaseVersion = exec("firebase --version");
  if (!firebaseVersion) {
    console.log("   Firebase CLI をインストール中...");
    execShow("npm install -g firebase-tools");
  } else {
    success(`Firebase CLI ${firebaseVersion}`);
  }

  // ログイン確認
  const loginStatus = exec("firebase login:list");
  if (!loginStatus || loginStatus.includes("No authorized accounts")) {
    warn("Firebase にログインしていません");
    console.log("   ブラウザでログインしてください...");
    execShow("firebase login");
  } else {
    success("Firebase にログイン済み");
  }

  // ===========================================
  // Step 3: プロジェクト設定
  // ===========================================
  step(3, "Firebase プロジェクトの設定");

  // 既存のプロジェクト一覧を取得
  console.log("   プロジェクト一覧を取得中...");
  const projectList = exec("firebase projects:list --json");
  let projects = [];
  try {
    const parsed = JSON.parse(projectList);
    projects = parsed.result || [];
  } catch (e) {
    projects = [];
  }

  let projectId;

  if (projects.length > 0) {
    console.log("\n   既存のプロジェクト:");
    projects.slice(0, 10).forEach((p, i) => {
      console.log(
        `   ${i + 1}. ${p.projectId} (${p.displayName || "名前なし"})`
      );
    });
    console.log(`   0. 新規プロジェクトを作成`);

    const choice = await question(
      "\n   使用するプロジェクト番号を選択 (0-10): "
    );
    const num = parseInt(choice);

    if (num === 0) {
      // 新規作成
      projectId = await question("   新しいプロジェクトID: ");
      const displayName = await question("   表示名 (例: My Hackathon): ");
      console.log("   プロジェクトを作成中...");
      const createResult = exec(
        `firebase projects:create ${projectId} -n "${displayName || projectId}"`
      );
      if (!createResult) {
        error("プロジェクトの作成に失敗しました");
        rl.close();
        process.exit(1);
      }
    } else if (num >= 1 && num <= projects.length) {
      projectId = projects[num - 1].projectId;
    } else {
      error("無効な選択です");
      rl.close();
      process.exit(1);
    }
  } else {
    // プロジェクトがない場合は新規作成
    projectId = await question("   新しいプロジェクトID: ");
    const displayName = await question("   表示名 (例: My Hackathon): ");
    console.log("   プロジェクトを作成中...");
    execShow(
      `firebase projects:create ${projectId} -n "${displayName || projectId}"`
    );
  }

  // プロジェクトを使用
  console.log(`   プロジェクト ${projectId} を設定中...`);
  execShow(`firebase use ${projectId}`);
  success(`プロジェクト: ${projectId}`);

  // ===========================================
  // Step 4: Firebase Console での有効化
  // ===========================================
  step(4, "Firebase Console での有効化");

  console.log("\n   以下を Firebase Console で有効化してください:");
  console.log(`   https://console.firebase.google.com/project/${projectId}\n`);
  console.log(
    "   1. Firestore Database: 構築 → Firestore → データベースの作成 → asia-northeast1 → 本番モード"
  );
  console.log(
    "   2. Authentication: 構築 → Authentication → 始める → Google を有効化"
  );
  console.log(
    "   3. Storage: 構築 → Storage → 始める → asia-northeast1 → 本番モード (Blaze プラン必須)"
  );
  console.log("\n   完了したら Enter を押してください...");
  await question("");
  success("Firebase Console での設定完了");

  // ===========================================
  // Step 5: Webアプリ登録と firebase.js 生成
  // ===========================================
  step(5, "firebase.js の生成");

  const firebaseJsPath = resolve(ROOT_DIR, "firebase.js");

  if (existsSync(firebaseJsPath)) {
    const overwrite = await question(
      "   firebase.js は既に存在します。上書きしますか？ (y/N): "
    );
    if (overwrite.toLowerCase() !== "y") {
      success("firebase.js をスキップ");
    } else {
      await generateFirebaseJs(projectId, firebaseJsPath);
    }
  } else {
    await generateFirebaseJs(projectId, firebaseJsPath);
  }

  // ===========================================
  // Step 6: サービスアカウントキーの確認
  // ===========================================
  step(6, "サービスアカウントキーの確認");

  const keyPath = resolve(ROOT_DIR, "serviceAccountKey.json");
  if (!existsSync(keyPath)) {
    warn("serviceAccountKey.json が見つかりません");
    console.log("\n   以下の手順でダウンロードしてください:");
    console.log(
      "   1. Firebase Console → プロジェクト設定 → サービスアカウント"
    );
    console.log("   2. 「新しい秘密鍵の生成」をクリック");
    console.log(
      "   3. ダウンロードしたファイルを serviceAccountKey.json としてルートに配置"
    );
    console.log("\n   配置したら Enter を押してください...");
    await question("");

    if (!existsSync(keyPath)) {
      error(
        "serviceAccountKey.json が見つかりません。セットアップを中止します。"
      );
      rl.close();
      process.exit(1);
    }
  }
  success("serviceAccountKey.json を検出");

  // ===========================================
  // Step 7: 管理者アカウントの設定
  // ===========================================
  step(7, "管理者アカウントの設定");

  // Firebase Admin を動的にインポート
  const { initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
  initializeApp({
    credential: cert(serviceAccount),
  });
  const db = getFirestore();

  success("Firebase Admin に接続");

  const defaultUser = await question("   管理者 ID (例: admin): ");
  const defaultPass = await question("   管理者パスワード: ");
  const emailsInput = await question(
    "   許可するメールアドレス (カンマ区切り): "
  );

  const authorizedEmails = emailsInput
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  await db.doc("config/admin").set({
    defaultUser,
    defaultPass,
    authorizedEmails,
    createdAt: new Date().toISOString(),
  });

  success("管理者情報を Firestore に保存");

  // ===========================================
  // 完了
  // ===========================================
  console.log("\n" + "=".repeat(50));
  console.log("\x1b[32m✓ 初期化完了！\x1b[0m\n");
  console.log("次のステップ:");
  console.log("  npm run deploy  (ビルドとデプロイ)\n");

  rl.close();
}

// firebase.js 生成
async function generateFirebaseJs(projectId, outputPath) {
  console.log("   Webアプリの設定を取得中...");

  // 既存のWebアプリを確認
  const appsJson = exec(`firebase apps:list WEB --project ${projectId} --json`);
  let appId = null;

  try {
    const apps = JSON.parse(appsJson);
    if (apps.result && apps.result.length > 0) {
      appId = apps.result[0].appId;
      success(`既存のWebアプリを使用: ${apps.result[0].displayName || appId}`);
    }
  } catch (e) {}

  // Webアプリがなければ作成
  if (!appId) {
    console.log("   Webアプリを作成中...");
    execShow(`firebase apps:create WEB "Hackathon Web" --project ${projectId}`);
  }

  // SDK 設定を取得
  const sdkConfig = exec(`firebase apps:sdkconfig WEB --project ${projectId}`);
  if (!sdkConfig) {
    error("SDK 設定の取得に失敗しました");
    return;
  }

  // 設定をパース
  const configMatch = sdkConfig.match(/const firebaseConfig = \{[\s\S]*?\};/);
  if (!configMatch) {
    error("SDK 設定のパースに失敗しました");
    console.log("   手動で firebase.js.example をコピーして編集してください");
    return;
  }

  const configContent = configMatch[0]
    .replace("const firebaseConfig = ", "")
    .replace(";", "");

  const firebaseJsContent = `// Firebase 設定（自動生成）
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = ${configContent};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
`;

  writeFileSync(outputPath, firebaseJsContent);
  success("firebase.js を生成しました");
}

main().catch((err) => {
  error(err.message);
  rl.close();
  process.exit(1);
});
