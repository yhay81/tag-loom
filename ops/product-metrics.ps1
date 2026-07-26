[CmdletBinding()]
param(
    [switch]$Local
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SqlPath = Join-Path $PSScriptRoot "product-metrics.sql"
$Wrangler = Join-Path $RepoRoot "node_modules\.bin\wrangler.cmd"
$Target = if ($Local) { "--local" } else { "--remote" }
$Sql = (Get-Content $SqlPath) -join " "

$Output = & $Wrangler d1 execute tag-loom $Target --json --command $Sql
if ($LASTEXITCODE -ne 0) {
    throw "D1 metrics query failed with exit code $LASTEXITCODE"
}

$Payload = ($Output -join [Environment]::NewLine) | ConvertFrom-Json
$Row = $Payload[0].results[0]
if (-not $Row) {
    throw "D1 metrics query returned no result"
}

function Get-Percent {
    param(
        [int]$Numerator,
        [int]$Denominator
    )

    if ($Denominator -eq 0) { return 0.0 }
    return [Math]::Round(($Numerator / $Denominator) * 100, 1)
}

$Users = [int]$Row.users
$Configured = [int]$Row.configured
$Searched = [int]$Row.searched
$Saved = [int]$Row.saved
$Shared = [int]$Row.shared
$Exported = [int]$Row.exported
$Returned = [int]$Row.returned

[ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    service = "tag-loom"
    environment = if ($Local) { "local" } else { "production" }
    funnel = [ordered]@{
        users = $Users
        configured = $Configured
        searched = $Searched
        saved = $Saved
        shared = $Shared
        exported = $Exported
        returned = $Returned
        users_7d = [int]$Row.users_7d
        searches_7d = [int]$Row.searches_7d
    }
    rates = [ordered]@{
        configuration_percent = Get-Percent $Configured $Users
        search_percent = Get-Percent $Searched $Configured
        save_percent = Get-Percent $Saved $Searched
        share_percent = Get-Percent $Shared $Searched
        return_percent = Get-Percent $Returned $Searched
    }
} | ConvertTo-Json -Depth 4
