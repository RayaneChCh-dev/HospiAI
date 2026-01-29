# JWT Private Key Error - Troubleshooting Guide

## Error Message

```
Login error: Error: secretOrPrivateKey must be an asymmetric key when using RS256
```

## What This Means

The JWT signing function is not receiving a valid RSA private key. This happens when:
1. The `JWT_PRIVATE_KEY` environment variable is **not set** in Vercel
2. The `JWT_PRIVATE_KEY` is **set but malformed** (incorrect escaping, missing headers/footers)
3. The key format is **incorrect** for RS256 algorithm

## Quick Diagnosis

### Check Vercel Environment Variables

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (HospiAI)
3. Go to **Settings** → **Environment Variables**
4. Verify that **JWT_PRIVATE_KEY** exists
5. Click "Edit" to view the value (first 50 characters will be shown)

### Expected Format

The `JWT_PRIVATE_KEY` should look like this when viewed in Vercel:

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgw...\n-----END PRIVATE KEY-----\n
```

**Key points:**
- ✅ Starts with `-----BEGIN PRIVATE KEY-----\n`
- ✅ Ends with `\n-----END PRIVATE KEY-----\n`
- ✅ All newlines are escaped as `\n` (literally the two characters backslash-n)
- ❌ Should NOT have actual line breaks in the middle
- ❌ Should NOT have spaces before `-----BEGIN`

## Solution: Regenerate and Re-upload Keys

### Step 1: Verify Local Keys

```bash
# Check if keys exist
ls -la private.pem public.pem

# Verify private key format
head -1 private.pem
# Should output: -----BEGIN PRIVATE KEY-----

# Verify public key format
head -1 public.pem
# Should output: -----BEGIN PUBLIC KEY-----
```

If keys don't exist or are malformed, regenerate them:

```bash
# Generate new private key (2048-bit RSA)
openssl genrsa -out private.pem 2048

# Generate corresponding public key
openssl rsa -in private.pem -pubout -out public.pem

# Verify generation
openssl rsa -in private.pem -check -noout
# Should output: RSA key ok
```

### Step 2: Generate Vercel-Compatible Format

Use the provided script to convert keys to Vercel format:

```bash
./scripts/generate-env-vars.sh
```

This will output something like:

```
1️⃣  JWT_PRIVATE_KEY
-------------------------------------------
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgw...\n-----END PRIVATE KEY-----\n

2️⃣  JWT_PUBLIC_KEY
-------------------------------------------
-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...\n-----END PUBLIC KEY-----\n
```

### Step 3: Update Vercel Environment Variables

1. **Copy the entire JWT_PRIVATE_KEY value** (including `-----BEGIN` and `-----END`)
2. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Find `JWT_PRIVATE_KEY` and click **Edit** (or **Add** if it doesn't exist)
4. **Paste the value** exactly as shown by the script
5. Select **All Environments** (Production, Preview, Development)
6. Click **Save**

Repeat for `JWT_PUBLIC_KEY`.

### Step 4: Verify in Vercel

After saving, Vercel should show:

| Name | Value (first 50 chars) | Environments |
|------|------------------------|--------------|
| JWT_PRIVATE_KEY | `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...` | Production, Preview, Development |
| JWT_PUBLIC_KEY | `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhk...` | Production, Preview, Development |

### Step 5: Redeploy

Vercel automatically redeploys when environment variables change, but you can manually trigger:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **•••** → **Redeploy**
4. Wait for deployment to complete

### Step 6: Test

```bash
# Test JWKS endpoint (should work even before)
curl https://your-project.vercel.app/.well-known/jwks.json

# Test login (should now work)
curl -X POST https://your-project.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'

# Expected response:
# {"access_token":"eyJhbGciOiJSUzI1NiIs...","token_type":"Bearer","expires_in":900}
```

## Common Mistakes

### ❌ Mistake 1: Missing `\n` Escaping

**Wrong:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgw...
-----END PRIVATE KEY-----
```

