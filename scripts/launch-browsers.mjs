import { chromium } from "playwright";

const count = parseInt(process.argv[2], 10) || 2;
const targetUrl = process.argv[3] || "http://localhost:5173";

console.log(`Launching ${count} isolated browser(s) pointing to ${targetUrl}...`);
const browser = await chromium.launch({
  headless: false,
  args: ["--start-maximized"],
});

for (let i = 1; i <= count; i++) {
  const context = await browser.newContext({
    viewport: null,
  });
  const page = await context.newPage();
  await page.goto(targetUrl);
  console.log(`- Browser session #${i} ready`);
}

console.log("All sessions are running. Press Ctrl+C in this terminal to close.");
await new Promise(() => {});
