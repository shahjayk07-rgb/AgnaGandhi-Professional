@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8000
  py -m http.server 8000
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    start "" http://127.0.0.1:8000
    python -m http.server 8000
  ) else (
    echo Python was not found. Install Python 3, then run this file again.
    pause
  )
)
