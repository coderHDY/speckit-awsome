# Quick Start: MongoDB Authentication Implementation

**Feature**: `001-mongodb-auth`  
**Date**: 2026-01-30  
**Status**: Implementation Ready

## Prerequisites

- Node.js 14+ インストール済み
- MongoDB ローカル実行環境またはクラウド MongoDB URI
- 既存プロジェクト（Express、bcryptjs）セットアップ済み

## Step 1: 依存関係をインストール

```bash
# MongoDB driver をインストール
npm install mongodb

# テスト用 mongodb-memory-server をインストール
npm install --save-dev mongodb-memory-server
```

## Step 2: 環境変数を設定

`.env` ファイルを作成（または `.env.local`）:

```env
# ローカル開発環境
MONGODB_URI=mongodb://localhost:27017

# または、MongoDB Atlas を使用
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# データベース名
MONGODB_DB=speckit
```

## Step 3: MongoDB 接続モジュールを実装

**ファイル**: `utils/mongoConnection.js`

```javascript
/**
 * MongoDB接続管理
 * シングルトンパターンで接続を管理し、接続プールを再利用
 */

const { MongoClient } = require('mongodb');

let mongoClient;
let mongoDb;

/**
 * MongoDB に接続する
 * @returns {Promise<Object>} MongoDB Database インスタンス
 */
async function connectMongoDB() {
  if (mongoDb) {
    return mongoDb; // 既に接続済みの場合はそれを返す
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB || 'speckit';

    mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000
    });

    await mongoClient.connect();
    mongoDb = mongoClient.db(dbName);

    // インデックスを作成
    await ensureIndexes(mongoDb);

    console.log(`[INFO] MongoDB に接続しました: ${dbName}`);
    return mongoDb;
  } catch (error) {
    console.error(`[ERROR] MongoDB 接続エラー: ${error.message}`);
    throw error;
  }
}

/**
 * インデックスを作成・確保する
 * @param {Object} db MongoDB Database インスタンス
 */
async function ensureIndexes(db) {
  try {
    const usersCollection = db.collection('users');
    
    // username に一意のインデックスを作成
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    
    console.log('[INFO] インデックスを作成しました');
  } catch (error) {
    console.error(`[ERROR] インデックス作成エラー: ${error.message}`);
    // インデックスが既に存在する場合はエラーを無視
    if (!error.message.includes('duplicate key error')) {
      throw error;
    }
  }
}

/**
 * MongoDB 接続を閉じる
 */
async function closeMongoDB() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    console.log('[INFO] MongoDB 接続を閉じました');
  }
}

/**
 * MongoDB Database インスタンスを取得
 * @returns {Promise<Object>} MongoDB Database インスタンス
 */
async function getDb() {
  if (!mongoDb) {
    return await connectMongoDB();
  }
  return mongoDb;
}

module.exports = {
  connectMongoDB,
  getDb,
  closeMongoDB
};
```

## Step 4: ユーザーストレージを MongoDB 実装

**ファイル**: `utils/mongoStorage.js`

```javascript
/**
 * MongoDB を使用したユーザーストレージ実装
 * userStorage.js と同じインターフェースを提供
 */

const { getDb } = require('./mongoConnection');

/**
 * すべてのユーザーを読み込む
 * @returns {Promise<Array>} ユーザー配列
 */
async function readUsers() {
  const db = await getDb();
  const usersCollection = db.collection('users');
  return await usersCollection.find({}).toArray();
}

/**
 * ユーザー名でユーザーを検索
 * @param {string} username ユーザー名
 * @returns {Promise<Object|null>} ユーザーオブジェクトまたは null
 */
async function findUserByUsername(username) {
  const db = await getDb();
  const usersCollection = db.collection('users');
  return await usersCollection.findOne({ username });
}

/**
 * 新しいユーザーを追加
 * @param {Object} user ユーザーオブジェクト {id, username, passwordHash, createdAt}
 * @returns {Promise<Object>} 追加されたユーザー
 */
async function addUser(user) {
  const db = await getDb();
  const usersCollection = db.collection('users');
  const result = await usersCollection.insertOne(user);
  return { ...user, _id: result.insertedId };
}

module.exports = {
  readUsers,
  findUserByUsername,
  addUser
};
```

## Step 5: ロギングユーティリティを実装

**ファイル**: `utils/logger.js`

