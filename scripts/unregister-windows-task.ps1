Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$TaskName = "RouteTrust Autonomous Watchdog"

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Output "Unregistered scheduled task: $TaskName"
} else {
  Write-Output "Scheduled task not found: $TaskName"
}
