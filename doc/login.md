# ユーザーログイン API

## エンドポイント

```
POST /login
```

## 説明

登録済みユーザーの認証を行い、成功時にセッションを作成します。

## リクエスト

### ヘッダー

```
Content-Type: application/json
```

### ボディパラメータ

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| username | string | ✓ | 登録済みのユーザー名 |
| password | string | ✓ | ユーザーのパスワード |

### リクエスト例

```json
{
  "username": "testuser123",
  "password": "securePassword456"
}
```

## レスポンス

### 成功レスポンス (200 OK)

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser123"
  }
}
```

**注意**: 成功時、レスポンスヘッダーに `Set-Cookie` が含まれ、セッションが確立されます。

### エラーレスポンス

#### 必須フィールド欠如 (400 Bad Request)

```json
{
  "success": false,
  "message": "用户名和密码不能为空",
  "error": "MISSING_CREDENTIALS"
}
```

#### 認証失敗 (401 Unauthorized)

ユーザー名が存在しない、またはパスワードが正しくない場合:

```json
{
  "success": false,
  "message": "用户名或密码错误",
  "error": "INVALID_CREDENTIALS"
}
```

**注意**: セキュリティ上の理由から、ユーザー名の存在とパスワードの誤りを区別せず、同じエラーメッセージを返します。

#### サーバーエラー (500 Internal Server Error)

```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "INTERNAL_ERROR"
}
```

## セッション管理

### セッション設定

- **有効期限**: 7日間
- **Cookie名**: `connect.sid` (デフォルト)
- **HttpOnly**: `true` (JavaScriptからアクセス不可)
- **Secure**: 本番環境では `true` (HTTPS必須)

### セッションデータ

ログイン成功時、以下の情報がセッションに保存されます:

```javascript
{
  user: {
    id: "ユーザーID",
    username: "ユーザー名"
  }
}
```

### セッション利用

以降のリクエストでは、Cookieを含めることでセッション情報にアクセスできます。

## セキュリティ

- パスワードは bcryptjs で検証されます
- 失敗時のエラーメッセージは意図的に曖昧にしています（列挙攻撃対策）
- セッションCookieは HttpOnly フラグで保護されています

## 使用例

### cURL

```bash
# ログイン
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "securePassword456"
  }' \
  -c cookies.txt

# セッションを使用した後続リクエスト
curl http://localhost:3000/protected-route \
  -b cookies.txt
```

### JavaScript (fetch)

```javascript
// ログイン
const response = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // Cookieを送信・保存
  body: JSON.stringify({
    username: 'testuser123',
    password: 'securePassword456'
  })
});

const data = await response.json();
console.log(data);

// セッションを使用した後続リクエスト
const protectedResponse = await fetch('http://localhost:3000/protected-route', {
  credentials: 'include' // セッションCookieを含める
});
```

### Axios (Node.js/Browser)

```javascript
import axios from 'axios';

// Axiosインスタンスの作成（Cookie自動管理）
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// ログイン
try {
  const response = await api.post('/login', {
    username: 'testuser123',
    password: 'securePassword456'
  });
  
  console.log('ログイン成功:', response.data);
  
  // セッションは自動的に保持される
  // 後続のリクエストでセッションが使用される
} catch (error) {
  console.error('ログイン失敗:', error.response.data);
}
```

## フローチャート

```
クライアント              サーバー
    |                        |
    |-- POST /login -------->|
    |    {username, password}|
    |                        |
    |                        |-- ユーザー検索
    |                        |-- パスワード検証
    |                        |-- セッション作成
    |                        |
    |<-- 200 OK + Cookie ----|
    |    {success, data}     |
    |                        |
    |-- 後続リクエスト ------>|
    |    (Cookie含む)        |
    |                        |
    |                        |-- セッション確認
    |                        |-- リクエスト処理
    |                        |
    |<-- レスポンス ----------|
```

## 関連エンドポイント

- [POST /register](./register.md) - ユーザー登録
