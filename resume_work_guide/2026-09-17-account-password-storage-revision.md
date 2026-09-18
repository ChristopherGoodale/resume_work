# 2026-09-17 — Account & Password Storage: A Revision

## The "Why" (Design Decisions)

**"Ignore the credentials" turned out to mean "gitignore them," not "never
store them."** The original account-registry design (see
[2026-09-17-application-automation.md](2026-09-17-application-automation.md))
read "I would like the credentials for accounts ignored" as "Claude should
never possess a password at all" — so `ats_accounts.md` was built with no
password column, and the code guard skipped every password field
unconditionally. On revisiting it, the actual intent was narrower and more
practical: keep passwords out of *git* (`ats_accounts.md` was already
gitignored for exactly this), while still letting Claude generate and record
them locally so account creation doesn't require typing a 20-character
random string by hand. Same underlying goal — passwords never reach
GitHub — solved with a materially different mechanism. This is a good
example of why it's worth restating a safety-sounding constraint back before
building on it: "ignored" is ambiguous between a filesystem-privacy meaning
(gitignored) and an access-control meaning (Claude never touches it), and
the two lead to very different architectures.

**A browser-integrated Dashlane save was considered and explicitly rejected.**
The first proposal after this correction was to have Playwright drive the
user's *actual* Chrome profile (not a disposable one) so the real, installed
Dashlane extension would detect a new password on form-submit and offer its
native save prompt — genuinely one-click, but it meant every future
automated run, including ordinary job-application filling, would have access
to the user's real logged-in browser session (email, banking tabs, whatever
else was open) rather than an isolated sandbox. That tradeoff was
significant enough to surface explicitly rather than build silently, and the
user chose to keep the isolated, disposable-browser design and handle moving
credentials into Dashlane themselves. The lesson generalizes: "automate as
much as possible" is a direction, not a blank check to expand what an
automated process can reach — the two have to be weighed against each other
every time the scope of access would grow, not just the scope of what gets
typed.

**Account creation stayed a separate code path from job-application
filling, not a flag on the same one.** `apply/create-account.js` and
`apply/platforms/workday.js`'s `createAccount` are new, distinct from
`apply/fill.js` and `fillApplication` — because the two flows have opposite
password rules (application filling must never touch a password; account
creation must always generate one) and conflating them into one function
with a mode flag would make it easy to flip the wrong behavior on
accidentally. Two separate, narrowly-scoped functions each do one thing
unconditionally, rather than one function doing two contradictory things
based on a parameter.

**The password is always freshly generated, never read back from anywhere.**
`apply/lib/generate-password.js` uses `node:crypto`'s `randomInt` (a
cryptographically secure source), not `Math.random()`, and guarantees one
character from each required class before shuffling — because ATS/Workday
signup forms commonly reject passwords that don't mix character types, and
discovering that mid-flow (after the browser is already open) would be a
worse experience than guaranteeing it up front. `create-account.js` never
reads an existing row from `ats_accounts.md` to reuse a password — every
run is a new account, new password, by construction.

**`ats_accounts.md`'s hard rule shifted from "no password column" to "never
committed."** The enforcement point moved from the file's schema to
`.gitignore` plus a documented habit (check `git status` before any broad
`git add`) — which is a weaker-looking guarantee on paper (a person could
still `git add -f` the file) but matches what the user actually values: the
password existing locally is fine and useful; the password reaching a
remote is not.

## Core Concepts

- **Restating an ambiguous constraint before building on it.** "Ignore
  credentials" had two reasonable readings with very different
  implementations; asking rather than picking one saved a full rebuild of
  `ats_accounts.md`'s schema and the password guard.
- **Access scope vs. action scope.** Automating *more actions* (filling more
  fields, creating accounts) is a different kind of expansion than
  automating with *more access* (a real, logged-in browser profile instead
  of a disposable one) — the second is worth flagging explicitly even when
  the user has asked to "automate as much as possible."
- **Cryptographically secure randomness for generated secrets.**
  `crypto.randomInt` draws from the OS's CSPRNG; `Math.random()` does not and
  should never be used to generate anything security-sensitive, even a
  password for a throwaway-feeling account.
- **Separate functions for separate invariants**, over one function with a
  mode flag — when two code paths must never do what the other one does
  (skip vs. generate a password), keeping them as distinct, narrowly-named
  functions makes the invariant visible in the function signature itself.

## Implementation Breakdown

- [`apply/lib/generate-password.js`](../apply/lib/generate-password.js) —
  generates a fresh 20-character password via `crypto.randomInt`, guaranteeing
  at least one lowercase, uppercase, digit, and symbol character before a
  Fisher-Yates shuffle.
- [`apply/lib/accounts-store.js`](../apply/lib/accounts-store.js) —
  `appendAccountRow` inserts one row into `ats_accounts.md`'s markdown table
  right after the header separator, escaping any `|` characters so a value
  can't corrupt the table structure.
- [`apply/platforms/workday.js`](../apply/platforms/workday.js)'s
  `createAccount` — fills Workday's create-account form (stable
  `data-automation-id` selectors: `email`, `password`, `verifyPassword`,
  `createAccountCheckbox`) with a caller-supplied fresh password; never
  clicks `createAccountSubmitButton`. `fillApplication` in the same file
  remains a stub — job-application filling on Workday is still unbuilt.
- [`apply/create-account.js`](../apply/create-account.js) — the CLI
  entrypoint: generates the password, launches a headed (disposable, not the
  user's real profile) browser, delegates to the platform's `createAccount`,
  writes a report, pauses via `page.pause()` for the user to confirm account
  creation, then appends the row to `ats_accounts.md` only after the pause
  resumes.
- [`ats_accounts.md`](../ats_accounts.md) /
  [`ats_accounts.example.md`](../ats_accounts.example.md) — schema now
  includes a `Password` column; the real file is gitignored and the example
  file (fake data only) is the only version ever pushed.
- [`apply/test-account-creation.js`](../apply/test-account-creation.js) —
  offline smoke tests: password strength/uniqueness, `createAccount`'s field
  fills against a local Workday fixture, and `appendAccountRow`'s output
  format (tested against a temp file, never the real `ats_accounts.md`).
