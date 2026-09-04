$ws = New-Object -ComObject WScript.Shell
$rootFolder = (Get-Item $PSScriptRoot).Parent.FullName
$electronExe = Join-Path $rootFolder "node_modules\electron\dist\electron.exe"
$iconPath = Join-Path $rootFolder "electron\icon.ico"

# 1. Desktop shortcut
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$desktopShortcutPath = Join-Path $desktopPath "Instagram Focus.lnk"

$s = $ws.CreateShortcut($desktopShortcutPath)
$s.TargetPath = $electronExe
$s.Arguments = "."
$s.WorkingDirectory = $rootFolder
$s.Description = "Instagram Focus - Stories and Messages Only (Reels Blocked)"
if (Test-Path $iconPath) {
    $s.IconLocation = "$iconPath,0"
}
$s.Save()

# 2. Local folder shortcut (so user can double click right inside the project folder)
$localShortcutPath = Join-Path $rootFolder "Instagram Focus.lnk"
$s2 = $ws.CreateShortcut($localShortcutPath)
$s2.TargetPath = $electronExe
$s2.Arguments = "."
$s2.WorkingDirectory = $rootFolder
$s2.Description = "Instagram Focus - Stories and Messages Only (Reels Blocked)"
if (Test-Path $iconPath) {
    $s2.IconLocation = "$iconPath,0"
}
$s2.Save()

Write-Output "Shortcuts created successfully: Desktop ($desktopShortcutPath) and Local ($localShortcutPath)"
