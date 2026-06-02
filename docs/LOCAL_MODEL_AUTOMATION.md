# Local Model Automation

RouteTrust can use Ollama for cheap analysis when it is already installed and a preferred model is available.

## Detection

Run:

```powershell
npm run local:model
```

The runner executes:

```powershell
ollama list
```

Recommended installed models:

- `qwen2.5-coder:7b`
- `qwen2.5-coder:14b`
- `qwen3-coder:480b-cloud`
- `qwen3.6`
- `deepseek-coder`
- `llama3.1`

The runner does not download models automatically.

## Config

Config file:

```text
runtime/local-model/config.json
```

Default:

- `enabled`: `true`
- `autoDownload`: `false`
- `provider`: `ollama`

If `qwen3-coder:480b-cloud` is the only available model, it is treated as an
Ollama-backed analysis model, not as proof that a small offline local model is
installed.

## Allowed Local Model Work

- Summarize logs.
- Classify bugs.
- Generate checklists.
- Translate README/docs EN/ES.
- Detect documentation drift.
- Prepare issue drafts.
- Group errors.
- Suggest microcopy.
- Audit UX superficially.

## Forbidden Local Model Decisions

- Final security approval.
- DB migrations.
- Architecture.
- Deploy.
- Auth.
- RBAC.
- Tenant isolation.
- Beta stable readiness.
- Production readiness.

Local model output is advisory only.
