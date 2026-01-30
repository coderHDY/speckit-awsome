/**
 * CORS (Cross-Origin Resource Sharing) 設定のテスト
 * 
 * すべてのオリジンからのリクエストを許可することを検証
 */
const request = require('supertest');
const express = require('express');

describe('CORS 設定', () => {
  let app;

  beforeEach(() => {
    // テスト用アプリの初期化
    app = express();

    // CORS ミドルウェア
    const cors = require('cors');
    app.use(cors());

    // JSON パーサー
    app.use(express.json());

    // テスト用エンドポイント
    app.get('/test-cors', (req, res) => {
      res.json({ success: true, message: 'CORS テスト' });
    });

    app.post('/test-cors', (req, res) => {
      res.json({ success: true, message: 'CORS POST テスト' });
    });
  });

  describe('OPTIONS プリフライトリクエスト', () => {
    test('オリジンなしの OPTIONS リクエストが成功する', async () => {
      const response = await request(app)
        .options('/test-cors')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('任意のオリジンの OPTIONS リクエストが成功する', async () => {
      const response = await request(app)
        .options('/test-cors')
        .set('Origin', 'http://example.com')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    test('Access-Control-Allow-Methods が正しく設定されている', async () => {
      const response = await request(app)
        .options('/test-cors')
        .set('Origin', 'http://example.com')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('プリフライトリクエストに必要な CORS ヘッダーが含まれる', async () => {
      const response = await request(app)
        .options('/test-cors')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });

  describe('CORS ヘッダー検証', () => {
    test('GET リクエストに Access-Control-Allow-Origin ヘッダーが含まれる', async () => {
      const response = await request(app)
        .get('/test-cors')
        .set('Origin', 'http://example.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    test('POST リクエストに Access-Control-Allow-Origin ヘッダーが含まれる', async () => {
      const response = await request(app)
        .post('/test-cors')
        .set('Origin', 'http://example.com')
        .send({ test: 'data' })
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    test('複数の異なるオリジンがすべて許可される', async () => {
      const origins = [
        'http://localhost:3000',
        'http://example.com',
        'https://api.example.com',
        'https://different-domain.org'
      ];

      for (const origin of origins) {
        const response = await request(app)
          .get('/test-cors')
          .set('Origin', origin)
          .expect(200);

        expect(response.headers['access-control-allow-origin']).toBe('*');
      }
    });
  });

  describe('認証ルートの CORS', () => {
    let authApp;

    beforeEach(() => {
      authApp = express();
      
      // CORS ミドルウェア
      const cors = require('cors');
      authApp.use(cors());
      
      authApp.use(express.json());
      
      // テスト用認証ルート
      authApp.post('/auth/register', (req, res) => {
        res.status(201).json({ success: true, message: '注册成功' });
      });

      authApp.post('/auth/login', (req, res) => {
        res.json({ success: true, message: '登录成功' });
      });
    });

    test('CORS により異なるオリジンからの POST /auth/register が許可される', async () => {
      const response = await request(authApp)
        .post('/auth/register')
        .set('Origin', 'http://frontend.example.com')
        .set('Content-Type', 'application/json')
        .send({ username: 'testuser', password: 'password123' })
        .expect(201);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.body.success).toBe(true);
    });

    test('CORS により異なるオリジンからの POST /auth/login が許可される', async () => {
      const response = await request(authApp)
        .post('/auth/login')
        .set('Origin', 'http://mobile.example.com')
        .set('Content-Type', 'application/json')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.body.success).toBe(true);
    });
  });

  describe('簡単なリクエスト (Simple Requests)', () => {
    test('GET リクエストはプリフライトなしで実行される', async () => {
      const response = await request(app)
        .get('/test-cors')
        .set('Origin', 'http://example.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    test('Content-Type: application/json の POST リクエストが許可される', async () => {
      const response = await request(app)
        .post('/test-cors')
        .set('Origin', 'http://example.com')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
});
