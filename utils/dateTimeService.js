/**
 * 日時関連ユーティリティ
 */
const { SUPPORTED_TIMEZONES } = require('@/utils/dateTimeConfig');

/**
 * 指定タイムゾーン向けの日時文字列を生成
 * @param {Date} baseDate 基準日時
 * @param {string} timeZone IANAタイムゾーン
 * @returns {string} YYYY-MM-DD HH:mm:ss
 */
function formatDateTime(baseDate, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(baseDate);
  const map = {};
  parts.forEach((part) => {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  });

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

/**
 * タイムゾーンオフセットを +HH:mm 形式で返す
 * @param {Date} baseDate 基準日時
 * @param {string} timeZone IANAタイムゾーン
 * @returns {string} UTCオフセット
 */
function getOffset(baseDate, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const offsetPart = formatter
    .formatToParts(baseDate)
    .find((part) => part.type === 'timeZoneName');

  return normalizeOffset(offsetPart ? offsetPart.value : 'GMT+00:00');
}

/**
 * GMT表現を +HH:mm 形式へ正規化
 * @param {string} rawOffset GMT形式
 * @returns {string} 正規化済みオフセット
 */
function normalizeOffset(rawOffset) {
  const compact = rawOffset.replace('GMT', '');
  if (compact === '' || compact === 'Z') {
    return '+00:00';
  }

  const withSign = /^[+-]/.test(compact) ? compact : `+${compact}`;
  if (withSign.includes(':')) {
    const [signHour, minute] = withSign.split(':');
    const sign = signHour[0];
    const hour = signHour.slice(1).padStart(2, '0');
    return `${sign}${hour}:${minute.padStart(2, '0')}`;
  }

  const sign = withSign[0];
  const hour = withSign.slice(1).padStart(2, '0');
  return `${sign}${hour}:00`;
}

/**
 * /date 成功レスポンスの data 部分を構築
 * @param {Date} inputDate 基準日時（省略時は現在）
 * @returns {{snapshotAt: string, timezones: Array}} 成功データ
 */
function buildDateSuccessPayload(inputDate = new Date()) {
  if (!(inputDate instanceof Date) || Number.isNaN(inputDate.getTime())) {
    throw new Error('INVALID_DATE_INPUT');
  }

  return {
    snapshotAt: inputDate.toISOString(),
    timezones: SUPPORTED_TIMEZONES.map(({ timezone, label }) => ({
      timezone,
      label,
      datetime: formatDateTime(inputDate, timezone),
      offset: getOffset(inputDate, timezone)
    }))
  };
}

/**
 * /date 失敗レスポンスを構築
 * @returns {{success:boolean,message:string,error:string}} 失敗レスポンス
 */
function buildDateErrorPayload() {
  return {
    success: false,
    message: '时间数据生成失败',
    error: 'TIME_GENERATION_FAILED'
  };
}

module.exports = {
  buildDateSuccessPayload,
  buildDateErrorPayload,
  formatDateTime,
  getOffset,
  normalizeOffset
};
