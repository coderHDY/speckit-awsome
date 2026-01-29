const request = require('supertest');
const express = require('express');
const session = require('express-session');
const authRoutes = require('../../routes/auth');
const fs = require('fs');
const path = require('path');

/**
 * 認証ルートの統合テスト
 */
describe('認証ルート 統合テスト', () => {
  let app;
  const TEST_USERS_FILE = path.join(__dirname, '../../data/users.json');
  const BACKUP_FILE = path.join(__dirname, '../../data/users.backup.json');

  // テスト前にアプリを設定
  beforeEach(() => {
    // ユーザーデータのバックアップ
    if (fs.existsSync(TEST_USERS_FILE)) {
      fs.copyFileSync(TEST_USERS_FILE, BACKUP_FILE);
    }

    // テスト用アプリの初期化
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }));
    app.use(authRoutes);

    // テスト用の空のユーザーデータ
    const initialData = { users: [] };
    fs.writeFileSync(TEST_USERS_FILE, JSON.stringify(initialData, null, 2));
  });

  // テスト後にクリーンアップ
  afterEach(() => {
    // バックアップから復元
    if (fs.existsSync(BACKUP_FILE)) {
      fs.copyFileSync(BACKUP_FILE, TEST_USERS_FILE);
      fs.unlinkSync(BACKUP_FILE);
    }
  });

  describe('POST /register', () => {
    test('有効なデータで登録に成功する', async () => {
      const response = await request(app)
        .post('/register')
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
        .post('/register')
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
        .post('/register')
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
        .post('/register')
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
        .post('/register')
        .send({
          username: 'existinguser',
          password: 'password123'
        })
        .expect(201);

      // 同じユーザー名で再度登録を試みる
      const response = await request(app)
        .post('/register')
        .send({
          username: 'existinguser',
          password: 'differentpassword'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USERNAME_EXISTS');
    });
  });

  describe('POST /login', () => {
    // テスト用ユーザーを事前に登録
    beforeEach(async () => {
      await request(app)
        .post('/register')
        .send({
          username: 'loginuser',
          password: 'password123'
        });
    });

    test('正しい認証情報でログインに成功する', async () => {
      const response = await request(app)
        .post('/login')
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
        .post('/login')
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
        .post('/login')
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
        .post('/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    test('ログイン成功時にセッションが作成される', async () => {
      const agent = request.agent(app);
      
      const loginResponse = await agent
        .post('/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.headers['set-cookie']).toBeDefined();
    });
  });
});
