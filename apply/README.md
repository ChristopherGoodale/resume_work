# apply/

Two things live here: `fill.js` pre-fills off-LinkedIn ATS application forms (Greenhouse, Lever), and `create-account.js` creates the per-employer accounts some ATS platforms (Workday) require before the application form is even visible. Both stop before the final click and hand off to a human. Invoked by Claude via `application_intake.md`, not meant to be a standing service.

## Hard invariants — do not violate when editing this code

1. **No code path may click anything resembling submit/apply-now/create-account.** The one and only terminal action of `fill.js` and `create-account.js` is `await page.pause()`, which hands the live, filled browser window to the user. Do not add an `--auto-submit` flag or any selector click for `/submit|apply now|send application|create account/i`.
2. **`fill.js` (job applications) never types a password.** Any field with `type="password"` or a label matching `/password|passwd|pwd/i` must always be skipped and reported, never filled — see `lib/report.js`'s `skipped` list and the guard in each `platforms/*.js` module's `fillApplication`. A job-application form is not the place to be inventing account credentials.
3. **`create-account.js` (account creation) is the one deliberate exception**, and only for a brand-new account: the password always comes fresh from `lib/generate-password.js` — never read, derived, or reused from `ats_accounts.md` or anywhere else — and is recorded in `ats_accounts.md` (gitignored, local-only) after the human confirms account creation. That file must never be committed; `ats_accounts.example.md` is the only version ever pushed.
4. **Never fabricate an answer.** If a field can't be matched against `application_profile.md` or `achievements.md`, leave it blank and add it to `needs_manual_review` in the report — do not guess.

## Setup

```
cd apply
npm install
npx playwright install chromium
```

(Chromium may already be cached at `%LOCALAPPDATA%\ms-playwright` from a prior install — `npx playwright install` will reuse it if the version matches.)

## Usage

```
node fill.js --platform greenhouse --apply-url "<url>" --resume "../generated_resumes/resume_Acme_2026.09.17.pdf" --job "../job_postings/Acme_role_2026.09.17.md"
```

Launches a headed browser, fills what it can, uploads the resume, screenshots, writes `runs/[company]_[date]/report.md`, then pauses via the Playwright Inspector for manual review and submission.

```
node create-account.js --platform workday --signup-url "<url>" --company "Acme Corp" [--email you+acme@example.com]
```

Generates a fresh password, fills the signup form, pauses for you to confirm account creation in the browser, then appends a row (including the password) to `ats_accounts.md`. Move the password into your own password manager whenever convenient — the row in `ats_accounts.md` is a local record either way, never pushed to git.

## Testing without touching a real employer

Use `fixtures/*.html` (local, offline) or each vendor's own public job board (`boards.greenhouse.io/greenhouse`, `jobs.lever.co/lever`) — never a real target employer's posting, since the goal is only to verify field-fill and the password-skip guard, not to actually apply.
