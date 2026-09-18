import { isPasswordField, matchQuestionToProfile } from "../lib/fill-helpers.js";

/**
 * Fills a Greenhouse application form. Known Greenhouse field IDs are stable
 * across companies since every Greenhouse board runs the same template, but
 * custom per-employer questions vary — those are matched fuzzily against the
 * profile and anything unmatched goes to needsManualReview rather than being
 * guessed. Never clicks submit.
 */
export async function fillApplication({ page, profile, resumePath }) {
  const filled = [];
  const skipped = [];
  const needsManualReview = [];

  const knownFields = [
    { selector: "#first_name", value: profile.name?.split(" ")[0], label: "First name" },
    { selector: "#last_name", value: profile.name?.split(" ").slice(1).join(" "), label: "Last name" },
    { selector: "#email", value: profile.email, label: "Email" },
    { selector: "#phone", value: profile.phone, label: "Phone" },
  ];

  for (const { selector, value, label } of knownFields) {
    if (!value) {
      needsManualReview.push(`${label} (no value in profile)`);
      continue;
    }
    const field = page.locator(selector).first();
    if ((await field.count()) === 0) continue;
    if (await isPasswordField(field)) {
      skipped.push(`${label} (password field — enter manually)`);
      continue;
    }
    await field.fill(value);
    filled.push(label);
  }

  const resumeInput = page.locator('input#resume[type="file"], input[name="resume"][type="file"]').first();
  if ((await resumeInput.count()) > 0 && resumePath) {
    await resumeInput.setInputFiles(resumePath);
    filled.push("Resume upload");
  } else {
    needsManualReview.push("Resume upload (no matching file input found)");
  }

  // Custom per-employer questions render as .field blocks with a label + input/textarea/select.
  const questionBlocks = page.locator(".field, .application-question");
  const questionCount = await questionBlocks.count();
  for (let i = 0; i < questionCount; i++) {
    const block = questionBlocks.nth(i);
    const labelText = (await block.locator("label").first().innerText().catch(() => "")).trim();
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
