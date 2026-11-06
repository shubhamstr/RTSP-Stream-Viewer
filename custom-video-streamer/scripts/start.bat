@echo off
REM ============================================================
REM start.bat – Bring up the custom RTSP video streamer (Windows)
REM ============================================================

cd /d "%~dp0.."

echo [*] Starting Custom RTSP Video Streamer...

echo [*] Pulling Docker images...
docker compose pull

echo [*] Starting services...
docker compose up -d

echo.
echo [OK] All services are up!
echo.
echo ===================================================
echo   RTSP Streams (authenticated with viewer:viewer_password_123)
echo ===================================================
echo   Big Buck Bunny  : rtsp://viewer:viewer_password_123@localhost:8554/bbb
echo   Elephants Dream : rtsp://viewer:viewer_password_123@localhost:8554/elephants
echo   Tears of Steel  : rtsp://viewer:viewer_password_123@localhost:8554/tears
echo.
echo ===================================================
echo   HLS Streams (browser-friendly)
echo ===================================================
echo   http://localhost:8888/bbb/index.m3u8
echo   http://localhost:8888/elephants/index.m3u8
echo   http://localhost:8888/tears/index.m3u8
echo.
echo ===================================================
echo   MediaMTX REST API
echo ===================================================
echo   http://localhost:9997/v3/paths/list
echo.
echo Run scripts\stop.bat to tear down.
pause

