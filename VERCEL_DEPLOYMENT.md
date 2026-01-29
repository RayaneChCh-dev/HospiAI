# Vercel Deployment Guide

## Environment Variables Required

Make sure all these environment variables are set in your Vercel project settings:

### 1. Database
```bash
DATABASE_URL="your-postgresql-connection-string"
```
For Vercel, use a serverless PostgreSQL provider like:
- Neon (recommended)
- Supabase
- Vercel Postgres

### 2. NextAuth
```bash
AUTH_SECRET="your-generated-secret"  # Required! Generate with: openssl rand -base64 32
AUTH_URL="https://your-domain.vercel.app"  # Your production URL
```

### 3. MCP JWT Configuration
```bash
MCP_JWT_SECRET="your-mcp-jwt-secret"  # Generate with: openssl rand -base64 32
MCP_JWT_ISSUER="hospiai-api"
MCP_JWT_AUDIENCE="hospiai-mcp"
```

### 4. Application Configuration (Optional)
```bash
NEXT_PUBLIC_APP_NAME="HospiAI"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## Common Deployment Errors

### Error: MIDDLEWARE_INVOCATION_FAILED

**Cause**: Missing `AUTH_SECRET` environment variable or database connection issues.

**Solution**:
1. Verify `AUTH_SECRET` is set in Vercel environment variables
2. Generate a new secret: `openssl rand -base64 32`
3. Add it to Vercel: Project Settings → Environment Variables
4. Redeploy

### Error: Module '@prisma/client' has no exported member 'PrismaClient'

**Cause**: Prisma client not generated before build.

**Solution**: Already fixed with `postinstall` script in package.json. If error persists:
1. Check that `prisma` is in `devDependencies`
2. Verify Vercel is running the postinstall script
3. Check build logs for any errors during `prisma generate`

### Error: Database connection failed

**Cause**: Invalid DATABASE_URL or network issues.

**Solution**:
1. Verify DATABASE_URL is correct in Vercel settings
2. Ensure database allows connections from Vercel's IP ranges
3. Use a serverless-compatible database (Neon, Supabase)
4. Check Prisma adapter configuration in `lib/prisma.ts`

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com and import your repository
   - Or use Vercel CLI: `vercel --prod`

3. **Set Environment Variables**
   - In Vercel Dashboard: Project → Settings → Environment Variables
   - Add all required variables listed above
   - Make sure to add them for Production, Preview, and Development environments

4. **Trigger Deployment**
   - Vercel will auto-deploy on git push
   - Or manually: Dashboard → Deployments → Redeploy

5. **Run Database Migrations**
   After first deployment, run:
   ```bash
   # Using Vercel CLI
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

## Vercel-Specific Configuration

### Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `yarn build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `yarn install` (runs postinstall automatically)

### Root Directory
If your app is in a subdirectory, set the root directory in Vercel settings.

### Node.js Version
Vercel uses Node.js 20.x by default, which is compatible with this project.

## Troubleshooting Checklist

- [ ] All environment variables are set in Vercel
- [ ] AUTH_SECRET is a strong random string (32+ characters)
- [ ] DATABASE_URL points to a valid PostgreSQL database
- [ ] Database allows connections from Vercel
- [ ] Prisma schema is up to date
- [ ] Build completes successfully in Vercel logs
- [ ] No errors in Function logs (Runtime Logs section)

## Testing Production Build Locally

Before deploying to Vercel, test the production build locally:

```bash
# Build the application
yarn build

# Start production server
yarn start

# Test all routes
open http://localhost:3000
```

## Support

If you continue to have issues:
1. Check Vercel Function logs: Dashboard → Deployments → [Your Deployment] → Functions
2. Check build logs: Dashboard → Deployments → [Your Deployment] → Building
3. Verify all environment variables are set correctly
4. Try redeploying: Dashboard → Deployments → [Your Deployment] → ... → Redeploy
