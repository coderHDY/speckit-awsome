/**
 * ロギングユーティリティ単体テスト
 */

const logger = require('../../utils/logger');

describe('logger', () => {
  beforeEach(() => {
    // コンソールメソッドをモック
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // モックを復元
    jest.restoreAllMocks();
  });

  test('logger.info() は console.log を呼び出す', () => {
    logger.info('テストメッセージ');
    
    expect(console.log).toHaveBeenCalled();
    const callArg = console.log.mock.calls[0][0];
    expect(callArg).toContain('[INFO]');
    expect(callArg).toContain('テストメッセージ');
  });

  test('logger.warn() は console.warn を呼び出す', () => {
    logger.warn('警告メッセージ');
    
    expect(console.warn).toHaveBeenCalled();
    const callArg = console.warn.mock.calls[0][0];
    expect(callArg).toContain('[WARN]');
    expect(callArg).toContain('警告メッセージ');
  });

  test('logger.error() は console.error を呼び出す', () => {
    const testError = new Error('テストエラー');
    logger.error('エラーメッセージ', testError);
    
    expect(console.error).toHaveBeenCalled();
    const calls = console.error.mock.calls;
    expect(calls[0][0]).toContain('[ERROR]');
    expect(calls[0][0]).toContain('エラーメッセージ');
    expect(calls[1][0]).toContain('Stack:');
  });

  test('logger.debug() は DEBUG 環境変数を尊重する', () => {
    process.env.DEBUG = 'false';
    logger.debug('デバッグメッセージ');
    expect(console.log).not.toHaveBeenCalled();

    jest.clearAllMocks();

    process.env.DEBUG = 'true';
    logger.debug('デバッグメッセージ');
    expect(console.log).toHaveBeenCalled();
  });

  test('ログメッセージは ISO 8601 タイムスタンプを含む', () => {
    logger.info('タイムスタンプテスト');
    
    const callArg = console.log.mock.calls[0][0];
    // ISO 8601 形式のパターン
    const isoPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    expect(callArg).toMatch(isoPattern);
  });
});
