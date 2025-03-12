import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const sourceIcon = path.join(process.cwd(), 'src', 'assets', 'logo.png');
const outputDir = path.join(process.cwd(), 'public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Generate PWA icons
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `pwa-${size}x${size}.png`));
    }

    // Generate favicon
    await sharp(sourceIcon)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon.ico'));

    // Generate apple-touch-icon
    await sharp(sourceIcon)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    // Generate masked-icon
    await sharp(sourceIcon)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'masked-icon.svg'));

    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating PWA icons:', error);
    process.exit(1);
  }
}

generateIcons(); 