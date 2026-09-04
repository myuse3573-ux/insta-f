@echo off
cd /d "%~dp0"

:: If electron.exe exists, launch directly in GUI mode and close this terminal instantly
if exist "%~dp0node_modules\electron\dist\electron.exe" (
    start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0."
    exit /b 0
)

:: Otherwise launch via silent wscript launcher
if exist "%~dp0Launch-App.vbs" (
    wscript "%~dp0Launch-App.vbs"
    exit /b 0
)

:: Fallback
start "" npx electron .
exit /b 0
