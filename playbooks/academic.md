---
name: playbook-academic
description: Graduate-program resume. Shows how self-directed and formal learning was applied to new problems, with fuller Education detail than the professional format allows.
---

# Playbook: Academic

For graduate program applications such as MSFM. The argument of this resume is a pattern: learn a concept, apply it somewhere new, report the result.

MBA applications keep using Recruiter or Targeted.

## When to use

- A program application asks for a resume or CV.
- The reader is an admissions committee, not a recruiter.

## Inputs

- `obsidian_vault/academic_experience.md`: the learning bank (courses, books, papers, self-study).
- `obsidian_vault/achievements.md`: the applied half (roles and projects).
- Optionally, a program description saved in `job_postings/` to guide emphasis.

Each entry in the academic bank names an `applied in` id that points to a role fact or project in `achievements.md`. Use those links to build the learn-then-apply pairs. If an entry has no application yet, list it under Education only. Do not invent an application.

## Overrides to `formatting.md`

| `formatting.md` rule | Academic override |
| --- | --- |
| Education has no dates, no GPA | Include dates, GPA, and test scores (GRE, GMAT, or others) when the user provides them |
| Section order | Replace SUMMARY with nothing. Education leads. |
| Bullet closes with a present-participle impact clause | Still applies |
| Single page preferred | Up to 2 pages |

## Layout

| Part | Rule |
| --- | --- |
| Tagline | Program-facing, 3 terms, for example Quantitative Finance · Statistical Modeling · Applied Machine Learning. Match the program's own vocabulary. |
| Section order | EDUCATION & CERTIFICATIONS, ACADEMIC FOUNDATIONS & APPLICATIONS, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, PROJECTS |
| Education | Degree, institution, dates, GPA, test scores. Certifications as peers. |
| Academic Foundations | 4 to 8 entries. Each is one sentence in the form: studied [concept] through [source], then applied it to [problem] at [role or project], [result]. |
| Skills | Methods first (statistics, forecasting, optimization), then languages and tools |
| Roles | Shorter than Recruiter: 3 to 5 bullets for major roles, and only those that show the applied concept |
| Projects | Lead with projects that came out of self-directed learning (EDGAR three-statement model, arbitrage research system, adversarial-learning tutor) |
| Length | 2 pages max |

## Heading IDs

`resume_style.css` strips bullets from `#technical-skills` and `#education-certifications`. Keep those two headings spelled exactly `TECHNICAL SKILLS` and `EDUCATION & CERTIFICATIONS`. The Academic Foundations section uses normal bullets.

## Output

- File: `generated_resumes/resume_academic_[program-or-general]_[YYYY.MM.DD].md` and `.pdf`
- Example: `resume_academic_MSFM_2026.10.07`
- PDF is tracked in git only if named `resume_academic_general_*.pdf` (see `.gitignore`). Program-specific ones are archived locally.
