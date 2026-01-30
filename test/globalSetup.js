/**
 * Jest グローバルセットアップ
 * mongodb-memory-server インスタンスを起動
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  // MongoMemoryServer インスタンスを作成
  const mongoServer = await MongoMemoryServer.create();
  
  // 接続URI を環境変数に設定
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB = 'test-speckit';
  
  // グローバル変数に保存（teardown で使用）
  global.__MONGO_URI__ = mongoServer.getUri();
  global.__MONGO_DB_NAME__ = 'test-speckit';
  global.__MONGO_SERVER__ = mongoServer;
  
  console.log('\n✓ MongoMemoryServer が起動しました');
};
