# Research Findings: Date Time Route

**Feature**: `001-date-time-route`  
**Date**: 2026-04-10  
**Status**: Completed

## 1. 時刻生成方式（Node.js）

- Decision: Node.js 標準 `Intl.DateTimeFormat` と IANA タイムゾーン名を採用する。
- Rationale: 追加依存が不要で、DST（夏時間）を標準で処理でき、運用コストを最小化できる。
- Alternatives considered:
  - `luxon`: API は豊富だが、本機能には過剰。
  - `dayjs + timezone plugin`: 軽量だが、依存追加とプラグイン管理が必要。
  - `moment-timezone`: 新規採用非推奨。

## 2. 同一スナップショット保証

- Decision: リクエストごとに 1 回だけ現在時刻を取得し、その値を全タイムゾーン変換に共通利用する。
- Rationale: 1レスポンス内の時刻不一致（秒境界ズレ）を防止できる。
- Alternatives considered:
  - 各タイムゾーンで都度 `Date.now()` を呼ぶ: 実装は簡単だが整合性要件に違反。

## 3. 主流タイムゾーンの定義

- Decision: 固定リスト方式（UTC + 東アジア + 欧州 + 北米 + オセアニア）を採用する。
- Rationale: 仕様が安定し、クライアント側実装が容易。
- Alternatives considered:
  - クエリパラメータで任意指定: 柔軟だが本スコープ外。
  - 全IANA返却: 量が過大でユーザー価値に対して過剰。

## 4. API レスポンス構造

- Decision: 既存パターン `success` / `message` / `data` を維持し、`data.snapshotAt` と `data.timezones[]` を返却する。
- Rationale: 既存 API と整合し、後方互換性と可読性を担保できる。
- Alternatives considered:
  - 配列のみ返却: シンプルだが既存スタイルから逸脱。
  - `meta` 分離: 将来拡張には有効だが現時点で不要。

## 5. エラー処理方針

- Decision: 変換失敗時は HTTP 500 で JSON エラーを返し、内部詳細は返さない。
- Rationale: クライアント実装を単純化し、内部情報漏えいを防止できる。
- Alternatives considered:
  - 部分成功（失敗した時区のみ除外）: 一見可用性は高いが、整合性と契約が複雑化する。

## 6. テスト戦略

- Decision: `test/routes/date.test.js` に統合テストを追加し、必要最小限のヘルパー単体テストを補助で追加する。
- Rationale: エンドポイント契約を最優先で保証できる。
- Alternatives considered:
  - 単体テストのみ: HTTP 契約保証が弱い。
  - E2E のみ: 実行コストが高い。
