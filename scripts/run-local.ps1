$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Iniciando Frontend Angular (AsistenciasUCO) " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\.."

if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Instalando dependencias de Node.js..." -ForegroundColor Yellow
    npm ci
}

Write-Host "[INFO] Ejecutando servidor de desarrollo Angular..." -ForegroundColor Green
npm start
