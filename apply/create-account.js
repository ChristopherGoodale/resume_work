import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generatePassword } from "./lib/generate-password.js";
import { loadProfile } from "./lib/load-profile.js";
import { appendAccountRow } from "./lib/accounts-store.js";
import { writeReport } from "./lib/report.js";
import * as workday from "./platforms/workday.js";
import * as taleo from "./platforms/taleo.js";
import * as ultipro from "./platforms/ultipro.js";

const APPLY_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(APPLY_DIR, "..");

const PLATFORM_MODULES = { workday, taleo, ultipro };

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    args[key] = argv[i + 1];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.platform || !args["signup-url"] || !args.company) {
    console.error(
      "Usage: node create-account.js --platform workday --signup-url <url> --company <name> [--email <email>]"
    );
    process.exit(1);
  }

  const platformModule = PLATFORM_MODULES[args.platform];
  if (!platformModule || !platformModule.createAccount) {
    console.error(`Account creation not supported for platform "${args.platform}". Supported: ${Object.keys(PLATFORM_MODULES).join(", ")}`);
    process.exit(1);
  }

  const profile = await loadProfile({
    achievementsPath: path.join(REPO_ROOT, "obsidian_vault", "achievements.md"),
    applicationProfilePath: path.join(REPO_ROOT, "obsidian_vault", "application_profile.md"),
  });

  const email = args.email || profile.email;
  if (!email) {
    console.error("No email available — pass --email or fill in obsidian_vault/achievements.md's Identity/Contact block.");
    process.exit(1);
  }

  // Always a brand-new random password — never derived from or reused with any existing credential.
  const password = generatePassword();

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(args["signup-url"], { waitUntil: "domcontentloaded" });
  // Heavy client-rendered career sites (Workday, etc.) haven't painted the
  // actual form yet at domcontentloaded — give the SPA a chance to hydrate
  // before a platform module goes looking for fields.
  await page.waitForLoadState("networkidle").catch(() => {});

  // Some platforms (Taleo) require a separate username distinct from email.
  const username = args.username || email.split("@")[0];

  const { filled, needsManualReview } = await platformModule.createAccount({ page, email, password, username });

  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const runDir = path.join(APPLY_DIR, "runs", `${args.company}_account_${dateStamp}`);

  const reportPath = await writeReport({
    runDir,
    page,
    platform: args.platform,
    applyUrl: args["signup-url"],
    filled,
    skipped: [],
    needsManualReview,
  });

  console.log(`Report written to ${reportPath}`);
  console.log(`Generated password (also being saved to ats_accounts.md): ${password}`);
  console.log("Review the open browser window, complete/confirm account creation yourself, then resume to record it.");

  // Same human handoff as fill.js — account creation is never clicked automatically.
  await page.pause();

  await appendAccountRow(path.join(REPO_ROOT, "ats_accounts.md"), {
    company: args.company,
    platform: args.platform,
    email,
    username,
    password,
    created: dateStamp,
    notes: "Created via apply/create-account.js — move into your password manager when convenient.",
  });
  console.log(`Recorded in ats_accounts.md (gitignored, local only).`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
