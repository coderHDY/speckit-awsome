const { generateUUID } = require('@/utils/cryptoHelper');

/**
 * cryptoHelperユーティリティのテスト
 */
describe('cryptoHelper ユーティリティ', () => {
  describe('generateUUID', () => {
    test('UUID文字列を生成する', () => {
      const uuid = generateUUID();
      
      // UUIDが文字列であることを確認
      expect(typeof uuid).toBe('string');
      
      // UUID形式（xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）を確認
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    test('毎回異なるUUIDを生成する', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      
      // 2つのUUIDが異なることを確認
      expect(uuid1).not.toBe(uuid2);
    });

    test('複数回呼び出しても常に有効なUUIDを返す', () => {
      const uuids = [];
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        uuids.push(generateUUID());
      }
      
      // すべてのUUIDが一意であることを確認
      const uniqueUUIDs = new Set(uuids);
      expect(uniqueUUIDs.size).toBe(count);
    });
  });
});
