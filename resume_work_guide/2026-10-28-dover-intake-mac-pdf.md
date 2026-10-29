# 2026-10-28 - Dover intake and a macOS PDF build

First targeted run on macOS, and the first posting hosted on Dover (`app.dover.com/apply/...`). Builds on the targeted playbook and intake flow from the 2026-09-17 and 2026-10-07 entries.

## The "Why" (Design Decisions)

**PDF engine.** `methodology.md` step 6 assumes Windows winget installs of Pandoc and wkhtmltopdf. Neither is on this Mac. Options considered:

| Option | Cost | Verdict |
| --- | --- | --- |
| `brew install pandoc` plus wkhtmltopdf | Machine-wide install. wkhtmltopdf is archived upstream and no longer ships a Homebrew cask. | Rejected |
| Python `markdown` in a project `.venv`, then headless Chrome `--print-to-pdf` | One pip package, contained in `.venv` (gitignored). Chrome is already installed. | Chosen |

Chrome renders the same `resume_style.css`. The differences you can see: Calibri is missing on macOS, so the body falls back to Arial. The stylesheet's `h2#technical-skills + ul` selectors still match, because the `toc` extension produces the same heading ids as Pandoc (`technical-skills`, `education-certifications`).

**Dover routing.** Dover is not in the platform table of `application_intake.md`, so it counts as **Unknown**. The form is a plain single-page React form with no account and no password field. This run filled it by hand through browser tools rather than `apply/fill.js`. The same rules applied: no submit click, and no answer that `achievements.md` cannot back up.

## Core Concepts

- **Fill only fields the sources back up.** Name, email, phone, LinkedIn, location, and tools came from `achievements.md`. Work authorization, sponsorship, start date, "Why Citrini", and the writing sample have no source, because `obsidian_vault/application_profile.md` does not exist yet. Those fields were left blank for the user.
- **Dover re-renders on upload.** Uploading the resume re-renders part of the form, and an accessibility-tree read right after the upload showed a filled textbox as empty. A screenshot confirmed the value was still there. Check with a screenshot before you trust an "empty" read after an upload.

## Implementation Breakdown

Build command, run from the repo root:

```
B=generated_resumes/resume_<company>_targeted_<date>
.venv/bin/python -I -c "import markdown; css=open('obsidian_vault/resume_style.css').read(); body=markdown.markdown(open('$B.md').read(), extensions=['toc']); open('$B.html','w').write('<!doctype html><html><head><meta charset=utf-8><style>@page{size:letter;margin:0}'+css+'</style></head><body>'+body+'</body></html>')"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --no-pdf-header-footer --print-to-pdf="$PWD/$B.pdf" "file://$PWD/$B.html"
rm $B.html
```

`@page{margin:0}` hands the margins to the stylesheet's `body { margin: 0.5in auto }`, which matches how wkhtmltopdf output looked. `--no-pdf-header-footer` removes Chrome's date and URL lines.

Candidate follow-up: add this as the macOS branch of `methodology.md` step 6, and add a Dover row to the platform table in `application_intake.md`.
