---
name: application_intake
description: Recipe for turning a pasted job-posting URL into a saved posting, a tailored resume, and — for off-LinkedIn ATS platforms — a pre-filled (never submitted) application form. Delegates resume generation to methodology.md rather than duplicating it.
---

# Application Intake Methodology

Instructions for Claude: follow this end to end whenever the user pastes a job posting URL and asks to generate an application for it.

## Non-negotiable rules

- **Never submit anything, on any platform, autonomously.** LinkedIn is manual-only — its ToS prohibits automated form-filling and it runs bot detection, so no code here ever touches a LinkedIn page. Off-LinkedIn ATS forms get filled by Playwright but the run always stops before the submit click (via `page.pause()`) — the user reviews and submits themselves.
- **Never type an existing/reused password, and never push a password to git.** `apply/fill.js` (job applications) always skips any field typed or labeled as a password. The one deliberate exception is `apply/create-account.js`, which generates a brand-new random password for a new account and records it in `ats_accounts.md` — that file is gitignored and must never be committed; only `ats_accounts.example.md` (no real credentials) is ever pushed.
- **Never invent resume content.** Resume generation still goes through `methodology.md` unchanged — this file only owns intake/routing, not content selection.

## Steps

1. **Fetch.** Fetch the pasted URL's rendered content.
2. **Extract.** Pull out: company name, role/position title, full job description text, and the *actual apply URL* (may differ from the posting URL — e.g. a LinkedIn post linking out to a company's own Greenhouse/Lever board).
3. **Classify** the apply URL's platform by hostname (fall back to a DOM check for an embedded Greenhouse/Lever form if the hostname is a custom company domain):
   - `linkedin.com` → **LinkedIn**
   - `boards.greenhouse.io`, `job-boards.greenhouse.io`, or an embedded Greenhouse form → **Greenhouse**
   - `jobs.lever.co`, or an embedded Lever form → **Lever**
   - `*.myworkdayjobs.com` → **Workday** (not automated yet — see Notes)
   - anything else → **Unknown**
4. **Save the posting** to `job_postings/[company]_[role-slug]_[YYYY.MM.DD].md`, in the same freeform style `methodology.md` already expects, plus one metadata comment line at the top:
   ```
   <!-- source_url: <original URL> | apply_url: <actual apply URL> | platform: <classification> -->
   ```
5. **Generate materials.** Hand off to `methodology.md` unchanged to produce `generated_resumes/resume_[company]_[date].md` + matching `.pdf`. Do not duplicate any step of that recipe here.
6. **Route** based on the platform classified in step 3:
   - **LinkedIn** → stop here. Tell the user the resume is ready; they apply and upload it manually via LinkedIn's own flow.
   - **Greenhouse / Lever** → shell out via Bash:
     ```
     node apply/fill.js --platform <greenhouse|lever> --apply-url "<apply_url>" --resume "generated_resumes/resume_[company]_[date].pdf" --job "job_postings/[company]_[role-slug]_[date].md"
     ```
     Relay the resulting `apply/runs/[company]_[date]/report.md` to the user (fields filled / skipped / needing manual review) and tell them the browser window is paused for their review — they finish and submit it themselves.
   - **Workday** → resume/materials are ready. If no account exists yet for this employer, offer to run:
     ```
     node apply/create-account.js --platform workday --signup-url "<signup_url>" --company "<company>"
     ```
     which generates a password, fills the signup form, pauses for the user to confirm account creation, then records the account (including the password) in `ats_accounts.md`. The actual job-application form fill on Workday is still not automated (see Notes) — the user applies manually once logged in.
   - **Unknown** → resume/materials only; no automation attempted.
7. **Log.** Only after the user explicitly confirms they clicked submit themselves, append a row to `applications_log.md` (date, company, role, platform, resume version, status `Applied`).

## Notes

- `apply/`'s fill scripts read `obsidian_vault/application_profile.md` for non-resume answers (work auth, compensation, EEO, boilerplate) and `obsidian_vault/achievements.md`'s Identity/Contact block for name/phone/email/LinkedIn/GitHub — nothing is duplicated between them.
- If `application_profile.md` still has `[FILL IN]` placeholders when a fill run needs that field, the field is reported as needing manual review rather than filled with a placeholder value.
- Workday *account creation* is automated (`apply/create-account.js`); Workday *job-application form filling* is still an explicit stretch goal, not built this pass — the account-creation and application-filling problems turned out to be separable, and only the former was tractable to do safely so far.
