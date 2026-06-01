# HTTP Smoke Report

Date: 2026-06-01
Server: `next dev --hostname 127.0.0.1 --port 3000`

## Results

| Route | Status | Result | Error |
| --- | ---: | --- | --- |
| `/` | 200 | PASS | none |
| `/login` | 200 | PASS | none |
| `/track/demo` | 200 | PASS | none |
| `/admin` | 307 | PASS | redirect to login accepted |
| `/api/bugs` | 401 | PASS | auth required as expected |
| `/api/cms/telegram/status` | 200 | PASS | none |
| `/api/cms/telegram/test` | 400 | PASS | missing Telegram env handled without 500 |

## Telegram endpoint payloads

`GET /api/cms/telegram/status`

```json
{
  "configured": false,
  "missing": ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
  "status": "not_configured"
}
```

`POST /api/cms/telegram/test`

```json
{
  "sent": false,
  "status": "missing_configuration",
  "missing": ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
  "detail": "Telegram no configurado en este entorno."
}
```
