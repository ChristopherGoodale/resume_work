/**
 * Full Workday job-application automation is still out of scope (a
 * materially different, harder flow than Greenhouse/Lever) — see
 * application_intake.md's routing notes.
 */
export async function fillApplication() {
  throw new Error(
    "Workday job-application automation not implemented (stretch goal — route these to 'apply manually')"
  );
}

/**
 * Fills a Workday "Create Account" form with a freshly generated password.
 * Workday's candidate-site create-account modal uses stable
 * data-automation-id attributes across tenants. Never clicks the submit
 * button — that decision belongs to create-account.js via page.pause(), and
 * never reads/reuses an existing password: `password` must always come from
 * apply/lib/generate-password.js for a brand-new account.
 */
export async function createAccount({ page, email, password }) {
  const filled = [];
  const needsManualReview = [];

  const emailField = page.locator('input[data-automation-id="email"]').first();
  if ((await emailField.count()) > 0) {
    await emailField.fill(email);
    filled.push("Email");
  } else {
    needsManualReview.push("Email field (selector not found — Workday markup may differ for this tenant)");
  }

  const passwordField = page.locator('input[data-automation-id="password"]').first();
  if ((await passwordField.count()) > 0) {
    await passwordField.fill(password);
    filled.push("Password (freshly generated)");
  } else {
    needsManualReview.push("Password field (selector not found — Workday markup may differ for this tenant)");
  }

  const verifyPasswordField = page.locator('input[data-automation-id="verifyPassword"]').first();
  if ((await verifyPasswordField.count()) > 0) {
    await verifyPasswordField.fill(password);
    filled.push("Verify password");
  }

  const termsCheckbox = page.locator('input[data-automation-id="createAccountCheckbox"]').first();
  if ((await termsCheckbox.count()) > 0) {
    await termsCheckbox.check();
    filled.push("Terms/create-account checkbox");
  }

  return { filled, needsManualReview };
}
