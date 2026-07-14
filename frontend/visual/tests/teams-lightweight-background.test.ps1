$ErrorActionPreference = "Stop"

$cssPath = Join-Path $PSScriptRoot "..\styles\velotv-events.css"
$css = Get-Content -Raw $cssPath

function Get-CssBlock([string]$SelectorPattern) {
  $match = [regex]::Match($css, "(?s)$SelectorPattern\s*\{(?<body>.*?)\}")
  if (-not $match.Success) {
    throw "Missing CSS block matching: $SelectorPattern"
  }

  return $match.Groups["body"].Value
}

$pageBlock = Get-CssBlock '\.teams-page'
$heroBlock = Get-CssBlock '\.teams-hero'
$teamsBlock = Get-CssBlock '\.teams-page\s*>\s*\.surface:first-of-type'
$rankingBlock = Get-CssBlock '\.teams-page\s*>\s*\.surface:nth-of-type\(2\)'

foreach ($entry in @{
  'teams page' = $pageBlock
  'team section' = $teamsBlock
  'ranking section' = $rankingBlock
}.GetEnumerator()) {
  if ($entry.Value -match '(?i)\bfixed\b') {
    throw "$($entry.Key) must not use a fixed background."
  }

  if ($entry.Value -match 'var\(--teams-hero-image\)') {
    throw "$($entry.Key) must not duplicate the hero image."
  }
}

if ($pageBlock -notmatch 'background:\s*var\(--black\)') {
  throw 'Teams page must use a solid fallback background.'
}

if ($heroBlock -notmatch 'var\(--teams-hero-image\)') {
  throw 'Teams hero must retain the team image.'
}

if ($teamsBlock -notmatch 'linear-gradient') {
  throw 'Team section must use a static gradient.'
}

if ($rankingBlock -notmatch 'linear-gradient') {
  throw 'Ranking section must use a static gradient.'
}

Write-Output 'Teams lightweight background checks passed.'
