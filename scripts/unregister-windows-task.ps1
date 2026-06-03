$ErrorActionPreference = "Stop"

$TaskName = "RouteTrust Autonomous Watchdog"
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Output "Unregistered task: $TaskName"
