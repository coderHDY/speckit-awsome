# Quickstart: Date Time Route

**Feature**: `001-date-time-route`  
**Audience**: 実装担当者・テスター

## 1. 実装対象

- `index.js`: `GET /date` ルート追加
- `utils/`（必要時）: タイムゾーン変換ヘルパー追加
- `test/routes/date.test.js`: 新規統合テスト
- `doc/date.md`: API ドキュメント追加

## 2. 実装手順

1. 固定タイムゾーン一覧（IANA ID + 表示ラベル）を定義する。
2. リクエストごとに基準時刻を 1 回だけ取得する。
3. 各タイムゾーンに変換して `data.timezones[]` を生成する。
4. 成功時は `success/message/data` 形式で返す。
5. 例外時は 500 + JSON エラーを返す（内部詳細は非公開）。

## 3. テスト手順

1. `GET /date` が 200 を返すことを確認。
2. レスポンスが JSON で `success=true` を持つことを確認。
3. `data.timezones` に固定一覧の主要時区が含まれることを確認。
4. `snapshotAt` が存在し、空でないことを確認。
5. 例外注入時に 500 と `success=false` を返すことを確認。

## 4. 実行コマンド

```bash
npm test -- test/routes/date.test.js
npm test -- test/utils/dateTimeService.test.js
npm test
```

### 期待結果

- `test/routes/date.test.js` が全件 PASS すること
- `test/utils/dateTimeService.test.js` が全件 PASS すること
- `npm test` 全体実行で既存テストを含めて失敗がないこと

## 5. 受け入れ確認

```bash
curl http://localhost:3000/date
```

期待結果:
- HTTP 200
- JSON 形式
- 主流タイムゾーンの現在時刻が返る

## 6. 失敗系確認

- テスト内モックで `buildDateSuccessPayload` 例外を注入した際、`500` と `TIME_GENERATION_FAILED` が返ること
