# HospiAI - Images & Metadata Assets

This directory contains all the images needed for metadata, social media sharing, and app icons.

## Required Images

### 1. Social Media / Open Graph Images

#### `og-image.png` (Required)
- **Size**: 1200 x 630 pixels
- **Format**: PNG or JPG
- **Purpose**: Facebook, LinkedIn, and general Open Graph sharing
- **Content**: Should include:
  - HospiAI logo
  - Tagline: "Votre santé, notre priorité intelligente"
  - Clean medical/healthcare themed background
  - High contrast for readability

#### `og-image-square.png` (Optional)
- **Size**: 1200 x 1200 pixels
- **Format**: PNG or JPG
- **Purpose**: Square format for social media posts
- **Content**: Square version of the main OG image

#### `twitter-image.png` (Required)
- **Size**: 1200 x 600 pixels
- **Format**: PNG or JPG
- **Purpose**: Twitter/X card image
- **Content**: Similar to og-image.png but with Twitter's aspect ratio

---

### 2. Favicons & App Icons

#### `favicon.ico` (Required)
- **Size**: 32x32 pixels (or multi-size: 16x16, 32x32, 48x48)
- **Format**: ICO
- **Purpose**: Browser tab icon
- **Location**: `/public/favicon.ico`
- **Content**: Simple HospiAI logo icon

#### `icon-192.png` (Required)
- **Size**: 192 x 192 pixels
- **Format**: PNG with transparent background
- **Purpose**: PWA icon, Android home screen
- **Location**: `/public/icon-192.png`
- **Content**: HospiAI logo centered on transparent background

#### `icon-512.png` (Required)
- **Size**: 512 x 512 pixels
- **Format**: PNG with transparent background
- **Purpose**: PWA splash screen, high-res Android icon
- **Location**: `/public/icon-512.png`
- **Content**: HospiAI logo centered on transparent background

#### `apple-icon.png` (Required)
- **Size**: 180 x 180 pixels
- **Format**: PNG
- **Purpose**: iOS home screen icon
- **Location**: `/public/apple-icon.png`
- **Content**: HospiAI logo on solid color background (no transparency)
- **Note**: Apple icons should NOT have transparency

---

## Design Guidelines

### Brand Colors
Based on the medical/healthcare theme, consider:
- **Primary**: Blue (#0066cc or similar medical blue)
- **Secondary**: White/Light grey for contrast
- **Accent**: Green for health/wellness themes
- **Background**: Clean white or light blue gradient

### Logo Usage
- Always use high-resolution HospiAI logo
- Ensure sufficient padding around logo (at least 10% of image size)
- Logo should be clearly visible and not pixelated
- Use consistent branding across all images

### Typography (for social media images)
- Use clean, modern sans-serif fonts
- Ensure text is readable at small sizes
- High contrast between text and background
- Consider adding subtle medical icons (heart, stethoscope, cross)

---

## Image Specifications Summary

| File Name | Size | Format | Location | Required |
|-----------|------|--------|----------|----------|
| og-image.png | 1200x630 | PNG/JPG | /public/images/metadata/ | Yes |
| og-image-square.png | 1200x1200 | PNG/JPG | /public/images/metadata/ | Optional |
| twitter-image.png | 1200x600 | PNG/JPG | /public/images/metadata/ | Yes |
| favicon.ico | 32x32 | ICO | /public/ | Yes |
| icon-192.png | 192x192 | PNG | /public/ | Yes |
| icon-512.png | 512x512 | PNG | /public/ | Yes |
| apple-icon.png | 180x180 | PNG | /public/ | Yes |

---

## Tools for Creating Images

### Online Tools (Free)
1. **Canva** - https://www.canva.com
   - Templates for social media images
   - Easy drag-and-drop design

2. **Figma** - https://www.figma.com
   - Professional design tool
   - Precise control over dimensions

3. **Favicon.io** - https://favicon.io
   - Generate favicons from text, image, or emoji
   - Creates all required favicon sizes

### Desktop Tools
1. **GIMP** (Free) - https://www.gimp.org
2. **Photoshop** (Paid)
3. **Sketch** (Mac, Paid)

---

## Testing Your Images

### Open Graph Testing
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

### Favicon Testing
- Simply navigate to your site and check the browser tab
- Check on mobile devices for home screen icons

---

## Current Status

- [ ] og-image.png
- [ ] og-image-square.png
- [ ] twitter-image.png
- [ ] favicon.ico
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] apple-icon.png

Once you upload these images, the metadata will be complete and your site will look professional when shared on social media!

---

## Example Design Concepts

### Concept 1: Minimalist
- White/light blue gradient background
- Large HospiAI logo centered
- Tagline below logo
- Subtle medical cross or heart icon

### Concept 2: Dynamic
- Abstract medical pattern background
- HospiAI logo on left
- Tagline and key features on right
- Blue/white color scheme

### Concept 3: Hero Style
- Medical professional or patient imagery (stock photo)
- Overlay with HospiAI branding
- Clear call-to-action text
- Professional healthcare aesthetic

---

**Last Updated**: 2026-01-29
**Project**: HospiAI
**Purpose**: Metadata and social media assets
