# Validation Status

This document records the current validation state of the org modeling tool as of 2026-03-16.

## Current State

- Code changes have been implemented in `index.html`
- Manual validation has **not** been completed end to end
- Local automated validation has **not** been executed in this environment
- Browser-based smoke testing has **not** been executed in this environment

## Why Validation Is Incomplete

- The current machine does not have `node` or `npm` available
- The existing CI workflow depends on Node.js plus Playwright
- The app is browser-driven and relies on CDN-loaded libraries, so static file inspection alone is not enough to prove behavior

## What Exists Today

### CI Coverage in Repo

The repository contains a GitHub Actions workflow at `.github/workflows/ci.yml` that:

- checks required files
- runs `htmlhint` on `index.html`
- starts a local server
- runs a minimal Playwright smoke test

### Current CI Gaps

The existing smoke test only verifies:

- the page loads
- sample data can be loaded
- document language switching updates sample content

It does **not** validate:

- V2 workbook import
- page group switching
- layout overrides
- preview floating toolbar
- right-click quick actions
- dotted relation picker
- batch path input
- batch relation input
- PPT/PDF round-trip
- draft import flows

## User-Facing Risk Assessment

### High Risk

- Preview interaction conflicts between drag, click, floating toolbar, and context menu
- V2 editing flows that mutate `Nodes`, `Edges`, `Slides`, and `LayoutOverrides` in one session
- Round-trip consistency between preview state, workbook export, and PPT/PDF re-import

### Medium Risk

- Batch path parsing on malformed or partial rows
- Batch relation parsing with mixed delimiters and partial fields
- Cross-page edge visibility and reference behavior

### Lower Risk

- Static labels, dual-language text wiring, and non-interactive rendering helpers

## Validation Required Before Calling This Stable

1. Run the manual scenarios in `docs/TEST_CHECKLIST.md`
2. Execute the CI workflow locally or in GitHub Actions
3. Expand Playwright smoke coverage to include V2 flows and direct preview editing
4. Re-run regression checks after fixing issues found in steps 1-3

## Recommended Next Validation Order

1. Legacy load and export smoke test
2. V2 workbook import and page group switching
3. Path composer single-row and batch behavior
4. Preview floating toolbar and right-click quick actions
5. Dotted relation picker and batch relations
6. Layout override drag and workbook persistence
7. PPT/PDF export and self-generated round-trip
8. Third-party draft import behavior
