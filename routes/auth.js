const express = require('express');
const { hashPassword, verifyPassword } = require('@/utils/passwordHelper');
const { generateUUID } = require('@/utils/cryptoHelper');
const { validateUsername, validatePassword, validateRequiredFields } = require('@/utils/validator');
const mongoStorage = require('@/utils/mongoStorage');
const logger = require('@/utils/logger');

const router = express.Router();

/**
 * POST /register - ユーザー登録エンドポイント
 * 
 * リクエストボディ:
 * - username: ユーザー名（3-20文字、英数字とアンダースコアのみ）
 * - password: パスワード（6-50文字）
 * 
 * レスポンス:
 * - 成功: 201 Created, ユーザーIDとユーザー名を返す
 * - 失敗: 400/409/500 エラーメッセージを返す
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 必須フィールドの検証
    if (!validateRequiredFields(req.body, ['username', 'password'])) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
        error: 'MISSING_FIELDS'
      });
    }

    // ユーザー名形式の検証
    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: '用户名必须是3-20个字符，只能包含字母、数字和下划线',
        error: 'INVALID_USERNAME'
      });
    }

    // パスワード長の検証
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: '密码长度必须在6-50个字符之间',
        error: 'INVALID_PASSWORD'
      });
    }

    // ユーザー名の重複チェック
    const existingUser = await mongoStorage.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名已存在',
        error: 'USERNAME_EXISTS'
      });
    }

    // パスワードをハッシュ化（utils経由）
    const passwordHash = await hashPassword(password);

    // ユーザーIDを生成（utils経由）
    const userId = generateUUID();

    // 新しいユーザーオブジェクトを作成
    const newUser = {
      id: userId,
      username: username,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    // ユーザーをMongoDBに保存
    await mongoStorage.addUser(newUser);

    // 成功レスポンスを返す（パスワードハッシュは含めない）
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    logger.error('注册错误', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /login - ユーザーログインエンドポイント
 * 
 * リクエストボディ:
 * - username: ユーザー名
 * - password: パスワード
 * 
 * レスポンス:
 * - 成功: 200 OK, セッションを作成してユーザー情報を返す
 * - 失敗: 400/401/500 エラーメッセージを返す
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // リクエストボディの検証
    if (!validateRequiredFields(req.body, ['username', 'password'])) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // ユーザー名でユーザーを検索
    const user = await mongoStorage.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // パスワードを検証（utils経由）
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // セッションにユーザー情報を保存
    req.session.user = {
      id: user.id,
      username: user.username
    };

    // 成功レスポンスを返す
    res.json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    logger.error('登录错误', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /logout - ユーザーログアウトエンドポイント
 * 
 * セッションを破棄し、ユーザーのログアウト処理を実行します
 * 未ログインユーザーがアクセスしても成功レスポンスを返します（セッションがない場合）
 * 
 * リクエストボディ:
 * - なし
 * 
 * レスポンス:
 * - 成功: 200 OK, 成功メッセージを返す
 * - 失敗: 500 サーバーエラー
 */
router.post('/logout', async (req, res) => {
  try {
    // セッション破棄
    req.session.destroy((err) => {
      if (err) {
        logger.error('ログアウト時のセッション破棄エラー', err);
        return res.status(500).json({
          success: false,
          message: '服务器内部错误',
          error: 'SESSION_DESTROY_ERROR'
        });
      }

      // 成功レスポンスを返す
      res.json({
        success: true,
        message: '登出成功'
      });
    });
  } catch (error) {
    logger.error('ログアウト処理エラー', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
