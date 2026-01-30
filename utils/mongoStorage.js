/**
 * MongoDB ユーザー储存ユーティリティ
 * MongoDB users コレクションとのやり取りを行う
 */

const { getDb } = require('./mongoConnection');
const logger = require('./logger');

/**
 * すべてのユーザーを取得する
 * @returns {Promise<Array>} ユーザーの配列
 */
async function readUsers() {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    return users;
  } catch (error) {
    logger.error('ユーザー読み取りエラー', error);
    throw error;
  }
}

/**
 * ユーザー名でユーザーを検索する
 * @param {string} username - ユーザー名
 * @returns {Promise<Object|null>} ユーザーオブジェクトまたはnull
 */
async function findUserByUsername(username) {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username });
    return user;
  } catch (error) {
    logger.error('ユーザー検索エラー', error);
    throw error;
  }
}

/**
 * 新しいユーザーを追加する
 * @param {Object} userData - ユーザーデータ {id, username, passwordHash, createdAt}
 * @returns {Promise<Object>} 作成されたユーザー
 * @throws {Error} E11000エラー（ユーザー名の重複）を含む
 */
async function addUser(userData) {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');

    const newUser = {
      id: userData.id,
      username: userData.username,
      passwordHash: userData.passwordHash,
      createdAt: userData.createdAt || new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    
    logger.info(`ユーザーを追加しました: ${userData.username}`);
    
    return {
      _id: result.insertedId,
      ...newUser,
    };
  } catch (error) {
    // E11000エラー（ユーザー名重複）をハンドル
    if (error.code === 11000) {
      const duplicateError = new Error(`ユーザー名 '${userData.username}' は既に使用されています`);
      duplicateError.code = 'DUPLICATE_USERNAME';
      throw duplicateError;
    }
    logger.error('ユーザー追加エラー', error);
    throw error;
  }
}

/**
 * ユーザーIDでユーザーを検索する
 * @param {string} id - ユーザーID
 * @returns {Promise<Object|null>} ユーザーオブジェクトまたはnull
 */
async function findUserById(id) {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ id });
    return user;
  } catch (error) {
    logger.error('ユーザーID検索エラー', error);
    throw error;
  }
}

/**
 * ユーザーコレクションをクリア（テスト用）
 * @returns {Promise<number>} 削除されたドキュメント数
 */
async function clearUsers() {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');
    const result = await usersCollection.deleteMany({});
    logger.info(`${result.deletedCount}個のユーザーを削除しました`);
    return result.deletedCount;
  } catch (error) {
    logger.error('ユーザークリアエラー', error);
    throw error;
  }
}

module.exports = {
  readUsers,
  findUserByUsername,
  findUserById,
  addUser,
  clearUsers,
};
