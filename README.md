# Resume Work

A personal system for generating job-tailored resumes on demand, instead of hand-editing one static resume file per application.

## Intent

Resume content and resume style are split apart so each can evolve independently:

- **`obsidian_vault/achievements.md`** — the source of truth. Every job, achievement, metric, tool, and credential Christopher has, written as plain facts (no resume prose). This is the only place new work should be recorded.
- **`obsidian_vault/formatting.md`** — the style guide. Layout, header format, bullet pattern, writing rules, tone — how any resume built from this system should look and read.
- **`methodology.md`** — the recipe. Instructions for Claude (or a person) to take a job posting, cross-reference it against `achievements.md` and `formatting.md`, and produce a new tailored resume.
- **`job_postings/`** — where target job postings get saved before generation.
- **`generated_resumes/`** — where tailored resumes land after generation, one file per application.
- **`resume_26.08.05.pdf`** — the original resume this whole system was reverse-engineered from.

## Structure

```
resume_work/
├── methodology.md              # generation recipe
├── obsidian_vault/
│   ├── achievements.md         # source of truth for content
│   ├── formatting.md           # style/layout rules
│   └── resume_style.css        # PDF export stylesheet
├── job_postings/
│   ├── archive/                # per-company postings (local only, gitignored)
│   └── ...                     # active postings
└── generated_resumes/
    ├── archive/                 # per-company resumes (local only, gitignored)
    ├── resume_general_*.md      # the one resume tracked in this repo
    └── resume_general_*.pdf
```

Every resume tailored to a specific company/posting is generated locally and moved into the relevant `archive/` folder — those folders are gitignored, so only the general-purpose resume is ever pushed to this repo. This keeps company-specific applications and their content decisions off GitHub while still versioning the system that produces them.

## How to generate a new resume

1. Save the target job posting as a markdown file under `job_postings/`, named `[company]_[role-slug]_[YYYY.MM.DD].md`.
2. Ask Claude to generate a tailored resume from it, pointing to that file. Claude will follow `methodology.md`, pulling content from `achievements.md` and formatting it per `formatting.md`.
3. Review the output, especially which achievements got selected/dropped per role — nothing should be invented that isn't in `achievements.md`.
4. The result is saved to `generated_resumes/resume_[company]_[date].md` and exported to a matching `.pdf`.
5. Once you're done with a posting/resume pair, move both into `job_postings/archive/` and `generated_resumes/archive/` respectively to keep them local-only.

## Keeping it current

Whenever a new achievement happens at work, add it to `achievements.md` (role, what was built, tools/methods used, quantified outcome) rather than waiting until the next job application. A thin, current achievements file produces weak tailored resumes no matter how good the methodology is.

## Roadmap

- Fill in real LinkedIn and GitHub URLs (currently placeholders in `achievements.md`)
- Cover-letter generation using the same achievements + posting inputs
- A simple log of which resume version was sent to which posting and when
- ATS/keyword-match scoring — check a generated resume against a posting's keywords before sending
- Periodic review pass to keep `achievements.md` from going stale as roles change
