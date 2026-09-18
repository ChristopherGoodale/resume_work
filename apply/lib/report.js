import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Writes a per-run report + screenshot under apply/runs/[company]_[date]/.
 * The report banner always states the run stopped before submit — this is
 * documentation of fact (fill.js never clicks submit), not a toggle.
 */
export async function writeReport({ runDir, page, platform, applyUrl, filled, skipped, needsManualReview }) {
  await mkdir(runDir, { recursive: true });

  const screenshotPath = path.join(runDir, "screenshot.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const lines = [
    `# Application fill report — ${platform}`,
    "",
    "**STOPPED BEFORE SUBMIT — review the open browser window and submit manually.**",
    "",
    `Apply URL: ${applyUrl}`,
    `Screenshot: ${path.basename(screenshotPath)}`,
    "",
    "## Filled",
    ...(filled.length ? filled.map((f) => `- ${f}`) : ["- (none)"]),
    "",
    "## Skipped (password fields — enter manually, never automated)",
    ...(skipped.length ? skipped.map((s) => `- ${s}`) : ["- (none)"]),
    "",
    "## Needs manual review (could not confidently match to profile data)",
    ...(needsManualReview.length ? needsManualReview.map((q) => `- ${q}`) : ["- (none)"]),
    "",
  ];

  const reportPath = path.join(runDir, "report.md");
  await writeFile(reportPath, lines.join("\n"), "utf-8");
  return reportPath;
}
