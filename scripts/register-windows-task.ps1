Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$TaskName = "RouteTrust Autonomous Watchdog"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$StartScript = Join-Path $ScriptDir "start-autonomous-ops.ps1"

$Action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$StartScript`"" `
  -WorkingDirectory $ProjectRoot

$Trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes 30) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Description "Runs RouteTrust autonomous ops every 30 minutes. Codex runs only when CODEX_AUTORUN=1 is configured." `
  -Force

Write-Output "Registered scheduled task: $TaskName"
