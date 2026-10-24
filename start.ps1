Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Sankar Group - AI Voice Sales Bot" -ForegroundColor Green
Write-Host "  Starting FastAPI Server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path "client/dist")) {
    Write-Host "[INFO] Building React client assets..." -ForegroundColor Yellow
    Push-Location client
    npm run build
    Pop-Location
}

Write-Host "[INFO] Launching server..." -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:8000" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
