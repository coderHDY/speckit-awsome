/**
 * 日時サービスの単体テスト
 */
const dateTimeService = require('@/utils/dateTimeService');

describe('dateTimeService', () => {
  test('同一スナップショットで全タイムゾーンを生成する', () => {
    const fixedDate = new Date('2026-04-10T08:30:00.000Z');
    const payload = dateTimeService.buildDateSuccessPayload(fixedDate);

    expect(payload).toHaveProperty('snapshotAt', fixedDate.toISOString());
    expect(Array.isArray(payload.timezones)).toBe(true);
    expect(payload.timezones.length).toBeGreaterThan(0);
  });

  test('整形済みエラー情報を返却する', () => {
    const err = new Error('internal stack trace should not leak');
    const safe = dateTimeService.buildDateErrorPayload(err);

    expect(safe.success).toBe(false);
    expect(safe.message).toBe('时间数据生成失败');
    expect(safe.error).toBe('TIME_GENERATION_FAILED');
    expect(JSON.stringify(safe)).not.toContain('internal stack trace should not leak');
  });
});
