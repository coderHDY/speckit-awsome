/**
 * MongoDB接続モジュール単体テスト
 */

const { connectMongoDB, getDb, closeMongoDB } = require('@/utils/mongoConnection');

describe('mongoConnection', () => {
  afterEach(async () => {
    // テスト後に接続を閉じる
    await closeMongoDB();
  });

  test('MongoDBに接続できる', async () => {
    const db = await connectMongoDB();
    expect(db).toBeDefined();
    // DBインスタンスがcollectionメソッドを持つことを確認
    expect(typeof db.collection).toBe('function');
  });

  test('getDb()は同じインスタンスを返す（シングルトン）', async () => {
    const db1 = await connectMongoDB();
    const db2 = await getDb();
    expect(db1).toBe(db2);
  });

  test('インデックスが作成される', async () => {
    const db = await connectMongoDB();
    const usersCollection = db.collection('users');
    
    // インデックス情報を取得
    const indexes = await usersCollection.listIndexes().toArray();
    
    // username インデックスが存在することを確認
    const usernameIndex = indexes.find(idx => idx.key.username === 1);
    expect(usernameIndex).toBeDefined();
    expect(usernameIndex.unique).toBe(true);
  });

  test('接続を閉じられる', async () => {
    await connectMongoDB();
    await closeMongoDB();
    
    // 接続を閉じた後も、新しく接続可能
    const db = await connectMongoDB();
    expect(db).toBeDefined();
  });

  test('接続失敗時はエラーをスロー', async () => {
    // 無効な接続文字列で接続を試みる
    process.env.MONGODB_URI = 'mongodb://invalid-host:27017';
    
    await expect(connectMongoDB()).rejects.toThrow();
  });
});
