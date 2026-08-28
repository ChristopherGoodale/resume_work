---
name: formatting
description: Style and formatting conventions for Christopher Goodale's resume. Header/skills/summary layout from resume_26.08.05.pdf; bullet-point sentence style reverted to resume_25.07.26.pdf (full verb-first sentences, no bold lead phrase, gerund impact clause)
---

# Resume Formatting Rules

Reference document for reproducing the style, structure, and writing conventions of the resume. Style only - no personal content here. Content lives in `achievements.md`.

**ATS note:** em dashes (`—`) are avoided throughout this format in favor of plain hyphens (`-`). Some ATS parsers mangle unicode punctuation like em dashes; hyphens are universally safe plain-text characters.

---

## Page Layout

- Single page preferred; two pages acceptable for dense experience
- Generous margins, clean whitespace between sections
- No columns, no sidebars — single-column linear flow
- Font: serif for name, sans-serif for body (the PDF renders as a clean professional serif/sans hybrid)

---

## Header Block

```
[Full Name]                          ← large, bold, centered
[Tag 1] · [Tag 2] · [Tag 3]         ← 3 role keywords, middle-dot separated, centered, smaller
[City, State] | [Phone] | [Email] | LinkedIn: [URL] · GitHub: [URL]   ← centered, pipe-separated
```

- Name is the largest element on the page
- Tagline is a 3-word positioning statement separated by `·` (U+00B7 middle dot), not hyphens or pipes
- Contact line uses `|` between blocks and `·` between LinkedIn/GitHub
- LinkedIn and GitHub listed as `LinkedIn: [URL]` and `GitHub: [URL]` - label included

---

## Section Headers

- ALL CAPS, bold
- Dark navy/blue color (`#1a3a5c` approximate)
- Followed immediately by a full-width horizontal rule
- No numbering, no icons

Section order:
1. SUMMARY
2. TECHNICAL SKILLS
3. PROFESSIONAL EXPERIENCE
4. PROJECTS (optional - include only when a project is relevant to the posting)
5. EDUCATION & CERTIFICATIONS

---

## SUMMARY

Two parts: the core summary paragraph, then a short "Looking ahead" statement.

### Core summary paragraph

- Single dense paragraph, no bullets
- Opens with years of experience and core value proposition in one sentence
- Names specific technical tools/methods inline (Python, SQL, ARIMA, isolation forest, etc.)
- Closes with a differentiating trait - what makes the work trustworthy or distinctive
- Tense: present (ongoing identity statement)
- No "I" — implied subject throughout
- Target length: 4–6 sentences, ~80–120 words

**Template pattern:**
> Analyst with [X]+ years [core value prop]. Combines [foundation] with hands-on [tools], [methods], and [delivery formats]. [Track record statement — what ships and why it matters]. [Differentiator sentence].

### Looking ahead statement

- A short second paragraph (1–2 sentences) directly under the core summary, set off with a bold `**Looking ahead:**` lead-in
- States that the specific role/domain being applied to is the explicit desired next step — not a vague "seeking growth" line
- Frames it within the standing career direction: moving into finance/tech work as an analyst or engineer
- Names the concrete overlap between the existing background and what the role requires, so the statement reads as continuity, not a pivot out of nowhere
- Rewritten per posting — this is the one part of SUMMARY that should not be reused verbatim across resumes

**Template pattern:**
> **Looking ahead:** [Role title / domain from the posting] is the direction I'm looking to move into next, pairing this [specific overlapping background] with hands-on ownership of [what the role actually asks the person to do].

---

## TECHNICAL SKILLS

Format: bold category label + colon, then comma-separated plain-text items on the same line.

```
Languages:            Python, SQL, R, ...
Data & Warehousing:   Oracle, PostgreSQL, ...
Analytics & ML:       Time-series forecasting (ARIMA), anomaly detection (isolation forest), ...
BI & Visualization:   Tableau, Power BI, Streamlit, Excel (advanced)
Cloud & Tooling:      AWS, Docker, Git, Linux, JIRA
Enterprise / ERP:     SAP, Workday, NetSuite, MIP, Sage Timberline
```

- 6 categories; adjust as needed but keep category count tight (5–7)
- Parentheticals used for specificity: `anomaly detection (isolation forest)`, `Excel (advanced)`
- No proficiency ratings, no bars, no icons
- Order: languages → data infra → methods → visualization → cloud/tools → enterprise

---

## PROFESSIONAL EXPERIENCE

### Job Header

```
[Employer]                                          ← bold, own heading line
[Job Title] – [Month/Year] – [Month/Year or Present]   ← bold, same line, en-dash separated
```

