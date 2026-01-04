# Chat Voting Chaos Chess Platform

A comprehensive chess platform with interactive chat voting chaos mode, built with Next.js, Nest.js, Prisma, and Supabase.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, NextAuth.js
- **Backend**: Nest.js 10+, TypeScript, Socket.io
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js, JWT, OAuth (Google, GitHub, Discord - ready)
- **Payments**: Stripe (ready for integration)
- **Real-time**: WebSocket (Socket.io)
- **Chess Engine**: chess.js
- **Monorepo**: pnpm workspaces (frontend and backend are independent)

## Project Structure

```
chat-voting-chaos-chess/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # Nest.js application
├── packages/
│   ├── shared/            # Shared TypeScript types and utilities
│   ├── prisma/            # Prisma schema and migrations
│   └── ui/                # Shared UI components (placeholder)
├── spec/                  # Technical specification (LaTeX)
├── journal/               # Development journal (LaTeX)
└── snapshot/              # Project snapshot (LaTeX)
```

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Supabase account and database

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd chat-voting-chaos-chess
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create `packages/prisma/.env`:
   ```env
   DATABASE_URL="your-supabase-connection-string"
   ```

   Create `apps/backend/.env`:
   ```env
   DATABASE_URL="your-supabase-connection-string"
   JWT_SECRET="your-secret-key-change-this"
   FRONTEND_URL="http://localhost:3000"
   PORT=3001
   ```

   Create `apps/frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
   NEXT_PUBLIC_WS_URL="http://localhost:3001"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-same-as-backend"
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   pnpm db:generate

   # Run migrations
   pnpm db:migrate

   # (Optional) Seed database
   cd packages/prisma && pnpm seed
   ```

5. **Build packages (required before running apps):**
   ```bash
   # Build packages (Prisma client + shared package)
   pnpm build:packages
   ```

6. **Start development servers:**
   ```bash
   # Start frontend (automatically builds packages first)
   pnpm dev:frontend

   # Start backend (automatically builds packages first)
   pnpm dev:backend
   ```

## Available Scripts

### Development
- `pnpm dev:frontend` - Start frontend dev server (builds packages first)
- `pnpm dev:backend` - Start backend dev server (builds packages first)
- `pnpm build:packages` - Build shared packages (Prisma client + shared TypeScript)

### Building
- `pnpm build:frontend` - Build frontend for production (builds packages first)
- `pnpm build:backend` - Build backend for production (builds packages first)

### Database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations (dev)
- `pnpm db:migrate:deploy` - Deploy migrations (production)
- `pnpm db:reset` - Reset database (WARNING: deletes all data)
- `pnpm db:setup` - First-time database setup
- `pnpm db:studio` - Open Prisma Studio

### Utilities
- `pnpm format` - Format code with Prettier

## Database Management

### Reset Database

**Windows PowerShell:**
```powershell
cd packages/prisma
powershell -ExecutionPolicy Bypass -File reset-db.ps1
```

**Or from root:**
```bash
pnpm db:reset
```

### First Time Setup

```powershell
cd packages/prisma
powershell -ExecutionPolicy Bypass -File setup-db.ps1
```

## Deployment

### Frontend Deployment (Vercel)

1. **Go to Vercel Dashboard** → Add New Project
2. **Import your GitHub repository**
3. **Configure in Dashboard:**
   - **Root Directory**: Repository root (leave as default)
   - Framework will auto-detect Next.js from `apps/frontend`
   - **Build Command**: `cd apps/frontend && pnpm build` (or use the one in `vercel.json`)
4. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_WS_URL=https://your-backend.railway.app
   NEXTAUTH_URL=https://your-frontend.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. **Deploy!**

**Note**: The `vercel.json` automatically builds the frontend. The build command navigates to `apps/frontend` and runs `pnpm build`.

### Backend Deployment (Railway)

