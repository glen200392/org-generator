# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- V2 workbook pipeline for `Nodes`, `Edges`, `Slides`, and `LayoutOverrides`.
- Workbook editor UI for direct V2 row editing and workbook export.
- Multi-page preview and `PageGroup` switching.
- Layout override dragging for V2 nodes.
- Stable/styled PPT export branching.
- Metadata-based PPT/PDF round-trip for self-generated files.
- Draft import flow for third-party PPT/PDF, including OCR fallback for PDFs.
- V2 workbook template sheets and a manual test checklist document.
- Validation status documentation covering current test gaps and recommended verification order.

### Changed

- Preview rendering now supports edge overlays, reference markers, and special role/layout handling.
- PPT export can auto-generate extra focus slides when overflow is detected.
- Project documentation now includes V2 usage and validation guidance.

## [2026-03-12]

### Added

- Repository scaffolding files: README, LICENSE, CONTRIBUTING, SECURITY, .gitignore.
- Repository collaboration files: CODE_OF_CONDUCT, issue templates, PR template.
- GitHub Actions workflows for CI and deployed Pages health checks.

### Changed

- Promoted sample data constants to global scope.
- Updated document language switching logic to avoid overriding user-entered data.
- Enlarged preview area to improve readability and page scrolling.
