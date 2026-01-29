# Environment Variables for Metadata

## Required for Production

Add this to your `.env.local` and production environment (Vercel):

```bash
# App URL for metadata (required for Open Graph and Twitter cards)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Why is this needed?

The `metadataBase` in the Next.js metadata configuration needs an absolute URL to generate proper Open Graph and Twitter card images. Without this:
- Social media platforms might not load your images
- SEO tools may report warnings
- Metadata validation will fail

## Setup Instructions

### Local Development
1. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Production (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://your-production-domain.com` (your actual domain)
   - **Environment**: Production, Preview, Development

3. Redeploy your application after adding the variable

## Verification

After setting up, verify the metadata works:
1. Visit your site
2. View page source (Ctrl+U or Cmd+U)
3. Look for `<meta property="og:image"` tags
4. The image URL should be absolute (https://...)

## Example

```typescript
// In app/layout.tsx
metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
```

This ensures all relative URLs in metadata are converted to absolute URLs.
