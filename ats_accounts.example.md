---
name: ats_accounts.example
description: Schema/template for ats_accounts.md — registry of per-employer ATS accounts (e.g. Workday requires an account before showing the application form), including the generated password column. This example file holds no real credentials and is the only version of this file ever pushed to git.
---

# ATS Account Registry (Example)

Metadata about per-employer ATS accounts created during job applications, including the password Claude generated for each one. The real `ats_accounts.md` is gitignored and must never be committed — only this example (with fake data) is ever pushed.

| Company | Platform | Account Email | Username | Password | Created | Notes |
|---|---|---|---|---|---|---|
| Acme Corp | Workday | you+acme@example.com | you_acme | (never a real password in this tracked file) | 2026.09.17 | Account required before the application form is even visible; moved into Dashlane after creation |

**Hard rule:** this example file must never contain a real password — only `ats_accounts.md` (gitignored) does. Before ever running a broad `git add`, confirm `git status` shows `ats_accounts.md` as untracked/ignored, not staged.
