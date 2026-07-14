$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Read-ProjectFile([string]$relativePath) {
  Get-Content -Raw -LiteralPath (Join-Path $root $relativePath)
}

function Assert-Contains([string]$content, [string]$expected, [string]$message) {
  if (-not $content.Contains($expected)) { throw $message }
}

$css = Read-ProjectFile "frontend/visual/styles/velotv-events.css"
$homeHtml = Read-ProjectFile "frontend/index.html"
$teams = Read-ProjectFile "frontend/teams.html"
$market = Read-ProjectFile "frontend/market.html"
$tournament = Read-ProjectFile "frontend/tournament.html"

Assert-Contains $css ".brand-content-block" "Shared branded block styles are missing."
Assert-Contains $homeHtml 'class="brand-content-block home-hub-shell"' "HOME card shell is missing."
Assert-Contains $teams 'surface teams-overview brand-content-block' "Teams overview is not branded."
Assert-Contains $teams 'surface player-ranking-section brand-content-block' "Teams rankings are not branded."
Assert-Contains $market 'surface market-section brand-content-block' "Market grid is not branded."
Assert-Contains $market 'feature-panel brand-content-block' "Market feature panel is not branded."
Assert-Contains $tournament 'feature-panel brand-content-block' "Tournament feature panels are not branded."
Assert-Contains $tournament 'surface brand-content-block' "Tournament facts are not branded."

Write-Output "Branded content blocks are present on all frontend pages."
