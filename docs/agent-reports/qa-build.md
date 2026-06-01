# QA Build Report

Generated: 2026-06-01T03:03:53.287Z

STATUS: completed

## package script "lint": cross-env ESLINT_USE_FLAT_CONFIG=false eslint . --ext .js,.jsx,.ts,.tsx --cache

Exit code: 0

```text

(node:22924) ESLintRCWarning: You are using an eslintrc configuration file, which is deprecated and support will be removed in v10.0.0. Please migrate to an eslint.config.js file. See https://eslint.org/docs/latest/use/configure/migration-guide for details. An eslintrc configuration file is used because you have the ESLINT_USE_FLAT_CONFIG environment variable set to false. If you want to use an eslint.config.js file, remove the environment variable. If you want to find the location of the eslintrc configuration file, use the --debug flag.
(Use `node --trace-warnings ...` to show where the warning was created)

```

## package script "typecheck": tsc --noEmit -p tsconfig.typecheck.json

Exit code: 0

```text


```

## package script "build": cross-env ROUTEPULSE_DIST_DIR=.next-build next build

Exit code: 0

```text
   ▲ Next.js 15.5.18

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.9s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/24) ...
   Generating static pages (6/24) 
   Generating static pages (12/24) 
   Generating static pages (18/24) 
 ✓ Generating static pages (24/24)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                    Size  First Load JS
┌ ○ /                                        3.1 kB         117 kB
├ ○ /_not-found                               995 B         103 kB
├ ○ /admin                                  9.44 kB         141 kB
├ ○ /admin/bug-reports                      1.52 kB         129 kB
├ ○ /admin/cms                              17.3 kB         155 kB
├ ○ /admin/kpis                             6.91 kB         134 kB
├ ○ /admin/project-status                   1.52 kB         129 kB
├ ○ /admin/routes                           6.82 kB         134 kB
├ ○ /admin/settings                         3.92 kB         131 kB
├ ƒ /api/assistant                            150 B         103 kB
├ ƒ /api/auth/login                           150 B         103 kB
├ ƒ /api/auth/logout                          150 B         103 kB
├ ƒ /api/auth/me                              150 B         103 kB
├ ƒ /api/bugs                                 150 B         103 kB
├ ƒ /api/bugs/[bugId]                         150 B         103 kB
├ ƒ /api/bugs/[bugId]/route                     0 B            0 B
├ ƒ /api/cms/telegram/project-intelligence    150 B         103 kB
├ ƒ /api/cms/telegram/status                  150 B         103 kB
├ ƒ /api/cms/telegram/test                    150 B         103 kB
├ ○ /cms                                      150 B         103 kB
├ ○ /driver                                 4.08 kB         132 kB
├ ○ /driver/route                               0 B            0 B
├ ○ /login                                  4.56 kB         129 kB
└ ○ /track/demo                              5.6 kB         136 kB
+ First Load JS shared by all                102 kB
  ├ chunks/255-4f84124391a7dac4.js          46.2 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js     54.2 kB
  └ other shared chunks (total)                2 kB


ƒ Middleware                                34.7 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand



```

