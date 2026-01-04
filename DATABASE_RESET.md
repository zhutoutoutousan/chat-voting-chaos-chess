# Database Reset Instructions

## Quick Reset (Windows PowerShell)

1. **Navigate to prisma package:**
   ```powershell
   cd packages/prisma
   ```

2. **Create .env file** (if not exists) with your Supabase connection:
   ```
   DATABASE_URL="postgres://postgres.nmxizbobvwzxbacyslyt:vSdkZ6625pUukVaF@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```

3. **Run reset script:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File reset-db.ps1
   ```

   Or manually:
   ```powershell
   # Reset database (WARNING: Deletes all data!)
   pnpm prisma migrate reset --force
   
   # Generate Prisma client
   pnpm prisma generate
   
   # Deploy migrations
   pnpm prisma migrate deploy
   
   # Seed database
   pnpm seed
   ```

## First Time Setup

If this is the first time setting up:

```powershell
cd packages/prisma
powershell -ExecutionPolicy Bypass -File setup-db.ps1
```

Or manually:
```powershell
# Generate Prisma client
pnpm prisma generate

# Create and apply migrations
pnpm prisma migrate dev --name init

# Seed database
pnpm seed
```

## Vercel Deployment Configuration

### Frontend (Vercel)

**Root Directory:** `apps/frontend`

**Build Command:**
```bash
cd ../.. && pnpm install && cd apps/frontend && pnpm build
```

**Install Command:**
```bash
cd ../.. && pnpm install
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_SUPABASE_URL=https://nmxizbobvwzxbacyslyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend (Railway/Render)

**Root Directory:** `apps/backend`

**Build Command:**
```bash
cd ../.. && pnpm install && cd apps/backend && pnpm build
```

**Start Command:**
```bash
cd apps/backend && pnpm start:prod
```

**Environment Variables:**
```
DATABASE_URL=postgres://postgres.nmxizbobvwzxbacyslyt:vSdkZ6625pUukVaF@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=3001
```

## Notes

- **Database URL**: Use the non-pooling connection (`:5432`) for migrations
- **Prisma Client**: Must be generated before building backend
- **Migrations**: Run `migrate deploy` in production, not `migrate dev`
- **WebSocket**: Backend must be deployed separately (Vercel doesn't support WebSocket)
