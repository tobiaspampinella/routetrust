Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$matches = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -and
    $_.CommandLine -match "node" -and
    $_.CommandLine -match "scripts[\\/]+ops-daemon\.js"
  }

foreach ($process in $matches) {
  Stop-Process -Id $process.ProcessId -Force
}

Write-Output "Stopped $($matches.Count) RouteTrust autonomous ops process(es)."
