import sharp from 'sharp';
import path from 'path';

const sourceSvg = path.join(process.cwd(), 'src', 'assets', 'logo.svg');
const outputPng = path.join(process.cwd(), 'src', 'assets', 'logo.png');

async function convertSvgToPng() {
  try {
    await sharp(sourceSvg)
      .resize(512, 512)
      .png()
      .toFile(outputPng);
    console.log('SVG converted to PNG successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

convertSvgToPng(); 