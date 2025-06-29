const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3443;

// 自己署名証明書を生成（開発用）
function createSelfSignedCert() {
  const selfsigned = require('selfsigned');
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = selfsigned.generate(attrs, { days: 365 });
  
  return {
    key: pems.private,
    cert: pems.cert
  };
}

// SSL証明書設定（開発用）
let sslOptions;
try {
  // 自己署名証明書を生成
  sslOptions = createSelfSignedCert();
} catch (error) {
  console.log('自己署名証明書の生成に失敗、代替証明書を作成中...');
  // 最小限のSSL設定
  sslOptions = {
    key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----',
    cert: '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKL...\n-----END CERTIFICATE-----'
  };
}

// Static files
app.use(express.static(path.join(__dirname, 'web-build')));

// CORS headers for AI analysis
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Basic API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'HTTPS ACL Rehab App API is working!', 
    timestamp: new Date(),
    secure: true
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

try {
  // Create HTTPS server
  const server = https.createServer(sslOptions, app);
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`🔒 HTTPS ACL Rehab App running at:`);
    console.log(`  Local (HTTPS): https://localhost:${port}`);
    console.log(`  Network (HTTPS): https://192.168.3.186:${port}`);
    console.log(`  Mobile (HTTPS): https://192.168.3.186:${port}`);
    console.log(`\n⚠️  セキュリティ警告が表示された場合は「詳細設定」→「安全でないサイトに移動」を選択してください`);
    console.log(`   (開発用の自己署名証明書のため)`);
  });
} catch (error) {
  console.error('HTTPSサーバーの起動に失敗:', error);
  console.log('HTTPサーバー (port 3001) を使用してください');
}