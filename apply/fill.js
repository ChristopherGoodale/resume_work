import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "node:fs/promises";

import { loadProfile } from "./lib/load-profile.js";
import { writeReport } from "./lib/report.js";
import { detectPlatformFromUrl } from "./lib/detect-platform.js";
import * as greenhouse from "./platforms/greenhouse.js";
import * as lever from "./platforms/lever.js";
import * as workday from "./platforms/workday.js";

const APPLY_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(APPLY_DIR, "..");

const PLATFORM_MODULES = { greenhouse, lever, workday };

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    args[key] = argv[i + 1];
  }
  return args;
}

async function findLatestResume(company) {
  const pattern = path.join(REPO_ROOT, "generated_resumes", `resume_${company}_*.pdf`);
  const matches = [];
  for await (const file of glob(pattern)) matches.push(file);
  matches.sort();
  return matches.at(-1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.platform || !args["apply-url"]) {
    console.error("Usage: node fill.js --platform <greenhouse|lever> --apply-url <url> [--resume <path>] [--job <path>]");
    process.exit(1);
  }

  const platform = args.platform;
  const applyUrl = args["apply-url"];

  if (platform !== detectPlatformFromUrl(applyUrl) && detectPlatformFromUrl(applyUrl) !== "unknown") {
    console.warn(
      `Warning: --platform ${platform} was passed but the URL looks like ${detectPlatformFromUrl(applyUrl)}. Proceeding with --platform as given.`
    );
  }

  const platformModule = PLATFORM_MODULES[platform];
  if (!platformModule) {
    console.error(`Unknown platform "${platform}". Supported: ${Object.keys(PLATFORM_MODULES).join(", ")}`);
    process.exit(1);
  }

  let resumePath = args.resume;
  if (!resumePath && args.job) {
    const companyGuess = path.basename(args.job).split("_")[0];
    resumePath = await findLatestResume(companyGuess);
  }
  if (resumePath && !path.isAbsolute(resumePath)) {
    resumePath = path.resolve(process.cwd(), resumePath);
  }

  const profile = await loadProfile({
    achievementsPath: path.join(REPO_ROOT, "obsidian_vault", "achievements.md"),
    applicationProfilePath: path.join(REPO_ROOT, "obsidian_vault", "application_profile.md"),
  });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(applyUrl, { waitUntil: "domcontentloaded" });

  const { filled, skipped, needsManualReview } = await platformModule.fillApplication({
    page,
    profile,
    resumePath,
  });

  const company = args.job ? path.basename(args.job).split("_")[0] : "unknown-company";
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const runDir = path.join(APPLY_DIR, "runs", `${company}_${dateStamp}`);

  const reportPath = await writeReport({
    runDir,
    page,
    platform,
    applyUrl,
    filled,
    skipped,
    needsManualReview,
  });

  console.log(`Report written to ${reportPath}`);
  console.log("STOPPED BEFORE SUBMIT. Review the open browser window, then submit manually.");
  console.log("Resuming the Playwright Inspector will NOT auto-submit — it only returns control here; closing the browser ends the script.");

  // Hands the filled, live browser window to the user. This is the only
  // terminal action fill.js ever takes — it must never be replaced with a
  // submit click. See apply/README.md's hard invariants.
  await page.pause();

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
