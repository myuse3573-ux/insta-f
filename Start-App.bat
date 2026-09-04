@echo off
title Instagram Focus - Stories & Messages Only
color 0A
cls

echo ======================================================================
echo             INSTAGRAM FOCUS - STORIES & MESSAGES ONLY
echo ======================================================================
echo.
echo Launching distraction-free Instagram desktop window...
echo Reels, Explore, and infinite feeds are permanently blocked!
echo.

cd /d "%~dp0"

:: Launch standalone Electron desktop app
npx electron .

if %errorlevel% neq 0 (
    echo.
    echo [NOTE] Trying direct npm start...
    npm run app
)
