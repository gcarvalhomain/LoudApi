$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root "index.html"
$cssPath = Join-Path $root "visual/styles/velotv-events.css"

$index = Get-Content -LiteralPath $indexPath -Raw -ErrorAction Stop
$css = Get-Content -LiteralPath $cssPath -Raw -ErrorAction Stop

function Assert-Contains($Text, $Expected, $Message) {
    if (-not $Text.Contains($Expected)) {
        throw $Message
    }
}

function Assert-NotContains($Text, $Unexpected, $Message) {
    if ($Text.Contains($Unexpected)) {
        throw $Message
    }
}

Assert-Contains $index 'class="hero-title velo-assembly"' "Home title should expose the VELO assembly animation classes."
Assert-Contains $index 'class="velo-part velo-part-left"' "Home title should group VE as the left incoming part."
Assert-Contains $index 'class="velo-part velo-part-right"' "Home title should group LO as the right incoming part."
Assert-Contains $index 'class="velo-letter velo-letter-v"' "Home title should identify the V for the final floating state."

Assert-Contains $css '@keyframes veloPartLeftJoin' "CSS should animate VE from the left edge."
Assert-Contains $css '@keyframes veloPartRightJoin' "CSS should animate LO from the right edge."
Assert-Contains $css '@keyframes veloWordSpin' "CSS should spin the assembled VELO word."
Assert-Contains $css '@keyframes veloFinalFloat' "CSS should keep the final V floating."
Assert-Contains $css '@keyframes veloSoftMetalSheen' "CSS should add a subtle white-metal sheen to the V."
Assert-Contains $css '@keyframes veloFinalSettle' "CSS should ease the V from the edited pixel position into the floating position."
Assert-NotContains $css 'font-size: 2.3em' "Final V animation should avoid font-size changes because they cause layout jumps."
Assert-Contains $css 'kWK9TBlOzmlh9mEMfBsVU_' "Favorite team card should use the requested HLTV image."
Assert-NotContains $css '1-comandos-cs2.webp' "Favorite team card should not use the old background image."
Assert-NotContains $css '#1d74d8' "Scene signal should not use the old blue background."
Assert-Contains $css 'linear-gradient(145deg, var(--white), var(--bronze))' "Scene signal should use the same white-to-bronze treatment as the V mark."
Assert-Contains $index 'Contact' "Home page footer information should include contact details."
Assert-Contains $index 'All rights reserved' "Home page footer information should include rights text."
