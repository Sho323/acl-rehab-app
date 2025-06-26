const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 実際のアプリ構成をテスト用に再現
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('../../src/routes/auth');
app.use('/auth', authRoutes);

// エラーハンドラー
app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

describe('Auth Integration Tests', () => {
  
  describe('Full authentication flow', () => {
    it('should handle complete login flow with validation', async () => {
      // 無効なリクエストのテスト
      const invalidResponse = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: '', // 空の患者番号
          password: '123'    // 短すぎるパスワード
        });

      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body.error).toBe('Validation error');

      // 存在しない患者でのテスト
      const notFoundResponse = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'NONEXISTENT',
          password: 'validpassword123'
        });

      expect(notFoundResponse.status).toBe(401);
      expect(notFoundResponse.body.error).toBe('Invalid credentials');
    });

    it('should handle registration validation flow', async () => {
      // 不完全なデータでの登録試行
      const incompleteResponse = await request(app)
        .post('/auth/register')
        .send({
          patientNumber: 'P100',
          name: 'Test Patient'
          // 必須フィールドが不足
        });

      expect(incompleteResponse.status).toBe(400);
      expect(incompleteResponse.body.error).toBe('Validation error');

      // 無効なメールアドレス
      const invalidEmailResponse = await request(app)
        .post('/auth/register')
        .send({
          patientNumber: 'P101',
          name: 'Test Patient',
          email: 'invalid-email',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          hospitalId: 'hospital-id'
        });

      expect(invalidEmailResponse.status).toBe(400);
      expect(invalidEmailResponse.body.error).toBe('Validation error');
    });
  });

  describe('Security headers and middleware', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'P001',
          password: 'password123'
        });

      // Helmetによるセキュリティヘッダーの確認
      expect(response.headers['x-dns-prefetch-control']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}');

      expect(response.status).toBe(400);
    });

    it('should handle oversized requests', async () => {
      const largeData = {
        patientNumber: 'P001',
        password: 'password123',
        largeField: 'x'.repeat(15 * 1024 * 1024) // 15MB
      };

      const response = await request(app)
        .post('/auth/login')
        .send(largeData);

      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe('Authentication middleware', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should reject requests with malformed authorization header', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });
});