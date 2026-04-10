/**
 * /date ルートの統合テスト
 */
const request = require('supertest');
const { EXPECTED_TIMEZONES } = require('./fixtures/dateResponse.fixture');
const app = require('@/index');

describe('GET /date', () => {
  test('200と成功レスポンスを返す', async () => {
    const response = await request(app)
      .get('/date')
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('当前时间查询成功');
    expect(response.body.data).toHaveProperty('snapshotAt');
    expect(Array.isArray(response.body.data.timezones)).toBe(true);
  });

  test('主流タイムゾーン一覧を含む', async () => {
    const response = await request(app)
      .get('/date')
      .expect(200);

    const zones = response.body.data.timezones.map((item) => item.timezone);
    EXPECTED_TIMEZONES.forEach((zone) => {
      expect(zones).toContain(zone);
    });
  });

  test('繰り返し呼び出しでもレスポンス構造が安定する', async () => {
    const first = await request(app).get('/date').expect(200);
    const second = await request(app).get('/date').expect(200);

    const shapeCheck = (body) => {
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data.snapshotAt');
      expect(new Date(body.data.snapshotAt).toString()).not.toBe('Invalid Date');
      expect(Array.isArray(body.data.timezones)).toBe(true);
      expect(body.data.timezones[0]).toHaveProperty('timezone');
      expect(body.data.timezones[0]).toHaveProperty('label');
      expect(body.data.timezones[0]).toHaveProperty('datetime');
      expect(body.data.timezones[0]).toHaveProperty('offset');
      body.data.timezones.forEach((entry) => {
        expect(typeof entry.timezone).toBe('string');
        expect(typeof entry.label).toBe('string');
        expect(typeof entry.datetime).toBe('string');
        expect(entry.offset).toMatch(/^[+-][0-9]{2}:[0-9]{2}$/);
      });
    };

    shapeCheck(first.body);
    shapeCheck(second.body);
  });

  test('時間生成失敗時に500と安全なエラーを返す', async () => {
    jest.resetModules();
    jest.doMock('@/utils/dateTimeService', () => ({
      buildDateSuccessPayload: jest.fn(() => {
        throw new Error('internal boom');
      }),
      buildDateErrorPayload: jest.fn(() => ({
        success: false,
        message: '时间数据生成失败',
        error: 'TIME_GENERATION_FAILED'
      }))
    }));

    const mockedApp = require('@/index');
    const response = await request(mockedApp)
      .get('/date')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('时间数据生成失败');
    expect(response.body.error).toBe('TIME_GENERATION_FAILED');
    expect(JSON.stringify(response.body)).not.toContain('internal boom');
  });
});
