# Image Upload Checklist for HospiAI

Upload these images to complete the metadata setup:

## Priority 1: Essential Images (Must Have)

### Social Media Sharing
- [ ] **og-image.png** → Upload to `/public/images/metadata/`
  - Size: 1200x630px
  - Use for Facebook, LinkedIn sharing

- [ ] **twitter-image.png** → Upload to `/public/images/metadata/`
  - Size: 1200x600px
  - Use for Twitter/X cards

### Favicons & Icons
- [ ] **favicon.ico** → Upload to `/public/`
  - Size: 32x32px (or multi-size)
  - Browser tab icon

- [ ] **icon-192.png** → Upload to `/public/`
  - Size: 192x192px
  - Android & PWA icon

- [ ] **icon-512.png** → Upload to `/public/`
  - Size: 512x512px
  - High-res Android & PWA icon

- [ ] **apple-icon.png** → Upload to `/public/`
  - Size: 180x180px
  - iOS home screen icon

## Priority 2: Optional (Nice to Have)

- [ ] **og-image-square.png** → Upload to `/public/images/metadata/`
  - Size: 1200x1200px
  - Square format social posts

## After Upload

1. **Test social media previews:**
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/
   - Twitter: https://cards-dev.twitter.com/validator

2. **Test favicons:**
   - Visit your site and check browser tab
   - Add to home screen on mobile devices

3. **Update environment variable** (if needed):
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   ```

## Quick Tips

- Use your existing `/public/logo.png` as a starting point
- Keep consistent branding (colors, fonts, style)
- Ensure images are optimized (compressed but high quality)
- All icons should have transparent backgrounds (except apple-icon.png)
- Social media images should have text readable at thumbnail size

---

**Need Help?**
See the full guide: `/public/images/metadata/README.md`
