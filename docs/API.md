# API

## Health

- `GET /api/health`
- returns operational status for server, storage, bug store, Telegram, maps, auth and runtime
- never returns `500` only because Telegram is missing

## Bugs

- `GET /api/bugs`
- `POST /api/bugs`
- bug reports persist in `data/runtime/bug-reports.json`

## Telegram

- `GET /api/cms/telegram/status`
- `POST /api/cms/telegram/test`
- optional in local baseline
