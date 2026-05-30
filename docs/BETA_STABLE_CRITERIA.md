# Beta Stable Criteria

Status: draft checklist for 7-day beta.

1. Login works for SUPER_ADMIN.
2. Login works for TENANT_ADMIN.
3. Driver login works and cannot access CMS.
4. Viewer/customer tracking works without CMS access.
5. Tenant data is scoped by `tenantId`.
6. Cross-tenant access returns 403.
7. RBAC permissions are enforced on every protected endpoint.
8. Route can be created as draft.
9. Route can be suggested.
10. Suggested route requires human approval.
11. Route can be approved and audit logged.
12. Route can be rejected with reason and audit logged.
13. Driver can be assigned to approved route.
14. Driver can start route.
15. Driver can arrive at stop.
16. Driver can complete delivery.
17. Driver can fail delivery with reason.
18. ETA recalculates after delivery/failure/incident.
19. Incident can be reported from mobile flow.
20. Dispatcher sees incident in operational UI.
21. Customer tracking loads through magic token.
22. Map works without Google key through free fallback.
23. Demo sandbox reset does not affect production tenants.
24. `/health` returns 200 in local/staging.
25. CI passes lint, build, typecheck, and critical Playwright tests.

