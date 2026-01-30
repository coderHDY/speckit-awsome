const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const { getBrowserInfo, getOSInfo } = require('./utils/userAgentParser');
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.json()); // JSONリクエストボディをパース

// セッション設定
// 注意：本番環境では環境変数でSESSION_SECRETを設定すること
// 例：process.env.SESSION_SECRET || 'your-secret-key'
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
    httpOnly: true,
    secure: false // 開発環境はfalse、本番環境はtrue（HTTPS必須）
  }
}));

// ルート設定
app.use('/auth', authRoutes); // 認証ルートをマウント（/auth プレフィックス付き）

/**
 * GET /test - ブラウザ情報を返すエンドポイント
 * 
 * リクエストヘッダーからブラウザ情報を抽出し、構造化されたJSONで返す
 * 
 * レスポンス:
 * - success: 成功フラグ
 * - message: メッセージ
 * - data: ブラウザ情報オブジェクト
 */
app.get('/test', (req, res) => {
  const userAgent = req.headers['user-agent'];
  const acceptLanguage = req.headers['accept-language'];
  const acceptEncoding = req.headers['accept-encoding'];
  const connection = req.headers['connection'];
  const host = req.headers['host'];
  const referer = req.headers['referer'];
  
  // ブラウザ情報をパース（utils経由）
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

/**
 * サーバーを起動
 * 指定されたポートでHTTPサーバーをリッスン開始
 */
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/test 查看浏览器信息`);
});
