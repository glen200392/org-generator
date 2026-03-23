# Test Checklist

Use this checklist to validate the current org modeling workflow end to end.

## Environment

- Open [index.html](../index.html) in a modern Chromium-based browser
- Confirm network access is available for CDN-loaded libraries
- Prepare:
  - a legacy 4-column Excel file
  - a V2 workbook with `Nodes`, `Slides`, `Edges`, and `LayoutOverrides`

## Legacy Mode

- Load the sample data
- Switch UI language and document language
- Verify preview still redraws correctly
- Upload a legacy Excel file
- Confirm mode badge stays in `LEGACY`
- Export PNG, PDF, and PPT

## V2 Workbook Import

- Upload a V2 workbook
- Confirm the mode badge changes to `V2 Workbook`
- Confirm the editor panel becomes visible
- Confirm `PageGroup` selector appears
- Switch between page groups and verify preview changes
- Confirm `Edges` render in pages where both endpoints are visible

## Workbook Editor

- Edit a `Nodes` cell and verify preview updates
- Edit a `Slides` title and verify canvas title updates
- Add a row in `LayoutOverrides`
- Download the workbook and reopen it
- Confirm the edited values persist

## Path Composer

- Select a node in preview and use `Seed From Selected`
- Extend the path with one extra level and apply it
- Confirm the new branch appears in preview and hierarchy map
- Use the batch path area with tab-separated rows
- Use the batch path area with `Dept|Name|Title > Dept|Name|Title`
- Reopen the downloaded workbook and confirm the generated nodes persist

## Layout Overrides

- Enable layout edit mode
- Drag a node in a V2 page
- Confirm the node moves immediately
- Download the workbook
- Re-import the workbook and confirm the node keeps its adjusted position

## Role and Layout Types

- Test `assistant + sidecar`
- Test `assistant + between`
- Test `vacant`
- Test `hidden-overview`
- Test `shared-service`
- Confirm preview and PPT output are directionally consistent

## Preview Direct Editing

- Select a node and confirm the floating toolbar appears near the card
- Add a child from the floating toolbar
- Add a sibling from the floating toolbar
- Collapse and expand a branch from the floating toolbar
- Delete a node from the floating toolbar
- Right-click a node and verify the quick action menu matches the toolbar behavior

## Relations

- Add a single `dotted` relation from the property panel
- Add a `project` or `advisory` relation from the property panel
- Use the preview `dotted` picker and click a second node to create a relation
- While the relation picker is active, click the source node again and confirm the mode cancels
- Use the batch relation area with:
  - `TargetID`
  - `TargetID|dotted|local|Label`
  - `FromID|ToID|dotted|cross-page|Label`
- Delete an existing relation and confirm preview updates

## PPT Export

- Export using `stable`
- Export using `styled`
- Confirm multi-page output order follows `Slides.SlideOrder`
- Confirm large branches generate extra focus slides when overflow is detected
- Re-import the generated PPT and confirm workbook restoration via metadata

## PDF Export

- Export a V2 model to PDF
- Re-import the generated PDF
- Confirm workbook restoration via metadata

## Draft Import

- Import a third-party PPT without metadata
- Confirm the app creates a draft workbook and shows a warning
- Import a text-based PDF without metadata
- Confirm a draft workbook is created
- Import a scanned PDF
- Confirm OCR fallback attempts to build a draft workbook

## Known Manual Review Points

- Dense matrix relationships may still need visual cleanup
- OCR-derived drafts must be reviewed before use
- Cross-page references are indicative, not a perfect routing system
- Floating toolbar / right-click / drag interactions must be checked for event conflicts
- Path batch and relation batch parsers need malformed input testing
