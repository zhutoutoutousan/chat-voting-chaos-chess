# Deployment Guide

## Prerequisites

1. **Supabase Account**: Create a Supabase project
2. **Vercel Account**: For frontend deployment
3. **Backend Hosting**: Railway, Render, or similar for Nest.js backend
4. **Environment Variables**: Set up all required variables

## Step 1: Supabase Setup

1. Create a new Supabase project
2. Go to Settings → Database
3. Copy the connection string
4. Update `packages/prisma/.env`:
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

5. Run migrations:
   ```bash
   cd packages/prisma
   pnpm migrate:deploy
   pnpm generate
   ```

6. (Optional) Seed database:
   ```bash
   pnpm seed
   ```

## Step 2: Backend Deployment

### Option A: Railway

1. Connect your GitHub repository
2. Select the `apps/backend` directory
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `PORT` (optional, defaults to 3001)

4. Deploy

### Option B: Render

1. Create a new Web Service
2. Connect repository
3. Set build command: `cd apps/backend && pnpm install && pnpm build`
4. Set start command: `cd apps/backend && pnpm start:prod`
5. Set environment variables

## Step 3: Frontend Deployment (Vercel)

1. Import your GitHub repository to Vercel
2. Set root directory to `apps/frontend`
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend URL
   - `NEXT_PUBLIC_WS_URL` - Your WebSocket URL (same as backend)
   - `NEXTAUTH_URL` - Your frontend URL
   - `NEXTAUTH_SECRET` - Generate a secure secret

4. Deploy

## Step 4: WebSocket Configuration

If using Vercel for frontend, WebSocket connections may need:
- Separate WebSocket server (Railway/Render)
- Or use a WebSocket service (Pusher, Ably)

Update `NEXT_PUBLIC_WS_URL` accordingly.

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

## Post-Deployment

1. Verify database connection
2. Test authentication
3. Test game creation
4. Test WebSocket connections
5. Monitor logs for errors
