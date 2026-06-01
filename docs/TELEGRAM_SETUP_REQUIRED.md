# Telegram Setup Required

RouteTrust keeps Telegram optional.

## Required variables

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `TELEGRAM_BOT_TOKEN`.
3. Set `TELEGRAM_CHAT_ID`.
4. Run `npm run telegram:status`.
5. Run `npm run telegram:test`.

## Runtime behavior without credentials

- Build must not fail.
- `telegram:test` must report `blocked`.
- `runtime/project-status.json` must show Telegram as blocked.
- Critical bug escalation stays local until credentials exist.
