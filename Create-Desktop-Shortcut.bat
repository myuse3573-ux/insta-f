@echo off
title Create Desktop Shortcut - Instagram Focus
color 0B
cls

echo ======================================================================
echo       CREATING DESKTOP SHORTCUT - INSTAGRAM FOCUS
echo ======================================================================
echo.

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'Instagram Focus.lnk')); $s.TargetPath = '%~dp0Start-App.bat'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 1; $s.Description = 'Instagram Focus - Stories and Messages Only (Reels Blocked)'; $s.IconLocation = 'shell32.dll,14'; $s.Save()"

if %errorlevel% equ 0 (
    echo [SUCCESS] Desktop shortcut "Instagram Focus" created on your Desktop!
    echo.
    echo You can now open your desktop and double-click "Instagram Focus"
    echo to open Instagram with only Stories and Messages enabled.
) else (
    echo [ERROR] Could not create desktop shortcut automatically.
)

echo.
echo ======================================================================
pause
