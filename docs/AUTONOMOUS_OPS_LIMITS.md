# Autonomous Ops Limits

There is no real autonomous LLM worker.

The daemon does not:

- execute Codex GPT-5.5 directly
- modify Prisma schema
- run Prisma migrations
- modify auth, RBAC or tenant isolation
- change deploy configuration
- force push
- merge branches
- release builds
- declare beta stable
- download Ollama models

The watchdog does not:

- modify source code
- commit
- push
- run production build every 30 minutes
- run browser smoke every 30 minutes
- touch Prisma every 30 minutes
- retry failed GitHub pushes repeatedly

Human approval is required for:

- merge to protected main
- release
- production deploy
- DB migrations
- security approval
- auth/RBAC changes
- tenant isolation changes
- beta stable declaration
