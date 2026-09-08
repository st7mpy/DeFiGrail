// Capture the product clips for the launch video. See docs/product/2026-09-07-launch-video-plan.md
// Usage: node scripts/capture-launch.mjs [shot ...]      (no args = all)
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const OUT = "assets/launch-video/clips";
const TMP = "assets/launch-video/.frames";
const VW = 1440, VH = 810, FPS = 30;          // 16:9 at the plan's 1440 capture width
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const SCALE = "scale=1920:1080:flags=lanczos";
const H264 = ["-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p"];

function encodeFrames(name, n) {
  ff(["-framerate", String(FPS), "-i", `${TMP}/%05d.jpg`, "-vf", SCALE, ...H264, `${OUT}/${name}.mp4`]);
  console.log(`  ${name}.mp4  ${n} frames  ${(n / FPS).toFixed(1)}s`);
}
function encodeStill(name, png, seconds) {
  ff(["-loop", "1", "-t", String(seconds), "-i", png, "-vf", SCALE, ...H264, "-r", String(FPS), `${OUT}/${name}.mp4`]);
  console.log(`  ${name}.mp4  still  ${seconds}s`);
}

async function open(page, path) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.waitForTimeout(1600);          // let aurora + fonts settle
}

// Write a screenshot buffer out as `times` consecutive frames (cheap way to hold).
let frameNo = 0;
const resetFrames = () => { rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true }); frameNo = 0; };
const push = (buf, times = 1) => { for (let i = 0; i < times; i++) writeFileSync(`${TMP}/${String(frameNo++).padStart(5, "0")}.jpg`, buf); };
const shot = (page) => page.screenshot({ type: "jpeg", quality: 94 });