```javascript
/**
 * ロギングユーティリティ
 * 内部的には console を使用
 * 後で Winston や Pino などのロギングライブラリに切り替え可能
 */

module.exports = {
  /**
   * 一般情報をログ出力
   * @param {string} message ログメッセージ
   */
  info(message) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },

  /**
   * 警告をログ出力
   * @param {string} message ログメッセージ
   */
  warn(message) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },

  /**
   * エラーをログ出力
   * @param {string} message ログメッセージ
   * @param {Error} error エラーオブジェクト（オプション）
   */
  error(message, error) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error && error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
  },

  /**
   * デバッグ情報をログ出力
   * @param {string} message ログメッセージ
   */
  debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};
```

## Step 6: routes/auth.js を MongoDB に対応

既存の `routes/auth.js` を更新して、mongoStorage を使用:

```javascript
// routes/auth.js の一部更新例

const mongoStorage = require('../utils/mongoStorage');
const logger = require('../utils/logger');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ... 既存のバリデーション処理 ...

    // MongoDB でユーザーを検索
    const existingUser = await mongoStorage.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名已存在',
        error: 'USERNAME_EXISTS'
      });
    }

    // ... 既存のパスワードハッシュ処理 ...

    const newUser = {
      id: userId,
      username: username,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    // MongoDB に保存
    await mongoStorage.addUser(newUser);

    logger.info(`ユーザー登録成功: ${username}`);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    logger.error('登録エラー', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'INTERNAL_ERROR'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ... 既存のバリデーション処理 ...

    // MongoDB からユーザーを検索
    const user = await mongoStorage.findUserByUsername(username);
    if (!user) {
      logger.warn(`ログイン失敗: ユーザーなし - ${username}`);
      return res.status(401).json({
        success: false,
        message: '用户名或密码不正确',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // ... 既存のパスワード検証処理 ...

    logger.info(`ログイン成功: ${username}`);

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    logger.error('ログインエラー', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'INTERNAL_ERROR'
    });
  }
});
```

## Step 7: テストを実装

**ファイル**: `test/utils/mongoStorage.test.js`

```javascript
/**
 * MongoDB ストレージユニットテスト
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoStorage = require('../../utils/mongoStorage');
const { connectMongoDB } = require('../../utils/mongoConnection');

describe('mongoStorage', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectMongoDB();
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  test('新規ユーザーを追加できる', async () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      passwordHash: '$2a$10$...',
      createdAt: new Date().toISOString()
    };

    const result = await mongoStorage.addUser(user);
    expect(result.username).toBe('testuser');
  });

  test('ユーザー名で検索できる', async () => {
    const user = await mongoStorage.findUserByUsername('testuser');
    expect(user).not.toBeNull();
    expect(user.username).toBe('testuser');
  });
});
```

## Step 8: サーバーを起動

**ファイル**: `index.js` を更新して MongoDB 接続を初期化

```javascript
const express = require('express');
const { connectMongoDB } = require('./utils/mongoConnection');

const app = express();

// ミドルウェア設定
app.use(express.json());

// ルート設定
app.use('/auth', require('./routes/auth'));

// MongoDB に接続してサーバーを起動
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`サーバーが起動しました: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB 接続に失敗しました:', error);
    process.exit(1);
  }
})();
```

## Step 9: テストを実行

```bash
# テストを実行
npm test

# カバレッジを確認
npm run test:coverage
```

## Step 10: API をテスト

```bash
# 登録テスト
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# ログインテスト
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Troubleshooting

### MongoDB 接続エラー

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**解決法**:
- MongoDB が起動しているか確認: `mongo`
- または、Docker で MongoDB を起動: `docker run -d -p 27017:27017 mongo`
- または、MongoDB Atlas クラウドを使用

### インデックス重複エラー

```
E11000 duplicate key error collection: speckit.users index: username_1
```

**解決法**:
- 既存ユーザー名が重複している場合は、1件削除して再試行
- または、コレクション全削除: `db.users.deleteMany({})`

### テスト失敗

```
ENOTFOUND mongodb
```

**解決法**:
- `mongodb-memory-server` がインストール済みか確認: `npm ls mongodb-memory-server`
- テスト環境で実際の MongoDB が不要（メモリDB で自動実行）

## 次のステップ

1. **詳細なテスト**: `/test` ディレクトリでユニットテストと統合テストを充実させる
2. **API ドキュメント**: `/doc` ディレクトリに API ドキュメントを作成
3. **Constitution チェック**: すべてのコード内コメントが日本語であることを確認
4. **PR レビュー**: 実装完了後、Constitution Check リストで検証

---

**Quick Start Completed**: 2026-01-30  
**Ready for**: Implementation Tasks (`/speckit.tasks` コマンド実行)
