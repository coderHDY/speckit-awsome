# Speckit Server

一个 Express 服务器，提供浏览器信息查询和 MongoDB 用户认证功能。

## 功能

- 浏览器信息查询 API
- MongoDB 用户注册和登录
- 密码加密与验证
- 用户会话管理

## 安装

```bash
npm install
```

## 配置

### MongoDB 设置

创建 `.env.local` 文件（本地开发）：

```env
# MongoDB 连接
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=speckit

# 调试模式
DEBUG=false
```

#### 本地 MongoDB

使用 Docker 运行本地 MongoDB：

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas（云端）

在 `.env.local` 中设置 MongoDB Atlas 连接字符串：

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
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

### 浏览器信息

#### GET /test

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

### 用户认证

#### POST /auth/register

注册新用户。

**请求：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应（成功 - 201）：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": "uuid-string",
    "username": "testuser"
  }
}
```

**错误响应：**
- `400` - 无效的用户名或密码
- `409` - 用户名已存在
- `500` - 服务器错误

**用户名要求：**
- 长度：3-20 个字符
- 只允许：字母、数字、下划线

**密码要求：**
- 长度：6-50 个字符

#### POST /auth/login

用户登录。

**请求：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应（成功 - 200）：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "id": "uuid-string",
    "username": "testuser"
  }
}
```

**错误响应：**
- `400` - 缺少必需字段
- `401` - 用户名或密码错误
- `500` - 服务器错误

## 测试

运行所有测试：
```bash
npm test
```

运行特定测试：
```bash
npm test -- test/routes/auth.test.js
npm test -- test/utils/mongoStorage.test.js
```

生成覆盖率报告：
```bash
npm test -- --coverage
```

## 项目结构

```
.
├── routes/
│   └── auth.js              # 认证路由（注册、登录）
├── utils/
│   ├── mongoConnection.js   # MongoDB 连接管理
│   ├── mongoStorage.js      # 用户数据存储操作
│   ├── logger.js            # 日志记录
│   ├── passwordHelper.js    # 密码加密/验证
│   ├── cryptoHelper.js      # UUID 生成
│   └── validator.js         # 验证函数
├── test/
│   ├── setup.js             # Jest 配置
│   ├── globalSetup.js       # mongodb-memory-server 启动
│   ├── globalTeardown.js    # mongodb-memory-server 关闭
│   ├── utils/
│   │   ├── mongoConnection.test.js
│   │   ├── mongoStorage.test.js
│   │   └── logger.test.js
│   └── routes/
│       └── auth.test.js
├── data/
│   └── users.json           # 旧版本用户数据（已迁移）
├── package.json
├── jest.config.js
└── README.md
```

## 数据库架构

MongoDB 数据库：`speckit`  
用户集合：`users`

### 用户文档示例

```json
{
  "_id": ObjectId("..."),
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "testuser",
  "passwordHash": "$2a$10/...",
  "createdAt": "2026-01-30T01:00:00.000Z"
}
```

**索引：**
- `_id` (默认)
- `username` (唯一索引)

## 技术栈

- **运行时**: Node.js 14+
- **框架**: Express.js
- **数据库**: MongoDB 5.0+
- **驱动**: mongodb ^5.0.0
- **密码**: bcryptjs 3.0.3
- **测试**: Jest 29.7.0, Supertest 6.3.4
- **测试DB**: mongodb-memory-server

## 访问

启动服务器后，可以访问：
- 浏览器信息: http://localhost:3000/test
- 注册端点: POST http://localhost:3000/auth/register
- 登录端点: POST http://localhost:3000/auth/login
