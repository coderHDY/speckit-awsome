# ユーザー登録 API

## エンドポイント

```
POST /auth/register
```

## 説明

新しいユーザーアカウントを作成します。ユーザー名とパスワードを検証し、パスワードをハッシュ化して安全に保存します。

## リクエスト

### ヘッダー

```
Content-Type: application/json
```

### ボディパラメータ

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| username | string | ✓ | ユーザー名（3-20文字、英数字とアンダースコアのみ） |
| password | string | ✓ | パスワード（6-50文字） |

### リクエスト例

```json
{
  "username": "testuser123",
  "password": "securePassword456"
}
```

## レスポンス

### 成功レスポンス (201 Created)

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser123"
  }
}
```

### エラーレスポンス

#### 必須フィールド欠如 (400 Bad Request)

```json
{
  "success": false,
  "message": "用户名和密码不能为空",
  "error": "MISSING_FIELDS"
}
```

#### 無効なユーザー名形式 (400 Bad Request)

```json
{
  "success": false,
  "message": "用户名必须是3-20个字符，只能包含字母、数字和下划线",
  "error": "INVALID_USERNAME"
}
```

#### 無効なパスワード長 (400 Bad Request)

```json
{
  "success": false,
  "message": "密码长度必须在6-50个字符之间",
  "error": "INVALID_PASSWORD"
}
```

#### ユーザー名重複 (409 Conflict)

```json
{
  "success": false,
  "message": "用户名已存在",
  "error": "USERNAME_EXISTS"
}
```

#### サーバーエラー (500 Internal Server Error)

```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "INTERNAL_ERROR"
}
```

## バリデーションルール

### ユーザー名

- 長さ: 3-20文字
- 使用可能文字: 英数字 (a-z, A-Z, 0-9) とアンダースコア (_)
- 例: `user123`, `test_user`, `John_Doe_99`

### パスワード

- 長さ: 6-50文字
- すべての文字が使用可能

## セキュリティ

- パスワードは bcryptjs アルゴリズムでハッシュ化されます（ソルトラウンド: 10）
- レスポンスにはパスワードハッシュは含まれません
- ユーザーIDはUUID v4形式で自動生成されます

## 使用例

### cURL

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "mypassword123"
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    password: 'mypassword123'
  })
});

const data = await response.json();
console.log(data);
```

## 関連エンドポイント

- [POST /auth/login](./login.md) - ユーザーログイン
