# ACL 自主トレーニングアプリ - デプロイメントガイド

## 概要
このアプリは ACL（前十字靱帯）損傷患者向けの自主トレーニング支援アプリケーションです。
QRコードを通じて患者に配布し、セキュアで使いやすい環境を提供します。

## 特徴
- **認証不要**: 患者の個人情報登録不要
- **プライバシー保護**: 動画・分析結果の自動削除機能
- **AI動作分析**: スマートフォンカメラでの動作評価
- **段階的運動メニュー**: 6フェーズ・38種類の運動
- **セキュア設計**: セキュリティヘッダー・レート制限実装

## デプロイ方法

### 1. Docker を使用したデプロイ（推奨）

#### 前提条件
- Docker 20.10+
- Docker Compose 2.0+

#### 手順
```bash
# リポジトリをクローン
git clone <repository-url>
cd acl-rehab-app

# 環境変数設定
cp .env.example .env
# 必要に応じて .env ファイルを編集

# Docker Compose でデプロイ
docker-compose up -d

# ヘルスチェック
curl http://localhost:3000/health
```

### 2. 手動デプロイ

#### 前提条件
- Node.js 18+
- npm 8+

#### 手順
```bash
# 依存関係をインストール
npm ci --only=production

# 環境変数設定
cp .env.example .env
# 必要に応じて .env ファイルを編集

# アプリケーション開始
npm start
```

### 3. Vercel デプロイ

```bash
# Vercel CLI をインストール
npm i -g vercel

# デプロイ
vercel --prod
```

## 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NODE_ENV` | 実行環境 | `production` |
| `PORT` | ポート番号 | `3000` |
| `FILE_RETENTION_HOURS` | ファイル保持時間 | `24` |
| `ANALYSIS_RETENTION_DAYS` | 分析結果保持日数 | `7` |
| `MAX_FILE_SIZE` | 最大ファイルサイズ（バイト） | `104857600` |

## セキュリティ設定

### 実装済みセキュリティ機能
- **Helmet.js**: セキュリティヘッダー設定
- **CORS**: クロスオリジン制御
- **ファイルサイズ制限**: 100MB上限
- **ファイル形式制限**: 動画ファイルのみ
- **自動削除**: プライバシー保護
- **レート制限**: DDoS攻撃防止（オプション）

### 追加推奨設定
```bash
# Nginx リバースプロキシ設定例
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # セキュリティヘッダー
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## QRコード生成

QRコードにはアプリのURLを設定してください：
```
https://your-domain.com/
```

患者がQRコードをスキャンすると、ランディングページが表示されます。

## 監視・ログ

### ヘルスチェック
```bash
curl http://localhost:3000/health
```

### ログファイル
- `logs/combined.log`: 全ログ
- `logs/error.log`: エラーログ
- `logs/exceptions.log`: 例外ログ

### 監視項目
- ヘルスチェックエンドポイント
- ディスク使用量（uploads フォルダ）
- メモリ・CPU使用率
- エラーレート

## バックアップ

### 必要なバックアップ
現在は永続データがないため、特別なバックアップは不要です。
ただし、以下のフォルダは定期的に確認してください：

- `uploads/public-videos/`: アップロード動画（24時間で自動削除）
- `uploads/demo-analysis.json`: 分析結果（7日で自動削除）
- `logs/`: ログファイル

## トラブルシューティング

### よくある問題

1. **ポート3000が使用中**
   ```bash
   # 別のポートを使用
   PORT=3001 npm start
   ```

2. **ファイルアップロードエラー**
   - ファイルサイズ確認（100MB以下）
   - ファイル形式確認（MP4/MOV/AVI/WebM）

3. **AI分析が開始されない**
   - ブラウザのJavaScript有効確認
   - ネットワーク接続確認

4. **Docker コンテナが起動しない**
   ```bash
   # ログ確認
   docker-compose logs acl-app
   
   # コンテナ再起動
   docker-compose restart acl-app
   ```

## サポート

技術的な問題や質問がある場合は、開発チームまでお問い合わせください。

## ライセンス

PROPRIETARY - このソフトウェアは独占的ライセンスです。
EOF < /dev/null