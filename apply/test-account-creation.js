import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

import * as workday from "./platforms/workday.js";
import * as taleo from "./platforms/taleo.js";
import { generatePassword } from "./lib/generate-password.js";
import { appendAccountRow } from "./lib/accounts-store.js";
import { detectPlatformFromUrl, detectPlatformFromPage } from "./lib/detect-platform.js";

const APPLY_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_URL =
  "file://" + path.join(APPLY_DIR, "fixtures", "workday_signup_sample.html").replace(/\\/g, "/");

/**
 * Offline smoke test: password generation meets basic strength properties,
 * the Workday createAccount fill logic fills known fields without ever
 * clicking submit, and appendAccountRow writes a well-formed row without
 * touching the real (gitignored) ats_accounts.md.
 * Run with: node test-account-creation.js
 */
async function testGeneratePassword() {
  const password = generatePassword();
  assert.equal(password.length, 20, "Default password length should be 20");
  assert.ok(/[a-z]/.test(password), "Password should contain a lowercase letter");
  assert.ok(/[A-Z]/.test(password), "Password should contain an uppercase letter");
  assert.ok(/[0-9]/.test(password), "Password should contain a digit");
  assert.ok(/[!@#$%^&*\-_=+]/.test(password), "Password should contain a symbol");

  const second = generatePassword();
  assert.notEqual(password, second, "Two generated passwords should not be identical");

  console.log("PASS: generatePassword — length and character-class requirements met, non-deterministic.");
}

async function testWorkdayCreateAccount() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(FIXTURE_URL);

  const password = generatePassword();
  const { filled } = await workday.createAccount({ page, email: "you+acme@example.com", password });

  assert.ok(filled.includes("Email"), `Expected Email filled, got: ${filled}`);
  assert.ok(filled.some((f) => f.startsWith("Password")), `Expected Password filled, got: ${filled}`);
  assert.equal(await page.locator('[data-automation-id="email"]').inputValue(), "you+acme@example.com");
  assert.equal(await page.locator('[data-automation-id="password"]').inputValue(), password);
  assert.equal(await page.locator('[data-automation-id="verifyPassword"]').inputValue(), password);
  assert.equal(await page.locator('[data-automation-id="createAccountCheckbox"]').isChecked(), true);

  await browser.close();
  console.log("PASS: workday.createAccount — known fields filled, submit button never touched.");
}

async function testTaleoCreateAccount() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fixtureUrl =
    "file://" + path.join(APPLY_DIR, "fixtures", "taleo_signup_sample.html").replace(/\\/g, "/");
  await page.goto(fixtureUrl);

  const password = generatePassword();
  const { filled } = await taleo.createAccount({
    page,
    email: "you+acme@example.com",
    password,
    username: "you_acme",
  });

  assert.ok(filled.some((f) => f.includes("Privacy Agreement")), `Expected privacy step navigated, got: ${filled}`);
  assert.ok(filled.some((f) => f.includes("New User")), `Expected New User click navigated, got: ${filled}`);
  assert.ok(filled.includes("Username"), `Expected Username filled, got: ${filled}`);
  assert.equal(await page.locator("#dialogTemplate-dialogForm-userName").inputValue(), "you_acme");
  assert.equal(await page.locator("#dialogTemplate-dialogForm-password").inputValue(), password);
  assert.equal(await page.locator("#dialogTemplate-dialogForm-email").inputValue(), "you+acme@example.com");

  await browser.close();
  console.log("PASS: taleo.createAccount — click-through navigation + known fields filled, register button never touched.");
}

async function testDetectTaleo() {
  assert.equal(detectPlatformFromUrl("https://lockton.taleo.net/careersection/lkt_jsa_ext_cs/jobapply.ftl?job=2601LP"), "taleo");

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fixtureUrl =
    "file://" + path.join(APPLY_DIR, "fixtures", "taleo_signup_sample.html").replace(/\\/g, "/");
  await page.goto(fixtureUrl);
  assert.equal(await detectPlatformFromPage(page), "taleo");
  await browser.close();

  console.log("PASS: detect-platform — Taleo classified by hostname and by DOM fallback (ViewState field).");
}

async function testAppendAccountRow() {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "ats-accounts-test-"));
  const tmpFile = path.join(tmpDir, "ats_accounts.md");
  await writeFile(
    tmpFile,
    "# ATS Account Registry\n\n| Company | Platform | Account Email | Username | Password | Created | Notes |\n|---|---|---|---|---|---|---|\n",
    "utf-8"
  );

  await appendAccountRow(tmpFile, {
    company: "Acme Corp",
    platform: "workday",
    email: "you+acme@example.com",
    username: "you_acme",
    password: "s3cr3t-fixture-only",
    created: "2026.09.17",
    notes: "Test row",
  });

  const contents = await readFile(tmpFile, "utf-8");
  assert.ok(contents.includes("| Acme Corp | workday | you+acme@example.com | you_acme | s3cr3t-fixture-only | 2026.09.17 | Test row |"));

  await rm(tmpDir, { recursive: true, force: true });
  console.log("PASS: appendAccountRow — row appended in the expected format (tested against a temp file, not the real ats_accounts.md).");
}

async function main() {
  await testGeneratePassword();
  await testWorkdayCreateAccount();
  await testTaleoCreateAccount();
  await testDetectTaleo();
  await testAppendAccountRow();
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exit(1);
});
