# 2026-10-07: Resume Playbooks

Building on the generation flow from 2026-08-05 and the intake flow from 2026-09-17: facts (`achievements.md`), stylesheet, and the Pandoc build are unchanged. This entry covers only the variant layer.

## The "Why" (Design Decisions)

**File per playbook, not one longer methodology.** `methodology.md` was already a single recipe with per-resume judgment calls hidden in ad-hoc instructions. Three variants inside one file would mean conditionals in every step and a file that is hard to scan. Three short files under `playbooks/` keep each variant's rules in one place, and `methodology.md` only gains a selection step.

**Playbooks override, `formatting.md` stays the baseline.** The Recruiter playbook is the old behavior, so it overrides nothing. Targeted and Academic list their overrides in a table (Summary removed, Education gains dates and GPA, section order changes). The rule is "playbook wins on conflict", which means `formatting.md` never needs a copy per variant.

**Targeted keeps the tagline and drops Summary and Looking ahead.** The tagline is a three keyword strip (for example `Application Support · Automation & Troubleshooting · Data Systems`), not a statement of intent. It is the only role signal left once the paragraphs go, so it stays. The Looking ahead line is intent, and a posting-specific resume already shows intent by its selection.

**Academic has its own content bank.** Nothing in `achievements.md` records coursework, books, or papers. A new file, `academic_experience.md`, holds them, and each entry has an `applied in` field that points to a fact or project in `achievements.md`. That link is how the resume shows "learned X, applied it to Y" without inventing the connection.

## Core Concepts

- **Playbook selection order:** user instruction, then `playbook:` in the posting's metadata comment, then default (`targeted` with a posting, `recruiter` without).
- **Learn then apply pairs:** an academic entry without an `applied in` link appears only under Education. The generator does not guess an application.
- **Output naming:** Recruiter keeps `resume_general_[date]` so the `docs/resume.pdf` publish step and the `.gitignore` exception still match. Other playbooks insert the playbook name.

## Implementation Breakdown

- `playbooks/recruiter.md`, `targeted.md`, `academic.md`: purpose, inputs, override table, layout table, output name.
- `methodology.md`: new Playbooks table and step 0. Step 3 notes that Targeted and Academic skip the Summary rewrite. Step 5 uses the playbook's filename.
- `application_intake.md`: the posting metadata comment gains `| playbook: targeted`.
- `.gitignore`: tracks `resume_academic_general_*.pdf` alongside `resume_general_*.pdf`. Program specific academic PDFs stay local.
- `resume_style.css` is untouched. The bullet-less rules key off the headings `TECHNICAL SKILLS` and `EDUCATION & CERTIFICATIONS`, so every playbook keeps those exact headings.
- Existing files such as `resume_GroupOneTrading_2026.10.01.md` keep their old names. Only new outputs use the new scheme.
