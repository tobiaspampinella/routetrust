# Healthcheck

Endpoint: `GET /api/health`

Contract:

```json
{
  "status": "ok | degraded | fail",
  "timestamp": "ISO-8601",
  "app": "RouteTrust",
  "environment": "development | production | test",
  "version": "v0.14",
  "checks": {
    "server": "ok",
    "storage": "ok | fail",
    "bugStore": "ok | fail",
    "telegram": "configured | not_configured | out_of_scope",
    "maps": "configured | fallback",
    "auth": "demo | configured | missing",
    "runtime": "ok | degraded | fail"
  }
}
```

Rules:

- health returns `200`
- missing Telegram does not trigger `500`
- fallback maps do not trigger `500`
- storage failure must downgrade status truthfully
