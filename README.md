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

## 🚀 構築・公開手順 (10分)

### 1. Firebase プロジェクトの作成と設定
CLI を使用して、プロジェクトの枠組みを迅速に作成します。

```bash
# 1. ログイン
firebase login

# 2. プロジェクトの作成 (IDは任意、小文字/数字/ハイフン)
firebase projects:create <PROJECT_ID> --title "My Hackathon"

# 3. Webアプリの登録
firebase apps:create WEB "Hackathon Web"
```

### 2. コンソールでの有効化 (手動操作)
以下の設定は [Firebase Console](https://console.firebase.google.com/) で直接行う必要があります。

1. **Firestore**: 「開始」を押し、東京 (`asia-northeast1`) などのリージョンを選択して作成します。
2. **Authentication**: 「使ってみる」から **Google** を有効化してください。
3. **初期管理者の登録**: Firestore で `config/admin` ドキュメントを作成し、以下のフィールドを追加します。
   - `defaultUser`: `your_id`
   - `defaultPass`: `your_password`
   - `authorizedEmails`: `["your-email@gmail.com"]` (配列形式)

### 3. コードの設定とデプロイ
```bash
# 4. Firebase 設定情報 (Config) の取得
firebase apps:sdkconfig WEB

# 5. firebase.js の更新
# 上記で取得した config オブジェクトの内容を firebase.js に貼り付けてください。

# 6. インストールとデプロイ
npm install
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
