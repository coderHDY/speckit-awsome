/**
 * ロギングユーティリティ
 * 内部的には console を使用
 * 後で Winston や Pino などのロギングライブラリに切り替え可能
 */

/**
 * 一般情報をログ出力
 * @param {string} message ログメッセージ
 */
function info(message) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

/**
 * 警告をログ出力
 * @param {string} message ログメッセージ
 */
function warn(message) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
}

/**
 * エラーをログ出力
 * @param {string} message ログメッセージ
 * @param {Error} error エラーオブジェクト（オプション）
 */
function error(message, error) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (error && error.stack) {
    console.error(`Stack: ${error.stack}`);
  }
}

/**
 * デバッグ情報をログ出力
 * @param {string} message ログメッセージ
 */
function debug(message) {
  if (process.env.DEBUG === 'true') {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
  }
}

module.exports = {
  info,
  warn,
  error,
  debug
};
