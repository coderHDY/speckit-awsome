# ブラウザ情報取得 API

## エンドポイント

```
GET /test
```

## 説明

クライアントのブラウザ情報、OS、言語設定、IPアドレスなどの詳細情報を取得します。リクエストヘッダーを解析して構造化されたJSONで返します。

## リクエスト

### メソッド

```
GET
```

### パラメータ

不要（すべてリクエストヘッダーから自動取得）

### リクエスト例

```bash
GET /test HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Accept-Encoding: gzip, deflate, br
```

## レスポンス

### 成功レスポンス (200 OK)

```json
{
  "success": true,
  "message": "浏览器信息",
  "data": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "browser": "Chrome",
    "os": "Windows",
    "language": "zh-CN,zh;q=0.9,en;q=0.8",
    "encoding": "gzip, deflate, br",
    "host": "localhost:3000",
    "referer": "无",
    "ip": "::1",
    "allHeaders": {
      "user-agent": "Mozilla/5.0...",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "accept-encoding": "gzip, deflate, br",
      "host": "localhost:3000",
      "connection": "keep-alive"
    }
  }
}
```

### レスポンスフィールド説明

| フィールド | 型 | 説明 |
|----------|-----|------|
| success | boolean | リクエスト成功フラグ（常に `true`） |
| message | string | レスポンスメッセージ |
| data | object | ブラウザ情報オブジェクト |
| data.userAgent | string | 完全なUser-Agent文字列 |
| data.browser | string | ブラウザ名（Chrome, Safari, Firefox, Edge等） |
| data.os | string | OS名（Windows, macOS, Linux, Android, iOS等） |
| data.language | string | 受け入れ言語設定 |
| data.encoding | string | 受け入れエンコーディング |
| data.host | string | リクエストされたホスト |
| data.referer | string | リファラーURL（存在しない場合は「无」） |
| data.ip | string | クライアントIPアドレス |
| data.allHeaders | object | すべてのリクエストヘッダー |

## ブラウザ識別

サポートされているブラウザ:

| ブラウザ | 返される値 |
|---------|----------|
| Google Chrome | `Chrome` |
| Safari | `Safari` |
| Mozilla Firefox | `Firefox` |
| Microsoft Edge | `Edge` |
| Internet Explorer | `Internet Explorer` |
| Opera | `Opera` |
| その他 | `其他` |
| 不明 | `未知` |

## OS識別

サポートされているOS:

| OS | 返される値 |
|----|----------|
| Windows | `Windows` |
| macOS | `macOS` |
| Linux | `Linux` |
| Android | `Android` |
| iOS | `iOS` |
| その他 | `其他` |
| 不明 | `未知` |

## 使用例

### cURL

```bash
curl http://localhost:3000/test
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/test');
const data = await response.json();

console.log('ブラウザ:', data.data.browser);
console.log('OS:', data.data.os);
console.log('言語:', data.data.language);
console.log('IP:', data.data.ip);
```

### Axios

```javascript
import axios from 'axios';

try {
  const response = await axios.get('http://localhost:3000/test');
  const browserInfo = response.data.data;
  
  console.log('ブラウザ情報:', {
    browser: browserInfo.browser,
    os: browserInfo.os,
    language: browserInfo.language,
    ip: browserInfo.ip
  });
} catch (error) {
  console.error('エラー:', error);
}
```

### jQuery

```javascript
$.ajax({
  url: 'http://localhost:3000/test',
  method: 'GET',
  success: function(response) {
    console.log('ブラウザ:', response.data.browser);
    console.log('OS:', response.data.os);
  }
});
```

## レスポンス例（各ブラウザ）

### Chrome on Windows

```json
{
  "success": true,
  "message": "浏览器信息",
  "data": {
    "browser": "Chrome",
    "os": "Windows",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
}
```

### Safari on macOS

```json
{
  "success": true,
  "message": "浏览器信息",
  "data": {
    "browser": "Safari",
    "os": "macOS",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
  }
}
```

### Chrome on Android

```json
{
  "success": true,
  "message": "浏览器信息",
  "data": {
    "browser": "Chrome",
    "os": "Android",
    "userAgent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
  }
}
```

### Safari on iOS

```json
{
  "success": true,
  "message": "浏览器信息",
  "data": {
    "browser": "Safari",
    "os": "iOS",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  }
}
```

## 用途

このエンドポイントは以下の用途に使用できます:

- ブラウザ互換性の検出
- モバイル/デスクトップの判別
- 言語設定に基づくコンテンツローカライゼーション
- アクセスログとアナリティクス
- デバッグとトラブルシューティング
- A/Bテストのセグメンテーション

## 注意事項

- User-Agentは偽装可能なため、100%信頼できる情報ではありません
- プライバシーに配慮し、IP情報の保存・利用には注意が必要です
- IPアドレスはプロキシやVPN経由の場合、実際のクライアントIPと異なる可能性があります

## 関連エンドポイント

なし（独立したユーティリティエンドポイント）
