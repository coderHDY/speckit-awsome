const request = require('supertest');
const express = require('express');
const { getBrowserInfo, getOSInfo } = require('@/utils/userAgentParser');

/**
 * /test エンドポイントの統合テスト
 */
describe('GET /test エンドポイント', () => {
  let app;

  beforeEach(() => {
    // テスト用アプリの初期化
    app = express();
    app.use(express.json());
    
    // /testルートを追加
    app.get('/test', (req, res) => {
      const userAgent = req.headers['user-agent'];
      const acceptLanguage = req.headers['accept-language'];
      const acceptEncoding = req.headers['accept-encoding'];
      const host = req.headers['host'];
      const referer = req.headers['referer'];
      
      const browserInfo = {
        userAgent: userAgent,
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent),
        language: acceptLanguage,
        encoding: acceptEncoding,
        host: host,
        referer: referer || '无',
        ip: req.ip || req.connection.remoteAddress,
        allHeaders: req.headers
      };
      
      res.json({
        success: true,
        message: '浏览器信息',
        data: browserInfo
      });
    });
  });

  test('ブラウザ情報を正しく返す', async () => {
    const response = await request(app)
      .get('/test')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('浏览器信息');
    expect(response.body.data).toHaveProperty('userAgent');
    expect(response.body.data).toHaveProperty('browser');
    expect(response.body.data).toHaveProperty('os');
  });

  test('Chrome User-Agentを正しく識別する', async () => {
    const response = await request(app)
      .get('/test')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      .expect(200);

    expect(response.body.data.browser).toBe('Chrome');
    expect(response.body.data.os).toBe('Windows');
  });

  test('Safari User-Agentを正しく識別する', async () => {
    const response = await request(app)
      .get('/test')
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15')
      .expect(200);

    expect(response.body.data.browser).toBe('Safari');
    expect(response.body.data.os).toBe('macOS');
  });

  test('Accept-Languageヘッダーを正しく返す', async () => {
    const response = await request(app)
      .get('/test')
      .set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8')
      .expect(200);

    expect(response.body.data.language).toBe('zh-CN,zh;q=0.9,en;q=0.8');
  });

  test('Refererが存在しない場合は「无」を返す', async () => {
    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.body.data.referer).toBe('无');
  });

  test('Refererが存在する場合はその値を返す', async () => {
    const response = await request(app)
      .get('/test')
      .set('Referer', 'https://example.com')
      .expect(200);

    expect(response.body.data.referer).toBe('https://example.com');
  });

  test('すべてのヘッダー情報を含む', async () => {
    const response = await request(app)
      .get('/test')
      .set('User-Agent', 'TestAgent/1.0')
      .set('Accept-Encoding', 'gzip, deflate')
      .expect(200);

    expect(response.body.data.allHeaders).toHaveProperty('user-agent');
    expect(response.body.data.allHeaders).toHaveProperty('accept-encoding');
  });
});
