@echo off
cd /d "%~dp0"
echo Yojeumpick local preview. Open http://127.0.0.1:5173
node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 5173
pause
