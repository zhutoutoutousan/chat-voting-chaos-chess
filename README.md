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
- **Structure**: Frontend and backend are independent applications in the same repository

## Project Structure

```
chat-voting-chaos-chess/
├── apps/
│   ├── frontend/          # Next.js application (independent)
│   │   ├── lib/           # Shared types, constants, utils
│   │   └── ...
│   └── backend/           # Nest.js application (independent)
│       ├── prisma/        # Prisma schema and migrations
│       ├── src/
│       │   └── shared/    # Shared types, constants, utils
│       └── ...
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
   # Install frontend dependencies
   cd apps/frontend && pnpm install && cd ../..

   # Install backend dependencies
   cd apps/backend && pnpm install && cd ../..
   ```

3. **Set up environment variables:**

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
   cd apps/backend

   # Generate Prisma client
   pnpm prisma:generate

   # Run migrations
   pnpm prisma:migrate

   # (Optional) Open Prisma Studio
   pnpm prisma:studio
   ```

5. **Start development servers:**
   ```bash
   # Start frontend (in one terminal)
   cd apps/frontend && pnpm dev

   # Start backend (in another terminal)
   cd apps/backend && pnpm dev
   ```

## Available Scripts

### Frontend (apps/frontend)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code

### Backend (apps/backend)
- `pnpm dev` - Start development server (auto-generates Prisma client)
- `pnpm build` - Build for production (generates Prisma client first)
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations (dev)
- `pnpm prisma:migrate:deploy` - Deploy migrations (production)
- `pnpm prisma:studio` - Open Prisma Studio

## Database Management

All database operations are done from `apps/backend`:

```bash
cd apps/backend

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Deploy migrations (production)
pnpm prisma:migrate:deploy

# Open Prisma Studio
pnpm prisma:studio
```

## Deployment

### Frontend Deployment (Vercel)

1. **Go to Vercel Dashboard** → Add New Project
2. **Import your GitHub repository**
3. **Configure in Dashboard:**
   - **Root Directory**: `apps/frontend` (set in Vercel Dashboard → Settings → General)
   - Framework will auto-detect Next.js
   - Build Command: `pnpm build` (configured in `apps/frontend/vercel.json`)
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

**Note**: Vercel will automatically detect Next.js and run `pnpm build` in the `apps/frontend` directory.

### Backend Deployment (Railway)

**Why Railway?** According to [Vercel's documentation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections), Vercel serverless functions don't support WebSocket connections. Railway is perfect for Nest.js with WebSocket support.

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** → Deploy from GitHub repo
3. **Select your repository**
4. **Configure Service:**
   - **Root Directory**: `apps/backend` (IMPORTANT: Set this in Railway Dashboard → Settings → Source)
   - Build and Start commands are handled by `railpack.json` automatically
   - Railway will use Railpack to build (installs pnpm, generates Prisma client, builds backend)
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

### Project Structure

This project has two independent applications in the same repository:
- **Frontend** (`apps/frontend`): Next.js application with its own dependencies
  - Shared code in `apps/frontend/lib/` (types, constants, utils)
  - No build step needed for shared code (TypeScript is transpiled by Next.js)
- **Backend** (`apps/backend`): Nest.js application with its own dependencies
  - Prisma schema in `apps/backend/prisma/`
  - Shared code in `apps/backend/src/shared/` (types, constants, utils)
  - Prisma client is generated during build (`pnpm build` runs `prisma generate` first)
- **Single repository**: Keeps everything together for easier AI IDE assistance
- **No monorepo tools**: Each app is completely independent

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
- **Frontend**: Clear `.next` folder and reinstall: `cd apps/frontend && rm -rf .next && pnpm install`
- **Backend**: Generate Prisma client first: `cd apps/backend && pnpm prisma:generate`
- Clear `dist` folders and reinstall dependencies in each app directory

### Vercel Build Fails
- **"ERR_INVALID_THIS" or "ERR_PNPM_META_FETCH_FAIL" errors**: 
  - **Cause**: Known bug in older pnpm versions with Node.js 20+ ([pnpm/pnpm#6424](https://github.com/pnpm/pnpm/issues/6424), [pnpm/pnpm#6499](https://github.com/pnpm/pnpm/issues/6499))
  - **Solution**: 
    - `vercel.json` uses `pnpm install` - Vercel auto-detects pnpm from `pnpm-lock.yaml`
    - Vercel should use a compatible pnpm version automatically
    - **IMPORTANT**: Ensure Vercel Dashboard → Settings → General → Root Directory is set to `apps/frontend`
    - Node.js is pinned to 22.x in `apps/frontend/package.json` engines field
    - If issues persist, Vercel may need to update their default pnpm version
- Check root directory is set to `apps/frontend` in Dashboard
- Verify frontend builds: `cd apps/frontend && pnpm build`
- Check build logs for specific errors

### Railway Deployment Issues
- **"No start command was found" error**: 
  - **Solution**: `apps/backend/railpack.json` has `startCommand: "node dist/main.js"` in deploy section
  - Ensure Root Directory is set to `apps/backend` in Railway Dashboard → Settings → Source
  - Railway should automatically detect the startCommand from railpack.json
- **"nest: not found" error**: Railway is using npm instead of pnpm for build
  - **Cause**: Railway's Railpack might auto-detect npm
  - **Solution**: 
    - `apps/backend/railpack.json` installs pnpm globally, then uses it for the build
    - Railway uses Railpack (not Nixpacks) - see [Railpack docs](https://docs.railway.com/reference/railpack)
    - The railpack.json should handle everything automatically
- Verify `DATABASE_URL` is set correctly
- Check build command includes `pnpm prisma:generate` (handled by `pnpm build` script)
- Review Railway logs for errors
- Ensure Prisma client is generated before build (build script handles this)

## Documentation

- **Technical Specification**: See `spec/` directory (LaTeX)
- **Development Journal**: See `journal/` directory (LaTeX)
- **Project Snapshot**: See `snapshot/` directory (LaTeX)

## License

Private - All rights reserved
