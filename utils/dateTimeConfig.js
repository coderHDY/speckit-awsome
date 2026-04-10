/**
 * /date で返却する主流タイムゾーン定義
 */
const SUPPORTED_TIMEZONES = [
  { timezone: 'UTC', label: '协调世界时' },
  { timezone: 'Asia/Shanghai', label: '中国标准时间' },
  { timezone: 'Asia/Tokyo', label: '日本标准时间' },
  { timezone: 'Europe/London', label: '英国时间' },
  { timezone: 'Europe/Paris', label: '中欧时间' },
  { timezone: 'America/New_York', label: '美国东部时间' },
  { timezone: 'America/Los_Angeles', label: '美国太平洋时间' },
  { timezone: 'Australia/Sydney', label: '澳大利亚东部时间' }
];

module.exports = {
  SUPPORTED_TIMEZONES
};
