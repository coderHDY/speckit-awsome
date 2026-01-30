# Data Model: MongoDB Authentication System

**Feature**: `001-mongodb-auth`  
**Date**: 2026-01-30  
**Database**: MongoDB  
**Database Name**: `speckit`

---

## Entity Definitions

### 1. User エンティティ

**MongoDB Collection**: `users`  
**Description**: ユーザーアカウント情報を保存するエンティティ

#### フィールド定義

| フィールド | 型 | 必須 | 制約 | 説明 |
|-----------|-----|-----|------|------|
| `_id` | ObjectId | Yes | Unique, Auto-generated | MongoDB プライマリキー |
| `id` | String | Yes | Unique | アプリケーションレベルのユーザーID (UUID) |
| `username` | String | Yes | Unique, 3-20文字, [a-zA-Z0-9_] のみ | ユーザー名 |
| `passwordHash` | String | Yes | | bcryptjs でハッシュ化されたパスワード |
| `createdAt` | ISODate | Yes | | ユーザー作成日時（ISO 8601 形式） |

#### スキーマ例（JSON形式）

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "passwordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DvhKm8",
  "createdAt": ISODate("2026-01-30T10:30:00.000Z")
}
```

#### バリデーション規則

**Username バリデーション**:
- 長さ: 3文字以上、20文字以下
- 文字種: 英字（a-z, A-Z）、数字（0-9）、アンダースコア（_）のみ
- 一意性: コレクション内で重複しない（ユニークインデックスで保証）
- 正規表現: `^[a-zA-Z0-9_]{3,20}$`

**Password バリデーション**:
- 長さ: 6文字以上、50文字以下
- 形式: 制限なし（任意の文字）
- 保存: bcryptjs でハッシュ化して保存（最小10ラウンド）
- 平文は保存しない

**ID バリデーション**:
- 形式: UUID v4（`cryptoHelper.generateUUID()` で生成）
- 一意性: 必須
- 例: `550e8400-e29b-41d4-a716-446655440000`

**CreatedAt バリデーション**:
- 形式: ISO 8601（`new Date().toISOString()`）
- 自動設定: ユーザー登録時に自動生成
- 例: `2026-01-30T10:30:00.000Z`

#### インデックス戦略

**Index 1: Username Unique Index**
```javascript
db.users.createIndex({ username: 1 }, { unique: true })
```
**目的**: ユーザー名の一意性保証、ログイン時の高速検索  
**エラーハンドリング**: E11000 duplicate key error をキャッチして、"用户名已存在" エラーを返す

**Index 2: ID Index（デフォルト）**
```javascript
// _id フィールドは自動的にインデックス化
db.users.createIndex({ _id: 1 })
```
**目的**: プライマリキー検索の最適化

---

## State Transitions

### User Lifecycle

```
[未登録] ──登録API──> [登録中（検証）] ──成功──> [登録済み]
                         │
                         └─失敗──> [登録失敗]
                         
[登録済み] ──ログインAPI──> [認証中] ──成功──> [認証済み]
                         │
                         └─失敗──> [認証失敗]
