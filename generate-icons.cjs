const sharp = require("sharp");
const fs = require("fs");

const input = "public/favicon.svg";
const outputDir = "public/icons";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  await sharp(input)
    .resize(192, 192)
    .png()
    .toFile(`${outputDir}/icon-192.png`);

  await sharp(input)
    .resize(512, 512)
    .png()
    .toFile(`${outputDir}/icon-512.png`);

  await sharp(input)
    .resize(512, 512)
    .png()
    .toFile(`${outputDir}/icon-maskable.png`);

  console.log("✅ PennyPlot PWA icons generated!");
}

generateIcons().catch(console.error);