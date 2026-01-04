# Setup database script for PowerShell (first time setup)
Write-Host "🔄 Setting up database..." -ForegroundColor Cyan

Set-Location packages/prisma

# Load environment variables from .env if exists
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
}

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Yellow
pnpm generate

# Deploy migrations
Write-Host "📦 Deploying migrations..." -ForegroundColor Yellow
pnpm migrate:deploy

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
pnpm seed

Write-Host "✅ Database setup complete!" -ForegroundColor Green
