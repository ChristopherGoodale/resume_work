import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

import { isPasswordField } from "./lib/fill-helpers.js";

const APPLY_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_URL = "file://" + path.join(APPLY_DIR, "fixtures", "password-guard.html").replace(/\\/g, "/");

/**
 * Asserts the one behavior that must never regress: password-typed and
 * password-labeled fields are always detected as skip-worthy, regardless of
 * platform-specific selector logic. Run with: node test-password-guard.js
 */
async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(FIXTURE_URL);

  const emailField = page.locator("#email");
  const typedPasswordField = page.locator("#account_password");
  const labeledPasswordField = page.locator("#confirm_password");

  assert.equal(await isPasswordField(emailField), false, "Email field must NOT be flagged as password");
  assert.equal(await isPasswordField(typedPasswordField), true, "type=\"password\" field must be flagged");
  assert.equal(
    await isPasswordField(labeledPasswordField),
    true,
    "Field labeled 'Confirm Password' (type=text) must still be flagged via label match"
  );

  await browser.close();
  console.log("PASS: password-guard fixture — all three assertions held.");
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exit(1);
});
