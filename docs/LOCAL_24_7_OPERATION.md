# Local 24/7 Operation

This project does not run itself.

## 1. Manual local mode

Start the app:

```powershell
npm run dev
```

Start the supervised runtime:

```powershell
npm run agent:scheduler
```

## 2. Persistent local Windows mode

Options:

- `scripts/start-routetrust-dev.ps1`
- Windows Task Scheduler
- PM2 for the Node scheduler if long-lived local supervision is needed

Recommended split:

- Terminal 1: `npm run dev`
- Terminal 2: `npm run agent:scheduler`

## 3. Staging or cloud

Realistic next step options:

- GitHub Actions for smoke checks and scheduled watchdog passes
- VPS
- Vercel / Railway / Render / Fly.io depending on the final backend shape
- Telegram alerts once credentials are configured

## Manual boundaries

- Code changes are manual.
- Browser validation is manual unless a browser suite is added.
- Secret provisioning is manual.
- Scheduler only orchestrates local scripts and reports.
