# Org Model V2 Spec

This document defines the proposed Excel-to-preview-to-PPT data contract for complex organization charts.

The current app only supports a simple tree encoded as:

`Level, Dept, Name, Title[, Color]`

That format is not sufficient for:

- multi-page PPT output
- dotted-line reporting
- assistant / special roles between levels
- hidden intermediate levels in overview slides
- cross-page references
- matrix or advisory relationships

Org Model V2 addresses those cases by separating node data, edge data, and slide/page rules.

## Goals

- Keep Excel as the main authoring surface
- Preserve a deterministic mapping between Excel, browser preview, and PPT output
- Support both auto-pagination and manually controlled slide grouping
- Distinguish hierarchy nodes from relationship lines
- Allow a limited set of special layout behaviors without turning the authoring model into free-form drawing

## Non-goals

- Pixel-perfect PowerPoint authoring from Excel alone
- Fully automatic layout for arbitrarily dense matrix organizations
- Reverse-engineering arbitrary third-party PDF org charts into clean editable data

## Workbook Structure

The workbook should contain three required sheets:

1. `Nodes`
2. `Edges`
3. `Slides`

Optional sheets can be added later, for example:

- `Themes`
- `Validation`
- `Legend`

## Sheet 1: Nodes

Each row represents one person box or one org unit box in the chart.

### Required columns

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `NodeID` | string | yes | Stable unique identifier. Must not change once referenced elsewhere. |
| `ParentID` | string | yes except root | Primary solid-line manager / parent. Empty only for top root nodes. |
| `Dept` | string | yes | Displayed department / unit name. |
| `Name` | string | no | Person name. Can be blank for department-only nodes. |
| `Title` | string | no | Job title. |
| `PageGroup` | string | yes | The main PPT group this node belongs to. |
| `SortOrder` | number | no | Order within siblings. Lower numbers render first. |

### Recommended columns

| Column | Type | Description |
| --- | --- | --- |
| `LevelHint` | number | Optional visual depth hint for layout and validation. |
| `RoleType` | enum | `normal`, `assistant`, `acting`, `vacant`, `committee`, `shared-service`. |
| `LayoutType` | enum | `standard`, `between`, `sidecar`, `stacked`, `hidden-overview`. |
| `Color` | hex | Optional per-node override. |
| `DisplayName` | string | Override combined label if needed. |
| `ShowInOverview` | boolean | Whether this node appears in overview slides. Default `true`. |
| `ShowInDetail` | boolean | Whether this node appears in detail slides. Default `true`. |
| `PptNotes` | string | Notes for export metadata or speaker notes. |
| `AliasOf` | string | Optional link when the node is a visual reference to a master node shown elsewhere. |

### Rules

- `NodeID` must be unique across the workbook.
- `ParentID` must reference an existing `NodeID` unless the node is a root.
- `PageGroup` must match a row in the `Slides` sheet.
- The real structure is determined by `ParentID`, not by `LevelHint`.
- `LevelHint` is advisory only. It is used for validation and layout fallback.
- `RoleType=assistant` usually implies `LayoutType=between` or `sidecar`.
- `LayoutType=hidden-overview` means the node may be omitted on overview slides while still existing in detail slides.

## Sheet 2: Edges

Each row represents a non-primary relationship or a custom visual connection.

### Columns

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `FromNodeID` | string | yes | Relationship source. |
| `ToNodeID` | string | yes | Relationship target. |
| `EdgeType` | enum | yes | `solid`, `dotted`, `advisory`, `project`, `reference`. |
| `Label` | string | no | Optional edge label. |
| `ShowInOverview` | boolean | no | Whether to render on overview slides. |
| `ShowInDetail` | boolean | no | Whether to render on detail slides. |
| `PageScope` | string | no | `local`, `cross-page`, or a concrete `PageGroup`. |

### Rules

- Primary hierarchy should live in `Nodes.ParentID`, not here.
- `solid` edges in `Edges` are exceptional and should be used sparingly.
- `dotted` is the standard for indirect reporting.
- `reference` is used when a detail page points to another page instead of redrawing the full subtree.

## Sheet 3: Slides

Each row defines how a PPT page group should render.

### Columns

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `PageGroup` | string | yes | Unique slide group key. |
| `SlideTitle` | string | yes | Title shown in PPT. |
| `RenderMode` | enum | yes | `overview`, `subtree`, `focus`. |
| `RootNodeID` | string | yes | Root node rendered on this slide group. |
| `MaxDepth` | number | no | Maximum visible solid-line depth on this slide. |
| `IncludeCrossLinks` | boolean | no | Whether dotted/reference edges can render here. |
| `ParentGroup` | string | no | Parent slide group for drill-down navigation. |
| `SlideOrder` | number | no | Explicit ordering in PPT output. |

### Render modes

- `overview`: high-level summary. Usually depth 2-3.
- `subtree`: full branch detail for one department or business unit.
- `focus`: special-purpose page, for example executives, assistants, or matrix overlays.

## Mapping Logic

### Excel to Preview

