@echo off
title Create Desktop Shortcut - Instagram Messaging Dashboard
color 0B
cls

echo ======================================================================
echo       CREATING DESKTOP SHORTCUT - INSTAGRAM DASHBOARD
echo ======================================================================
echo.

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'Instagram Messaging Dashboard.lnk')); $s.TargetPath = '%~dp0Start-App.bat'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 1; $s.Description = 'Launch Instagram Messaging Dashboard'; $s.IconLocation = 'shell32.dll,14'; $s.Save()"

if %errorlevel% equ 0 (
    echo [SUCCESS] Desktop shortcut "Instagram Messaging Dashboard" created on your Desktop!
    echo.
    echo You can now open your desktop and double-click "Instagram Messaging Dashboard"
    echo to start the server and open the app directly.
) else (
    echo [ERROR] Could not create desktop shortcut automatically.
)

echo.
echo ======================================================================
pause
