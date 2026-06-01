# Dev Server Status

Generated: 2026-06-01T01:18:00Z

## Runtime

- Status: ON
- URL: `http://127.0.0.1:3000`
- Command: `npm run dev`
- Package manager: `npm`
- Package lock: present
- Process ID: `13356`
- Node/npm on this PC: use the wrapper documented in `docs/ENVIRONMENT_SETUP.md`

## HTTP Checks

- `/login`: `200`
- `/track/demo`: `200`
- `/admin`: `307` redirect to login when unauthenticated
- `/admin/project-status`: `307` redirect to login when unauthenticated

## Operational Commands

- `npm run agents:status`
- `npm run beta-check`
- `npm run telegram:test`

## Current Error

- Telegram delivery is blocked until `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` exist in local environment.
