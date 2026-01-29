const crypto = require('crypto');

/**
 * UUID生成ユーティリティ
 * 第三者ライブラリ（crypto）のラッパー
 */

/**
 * ランダムなUUIDを生成する
 * @returns {string} UUID文字列
 */
function generateUUID() {
  return crypto.randomUUID();
}

module.exports = {
  generateUUID
};