- Employer name is its own bold heading line, on the line above the title
- Title and dates sit together on the next line, bold, separated by en dashes - not italicized, not split onto separate lines
- No location listed (city/state omitted)
- Format employer name exactly as it appears officially; add parenthetical if name changed: `International Motors (formerly Navistar)`

### Bullet Style

Each bullet is a single full sentence - no bold lead phrase, no em-dash label:

[Past-tense verb] [object/deliverable, often with a nested "of" phrase] [prepositional phrase naming the method or context], [present-participle clause naming the impact].

Rules:
- No bold lead-in phrase - the bullet opens directly with the verb
- No em dash or colon splitting the bullet into a label + detail
- Verb is past tense, active: Developed, Designed, Implemented, Provided, Coordinated, Managed, Detected, Analyzed
- Method or context follows as a prepositional phrase (`through cross-functional collaboration with...`, `using SQL to...`)
- Bullet closes with a comma + present-participle ("-ing") clause naming the impact: establishing, enhancing, ensuring, empowering, improving, positioning, allowing
- Multi-step actions chain an infinitive purpose clause (`to determine which...`) or a "so (that)" clause inside the same bullet rather than splitting into two bullets
- Quantify where the fact supports it, but the number sits inside the sentence, not as a standalone clause
- No "I" or "we" - implied subject
- Sentences run long (roughly 30-45 words) rather than being broken into short fragments
- Honesty bullets (null results, closed-off bets) are included and treated as equal to positive outcomes

**Bullet count per role:** 5–8 bullets for major roles, 1–3 for early/short roles

**Bullet categories to cover across a role (not every role needs all):**
- A major analytical deliverable that went into production
- A measurement or attribution framework
- An ML or statistical method applied
- A BI/dashboard output
- A process or efficiency improvement
- Cross-functional or leadership impact
- An honest/null result if applicable

---

## PROJECTS

Optional section - include only when a project in `achievements.md` (see the `## Project: ...` entries) is relevant to the target posting. Skip it entirely rather than force-fitting an irrelevant project in.

```
[Project Name] (Personal)                              ← bold, own heading line
```

- Project heading follows the same pattern as a Job Header, with `(Personal)` (or the relevant qualifier) standing in for the employer line
- No dates required unless the project has a meaningful timeframe
- Bullets follow the same Bullet Style rules as PROFESSIONAL EXPERIENCE - full verb-first sentences, no bold lead phrase, closing on a present-participle impact clause
- 1–3 bullets - a project entry should stay lean relative to a full role
- Select bullets the same way as experience bullets: relevance to the posting's keywords/skills/domain, not just "what's interesting"

---

## EDUCATION & CERTIFICATIONS

```
[Institution] - [Degree or Certification]
```

- Institution is bold; degree follows hyphen, plain text
- No dates
- No GPA
- List in order: degree(s) first, then professional certifications
- Certifications treated as peers to degrees — same format, same section

---

## Writing Rules (Global)

| Rule | Detail |
|------|--------|
| No "I" | Implied subject throughout |
| Past tense for all experience | Even current role uses past tense on completed work |
| Active verbs | developed, designed, implemented, provided, coordinated, managed, detected |
| No bold lead phrase | Bullets open directly with the verb, not a bolded noun label |
| Name the tool | Don't say "a visualization tool" — say Tableau, Power BI, Streamlit |
| Name the method | Don't say "ML model" — say isolation forest, ARIMA, nearest-neighbor |
| Quantify scale | Employees served, scripts run, % improvement, $ recovered, record count |
| Close with a gerund impact clause | Every bullet ends in a comma + present-participle clause: establishing, enhancing, ensuring, empowering, improving |
| No soft verbs | Avoid: assisted, supported, helped, participated, contributed |
| Null results count | Reporting a clean null result is a feature, not a weakness |
| No em dashes | Use plain hyphens `-` everywhere instead of `—` (ATS parsers can mangle unicode punctuation) |

---

## Tone

- Confident but precise - claims are backed by specifics
- No hedging language ("tried to", "attempted to", "worked on")
- Decision-grade framing: the work is described in terms of what leadership/ops/stakeholders can now do with it
- Implicit seniority: bullets show ownership, not assistance

---

## Checklist for a New Version

- [ ] Tagline updated to match target role
- [ ] Summary rewritten to front-load most relevant experience for the role
- [ ] Technical Skills ordered with most relevant category first
- [ ] Most recent role has 6–8 bullets; older roles taper appropriately
- [ ] Every bullet opens with a past-tense verb (no bold lead phrase) and closes with a present-participle impact clause
- [ ] No em dashes anywhere in the document (plain hyphens only)
- [ ] All tools and methods named specifically (no generics)
- [ ] At least one quantified result per role
- [ ] LinkedIn and GitHub URLs filled in
- [ ] Fits target page count (1 page preferred)
