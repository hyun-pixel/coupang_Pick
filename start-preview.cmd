@echo off
cd /d "%~dp0"
echo Yojeumpick local preview. This does not publish the site.
echo Open http://127.0.0.1:5173 after the Local URL appears below.
node scripts/run-framework.mjs dev --host 127.0.0.1 --port 5173 --strictPort
pause
