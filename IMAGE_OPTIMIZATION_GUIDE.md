# Image Optimization Guide for PageSpeed

## Current Issues
- Images not in modern formats (WebP)
- No explicit width/height attributes (causes CLS)
- No lazy loading for below-the-fold images
- No preloading for hero/critical images

## Solution: Convert Images to WebP

### Option 1: Online Conversion
1. Go to https://squoosh.app/
2. Upload your images
3. Select WebP format
4. Adjust quality to 80-85%
5. Download optimized images

### Option 2: Bulk Conversion (Recommended)
Install sharp for Node.js:

```bash
npm install sharp
```

Create a script `scripts/optimize-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public';
const outputDir = './public/optimized';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all images
const files = fs.readdirSync(inputDir);
const imageFiles = files.filter(file => 
  /\.(jpg|jpeg|png)$/i.test(file)
);

// Convert each image
imageFiles.forEach(async (file) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
  
  await sharp(inputPath)
    .webp({ quality: 85 })
    .toFile(outputPath);
    
  console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
});
```

Run: `node scripts/optimize-images.js`

## Implementation in Code

### 1. Add width/height to all images

**Before:**
```jsx
<img src="/logo.jpg" alt="Logo" />
```

**After:**
```jsx
<img 
  src="/logo.webp" 
  alt="Logo" 
  width="200" 
  height="200"
  loading="lazy"
/>
```

### 2. Preload hero/critical images

Add to `index.html` in `<head>`:
```html
<link rel="preload" as="image" href="/hero-image.webp" />
```

### 3. Lazy load below-the-fold images

```jsx
<img 
  src="/product.webp" 
  alt="Product" 
  width="300" 
  height="300"
  loading="lazy"
  decoding="async"
/>
```

### 4. Use responsive images

```jsx
<img 
  srcset="/product-small.webp 400w, /product-medium.webp 800w, /product-large.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  src="/product-medium.webp"
  alt="Product"
  width="800"
  height="600"
  loading="lazy"
/>
```

## Expected Results
- **LCP improvement**: 1-2 seconds faster
- **CLS reduction**: From 0.18 to <0.05
- **Bundle size**: 60-80% smaller images
- **PageSpeed score**: +15-25 points

## Action Items
1. ✅ Convert all JPG/PNG to WebP
2. ✅ Add explicit width/height to all images
3. ✅ Add loading="lazy" to non-critical images
4. ✅ Preload hero/above-the-fold images
5. ✅ Use responsive images with srcset
