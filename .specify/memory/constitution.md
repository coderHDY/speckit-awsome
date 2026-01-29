<!--
Sync Impact Report:
Version change: Initial → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - I. 日本語コメント規則 (Japanese Comments Rule)
  - II. 第三者ライブラリ抽象化 (Third-Party Library Abstraction)
  - III. テスト駆動開発 (Test-Driven Development) - NON-NEGOTIABLE
  - IV. API ドキュメント (API Documentation)
  - V. アーカイブドキュメント (Archive Documentation)
  - VI. コミュニケーション言語 (Communication Language)
Removed sections: None
Templates requiring updates:
  ✅ Updated .specify/templates/plan-template.md
  ✅ Updated .specify/templates/spec-template.md
  ✅ Updated .specify/templates/tasks-template.md
Follow-up TODOs: None
-->

# Speckit Server Constitution

## Core Principles

### I. 日本語コメント規則 (Japanese Comments Rule) - NON-NEGOTIABLE

**すべてのソースコード内のコメントは日本語で記述しなければならない。**

- クラス、関数、メソッドのドキュメントコメントは日本語で書く
- インラインコメント、説明コメントも日本語を使用する
- 変数名、関数名、クラス名は英語で記述する（コードの国際互換性のため）
- コメントは明確で簡潔であること

**理由**: コードの可読性と保守性を向上させ、チームメンバー間の理解を統一するため。

### II. 第三者ライブラリ抽象化 (Third-Party Library Abstraction) - NON-NEGOTIABLE

**すべての第三者ライブラリのメソッドは `@/utils` ディレクトリでラップして使用しなければならない。**

- 直接的な第三者ライブラリの import/require を避ける
- `@/utils` 配下にラッパー関数を作成し、プロジェクト固有のインターフェースを提供する
- ラッパー関数には日本語コメントで使用方法と目的を明記する
- 第三者ライブラリの変更時は utils 層のみの修正で済むようにする

**理由**: 依存関係を疎結合にし、ライブラリ変更時の影響範囲を最小化するため。技術的負債を軽減し、テスト容易性を向上させる。

### III. テスト駆動開発 (Test-Driven Development) - NON-NEGOTIABLE

**すべての実装には対応するテストコードを `/test` ディレクトリに配置しなければならない。**

- Red-Green-Refactor サイクルを厳格に遵守する
- テストファイルは実装ファイルと同じディレクトリ構造を `/test` 配下に作成する
- 新規メソッド・関数を作成する際は、必ずテストコードを先に書く
- カバレッジ目標: 最低 80% (branches, functions, lines, statements)
- テストコードにも日本語コメントを記述する

**理由**: コードの品質保証、リファクタリングの安全性確保、仕様の明確化。

### IV. API ドキュメント (API Documentation) - NON-NEGOTIABLE

**すべての API エンドポイントは `@/doc` ディレクトリに対応するルート定義ドキュメントを持たなければならない。**

- 各 API のドキュメントは日本語で記述する
- エンドポイント、メソッド、リクエスト/レスポンス形式を明記する
- サンプルリクエスト・レスポンスを含める
- 認証要件、エラーハンドリングを文書化する

**理由**: API の使用方法を明確にし、フロントエンド開発者や他のチームメンバーとの連携を円滑にするため。

### V. アーカイブドキュメント (Archive Documentation)

**生成された `.md` アーカイブファイルは日本語で記述しなければならない。**

- 設計書、仕様書、変更履歴などのドキュメントは日本語で作成する
- `openspec/changes/archive/` 配下のドキュメントも日本語を使用する
- 日付形式: YYYY-MM-DD (ISO 8601)
- マークダウンの見出し構造を統一する

**理由**: プロジェクトの歴史と意思決定プロセスを記録し、将来の参照を容易にするため。

### VI. コミュニケーション言語 (Communication Language)

**ユーザーとのコミュニケーションは中国語を使用する。**

- コミットメッセージ、プルリクエストは中国語で記述
- エラーメッセージ、ログ出力は中国語を使用
- README や外部向けドキュメントは中国語で作成

**理由**: ユーザーとの円滑なコミュニケーションを実現するため。

## Technology Standards

### Node.js & Express Framework

- Node.js をバックエンドランタイムとして使用
- Express フレームワークで API を構築
- 非同期処理は async/await パターンを使用
- ES6+ の機能を積極的に活用

### Directory Structure

```
@/
├── utils/          # 第三者ライブラリラッパー、共通ユーティリティ
├── routes/         # ルート定義
├── src/            # アプリケーションソースコード
│   ├── domain/     # ドメイン層（DDD）
│   ├── application/# アプリケーション層
│   ├── infrastructure/ # インフラストラクチャ層
│   └── presentation/   # プレゼンテーション層
├── test/           # テストコード（ソース構造を反映）
└── doc/            # API ドキュメント
```

## Development Workflow

### Code Review Requirements

- すべての変更は Constitution の遵守を検証する
- テストカバレッジが 80% 未満の場合はマージしない
- `/test` ディレクトリにテストが存在しない実装はマージしない
- 第三者ライブラリの直接使用がある場合はマージしない
- API 追加時に `/doc` ドキュメントがない場合はマージしない

### Quality Gates

1. **コメント検証**: すべてのコメントが日本語であることを確認
2. **依存関係検証**: 第三者ライブラリが `@/utils` 経由で使用されていることを確認
3. **テスト検証**: 対応するテストコードが存在し、カバレッジ 80% 以上を達成していることを確認
4. **ドキュメント検証**: API の場合 `/doc` にドキュメントが存在することを確認

### Spec-Driven Development

- OpenSpec ワークフローを使用して変更を管理
- proposal → design → specs → tasks の順に artifact を作成
- 実装前に必ず設計とタスク分解を完了させる

## Governance

**本 Constitution はすべての開発プラクティスに優先する。**

- すべての PR/レビューで Constitution への準拠を検証する
- 原則に違反する実装は正当な理由がない限り却下される
- 複雑性の導入には明確な justification が必要
- Constitution の修正には文書化、承認、移行計画が必要

**Version**: 1.0.0 | **Ratified**: 2026-01-29 | **Last Amended**: 2026-01-29
