# API ドキュメント

Speckit Server の全APIエンドポイントのドキュメントです。

## ベースURL

```
http://localhost:3000
```

本番環境では適切なドメイン/URLに置き換えてください。

## 認証エンドポイント

### ユーザー登録

新しいユーザーアカウントを作成します。

- **エンドポイント**: `POST /auth/register`
- **認証**: 不要
- **詳細**: [register.md](./register.md)

### ユーザーログイン

既存ユーザーでログインし、セッションを確立します。

- **エンドポイント**: `POST /auth/login`
- **認証**: 不要
- **詳細**: [login.md](./login.md)

### ユーザーログアウト

現在のユーザーセッションを終了します。

- **エンドポイント**: `POST /auth/logout`
- **認証**: 不要
- **詳細**: [logout.md](./logout.md)

## ユーティリティエンドポイント

### ブラウザ情報取得

クライアントのブラウザ、OS、言語設定などの情報を取得します。

- **エンドポイント**: `GET /test`
- **認証**: 不要
- **詳細**: [test.md](./test.md)

## 共通レスポンス形式

すべてのAPIエンドポイントは以下の標準形式でレスポンスを返します:

### 成功レスポンス

```json
{
  "success": true,
  "message": "成功メッセージ",
  "data": {
    // レスポンスデータ
  }
}
```

### エラーレスポンス

```json
{
  "success": false,
  "message": "エラーメッセージ",
  "error": "ERROR_CODE"
}
```

## HTTPステータスコード

| コード | 説明 |
|-------|------|
| 200 | OK - リクエスト成功 |
| 201 | Created - リソース作成成功 |
| 400 | Bad Request - 不正なリクエスト |
| 401 | Unauthorized - 認証失敗 |
| 409 | Conflict - リソースの競合 |
| 500 | Internal Server Error - サーバーエラー |

## エラーコード一覧

| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `MISSING_FIELDS` | 必須フィールドが欠けています | 400 |
| `INVALID_USERNAME` | ユーザー名の形式が無効です | 400 |
| `INVALID_PASSWORD` | パスワードの形式が無効です | 400 |
| `MISSING_CREDENTIALS` | 認証情報が欠けています | 400 |
| `INVALID_CREDENTIALS` | ユーザー名またはパスワードが正しくありません | 401 |
| `USERNAME_EXISTS` | ユーザー名が既に存在します | 409 |
| `INTERNAL_ERROR` | サーバー内部エラーが発生しました | 500 |

## リクエストヘッダー

### Content-Type

JSONリクエストの場合:

```
Content-Type: application/json
```

### Cookie（セッション使用時）

ログイン後のリクエストでは、セッションCookieを含めてください:

```
Cookie: connect.sid=s%3A...
```

ほとんどのHTTPクライアント（fetch, axios, cURL等）は自動的にCookieを処理します。

## CORS設定

**現在の設定**: すべてのオリジンからのクロスオリジンリクエスト（CORS）を許可しています。

### サポートされているメソッド

- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS

### 許可されるオリジン

現在、すべてのオリジンからのリクエストを受け入れています:

```
Access-Control-Allow-Origin: *
```

### 本番環境での設定

**セキュリティ上の注意**: 開発環境では`*`を使用していますが、本番環境では以下のように特定のオリジンのみを許可するように設定してください:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**環境変数での設定** (推奨):

```bash
# .env.local
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

詳細は [CORS.md](./CORS.md) を参照してください。

## レート制限

現在、レート制限は実装されていません。本番環境では適切なレート制限の実装を推奨します。

## セキュリティ

### パスワードハッシュ

- すべてのパスワードは bcryptjs（ソルトラウンド: 10）でハッシュ化されます
- パスワードは平文で保存されません
- レスポンスにパスワードハッシュは含まれません

### セッション管理

- セッションは express-session で管理されます
- セッションCookieは HttpOnly フラグで保護されています
- 本番環境では HTTPS を使用し、Cookie の Secure フラグを有効にしてください

### 入力検証

- すべての入力は厳格にバリデーションされます
- SQLインジェクション対策（ファイルベース保存）
- XSS対策はクライアント側で実装してください

## 開発環境

```bash
# サーバー起動
npm start

# 開発モード（自動再起動）
npm run dev

# テスト実行
npm test

# カバレッジ確認
npm run test:coverage
```

## バージョン

現在のバージョン: 1.0.0

## サポート

問題が発生した場合は、プロジェクトのIssueトラッカーで報告してください。

## ライセンス

ISC
