# 2026-09-17 — Job-Application Automation Pipeline

## The "Why" (Design Decisions)

**LinkedIn stays entirely manual — no automation touches it.** LinkedIn's
ToS explicitly prohibits automated form-filling and it runs bot detection
against exactly this kind of script. The cost of getting caught (account
flag or ban) is disproportionate to the time saved on a form that's usually
one click ("Easy Apply") anyway. So `application_intake.md` routes LinkedIn
postings to "resume generated, apply yourself" and stops — no Playwright
code path ever opens a linkedin.com page.

**Off-LinkedIn ATS forms get filled, but the run always stops before
submit.** Submitting a job application is irreversible and represents you to
a real employer — a misread custom question or a stale selector producing a
half-filled form is a real cost if it goes out unreviewed. `apply/fill.js`'s
last action is `await page.pause()` — Playwright's built-in Inspector, which
halts the script and hands the live, already-filled browser window to you.
This was chosen over a custom "wait for keypress" hack because it's a
first-class Playwright feature built for exactly this human-checkpoint use
case, and because it can't accidentally be skipped the way a conditional
flag could.

**Job-application forms never see a password.**
`apply/lib/fill-helpers.js`'s `isPasswordField` check inspects every field's
`type` attribute and label text and always adds it to `skipped` in
`fill.js`'s flow, independent of what platform code found it or what data
happens to be sitting in a profile file — there's no legitimate reason a
job-application form needs a credential typed into it. (Account *creation*,
a separate and later-added flow, does generate and record a password
deliberately — see
[2026-09-17-account-password-storage-revision.md](2026-09-17-account-password-storage-revision.md)
for why that's a distinct decision from this one, not a contradiction of
it.)

**`application_profile.md` is a new file, separate from `achievements.md`.**
ATS forms ask about things a resume never should — desired salary, work
authorization, EEO/demographic self-identification, "why this company."
Mixing that into `achievements.md` would pollute the resume content bank
with data that should never appear on a resume itself. It follows the same
content/style separation-of-concerns pattern the original project already
established (see the bootstrap entry) — just one more axis of "this changes
for different reasons than that."

**Node + Playwright, not Python.** Node v22 and npm were already installed,
and Playwright's Chromium binary was already cached on this machine from an
unrelated prior install — so `npm install` mostly reused an existing
download rather than pulling anything fresh. Python's Playwright package
wasn't installed anywhere. Introducing Python here would mean standing up a
second packaging ecosystem in a repo that has never had one (`resume_work`
was pure markdown + Pandoc before this), for a library that has an
equally-capable JS binding already positioned to just work.

