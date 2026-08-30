const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function generateIcons() {
  const inputWebp = path.join(__dirname, '../assets/images/RCG.webp');
  const iconsDir = path.join(__dirname, '../assets/icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Generating PNG and ICO icons from RCG.webp...');

  // 1. Generate PNG 256x256
  const png256Path = path.join(iconsDir, 'icon.png');
  await sharp(inputWebp)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(png256Path);

  // 2. Generate sizes for ICO (16, 32, 48, 64, 128, 256)
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngFiles = [];

  for (const size of sizes) {
    const tempPng = path.join(iconsDir, `icon_${size}.png`);
    await sharp(inputWebp)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(tempPng);
    pngFiles.push(tempPng);
  }

  // 3. Convert PNGs to multi-resolution ICO
  const icoBuf = await pngToIco(pngFiles);
  const icoPath = path.join(iconsDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuf);

  // Clean up temp PNGs
  for (const size of sizes) {
    const tempPng = path.join(iconsDir, `icon_${size}.png`);
    if (fs.existsSync(tempPng)) {
      fs.unlinkSync(tempPng);
    }
  }

  console.log('Successfully created:');
  console.log(' - ' + png256Path);
  console.log(' - ' + icoPath);
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
