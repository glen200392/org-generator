# User Guide

This guide explains the org chart tool from an end-user perspective: what it can do, where to click, and what its current limits are.

## What This Tool Is For

Use this tool when you need to:

- turn simple org data into a chart quickly
- build a multi-page PPT org chart from structured Excel data
- edit hierarchy, special roles, and dotted-line relationships in the browser
- fine-tune the final layout before export
- re-import self-generated PPT or PDF files and continue editing

This tool is best for organization-chart workflows that start from structured data, not for fully free-form diagram drawing.

## Main Modes

The tool supports two main data modes.

### 1. Legacy Mode

Legacy mode is the simple mode.

Input format:

`Level, Dept, Name, Title[, Color]`

Use it when:

- you want to paste data quickly
- the org chart is mostly a normal tree
- you do not need multi-page slide control or advanced relationship modeling

Strengths:

- fast to start
- good for standard tree charts
- simple import/export workflow

Limits:

- no true `NodeID / ParentID` structure
- weak support for complex dotted-line or matrix structures
- layout overrides are not persisted as a formal workbook model

### 2. V2 Workbook Mode

V2 mode is the structured mode.

Workbook sheets:

- `Nodes`
- `Edges`
- `Slides`
- `LayoutOverrides`

Use it when:

- you need multiple PPT pages
- you need stable IDs and parent relationships
- you need dotted-line, advisory, or project relationships
- you need preview edits to write back into workbook data

Strengths:

- more deterministic
- better fit for real company structures
- supports editing, export, and round-trip workflows

Limits:

- more fields to manage
- still not a full free-form diagram editor
- complex matrix layouts may still need manual cleanup

## What You Can Do

### Data Input

You can:

- load sample data
- paste legacy text rows
- upload legacy Excel files
- upload V2 workbooks
- batch-build hierarchy paths in V2 mode
- batch-create special relationships in V2 mode

### Preview and Navigation

You can:

- zoom in and out
- fit the chart to the viewport
- pan the canvas
- search by department, name, or title
- collapse and expand branches
- switch between page groups in V2 mode
- see edges and cross-page reference indicators

### Structure Editing

In V2 mode, you can:

- edit workbook rows directly
- change `ParentID`, `PageGroup`, `SortOrder`, `RoleType`, and `LayoutType`
- add a root node
- add a child node
- add a sibling node
- delete a node
- seed a path from the selected node and continue building from there

### Direct Preview Editing

In V2 mode, you can edit from the chart itself.

You can:

- click a node to select it
- use the floating toolbar near the selected node
- right-click a node for quick actions
- drag nodes when layout edit mode is enabled
- create a dotted relation by entering relation-pick mode and then clicking a target node

### Special Relationships

Supported relationship types include:

- `solid`
- `dotted`
- `advisory`
- `project`
- `reference`

You can add them:

- one by one from the node property panel
- in batches from the batch relation area
- directly from preview for dotted relations

### Export

You can export:

- PNG
- PDF
- PPTX

PPT supports two strategies:

- `stable`
- `styled`

`stable` is more conservative and prioritizes predictable output.
`styled` preserves more aggressive visual adjustments.

### Re-import and Round-Trip

You can:

- re-import self-generated PPT files through embedded metadata
- re-import self-generated PDF files through embedded metadata
- attempt draft imports for third-party PPT/PDF files
- use OCR fallback for some PDF draft imports

Important:

- self-generated PPT/PDF round-trip is the intended path
- third-party PPT/PDF import is draft-grade, not guaranteed reconstruction

## Key UI Areas

### Upload Bar

Use the upload bar to:

- import Excel
- import PPT
- import PDF
- upload a logo
- change document language

The visible file picker labels now follow the app UI language, not the browser-native file input text.

### Theme Panel

Use the theme panel to:

- switch color themes
- switch PPT export mode between `stable` and `styled`
- turn layout edit mode on or off
- load sample data

### Data Editing Area

This area changes depending on mode.

In Legacy mode:

- edit raw text rows directly

In V2 mode:

