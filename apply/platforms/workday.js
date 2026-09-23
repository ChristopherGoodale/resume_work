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

  // Workday's candidate site is a heavy client-rendered SPA — the auth modal
  // frequently isn't painted yet even after networkidle. Give it a beat
  // before looking for anything.
  await page
    .locator('input[data-automation-id="email"], a:has-text("Create Account")')
    .first()
    .waitFor({ state: "visible", timeout: 15000 })
    .catch(() => {});

  // Some tenants (e.g. Avanade) open straight into the Create Account form.
  // Others (e.g. Ankura) default to Sign In with a "Create Account" link that
  // must be clicked first to reveal the registration fields (verifyPassword,
  // terms checkbox). No-ops harmlessly if the tenant already shows Create
  // Account, since the link just won't be present.
  const createAccountLink = page.getByRole("link", { name: "Create Account" }).first();
  if ((await createAccountLink.count()) > 0) {
    await createAccountLink.click();
    await page
      .locator('input[data-automation-id="verifyPassword"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    filled.push("Clicked 'Create Account' to reach the registration form");
  }

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
