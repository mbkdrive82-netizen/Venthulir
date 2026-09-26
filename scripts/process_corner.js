const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImage(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;

    const minVal = Math.min(r, g, b);
    
    // Clean background threshold
    if (minVal > 244) {
      rgba[i * 4 + 3] = 0; // Transparent
    } else if (minVal > 215) {
      const alpha = Math.round(255 * (1 - (minVal - 215) / (244 - 215)));
      rgba[i * 4 + 3] = Math.max(0, Math.min(255, alpha));
    } else {
      rgba[i * 4 + 3] = 255;
    }
  }

  await sharp(rgba, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png({ quality: 95, compressionLevel: 8 })
  .toFile(outputPath);

  console.log('Saved transparent corner to', outputPath);
}

async function main() {
  const outDir = path.join(__dirname, '../public/images');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const baseDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\154736f3-8e7b-46e9-a7e9-e9a061aabda4';

  await processImage(
    path.join(baseDir, 'botanical_clean_tea_1790423002460.jpg'),
    path.join(outDir, 'corner-tea.png')
  );

  await processImage(
    path.join(baseDir, 'corner_fresh_olive_1790426219039.jpg'),
    path.join(outDir, 'corner-olive.png')
  );

  await processImage(
    path.join(baseDir, 'corner_golden_wheat_1790426194569.jpg'),
    path.join(outDir, 'corner-wheat.png')
  );

  await processImage(
    path.join(baseDir, 'corner_cardamom_spice_1790426243379.jpg'),
    path.join(outDir, 'corner-spice.png')
  );

  await processImage(
    path.join(baseDir, 'corner_eucalyptus_1790426268746.jpg'),
    path.join(outDir, 'corner-eucalyptus.png')
  );

  // Also sync default botanical-corner.png and botanical-herb-corner.png
  await processImage(
    path.join(baseDir, 'botanical_clean_tea_1790423002460.jpg'),
    path.join(outDir, 'botanical-corner.png')
  );
  await processImage(
    path.join(baseDir, 'corner_fresh_olive_1790426219039.jpg'),
    path.join(outDir, 'botanical-herb-corner.png')
  );
}

main().catch(console.error);
