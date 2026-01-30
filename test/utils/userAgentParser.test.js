const { getBrowserInfo, getOSInfo } = require('@/utils/userAgentParser');

/**
 * userAgentParserユーティリティのテスト
 */
describe('userAgentParser ユーティリティ', () => {
  describe('getBrowserInfo', () => {
    test('Chrome User-Agentを正しく識別する', () => {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(getBrowserInfo(chromeUA)).toBe('Chrome');
    });

    test('Safari User-Agentを正しく識別する', () => {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      expect(getBrowserInfo(safariUA)).toBe('Safari');
    });

    test('Firefox User-Agentを正しく識別する', () => {
      const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
      expect(getBrowserInfo(firefoxUA)).toBe('Firefox');
    });

    test('Edge User-Agentを正しく識別する', () => {
      const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      expect(getBrowserInfo(edgeUA)).toBe('Edge');
    });

    test('空のUser-Agentは「未知」を返す', () => {
      expect(getBrowserInfo('')).toBe('未知');
      expect(getBrowserInfo(null)).toBe('未知');
      expect(getBrowserInfo(undefined)).toBe('未知');
    });

    test('不明なUser-Agentは「其他」を返す', () => {
      const unknownUA = 'UnknownBrowser/1.0';
      expect(getBrowserInfo(unknownUA)).toBe('其他');
    });
  });

  describe('getOSInfo', () => {
    test('Windows User-Agentを正しく識別する', () => {
      const windowsUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      expect(getOSInfo(windowsUA)).toBe('Windows');
    });

    test('macOS User-Agentを正しく識別する', () => {
      const macUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
      expect(getOSInfo(macUA)).toBe('macOS');
    });

    test('Linux User-Agentを正しく識別する', () => {
      const linuxUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36';
      expect(getOSInfo(linuxUA)).toBe('Linux');
    });

    test('Android User-Agentを正しく識別する', () => {
      const androidUA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      expect(getOSInfo(androidUA)).toBe('Android');
    });

    test('iOS User-Agentを正しく識別する', () => {
      const iosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
      expect(getOSInfo(iosUA)).toBe('iOS');
      
      const ipadUA = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
      expect(getOSInfo(ipadUA)).toBe('iOS');
    });

    test('空のUser-Agentは「未知」を返す', () => {
      expect(getOSInfo('')).toBe('未知');
      expect(getOSInfo(null)).toBe('未知');
      expect(getOSInfo(undefined)).toBe('未知');
    });

    test('不明なOSは「其他」を返す', () => {
      const unknownUA = 'UnknownOS/1.0';
      expect(getOSInfo(unknownUA)).toBe('其他');
    });
  });
});
