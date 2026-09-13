# Run as Administrator - Remove ALL Nammil registry ghost entries

$regPaths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall"
)

$removed = 0

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Get-ChildItem $regPath -ErrorAction SilentlyContinue | ForEach-Object {
            $displayName = (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DisplayName
            if ($displayName -like '*Elvan*' -or $displayName -like '*Nammil*' -or $displayName -like '*elvan*' -or $displayName -like '*nammil*') {
                Write-Host "Removing registry entry: $displayName at $($_.PSPath)"
                Remove-Item $_.PSPath -Recurse -Force -ErrorAction SilentlyContinue
                $removed++
            }
        }
    }
}

# Also kill any leftover install directories
$dirsToKill = @(
    "C:\Program Files\Nammil",
    "C:\Program Files\Nammil Pro",
    "C:\Program Files (x86)\Nammil",
    "C:\Program Files (x86)\Nammil Pro",
    "$env:LOCALAPPDATA\Programs\Nammil",
    "$env:LOCALAPPDATA\Programs\Nammil Pro",
    "$env:LOCALAPPDATA\Programs\nammil",
    "$env:LOCALAPPDATA\Programs\nammil-pro",
    "$env:APPDATA\Nammil",
    "$env:APPDATA\Nammil Pro",
    "$env:APPDATA\nammil",
    "$env:APPDATA\nammil-pro"
)

foreach ($d in $dirsToKill) {
    if (Test-Path $d) {
        Write-Host "Deleting directory: $d"
        Remove-Item -Recurse -Force $d -ErrorAction SilentlyContinue
    }
}

# Remove Start Menu shortcuts
$startMenuPaths = @(
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs",
    "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs"
)
foreach ($sm in $startMenuPaths) {
    if (Test-Path $sm) {
        Get-ChildItem -Path $sm -Recurse -Include '*Elvan*','*Nammil*','*Electron*' -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "Deleting shortcut: $($_.FullName)"
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }
    }
}

# Remove Desktop shortcuts
Get-ChildItem "$env:USERPROFILE\Desktop" -Include '*Elvan*','*Nammil*' -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Deleting desktop shortcut: $($_.FullName)"
    Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
}

Write-Host "`nDone! Removed $removed registry entries. System is completely clean."
