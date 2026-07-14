$indexPath = Join-Path $PSScriptRoot "..\index.html"
$html = Get-Content -Raw $indexPath

$requiredPatterns = @(
  'class="teams-intro-transition"',
  'class="teams-intro-stage"',
  'class="hero teams-hero"',
  'class="hub-grid home-hub teams-overview"',
  'const introTransition = document.querySelector(".teams-intro-transition");',
  'window.matchMedia("(prefers-reduced-motion: reduce)").matches',
  'requestAnimationFrame(updateIntroTransition)',
  '"--hero-transition-blur"',
  '"--teams-overview-feather"'
)

foreach ($pattern in $requiredPatterns) {
  if (-not $html.Contains($pattern)) {
    throw "Missing home scroll-transition pattern: $pattern"
  }
}

Write-Host "Home scroll transition structure is present."
