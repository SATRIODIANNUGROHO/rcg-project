@echo off
title Build Executable (.EXE) - PT. Reka Cipta Garam
echo ===================================================
echo  PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM
echo  Building Windows Executable (.EXE)...
echo Terminating any active application instances...
taskkill /F /IM "RCG Salt Weighing System.exe" /T >nul 2>&1
taskkill /F /IM "RCG Salt Weighing System 8.0.0.exe" /T >nul 2>&1
taskkill /F /IM "electron.exe" /T >nul 2>&1

call npm install
call npm run dist
echo.
echo ===================================================
echo  Build complete! Output saved to 'dist/' folder.
echo ===================================================
pause
