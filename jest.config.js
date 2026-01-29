module.exports = {
  // テスト環境の設定
  testEnvironment: 'node',
  
  // カバレッジレポートの設定
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'utils/**/*.js',
    'routes/**/*.js',
    '!index.js', // サーバー起動ファイルは除外
    '!**/node_modules/**'
  ],
  
  // カバレッジ閾値（Constitution要求: 80%）
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // テストファイルのパターン
  testMatch: [
    '**/test/**/*.test.js'
  ],
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // タイムアウト設定
  testTimeout: 10000
};