**Custom ATS questions are matched by fuzzy label text, not hardcoded
per-company selectors.** Greenhouse and Lever are templated products — the
*standard* fields (name, email, resume upload) have stable selectors across
every company using them. But *custom* questions ("Are you authorized to
work in the US?", "What's your salary expectation?") are written differently
by every employer. `lib/fill-helpers.js`'s `matchQuestionToProfile` uses a
small set of regex categories (sponsorship, compensation, relocation, EEO,
etc.) against each question's label text, rather than a per-company
selector map that would need updating for every new employer. Anything that
doesn't match a category is left blank and reported under "needs manual
review" — the system never guesses at an unmatched question.

**Workday is a stub, not a half-built feature.**
`apply/platforms/workday.js` throws immediately rather than attempting a
partial fill, because Workday requires creating a per-employer account
*before* the application form is even visible — a materially different flow
(account creation, then possibly email verification) that hasn't been
designed yet. `application_intake.md` routes Workday postings to "apply
manually" today rather than shipping automation that only works halfway.

**Two `.gitignore` rules didn't do what they looked like they'd do — caught
by testing, not by reading the file.** `apply/runs/` (trailing slash)
excludes the *directory itself*, which means git never even looks inside it
to honor a `!apply/runs/.gitkeep` negation underneath — the fix was
`apply/runs/*` instead, which excludes only the directory's *contents*,
leaving room for the negation to apply. Separately, this repo's
Python-boilerplate `.gitignore` template already contained a bare `lib/`
rule (from its "Distribution / packaging" section), which silently matched
the new `apply/lib/` folder at any depth and excluded all four of its
modules with no error or warning. Both were only caught by actually running
`git status` / `git check-ignore -v` against the real repo after writing the
rules — a `.gitignore` line reads like an assertion, but it's really a
pattern match, and pattern matches need to be checked against reality the
same as any other code.

## Core Concepts

- **`page.pause()` as a human handoff, not just a debug tool.** Playwright's
  Inspector is usually described as a development aid; here it's repurposed
  as the production mechanism for "let a human take over" — the browser
  state (filled fields, everything) survives the handoff intact.
- **Headed vs. headless browser launch.** `apply/fill.js` launches Playwright
  with `headless: false` deliberately — a headless browser has no window for
  a human to review or interact with, so headed mode is required for the
  stop-before-submit design to mean anything.
- **gitignore pattern semantics: trailing slash vs. wildcard.** `dir/`
  matches the directory as a unit and blocks git from evaluating anything
  inside it, including later negations; `dir/*` matches only its contents,
  which negations can then selectively restore. This distinction only
  matters when you need to un-ignore one file inside an otherwise-ignored
  folder.
- **gitignore last-match-wins.** Rules are evaluated in order, and the last
  matching pattern decides a path's fate — which is exactly what let a later
  `!apply/lib/**` negation override an earlier, unrelated `lib/` rule from a
  boilerplate template further up the same file.
- **Defense in depth.** The password guard exists at both the schema level
  (no column) and the code level (an explicit type/label check) — neither
  one depends on the other being correct, so a mistake in one doesn't
  compromise the requirement.

## Implementation Breakdown

- [`application_intake.md`](../application_intake.md) — the new recipe:
  fetch a pasted URL, classify its platform, save the posting, hand off to
  `methodology.md` for resume generation, then route by platform. Owns
  intake/routing only — it explicitly delegates content generation rather
  than duplicating it.
- [`obsidian_vault/application_profile.md`](../obsidian_vault/application_profile.md)
  — non-resume application data (work auth, compensation, EEO, boilerplate
  answers), gitignored because it's more sensitive than public resume
  content. `application_profile.example.md` is the tracked schema.
- [`ats_accounts.md`](../ats_accounts.md) — per-employer account registry,
  gitignored, no password column by design. `ats_accounts.example.md` is the
  tracked schema.
- [`applications_log.md`](../applications_log.md) — one row per application
  actually submitted, appended only after the user confirms they clicked
  submit themselves.
- [`apply/fill.js`](../apply/fill.js) — the CLI entrypoint: launches a headed
  browser, delegates to the matching `platforms/*.js` module, writes a
  report, and ends with `page.pause()`.
- [`apply/lib/load-profile.js`](../apply/lib/load-profile.js) — parses
  `application_profile.md` and `achievements.md`'s Identity/Contact block
  into one merged object; strips markdown-link wrapping from URLs and scrubs
  any field still containing a `[FILL IN...]` placeholder (recursively,
  including nested objects like `eeo` and `boilerplate`) so an unfilled
  field is reported as missing rather than typed literally into a form.
- [`apply/lib/fill-helpers.js`](../apply/lib/fill-helpers.js) — the shared
  `isPasswordField` guard and `matchQuestionToProfile` fuzzy matcher used by
  every platform module.
- [`apply/platforms/greenhouse.js`](../apply/platforms/greenhouse.js) /
  [`apply/platforms/lever.js`](../apply/platforms/lever.js) — known-selector
  fills for each vendor's standard fields plus fuzzy-matched custom
  questions. [`apply/platforms/workday.js`](../apply/platforms/workday.js)
  is a deliberate stub.
- [`apply/test-password-guard.js`](../apply/test-password-guard.js) /
  [`apply/test-platform-fixtures.js`](../apply/test-platform-fixtures.js) —
  offline smoke tests against local HTML fixtures in `apply/fixtures/`,
  so the fill logic and the password guard can be verified without touching
  a live site or a real employer.
