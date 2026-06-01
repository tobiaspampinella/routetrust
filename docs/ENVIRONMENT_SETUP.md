# FASE 0 - Environment Setup Audit

Fecha local: 2026-05-30T22:54:37-05:00
Workspace: `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`

## Herramientas detectadas

| Herramienta | Estado | Evidencia |
|---|---:|---|
| Node en PATH | Bloqueado | `Acceso denegado` al ejecutar `node --version` |
| Node empaquetado Codex | Disponible | `v24.14.0` |
| npm temporal | Disponible | `11.16.0` en `C:\Users\tobii\.codex\tmp\npm-cli` |
| Git | Disponible | `git version 2.54.0.windows.1` |
| Docker | No disponible | `docker` no reconocido |

## Node funcional para esta PC

Usar este wrapper PowerShell para comandos npm:

```powershell
$nodeDir='C:\Users\tobii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$node=Join-Path $nodeDir 'node.exe'
$npmCli='C:\Users\tobii\.codex\tmp\npm-cli\package\bin\npm-cli.js'
$env:PATH="$nodeDir;$env:PATH"
```

Ejemplo:

```powershell
& $node $npmCli run build
```

## Package manager correcto

Regla aplicada:

- `pnpm-lock.yaml` no existe.
- `package-lock.json` existe.
- `yarn.lock` no existe.

Resultado: usar **npm**.

## Frameworks detectados

Frontend:

- `next` en dependencies.
- `react` y `react-dom` en dependencies.
- `next.config.ts` existe.
- `src/app` existe.

Backend:

- No hay backend separado detectado.
- API actual vive en `src/app/api`.
- Prisma existe en `prisma/schema.prisma`.

## Variables de entorno detectadas

`.env.example` existe e incluye:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ROUTEPULSE_DEMO_SECRET`
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAP_ID`
- `NEXT_PUBLIC_OPENROUTE_API_KEY`
- `NEXT_PUBLIC_APPLE_MAPKIT_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`
- `DEMO_MODE`
- `NODE_ENV`

## Bloqueos actuales

- Docker no esta instalado o no esta en PATH.
- Node global no es usable por `Acceso denegado`.
- Para instalar o ejecutar scripts, usar Node empaquetado Codex con npm temporal.
