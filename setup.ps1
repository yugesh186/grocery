Write-Host "=============================================" -ForegroundColor Green
Write-Host "Setting up FreshKart AI..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 1. Setup Python Virtual Environment
Write-Host "`n[1/3] Setting up Python virtual environment..." -ForegroundColor Cyan
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Virtual environment created." -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists." -ForegroundColor Yellow
}

# Activate and install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
& .\venv\Scripts\pip install -r backend/requirements.txt

# 2. Setup Node.js frontend dependencies
Write-Host "`n[2/3] Installing frontend dependencies..." -ForegroundColor Cyan
if (Test-Path "frontend") {
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "Frontend packages installed successfully." -ForegroundColor Green
} else {
    Write-Host "Error: frontend folder not found!" -ForegroundColor Red
}

# 3. Create run instructions
Write-Host "`n[3/3] Done! FreshKart AI is ready." -ForegroundColor Green
Write-Host "`nTo start the FastAPI backend:" -ForegroundColor Cyan
Write-Host "  .\venv\Scripts\python -m backend.main"
Write-Host "`nTo start the React frontend:" -ForegroundColor Cyan
Write-Host "  cd frontend"
Write-Host "  npm run dev"
Write-Host "=============================================" -ForegroundColor Green
