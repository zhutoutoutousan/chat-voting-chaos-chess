# Vercel Turborepo Configuration

## Overview

This project uses Turborepo with Vercel. According to the [Vercel Turborepo documentation](https://vercel.com/docs/monorepos/turborepo), Vercel automatically detects Turborepo and provides global `turbo` command.

## Configuration

### vercel.json

The `vercel.json` is configured to:
- Use `turbo build` as the build command (Vercel automatically filters to the app in `rootDirectory`)
- Set `rootDirectory` to `apps/frontend` so Vercel knows which app to deploy
- Use `pnpm install` for installation

### How It Works

1. **Automatic Filtering**: When you set `rootDirectory: "apps/frontend"`, Vercel automatically runs `turbo build --filter=@chaos-chess/frontend` (or equivalent)

2. **Global Turbo**: Vercel has Turborepo installed globally, so you don't need to add it as a dependency

3. **Dependencies**: Turborepo automatically handles building dependencies (like `@chaos-chess/shared` and `@chaos-chess/prisma`) before building the frontend

## Build Process

When Vercel builds your project:

1. Runs `pnpm install` from the repository root
2. Runs `turbo build` which:
   - Detects the root directory is `apps/frontend`
   - Automatically filters to build only the frontend app
   - Builds dependencies first (`^build` in turbo.json)
   - Outputs to `.next/` directory

## Remote Caching (Optional)

To enable Vercel Remote Caching for faster builds:

1. **Link to Vercel Remote Cache**:
   ```bash
   npx turbo login
   npx turbo link
   ```

2. **Link each project**:
   ```bash
   cd apps/frontend
   vercel link
   ```

3. **Test caching**:
   ```bash
   turbo build
   ```

## Benefits

- ✅ Automatic dependency building
- ✅ Caching between deployments
- ✅ Only builds what changed
- ✅ Faster builds with remote cache
- ✅ No need to install turbo in project

## Troubleshooting

### Build outputs not found

Make sure your `turbo.json` outputs match your framework:
- Next.js: `.next/**`
- Nest.js: `dist/**`

### Cache misses

Check the Turborepo Run Summary in Vercel dashboard to see why cache misses occurred.

## References

- [Vercel Turborepo Docs](https://vercel.com/docs/monorepos/turborepo)
- [Turborepo Documentation](https://turbo.build/repo/docs)
