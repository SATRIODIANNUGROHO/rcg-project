@echo off
title Build Executable (.EXE) - PT. Reka Cipta Garam
echo ===================================================
echo  PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM
echo  Building Windows Executable (.EXE)...
echo ===================================================
call npm install
call npm run dist
echo.
echo ===================================================
echo  Build complete! Output saved to 'dist/' folder.
echo ===================================================
pause
