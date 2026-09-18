---
name: application_profile.example
description: Schema/template for application_profile.md — non-resume application data used to fill ATS application forms. Copy this to application_profile.md and fill in real values (that file is gitignored).
---

# Application Profile (Example)

Non-resume data ATS forms ask for that doesn't belong in a resume. Contact info (name, phone, email, LinkedIn, GitHub) is **not** duplicated here — it already lives in `obsidian_vault/achievements.md` under `## Identity / Contact` and is read from there.

---

## Work Authorization
- Authorized to work in the US without sponsorship: Yes
- Will now or in future require sponsorship: No

## Compensation
- Desired base salary range: $XX,XXX - $XX,XXX
- Notice period / earliest start date: 2 weeks from offer

## Logistics
- Willing to relocate: No
- Open to remote / hybrid / onsite: Remote or hybrid; onsite only in [city]

## EEO / Demographic Self-Identification (voluntary)
Always legally optional — "Decline to answer" is a valid value for every field below.
- Gender: Decline to answer
- Race/Ethnicity: Decline to answer
- Veteran status: Decline to answer
- Disability status: Decline to answer

## Standard Short-Answer Boilerplate

### Why are you interested in this role/company?
[Reusable paragraph — Claude adapts the company name and 1-2 specifics per posting when filling this in on an application form.]

### How did you hear about this position?
Company careers page

---

## Notes
- Never add a password or account credential to this file — see `ats_accounts.md` for per-employer account metadata, which also never stores passwords.
- Passwords are created and entered exclusively by the user via their own password manager. Playwright will always skip password fields, regardless of what is or isn't in this file.
