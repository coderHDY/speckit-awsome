# Research Findings: MongoDB Authentication Migration

**Feature**: `001-mongodb-auth`  
**Date**: 2026-01-30  
**Status**: Research Phase Completed  
**Researcher**: GitHub Copilot

## Overview

本研究文档は、MongoDB認証システムの実装に向けた5つの主要課題の調査結果をまとめています。各課題について、ベストプラクティス、設計パターン、実装ガイドラインを提供します。

---

## 1. MongoDB Node.js Driver ベストプラクティス

### 調査結果

#### 接続管理

**推奨される接続方式**:
```javascript
// シングルトン接続パターン（推奨）
// mongoConnection.js でラップして提供
// 複数の接続を避け、接続プール経由で再利用
```

**重要なポイント**:
- MongoDB driver v5.0+ は自動接続プールを提供（デフォルト: max 100 接続）
- `MongoClient` のシングルトン化により、アプリケーション全体で接続を共有
- 接続のクローズは、サーバー終了時または緊急時のみ

#### エラーハンドリング

**接続エラー分類**:
1. **接続失敗** (ENOTFOUND, ECONNREFUSED): 直ちに失敗を返す。再試行なし（spec にて定義済み）
2. **タイムアウト** (serverSelectionTimeoutMS): デフォルト30秒。ユーザーフレンドリーエラーを返す
3. **認証エラー** (unauthorized): 接続設定エラーを検出し、ログに記録

**実装ガイドライン**:
- `MongoServerError`, `MongoNetworkError` をキャッチして区別処理
- 接続エラーは logger.error() で記録（中国語メッセージはユーザー向け）
- タイムアウトは logger.warn() で記録

#### デフォルト接続プール設定

**採用設定**:
- `maxPoolSize`: 100（デフォルト）
- `minPoolSize`: 0（デフォルト）
- `maxIdleTimeMS`: 60000（デフォルト）
- `serverSelectionTimeoutMS`: 30000（デフォルト）

**理由**: 小規模なNode.jsアプリケーションではデフォルト設定で十分。インデックスとクエリ最適化の方がパフォーマンス向上に効果的。

---

## 2. ユーザーストレージ抽象化パターン

### 設計パターン

**戦略**: 既存の `userStorage.js` インターフェースを保持しながら、内部実装を切り替え可能な設計。

#### 現在のインターフェース（userStorage.js）

```javascript
{
  readUsers()        // 全ユーザーを読み込み
  saveUsers(users)   // 全ユーザーを保存
  findUserByUsername(username)  // ユーザー名で検索
  addUser(user)      // 新規ユーザー追加
  initUsersFile()    // 初期化
}
```

#### 推奨される実装構造

**Step 1: mongoStorage.js 実装**
- 同じメソッドシグネチャで MongoDB 版を実装
- 内部的には MongoDB コレクション操作を使用
- userStorage.js と互換性を保つ

**Step 2: 段階的な切り替え**
```javascript
// routes/auth.js では、以下のいずれかを参照
const storage = process.env.USE_MONGODB === 'true' 
  ? mongoStorage 
  : userStorage;
```

**Step 3: テスト互換性**
- 既存の auth.test.js を MongoDB モード対応に更新
- mockStorage 利用時は両方をテストできるように

#### インターフェース互換性

```javascript
// MongoDB 版 mongoStorage.js
module.exports = {
  async readUsers() { /* MongoDB .find() */ },
  async saveUsers(users) { /* MongoDB .insertMany() */ },
  async findUserByUsername(username) { /* MongoDB .findOne() */ },
  async addUser(user) { /* MongoDB .insertOne() */ },
  async initUsersFile() { /* インデックス作成 */ }
};
```

**注意**: 非同期処理（async/await）に統一が必要。既存コードは同期的だが、MongoDB は非同期。routes/auth.js で async 関数内で await を使う。

---

## 3. Node.js ロギングベストプラクティス

### ロギング Wrapper 設計

#### 推奨される実装（utils/logger.js）

```javascript
/**
 * ロギングユーティリティ
 * 内部的には console を使用し、後でlogger libraryに切り替え可能
 * 全ての場所で console の直接使用を避ける
 */

module.exports = {
  info(message) {
    // 一般情報: 登録成功など
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  
  warn(message) {
    // 警告: 接続タイムアウト、不正なクエリなど
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  
  error(message, error) {
    // エラー: 接続失敗、DB エラーなど
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(`Stack: ${error.stack}`);
    }
  },
  
  debug(message) {
    // デバッグ情報（本番環境では非表示可能）
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};
```

#### テスト可能性

