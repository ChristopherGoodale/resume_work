# Resume Generation Methodology

Instructions for generating a new, tailored version of Christopher Goodale's resume from a job posting. Follow this end to end whenever asked to "tailor my resume to this posting" or similar.

## Inputs

- A job-posting markdown file, saved under `job_postings/`, named `[company]_[role-slug]_[YYYY.MM.DD].md` (e.g. `job_postings/acme_senior-data-analyst_2026.08.20.md`). Content can just be the posting text pasted in as-is - no special structure required, Claude parses it freeform.
- Any ad-hoc instructions the user gives at generation time (e.g. "emphasize the ML work", "keep it to one page", "target a more senior title")

## Required sources (read both before generating)

- `obsidian_vault/achievements.md` — the raw content bank: every role, achievement, tool, and credential, stripped of resume prose. This is the only place facts may come from — do not invent achievements, metrics, or tools not present here.
- `obsidian_vault/formatting.md` — the style rules: layout, header block, section order, bullet pattern, writing rules, tone, and the final checklist. This governs *how* the selected content is rendered.

## Steps

1. **Parse the posting.** Extract the target role title, required/preferred skills, keywords, seniority signals, and domain (e.g. credit risk, ML/data science, BI, FP&A).
2. **Score and select achievements.** For each role in `achievements.md`, rank its achievement items by relevance to the posting's keywords/skills/domain. Select the top items per role following `formatting.md`'s bullet-count guidance (5–8 for major/recent roles, 1–3 for early/short roles). Always keep at least one quantified result per role. Don't force-fit an achievement into a posting it has no real relevance to — it's fine for a role to run at the low end of its range.
3. **Rewrite the summary and skills.** Rewrite SUMMARY to front-load the experience and tools most relevant to this posting, following the template pattern in `formatting.md`. Reorder TECHNICAL SKILLS categories so the most relevant category leads; only include skill items that exist in `achievements.md`.
4. **Apply formatting.** Render the selected achievements into the bold-lead-phrase + hyphen bullet pattern and full document structure defined in `formatting.md` (header block, section order, job header format, education block).
5. **Output.** Write the tailored resume as a new markdown file under `generated_resumes/`, named `resume_[company]_[YYYY.MM.DD].md`. Confirm it fits the target page count (1 page preferred).
6. **Export to PDF.** Convert the markdown file to a same-named `.pdf` in `generated_resumes/` using Pandoc + wkhtmltopdf with the shared stylesheet:
   ```
   pandoc generated_resumes/resume_[company]_[date].md -o generated_resumes/resume_[company]_[date].pdf --pdf-engine=wkhtmltopdf -c obsidian_vault/resume_style.css
   ```
   Do not pass `--metadata title=...` - Pandoc renders a duplicate title block above the name when a title metadata field is set.
   Pandoc and wkhtmltopdf are installed via winget (`JohnMacFarlane.Pandoc`, `wkhtmltopdf.wkhtmltox`) but may not be on PATH within an existing terminal session until a new shell is opened - if the bare command isn't found, fall back to full paths (`~/AppData/Local/Pandoc/pandoc.exe`, wkhtmltopdf under `Program Files/wkhtmltopdf/bin`).
7. **Self-check.** Run the checklist at the bottom of `formatting.md` before presenting the result to the user.

## Notes

- If a posting calls for a skill or achievement not present in `achievements.md`, flag the gap to the user rather than fabricating content.
- When the user provides new achievements or role updates over time, add them to `achievements.md` (see the roadmap in `README.md`) rather than only using them for one generation.
