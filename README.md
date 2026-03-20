# Org Generator

A standalone web tool for generating enterprise organization charts from simple tabular data.

## Features

- Paste or upload org data (Excel)
- Live preview with zoom, pan, collapse/expand
- V2 workbook support with `Nodes`, `Edges`, `Slides`, and `LayoutOverrides`
- Workbook editor for direct V2 row editing
- Layout override dragging for V2 nodes
- Stable/styled PPT export modes
- Metadata-based PPT/PDF re-import
- Draft import paths for third-party PPT/PDF
- Theme switcher
- Export to PNG, PDF, and PPTX
- UI language toggle and document language toggle

## Quick Start

### Option A: Use Online (GitHub Pages)

Visit **https://glen200392.github.io/org-generator/** — no installation needed.

### Option B: Download and Use Offline

1. Download [`index.html`](index.html) (right-click → Save As, or click the file then click the download button).
2. Open it in any modern browser (Chrome, Edge, Firefox).
3. Done. No server, no install, no dependencies required.

### Then

1. Load sample data or upload an Excel file.
2. Adjust theme and layout.
3. Export to PNG, PDF, or PPTX.

## Local Development

If you have Node.js installed:

1. Run `npm install`
2. Run `npm run serve` and open `http://127.0.0.1:4173/index.html`
3. Run `npm run lint`
4. Run `npm run test:smoke`

## Data Format

Each row should follow:

`Level, Dept, Name, Title[, Color]`

Example:

```text
1, HQ, John Doe, CEO
2, Technology, Jane Smith, CTO
3, Software Dev, Bob Lee, Manager
```

For the proposed complex multi-page and special-role workbook format, see [docs/ORG_MODEL_V2.md](docs/ORG_MODEL_V2.md).
For an end-user walkthrough, see [docs/USER_GUIDE.md](docs/USER_GUIDE.md).
For manual validation scenarios, see [docs/TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md).
For the current validation gap analysis, see [docs/VALIDATION_STATUS.md](docs/VALIDATION_STATUS.md).

## File Structure

- `index.html`: Main application (single-file app)
- `CHANGELOG.md`: Versioned change notes
- `CONTRIBUTING.md`: Contribution guidelines
- `SECURITY.md`: Vulnerability reporting policy

## Deployment

This project is intended for GitHub Pages deployment.

- Production URL (after Pages is enabled):
  `https://glen200392.github.io/org-generator/`

## Automation

GitHub Actions included:

- `CI` (`.github/workflows/ci.yml`)
  - Runs on push/pull_request
  - Validates required files
  - Lints `index.html` with HTMLHint
  - Runs a Playwright smoke test against local server

- `Pages Healthcheck` (`.github/workflows/pages-healthcheck.yml`)
  - Runs daily and can be triggered manually
  - Verifies deployed GitHub Pages URL is reachable
  - Checks key HTML content markers

## Validation Notes

Recommended smoke checks before each release:

- Load sample data in both document languages
- Upload Excel and verify parsing
- Export PNG/PDF/PPTX and open the files
- Verify mobile and desktop layout behavior
- Run through [docs/TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md) for V2 import/export and draft import flows
- Review [docs/VALIDATION_STATUS.md](docs/VALIDATION_STATUS.md) before treating the app as release-ready

## License

MIT. See [LICENSE](LICENSE).
