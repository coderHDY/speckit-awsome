# Data Model: Date Time Route

**Feature**: `001-date-time-route`  
**Date**: 2026-04-10

## Entities

### 1. TimeSnapshot

- 説明: 1 回の `/date` リクエストに対して生成される基準時刻。
- フィールド:
  - `timestampMs` (number): UNIX epoch milliseconds
  - `snapshotAt` (string): ISO 8601 UTC 文字列
- 制約:
  - 1レスポンス内の全 `TimeZoneEntry` は同一 `TimeSnapshot` を参照する。

### 2. TimeZoneEntry

- 説明: 1 つのタイムゾーンに対応する返却要素。
- フィールド:
  - `timezone` (string): IANA タイムゾーン ID（例: `Asia/Shanghai`）
  - `label` (string): 表示用名称（例: `中国标准时间`）
  - `datetime` (string): そのタイムゾーンの現在時刻文字列
  - `offset` (string): UTC オフセット（例: `+08:00`）
- バリデーション:
  - `timezone` は固定のサポート一覧に含まれること。
  - `datetime` は空文字不可。

### 3. DateRouteResponse

- 説明: `/date` の標準レスポンス。
- フィールド（成功時）:
  - `success` (boolean): `true`
  - `message` (string): 中国語メッセージ
  - `data.snapshotAt` (string)
  - `data.timezones` (TimeZoneEntry[])
- フィールド（失敗時）:
  - `success` (boolean): `false`
  - `message` (string): 中国語エラーメッセージ
  - `error` (string): エラーコード

## Relationships

- `DateRouteResponse` は 1 つの `TimeSnapshot` を持つ。
- `DateRouteResponse` は 1..N の `TimeZoneEntry` を持つ。
- すべての `TimeZoneEntry` は同一 `TimeSnapshot` に従属する。

## State Transitions

### Request Lifecycle

1. `Requested`: クライアントが `GET /date` を呼び出す。
2. `SnapshotCaptured`: サーバーが基準時刻を 1 回取得する。
3. `Converted`: 固定タイムゾーン一覧へ時刻変換する。
4. `RespondedSuccess`: 成功 JSON を返却する。
5. `RespondedFailure`: 変換例外時に失敗 JSON を返却する。

## Supported Timezone Set (Initial)

- `UTC`
- `Asia/Shanghai`
- `Asia/Tokyo`
- `Europe/London`
- `Europe/Paris`
- `America/New_York`
- `America/Los_Angeles`
- `Australia/Sydney`
