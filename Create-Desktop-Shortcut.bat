@echo off
title Create Desktop Shortcut - Instagram Focus
color 0B
cls

echo ======================================================================
echo       CREATING DESKTOP SHORTCUT - INSTAGRAM FOCUS
echo ======================================================================
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\create-shortcuts.ps1"

if %errorlevel% equ 0 (
    echo [SUCCESS] Native Desktop shortcut created!
    echo.
    echo Double-clicking "Instagram Focus" will open directly as a native
    echo desktop app without opening any terminal or command prompt window.
) else (
    echo [ERROR] Could not create desktop shortcut automatically.
)

echo.
echo ======================================================================
pause
