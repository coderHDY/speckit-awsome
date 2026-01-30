# Implementation Plan: MongoDB Authentication Migration

**Branch**: `001-mongodb-auth` | **Date**: 2026-01-30 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-mongodb-auth/spec.md`

## Summary

現在、JSONファイルベースのユーザーストレージシステムをMongoDBに移行します。既存の認証API（/register, /login）の機能性は変わりませんが、データ永続化層がMongoDBに置き換わります。ユーザー登録とログインの2つのP1ストーリーを中心に、高性能で堅牢な実装を目指します。

## Technical Context

**Language/Version**: Node.js 14+ (already in package.json)  
**Primary Dependencies**: Express 4.18.2, MongoDB driver (mongodb ^5.0.0), bcryptjs 3.0.3  
**Storage**: MongoDB database `speckit`, collection `users`  
**Testing**: Jest 29.7.0, Supertest 6.3.4  
**Target Platform**: Linux server (Express.js backend)  
**Project Type**: Single project - existing Express server  
**Performance Goals**: <2s registration, <1s login, 99.9% uptime  
**Constraints**: No retry logic on MongoDB connection failure, fail fast design  
**Scale/Scope**: Small project, currently test data only, manual data import strategy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **日本語コメント**: すべてのコードコメントが日本語で記述されているか？ → 実装時に検証します。テンプレートにコメント生成時のチェックリストを追加します
- [x] **第三者ライブラリ抽象化**: すべての外部ライブラリが `@/utils` でラップされているか？ → MongoDB driver、bcrypt、console.log（logging wrapper）はすべて utils でラップされます
- [x] **テスト駆動開発**: すべての実装に対応する `/test` ディレクトリのテストコードが存在するか？（カバレッジ 80% 以上）→ 各機能に対してテストを先に書きます
- [x] **API ドキュメント**: 新規 API エンドポイントに対応する `/doc` ドキュメントが存在するか？ → /register と /login のドキュメントを `/doc` 配下に作成します
- [x] **アーカイブドキュメント**: `.md` ファイルが日本語で記述されているか？ → このplan.mdと関連ドキュメントはすべて日本語で記述
- [x] **コミュニケーション言語**: ユーザー向けメッセージ・コミットメッセージが中国語で記述されているか？ → API レスポンスメッセージは中国語、コミットメッセージは中国語で記述

### Constitution Compliance Details

1. **日本語コメント**: MongoDB connection module、userStorage wrapper、logging utility のコード内コメントはすべて日本語で記述予定
2. **第三者ライブラリ抽象化**:
   - MongoDB driver → `utils/mongoConnection.js`
   - bcryptjs → 既存の `utils/passwordHelper.js`（既に実装）
   - Console logging → 新規 `utils/logger.js` wrapper
3. **テスト駆動開発**: 
   - `test/utils/mongoConnection.test.js`（接続テスト）
   - `test/routes/auth.test.js`（既存テストを MongoDB 対応版に更新）
   - `test/utils/logger.test.js`（ログ wrapper テスト）
4. **API ドキュメント**: 
   - `doc/register.md`（既存、MongoDB 対応に更新）
   - `doc/login.md`（既存、MongoDB 対応に更新）
5. **アーカイブドキュメント**: plan.md, data-model.md, quickstart.md はすべて日本語で作成
6. **コミュニケーション言語**:
   - API レスポンス: "注册成功", "登录失败" など中国語
   - コミットメッセージ: "feat: MongoDB认证集成完成" など中国語

## Project Structure

### Documentation (this feature)

```text
specs/001-mongodb-auth/
├── spec.md              # Feature specification (completed with clarifications)
├── plan.md              # This file
├── research.md          # Phase 0: Research findings (to be created)
├── data-model.md        # Phase 1: Data model and entities (to be created)
├── quickstart.md        # Phase 1: Implementation quickstart guide (to be created)
├── contracts/           # Phase 1: API contracts (to be created)
│   ├── register.json    # Registration endpoint contract
│   └── login.json       # Login endpoint contract
└── checklists/          # Validation checklists
    └── requirements.md  # Specification validation
