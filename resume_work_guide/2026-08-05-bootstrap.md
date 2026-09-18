# 2026-08-05 — Project Bootstrap

## The "Why" (Design Decisions)

**Markdown + a recipe file, instead of a resume-builder app or a fixed template.**
A resume-builder SaaS (or even a Word/Canva template) forces you to re-type
content into its editor and re-fight its layout every time you want to try a
different framing for a different job. Here, `achievements.md` holds every
fact once, in plain prose, and `methodology.md` is a *recipe* — instructions
an LLM (or a person) follows to select and rewrite a subset of those facts
for a specific posting. The output is disposable and regenerable; the input
is the only thing that has to stay correct. This only works because an LLM
can read freeform markdown and make judgment calls about relevance — a rigid
templating engine couldn't do the "score and select achievements" step at
all.

**Content and style are two separate files (`achievements.md` /
`formatting.md`), not one.** If bullet formatting changes (say, a new header
layout), every past achievement doesn't need to be touched — only
`formatting.md` does. If a new job is added, `formatting.md` never needs to
be opened. This is the same reason CSS is separate from HTML: the two change
for different reasons and at different rates, so coupling them into one file
would mean every edit risks breaking something unrelated.

**Achievements are written as stripped facts, not resume prose.**
`achievements.md` explicitly avoids bold-lead-phrase bullets or resume tone
— it's raw material ("built X using Y, result Z"), not a draft. This keeps
the content bank reusable across totally different framings: the same fact
can become a data-engineering bullet for one posting and an ML bullet for
another, because the *rewriting* happens at generation time, not when the
fact is recorded.

**Pandoc + wkhtmltopdf for PDF export, driven by a shared CSS file.**
Pandoc converts the tailored markdown to HTML, and wkhtmltopdf renders that
HTML to PDF using `resume_style.css` — meaning layout is one CSS file shared
across every generated resume, and the markdown source stays plain and
diffable in git. Both tools are local CLI installs (via winget) rather than
a paid API, so resume generation has no external dependency or per-export
cost. The methodology explicitly warns against passing `--metadata
title=...` to Pandoc, because it renders a duplicate title block above the
name — a real gotcha discovered by generating an actual resume and looking
at the output, not something obvious from reading Pandoc's docs.

**Per-company resumes and postings are gitignored; only the general resume
is pushed.** `job_postings/archive/` and `generated_resumes/archive/` never
reach GitHub. This means the *system* that produces tailored resumes is
versioned and shareable (useful to look back on, useful as a portfolio
artifact of the approach itself), while the specific companies you're
applying to, and the resume content tailored for them, stay private. The one
exception — `generated_resumes/resume_general_*` — is deliberately public
because it's the resume meant to be shown, via the `docs/` GitHub Pages
site.

## Core Concepts

- **Recipe-driven generation**: `methodology.md` is not code — it's a
  procedure written for an LLM to execute against two other markdown files
  (content + style). The "program" is natural language; the "runtime" is
  Claude reading and following it.
- **Source of truth vs. derived output**: `achievements.md` is authoritative;
  every `generated_resumes/*.md` file is a disposable, regenerable view over
  it. If a generated resume and the achievements bank ever disagree, the
  achievements bank wins — never invent content that isn't there.
- **gitignore as a privacy boundary, not just a build-artifact filter**:
  most `.gitignore` files exist to exclude build output; here it's also
  doing the job of keeping which-companies-you're-applying-to private while
  still versioning the tooling.

## Implementation Breakdown

- [`obsidian_vault/achievements.md`](../obsidian_vault/achievements.md) — the
  content bank. Identity/Contact, full skill inventory, then one section per
  role with numbered, italic-domain-tagged achievement bullets. The only
  place resume facts may come from.
- [`obsidian_vault/formatting.md`](../obsidian_vault/formatting.md) — pure
  style: header block layout, section order, bullet-writing rules, and a
  self-check list `methodology.md` runs before presenting a result.
- [`methodology.md`](../methodology.md) — the seven-step recipe: parse the
  posting, score/select achievements per role, rewrite summary/skills,
  apply formatting, write the output file, export to PDF via Pandoc, then
  self-check against `formatting.md`'s checklist.
- [`obsidian_vault/resume_style.css`](../obsidian_vault/resume_style.css) —
  the one stylesheet every exported PDF shares, referenced by the Pandoc
  command in `methodology.md`.
- [`docs/index.html`](../docs/index.html) +
  [`docs/resume.pdf`](../docs/resume.pdf) — a static GitHub Pages viewer for
  the general resume, manually re-synced from `generated_resumes/` after
  each general-resume regeneration.
