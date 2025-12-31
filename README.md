# Hackathon Launch Kit v2

Firebase と SSR (Server Side Rendering) を活用した、チラつきのない高速なハッカソン管理・公開システムです。

## 🌟 特徴

- **高速表示 (SSR)**: クラウド側でHTMLを組み立ててから届けるため、アクセスした瞬間に内容が表示されます（SEOに強く、SNSシェア時のOGPも完璧です）。
- **簡単編集**: 専用の管理画面から、エンジニアでなくてもサイト内容（ヒーロー/審査員/スポンサー等）をリアルタイムで更新できます。
- **安心の認証**: Google アカウントに加え、専用の ID/パスワードによる管理者認証もサポート。
- **一元管理**: 全てのデータは Firestore に保存され、IndexedDB などのローカル保存は使用しません。

---

## 🏗 システム構成

管理者が保存したデータを元に、Cloud Functions (SSR) がページ生成を行います。これにより、従来の SPA で見られた「一瞬白い画面が出る」「データが後から降ってくる」といったチラつきを完全に排除しました。

![システム構成](./assets/detailed_technical_flow.png)

---

## 🚀 構築・公開手順 (15分)

### 1. Firebase プロジェクトの準備
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成します。
2. **Firestore** を「開始」し、東京 (asia-northeast1) など適切なリージョンを選択します。
3. **Authentication** を有効にし、Google ログインを許可します。
4. プロジェクト設定からウェブアプリを追加し、`firebaseConfig` をメモします。

### 2. 初期データのセットアップ (重要)
セキュリティ保護のため、最初の管理者は Firebase コンソールから手動で登録してください。

1. Firestore 内に `config` コレクションを作成します。
2. その中に `admin` という ID のドキュメントを手動作成し、以下のフィールドを追加します。
   - `defaultUser`: `antigravity` (ID/Pass ログイン用)
   - `defaultPass`: `JetSki#555` (ID/Pass ログイン用)
   - `authorizedEmails`: `[あなたのメールアドレス]` (Google ログイン許可リスト、配列形式)

### 3. コードの設定
1. `firebase.js` を開き、メモした設定値で `firebaseConfig` を上書きします。
2. `npm install` で依存関係をインストールします。

### 4. デプロイ（公開）
```bash
# 組み立てと公開
npm run build && firebase deploy
```

---

## 📝 運用方法

- **管理画面**: デプロイされたURLの `/admin.html` にアクセスしてください。
- **ログイン**: 
  - **ID/Pass**: `antigravity` / `JetSki#555` (初期設定時)
  - **Google**: 手動登録したメールアドレスでサインイン可能。
- **更新**: 各タブの内容を編集して「保存」を押すと、即座に公開サイトに反映されます。
- **ログアウト**: サイドバーの「Logout」ボタンから安全にログアウトできます。

---

## 🛠 開発者向け
- **開発サーバー**: `npm run dev` でローカル確認が可能です。
- **セキュリティルール**: `firestore.rules` で管理者以外の書き込みを禁止しています。
- **SSRテンプレート**: `functions/template.html` が SSR のベースとなります。
