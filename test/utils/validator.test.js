const { validateUsername, validatePassword, validateRequiredFields } = require('../../utils/validator');

/**
 * validatorユーティリティのテスト
 */
describe('validator ユーティリティ', () => {
  describe('validateUsername', () => {
    test('有効なユーザー名を受け入れる', () => {
      expect(validateUsername('validUser123')).toBe(true);
      expect(validateUsername('user_name')).toBe(true);
      expect(validateUsername('abc')).toBe(true); // 最小3文字
      expect(validateUsername('a'.repeat(20))).toBe(true); // 最大20文字
    });

    test('短すぎるユーザー名を拒否する', () => {
      expect(validateUsername('ab')).toBe(false); // 2文字
      expect(validateUsername('a')).toBe(false);  // 1文字
      expect(validateUsername('')).toBe(false);   // 空文字列
    });

    test('長すぎるユーザー名を拒否する', () => {
      expect(validateUsername('a'.repeat(21))).toBe(false); // 21文字
      expect(validateUsername('a'.repeat(50))).toBe(false); // 50文字
    });

    test('無効な文字を含むユーザー名を拒否する', () => {
      expect(validateUsername('user-name')).toBe(false);  // ハイフン
      expect(validateUsername('user name')).toBe(false);  // スペース
      expect(validateUsername('user@name')).toBe(false);  // @記号
      expect(validateUsername('ユーザー')).toBe(false);   // 日本語
    });

    test('nullまたはundefinedを拒否する', () => {
      expect(validateUsername(null)).toBe(false);
      expect(validateUsername(undefined)).toBe(false);
    });

    test('文字列以外を拒否する', () => {
      expect(validateUsername(123)).toBe(false);
      expect(validateUsername({})).toBe(false);
      expect(validateUsername([])).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('有効なパスワードを受け入れる', () => {
      expect(validatePassword('123456')).toBe(true);     // 最小6文字
      expect(validatePassword('a'.repeat(50))).toBe(true); // 最大50文字
      expect(validatePassword('Pass@123!#')).toBe(true); // 特殊文字を含む
    });

    test('短すぎるパスワードを拒否する', () => {
      expect(validatePassword('12345')).toBe(false);  // 5文字
      expect(validatePassword('abc')).toBe(false);    // 3文字
      expect(validatePassword('')).toBe(false);       // 空文字列
    });

    test('長すぎるパスワードを拒否する', () => {
      expect(validatePassword('a'.repeat(51))).toBe(false); // 51文字
      expect(validatePassword('a'.repeat(100))).toBe(false); // 100文字
    });

    test('nullまたはundefinedを拒否する', () => {
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });

    test('文字列以外を拒否する', () => {
      expect(validatePassword(123456)).toBe(false);
      expect(validatePassword({})).toBe(false);
      expect(validatePassword([])).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    test('すべての必須フィールドが存在する場合にtrueを返す', () => {
      const fields = { username: 'user', password: 'pass', email: 'test@example.com' };
      const required = ['username', 'password'];
      
      expect(validateRequiredFields(fields, required)).toBe(true);
    });

    test('必須フィールドが欠けている場合にfalseを返す', () => {
      const fields = { username: 'user' };
      const required = ['username', 'password'];
      
      expect(validateRequiredFields(fields, required)).toBe(false);
    });

    test('フィールド値がnullの場合にfalseを返す', () => {
      const fields = { username: 'user', password: null };
      const required = ['username', 'password'];
      
      expect(validateRequiredFields(fields, required)).toBe(false);
    });

    test('フィールド値が空文字列の場合にfalseを返す', () => {
      const fields = { username: 'user', password: '' };
      const required = ['username', 'password'];
      
      expect(validateRequiredFields(fields, required)).toBe(false);
    });

    test('必須フィールドが空配列の場合にtrueを返す', () => {
      const fields = { username: 'user' };
      const required = [];
      
      expect(validateRequiredFields(fields, required)).toBe(true);
    });

    test('フィールド値が0の場合でもtrueを返す（0は有効な値）', () => {
      const fields = { username: 'user', age: 0 };
      const required = ['username', 'age'];
      
      expect(validateRequiredFields(fields, required)).toBe(true);
    });

    test('フィールド値がfalseの場合でもtrueを返す（booleanは有効）', () => {
      const fields = { username: 'user', active: false };
      const required = ['username', 'active'];
      
      expect(validateRequiredFields(fields, required)).toBe(true);
    });
  });
});
