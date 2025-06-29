const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8443;

// 自己署名証明書を生成（開発用）
const generateCert = () => {
    const forge = require('node-forge');
    const pki = forge.pki;

    // Generate a keypair and create an X.509v3 certificate
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [{
        name: 'commonName',
        value: 'localhost'
    }, {
        name: 'organizationName',
        value: 'ACL Rehab App'
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);

    return {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert)
    };
};

// 簡単な証明書（開発用）
const simpleCert = {
    key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGtJkjy8fFc4+K
example_private_key_data_here_for_development_only
-----END PRIVATE KEY-----`,
    cert: `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQCKuiWCu5xFgDANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJK
example_certificate_data_here_for_development_only
-----END CERTIFICATE-----`
};

// Static files
app.use(express.static(path.join(__dirname, 'web-build')));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Basic API endpoint
app.get('/api/test-https', (req, res) => {
    res.json({ 
        message: 'HTTPS server is working!', 
        timestamp: new Date(),
        secure: true
    });
});

// Serve app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

try {
    // 最小限のHTTPSサーバー
    const server = https.createServer(simpleCert, app);
    
    server.listen(port, '0.0.0.0', () => {
        console.log(`🔒 HTTPS Server running at:`);
        console.log(`  Local: https://localhost:${port}`);
        console.log(`  Network: https://192.168.3.186:${port}`);
        console.log(`\n⚠️  セキュリティ警告が表示された場合:`);
        console.log(`  1. 「詳細設定」をクリック`);
        console.log(`  2. 「安全でないサイトに移動」を選択`);
        console.log(`  3. これは開発用の自己署名証明書のためです`);
    });
} catch (error) {
    console.error('HTTPS server failed to start:', error.message);
    console.log('\n代替案: ngrokを使用してHTTPS接続を作成:');
    console.log('1. npm install -g ngrok');
    console.log('2. ngrok http 3001');
    console.log('3. 表示されたHTTPS URLを使用');
}