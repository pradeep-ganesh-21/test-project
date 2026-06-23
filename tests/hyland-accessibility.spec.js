import { test } from "@a11y-scout/playwright";
import { summarizeFindings } from "a11y-scout";

test("hyland.com accessibility check", async ({ page, a11y }) => {
  test.setTimeout(300000); // 5 minutes for AA level scans with LLM

  // Just navigate; readiness (`networkidle` wait + extra delay) is owned by
  // the engine so CLI and fixture see the same DOM.
  await page.goto("https://www.hyland.com/en", {
    waitUntil: "load",
    timeout: 60000,
  });

  const result = await a11y.scan({
    level: "AA",
    failOnBlockers: false,
  });

  const summary = summarizeFindings(result.state);

  console.log(`\n=== Accessibility Scan Results for hyland.com/en (AA) ===`);
  console.log(`Total issues found: ${summary.total}`);
  console.log(`Blockers: ${summary.blockers}`);
  console.log(`Severe: ${summary.severe}`);
  console.log(`Major: ${summary.major}`);
  console.log(`Minor: ${summary.minor}`);
  console.log(`AI-flagged review: ${summary.review}`);
  console.log(`AI cost: $${result.state.cost.totalUsd.toFixed(4)}`);

  console.log(`\nReports generated:`);
  console.log(`HTML: ${result.reportPaths.html}`);
  console.log(`Markdown: ${result.reportPaths.md}`);
  console.log(`JSON: ${result.reportPaths.json}`);
});
