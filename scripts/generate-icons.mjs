import sharp from "sharp";

const sizes = [192, 512];

function createSvg(size) {
  const radius = Math.round(size * 0.2);
  const plateSize = Math.round(size * 0.38);
  const cx = Math.round(size * 0.5);
  const cy = Math.round(size * 0.48);
  const forkX = Math.round(size * 0.28);
  const knifeX = Math.round(size * 0.72);
  const utensilTop = Math.round(size * 0.22);
  const utensilBottom = Math.round(size * 0.74);
  const utensilWidth = Math.round(size * 0.025);
  const textY = Math.round(size * 0.9);
  const textSize = Math.round(size * 0.1);
  const plateStroke = Math.round(size * 0.02);
  // Fork prongs
  const prongSpacing = Math.round(size * 0.035);
  const prongTop = utensilTop;
  const prongBottom = Math.round(size * 0.38);
  const handleTop = Math.round(size * 0.42);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff6b35"/>
      <stop offset="100%" stop-color="#d94e1f"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>

  <!-- Plate (circle) -->
  <circle cx="${cx}" cy="${cy}" r="${plateSize}" fill="none" stroke="white" stroke-width="${plateStroke}" opacity="0.9"/>
  <circle cx="${cx}" cy="${cy}" r="${Math.round(plateSize * 0.7)}" fill="none" stroke="white" stroke-width="${Math.round(plateStroke * 0.5)}" opacity="0.4"/>

  <!-- Fork (left) -->
  <line x1="${forkX - prongSpacing}" y1="${prongTop}" x2="${forkX - prongSpacing}" y2="${prongBottom}" stroke="white" stroke-width="${utensilWidth}" stroke-linecap="round" opacity="0.9"/>
  <line x1="${forkX}" y1="${prongTop}" x2="${forkX}" y2="${prongBottom}" stroke="white" stroke-width="${utensilWidth}" stroke-linecap="round" opacity="0.9"/>
  <line x1="${forkX + prongSpacing}" y1="${prongTop}" x2="${forkX + prongSpacing}" y2="${prongBottom}" stroke="white" stroke-width="${utensilWidth}" stroke-linecap="round" opacity="0.9"/>
  <line x1="${forkX}" y1="${handleTop}" x2="${forkX}" y2="${utensilBottom}" stroke="white" stroke-width="${Math.round(utensilWidth * 1.5)}" stroke-linecap="round" opacity="0.9"/>

  <!-- Knife (right) -->
  <line x1="${knifeX}" y1="${utensilTop}" x2="${knifeX}" y2="${utensilBottom}" stroke="white" stroke-width="${Math.round(utensilWidth * 2)}" stroke-linecap="round" opacity="0.9"/>
  <line x1="${knifeX + Math.round(utensilWidth * 1.5)}" y1="${utensilTop}" x2="${knifeX + Math.round(utensilWidth * 1.5)}" y2="${Math.round(size * 0.45)}" stroke="white" stroke-width="${utensilWidth}" stroke-linecap="round" opacity="0.5"/>

  <!-- Text -->
  <text x="${cx}" y="${textY}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${textSize}" fill="white" opacity="0.95">MP</text>
</svg>`;
}

for (const size of sizes) {
  const svg = Buffer.from(createSvg(size));
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}
