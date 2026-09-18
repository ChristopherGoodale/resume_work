import { randomInt } from "node:crypto";

const LOWER = "abcdefghijkmnpqrstuvwxyz"; // no l/o — avoids visual ambiguity if ever hand-copied
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*-_=+";
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function pick(charset) {
  return charset[randomInt(charset.length)];
}

/**
 * Generates a fresh random password for a brand-new account — never reads,
 * derives, or reuses an existing credential. Guarantees at least one of each
 * character class so it clears typical ATS/Workday complexity requirements.
 */
export function generatePassword(length = 20) {
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: length - required.length }, () => pick(ALL));
  const chars = [...required, ...rest];

  // Fisher-Yates shuffle so the required characters aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
