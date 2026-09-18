import { readFile } from "node:fs/promises";

const PLACEHOLDER_PATTERN = /\[FILL IN.*?\]/i;

function isUnfilled(value) {
  return !value || PLACEHOLDER_PATTERN.test(value);
}

/** Recursively replaces any string value still containing a "[FILL IN...]" placeholder with undefined. */
function scrubPlaceholders(value) {
  if (typeof value === "string") {
    return isUnfilled(value) ? undefined : value;
  }
  if (value && typeof value === "object") {
    const scrubbed = {};
    for (const [key, nested] of Object.entries(value)) {
      scrubbed[key] = scrubPlaceholders(nested);
    }
    return scrubbed;
  }
  return value;
}

/** achievements.md links are written as "[[Label](https://url)]" — extract just the URL for form-filling. */
function extractUrl(markdownLink) {
  if (!markdownLink) return markdownLink;
  const match = markdownLink.match(/\((https?:\/\/[^)]+)\)/);
  return match ? match[1] : markdownLink;
}

/** Extracts "- Label: value" bullets under a "## Heading" section, stopping at the next "## " or "---". */
function parseBulletSection(markdown, headingText) {
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    line.trim().toLowerCase().startsWith(`## ${headingText}`.toLowerCase())
  );
  if (startIndex === -1) return {};

  const values = {};
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line) || line.trim() === "---") break;
    const match = line.match(/^-\s*([^:]+):\s*(.+)$/);
    if (match) {
      const [, label, value] = match;
      values[label.trim()] = value.trim();
    }
  }
  return values;
}

/** Extracts the paragraph body under a "### Heading" line, stopping at the next "#" heading or "---". */
function parseParagraphSection(markdown, headingText) {
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    line.trim().toLowerCase().startsWith(`### ${headingText}`.toLowerCase())
  );
  if (startIndex === -1) return "";

  const body = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line) || line.trim() === "---") break;
    if (line.trim() !== "") body.push(line.trim());
  }
  return body.join(" ").trim();
}

async function loadContact(achievementsPath) {
  const markdown = await readFile(achievementsPath, "utf-8");
  const contact = parseBulletSection(markdown, "Identity / Contact");
  return {
    name: contact["Name"],
    location: contact["Location"],
    phone: contact["Phone"],
    email: contact["Email"],
    linkedin: extractUrl(contact["LinkedIn"]),
    github: extractUrl(contact["GitHub"]),
  };
}

async function loadApplicationProfile(profilePath) {
  const markdown = await readFile(profilePath, "utf-8");

  const workAuth = parseBulletSection(markdown, "Work Authorization");
  const compensation = parseBulletSection(markdown, "Compensation");
  const logistics = parseBulletSection(markdown, "Logistics");
  const eeo = parseBulletSection(markdown, "EEO / Demographic Self-Identification");

  return {
    authorizedNoSponsorship: workAuth["Authorized to work in the US without sponsorship"],
    needsSponsorship: workAuth["Will now or in future require sponsorship"],
    salaryRange: compensation["Desired base salary range"],
    startDate: compensation["Notice period / earliest start date"],
    willingToRelocate: logistics["Willing to relocate"],
    remotePreference: logistics["Open to remote / hybrid / onsite"],
    eeo: {
      gender: eeo["Gender"],
      raceEthnicity: eeo["Race/Ethnicity"],
      veteranStatus: eeo["Veteran status"],
      disabilityStatus: eeo["Disability status"],
    },
    boilerplate: {
      whyInterested: parseParagraphSection(markdown, "Why are you interested in this role/company?"),
      howHeard: parseParagraphSection(markdown, "How did you hear about this position?"),
    },
  };
}

/**
 * Merges achievements.md's Identity/Contact block with application_profile.md
 * into one flat profile object for the platforms/*.js fill modules to read.
 * Any field still containing a "[FILL IN...]" placeholder is left undefined
 * so callers correctly treat it as unresolved rather than typing the
 * placeholder text into a real form.
 */
export async function loadProfile({ achievementsPath, applicationProfilePath }) {
  const [contact, appProfile] = await Promise.all([
    loadContact(achievementsPath),
    loadApplicationProfile(applicationProfilePath),
  ]);

  return scrubPlaceholders({ ...contact, ...appProfile });
}

export { isUnfilled };
