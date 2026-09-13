$regPaths = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
)

Write-Host "=== SEARCHING ALL REGISTRY UNINSTALL ENTRIES ==="

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Get-ChildItem $regPath -ErrorAction SilentlyContinue | ForEach-Object {
            $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
            $dn = $props.DisplayName
            if ($dn -like '*Elvan*' -or $dn -like '*Nammil*' -or $dn -like '*elvan*' -or $dn -like '*nammil*') {
                Write-Host "FOUND: [$dn] at $($_.PSPath)"
                Write-Host "  Removing..."
                Remove-Item $_.PSPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  DONE"
            }
        }
    }
}

Write-Host ""
Write-Host "=== VERIFICATION - checking if any remain ==="

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Get-ChildItem $regPath -ErrorAction SilentlyContinue | ForEach-Object {
            $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
            $dn = $props.DisplayName
            if ($dn -like '*Elvan*' -or $dn -like '*Nammil*') {
                Write-Host "STILL EXISTS: [$dn] at $($_.PSPath)"
            }
        }
    }
}

Write-Host ""
Write-Host "=== COMPLETE ==="
