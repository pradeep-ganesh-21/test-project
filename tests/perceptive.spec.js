import { test } from "@a11y-scout/playwright";
import { summarizeFindings } from "a11y-scout";

test("Titan login and accessibility check", async ({ page, a11y }) => {
  test.setTimeout(300000); // 5 minutes for AA level scans with LLM

  // Step 1: Navigate to project-titan.pc.k8s.hyland.io/home
  await page.goto("https://project-titan.pc.k8s.hyland.io/home", {
    waitUntil: "load",
    timeout: 60000,
  });

  console.log("Step 1: Navigated to Titan home page");

  // Step 2: Click on the login button
  await page.locator("body > ti-root > hy-shell > div > mat-sidenav-container > mat-sidenav-content > ti-home-view > div > div > button > span.mdc-button__label").click();

  console.log("Step 2: Clicked initial login button");

  // Wait for login form to appear
  await page.waitForSelector('input#username', { timeout: 10000 });

  // Step 3: Enter username "test2"
  await page.locator('input#username').fill('test2');

  console.log("Step 3: Entered username");

  // Step 4: Enter password "ImageNow!ImageNow!"
  await page.locator('input#password').fill('ImageNow!ImageNow!');

  console.log("Step 4: Entered password");

  // Step 5: Click on login button
  await page.locator("body > div > div > div > div.column.one > form > div:nth-child(5) > button").click();

  console.log("Step 7: Clicked login submit button");

  // Step 6: Click on "Do not ask me again" radio button
  await page.locator('#_shib_idp_globalConsent').click();

  console.log('Step 5: Clicked "Do not ask me again" radio button');

  // Step 7: Click Accept
  await page.locator('body > form > div > div:nth-child(4) > p:nth-child(3) > input[type=submit]:nth-child(2)').click();

  console.log("Step 6: Clicked Accept button");

  // Wait for navigation after login
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  console.log("Login completed, waiting for page to stabilize");

  const homeUrl = page.url();
  console.log(`Home URL captured for scan: ${homeUrl}`);

  // Scan the logged-in home page. scanPage() accumulates this into the
  // worker-scoped report; generateReport() at the end emits one consolidated
  // HTML/Markdown/JSON report covering every page scanned in this test.
  const homeSlice = await a11y.scanPage({
    level: "AA",
    failOnBlockers: false,
    aiFix: false,
  });

  console.log(`\n=== Titan Home (AA) ===`);
  console.log(`Page: ${homeSlice.pageUrl}`);
  console.log(`Findings on this page: ${homeSlice.findings.length}`);
  console.log(`Accumulated so far: ${homeSlice.accumulatedCount}`);

  // Click on "Capture and Indexing". Use getByRole as the primary locator
  // (resilient to DOM-structure shifts) and fall back to the deep CSS path
  // if the role-based lookup misses.
  const captureLink = page.getByRole('link', { name: /capture and indexing/i });
  if (await captureLink.count() > 0) {
    await captureLink.first().click();
  } else {
    await page
      .locator("body > ti-root > hy-shell > div > mat-sidenav-container > mat-sidenav-content > ti-home-view > div > div > a:nth-child(2)")
      .click();
  }

  console.log('Clicked "Capture and Indexing"');

  // CRITICAL: wait for the URL to actually change. Angular's router-link can
  // dispatch async; without this guard, scanPage() runs while page.url() is
  // still /home and both scans get aggregated under the same URL — the second
  // scan effectively disappears.
  try {
    await page.waitForURL((url) => url.toString() !== homeUrl, { timeout: 30000 });
  } catch (err) {
    throw new Error(
      `Capture and Indexing navigation never happened — page.url() is still ${page.url()}. ` +
      `Check the link selector or whether the click triggered a route change.`,
    );
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  const captureUrl = page.url();
  console.log(`Capture URL after navigation: ${captureUrl}`);

  // Scan the Capture and Indexing page. Same worker → same accumulator →
  // findings merge into the same consolidated report. The extra wait gives
  // Angular's lazy modules time to render before axe snapshots the DOM.
  const captureSlice = await a11y.scanPage({
    level: "AA",
    failOnBlockers: false,
    aiFix: false,
    extraWaitMs: 15000,
  });

  console.log(`\n=== Capture and Indexing (AA) ===`);
  console.log(`Page: ${captureSlice.pageUrl}`);
  console.log(`Findings on this page: ${captureSlice.findings.length}`);
  console.log(`Accumulated so far: ${captureSlice.accumulatedCount}`);

  if (captureSlice.pageUrl === homeSlice.pageUrl) {
    throw new Error(
      `Both scans recorded the same URL (${homeSlice.pageUrl}). ` +
      `The Capture and Indexing click did not change the page URL — fix the click before generating the report.`,
    );
  }

  // Emit ONE consolidated report covering both pages. The HTML report includes
  // a sticky "Filter by page" dropdown so you can scope every section to a
  // single page. If you forget this call, worker teardown auto-finalizes the
  // report files (but without attaching the HTML to this Playwright test).
  const { state, reportPaths } = await a11y.generateReport({
    failOnBlockers: false,
  });

  const summary = summarizeFindings(state);

  console.log(`\n=== Consolidated Accessibility Report (AA) ===`);
  console.log(`Pages scanned: ${state.meta.pagesScanned.length}`);
  console.log(`Total issues found: ${summary.total}`);
  console.log(`Blockers: ${summary.blockers}`);
  console.log(`Severe: ${summary.severe}`);
  console.log(`Major: ${summary.major}`);
  console.log(`Minor: ${summary.minor}`);
  console.log(`AI-flagged review: ${summary.review}`);
  console.log(`AI cost: $${state.cost.totalUsd.toFixed(4)}`);

  console.log(`\nReports generated:`);
  console.log(`HTML: ${reportPaths.html}`);
  console.log(`Markdown: ${reportPaths.md}`);
  console.log(`JSON: ${reportPaths.json}`);
});
