/**
 * Full UltiPro (UKG Pro Recruiting) job-application automation is out of
 * scope for now — the application form itself sits behind account creation
 * and hasn't been designed/verified yet. See application_intake.md's
 * routing notes.
 */
export async function fillApplication() {
  throw new Error(
    "UltiPro job-application automation not implemented (stretch goal — route these to 'apply manually')"
  );
}

/**
 * Fills UltiPro's account signup form with a freshly generated password.
 * UltiPro/UKG Pro Recruiting authenticates candidates through a shared
 * Auth0-hosted "New Universal Login" identity provider (signin-us.ultipro.com),
 * not a page on the tenant's own recruiting2.ultipro.com domain. `page` is
 * expected to already be on the job board's login-redirect URL (the
 * `.../Account/Login?redirectUrl=...` link surfaced in the job JSON) — that
 * redirects to Auth0's login screen, which links out to a separate
 * `/u/signup` screen holding the actual registration form. This function
 * drives that click-through chain first, since Auth0's `state` query param
 * is a short-lived, transaction-bound nonce that can't be constructed or
 * reused outside the live session. Selectors verified directly against a
 * live UKG Pro Recruiting tenant (Network Distribution, NET1010NWRK) —
 * Auth0's New Universal Login uses plain `id="email"` / `id="password"` on
 * every tenant since it's shared infrastructure, not tenant-specific markup,
 * so this should generalize across other UltiPro/UKG Pro postings, though
 * that's untested beyond this one tenant. Never clicks the "Continue" submit
 * button — that decision belongs to create-account.js via page.pause(), and
 * never reads/reuses an existing password: `password` must always come from
 * apply/lib/generate-password.js for a brand-new account.
 */
export async function createAccount({ page, email, password }) {
  const filled = [];
  const needsManualReview = [];

  const signUpLink = page.getByRole("link", { name: "Sign up" }).first();
  if ((await signUpLink.count()) > 0) {
    await signUpLink.click();
    await page.waitForLoadState("domcontentloaded");
    filled.push("Clicked 'Sign up' to reach the registration form");
  } else if ((await page.locator("#email").count()) === 0) {
    needsManualReview.push(
      "Could not find the 'Sign up' link — UltiPro/Auth0 flow may differ for this tenant"
    );
  }

  const emailField = page.locator("#email").first();
  if ((await emailField.count()) > 0) {
    await emailField.fill(email);
    filled.push("Email");
  } else {
    needsManualReview.push("Email field (selector not found — this tenant's Auth0 markup may differ)");
  }

  const passwordField = page.locator("#password").first();
  if ((await passwordField.count()) > 0) {
    await passwordField.fill(password);
    filled.push("Password (freshly generated)");
  } else {
    needsManualReview.push("Password field (selector not found — this tenant's Auth0 markup may differ)");
  }

  return { filled, needsManualReview };
}
