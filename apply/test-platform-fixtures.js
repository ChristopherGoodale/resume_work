import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

import * as greenhouse from "./platforms/greenhouse.js";
import * as lever from "./platforms/lever.js";

const APPLY_DIR = path.dirname(fileURLToPath(import.meta.url));
const fixtureUrl = (name) => "file://" + path.join(APPLY_DIR, "fixtures", name).replace(/\\/g, "/");

const SAMPLE_PROFILE = {
  name: "Jordan Example",
  email: "jordan.example@example.com",
  phone: "(555) 123-4567",
  linkedin: "https://www.linkedin.com/in/jordan-example/",
  github: "https://github.com/jordan-example",
  boilerplate: { whyInterested: "Sample answer.", howHeard: "Company careers page" },
};

/**
 * Offline smoke test against local fixtures (no live network / no real
 * employer touched) — checks that known fields get filled, password fields
 * always land in `skipped`, and nothing here ever calls a submit action.
 * Run with: node test-platform-fixtures.js
 */
async function testGreenhouse(browser) {
  const page = await browser.newPage();
  await page.goto(fixtureUrl("greenhouse_sample.html"));

  const { filled, skipped } = await greenhouse.fillApplication({
    page,
    profile: SAMPLE_PROFILE,
    resumePath: null,
  });

  assert.ok(filled.includes("First name"), `Expected First name filled, got: ${filled}`);
  assert.ok(filled.includes("Email"), `Expected Email filled, got: ${filled}`);
  assert.ok(
    skipped.some((s) => /password/i.test(s)),
    `Expected a password field in skipped, got: ${skipped}`
  );
  assert.equal(await page.locator("#first_name").inputValue(), SAMPLE_PROFILE.name.split(" ")[0]);
  assert.equal(await page.locator("#email").inputValue(), SAMPLE_PROFILE.email);

  await page.close();
  console.log("PASS: greenhouse fixture — known fields filled, password skipped.");
}

async function testLever(browser) {
  const page = await browser.newPage();
  await page.goto(fixtureUrl("lever_sample.html"));

  const { filled, skipped } = await lever.fillApplication({
    page,
    profile: SAMPLE_PROFILE,
    resumePath: null,
  });

  assert.ok(filled.includes("Full name"), `Expected Full name filled, got: ${filled}`);
  assert.ok(filled.includes("Email"), `Expected Email filled, got: ${filled}`);
  assert.ok(
    skipped.some((s) => /password/i.test(s)),
    `Expected a password field in skipped, got: ${skipped}`
  );
  assert.equal(await page.locator('input[name="name"]').inputValue(), SAMPLE_PROFILE.name);

  await page.close();
  console.log("PASS: lever fixture — known fields filled, password skipped.");
}

async function main() {
  const browser = await chromium.launch();
  await testGreenhouse(browser);
  await testLever(browser);
  await browser.close();
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exit(1);
});
