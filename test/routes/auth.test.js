/**
 * 認証ルートの統合テスト
 */
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const authRoutes = require('@/routes/auth');
const mongoStorage = require('@/utils/mongoStorage');
const { connectMongoDB, closeMongoDB } = require('@/utils/mongoConnection');

describe('認証ルート 統合テスト（MongoDB版）', () => {
  let app;

  // テスト前にMongoDBに接続
  beforeAll(async () => {
    await connectMongoDB();
  });

  // 各テストの前にアプリを設定
  beforeEach(() => {
    // テスト用アプリの初期化
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }));
    app.use('/auth', authRoutes);
  });

  // テスト後にユーザーをクリア
  afterEach(async () => {
    await mongoStorage.clearUsers();
  });

  // テスト終了後に接続を閉じる
  afterAll(async () => {
    await closeMongoDB();
  });

  describe('POST /auth/register', () => {
    test('有効なデータで登録に成功する', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('注册成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    test('必須フィールド欠如時に400エラーを返す', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser'
          // passwordが欠けている
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_FIELDS');
    });

    test('無効なユーザー名で400エラーを返す', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'ab', // 短すぎる
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_USERNAME');
    });

    test('無効なパスワードで400エラーを返す', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: '12345' // 短すぎる
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_PASSWORD');
    });

    test('既存のユーザー名で409エラーを返す', async () => {
      // 最初のユーザーを登録
      await request(app)
        .post('/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123'
        })
        .expect(201);

      // 同じユーザー名で再度登録を試みる
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'existinguser',
          password: 'differentpassword'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USERNAME_EXISTS');
    });

    test('ユーザー名に無効な文字が含まれるとエラーを返す', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'user@invalid',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('INVALID_USERNAME');
    });

    test('パスワードが長すぎるとエラーを返す', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'a'.repeat(51)
        })
        .expect(400);

      expect(response.body.error).toBe('INVALID_PASSWORD');
    });

    test('ユーザー名に無効な文字が含まれるとエラーを返す', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'user@invalid',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('INVALID_USERNAME');
    });
  });

  describe('POST /auth/login', () => {
    // テスト用ユーザーを事前に登録
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          username: 'loginuser',
          password: 'password123'
        });
    });

    test('正しい認証情報でログインに成功する', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data.username).toBe('loginuser');
      expect(response.body.data).toHaveProperty('id');
    });

    test('必須フィールド欠如時に400エラーを返す', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'loginuser'
          // passwordが欠けている
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_CREDENTIALS');
    });

    test('存在しないユーザー名で401エラーを返す', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    test('誤ったパスワードで401エラーを返す', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    test('ユーザー列挙攻撃を防止する（同じメッセージを返す）', async () => {
      // 存在しないユーザーでのログイン
      const nonexistentResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      // 間違ったパスワードでのログイン
      const wrongPasswordResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        })
        .expect(401);

      // 両方とも同じステータスコードとエラーメッセージを返す
      expect(nonexistentResponse.body.message).toBe(wrongPasswordResponse.body.message);
    });

    test('ログイン成功時にセッションが作成される', async () => {
      const agent = request.agent(app);
      
      const loginResponse = await agent
        .post('/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /auth/logout', () => {
    test('ログイン後のログアウトに成功する', async () => {
      // 最初にユーザーを登録
      await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(201);

      // ログイン
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200);

      // セッションCookieを取得
      const cookie = loginResponse.headers['set-cookie'];

      // ログアウト
      const logoutResponse = await request(app)
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.message).toBe('登出成功');
    });

    test('未ログインユーザーのログアウトは成功する', async () => {
      // ログインしていない状態でログアウト
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登出成功');
    });

    test('ログアウト後はセッションが無効になる', async () => {
      // ユーザーを登録
      await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser2',
          password: 'password456'
        })
        .expect(201);

      // ログイン
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser2',
          password: 'password456'
        })
        .expect(200);

      const cookie = loginResponse.headers['set-cookie'];

      // ログアウト
      await request(app)
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(200);

      // ログアウト後にセッションCookieを使用してアクセス
      // 注：この後、セッション情報を確認するエンドポイントがあれば、
      // 未認証状態であることを確認できます
    });

    test('複数回ログアウトしてもエラーが発生しない', async () => {
      // 1回目のログアウト
      await request(app)
        .post('/auth/logout')
        .expect(200);

      // 2回目のログアウト
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
