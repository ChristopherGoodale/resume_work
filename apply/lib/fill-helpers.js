const PASSWORD_LABEL_PATTERN = /password|passwd|pwd/i;

/**
 * Hard safety guard: true if a field is a password field by type OR by label
 * text, so it gets skipped regardless of what platform-specific selector
 * logic found it. This must stay independent of any per-platform code path —
 * it is the one check that may never be bypassed.
 */
export async function isPasswordField(locator) {
  const type = await locator.getAttribute("type").catch(() => null);
  if (type && type.toLowerCase() === "password") return true;

  const ariaLabel = (await locator.getAttribute("aria-label").catch(() => null)) || "";
  const name = (await locator.getAttribute("name").catch(() => null)) || "";
  const id = (await locator.getAttribute("id").catch(() => null)) || "";
  return PASSWORD_LABEL_PATTERN.test(`${ariaLabel} ${name} ${id}`);
}

/**
 * Fuzzy-matches a custom question's label text to a profile field. Returns
 * { value, category } or null if nothing matches — callers add unmatched
 * questions to needsManualReview rather than guessing.
 */
export function matchQuestionToProfile(labelText, profile) {
  const text = labelText.toLowerCase();

  if (/sponsorship/.test(text)) {
    if (/will.*(require|need)/.test(text) && profile.needsSponsorship !== undefined) {
      return { value: profile.needsSponsorship, category: "sponsorship" };
    }
    if (profile.authorizedNoSponsorship !== undefined) {
      return { value: profile.authorizedNoSponsorship, category: "work authorization" };
    }
  }
  if (/authorized.*work/.test(text) && profile.authorizedNoSponsorship !== undefined) {
    return { value: profile.authorizedNoSponsorship, category: "work authorization" };
  }
  if (/salary|compensation|pay expectation/.test(text) && profile.salaryRange !== undefined) {
    return { value: profile.salaryRange, category: "compensation" };
  }
  if (/start date|notice period|available/.test(text) && profile.startDate !== undefined) {
    return { value: profile.startDate, category: "start date" };
  }
  if (/relocat/.test(text) && profile.willingToRelocate !== undefined) {
    return { value: profile.willingToRelocate, category: "relocation" };
  }
  if (/remote|hybrid|onsite|location preference/.test(text) && profile.remotePreference !== undefined) {
    return { value: profile.remotePreference, category: "remote preference" };
  }
  if (/why.*(interested|company|role|join)/.test(text) && profile.boilerplate?.whyInterested) {
    return { value: profile.boilerplate.whyInterested, category: "why interested" };
  }
  if (/how did you hear/.test(text) && profile.boilerplate?.howHeard) {
    return { value: profile.boilerplate.howHeard, category: "how heard" };
  }
  if (/gender/.test(text) && profile.eeo?.gender) {
    return { value: profile.eeo.gender, category: "EEO: gender" };
  }
  if (/race|ethnicity/.test(text) && profile.eeo?.raceEthnicity) {
    return { value: profile.eeo.raceEthnicity, category: "EEO: race/ethnicity" };
  }
  if (/veteran/.test(text) && profile.eeo?.veteranStatus) {
    return { value: profile.eeo.veteranStatus, category: "EEO: veteran status" };
  }
  if (/disability/.test(text) && profile.eeo?.disabilityStatus) {
    return { value: profile.eeo.disabilityStatus, category: "EEO: disability status" };
  }
  if (/linkedin/.test(text) && profile.linkedin) {
    return { value: profile.linkedin, category: "LinkedIn URL" };
  }
  if (/github/.test(text) && profile.github) {
    return { value: profile.github, category: "GitHub URL" };
  }

  return null;
}
