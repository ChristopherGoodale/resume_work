/**
 * Classifies a job-application URL by platform so fill.js can pick the right
 * platforms/*.js module. Hostname match first; DOM fallback for company
 * domains that embed a Greenhouse/Lever form (e.g. careers.company.com).
 */

const HOSTNAME_RULES = [
  { platform: "linkedin", pattern: /(^|\.)linkedin\.com$/i },
  { platform: "greenhouse", pattern: /(^|\.)(job-boards\.)?greenhouse\.io$/i },
  { platform: "lever", pattern: /(^|\.)jobs\.lever\.co$/i },
  { platform: "workday", pattern: /myworkdayjobs\.com$/i },
  { platform: "taleo", pattern: /\.taleo\.net$/i },
];

export function detectPlatformFromUrl(url) {
  const hostname = new URL(url).hostname;
  for (const { platform, pattern } of HOSTNAME_RULES) {
    if (pattern.test(hostname)) return platform;
  }
  return "unknown";
}

/**
 * Fallback for custom domains (careers.company.com) that embed a known ATS's
 * form rather than redirecting to it. Call after the page has loaded.
 */
export async function detectPlatformFromPage(page) {
  const hasGreenhouseForm = await page
    .locator('form#application_form, iframe[src*="greenhouse.io"]')
    .count();
  if (hasGreenhouseForm > 0) return "greenhouse";

  const hasLeverForm = await page
    .locator('form.application-form, iframe[src*="lever.co"]')
    .count();
  if (hasLeverForm > 0) return "lever";

  // Taleo's JSF-based careersection flow is identifiable by its ViewState hidden
  // field even when white-labeled under a company's own custom domain.
  const hasTaleoForm = await page.locator('input[id="javax.faces.ViewState"]').count();
  if (hasTaleoForm > 0) return "taleo";

  return "unknown";
}
