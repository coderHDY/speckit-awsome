/**
 * MongoDB ユーザー储存ユーティリティ単体テスト
 */

const mongoStorage = require('../../utils/mongoStorage');
const { connectMongoDB, closeMongoDB } = require('../../utils/mongoConnection');

describe('mongoStorage', () => {
  beforeAll(async () => {
    // テスト開始前にMongoDBに接続
    await connectMongoDB();
  });

  afterEach(async () => {
    // 各テスト後にユーザーをクリア
    await mongoStorage.clearUsers();
  });

  afterAll(async () => {
    // すべてのテスト後に接続を閉じる
    await closeMongoDB();
  });

  test('readUsers()は空の配列を返す', async () => {
    const users = await mongoStorage.readUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(0);
  });

  test('addUser()でユーザーを追加できる', async () => {
    const userData = {
      id: 'test-id-1',
      username: 'testuser',
      passwordHash: 'hashed-password',
      createdAt: new Date().toISOString(),
    };

    const result = await mongoStorage.addUser(userData);
    expect(result._id).toBeDefined();
    expect(result.username).toBe('testuser');
    expect(result.id).toBe('test-id-1');
  });

  test('findUserByUsername()でユーザーを検索できる', async () => {
    const userData = {
      id: 'test-id-2',
      username: 'searchuser',
      passwordHash: 'hashed-password',
      createdAt: new Date().toISOString(),
    };

    await mongoStorage.addUser(userData);
    const foundUser = await mongoStorage.findUserByUsername('searchuser');

    expect(foundUser).toBeDefined();
    expect(foundUser.username).toBe('searchuser');
    expect(foundUser.id).toBe('test-id-2');
  });

  test('findUserByUsername()は存在しないユーザーでnullを返す', async () => {
    const foundUser = await mongoStorage.findUserByUsername('nonexistent');
    expect(foundUser).toBeNull();
  });

  test('findUserById()でユーザーをIDで検索できる', async () => {
    const userData = {
      id: 'test-id-3',
      username: 'iduser',
      passwordHash: 'hashed-password',
      createdAt: new Date().toISOString(),
    };

    await mongoStorage.addUser(userData);
    const foundUser = await mongoStorage.findUserById('test-id-3');

    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe('test-id-3');
  });

  test('E11000エラー時にDUPLICATE_USERNAMEエラーをスロー', async () => {
    const userData1 = {
      id: 'test-id-4',
      username: 'duplicate',
      passwordHash: 'hashed-password-1',
      createdAt: new Date().toISOString(),
    };

    const userData2 = {
      id: 'test-id-5',
      username: 'duplicate',
      passwordHash: 'hashed-password-2',
      createdAt: new Date().toISOString(),
    };

    await mongoStorage.addUser(userData1);

    // 重複したユーザー名でエラーが発生することを確認
    try {
      await mongoStorage.addUser(userData2);
      fail('エラーが発生するべき');
    } catch (error) {
      expect(error.code).toBe('DUPLICATE_USERNAME');
    }
  });

  test('clearUsers()ですべてのユーザーを削除できる', async () => {
    const userData1 = {
      id: 'test-id-6',
      username: 'user1',
      passwordHash: 'hash1',
      createdAt: new Date().toISOString(),
    };

    const userData2 = {
      id: 'test-id-7',
      username: 'user2',
      passwordHash: 'hash2',
      createdAt: new Date().toISOString(),
    };

    await mongoStorage.addUser(userData1);
    await mongoStorage.addUser(userData2);

    const deletedCount = await mongoStorage.clearUsers();
    expect(deletedCount).toBe(2);

    const remainingUsers = await mongoStorage.readUsers();
    expect(remainingUsers.length).toBe(0);
  });

  test('複数のユーザーを追加して readUsers() で取得できる', async () => {
    const userData1 = {
      id: 'test-id-8',
      username: 'user1',
      passwordHash: 'hash1',
      createdAt: new Date().toISOString(),
    };

    const userData2 = {
      id: 'test-id-9',
      username: 'user2',
      passwordHash: 'hash2',
      createdAt: new Date().toISOString(),
    };

    await mongoStorage.addUser(userData1);
    await mongoStorage.addUser(userData2);

    const users = await mongoStorage.readUsers();
    expect(users.length).toBe(2);
  });
});
