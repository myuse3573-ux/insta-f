@echo off
title Instagram Messaging Dashboard App Launcher
color 0A
cls

echo ======================================================================
echo           INSTAGRAM MESSAGING DASHBOARD - DESKTOP APP
echo ======================================================================
echo.
echo Launching standalone desktop application window...
echo Please wait a moment while the app initializes...
echo.

cd /d "%~dp0"

:: Launch as a native Electron desktop window
npx electron .

if %errorlevel% neq 0 (
    echo.
    echo Launching Desktop App Window...
    where msedge >nul 2>nul
    if %errorlevel% equ 0 (
        start msedge --app=http://localhost:3000 --name="Instagram Messaging Dashboard"
    ) else (
        start chrome --app=http://localhost:3000
    )
    npm run dev
)
