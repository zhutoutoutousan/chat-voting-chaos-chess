# Prisma Package

This package contains the Prisma schema and database migrations for the Chat Voting Chaos Chess platform.

## Setup

1. **Create `.env` file:**
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

2. **Generate Prisma Client:**
   ```bash
   pnpm generate
   ```

3. **Run Migrations:**
   ```bash
   # Development
   pnpm migrate:dev
   
   # Production
   pnpm migrate:deploy
   ```

4. **Seed Database (optional):**
   ```bash
   pnpm seed
   ```

## Scripts

- `pnpm generate` - Generate Prisma Client
- `pnpm migrate:dev` - Create and apply migration (dev)
- `pnpm migrate:deploy` - Apply migrations (production)
- `pnpm migrate:reset` - Reset database (WARNING: deletes all data)
- `pnpm studio` - Open Prisma Studio
- `pnpm seed` - Seed database with initial data

## Database Connection

The database is hosted on Supabase. Use the connection string from your Supabase project settings.

**Important:** Use the non-pooling connection (`:5432`) for migrations.
