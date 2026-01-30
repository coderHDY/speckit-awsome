/**
 * Jest グローバルティアダウン
 * mongodb-memory-server インスタンスを停止
 */

module.exports = async function globalTeardown() {
  const mongoServer = global.__MONGO_SERVER__;
  
  if (mongoServer) {
    await mongoServer.stop();
    console.log('✓ MongoMemoryServer を停止しました\n');
  }
};
