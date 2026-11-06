@echo off
REM ============================================================
REM stop.bat – Tear down the custom RTSP video streamer (Windows)
REM ============================================================

cd /d "%~dp0.."

echo [*] Stopping Custom RTSP Video Streamer...
docker compose down

echo [OK] All services stopped.
pause

