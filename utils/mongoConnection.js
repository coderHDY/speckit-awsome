/**
 * MongoDB接続管理モジュール
 * シングルトンパターンで接続を管理し、接続プールを再利用
 */

const { MongoClient } = require('mongodb');

let mongoClient;
let mongoDb;

/**
 * MongoDBに接続する
 * @returns {Promise<Object>} MongoDB Database インスタンス
 */
async function connectMongoDB() {
  // 既に接続済みの場合はそれを返す
  if (mongoDb) {
    return mongoDb;
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB || 'speckit';

    // MongoClient を初期化（デフォルト接続プール設定）
    mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000
    });

    // MongoDB に接続
    await mongoClient.connect();
    mongoDb = mongoClient.db(dbName);

    // インデックスを作成
    await ensureIndexes(mongoDb);

    console.log(`[INFO] ${new Date().toISOString()} - MongoDBに接続しました: ${dbName}`);
    return mongoDb;
  } catch (error) {
    console.error(`[ERROR] ${new Date().toISOString()} - MongoDB接続エラー: ${error.message}`);
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
    
    console.log(`[INFO] ${new Date().toISOString()} - インデックスを作成しました`);
  } catch (error) {
    console.error(`[ERROR] ${new Date().toISOString()} - インデックス作成エラー: ${error.message}`);
    // インデックスが既に存在する場合はエラーを無視
    if (!error.message.includes('duplicate key error')) {
      throw error;
    }
  }
}

/**
 * MongoDB接続を閉じる
 */
async function closeMongoDB() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    console.log(`[INFO] ${new Date().toISOString()} - MongoDB接続を閉じました`);
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
