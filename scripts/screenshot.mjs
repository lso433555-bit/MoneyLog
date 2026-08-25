import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:3000/dev-preview";
const outPath = process.argv[3] || "screenshot.png";
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 1000);
const colorScheme = process.argv[6] || "light";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, colorScheme });
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();
console.log("saved", outPath);
