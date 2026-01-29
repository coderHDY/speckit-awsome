const bcrypt = require('bcryptjs');

/**
 * パスワードハッシュユーティリティ
 * 第三者ライブラリ（bcryptjs）のラッパー
 */

/**
 * パスワードをハッシュ化する
 * @param {string} plainPassword - 平文パスワード
 * @param {number} saltRounds - ソルトラウンド数（デフォルト: 10）
 * @returns {Promise<string>} ハッシュ化されたパスワード
 */
async function hashPassword(plainPassword, saltRounds = 10) {
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * パスワードを検証する
 * @param {string} plainPassword - 平文パスワード
 * @param {string} hashedPassword - ハッシュ化されたパスワード
 * @returns {Promise<boolean>} 検証結果
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  verifyPassword
};
