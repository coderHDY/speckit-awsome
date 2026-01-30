# Logout API ドキュメント

## 概要

ユーザーのセッションを終了し、ログアウト処理を実行するエンドポイントです。

## エンドポイント

```
POST /auth/logout
```

## リクエスト

### Headers

| ヘッダー | 必須 | 説明 |
|---------|------|------|
| Content-Type | ✓ | `application/json` |

### Body

ボディは空でも構いません。

```json
{}
```

### Example (cURL)

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -c - \
  -b "connect.sid=s%3A..."
```

## レスポンス

### 成功時 (200 OK)

```json
{
  "success": true,
  "message": "登出成功"
}
```

### エラー時 (500 Internal Server Error)

#### セッション破棄エラー

```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "SESSION_DESTROY_ERROR"
}
```

#### その他のエラー

```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "INTERNAL_ERROR"
}
```

## 動作

1. **セッション破棄**: クライアントのセッションクッキー (connect.sid) を無効化します
2. **レスポンス返却**: 成功メッセージを返します
3. **未ログイン時**: ログインしていないユーザーがアクセスしても成功レスポンスを返します

## 使用例

### JavaScript (Fetch)

```javascript
async function logout() {
  try {
    const response = await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // クッキー送信
    });

    const data = await response.json();

    if (data.success) {
      console.log('ログアウト成功:', data.message);
      // ページリダイレクトなど
      window.location.href = '/login';
    } else {
      console.error('ログアウト失敗:', data.error);
    }
  } catch (error) {
    console.error('エラー:', error);
  }
}
```

### Node.js (axios)

```javascript
const axios = require('axios');

async function logout() {
  try {
    const response = await axios.post('http://localhost:3000/auth/logout', {}, {
      withCredentials: true
    });

    console.log('ログアウト成功:', response.data.message);
  } catch (error) {
    console.error('ログアウト失敗:', error.response.data.error);
  }
}
```

## 関連

- [Register ドキュメント](./register.md)
- [Login ドキュメント](./login.md)
- [認証フロー](./README.md#認証フロー)
