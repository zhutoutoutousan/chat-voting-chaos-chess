# Chat Voting Chaos Chess Platform

A comprehensive chess platform with interactive chat voting chaos mode, built with Next.js, Nest.js, Prisma, and Supabase.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Nest.js 10+, TypeScript
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js, JWT, OAuth (Google, GitHub, Discord)
- **Payments**: Stripe
- **Real-time**: WebSocket (Socket.io)
- **Monorepo**: pnpm workspaces, Turborepo

## Project Structure

```
chat-voting-chaos-chess/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # Nest.js application
├── packages/
│   ├── shared/            # Shared TypeScript types and utilities
│   ├── prisma/            # Prisma schema and migrations
│   └── ui/                # Shared UI components
└── spec/                  # Technical specification documents
```

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Supabase account and database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-voting-chaos-chess
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

Create `.env` files in:
- `apps/backend/.env` - Backend environment variables
- `apps/frontend/.env.local` - Frontend environment variables

Example backend `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
PORT=3001
```

4. Set up database:

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate
```

5. Start development servers:

```bash
# Start all apps
pnpm dev

# Or start individually
pnpm --filter @chaos-chess/frontend dev
pnpm --filter @chaos-chess/backend dev
```

## Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm test` - Run tests
- `pnpm lint` - Lint all code
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## Documentation

See the `spec/` directory for complete technical specifications:
- Architecture overview
- API design
- Database schema
- Frontend architecture
- Deployment strategy
- And more...

## License

Private - All rights reserved
