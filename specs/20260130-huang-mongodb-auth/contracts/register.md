# POST /register - ユーザー登録 API

## 概要

新しいユーザーアカウントを作成します。ユーザー名とパスワードを受け取り、MongoDB に保存します。

## エンドポイント

```
POST /register
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

| フィールド | 型 | 必須 | 制約 | 説明 |
|-----------|-----|-----|------|------|
| `username` | String | Yes | 3-20文字、英数字とアンダースコアのみ | ユーザー名 |
| `password` | String | Yes | 6-50文字 | パスワード（平文） |

## レスポンス

### 成功レスポンス (201 Created)

```json
{
  "success": true,
  "message": "注册成功",
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
| `data.id` | String | 新規作成されたユーザーID（UUID） |
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

#### 2. ユーザー名形式不正 (400 Bad Request)

```json
{
  "success": false,
  "message": "用户名必须是3-20个字符，只能包含字母、数字和下划线",
  "error": "INVALID_USERNAME"
}
```

#### 3. パスワード長不正 (400 Bad Request)

```json
{
  "success": false,
  "message": "密码长度必须在6-50个字符之间",
  "error": "INVALID_PASSWORD"
}
```

#### 4. ユーザー名重複 (409 Conflict)

```json
{
  "success": false,
  "message": "用户名已存在",
  "error": "USERNAME_EXISTS"
}
```

#### 5. サーバーエラー (500 Internal Server Error)

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
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securePassword123"
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'securePassword123'
  })
});

const data = await response.json();
console.log(data);
```

## 処理フロー

1. リクエストボディから `username` と `password` を取得
2. 必須フィールド検証（両方が存在するか）
3. ユーザー名形式検証（正規表現: `^[a-zA-Z0-9_]{3,20}$`）
4. パスワード長検証（6-50文字）
5. MongoDB で既存ユーザー名をチェック（`findUserByUsername()`）
6. ユーザー名が重複していたら 409 エラー返却
7. パスワードをハッシュ化（bcryptjs、最小10ラウンド）
8. ユーザーID を UUID で生成
9. 新規ユーザーオブジェクトを作成（id, username, passwordHash, createdAt）
10. MongoDB に挿入（`mongoStorage.addUser()`）
11. 201 Created でユーザーID と名前を返す

## 仕様注記

- **パスワード**: レスポンスには含めない（セキュリティ）
- **ID**: UUID v4 形式で自動生成
- **CreatedAt**: ISO 8601 形式で自動設定
- **ユーザー名**: 一意性は MongoDB のユニークインデックスで保証
- **HTTP ステータスコード**: REST 標準に準拠

---

**API Version**: 1.0  
**Last Updated**: 2026-01-30
