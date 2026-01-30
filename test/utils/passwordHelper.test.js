const { hashPassword, verifyPassword } = require('@/utils/passwordHelper');

/**
 * passwordHelperユーティリティのテスト
 */
describe('passwordHelper ユーティリティ', () => {
  describe('hashPassword', () => {
    test('パスワードをハッシュ化する', async () => {
      const plainPassword = 'testPassword123';
      const hash = await hashPassword(plainPassword);
      
      // ハッシュが文字列であることを確認
      expect(typeof hash).toBe('string');
      
      // ハッシュが平文と異なることを確認
      expect(hash).not.toBe(plainPassword);
      
      // bcryptハッシュの形式を確認（$2b$で始まる）
      expect(hash).toMatch(/^\$2b\$/);
    });

    test('同じパスワードでも異なるハッシュを生成する（ソルトが異なる）', async () => {
      const plainPassword = 'samePassword';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      // 2つのハッシュが異なることを確認
      expect(hash1).not.toBe(hash2);
    });

    test('カスタムソルトラウンドを使用できる', async () => {
      const plainPassword = 'password';
      const hash = await hashPassword(plainPassword, 12);
      
      // ソルトラウンド12のハッシュ形式を確認
      expect(hash).toMatch(/^\$2b\$12\$/);
    });
  });

  describe('verifyPassword', () => {
    test('正しいパスワードの検証に成功する', async () => {
      const plainPassword = 'correctPassword';
      const hash = await hashPassword(plainPassword);
      
      const isValid = await verifyPassword(plainPassword, hash);
      expect(isValid).toBe(true);
    });

    test('誤ったパスワードの検証に失敗する', async () => {
      const plainPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(plainPassword);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    test('空のパスワードで検証に失敗する', async () => {
      const plainPassword = 'password';
      const hash = await hashPassword(plainPassword);
      
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    test('検証時にハッシュが変更されない', async () => {
      const plainPassword = 'password';
      const originalHash = await hashPassword(plainPassword);
      const hashCopy = originalHash;
      
      await verifyPassword(plainPassword, originalHash);
      
      // ハッシュが変更されていないことを確認
      expect(originalHash).toBe(hashCopy);
    });
  });
});