**Why Railway?** According to [Vercel's documentation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections), Vercel serverless functions don't support WebSocket connections. Railway is perfect for Nest.js with WebSocket support.

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** → Deploy from GitHub repo
3. **Select your repository**
4. **Configure Service:**
   - **Root Directory**: `apps/backend` (IMPORTANT: Set this in Railway Dashboard → Settings → Source)
   - **Build Command**: `cd ../.. && corepack enable && corepack prepare pnpm@8.15.0 --activate && pnpm install && pnpm db:generate && pnpm --filter @chaos-chess/backend build`
     - **Note**: Set this in Railway Dashboard → Settings → Deploy → Build Command
     - This overrides auto-detection and ensures pnpm is used
   - **Start Command**: `node dist/main.js`
     - Set in Railway Dashboard → Settings → Deploy → Start Command
5. **Set Environment Variables:**
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   (Railway automatically sets `PORT`)
6. **Deploy!**

**Railway Configuration**: 
- See `apps/backend/railway.json` for Railway-specific settings
- See `apps/backend/railpack.json` for Railpack build configuration (Railway uses Railpack, not Nixpacks)

### Database Connection (Supabase)

1. **Get connection string** from Supabase Dashboard → Settings → Database
2. **Use non-pooling connection** (`:5432`) for migrations
3. **Use pooling connection** (`:6543`) for runtime (optional, for better performance)
4. **SSL Mode**: Must be `require`

## Architecture

### Monorepo Structure

This project uses a pnpm workspace monorepo:
- **Independent builds**: Frontend and backend build independently
- **Shared packages**: Common code in `packages/shared` and `packages/prisma`
  - `packages/shared`: TypeScript types and utilities (needs to be built with `tsc`)
  - `packages/prisma`: Prisma schema and client (needs `prisma generate`)
- **Build order**: Packages must be built before apps:
  1. `pnpm db:generate` - Generate Prisma client
  2. `pnpm --filter @chaos-chess/shared build` - Build shared package
  3. Build frontend or backend
- **Workspace protocol**: Packages reference each other using `workspace:*`
- **Single repository**: Keeps everything together for easier AI IDE assistance

### Backend Limitations on Vercel

According to [Vercel's WebSocket documentation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections), Vercel serverless functions don't support WebSocket connections. While [NestJS can be deployed to Vercel](https://vercel.com/docs/frameworks/backend/nestjs), it's not suitable for this project because:
- ❌ No WebSocket support (required for real-time features)
- ❌ Execution time limits
- ❌ Stateless functions (can't maintain connection state)

**Solution**: Deploy backend to Railway/Render for full WebSocket support.

## Features

### Core Features
- ✅ User authentication (JWT, NextAuth.js)
- ✅ Chess game play with move validation
- ✅ ELO rating system (multiple rating types)
- ✅ Chat voting chaos mode
- ✅ Real-time updates (WebSocket)
- ✅ Chat system
- ✅ Matchmaking queue

### Frontend Features
- ✅ Chess board component
- ✅ Real-time chat interface
- ✅ Voting panel for chaos mode
- ✅ Game controls (resign, draw)
- ✅ Game clock
- ✅ User profile page
- ✅ Game creation

### Backend Features
- ✅ RESTful API
- ✅ WebSocket gateways (games, chat, voting)
- ✅ Chess engine integration
- ✅ Rating calculations
- ✅ Matchmaking service

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

### Games
- `GET /api/v1/games` - List games
- `GET /api/v1/games/:id` - Get game details
- `POST /api/v1/games` - Create game (protected)
- `POST /api/v1/games/:id/moves` - Make move (protected)
- `POST /api/v1/games/:id/resign` - Resign (protected)
- `POST /api/v1/games/:id/draw-offer` - Offer draw (protected)
- `POST /api/v1/games/:id/draw-accept` - Accept draw (protected)

### Ratings
- `GET /api/v1/ratings/me` - Get my ratings (protected)
- `GET /api/v1/ratings/leaderboard` - Get leaderboard
- `GET /api/v1/ratings/:userId/history` - Get rating history

### Voting
- `POST /api/v1/voting/games/:gameId/start` - Start voting (protected)
- `POST /api/v1/voting/games/:gameId/vote` - Submit vote (protected)
- `GET /api/v1/voting/games/:gameId/status` - Get status
- `POST /api/v1/voting/games/:gameId/end` - End voting (protected)

### Chat
- `GET /api/v1/chat/games/:gameId/messages` - Get messages
- `POST /api/v1/chat/games/:gameId/messages` - Send message (protected)

### Matchmaking
- `POST /api/v1/matchmaking/join` - Join queue (protected)
- `POST /api/v1/matchmaking/leave` - Leave queue (protected)
- `GET /api/v1/matchmaking/status` - Get status (protected)

## WebSocket Events

### Games (`/games` namespace)
- `join-game` - Join game room
- `leave-game` - Leave game room
- `move-made` - Move broadcast
- `game-update` - Game state update
- `game-finished` - Game completion

### Chat (`/chat` namespace)
- `join-chat` - Join chat room
- `send-message` - Send message
- `new-message` - New message broadcast

### Voting (`/voting` namespace)
- `join-voting` - Join voting room
- `submit-vote` - Submit vote
- `voting-started` - Voting round started
- `vote-update` - Vote count update
- `voting-ended` - Voting round ended

## Troubleshooting

### Database Connection Issues
- Verify your Supabase connection string
- Check if your Supabase project is active
- Ensure database is accessible
- Verify SSL mode is `require`

### WebSocket Connection Issues
- Verify `NEXT_PUBLIC_WS_URL` matches backend URL
- Use `https://` (not `wss://`) - Railway handles protocol upgrade
- Check CORS settings in backend
- Ensure backend is running

### Build Issues
- Run `pnpm db:generate` first
- Clear `.next` and `dist` folders
- Reinstall dependencies: `pnpm install`
- Ensure `pnpm install` runs from repository root

### Vercel Build Fails
- **"ERR_INVALID_THIS" or "ERR_PNPM_META_FETCH_FAIL" errors**: 
  - **Cause**: Known bug in pnpm 6.x with Node.js 20+ ([pnpm/pnpm#6424](https://github.com/pnpm/pnpm/issues/6424), [pnpm/pnpm#6499](https://github.com/pnpm/pnpm/issues/6499))
  - **Solution**: 
    - `vercel.json` now explicitly installs pnpm 8.15.0: `npm install -g pnpm@8.15.0 && pnpm install`
    - Node.js is pinned to 22.x in `package.json` engines field
    - `packageManager: "pnpm@8.15.0"` is set in `package.json`
    - If issues persist, ensure Vercel Project Settings → Node.js Version is set to 22.x
- Check root directory is set to repository root in Dashboard
- Verify frontend builds: `cd apps/frontend && pnpm build`
- Check build logs for specific errors

### Railway Deployment Issues
- **"nest: not found" error**: Railway is using npm instead of pnpm for build
  - **Cause**: Railway's Railpack auto-detects npm workspaces and uses `npm run build --workspace=...`
  - **Solution**: 
    - `apps/backend/railpack.json` is configured to use pnpm 8.15.0 via corepack
    - Railway uses Railpack (not Nixpacks) - see [Railpack docs](https://docs.railway.com/reference/railpack)
    - The railpack.json build step should override npm workspace detection
    - **If Railway still uses npm for build**, manually set the Build Command in Railway Dashboard → Settings → Deploy:
      - Use: `cd ../.. && corepack enable && corepack prepare pnpm@8.15.0 --activate && pnpm install && pnpm db:generate && pnpm --filter @chaos-chess/backend build`
    - Ensure Root Directory is set to `apps/backend` in Railway Dashboard → Settings → Source
- Verify `DATABASE_URL` is set correctly
- Check build command includes `pnpm db:generate`
- Review Railway logs for errors
- Ensure Prisma client is generated before build

## Documentation

- **Technical Specification**: See `spec/` directory (LaTeX)
- **Development Journal**: See `journal/` directory (LaTeX)
- **Project Snapshot**: See `snapshot/` directory (LaTeX)

## License

Private - All rights reserved