```

**状態説明**:
1. **未登録**: ユーザーがシステムに登録されていない初期状態
2. **登録中**: POST /register リクエストを受け取り、バリデーションと DB 挿入処理中
3. **登録済み**: MongoDB に正常に保存されたユーザー
4. **登録失敗**: バリデーション失敗または DB エラーで登録できなかった状態
5. **認証中**: POST /login リクエストを受け取り、認証処理中
6. **認証済み**: パスワード検証に成功した状態
7. **認証失敗**: パスワード検証に失敗した状態

---

## Relationships

### ユーザーとセッション（今後の拡張）

現在の実装では、ユーザーとセッション/トークンの関係は実装スコープ外。

将来、JWT トークンやセッション管理が必要な場合：
- `sessions` コレクション（userId, token, expiresAt などを格納）
- User と Sessions の1対多の関係

---

## Access Patterns

### 主要なアクセスパターン

**Pattern 1: ユーザー名による検索（ログイン時）**
```javascript
db.users.findOne({ username: "john_doe" })
```
**使用シーン**: ログイン API で パスワード検証前にユーザーを取得  
**性能**: ユニークインデックスにより O(log n)  
**期待応答**: < 100ms（ローカルネットワーク）

**Pattern 2: 新規ユーザー登録**
```javascript
db.users.insertOne({
  id: uuid,
  username: "jane_doe",
  passwordHash: "$2a$10...",
  createdAt: ISODate(...)
})
```
**使用シーン**: 登録 API でユーザー情報を挿入  
**性能**: インデックス保守コスト約10-20ms  
**期待応答**: < 500ms

**Pattern 3: 全ユーザー読み込み（管理者機能・将来）**
```javascript
db.users.find({})
```
**使用シーン**: 現在は不使用（本spec ではユーザーリスト取得は実装スコープ外）  
**性能**: コレクションサイズが大きい場合は遅い可能性  
**注意**: 本番環境ではページネーション推奨

---

## Persistence Strategy

### データベース選択

**MongoDB 採用理由**:
1. スキーマ柔軟性: ユーザーフィールド追加が容易
2. インデックス管理: ユーザー名の一意性を簡単に保証
3. 接続プール: Node.js との相性が良い
4. スケーラビリティ: 将来の拡張に対応可能

### コレクション作成戦略

**初期化タイミング**: アプリケーション起動時（または初回接続時）

**実装場所**: `utils/mongoConnection.js` の `ensureIndexes()` 関数

```javascript
async function initializeDatabase(db) {
  // users コレクションが存在しない場合は自動作成
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'username', 'passwordHash', 'createdAt'],
        properties: {
          id: { bsonType: 'string' },
          username: { bsonType: 'string' },
          passwordHash: { bsonType: 'string' },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  });
  
  // インデックス作成
  const collection = db.collection('users');
  await collection.createIndex({ username: 1 }, { unique: true });
}
```

### トランザクション

現在の実装では単一コレクションのみなため、トランザクションは不要。

将来、複数コレクション操作が必要な場合（例: ユーザー作成 + 初期プロフィール作成）は、MongoDB トランザクション機能を使用。

---

## Migration Notes

### JSON から MongoDB への移行

**手動データインポート戦略**（自動迁移スクリプトなし）

**手順**:
1. `data/users.json` から既存ユーザーデータを読み込み
2. 各ユーザーの ID, username, passwordHash, createdAt を確認
3. MongoDB の users コレクションに直接挿入

**例**:
```javascript
// 既存のusers.jsonデータ
const existingUsers = [
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "passwordHash": "$2a$10...",
    "createdAt": "2026-01-20T08:00:00.000Z"
  }
];

// MongoDB に挿入
await usersCollection.insertMany(existingUsers);
```

**バックアップ戦略**:
- 移行前に `data/users.json` を `data/users.json.backup` に複製
- MongoDB への移行完了後、JSON ファイルは参照用に保持

---

## Performance Considerations

### インデックス設計の影響

**Insert パフォーマンス**:
- username インデックスにより、insert 時に約10-20ms の追加オーバーヘッド
- ユーザー数が少ない（< 10k）場合、実測値は < 1ms

**Query パフォーマンス**:
- インデックスなし: O(n) スキャン（全ユーザー検索が必要）
- インデックスあり: O(log n) 検索（username で即座に特定）

**最適化推奨事項**:
- 複合インデックス（username + createdAt など）は、将来クエリパターン追加時に検討
- クエリプランの分析: `explain()` で性能確認可能

### メモリ使用量

**ユーザーあたりのサイズ**:
- _id (ObjectId): 12 bytes
- id (UUID String): 36 bytes
- username (max 20 chars): ~20 bytes
- passwordHash (bcrypt): ~60 bytes
- createdAt (Date): 8 bytes
- **合計**: 約140 bytes/ユーザー

**推定メモリ使用量**:
- 1,000 ユーザー: ~140 KB
- 10,000 ユーザー: ~1.4 MB
- 100,000 ユーザー: ~14 MB

本スケールではメモリは制約要因にならない。

---

## Security Considerations

### パスワードハッシュ化

**要件**:
- bcryptjs ライブラリを使用（既存 `utils/passwordHelper.js`）
- ハッシュ化ラウンド: 最小10ラウンド（bcryptjs デフォルト）
- 平文パスワードは保存しない

**実装**:
```javascript
// 登録時
const passwordHash = await hashPassword(password); // utils/passwordHelper.js

// ログイン時
const isValid = await verifyPassword(password, user.passwordHash);
```

### MongoDB セキュリティ

**接続セキュリティ**:
- 接続文字列は環境変数 `MONGODB_URI` で提供
- 認証情報（username/password）を接続文字列に含める
- 本番環境では TLS/SSL 接続推奨

**クエリセキュリティ**:
- MongoDB driver は自動的にパラメータバインディング対応
- NoSQL インジェクション対策: ユーザー入力を直接クエリに含めない
- 例: `db.users.findOne({ username: userInput })` は安全（プロトコルレベルで保護）

---

**Data Model Completed**: 2026-01-30  
**Next Phase**: API Contracts Generation (`contracts/` を生成)
