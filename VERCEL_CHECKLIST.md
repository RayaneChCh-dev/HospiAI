# Vercel Deployment Checklist

## Before Deploying

- [ ] All code committed to Git
- [ ] `package.json` has `"postinstall": "prisma generate"`
- [ ] Local build succeeds: `yarn build`
- [ ] All tests pass locally

## Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables (Check ALL)

- [ ] `AUTH_SECRET` = `<your-generated-secret>`
  - Generate: `openssl rand -base64 32`
  - Must be 32+ characters

- [ ] `AUTH_URL` = `https://your-app.vercel.app`
  - Use your actual Vercel deployment URL

- [ ] `DATABASE_URL` = `postgresql://...`
  - Must be a valid PostgreSQL connection string
  - Recommended: Use Neon or Supabase for serverless

- [ ] `MCP_JWT_SECRET` = `<your-mcp-secret>`
  - Generate: `openssl rand -base64 32`
  - Different from AUTH_SECRET

- [ ] `MCP_JWT_ISSUER` = `hospiai-api`

- [ ] `MCP_JWT_AUDIENCE` = `hospiai-mcp`

### Optional Variables

- [ ] `NEXT_PUBLIC_APP_NAME` = `HospiAI`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

## Environment Settings

For each variable above:
- [ ] Added to **Production** environment
- [ ] Added to **Preview** environment (optional but recommended)
- [ ] Added to **Development** environment (optional)

## After Setting Variables

- [ ] Click "Redeploy" (not just "Deploy")
- [ ] Wait for deployment to complete
- [ ] Check deployment status: ✅ Success or ❌ Failed

## If Deployment Fails

### Step 1: Check Build Logs
- [ ] Go to: Dashboard → Deployments → [Failed Deployment] → Building
- [ ] Look for error messages
- [ ] Common errors:
  - Missing `@prisma/client`: Check postinstall script
  - TypeScript errors: Run `yarn build` locally first

### Step 2: Check Function Logs
- [ ] Go to: Dashboard → Deployments → [Latest] → Functions
- [ ] Look for runtime errors
- [ ] Common errors:
  - `AUTH_SECRET` not found
  - Database connection failed
  - Missing environment variables

### Step 3: Check Runtime Logs
- [ ] Go to: Dashboard → Deployments → [Latest] → Runtime Logs
- [ ] Filter by "Error" level
- [ ] Look for:
  - Database connection errors
  - Prisma errors
  - Authentication errors

## Testing Production Deployment

After successful deployment:

- [ ] Visit homepage: `https://your-app.vercel.app`
  - Should redirect to `/login`

- [ ] Test login page: `https://your-app.vercel.app/login`
  - Should show login form

- [ ] Test register page: `https://your-app.vercel.app/register`
  - Should show registration form

- [ ] Test API health: Try logging in
  - Should work without 500 errors

- [ ] Test dashboard (after login)
  - Should load without errors

## Database Setup

If using a new database:

- [ ] Run migrations: `npx prisma migrate deploy`
  - From local with production DATABASE_URL
  - Or use Vercel CLI: `vercel env pull .env.production`

- [ ] Verify tables created
  - Check your database provider's dashboard
  - Should see: User, MCP, Booking, etc.

## Common Issues & Solutions

### Issue: 404 Error on All Pages

**Likely Cause**: Missing `AUTH_SECRET`

**Solution**:
1. Generate secret: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Redeploy (must click Redeploy, not just Deploy)

### Issue: Database Connection Failed

**Likely Cause**: Invalid `DATABASE_URL` or firewall blocking Vercel

**Solution**:
1. Verify DATABASE_URL format is correct
2. Check database allows external connections
3. For Neon/Supabase, ensure serverless/pooling is enabled
4. Test connection locally with same URL

### Issue: Middleware Error

**Likely Cause**: Environment variables not loaded in Edge runtime

**Solution**:
1. Verify all variables are set in Vercel (not just `.env.local`)
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables

### Issue: Build Succeeds but Pages Show 500 Error

**Likely Cause**: Runtime error (database, auth, etc.)

**Solution**:
1. Check Function Logs in Vercel dashboard
2. Look for specific error messages
3. Verify all API routes have required environment variables
4. Test same environment variables locally

## Quick Commands

```bash
# Generate secrets
openssl rand -base64 32

# Test build locally
yarn build

# Test production locally
yarn build && yarn start

# Pull Vercel environment variables
vercel env pull .env.vercel

# Deploy manually
vercel --prod
```

## Success Criteria

✅ Deployment completes without errors
✅ Homepage redirects properly
✅ Login page loads
✅ Can create account
✅ Can log in
✅ Dashboard loads after login
✅ No 404 or 500 errors in normal flow

## Need Help?

1. Check Vercel Function Logs first
2. Verify all environment variables are set
3. Compare with local working setup
4. Check database connectivity
5. Review error messages in Vercel dashboard
