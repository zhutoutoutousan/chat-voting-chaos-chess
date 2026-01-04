# Quick Start Guide

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Database

### Create Prisma .env
```bash
cd packages/prisma
```

Create `.env` file:
```
DATABASE_URL="postgres://postgres.nmxizbobvwzxbacyslyt:vSdkZ6625pUukVaF@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### Reset Database (WARNING: Deletes all data!)

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File reset-db.ps1

# Or from root:
pnpm db:reset
```

### Or Setup Fresh Database

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File setup-db.ps1
```

## 3. Configure Backend

Create `apps/backend/.env`:
```
DATABASE_URL="postgres://postgres.nmxizbobvwzxbacyslyt:vSdkZ6625pUukVaF@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="your-secret-key-change-this"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

## 4. Configure Frontend

Create `apps/frontend/.env.local`:
```
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-same-as-backend"
```

## 5. Start Development

```bash
# Start both frontend and backend
pnpm dev

# Or individually:
# Terminal 1 - Backend
cd apps/backend && pnpm dev

# Terminal 2 - Frontend
cd apps/frontend && pnpm dev
```

## 6. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Health Check: http://localhost:3001/api/v1/health

## Vercel Deployment

See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

**Quick Vercel Setup:**
1. Push to GitHub
2. Import to Vercel
3. Set root directory: `apps/frontend`
4. Set build command: `cd ../.. && pnpm install && cd apps/frontend && pnpm build`
5. Add environment variables
6. Deploy!

**Backend:** Deploy separately on Railway or Render (see `DEPLOYMENT.md`)
