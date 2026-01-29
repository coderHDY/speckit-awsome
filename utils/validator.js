/**
 * バリデーションユーティリティ
 * 入力値の検証ロジックを提供
 */

/**
 * ユーザー名の形式を検証する
 * ルール: 3-20文字、英数字とアンダースコアのみ
 * @param {string} username - ユーザー名
 * @returns {boolean} 検証結果
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * パスワードの長さを検証する
 * ルール: 6-50文字
 * @param {string} password - パスワード
 * @returns {boolean} 検証結果
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= 6 && password.length <= 50;
}

/**
 * 必須フィールドの存在を検証する
 * @param {Object} fields - フィールドオブジェクト
 * @param {Array<string>} requiredFields - 必須フィールド名の配列
 * @returns {boolean} 検証結果
 */
function validateRequiredFields(fields, requiredFields) {
  return requiredFields.every(field => fields[field] != null && fields[field] !== '');
}

module.exports = {
  validateUsername,
  validatePassword,
  validateRequiredFields
};
