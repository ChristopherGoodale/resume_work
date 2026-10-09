# 2026-10-01 - Tailoring for a Support-Engineering Posting (Group One Trading)

Building on the intake and generation flow from 2026-09-17: nothing in the pipeline changed. This entry covers only what was new about this posting.

## The "Why" (Design Decisions)

**Gaps were left as gaps.** The posting asks for Windows Server troubleshooting, system monitoring tools, incident management, PowerShell, C#, and trading experience. None of those are in `achievements.md`, and `methodology.md` forbids inventing content. The resume instead leads with the nearest real evidence: the Lessen automation server (30+ analysts, 300+ scripts), Linux/Docker/Git, JIRA/Confluence, and the Streamlit monitoring app. The summary never claims Windows Server or monitoring-tool skills.

**Analyst resume reframed, not rewritten.** The posting accepts "Dev-Ops or Software Development" backgrounds, so the tagline moved from analytics keywords to `Application Support · Automation & Troubleshooting · Data Systems` and the skills block now leads with Cloud & Tooling after Languages.

**One project, not two.** The habit tracker (port-collision diagnosis) was cut during trimming. The prediction-market project stays because order books and fee schedules are the closest real overlap with a trading firm.

## Core Concepts

- Support roles weight operations evidence (uptime, tooling, documentation, incident handling) over analytical outcomes. Bullets were chosen by that lens.
- The generator is length-tolerant: `formatting.md` allows two pages, and existing archived resumes (BTIG, Lockton) also render to two.

## Implementation Breakdown

- Posting text was pulled from the page's `application/ld+json` block, because the HTML body is Vue-rendered and WebFetch returned only the header.
- Posting saved with `platform: Unknown` (applicantpro/isolved), so `apply/fill.js` was not run and nothing was submitted.
