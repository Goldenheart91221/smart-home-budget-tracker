@echo off
title HomeLedger Pro - GitHub Push Helper
color 0A
cls
echo ======================================================================
echo          HomeLedger Pro - Easy GitHub Upload Helper
echo ======================================================================
echo.
echo  Pehle GitHub.com par jakar ek New Repository banayein:
echo  1. Browser me open karein: https://github.com/new
echo  2. Repository name likhein: smart-home-budget-tracker
echo  3. "Create repository" button par click karein
echo  4. Wahan se apni repository ka URL copy karein
echo.
echo ======================================================================
echo.
set /p REPO_URL="Apna GitHub Repo URL yahan paste karein: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] URL khali nahi ho sakta! Please dobara try karein.
    echo.
    pause
    exit /b
)

echo.
echo Connecting to repository: %REPO_URL% ...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Uploading files to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   [SUCCESS] Badhai ho! Aapka project GitHub par upload ho gaya!
    echo ======================================================================
    echo.
    echo  Ab Render.com par jayein:
    echo  1. https://dashboard.render.com/ par jayein
    echo  2. "New +" button par click karein -> "Static Site" chunein
    echo  3. "smart-home-budget-tracker" repository select karein
    echo  4. "Create Static Site" button daba dein
    echo.
) else (
    echo.
    echo [ERROR] Upload me issue aayi. Kripya apna URL aur GitHub login check karein.
)

echo.
pause
