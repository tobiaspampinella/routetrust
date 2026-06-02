$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Preparing RouteTrust local database..."
npm run db:bootstrap
if ($LASTEXITCODE -ne 0) {
  Write-Host "Local database bootstrap did not complete. See runtime/reports/db-local-bootstrap-latest.md."
}

Write-Host "Starting RouteTrust dev server..."
Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "Set-Location '$root'; npm run dev" -WindowStyle Hidden

Write-Host "Starting RouteTrust supervised scheduler..."
Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "Set-Location '$root'; npm run agent:scheduler" -WindowStyle Hidden

Write-Host "Optional: run 'npm run telegram:status' once credentials are configured."
