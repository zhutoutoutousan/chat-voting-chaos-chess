# Vercel Deployment Guide for Turborepo Monorepo

## Overview

This project uses Turborepo with a monorepo structure. Vercel needs to be configured to:
1. Deploy the Next.js frontend from `apps/frontend`
2. Understand the monorepo structure
3. Build dependencies correctly

## Vercel Configuration

### Option 1: Root vercel.json (Recommended)

The root `vercel.json` tells Vercel to:
- Use `apps/frontend` as the root directory
- Install dependencies from the monorepo root
- Build the Next.js app

### Option 2: Vercel Dashboard Settings

In Vercel Dashboard → Project Settings:

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/frontend`
- Build Command: `cd ../.. && pnpm install && cd apps/frontend && pnpm build`
- Output Directory: `.next` (default)
- Install Command: `cd ../.. && pnpm install`

**Environment Variables:**
Set these in Vercel Dashboard:

```
# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Supabase (if using Supabase client)
NEXT_PUBLIC_SUPABASE_URL=https://nmxizbobvwzxbacyslyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Backend Deployment

**Important:** Nest.js backend cannot run on Vercel serverless functions. Deploy separately:

### Recommended: Railway
1. Connect GitHub repo
2. Set root directory to `apps/backend`
3. Set build command: `cd ../.. && pnpm install && cd apps/backend && pnpm build`
4. Set start command: `cd apps/backend && pnpm start:prod`

### Alternative: Render
Similar setup to Railway

## Database Setup

The database is on Supabase. You need to:

1. **Reset database** (run migrations):
   ```bash
   # Windows PowerShell
   .\scripts\reset-db.ps1
   
   # Or manually:
   cd packages/prisma
   pnpm migrate:reset --force
   pnpm generate
   pnpm seed
   ```

2. **Set DATABASE_URL** in backend environment:
   ```
   DATABASE_URL=postgres://postgres.nmxizbobvwzxbacyslyt:vSdkZ6625pUukVaF@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```

## Deployment Steps

1. **Push to GitHub** (if not already)
2. **Connect to Vercel:**
   - Import repository
   - Vercel should auto-detect Next.js
   - Set root directory to `apps/frontend`
3. **Set Environment Variables** in Vercel dashboard
4. **Deploy Backend** separately (Railway/Render)
5. **Update Frontend env vars** with backend URL
6. **Redeploy frontend**

## Turborepo with Vercel

Vercel supports Turborepo natively:
- Detects `turbo.json` automatically
- Caches builds between deployments
- Handles workspace dependencies

## Troubleshooting

### Build Fails: "Cannot find module"
- Ensure `package.json` has correct workspace configuration
- Check that `pnpm install` runs from root

### Build Fails: "Prisma Client not generated"
- Add build step: `cd packages/prisma && pnpm generate`
- Or add to `package.json` scripts

### WebSocket Connection Fails
- Backend must be deployed separately
- Use `wss://` for production WebSocket URL
- Check CORS settings in backend