**Correct:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgw...\n-----END PRIVATE KEY-----\n
```

### ❌ Mistake 2: Using Raw File in Vercel

You **cannot** upload `private.pem` directly to Vercel. The file must be:
1. Converted to a single line
2. Newlines escaped as `\n`
3. Stored as an environment variable

### ❌ Mistake 3: Wrong Key Type

If you generated keys with just `openssl genrsa`, they might output `BEGIN RSA PRIVATE KEY` instead of `BEGIN PRIVATE KEY`.

**To convert:**
```bash
# Convert old RSA format to PKCS#8 format
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private.pem -out private_pkcs8.pem

# Replace old key
mv private_pkcs8.pem private.pem

# Regenerate public key
openssl rsa -in private.pem -pubout -out public.pem
```

### ❌ Mistake 4: Whitespace Issues

Make sure there are **no spaces** before or after the key content when pasting into Vercel.

**Wrong:** ` -----BEGIN PRIVATE KEY-----\n...` (space at start)
**Correct:** `-----BEGIN PRIVATE KEY-----\n...`

## Verification Script

Run this script to verify your environment variables are correctly formatted:

```bash
./scripts/verify-env-vars.sh
```

This will check:
- ✅ Variables are defined
- ✅ Keys contain `BEGIN` and `END` markers
- ✅ Newlines are properly escaped
- ✅ Format is valid for RS256

## Still Not Working?

### Check Vercel Function Logs

1. Go to **Deployments** in Vercel Dashboard
2. Click on your latest deployment
3. Go to **Functions** tab
4. Find the `/api/login` function
5. Click **View Logs**

Look for these log messages:

```
[JWT] Loading private key from JWT_PRIVATE_KEY environment variable
[JWT] Private key loaded successfully from environment
```

If you see:
```
[JWT] Invalid private key format in JWT_PRIVATE_KEY
[JWT] First 50 chars: [some value]
```

This means the key is set but malformed. Compare the "First 50 chars" with what you expect.

### Check Environment Variable Scope

Make sure the variable is set for the correct environment:
- ✅ **Production**: Required for production deployments (your-project.vercel.app)
- ✅ **Preview**: Required for preview deployments (PR branches)
- ✅ **Development**: Required for local development via Vercel CLI

### Manual Test in Local Environment

Test with the exact same format used in Vercel:

```bash
# Export the Vercel format locally
export JWT_PRIVATE_KEY="$(awk '{printf "%s\\n", $0}' private.pem)"
export JWT_PUBLIC_KEY="$(awk '{printf "%s\\n", $0}' public.pem)"

# Verify they're set
./scripts/verify-env-vars.sh

# Test locally
yarn build
yarn start

# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

If this works locally but not in Vercel, then the issue is specifically with how the variable is set in Vercel Dashboard.

## Key Regeneration Checklist

If you need to regenerate keys from scratch:

- [ ] Delete old keys: `rm private.pem public.pem`
- [ ] Generate new private key: `openssl genrsa -out private.pem 2048`
- [ ] Generate new public key: `openssl rsa -in private.pem -pubout -out public.pem`
- [ ] Verify keys: `openssl rsa -in private.pem -check -noout`
- [ ] Add to .gitignore: `echo "*.pem" >> .gitignore`
- [ ] Convert to Vercel format: `./scripts/generate-env-vars.sh`
- [ ] Update `JWT_PRIVATE_KEY` in Vercel Dashboard
- [ ] Update `JWT_PUBLIC_KEY` in Vercel Dashboard
- [ ] Verify in Vercel: Check first 50 chars include `-----BEGIN`
- [ ] Redeploy project
- [ ] Test JWKS endpoint: `curl https://your-project.vercel.app/.well-known/jwks.json`
- [ ] Test login endpoint: `curl -X POST https://your-project.vercel.app/api/login ...`

## Related Files

- `/lib/jwt.ts` - JWT signing/verification logic with improved error handling
- `/scripts/generate-env-vars.sh` - Generates Vercel-compatible environment variables
- `/scripts/verify-env-vars.sh` - Verifies environment variables are correctly formatted
- `/docs/VERCEL_DEPLOYMENT.md` - General deployment guide
- `/docs/PRODUCTION_LOGIN_FIX.md` - Prisma serverless configuration fix

---

**Last Updated:** 2026-01-29
