# Database Setup Script for Windows PowerShell
# First time setup - creates migrations and seeds

Write-Host "🔄 Setting up database..." -ForegroundColor Cyan

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

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Cyan
pnpm prisma generate

# Create initial migration (if needed)
if (-not (Test-Path "migrations")) {
    Write-Host "📦 Creating initial migration..." -ForegroundColor Cyan
    pnpm prisma migrate dev --name init
} else {
    # Deploy existing migrations
    Write-Host "📦 Deploying migrations..." -ForegroundColor Cyan
    pnpm prisma migrate deploy
}

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
pnpm seed

Write-Host "✅ Database setup complete!" -ForegroundColor Green
