/**
 * User-Agent解析ユーティリティ
 * ブラウザ情報とOS情報を抽出する
 */

/**
 * User-Agentからブラウザ情報を取得する
 * @param {string} userAgent - User-Agent文字列
 * @returns {string} ブラウザ名
 */
function getBrowserInfo(userAgent) {
  if (!userAgent) return '未知';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  
  return '其他';
}

/**
 * User-AgentからOS情報を取得する
 * @param {string} userAgent - User-Agent文字列
 * @returns {string} OS名
 */
function getOSInfo(userAgent) {
  if (!userAgent) return '未知';
  
  // Androidを先にチェック（LinuxよりAndroidが優先）
  if (userAgent.includes('Android')) return 'Android';
  // iOSを先にチェック（macOSよりiOSが優先）
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  
  if (userAgent.includes('Win')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  
  return '其他';
}

module.exports = {
  getBrowserInfo,
  getOSInfo
};
