$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting RouteTrust dev server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; npm run dev" -WindowStyle Normal

Write-Host "Starting RouteTrust supervised scheduler..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; npm run agent:scheduler" -WindowStyle Normal

Write-Host "Optional: run 'npm run telegram:status' once credentials are configured."
