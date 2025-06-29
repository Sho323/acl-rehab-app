# ACL Rehabilitation App

前十字靭帯損傷患者向けリハビリテーション自主トレーニングアプリ

## 概要

本アプリケーションは、前十字靭帯（ACL）損傷患者の術前から競技復帰までの段階的リハビリテーションを支援する包括的なプラットフォームです。

### 主な機能

- **段階別自主トレーニングメニュー** - 7段階のリハビリフェーズに対応
- **AI動作分析** - Knee in Toe out検出による動作評価
- **医療従事者との連携機能** - メッセージング・進捗レポート共有
- **進捗記録・評価システム** - 詳細な統計分析とトレンド表示
- **動画アップロード機能** - 運動動画の保存・分析
- **患者プロフィール管理** - 個人設定・目標設定

## 技術スタック

### Backend
- **Node.js** + **Express.js** - RESTful API
- **PostgreSQL** - メインデータベース
- **Knex.js** - データベースマイグレーション・クエリビルダー
- **JWT** - 認証・認可
- **Multer** - ファイルアップロード
- **Winston** - ログ管理

### Frontend (Mobile)
- **React Native** - クロスプラットフォームモバイルアプリ
- **Redux Toolkit** - 状態管理
- **React Native Paper** - UI コンポーネント
- **React Navigation** - 画面遷移

### Deployment
- **Vercel** - サーバーレス関数ホスティング
- **Neon/Supabase** - PostgreSQL ホスティング（推奨）

## 開発環境のセットアップ

### 必要な環境

- Node.js (v18以上)
- PostgreSQL (v14以上)
- npm または yarn

### インストール手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/yourusername/acl-rehab-app.git
cd acl-rehab-app
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env
# .envファイルを適切に編集
```

4. **データベースの作成とマイグレーション**
```bash
npm run migrate
npm run seed
```

5. **サーバーの起動**
```bash
npm run dev
```

### モバイルアプリのセットアップ

```bash
cd mobile
npm install
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーの起動
- `npm start` - 本番サーバーの起動
- `npm test` - テストの実行
- `npm run migrate` - データベースマイグレーション
- `npm run seed` - サンプルデータの投入
- `npm run build` - プロダクションビルド

## API エンドポイント

### 認証
- `POST /auth/login` - ログイン
- `POST /auth/register` - 新規登録
- `POST /auth/logout` - ログアウト

### 患者管理
- `GET /api/patient/profile` - プロフィール取得
- `PUT /api/patient/profile` - プロフィール更新
- `GET /api/patient/phase` - 現在のリハビリフェーズ取得
- `PUT /api/patient/phase` - フェーズ更新

### 進捗追跡
- `GET /api/patient/progress` - 進捗データ取得
- `GET /api/patient/progress/stats` - 統計データ取得
- `GET /api/patient/progress/history` - 履歴データ取得

### 動画・AI分析
- `POST /api/patient/videos/upload` - 動画アップロード
- `GET /api/patient/videos` - 動画一覧取得
- `POST /api/ai/analyze` - AI分析開始
- `GET /api/ai/results/:analysisId` - 分析結果取得

### 医療連携
- `GET /api/medical-collaboration/staff` - 医療従事者一覧
- `POST /api/medical-collaboration/messages` - メッセージ送信
- `GET /api/medical-collaboration/messages` - メッセージ履歴
- `POST /api/medical-collaboration/reports` - 進捗レポート送信

### 運動管理
- `GET /api/exercises` - 運動一覧取得
- `GET /api/exercises/categories` - カテゴリ一覧
- `POST /api/exercises/sessions` - セッション記録

## プロジェクト構造

```
├── src/                    # バックエンドソースコード
│   ├── config/            # 設定ファイル
│   ├── database/          # データベース関連
│   │   ├── migrations/    # マイグレーションファイル
│   │   └── seeds/         # シードファイル
│   ├── routes/            # APIルート
│   ├── models/            # データモデル
│   ├── utils/             # ユーティリティ
│   └── server.js          # メインサーバーファイル
├── mobile/                # モバイルアプリ
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   ├── screens/       # 画面コンポーネント
│   │   ├── store/         # Redux設定
│   │   ├── services/      # API サービス
│   │   └── data/          # 静的データ
│   └── App.js             # メインアプリコンポーネント
├── api/                   # Vercel関数
├── tests/                 # テストファイル
└── uploads/               # アップロードファイル
```

## データベーススキーマ

### 主要テーブル
- `hospitals` - 病院情報
- `medical_staff` - 医療従事者
- `patients` - 患者情報
- `exercises` - 運動データ
- `exercise_records` - 運動記録
- `video_uploads` - 動画ファイル
- `ai_analysis_results` - AI分析結果
- `messages` - メッセージ
- `progress_data` - 進捗データ

## デプロイメント

### Vercelデプロイ

1. **環境変数の設定**
```bash
# Vercelダッシュボードで設定
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

2. **デプロイ実行**
```bash
npx vercel
```

### 推奨データベースサービス
- **Neon** - 無料PostgreSQL（推奨）
- **Supabase** - PostgreSQL + 追加機能
- **Railway** - フルスタックホスティング

## 開発ガイドライン

### セキュリティ
- 医療情報の取り扱いに関する3省2ガイドラインに準拠
- 全ての患者データは暗号化して保存
- JWT による認証・認可
- アクセスログの記録と監査

### テスト
- 全ての新機能にはテストを作成
- カバレッジ80%以上を維持
- 統合テスト・単体テストの実装

### コード品質
- ESLint + Prettier による自動フォーマット
- Husky による pre-commit フック
- 型安全性の確保

## Contributing

1. Forkしてブランチを作成
2. 機能を実装・テスト
3. Pull Requestを送信

## ライセンス

PROPRIETARY - 商用利用禁止

## サポート

技術的な問題や質問については、Issuesを作成してください。

---

🏥 **医療従事者の皆様へ**: このアプリは医療行為の代替ではありません。患者の状態を適切に評価し、個別の指導をお願いします。

👤 **患者の皆様へ**: 痛みや不安がある場合は、無理をせず担当医師にご相談ください。