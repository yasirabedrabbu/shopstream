# services/core-api/scripts/load-env.ps1
# Loads KEY=VALUE pairs from the repo-root .env into THIS PowerShell session only.
# Values are never printed and never written to disk.
# Usage (from services\core-api):  . .\scripts\load-env.ps1

$envFile = Join-Path $PSScriptRoot "..\..\..\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "No .env found at $envFile"
    return
}

$count = 0
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }

    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()

    # Strip matching surrounding quotes, e.g. REDIS_URL="rediss://..."
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($key, $value, "Process")
    $count++
}

Write-Host "Loaded $count variables from .env (values hidden)."