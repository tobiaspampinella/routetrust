$ErrorActionPreference = "Stop"

$matches = Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match "scripts[\\/]+ops-daemon\.js" -or $_.CommandLine -match "ops:daemon" }

foreach ($process in $matches) {
  Stop-Process -Id $process.ProcessId -Force
}

Write-Output "Stopped $($matches.Count) RouteTrust autonomous ops process(es)."
