# ACL Rehabilitation App

前十字靭帯損傷患者向けリハビリテーション自主トレーニングアプリ

## 概要

本アプリケーションは、前十字靭帯（ACL）損傷患者の術前から競技復帰までの段階的リハビリテーションを支援するアプリです。

### 主な機能

- 段階別自主トレーニングメニュー
- AI動作分析（Knee in Toe out検出）
- 医療従事者との連携機能
- 進捗記録・評価システム
- ACL-RSI（心理的準備度）評価

## 開発環境のセットアップ

### 必要な環境

- Node.js (v18以上)
- PostgreSQL (v14以上)
- npm または yarn

### インストール手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd acl-rehab-app
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを適切に編集
```

4. データベースの作成とマイグレーション
```bash
npm run migrate
```

5. サーバーの起動
```bash
npm run dev
```

### 利用可能なスクリプト

- `npm run dev` - 開発サーバーの起動
- `npm start` - 本番サーバーの起動
- `npm test` - テストの実行
- `npm run migrate` - データベースマイグレーション
- `npm run seed` - サンプルデータの投入

## プロジェクト構造

```
src/
├── config/          # 設定ファイル
├── database/        # データベース関連
│   ├── migrations/  # マイグレーションファイル
│   └── seeds/       # シードファイル
├── routes/          # ルーティング
├── models/          # データモデル
├── middleware/      # ミドルウェア
├── utils/           # ユーティリティ
└── tests/           # テストファイル
```

## API エンドポイント

### ヘルスチェック
- `GET /health` - サーバーの稼働状況確認

## 開発ガイドライン

### セキュリティ
- 医療情報の取り扱いに関する3省2ガイドラインに準拠
- 全ての患者データは暗号化して保存
- アクセスログの記録と監査

### テスト
- 全ての新機能にはテストを作成
- カバレッジ80%以上を維持

## ライセンス

PROPRIETARY - 商用利用禁止