```javascript
// test/utils/logger.test.js
// console をモックして、logger メソッド呼び出しを検証
const logger = require('../../utils/logger');
jest.spyOn(console, 'log');
logger.info('test');
expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
```

#### 後続の Logger ライブラリ移行

将来的に Winston, Pino などのロギングライブラリに移行する際は、logger.js のみを修正すればよい。アプリケーション全体のコードは変更不要。

---

## 4. MongoDB インデックス戦略

### インデックス設計

#### ユーザーコレクション（users）

**Index 1: Username Unique Index（必須）**
```javascript
db.users.createIndex({ username: 1 }, { unique: true })
```
**目的**: username の一意性を保証し、重複登録を防止  
**パフォーマンス**: ログイン時の username 検索を高速化  
**エラーハンドリング**: 重複時は MongoError (E11000 duplicate key error) をキャッチ

**Index 2: ID Index（デフォルト）**
```javascript
// _id フィールドにはデフォルトで unique インデックスが存在
```
**目的**: プライマリキーとしての ID 検索を高速化  
**パフォーマンス**: 内部的に最適化される

#### インデックス作成スクリプト

**ファイル**: `utils/mongoConnection.js` 内、初期化関数で実施

```javascript
async function ensureIndexes(db) {
  // ユーザーコレクション作成とインデックス設定
  const collection = db.collection('users');
  await collection.createIndex({ username: 1 }, { unique: true });
}
```

**実行タイミング**: アプリケーション起動時（または初回接続時）

#### パフォーマンス考慮事項

- インデックスは挿入/更新性能をわずかに低下させるが、検索性能を大幅に向上させる
- ユーザー数が少ない（<10k）場合、パフォーマンス影響は無視できる
- 複合インデックスは当面不要（createdAt による日時検索は実装スコープ外）

---

## 5. テスト環境の MongoDB 設定

### テスト戦略

#### オプション 1: メモリ内 MongoDB（推奨）

**ツール**: `mongodb-memory-server`

**利点**:
- インストールと設定が簡単
- テスト実行が高速
- CI/CD 環境で追加インフラが不要

**セットアップ**:
```javascript
// test/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  await mongoServer.stop();
});
```

#### オプション 2: テストコンテナ（Docker）

**ツール**: Docker Compose + testcontainers-node

**利点**:
- 実際の MongoDB で動作確認
- 本番環境に近い条件でテスト

**欠点**:
- Docker のインストールが必要
- テスト実行時間が長い

#### 推奨される実装

**小規模プロジェクト向け**: mongodb-memory-server を採用  
理由: セットアップが簡単で、CI/CD パイプライン統合も容易

**パッケージ追加**:
```bash
npm install --save-dev mongodb-memory-server
```

#### テスト構造

```
test/
├── setup.js                      # 全テストの前後処理（MongoDB 初期化）
├── utils/
│   ├── mongoConnection.test.js   # 接続テスト
│   ├── mongoStorage.test.js      # CRUD テスト
│   └── logger.test.js            # ログテスト
├── routes/
│   └── auth.test.js              # E2E テスト（登録、ログイン）
└── fixtures/                     # テストデータ
    └── user-samples.js           # テストユーザーサンプル
```

#### カバレッジ目標

- **Statements**: 80% 以上
- **Branches**: 80% 以上
- **Functions**: 80% 以上
- **Lines**: 80% 以上

---

## 6. まとめと実装推奨事項

### 採用する技術スタック

| 層 | 技術 | バージョン |
|----|------|-----------|
| Driver | mongodb | ^5.0.0 |
| Logging | console wrapper | custom |
| Test | Jest | 29.7.0 |
| Test DB | mongodb-memory-server | latest |
| Promise | async/await | ES2017+ |

### 実装優先順序

1. **utils/mongoConnection.js** - MongoDB シングルトン接続
2. **utils/mongoStorage.js** - CRUD ラッパー
3. **utils/logger.js** - ロギング抽象化
4. **テスト** - mongoConnection.test.js, mongoStorage.test.js, logger.test.js
5. **routes/auth.js** - MongoDB バージョンに更新
6. **API ドキュメント** - doc/ 更新
7. **統合テスト** - 既存テストを MongoDB モード対応に

### 実装開始時の確認事項

- [ ] MongoDB Node.js driver v5.0+ インストール
- [ ] mongodb-memory-server を devDependencies に追加
- [ ] 既存 userStorage.js のテストケースを確認
- [ ] 既存 routes/auth.js の非同期処理をチェック
- [ ] Constitution コメント言語ガイドラインを確認

---

**Research Completed**: 2026-01-30  
**Next Phase**: Phase 1 - Data Model Design (`data-model.md` を生成)