- view a read-only workbook summary in the top textarea
- use the hierarchy map table
- use the path composer
- use the node property panel

### Workbook Editor

Use this area to edit raw workbook sheet rows directly.

Best use cases:

- fixing field values precisely
- changing `Slides`
- changing `Edges`
- inspecting `LayoutOverrides`

### Preview Area

Use preview to:

- inspect the final visual result
- select nodes
- drag nodes in layout edit mode
- add children or siblings quickly
- create dotted relations from the chart

## Recommended Workflows

### Workflow A: Quick Single-Tree Chart

1. Load sample data or paste legacy rows.
2. Verify the preview.
3. Adjust the theme.
4. Export PNG, PDF, or PPT.

Use this when the chart is simple and mostly tree-shaped.

### Workflow B: Formal Multi-Page Org Chart

1. Prepare a V2 workbook.
2. Upload the workbook.
3. Switch between `PageGroup` values.
4. Adjust node properties and special relations.
5. Drag nodes if needed.
6. Export PPT in `stable` mode first.
7. Re-import the PPT if you want to continue editing later.

Use this when the org structure is too large for one slide.

### Workflow C: Build from Preview + Data Together

1. Upload a V2 workbook.
2. Select a node in preview.
3. Use `Seed From Selected`.
4. Extend the path in the path composer.
5. Use the floating toolbar to add nearby structure.
6. Use batch relations or dotted relation picking for non-tree links.
7. Export and review.

Use this when structure and visual refinement both matter.

## Stable vs Styled PPT

### Stable PPT

Use `stable` when:

- you want more predictable output
- the org chart is dense
- this is for formal delivery

Characteristics:

- more conservative layout behavior
- less aggressive visual drift from the base layout
- safer default choice

### Styled PPT

Use `styled` when:

- you want the slide to keep more manual visual tuning
- presentation polish matters more than strict conservatism

Characteristics:

- preserves more layout personality
- can look better for moderate-size charts
- may be less robust in dense structures

## Layout Edit Mode

When layout edit is off:

- preview is mainly for viewing, selecting, and quick actions

When layout edit is on:

- nodes can be dragged in V2 mode
- changes write into `LayoutOverrides`
- those overrides can persist through workbook export and re-import

Use layout edit after the structure is mostly correct.
Do not use it as a replacement for fixing `ParentID`, `RoleType`, or `LayoutType`.

## Special Roles and Layout Types

The tool can model special cases through V2 fields.

Examples:

- `assistant`
- `shared-service`
- `vacant`
- `between`
- `sidecar`
- `hidden-overview`

Practical rule:

- structure comes from workbook fields
- final visual refinement comes from preview and layout overrides

That means dragging a node changes its position, not its logical hierarchy.

## Current Limitations

This tool is useful, but there are real limits.

### Strong Areas

- structured tree modeling
- multi-page workbook-driven output
- preview-driven editing for normal org chart workflows
- metadata-based round-trip for self-generated exports

### Weak Areas

- fully automatic layout for dense matrix organizations
- arbitrary third-party PPT/PDF reverse engineering
- guaranteed visual perfection for many crossing edges
- complete production-grade validation in the current state

### Validation Status

As of the current repo state:

- features have been implemented
- validation documents exist
- full end-to-end verification is still incomplete

See:

- `docs/TEST_CHECKLIST.md`
- `docs/VALIDATION_STATUS.md`

## Best-Practice Advice

Use this tool most effectively by following this order:

1. Fix structure first.
2. Add special relations second.
3. Adjust slides and page groups third.
4. Use layout drag only after structure is stable.
5. Export `stable` PPT first.
6. Treat third-party import as draft material, not truth.

## When This Tool Is the Wrong Tool

Do not treat it as:

- a Visio replacement
- a full diagramming canvas
- a guaranteed OCR reconstruction tool for arbitrary scanned org charts
- a fully validated production system without running the test checklist

## Related Docs

- `docs/ORG_MODEL_V2.md`
- `docs/TEST_CHECKLIST.md`
- `docs/VALIDATION_STATUS.md`