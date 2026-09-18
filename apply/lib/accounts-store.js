import { readFile, writeFile } from "node:fs/promises";

/** Escapes pipe characters so a field can't break the markdown table structure. */
function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|");
}

/**
 * Appends one row to ats_accounts.md's table. This file is gitignored and
 * holds real generated passwords — never write to ats_accounts.example.md
 * with this function.
 */
export async function appendAccountRow(accountsPath, { company, platform, email, username, password, created, notes }) {
  const original = await readFile(accountsPath, "utf-8");
  const row = `| ${escapeCell(company)} | ${escapeCell(platform)} | ${escapeCell(email)} | ${escapeCell(username ?? "")} | ${escapeCell(password)} | ${escapeCell(created)} | ${escapeCell(notes ?? "")} |`;

  const lines = original.split(/\r?\n/);
  const separatorIndex = lines.findIndex((line) => /^\|[\s-|]+\|$/.test(line.trim()));
  if (separatorIndex === -1) {
    throw new Error(`Could not find the table header separator row in ${accountsPath}`);
  }

  lines.splice(separatorIndex + 1, 0, row);
  await writeFile(accountsPath, lines.join("\n"), "utf-8");
}
