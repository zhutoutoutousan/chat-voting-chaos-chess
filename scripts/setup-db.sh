#!/bin/bash

# Setup database script (first time setup)
echo "🔄 Setting up database..."

cd packages/prisma

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
pnpm generate

# Deploy migrations
echo "📦 Deploying migrations..."
pnpm migrate:deploy

# Seed database
echo "🌱 Seeding database..."
pnpm seed

echo "✅ Database setup complete!"
