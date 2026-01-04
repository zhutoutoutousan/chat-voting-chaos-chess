#!/bin/bash

# Reset database script
echo "🔄 Resetting database..."

cd packages/prisma

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Reset database (drops all data and runs migrations)
echo "📦 Running migrations reset..."
pnpm migrate:reset

# Generate Prisma client
echo "🔨 Generating Prisma client..."
pnpm generate

# Seed database
echo "🌱 Seeding database..."
pnpm seed

echo "✅ Database reset complete!"
