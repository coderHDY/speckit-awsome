# Speckit Server

一个简单的 Express 服务器，提供浏览器信息查询功能。

## 安装

```bash
npm install
```

## 运行

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API 接口

### GET /test

返回用户浏览器的详细信息。

**响应示例：**
```json
{
  "success": true,
  "message": "浏览器信息",
  "data": {
    "userAgent": "Mozilla/5.0...",
    "browser": "Chrome",
    "os": "macOS",
    "language": "zh-CN,zh;q=0.9",
    "encoding": "gzip, deflate, br",
    "host": "localhost:3000",
    "referer": "无",
    "ip": "::1"
  }
}
```

## 访问

启动服务器后，在浏览器中访问：
- http://localhost:3000/test
