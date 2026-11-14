# services/core-api/scripts/check-suspend.ps1
# Usage: .\scripts\check-suspend.ps1 -BaseUrl http://localhost:8080 -AdminToken <token> -UserId <uuid> -UserToken <token>
# Tokens are read as secure input if not passed. Nothing is written to disk.

param(
    [string]$BaseUrl = "http://localhost:8080",
    [Parameter(Mandatory = $true)][string]$UserId,
    [string]$AdminToken,
    [string]$UserToken
)

if (-not $AdminToken) { $AdminToken = Read-Host "Admin access token" }
if (-not $UserToken) { $UserToken = Read-Host "Test user access token" }

$adminHeaders = @{ Authorization = "Bearer $AdminToken"; "Content-Type" = "application/json" }
$userHeaders  = @{ Authorization = "Bearer $UserToken" }

function Show-Status($label, $status) {
    Write-Host ("{0,-38} {1}" -f $label, $status)
}

# Step 1: token works before suspension
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/me" -Headers $userHeaders -Method Get | Out-Null
    Show-Status "Before suspend /me:" "200 OK"
} catch {
    Show-Status "Before suspend /me:" $_.Exception.Response.StatusCode.value__
    Write-Host "Token thik nei. Login ar token abar newa."
    exit 1
}

# Step 2: suspend the user through admin API
$body = @{ status = "SUSPENDED" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/admin/users/$UserId/status" -Headers $adminHeaders -Method Patch -Body $body | Out-Null
    Show-Status "Suspend request:" "OK"
} catch {
    Show-Status "Suspend request:" $_.Exception.Response.StatusCode.value__
    exit 1
}

# Step 3: old token must now be rejected
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/me" -Headers $userHeaders -Method Get | Out-Null
    Show-Status "After suspend /me:" "200 OK  (FAIL: token still works)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Show-Status "After suspend /me:" "401  (PASS)"
    } else {
        Show-Status "After suspend /me:" "$code  (check)"
    }
}

# Step 4: restore the user so the account is usable again
$restore = @{ status = "ACTIVE" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/admin/users/$UserId/status" -Headers $adminHeaders -Method Patch -Body $restore | Out-Null
    Show-Status "Restore request:" "OK"
} catch {
    Show-Status "Restore request:" $_.Exception.Response.StatusCode.value__
}