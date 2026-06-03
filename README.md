<div align="center">

# RouteTrust

### Operational intelligence for logistics teams.

**AI-built · human-orchestrated.** RouteTrust helps logistics companies coordinate routes,
approve AI-suggested decisions, track drivers, and keep customers informed in real time.

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS` · `Prisma` · `Zustand`

**Status:** local-first beta · _not production-ready_ · honest readiness reporting built in.

</div>

---

## What it is

RouteTrust is a B2B logistics operational-intelligence platform with one connected layer across
four surfaces: a control-tower **operations dashboard**, a **customer tracking** experience, a
mobile-first **driver portal**, and an **AI route-approval** workflow. Its guiding principle —
**“AI suggests, human approves”** — is also how the product itself was built.

It is intentionally **not** a full TMS, ERP, or autonomous dispatch system.

## The surfaces

| Surface | Route | What it does |
|---------|-------|--------------|
| Operations dashboard | `/admin` | Active routes, drivers online, SLA at risk, open incidents, **live system-status** strip. |
| Operational CMS | `/admin/drivers`, `/admin/incidents`, `/admin/approvals`, `/admin/audit-logs` | Tables, search, filters, drawer CRUD. Drivers is **full-stack** (UI → API → file store). |
| AI route approval | `/admin/approvals` | AI suggestion vs current route, ETA/SLA impact, approve / modify / reject, with an audit log. |
| Customer tracking | `/track/demo` | MercadoLibre-clear status timeline, live ETA, delivery states. |
| Driver portal | `/driver`, `/driver/route` | Mobile-first route, next stop, big one-tap actions (start / arrived / delivered / report incident). |
| Public site | `/`, `/product`, `/use-cases`, `/contact`, `/updates` | Apple-style marketing site with a live status page. |

## Design references

The experience draws on the clarity and operability of **MercadoLibre** (tracking), **Amazon**
(operations control), **Uber** (movement/maps), **Andreani** (regional traceability), with the
restraint of **Apple** and **ChatGPT**. These are quality references, not copied brands.

## Quick start

```bash
npm install
cp .env.example .env.local      # optional: set AUTH_SECRET, DATABASE_URL, NEXT_PUBLIC_MAP_PROVIDER
npm run dev                     # http://localhost:3000
```

Runs fully **local-first** with zero external configuration: no map API key required (safe mock
fallback) and a file-backed store when no database is configured.

### Demo credentials (local)

| Role   | Email               | Password    |
|--------|---------------------|-------------|
| Admin  | `admin@demo.com`    | `admin123`  |
| Driver | `driver1@demo.com`  | `driver123` |

## Honest readiness

RouteTrust reports its real state via `/api/health` and the admin status strip — no inflated
production claims.

| Capability | Status |
|------------|--------|
| Local demo ready | **Yes** |
| Server ready | Partial |
| Beta stable ready | No |
| Staging ready | No |
| SaaS implementable | No |

Blockers are surfaced live (e.g. database/migrations) rather than hidden.

## Verification

```bash
npm run typecheck     # tsc
npm run lint          # eslint
npm test              # unit tests (node:test)
npm run build         # next build
npm run qa:e2e        # Playwright smoke + authenticated operational flows
npm run beta-check    # readiness gate
```

## Maps

No hard dependency on a paid maps API. Provider is resolved from `NEXT_PUBLIC_MAP_PROVIDER`
(`mock` | `maplibre` | `osrm` | `openrouteservice` | `google` | `apple`) and **falls back safely
to a local mock** when config is missing — reported honestly in health. See
[`docs/MAPS_STRATEGY.md`](docs/MAPS_STRATEGY.md).

## Public demo export

```bash
npm run export:public-demo      # -> dist-public-demo/ (allowlist + fail-closed secret scan)
```

Ships only the runnable product (app, demo seed, curated docs) with secrets, runtime data and
internal ops tooling excluded by construction. See
[`docs/PUBLIC_DEMO_EXPORT_PLAN.md`](docs/PUBLIC_DEMO_EXPORT_PLAN.md).

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma · Zustand · Playwright.

## Credits

- **Original idea, concept & vision:** Tobias Ammann Pampinella.
- **Built by (AI models, human-orchestrated):** GPT-5.5 and Claude Opus 4.8.

See [`CREDITS.md`](CREDITS.md).

## License

See [`LICENSE`](LICENSE). © 2026 Tobias Ammann Pampinella — all rights reserved (terms TBD by the owner).
