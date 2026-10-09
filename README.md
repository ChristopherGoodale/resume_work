# Resume Work

A personal system for generating job-tailored resumes on demand, instead of hand-editing one static resume file per application.

## Intent

Resume content and resume style are split apart so each can evolve independently:

- **`obsidian_vault/achievements.md`** — the source of truth. Every job, achievement, metric, tool, and credential Christopher has, written as plain facts (no resume prose). This is the only place new work should be recorded.
- **`obsidian_vault/formatting.md`** — the style guide. Layout, header format, bullet pattern, writing rules, tone — how any resume built from this system should look and read.
- **`methodology.md`** — the recipe. Instructions for Claude (or a person) to take a job posting, cross-reference it against `achievements.md` and `formatting.md`, and produce a new tailored resume.
- **`playbooks/`** — three resume variants (`recruiter`, `targeted`, `academic`). Each overrides parts of `formatting.md` and shares the same facts and build.
- **`obsidian_vault/academic_experience.md`** — the learning bank (courses, books, papers, self-study) that feeds the academic playbook. Filled in by hand.
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

## Playbooks

| Playbook | Reader | Summary | Tagline | Output name |
| --- | --- | --- | --- | --- |
| `recruiter` | Recruiters, general sharing | Summary plus Looking ahead | Standing positioning | `resume_general_[date]` |
| `targeted` | One job posting | None | Rewritten to the posting | `resume_[company]_targeted_[date]` |
| `academic` | Graduate admissions | None | Program-facing | `resume_academic_[program]_[date]` |

Playbook choice: name it in your request, or add `playbook: <name>` to the posting's metadata comment. With a posting the default is `targeted`, without one it is `recruiter`.

## How to generate a new resume

1. Save the target job posting as a markdown file under `job_postings/`, named `[company]_[role-slug]_[YYYY.MM.DD].md`.
2. Ask Claude to generate a tailored resume from it, pointing to that file. Claude will follow `methodology.md`, pulling content from `achievements.md` and formatting it per `formatting.md`.
3. Review the output, especially which achievements got selected/dropped per role — nothing should be invented that isn't in `achievements.md`.
4. The result is saved to `generated_resumes/resume_[company]_[date].md` and exported to a matching `.pdf`.
5. Once you're done with a posting/resume pair, move both into `job_postings/archive/` and `generated_resumes/archive/` respectively to keep them local-only.

## Publishable resume page

`docs/` is a static page (`index.html`) that embeds `docs/resume.pdf` for anyone
to view/download — meant to be served from GitHub Pages (Settings → Pages →
Deploy from branch → `main` / `docs`). It always shows whichever PDF is copied
into `docs/resume.pdf`; it does not auto-detect the latest `generated_resumes/`
file.

To update the published page after generating a new general resume:

```
cp generated_resumes/resume_general_<latest-date>.pdf docs/resume.pdf
```

then commit and push.

## Keeping it current

Whenever a new achievement happens at work, add it to `achievements.md` (role, what was built, tools/methods used, quantified outcome) rather than waiting until the next job application. A thin, current achievements file produces weak tailored resumes no matter how good the methodology is.

## Roadmap

- Fill in real LinkedIn and GitHub URLs (currently placeholders in `achievements.md`)
- Cover-letter generation using the same achievements + posting inputs
- A simple log of which resume version was sent to which posting and when
- ATS/keyword-match scoring — check a generated resume against a posting's keywords before sending
- Periodic review pass to keep `achievements.md` from going stale as roles change
- Fill in `obsidian_vault/academic_experience.md` so the academic playbook has content (courses, books, papers, test scores, each linked to where it was applied). MBA applications keep using the recruiter or targeted playbook.
