# Reset database script for PowerShell
Write-Host "🔄 Resetting database..." -ForegroundColor Cyan

Set-Location packages/prisma

# Load environment variables from .env if exists
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
}

# Reset database (drops all data and runs migrations)
Write-Host "📦 Running migrations reset..." -ForegroundColor Yellow
pnpm migrate:reset

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Yellow
pnpm generate

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
pnpm seed

Write-Host "✅ Database reset complete!" -ForegroundColor Green
