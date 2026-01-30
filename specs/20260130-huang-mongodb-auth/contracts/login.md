# POST /login - ユーザーログイン API

## 概要

ユーザーの認証を行います。ユーザー名とパスワードを受け取り、MongoDB に保存されたパスワードハッシュと検証します。

## エンドポイント

```
POST /login
```

## リクエスト

### リクエストヘッダー

```http
Content-Type: application/json
```

### リクエストボディ

```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| `username` | String | Yes | ユーザー名 |
| `password` | String | Yes | パスワード（平文） |

## レスポンス

### 成功レスポンス (200 OK)

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe"
  }
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `success` | Boolean | 成功フラグ |
| `message` | String | ユーザー向けメッセージ（中国語） |
| `data.id` | String | ユーザーID（UUID） |
| `data.username` | String | ユーザー名 |

### エラーレスポンス

#### 1. 必須フィールド不足 (400 Bad Request)

```json
{
  "success": false,
  "message": "用户名和密码不能为空",
  "error": "MISSING_FIELDS"
}
```

#### 2. ユーザー名が見つからない (401 Unauthorized)

```json
{
  "success": false,
  "message": "用户名或密码不正确",
  "error": "INVALID_CREDENTIALS"
}
```

#### 3. パスワード不正 (401 Unauthorized)

```json
{
  "success": false,
  "message": "用户名或密码不正确",
  "error": "INVALID_CREDENTIALS"
}
```

*注意*: セキュリティ上、ユーザー名が存在しない場合とパスワードが違う場合は同じメッセージを返す。

#### 4. サーバーエラー (500 Internal Server Error)

```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "INTERNAL_ERROR"
}
```

*注意*: MongoDB 接続エラー時も 500 を返す。詳細なエラー情報はサーバーログ（logger.error()）に記録。

## リクエスト例

### cURL

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securePassword123"
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'securePassword123'
  })
});

const data = await response.json();
if (data.success) {
  console.log('ログイン成功:', data.data);
} else {
  console.error('ログイン失敗:', data.message);
}
```

## 処理フロー

1. リクエストボディから `username` と `password` を取得
2. 必須フィールド検証（両方が存在するか）
3. MongoDB でユーザー名を検索（`mongoStorage.findUserByUsername()`）
4. ユーザーが存在しなければ 401 エラー返却（"用户名或密码不正确"）
5. パスワードを検証（bcryptjs `verifyPassword()` で passwordHash と比較）
6. パスワードが一致しなければ 401 エラー返却（"用户名或密码不正确"）
7. パスワード検証成功時、200 OK でユーザーID と名前を返す
8. ログイン成功をログ記録（`logger.info()`）

## 仕様注記

- **パスワード**: レスポンスには含めない（セキュリティ）
- **セキュリティ**: ユーザー存在チェックとパスワード検証失敗時は同じメッセージを返す（ユーザー列挙攻撃対策）
- **ログイン履歴**: 成功時は `logger.info()` でログ、失敗時は `logger.warn()` でログ
- **リトライ**: リトライ制限は実装スコープ外（API レベルではなくネットワークレベルで処理）
- **セッション/トークン**: 本スコープでは実装せず。レスポンスは認証結果のみ返す

---

**API Version**: 1.0  
**Last Updated**: 2026-01-30
