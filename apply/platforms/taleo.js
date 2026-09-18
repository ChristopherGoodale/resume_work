/**
 * Full Taleo job-application automation is out of scope for now — like
 * Workday, the actual application form sits behind a multi-step, stateful
 * JSF wizard (personal info, resume upload, custom/EEO questions, review)
 * that hasn't been designed/verified yet. See application_intake.md's
 * routing notes.
 */
export async function fillApplication() {
  throw new Error(
    "Taleo job-application automation not implemented (stretch goal — route these to 'apply manually')"
  );
}

/**
 * Fills Taleo's "New User Registration" form with a freshly generated
 * password. `page` is expected to already be on the job's apply URL (the
 * `jobapply.ftl?job=...` page) — Taleo's registration form isn't reachable
 * by a direct URL, it sits behind a Privacy Agreement step and a Login page,
 * so this function drives that real click-through chain first. Selectors
 * verified directly against a live Taleo careersection instance
 * (lockton.taleo.net) — the `dialogTemplate-dialogForm-*` ids are part of
 * Taleo's shared careersection template, not company-specific markup, so
 * this should generalize across other Taleo-hosted career sites, though
 * that's untested beyond this one tenant. Never clicks the register
 * button — that decision belongs to create-account.js via page.pause(), and
 * never reads/reuses an existing password: `password` must always come from
 * apply/lib/generate-password.js for a brand-new account.
 */
export async function createAccount({ page, email, password, username }) {
  const filled = [];
  const needsManualReview = [];

  const privacyContinueButton = page
    .locator("#dialogTemplate-dialogForm-StatementBeforeAuthentificationContent-ContinueButton")
    .first();
  if ((await privacyContinueButton.count()) > 0) {
    await privacyContinueButton.click();
    await page.waitForLoadState("domcontentloaded");
    filled.push("Privacy Agreement (accepted to proceed to login)");
  }

  const newUserButton = page.locator("#dialogTemplate-dialogForm-login-register").first();
  if ((await newUserButton.count()) > 0) {
    await newUserButton.click();
    await page.waitForLoadState("domcontentloaded");
    filled.push("Clicked 'New User' to reach registration form");
  } else if ((await page.locator("#dialogTemplate-dialogForm-userName").count()) === 0) {
    needsManualReview.push("Could not find the 'New User' button — Taleo flow may differ for this tenant");
  }

  const usernameField = page.locator("#dialogTemplate-dialogForm-userName").first();
  if ((await usernameField.count()) > 0) {
    await usernameField.fill(username || email.split("@")[0]);
    filled.push("Username");
  } else {
    needsManualReview.push("Username field (selector not found — this tenant's Taleo markup may differ)");
  }

  const passwordField = page.locator("#dialogTemplate-dialogForm-password").first();
  if ((await passwordField.count()) > 0) {
    await passwordField.fill(password);
    filled.push("Password (freshly generated)");
  } else {
    needsManualReview.push("Password field (selector not found — this tenant's Taleo markup may differ)");
  }

  const confirmPasswordField = page.locator("#dialogTemplate-dialogForm-passwordConfirm").first();
  if ((await confirmPasswordField.count()) > 0) {
    await confirmPasswordField.fill(password);
    filled.push("Confirm password");
  }

  const emailField = page.locator("#dialogTemplate-dialogForm-email").first();
  if ((await emailField.count()) > 0) {
    await emailField.fill(email);
    filled.push("Email");
  } else {
    needsManualReview.push("Email field (selector not found — this tenant's Taleo markup may differ)");
  }

  const confirmEmailField = page.locator("#dialogTemplate-dialogForm-emailConfirm").first();
  if ((await confirmEmailField.count()) > 0) {
    await confirmEmailField.fill(email);
    filled.push("Confirm email");
  }

  return { filled, needsManualReview };
}
