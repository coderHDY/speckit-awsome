# 当前时间 API

## エンドポイント

`GET /date`

## 説明

主流タイムゾーンの現在時刻を JSON 形式で返却します。
1回のレスポンス内では同一スナップショット時刻を基準に変換します。

## 成功レスポンス（200）

```json
{
  "success": true,
  "message": "当前时间查询成功",
  "data": {
    "snapshotAt": "2026-04-10T08:30:00.000Z",
    "timezones": [
      {
        "timezone": "UTC",
        "label": "协调世界时",
        "datetime": "2026-04-10 08:30:00",
        "offset": "+00:00"
      },
      {
        "timezone": "Asia/Shanghai",
        "label": "中国标准时间",
        "datetime": "2026-04-10 16:30:00",
        "offset": "+08:00"
      }
    ]
  }
}
```

## 失敗レスポンス（500）

```json
{
  "success": false,
  "message": "时间数据生成失败",
  "error": "TIME_GENERATION_FAILED"
}
```

## cURL 例

```bash
curl http://localhost:3000/date
```