```

### Source Code (repository root)

```text
utils/
├── mongoConnection.js   # MongoDB接続管理（新規）
├── mongoStorage.js      # ユーザーストレージのMongoDB実装（新規）
├── logger.js            # ログユーティリティ wrapper（新規）
├── passwordHelper.js    # 既存（変更なし）
├── cryptoHelper.js      # 既存（変更なし）
├── validator.js         # 既存（変更なし）
└── userStorage.js       # 既存 JSONファイル実装（段階的に非推奨化）

routes/
├── auth.js              # 既存（MongoDB backend に更新）
└── index.js             # 既存（変更なし）

test/
├── utils/
│   ├── mongoConnection.test.js    # MongoDB接続テスト（新規）
│   ├── mongoStorage.test.js        # ユーザーストレージテスト（新規）
│   ├── logger.test.js              # ロギングテスト（新規）
│   └── passwordHelper.test.js       # 既存（変更なし）
├── routes/
│   └── auth.test.js                # 更新（MongoDB対応）
└── setup.js                        # 既存（必要に応じて更新）

doc/
├── register.md         # 更新: MongoDB対応の登録エンドポイント説明
└── login.md            # 更新: MongoDB対応のログインエンドポイント説明

data/
├── users.json          # 既存（後続段階で非推奨化予定）
└── .gitkeep            # MongoDB移行後の参考用バックアップ領域
```

**Structure Decision**: 既存の Express サーバーの単一プロジェクト構造を維持しながら、MongoDB関連の新しいユーティリティモジュールを`utils/`配下に追加します。テストも同じ構造を反映して`test/utils/`に配置し、カバレッジ80%以上を達成します。

## Research Tasks (Phase 0)

以下の項目は実装前に確認が必要です：

### 1. MongoDB Node.js Driver ベストプラクティス
- **タスク**: MongoDB driver の接続管理、エラーハンドリング、デフォルト接続プール設定の確認
- **目的**: スケーラブルで堅牢な接続実装を設計する
- **出力**: mongoConnection.js の実装ガイドライン

### 2. ユーザーストレージ抽象化パターン
- **タスク**: 既存の userStorage.js から MongoDB 実装への円滑な移行パターン
- **目的**: 既存テストとAPI互換性を保ちながら実装を切り替える
- **出力**: mongoStorage.js のインターフェース設計

### 3. Node.js ロギングベストプラクティス
- **タスク**: console ベースのロギング wrapper の設計（後の logger ライブラリへの移行を想定）
- **目的**: テスト可能でモック化可能なログ関数を提供
- **出力**: logger.js の wrapper 関数設計

### 4. MongoDB インデックス戦略
- **タスク**: ユーザー名の一意性保証、パフォーマンス最適化のためのインデックス設計
- **目的**: 同時登録エラーハンドリング、クエリパフォーマンス確保
- **出力**: インデックス作成スクリプト仕様

### 5. テスト環境の MongoDB 設定
- **タスク**: Jest テスト実行時の MongoDB セットアップ（メモリDB またはテストコンテナ）
- **目的**: テスト実行を自動化し、CI/CD対応にする
- **出力**: test setup 改善提案

## Implementation Phases

### Phase 1: MongoDB Integration & Data Model Design
1. `research.md` - 上記5つの研究タスクの結果をまとめる
2. `data-model.md` - User エンティティの詳細設計、フィールド定義、バリデーション
3. `contracts/register.json`, `contracts/login.json` - API仕様定義
4. `quickstart.md` - 実装開始ガイド

### Phase 2: Implementation Tasks
次の `/speckit.tasks` コマンドで詳細なタスク分割を行います

### Phase 3: Code Review & Validation
Constitution Check の全項目を検証し、PR を作成します

## Phase Completion Status

✅ **Phase 0: Research** - COMPLETED
- research.md: MongoDB driver ベストプラクティス、ストレージ抽象化、ロギング設計を記載

✅ **Phase 1: Design** - COMPLETED
- data-model.md: User エンティティ、バリデーション、インデックス戦略を定義
- contracts/register.md: POST /register API 仕様を定義
- contracts/login.md: POST /login API 仕様を定義
- quickstart.md: ステップバイステップ実装ガイドを提供

## Next Steps

---

**Status**: ✅ Phase 1 Complete - Ready for Phase 2 Tasks  
**Created**: 2026-01-30  
**Author**: GitHub Copilot
