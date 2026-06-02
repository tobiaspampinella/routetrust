Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $ProjectRoot

if ($env:CODEX_AUTORUN -eq "1") {
  npm run ops:daemon -- --run-codex
} else {
  npm run ops:daemon
}
