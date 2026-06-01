# Telegram Test

Generated: 2026-06-01T03:05:38.285Z

STATUS: blocked

Telegram external delivery was not executed because required environment variables are missing.

Missing:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

Instructions:
- Copy `.env.example` to `.env.local`.
- Add `TELEGRAM_BOT_TOKEN`.
- Add `TELEGRAM_CHAT_ID`.
- Re-run `npm run telegram:test`.

No token value was printed.
