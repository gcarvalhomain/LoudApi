$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$index = Get-Content -Raw (Join-Path $root "frontend\index.html")
$styles = Get-Content -Raw (Join-Path $root "frontend\visual\styles\velotv-events.css")

$requiredHtml = @(
  'id="about"',
  'class="home-about-scroll"',
  'Founded by Gabriel Carvalho',
  'Established in 2022',
  'Purpose',
  'Project context',
  'CS2 ecosystem',
  'Valve',
  'ESL',
  'BLAST',
  'HLTV',
  '/visual/styles/velotv-events.css?v=home-about-scroll-1',
  '/visual/scripts/home-about-scroll.js?v=home-about-scroll-1'
)

foreach ($pattern in $requiredHtml) {
  if (-not $index.Contains($pattern)) {
    throw "Missing ABOUT HTML pattern: $pattern"
  }
}

$heroIndex = $index.IndexOf('class="hero"')
$aboutIndex = $index.IndexOf('class="home-about-scroll"')
$hubIndex = $index.IndexOf('class="hub-grid home-hub"')

if (-not ($heroIndex -lt $aboutIndex -and $aboutIndex -lt $hubIndex)) {
  throw "ABOUT must be placed between the hero and the three-card hub."
}

$requiredCss = @(
  '.home-about-scroll',
  '.home-about-stage',
  '.home-about-panel',
  '.home-about-scroll.is-scroll-enhanced .home-about-reveal',
  '@media (prefers-reduced-motion: reduce)'
)

foreach ($pattern in $requiredCss) {
  if (-not $styles.Contains($pattern)) {
    throw "Missing ABOUT CSS pattern: $pattern"
  }
}

if ($styles -notmatch '(?s)\.home-about-scroll\s*\{[^}]*height:\s*auto;') {
  throw "ABOUT must use normal document height before JavaScript enhancement."
}

if ($styles -notmatch '(?s)\.home-about-scroll\.is-scroll-enhanced\s*\{[^}]*height:\s*320vh;') {
  throw "ABOUT enhanced mode must provide the desktop scroll runway."
}

if ($styles -notmatch '(?s)\.home-about-scroll\.is-scroll-enhanced\s+\.home-about-stage\s*\{[^}]*position:\s*sticky;') {
  throw "ABOUT sticky positioning must be limited to enhanced mode."
}

Write-Host "Home ABOUT structure and styling are present."
