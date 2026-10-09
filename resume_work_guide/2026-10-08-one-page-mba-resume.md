# 2026-10-08: One-Page MBA Event Resume

Building on the playbooks from 2026-10-07: facts and the Pandoc build are unchanged. Only the stylesheet and the project placement are new.

## The "Why" (Design Decisions)

**Second stylesheet instead of editing the shared one.** `resume_style.css` backs every other resume. Shrinking its font and margins would change all of them. `resume_style_compact.css` (10pt, 0.35in margins, 1.25 line height) is opt-in per export.

**Projects as bullets inside roles.** A separate PROJECTS section costs section headings and per-project title lines. Folding projects into the role they thematically match saves about a third of a page. The risk is a reader attributing personal work to the employer, so every project bullet says "In a personal project" or "In personal projects" in its own text.

**Cut by impact, not by role.** All four roles stay. Each role keeps its 2 to 4 highest-impact bullets, and skills drop from 7 lines to 5 by merging categories.

## Implementation Breakdown

- Export: `pandoc ... -c obsidian_vault/resume_style_compact.css`. Result reports Page 1 of 1.
- The bullet-less rules for `#technical-skills` and `#education-certifications` are copied into the compact file, so those headings must stay spelled exactly.
- Placement: the arbitrage research bullet sits under Above Lending (credit and quantitative theme), the SEC pipeline under International Motors (financial data models), and the resume generator plus MCP server under Lessen (automation).
