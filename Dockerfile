# ACL Self-Training App Dockerfile
FROM node:18-alpine

# セキュリティ：非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S aclapp -u 1001

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール（開発依存関係を除く）
RUN npm ci --only=production && npm cache clean --force

# アプリケーションファイルをコピー
COPY --chown=aclapp:nodejs . .

# アップロード・ログディレクトリを作成
RUN mkdir -p uploads/public-videos uploads logs && \
    chown -R aclapp:nodejs uploads logs

# 非rootユーザーに切り替え
USER aclapp

# ポートを公開
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# アプリケーション開始
CMD ["npm", "start"]
EOF < /dev/null