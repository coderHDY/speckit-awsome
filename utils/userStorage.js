const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * ユーザーデータファイルを初期化する（存在しない場合）
 */
function initUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const initialData = { users: [] };
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

/**
 * すべてのユーザーデータを読み取る
 * @returns {Array} ユーザー配列
 */
function readUsers() {
  initUsersFile();
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  const parsed = JSON.parse(data);
  return parsed.users || [];
}

/**
 * ユーザーデータを保存する
 * @param {Array} users - ユーザー配列
 */
function saveUsers(users) {
  const data = { users };
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * ユーザー名でユーザーを検索する
 * @param {string} username - ユーザー名
 * @returns {Object|null} ユーザーオブジェクトまたはnull
 */
function findUserByUsername(username) {
  const users = readUsers();
  return users.find(user => user.username === username) || null;
}

/**
 * 新しいユーザーを追加する
 * @param {Object} user - ユーザーオブジェクト {id, username, passwordHash, createdAt}
 * @returns {Object} 追加されたユーザー
 */
function addUser(user) {
  const users = readUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

module.exports = {
  readUsers,
  saveUsers,
  findUserByUsername,
  addUser,
  initUsersFile
};
