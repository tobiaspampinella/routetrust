# Beta Stable Criteria

Status: FASE 5 beta-core checklist.
Last updated: 2026-05-31

Legend:

- `[implemented]` present in local beta tester
- `[partial]` present but not production-grade
- `[pending]` not implemented
- `[excluded]` explicitly out of FASE 5

1. `[partial]` Login works for admin demo via `admin@demo.com`.
2. `[pending]` Login works for TENANT_ADMIN as separate runtime role.
3. `[implemented]` Driver login works and middleware blocks `/admin`.
4. `[implemented]` Customer tracking demo loads without CMS access.
5. `[partial]` Tenant data exists in CMS mock state by `tenantId`.
6. `[partial]` Cross-tenant guard exists in CMS server guard for protected endpoints.
7. `[excluded]` Telegram delivery is outside the local operations baseline and does not gate beta stability.
8. `[partial]` Route draft/suggestion exists in CMS mock suggested routes.
9. `[implemented]` Suggested route requires human approval in CMS local approval center.
10. `[implemented]` Route can be approved and audit logged locally.
11. `[implemented]` Route can be rejected and audit logged locally.
12. `[partial]` Driver can be assigned in CMS local state.
13. `[implemented]` Driver can start route.
14. `[implemented]` Driver can arrive at stop.
15. `[implemented]` Driver can complete delivery.
16. `[implemented]` Driver can fail delivery with reason.
17. `[implemented]` Driver can report incident from mobile flow.
18. `[implemented]` ETA recalculates after delivery/failure and high incident marks route risk.
19. `[partial]` Dispatcher/admin sees incidents in CEO overview and CMS incidents section.
20. `[partial]` Customer tracking loads public demo; magic token is not implemented.
21. `[implemented]` Map works without Google key through local mock fallback.
22. `[partial]` Demo sandbox reset is local-state only; no production tenants exist in tester.
23. `[pending]` `/health` endpoint is not implemented.
24. `[partial]` CI config exists; local `test`, `lint`, `typecheck` and `build` pass; critical Playwright tests are still pending.
25. `[implemented]` Billing, advanced white-label, mandatory Google 3D, mandatory Apple Maps, predictive AI, complex analytics and microservices are excluded from FASE 5.

## Stable Build Blockers

- No production DB persistence.
- No Playwright smoke/regression suite.
- No `/health` route.
- No durable bug report store.
- No real MapLibre dependency/provider.
- Remaining mojibake exists in untouched legacy UI strings.
- Existing working tree includes uncommitted changes from multiple phases.
