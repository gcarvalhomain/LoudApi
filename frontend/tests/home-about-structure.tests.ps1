$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$index = Get-Content -Raw (Join-Path $root "frontend\index.html")
$styles = Get-Content -Raw (Join-Path $root "frontend\visual\styles\velotv-events.css")

$requiredHtml = @(
  'id="about"',
  'class="home-intro-transition"',
  'class="home-intro-stage"',
  'class="hero home-intro-hero"',
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
  '/visual/styles/velotv-events.css?v=branded-content-blocks-1',
  '/visual/scripts/home-about-scroll.js?v=home-hero-about-transition-1'
)

foreach ($pattern in $requiredHtml) {
  if (-not $index.Contains($pattern)) {
    throw "Missing ABOUT HTML pattern: $pattern"
  }
}

$introIndex = $index.IndexOf('class="home-intro-transition"')
$heroIndex = $index.IndexOf('class="hero home-intro-hero"')
$aboutIndex = $index.IndexOf('class="home-about-scroll"')
$introEndIndex = $index.IndexOf('<!-- /home-intro-transition -->')
$hubIndex = $index.IndexOf('class="hub-grid home-hub"')

if (-not ($introIndex -lt $heroIndex -and $heroIndex -lt $aboutIndex -and $aboutIndex -lt $introEndIndex -and $introEndIndex -lt $hubIndex)) {
  throw "The intro wrapper must contain hero and ABOUT, then release into the three-card hub."
}

if ($index.Contains('teams-intro-transition') -or $index.Contains('teams-intro-stage') -or $index.Contains('teams-hero')) {
  throw "The home transition must not reuse Teams-specific classes."
}

$requiredCss = @(
  '.home-about-scroll',
  '.home-about-stage',
  '.home-about-panel',
  '.home-about-scroll.is-scroll-enhanced .home-about-reveal',
  '.home-intro-transition',
  '.home-intro-transition.is-intro-enhanced .home-intro-stage',
  '.home-intro-transition.is-intro-enhanced .home-intro-hero',
  '.home-intro-transition.is-intro-enhanced .home-about-scroll',
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

if ($styles -notmatch '(?s)\.home-intro-stage\s*\{[^}]*position:\s*relative;') {
  throw "The intro stage must remain in normal flow before JavaScript enhancement."
}

if ($styles -notmatch '(?s)\.home-intro-transition\.is-intro-enhanced\s+\.home-intro-stage\s*\{[^}]*position:\s*sticky;') {
  throw "Sticky hero behavior must be limited to enhanced mode."
}

Write-Host "Home ABOUT structure and styling are present."
