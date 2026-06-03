#!/usr/bin/env node
/**
 * Export a sanitized public demo of RouteTrust into `dist-public-demo/`.
 *
 * Strategy: ALLOWLIST (only explicitly-approved paths are copied) + a secret/local-path scanner
 * that FAILS the export if anything sensitive slips through. The autonomous ops tooling
 * (scripts/, agents/, runtime/, internal docs) and all secrets (.env, real keys) are excluded by
 * construction. Run: `node scripts/export-public-demo.js` (or `npm run export:public-demo`).
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist-public-demo");

// Only these top-level files/dirs are shipped. Everything else is excluded by default.
const ALLOW_FILES = [
  "next.config.ts",
  "tsconfig.json",
  "tsconfig.typecheck.json",
  "tailwind.config.ts",
  "postcss.config.mjs",
  "next-env.d.ts",
  ".eslintrc.json",
  ".eslintignore",
  ".env.example",
  "README.md",
  "CREDITS.md",
  "LICENSE",
  "playwright.config.ts",
];
const ALLOW_DIRS = ["src", "public", "prisma", "tests"];
// Curated, demo-safe docs only (no internal ops / status / vulnerability docs).
const ALLOW_DOCS = ["MAPS_STRATEGY.md"];

// Never copy these, even if nested under an allowed dir.
const DENY_NAMES = new Set([".env", ".env.local", ".env.production", "node_modules", ".next", ".next-dev", ".next-build", ".next-app"]);

// Public-facing npm scripts only (drop the agent/ops/telegram/github automation).
const PUBLIC_SCRIPTS = [
  "dev",
  "build",
  "start",
  "lint",
  "test",
  "typecheck",
  "qa:e2e",
  "db:up",
  "db:down",
  "db:validate",
  "db:migrate",
  "db:seed",
  "db:studio",
];

const SECRET_PATTERNS = [
  { name: "local user path", re: /C:\\Users\\|\/Users\/[a-z]/i },
  // [ \t] (not \s) so an empty `AUTH_SECRET=` placeholder does not match across the next line.
  { name: "non-empty AUTH/DEMO secret", re: /(AUTH_SECRET|ROUTEPULSE_DEMO_SECRET)[ \t]*=[ \t]*\S/ },
  { name: "committed routetrust secret value", re: /routetrust-local-[0-9a-f]{16,}/i },
  { name: "telegram bot token", re: /\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/ },
  // Placeholder connection strings are expected in .env.example; this pattern is skipped there.
  { name: "db url with credentials", re: /postgres(?:ql)?:\/\/[^\s"']*:[^\s"'@]+@/i, skipIn: [".env.example"] },
  { name: "openai/anthropic key", re: /\b(sk-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9-]{20,})\b/ },
];

const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css", ".html", ".yml", ".yaml", ".txt", ".env", ".example", ".prisma"]);

function rmrf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (DENY_NAMES.has(path.basename(src))) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (DENY_NAMES.has(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    if (DENY_NAMES.has(path.basename(src))) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function sanitizedPackageJson() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const scripts = {};
  for (const key of PUBLIC_SCRIPTS) {
    if (pkg.scripts && pkg.scripts[key]) scripts[key] = pkg.scripts[key];
  }
  return {
    name: pkg.name,
    version: pkg.version,
    private: true,
    description: "RouteTrust — public demo. Operational intelligence for logistics teams (local-first).",
    scripts,
    prisma: pkg.prisma,
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
    overrides: pkg.overrides,
  };
}

const CI_YML = `name: CI
on:
  push:
    branches: [ main ]
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
`;

function main() {
  const included = [];
  const excludedNote = ["runtime/", "data/runtime/", "scripts/ (ops tooling)", "agents/", ".env / .env.local", "docs/ (except curated)"];

  rmrf(OUT);
  fs.mkdirSync(OUT, { recursive: true });

  for (const file of ALLOW_FILES) {
    const src = path.join(ROOT, file);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(OUT, file));
      included.push(file);
    }
  }
  for (const dir of ALLOW_DIRS) {
    const src = path.join(ROOT, dir);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(OUT, dir));
      included.push(`${dir}/`);
    }
  }
  for (const doc of ALLOW_DOCS) {
    const src = path.join(ROOT, "docs", doc);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(OUT, "docs", doc));
      included.push(`docs/${doc}`);
    }
  }

  // Never ship project-specific local credentials in the example env.
  const exampleOut = path.join(OUT, ".env.example");
  if (fs.existsSync(exampleOut)) {
    const example = fs
      .readFileSync(exampleOut, "utf8")
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/i, "postgresql://user:password@localhost:5432/routetrust?schema=public");
    fs.writeFileSync(exampleOut, example, "utf8");
  }

  // Sanitized package.json + basic CI.
  fs.writeFileSync(path.join(OUT, "package.json"), `${JSON.stringify(sanitizedPackageJson(), null, 2)}\n`, "utf8");
  included.push("package.json (sanitized)");
  fs.mkdirSync(path.join(OUT, ".github", "workflows"), { recursive: true });
  fs.writeFileSync(path.join(OUT, ".github", "workflows", "ci.yml"), CI_YML, "utf8");
  included.push(".github/workflows/ci.yml");

  // A public .gitignore for the exported repo.
  fs.writeFileSync(
    path.join(OUT, ".gitignore"),
    ["node_modules/", ".next/", ".next-dev/", ".next-build/", ".env", ".env.local", "data/runtime/", "test-results/", "playwright-report/", "*.tsbuildinfo", ""].join("\n"),
    "utf8",
  );
  included.push(".gitignore");

  // Secret / local-path scan over the exported output (fail closed).
  const findings = [];
  for (const file of walkFiles(OUT)) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXT.has(ext) && path.basename(file) !== ".env.example") continue;
    const content = fs.readFileSync(file, "utf8");
    const base = path.basename(file);
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.skipIn && pattern.skipIn.includes(base)) continue;
      if (pattern.re.test(content)) {
        findings.push({ file: path.relative(OUT, file), issue: pattern.name });
      }
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    output: path.relative(ROOT, OUT),
    included,
    excluded: excludedNote,
    secretScan: { clean: findings.length === 0, findings },
  };
  fs.writeFileSync(path.join(OUT, "EXPORT_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  process.stdout.write(`Public demo exported to ${path.relative(ROOT, OUT)}\n`);
  process.stdout.write(`Included ${included.length} entries.\n`);
  if (findings.length > 0) {
    process.stderr.write(`SECRET SCAN FAILED: ${findings.length} finding(s):\n`);
    for (const f of findings) process.stderr.write(`- ${f.file}: ${f.issue}\n`);
    process.exit(1);
  }
  process.stdout.write("Secret scan: clean.\n");
}

main();
