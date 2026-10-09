---
name: playbook-recruiter
description: Default broad resume for recruiters and general distribution. Summary plus Looking ahead, full skills, all roles. This is the resume_general flow.
---

# Playbook: Recruiter

The general resume. Built with no specific posting in mind, so it reads well to a recruiter skimming for fit across several role types.

## When to use

- No posting exists (publishing to `docs/resume.pdf`, sharing a link, uploading to a recruiter portal).
- A recruiter asks for "your resume" with no role attached.

## Inputs

- `obsidian_vault/achievements.md` only. No posting.

## Overrides to `formatting.md`

None. This playbook is the baseline that `formatting.md` already describes.

## Layout

| Part | Rule |
| --- | --- |
| Tagline | The core positioning from `achievements.md` Identity block: Analytics · Credit & Financial · Quantitative Modeling |
| Section order | SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, PROJECTS, EDUCATION & CERTIFICATIONS |
| Summary | Core paragraph per `formatting.md`, written for breadth, not for one role |
| Looking ahead | Kept. States the standing direction (finance or tech work as an analyst or engineer), not a single posting |
| Skills order | languages, data infra, methods, visualization, cloud, enterprise (the default order) |
| Roles | All five roles |
| Bullets | 5 to 8 for major roles, 1 to 3 for short roles, at least one quantified result per role |
| Projects | Include the strongest 1 to 2 |
| Education | Per `formatting.md`: no dates, no GPA |
| Length | 1 page preferred, 2 acceptable |

## Selection rule

Pick achievements by breadth and strength across domains, not by keyword match to one posting. Cover at least three of the bullet categories listed in `formatting.md` across the document.

## Output

- File: `generated_resumes/resume_general_[YYYY.MM.DD].md` and `.pdf`
- This is the only playbook output whose PDF is tracked in git (`.gitignore`) and published to `docs/resume.pdf`.
