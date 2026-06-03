# Local Model Automation

RouteTrust can use Ollama for cheap local analysis if Ollama and a recommended model are already installed.

Detection command:

```powershell
ollama list
```

Recommended models:

- `qwen2.5-coder:7b`
- `qwen2.5-coder:14b`
- `qwen3.6`
- `deepseek-coder`
- `llama3.1`

No model is downloaded automatically. `runtime/local-model/config.json` sets `autoDownload` to `false`.

## Allowed Work

- summarize logs
- classify bugs
- generate checklists
- translate README/docs EN/ES
- detect documentation drift
- prepare issue drafts
- group errors
- suggest microcopy
- superficial UX audit

## Forbidden Decisions

The local model cannot decide:

- final security approval
- DB migrations
- architecture
- deploy
- auth
- RBAC
- tenant isolation
- beta stable readiness
- production readiness

## Runtime Outputs

- `runtime/local-model/status-latest.json`
- `runtime/local-model/latest-output.md`
