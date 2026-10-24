@echo off
echo ============================================================
echo   Sankar Group - AI Voice Sales Bot
echo   Starting FastAPI Server on http://localhost:8000
echo ============================================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 is not found. Please install Python.
    pause
    exit /b 1
)

REM Build client if dist folder does not exist
if not exist "client\dist" (
    echo [INFO] Building React client assets...
    cd client
    call npm run build
    cd ..
)

echo [INFO] Launching server...
echo Open your browser at: http://localhost:8000
echo ============================================================

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
