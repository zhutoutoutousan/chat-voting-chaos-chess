# Database Reset Script for Windows PowerShell
# This will drop all tables and recreate them with migrations

Write-Host "🔄 Resetting database..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env with DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Load DATABASE_URL from .env
$envContent = Get-Content .env
foreach ($line in $envContent) {
    if ($line -match '^DATABASE_URL=(.+)$') {
        $env:DATABASE_URL = $matches[1]
        break
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not found in .env!" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Resetting database (this will DELETE ALL DATA)..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel, or wait 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Reset database
Write-Host "🔄 Running prisma migrate reset..." -ForegroundColor Cyan
pnpm prisma migrate reset --force --skip-seed

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Cyan
pnpm prisma generate

# Deploy migrations
Write-Host "📦 Deploying migrations..." -ForegroundColor Cyan
pnpm prisma migrate deploy

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
pnpm seed

Write-Host "✅ Database reset complete!" -ForegroundColor Green
