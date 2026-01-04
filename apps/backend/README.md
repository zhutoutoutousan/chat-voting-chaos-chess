# Backend - NestJS Application

## Deployment Options

### Option 1: Vercel (REST API Only)
- ✅ Good for REST endpoints
- ❌ WebSocket NOT supported
- See `VERCEL_BACKEND_SETUP.md`

### Option 2: Railway/Render (Full Backend) - Recommended
- ✅ Full NestJS support
- ✅ WebSocket works perfectly
- ✅ No limitations
- See `DEPLOYMENT.md`

## Local Development

```bash
pnpm dev
```

Server runs on http://localhost:3001

## Build

```bash
pnpm build
```

## Production

```bash
pnpm start:prod
```

## Entrypoint for Vercel

If deploying to Vercel, use `api/index.ts` as the serverless function entrypoint.

For traditional hosting (Railway/Render), use `src/main.ts` as the entrypoint.
