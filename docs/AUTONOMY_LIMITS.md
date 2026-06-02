# Autonomy Limits

RouteTrust does not run autonomous LLM workers.

What is real:

- local Node server
- local scheduler
- scripted coordination passes
- heartbeats
- runtime JSON status
- generated logs and reports

What is not real:

- autonomous feature implementation
- autonomous bug fixing
- cloud worker fleet
- staging automation
- Telegram operations without credentials

Rule:

- `documented` does not mean running
- `scheduled` does not mean feature work
- `running` means a real local process exists
- `stable` requires durable storage, health and browser smoke
