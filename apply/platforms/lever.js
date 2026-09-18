import { isPasswordField, matchQuestionToProfile } from "../lib/fill-helpers.js";

/**
 * Fills a Lever application form. Known Lever field `name` attributes are
 * stable across companies since every Lever board runs the same template,
 * but custom per-employer questions vary — those are matched fuzzily against
 * the profile and anything unmatched goes to needsManualReview rather than
 * being guessed. Never clicks submit.
 */
export async function fillApplication({ page, profile, resumePath }) {
  const filled = [];
  const skipped = [];
  const needsManualReview = [];

  const knownFields = [
    { selector: 'input[name="name"]', value: profile.name, label: "Full name" },
    { selector: 'input[name="email"]', value: profile.email, label: "Email" },
    { selector: 'input[name="phone"]', value: profile.phone, label: "Phone" },
    { selector: 'input[name="urls[LinkedIn]"]', value: profile.linkedin, label: "LinkedIn URL" },
    { selector: 'input[name="urls[GitHub]"]', value: profile.github, label: "GitHub URL" },
  ];

  for (const { selector, value, label } of knownFields) {
    const field = page.locator(selector).first();
    if ((await field.count()) === 0) continue;
    if (!value) {
      needsManualReview.push(`${label} (no value in profile)`);
      continue;
    }
    if (await isPasswordField(field)) {
      skipped.push(`${label} (password field — enter manually)`);
      continue;
    }
    await field.fill(value);
    filled.push(label);
  }

  const resumeInput = page.locator('input[name="resume"][type="file"]').first();
  if ((await resumeInput.count()) > 0 && resumePath) {
    await resumeInput.setInputFiles(resumePath);
    filled.push("Resume upload");
  } else {
    needsManualReview.push("Resume upload (no matching file input found)");
  }

  // Custom per-employer questions render under .application-question with an .application-label.
  const questionBlocks = page.locator(".application-question");
  const questionCount = await questionBlocks.count();
  for (let i = 0; i < questionCount; i++) {
    const block = questionBlocks.nth(i);
    const labelText = (
      await block.locator(".application-label").first().innerText().catch(() => "")
    ).trim();
    if (!labelText) continue;

    const input = block.locator("input, textarea, select").first();
    if ((await input.count()) === 0) continue;

    if (await isPasswordField(input)) {
      skipped.push(`${labelText} (password field — enter manually)`);
      continue;
    }

    const match = matchQuestionToProfile(labelText, profile);
    if (!match) {
      needsManualReview.push(labelText);
      continue;
    }

    const tagName = await input.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "select") {
      await input.selectOption({ label: String(match.value) }).catch(() => {
        needsManualReview.push(`${labelText} (could not select "${match.value}")`);
      });
    } else {
      await input.fill(String(match.value));
    }
    filled.push(`${labelText} (${match.category})`);
  }

  return { filled, skipped, needsManualReview };
}
