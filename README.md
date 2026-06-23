# Accessibility Testing with a11y-scout

This project demonstrates accessibility testing for websites using the a11y-scout Playwright fixture.

## Setup Complete ✓

- ✅ a11y-scout packages installed from distribution folder
- ✅ Playwright test environment configured
- ✅ Test cases created for hyland.com

## Project Structure

```
test-project/
├── distribution/              # Package files
│   ├── a11y-scout-0.1.0.tgz
│   ├── a11y-scout-playwright-0.1.0.tgz
│   └── INSTALLATION_GUIDE.md
├── tests/
│   ├── google.spec.js                              # Example test
│   ├── hyland-accessibility.spec.js                # Hyland a11y test (fails on blockers)
│   └── hyland-accessibility-report-only.spec.js    # Hyland a11y test (report only)
├── a11y-reports/              # Generated accessibility reports (timestamped)
├── test-results/              # Playwright test results
└── .env.example              # Environment config template

```

## Running Tests

### Run all accessibility tests
```bash
npx playwright test tests/hyland-accessibility.spec.js
```

### Run report-only version (doesn't fail on blockers)
```bash
npx playwright test tests/hyland-accessibility-report-only.spec.js
```

### View HTML reports
```bash
npx playwright show-report
```

## Test Results Summary

### hyland.com - WCAG AA Scan Results

**Total Issues:** 12
- 🔴 **Blockers:** 10
- 🟠 **Severe:** 2
- 🟡 **Major:** 0
- 🔵 **Minor:** 0
- 📋 **Review:** 0

### Key Findings

#### Blocker Issues (10)
1. **Button without text** (1 issue)
   - Close button on notification banner has no accessible label
   - WCAG 4.1.2 (A) - `button-name`

2. **Missing image alt text** (9 issues)
   - Multiple decorative icons in content tiles missing alt attributes
   - WCAG 1.1.1 (A) - `image-alt`
   - Affected images: sparkle, window-console, glance-horizontal-sparkles, document-search, checkmark-sunburst, apps-add-in, wrench-screwdriver, people, cloud

#### Severe Issues (2)
1. **Invalid ARIA attribute**
   - Span element with `role="presentation"` using prohibited `aria-label`
   - WCAG 4.1.2 (A) - `aria-prohibited-attr`

2. **Link without text**
   - Logo link (navbar-brand) has no accessible text
   - WCAG 2.4.4 (A) - `link-name`

## Generated Reports

Each test run generates three report formats:

1. **HTML Report** (`*.html`)
   - Interactive browser-viewable report
   - Dark-mode aware
   - Includes remediation guidance

2. **Markdown Report** (`*.md`)
   - Text-based summary
   - Easy to share in PRs or documentation

3. **JSON Report** (`*.json`)
   - Machine-readable format
   - For CI/CD integration

Reports are saved in: `a11y-reports/www-hyland-com-[timestamp]/`

## WCAG Levels

| Level | Description | HAIP Required? | Cost |
|-------|-------------|----------------|------|
| **A** | Basic accessibility (minimum) | No | Free |
| **AA** | Industry standard | No | Free |
| **AAA** | Enhanced accessibility | Yes | ~$0.0002/page |

Currently testing at **AA level** (most common requirement).

## Environment Configuration

For AAA level scans, copy `.env.example` to `.env` and add HAIP credentials:

```bash
cp .env.example .env
# Edit .env and add your HAIP credentials
```

## Available Test Cases

### 1. `hyland-accessibility.spec.js`
- Scans hyland.com at WCAG AA level
- **Fails test** if blockers are found (default behavior)
- Useful for CI/CD pipelines to prevent regressions

### 2. `hyland-accessibility-report-only.spec.js`
- Same scan but with `failOnBlockers: false`
- **Always passes** - just generates reports
- Useful for initial assessment and metrics collection

## Next Steps

1. **Review HTML reports** in browser for detailed findings
2. **Prioritize fixes** starting with blockers
3. **Run in CI/CD** to catch accessibility regressions
4. **Expand coverage** to other critical pages

## Resources

- Installation Guide: `distribution/INSTALLATION_GUIDE.md`
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Report Location: `test-results/*/a11y-reports/`