- `Nodes` create visible cards.
- `ParentID` drives the main tree layout.
- `Edges` add dotted or advisory lines after the main tree is placed.
- `Slides` filters which subset of nodes and edges are shown in each preview mode.

### Preview to PPT

- Each `Slides` row produces one or more slides.
- If a subtree still exceeds the chosen page size, the renderer can split again by child `PageGroup` or by depth window.
- The exported PPT should store the source JSON model in metadata so that future re-import is possible.

### Cross-page behavior

When a branch does not fit on one slide:

- the overview slide shows a summary node only
- the detail slide renders the full branch
- the overview node can display a small reference marker such as `See Slide: R&D`
- a `reference` edge can be emitted in PPT metadata even if no visible line is drawn

## Supported Complex Cases

### 1. Standard hierarchy

Use:

- `RoleType=normal`
- `LayoutType=standard`
- `ParentID` for real manager

Expected result:

- predictable preview
- direct PPT export success

### 2. Hidden middle layer in overview

Use:

- normal `ParentID`
- `ShowInOverview=false` on the hidden node

Expected result:

- overview compresses the branch visually
- detail slides still show the full structure

Constraint:

- the renderer must bridge child nodes upward during overview rendering

### 3. Dotted-line reporting

Use:

- `Edges` row with `EdgeType=dotted`

Expected result:

- browser preview shows a dashed connector
- PPT export maps to dashed line shapes

### 4. Assistant or chief-of-staff between levels

Use:

- `RoleType=assistant`
- `LayoutType=between` or `sidecar`
- `ParentID` pointing to the supported executive

Expected result:

- preview places the assistant beside or between levels instead of in the default centered child row
- PPT export uses the same special placement logic

Constraint:

- this requires custom layout rules; it cannot be expressed correctly by `Level` alone

### 5. Shared service or matrix relationship

Use:

- one primary `ParentID`
- extra `Edges` rows using `dotted`, `advisory`, or `project`

Expected result:

- one stable primary placement
- optional secondary connectors

Constraint:

- dense matrices will still require manual simplification or a dedicated focus slide

## Validation Rules

The importer should block or warn on the following:

- duplicate `NodeID`
- missing `ParentID` target
- cycles in the primary tree
- orphan nodes assigned to unknown `PageGroup`
- `Edges` referencing unknown nodes
- `Slides.RootNodeID` not found
- `RoleType=assistant` without compatible `LayoutType`
- `LayoutType=between` on nodes with too many sibling conflicts
- branches exceeding slide density thresholds

## Minimal Example

### Nodes

| NodeID | ParentID | Dept | Name | Title | PageGroup | RoleType | LayoutType | SortOrder |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `N001` |  | HQ | John Doe | CEO | `OVR` | normal | standard | 10 |
| `N002` | `N001` | Strategy Office | Amy Lin | Chief of Staff | `OVR` | assistant | sidecar | 20 |
| `N003` | `N001` | R&D | Jane Smith | CTO | `RD` | normal | standard | 30 |
| `N004` | `N003` | Platform | Kevin Wu | Director | `RD` | normal | standard | 40 |
| `N005` | `N003` | Architecture | Chris Ho | Principal Architect | `RD` | shared-service | sidecar | 50 |
| `N006` | `N001` | Sales | Tom Clark | CRO | `SALES` | normal | standard | 60 |

### Edges

| FromNodeID | ToNodeID | EdgeType | Label | PageScope |
| --- | --- | --- | --- | --- |
| `N005` | `N006` | dotted | Shared support | cross-page |

### Slides

| PageGroup | SlideTitle | RenderMode | RootNodeID | MaxDepth | IncludeCrossLinks | SlideOrder |
| --- | --- | --- | --- | --- | --- | --- |
| `OVR` | Executive Overview | overview | `N001` | 2 | false | 10 |
| `RD` | R&D Organization | subtree | `N003` | 5 | true | 20 |
| `SALES` | Sales Organization | subtree | `N006` | 5 | true | 30 |

## Expected PPT Output From The Example

Slide 1:

- CEO at top
- Chief of Staff beside CEO
- R&D and Sales shown as level-1 branches
- no cross-page dotted line shown

Slide 2:

- CTO branch expanded
- Platform and Architecture shown
- optional dotted line note that Architecture supports Sales

Slide 3:

- CRO branch expanded
- optional incoming dotted reference from Architecture

## Implementation Order

Recommended build sequence:

1. Replace `Level`-based parsing with `NodeID + ParentID`
2. Add `PageGroup` and `Slides` support
3. Support multiple preview modes matching slide groups
4. Add `Edges` rendering for dotted/reference lines
5. Add `RoleType/LayoutType` special placements
6. Embed source JSON into PPT for round-trip import

## Success Criteria

V2 should be considered successful when:

- the same workbook produces deterministic browser preview and PPT output
- multi-page decks are generated from explicit `Slides` rows
- dotted-line and assistant roles render consistently
- validation identifies unsupported layouts before export
- exported PPT keeps enough source metadata for future re-import
