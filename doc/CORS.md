# CORS 設定ガイド

## 概要

このサーバーは現在、すべてのオリジンからのクロスオリジンリクエスト（CORS）を許可しています。

## 現在の設定

```javascript
app.use(cors());
```

これにより、以下のヘッダーがすべてのレスポンスに含まれます:

```
Access-Control-Allow-Origin: *
```

## 開発環境 vs 本番環境

### 開発環境

開発環境では、フロントエンド開発を容易にするため、すべてのオリジンを許可しています。

**使用方法**:
```bash
npm run dev
```

### 本番環境

**⚠️ セキュリティ警告**: 本番環境では `*` を使用しないでください。特定のオリジンのみを許可してください。

## 本番環境での設定

### 方法 1: 環境変数を使用した設定

1. `.env.local` ファイルを編集:

```bash
# .env.local
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
CORS_CREDENTIALS=true
```

2. index.js を更新:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true'
};

app.use(cors(corsOptions));
```

### 方法 2: 直接設定

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://app.yourdomain.com',
      'https://admin.yourdomain.com'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的 CORS オリジン'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## よくある設定

### フロントエンドと同じドメイン

```javascript
const corsOptions = {
  origin: 'https://yourdomain.com',
  credentials: true
};

app.use(cors(corsOptions));
```

### 複数のサブドメイン

```javascript
const corsOptions = {
  origin: /\.yourdomain\.com$/,
  credentials: true
};

app.use(cors(corsOptions));
```

### 開発環境と本番環境の切り替え

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : '*'
};

app.use(cors(corsOptions));
```

## プリフライトリクエスト

ブラウザは以下の場合に OPTIONS プリフライトリクエストを送信します:

1. **非シンプルなメソッド**: PUT, DELETE, PATCH など
2. **カスタムヘッダー**: `Authorization`, `X-Custom-Header` など
3. **Content-Type が以下以外**: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`

cors ミドルウェアは自動的にこれらのリクエストを処理します。

## テスト

CORS 機能のテストは [test/cors.test.js](../../test/cors.test.js) を参照してください:

```bash
npm test -- test/cors.test.js
```

テスト項目:
- ✅ OPTIONS プリフライトリクエスト
- ✅ アクセス制御ヘッダー
- ✅ 認証ルートの CORS サポート
- ✅ シンプルリクエスト

## トラブルシューティング

### CORS エラー: "No 'Access-Control-Allow-Origin' header"

**原因**: サーバーから CORS ヘッダーが返されていない

**解決方法**:
1. cors ミドルウェアが正しく設定されているか確認
2. cors ミドルウェアが express.json() より前にマウントされているか確認

```javascript
app.use(cors());        // これが先
app.use(express.json()); // これが後
```

### リクエストがブロックされる

**原因**: オリジンが許可リストに含まれていない

**解決方法**:
1. ブラウザ開発者ツールで Origin ヘッダーを確認
2. その Origin を許可リストに追加

## セキュリティベストプラクティス

1. ✅ 本番環境では `*` を使用しない
2. ✅ 必要な最小限のオリジンのみを許可
3. ✅ 認証情報（Cookie）が必要な場合は `credentials: true` を設定
4. ✅ 定期的に許可リストを確認・更新

## 関連リソース

- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [Express CORS ミドルウェア](https://expressjs.com/en/resources/middleware/cors.html)
- [cors npm パッケージ](https://www.npmjs.com/package/cors)

