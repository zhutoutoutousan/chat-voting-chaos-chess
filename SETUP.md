# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Get your database connection string
3. Create `packages/prisma/.env`:
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

### 3. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed database
cd packages/prisma && pnpm seed
```

### 4. Configure Backend

Create `apps/backend/.env`:
```
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="your-secret-key-change-this"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### 5. Configure Frontend

Create `apps/frontend/.env.local`:
```
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-same-as-backend"
```

### 6. Start Development Servers

```bash
# Start all apps
pnpm dev

# Or start individually:
# Terminal 1: Backend
cd apps/backend && pnpm dev

# Terminal 2: Frontend
cd apps/frontend && pnpm dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Backend Health: http://localhost:3001/api/v1/health

## First Steps

1. Register a new account at http://localhost:3000/register
2. Login at http://localhost:3000/login
3. Create a new game or browse existing games
4. Start playing!

## Troubleshooting

### Database Connection Issues
- Verify your Supabase connection string
- Check if your Supabase project is active
- Ensure database is accessible

### WebSocket Connection Issues
- Verify `NEXT_PUBLIC_WS_URL` matches backend URL
- Check CORS settings in backend
- Ensure backend is running

### Build Issues
- Run `pnpm db:generate` first
- Clear `.next` and `dist` folders
- Reinstall dependencies: `pnpm install`
