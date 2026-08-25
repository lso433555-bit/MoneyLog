// PWA/파비콘용 아이콘을 한 번 생성하는 스크립트. sharp는 devDependency로 남기지 않고
// 이 스크립트를 돌릴 때만 `npm install --no-save sharp`로 임시 설치해서 사용한다.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BRAND = "#F9633F"; // coral-500, MoneyAmount/버튼 등에서 쓰는 브랜드 컬러

// 일반 아이콘: 정사각형 전체를 거의 채움 (Android "any" / iOS apple-touch-icon용)
const regularSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="${BRAND}"/>
  <text x="256" y="352" font-family="Arial, sans-serif" font-size="300" font-weight="700"
        fill="#ffffff" text-anchor="middle">₩</text>
</svg>`;

// 마스커블 아이콘: 안전 영역(중앙 80% 원) 안에 심볼이 들어오도록 여백을 더 둠
const maskableSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${BRAND}"/>
  <text x="256" y="322" font-family="Arial, sans-serif" font-size="200" font-weight="700"
        fill="#ffffff" text-anchor="middle">₩</text>
</svg>`;

const targets = [
  { name: "icon-192.png", svg: regularSvg(512), size: 192 },
  { name: "icon-512.png", svg: regularSvg(512), size: 512 },
  { name: "maskable-icon-512.png", svg: maskableSvg(512), size: 512 },
];

for (const t of targets) {
  await sharp(Buffer.from(t.svg)).resize(t.size, t.size).png().toFile(path.join(outDir, t.name));
  console.log("wrote", t.name);
}

// app/icon.png, app/apple-icon.png — Next.js App Router 파일 기반 메타데이터 규칙.
// 각각 <link rel="icon">, <link rel="apple-touch-icon">을 자동으로 만들어준다.
await sharp(Buffer.from(regularSvg(512))).resize(256, 256).png().toFile(path.join(__dirname, "..", "app", "icon.png"));
console.log("wrote app/icon.png");

await sharp(Buffer.from(regularSvg(512))).resize(180, 180).png().toFile(path.join(__dirname, "..", "app", "apple-icon.png"));
console.log("wrote app/apple-icon.png");
