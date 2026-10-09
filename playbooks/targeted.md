---
name: playbook-targeted
description: Job-description tailored resume with no summary paragraphs. Tagline, skills, experience, projects, education, all filtered and ordered to one posting.
---

# Playbook: Targeted

Built for one posting. The reader gets the tagline, then evidence. No Summary and no Looking ahead.

## When to use

- A job posting exists in `job_postings/`.
- This is the default when a posting is present and no other playbook is named.

## Inputs

- A posting file in `job_postings/`.
- `obsidian_vault/achievements.md`.

## Overrides to `formatting.md`

| `formatting.md` rule | Targeted override |
| --- | --- |
| Section order starts with SUMMARY | No SUMMARY section. No Looking ahead. |
| Tagline is the standing positioning | Tagline is rewritten to the posting's role keywords (3 terms, middle-dot separated) |
| PROJECTS optional | PROJECTS kept only when a project matches the posting's skills or domain |

Everything else in `formatting.md` still applies: header block, bullet style, writing rules, no em dashes.

## Layout

| Part | Rule |
| --- | --- |
| Tagline | 3 role keywords taken from the posting title and top requirements |
| Section order | TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, PROJECTS (if relevant), EDUCATION & CERTIFICATIONS |
| Skills | Category that best matches the posting leads. Within a category, matching tools come first. Only items present in `achievements.md`. |
| Roles | Include a role only if it adds relevant evidence or fills the timeline. Drop short, unrelated roles (precedent: the intern role was dropped for the Group One Trading resume). |
| Bullets | Rank each role's facts against the posting. Top 5 to 8 for major roles, 1 to 3 for short roles. At least one quantified result per role. Do not force-fit a fact the posting has no use for. |
| Bullet wording | Reuse the fact, reword to echo the posting's vocabulary where it is true. Never add a tool, metric, or claim not in `achievements.md`. |
| Projects | 0 to 2, only if the posting's skills overlap |
| Education | Per `formatting.md`. Reorder certifications so the one matching the posting is first. |
| Length | 1 page preferred, 2 acceptable |

## Steps

1. Parse the posting: title, required and preferred skills, domain, seniority.
2. Pick the tagline terms.
3. Score and select bullets per role.
4. Reorder skills.
5. Choose projects and certifications.
6. Render, export, run the checklist (skip the Summary line).

## Gaps

If the posting asks for something not in `achievements.md`, flag it to the user. Do not cover it with invented content.

## Output

- File: `generated_resumes/resume_[company]_targeted_[YYYY.MM.DD].md` and `.pdf`
- PDF is gitignored. Move both files to `generated_resumes/archive/` when done.

## One-page variant

For event handouts. Export with `obsidian_vault/resume_style_compact.css` instead of `resume_style.css`. Personal projects may be folded into experience as bullets, each worded "In a personal project, ..." so they never read as employer work. Project titles are dropped. Keep about 13 to 14 bullets total.