// Playwright drives the mouse without drawing one, and on the two shots where the drag IS
// the point an invisible cursor makes the motion look like it happened by itself.
async function cursor(page) {
  await page.addStyleTag({ content: `#cur{position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;
    background:#000080;opacity:.75;z-index:9999;pointer-events:none}` });
  await page.evaluate(() => {
    const d = document.createElement("div"); d.id = "cur"; document.body.append(d);
    addEventListener("pointermove", (e) => { d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px"; }, true);
  });
}

// Real-time capture, for the two shots whose motion can't be frame-stepped (CSS animation,
// physics). Chrome's own screencast, at deviceScaleFactor, with true frame timestamps —
// so playback speed is real rather than however fast the screenshot loop happened to run.
async function record(page, ctx, act) {
  const cdp = await ctx.newCDPSession(page);
  resetFrames();
  const times = [];
  cdp.on("Page.screencastFrame", async ({ data, sessionId, metadata }) => {
    times.push(metadata.timestamp);
    writeFileSync(`${TMP}/${String(frameNo++).padStart(5, "0")}.jpg`, Buffer.from(data, "base64"));
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: VW * 2, maxHeight: VH * 2 });
  await act();
  const end = Date.now() / 1000;                 // screencast emits nothing while a page is static,
  await cdp.send("Page.stopScreencast");         // so the final hold has to come off the wall clock
  await page.waitForTimeout(300);
  // Clamp only the low end: screencast timestamps carry jitter, and an out-of-order pair yields
  // a negative duration, which the concat demuxer rejects. The high end must stay open — a long
  // gap is a genuine static hold, not an error.
  const list = times.map((t, i) => {
    const d = (i + 1 < times.length ? times[i + 1] : end) - t;
    return `file '${String(i).padStart(5, "0")}.jpg'\nduration ${Math.max(1 / 240, d).toFixed(4)}`;
  }).join("\n");
  writeFileSync(`${TMP}/list.txt`, list + `\nfile '${String(times.length - 1).padStart(5, "0")}.jpg'\n`);
  return times.length;
}
function encodeTimed(name, n) {
  ff(["-f", "concat", "-safe", "0", "-i", `${TMP}/list.txt`, "-vf", `${SCALE},fps=${FPS}`, ...H264, `${OUT}/${name}.mp4`]);
  console.log(`  ${name}.mp4  ${n} real-time frames`);
}

// The force layout settles somewhere different on every load, so a hardcoded node coordinate
// misses. ProtocolGraph sets cursor:pointer on hover, which is its own hit test — ring-scan
// outward from the centre and take the first real hit.
async function findNode(page, cx, cy) {
  const hit = () => page.evaluate(() => getComputedStyle(document.querySelector("canvas")).cursor === "pointer");
  for (let r = 0; r <= 340; r += 15) {
    const steps = r ? Math.max(8, Math.round((2 * Math.PI * r) / 15)) : 1;
    for (let a = 0; a < steps; a++) {
      const t = (a / steps) * Math.PI * 2;
      const x = Math.round(cx + r * Math.cos(t)), y = Math.round(cy + r * Math.sin(t));
      await page.mouse.move(x, y);
      if (await hit()) return [x, y];
    }
  }
  throw new Error("no graph node found");
}

const SHOTS = {
  // 2 + 10 — hero. Recorded, not stilled: the concept→mechanics flow steps through its cycle
  // and the aurora drifts, and both are worth having. The live price ticker is hidden — it dates
  // the video exactly the way /news does, which is why /news was cut.
  async hero(page, ctx) {
    await open(page, "/");
    await page.addStyleTag({ content: ".ticker{display:none!important}" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/shot10-endcard.png` });   // 10 is static; URL goes on in the edit
    encodeStill("shot10-hero-endcard", `${OUT}/shot10-endcard.png`, 2);
    encodeTimed("shot02-hero", await record(page, ctx, () => page.waitForTimeout(6500)));
  },

  // 3 — the money shot. Hold at 300, then ease 300 → 1100.
  async uniswapV3(page) {
    await open(page, "/learn/uniswap-v3");
    resetFrames();
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400);
    push(await shot(page), 4 * FPS);                       // 4s hold
    const N = 8 * FPS;
    for (let i = 1; i <= N; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(300 + ease(i / N) * 800));
      push(await shot(page));
    }
    encodeFrames("shot03-uniswap-v3", frameNo);
  },

  // 4 — the formula moves. Plan said "drag the curve"; ILCurve has no drag, it has live
  // number inputs. Typing CURRENT PRICE up walks the marker along the curve and counts the IL%.
  async playground(page) {
    await open(page, "/playground");
    await page.addStyleTag({ content: ".ticker{display:none!important}" });
    await page.evaluate(() => window.scrollTo(0, 121));   // measured: centres the .pg-tool card (213→838) in 810
    const input = page.locator("#il-current-price");
    await page.waitForTimeout(500);
    resetFrames();
    push(await shot(page), 20);
    const N = 4 * FPS;
    for (let i = 1; i <= N; i++) {
      await input.fill(String(Math.round(2000 + ease(i / N) * 1000)));
      push(await shot(page));
    }
    push(await shot(page), 25);
    encodeFrames("shot04-playground-il", frameNo);
  },

  // 4b — alternative. ILCurve has no drag; RangeLiquidity does, and it is the v3 topic shot 3
  // just explained, so the two cut together. Dragging price past the upper bound is the moment
  // the position converts entirely to one asset.
  async playgroundDrag(page, ctx) {
    await open(page, "/playground");
    await page.addStyleTag({ content: ".ticker{display:none!important}" });
    await page.evaluate(() => window.scrollTo(0, 1951));   // measured: centres the Concentrated Liquidity card (2047, h617)
    await page.waitForTimeout(500);
    await cursor(page);
    const box = await page.locator("#rl-price").boundingBox();
    const y = Math.round(box.y + box.height / 2);
    const at = (v) => Math.round(box.x + ((v - 500) / 3500) * box.width);
    encodeTimed("shot04b-playground-range", await record(page, ctx, async () => {
      await page.mouse.move(at(2000), y, { steps: 15 });
      await page.waitForTimeout(700);
      await page.mouse.down();
      await page.mouse.move(at(3400), y, { steps: 90 });   // crosses the Pb = 3000 upper bound
      await page.waitForTimeout(900);
      await page.mouse.move(at(2600), y, { steps: 45 });   // and back inside the range
      await page.mouse.up();
      await page.waitForTimeout(1200);
    }));
  },

  // 6 — graph. Physics settles in real time, so this one records rather than frame-steps.
  async graph(page, ctx) {
    await open(page, "/graph");
    await page.addStyleTag({ content: ".ticker{display:none!important}" });   // live prices date the video
    await page.waitForTimeout(4000);                                          // let the force layout settle
    await cursor(page);
    const [x, y] = await findNode(page, VW / 2, VH / 2 + 40);
    console.log(`  node at ${x},${y}`);
    await page.mouse.move(0, 0);                           // clear the probe's hover before recording
    await page.waitForTimeout(400);
    encodeTimed("shot06-graph", await record(page, ctx, async () => {
      await page.mouse.move(x, y, { steps: 20 });
      await page.waitForTimeout(800);                      // hover traces the links
      await page.mouse.down();
      await page.mouse.move(x + 190, y - 120, { steps: 60 });
      await page.waitForTimeout(300);
      await page.mouse.up();
      await page.waitForTimeout(2400);                     // let the physics settle
    }));
  },

  // 7 — the Black Thursday caveat. Static hold; the edit adds a slow push.
  async liquidations(page) {
    await open(page, "/learn/liquidations");
    await page.evaluate(() => window.scrollTo(0, 1417));
    await page.waitForTimeout(500);
    const png = `${OUT}/shot07-liquidations.png`;
    await page.screenshot({ path: png });
    encodeStill("shot07-liquidations", png, 4);
  },

  // 8 — quiz. Core → Expert, then one scenario question into frame.
  async quiz(page, ctx) {
    await open(page, "/quiz");
    await page.addStyleTag({ content: ".ticker{display:none!important}" });
    await page.evaluate(() => window.scrollTo(0, 40));    // measured: toggle (187) + full card (278→760), footer (850) just out
    await page.waitForTimeout(500);
    encodeTimed("shot08-quiz-expert", await record(page, ctx, async () => {
      await page.waitForTimeout(1400);                    // hold on Core
      await page.getByRole("tab", { name: /Expert/ }).click();
      await page.waitForTimeout(3200);                    // the bank swaps under the toggle
    }));
  },
};

const want = process.argv.slice(2);
const run = Object.keys(SHOTS).filter((k) => !want.length || want.includes(k));
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const name of run) {
  console.log(`\n${name}`);
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await SHOTS[name](page, ctx);
  await ctx.close();
}
await browser.close();
rmSync(TMP, { recursive: true, force: true });
console.log("\ndone →", OUT);
