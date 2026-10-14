# Local Model — File Tree Reference for Agents

This document describes the local file tree written by `spec-stream run` under
`.spec-stream/model/` (or the `localSync.dir` you configured). It is the primary
reference for agents that read or write the model.

---

## Quick orientation

```
.spec-stream/model/
  workspace.json          # workspace id + name
  uuid-index.json         # { uuid → "relative/dir" }  ← resolve any id to its path
  chapters/
    [chapter-uuid]/
      chapter.json
      index.md            # generated — DO NOT EDIT
      slices/
        [slice-uuid]/
          slice.json
          details.md
      lanes/
        [lane-uuid]/
          lane.json
      elements/
        [element-uuid]/
          element.json
          description.md
          details.md
          play-function.ts    # only if set
          play-type.ts        # only if set
      scenarios/
        [scenario-uuid]/
          scenario.json
  milestones/
    [milestone-uuid]/
      milestone.json
      description.md
  html-snippets/
    [slug].html
    [slug].json
```

**Key facts:**
- Chapter, slice, lane, element, scenario, and milestone directories are named by their UUID. Names and labels live only in the `.json` files.
- Slices, lanes, and elements are flat siblings under their chapter — they are **not** nested under each other.
- Elements reference their lane and slice via `laneId` and `sliceId` in `element.json`.
- `uuid-index.json` maps every UUID to its directory. Use it to jump from a UUID to the right path without traversing the tree.
- `index.md` is auto-generated from the board state and overwritten on every sync — do not edit it.

---

## Read-only files (generated, overwritten by sync)

- `index.md` — chapter slice summary
- `uuid-index.json` — UUID→path lookup
- `workspace.json`

---

## Editable files (synced back to prooph board on `@proophboard/spec-stream sync-back`)

These files can be created or modified by an agent. On the next `@proophboard/spec-stream sync-back` run
changes are pushed to prooph board workspace.

> **UUID authoring:** When creating new entities (chapters, lanes, slices, elements, scenarios),
> generate a UUID v4 and use it as both the directory name and the `"id"` field in the
> corresponding `.json` file. `sync-back` forwards that UUID to the prooph board API, which
> accepts and stores it as-is — so the UUID you assign locally is the UUID the entity will have
> on the board permanently.
> You can therefore safely cross-reference locally-assigned UUIDs in `element.json` (`laneId`,
> `sliceId`) and in scenario expectations before `sync-back` has been called. `model validate`
> also recognises locally-assigned UUIDs and will not flag them as dangling references.

| File | What it maps to |
|------|-----------------|
| `chapter.json` | chapter name, context |
| `slice.json` | slice label, status |
| `slice details.md` | slice details |
| `lane.json` | lane label, type, height |
| `element.json` | element name, type, position (laneId/sliceId/index) |
| `description.md` (in element dir) | element description (the short sticky-note text) |
| `details.md` (in element dir) | element details (rich markdown content) |
| `play-function.ts` | Exploration Mode decide/apply/read handler |
| `play-type.ts` | Exploration Mode Payload type |
| `scenario.json` | scenario definition, interactions, expectations |
| `milestone.json` | milestone name, deadline, color |
| `milestone description.md` | milestone description |
| `html snippet slug.json` | snippet name and slug |
| `html snippet slug.html` | html snippet that gets imported into main html |

---

## Creating a new entity — directory naming

| Entity | Directory | Example |
|--------|-----------|---------|
| Chapter | `chapters/[chapter-uuid]/` | `chapters/9598a1b8-406c-4366-a907-abc2d33c22be/` |
| Slice | `chapters/[chapter-uuid]/slices/[slice-uuid]/` | `chapters/9598a1b8-.../slices/e5227bbf-.../` |
| Lane | `chapters/[chapter-uuid]/lanes/[lane-uuid]/` | `chapters/9598a1b8-.../lanes/40e12bb9-.../` |
| Element | `chapters/[chapter-uuid]/elements/[element-uuid]/` | `chapters/9598a1b8-.../elements/422a7caa-.../` |
| Scenario | `chapters/[chapter-uuid]/scenarios/[scenario-uuid]/` | `chapters/9598a1b8-.../scenarios/db1b3218-.../` |
| Milestone | `milestones/[milestone-uuid]/` | `milestones/f47ac10b-58cc-4372-a567-0e02b2c3d479/` |

Generate a fresh UUID v4 for each new entity and use it as both the directory name and the `"id"` in the `.json`.

---

## JSON schemas

### `workspace.json`
```json
{ "id": "uuid", "name": "Workspace Name" }
```

### `chapter.json`
```json
{
  "id": "uuid",
  "name": "Chapter Name",
  "context": "Bounded Context",
  "index": 0,
  "mode": "event-modeling",
  "sliceOrder": ["uuid", "uuid"],
  "laneOrder":  ["uuid", "uuid"]
}
```
`mode` is `"event-modeling"` or `"freestyle"`.

### `slice.json`
```json
{
  "id": "uuid",
  "label": "Slice Label",
  "index": 1,
  "status": "draft",
  "width": 250,
  "milestoneId": "uuid",
  "milestoneName": "MVP"
}
```
`status` values: `draft` | `planned` | `in-progress` | `blocked` | `ready` | `reviewed` | `deployed`

### `lane.json`
```json
{
  "id": "uuid",
  "label": "Lane Label",
  "type": "information-flow",
  "index": 1,
  "height": 150
}
```
`type` values: `user-lane` | `information-flow` | `system`

### `element.json`
```json
{
  "id": "uuid",
  "type": "command",
  "name": "Create Todo",
  "context": "Todo Management",
  "laneId": "uuid",
  "sliceId": "uuid",
  "index": 0
}
```
`type` values: `command` | `event` | `information` | `ui` | `automation` | `hotspot`

Play function and type are auto-discovered: if `play-function.ts` or `play-type.ts` exist in the element directory, they are loaded automatically.

### `scenario.json`
```json
{
  "id": "uuid",
  "chapterId": "uuid",
  "name": "Add first Todo",
  "clock": "2026-01-01T00:00:00Z",
  "initialState": {
    "ContextName": { "ViewName": [] }
  },
  "seededEvents": [
    { "name": "Todo Added", "context": "Todo Management", "payload": { "title": "Buy Milk" } }
  ],
  "interactions": [
    { "stepIndex": 0, "storage": { "title": "Buy Milk" } }
  ],
  "expectations": [
    {
      "id": "uuid",
      "sliceId": "uuid",
      "kind": "information",
      "elementId": "uuid",
      "match": "subset",
      "expected": {
        "view": "read",
        "value": { "title": "Buy Milk", "status": "open" }
      }
    }
  ],
  "createdAt": "2026-10-04T19:45:13Z",
  "updatedAt": "2026-10-06T10:32:47Z"
}
```

**`kind`** values: `events` | `information` | `rejection`

**`kind: "events"` expectation:**
```json
{
  "id": "uuid",
  "sliceId": "uuid",
  "kind": "events",
  "match": "exact",
  "expected": {
    "events": [
      { "name": "Todo Added", "context": "Todo Management", "payload": { "title": "Buy Milk" } }
    ]
  }
}
```

**`kind: "rejection"` expectation:**
```json
{
  "id": "uuid",
  "sliceId": "uuid",
  "kind": "rejection",
  "expected": { "message": "Title is required" }
}
```

`match` defaults: `events` → `"exact"`, `information` → `"subset"`. Omit to use the default.

Fields `clock`, `initialState`, `seededEvents`, `interactions`, `expectations` are optional — omit entirely rather than setting to `null`/`[]`.

### `milestone.json`
```json
{
  "id": "uuid",
  "name": "MVP",
  "deadline": "2026-12-31",
  "color": "#3b82f6",
  "isCompleted": false,
  "slices": [{ "sliceId": "uuid", "chapterId": "uuid", "label": "Plan Todo" }]
}
```

---

## `uuid-index.json`

Flat map of every UUID to the directory that contains its primary `.json`:

```json
{
  "9598a1b8-406c-4366-a907-abc2d33c22be": "chapters/9598a1b8-406c-4366-a907-abc2d33c22be",
  "e5227bbf-cf01-4c62-85b2-a8ffa48f56a9": "chapters/9598a1b8-406c-4366-a907-abc2d33c22be/slices/e5227bbf-cf01-4c62-85b2-a8ffa48f56a9",
  "40e12bb9-5485-4399-a1d4-bcd50fa334aa": "chapters/9598a1b8-406c-4366-a907-abc2d33c22be/lanes/40e12bb9-5485-4399-a1d4-bcd50fa334aa",
  "422a7caa-36a2-42bf-a313-3f7b3090d6b8": "chapters/9598a1b8-406c-4366-a907-abc2d33c22be/elements/422a7caa-36a2-42bf-a313-3f7b3090d6b8"
}
```

Use this to resolve a UUID from a changelog event or MCP response to a local path without recursing the tree.

---

## How sync-back works

Run `@proophboard/spec-stream sync-back`. It diffs
changes against manifest and translates them into prooph board API calls:

- Modified `element.json` → rename and/or move element
- Modified `description.md` / `details.md` → update description/details
- Modified `play-function.ts` / `play-type.ts` → update element config
- Modified `scenario.json` → set/remove expectations
- Added files → create the entity (the `"id"` from the `.json` is forwarded to the API,
  so the UUID you assigned locally is preserved on the board)
- Deleted primary `.json` → delete the entity

If any API call fails, the command exits non-zero. Fix the issue and try again.

**Preview without committing:**
```sh
@proophboard/spec-stream sync-back --dry-run --verbose
```

---

## Validate the model before committing

```sh
@proophboard/spec-stream model validate
```

Checks:
- All `.json` files are valid JSON
- `element.json` `laneId` and `sliceId` exist in `uuid-index.json` **or** are present as
  an `"id"` value in another local `.json` file (locally-assigned UUIDs not yet pushed via
  sync-back are accepted — they are not dangling references)
- Scenario `sliceId` and `elementId` in expectations exist in `uuid-index.json` or are
  locally-assigned UUIDs (same exemption as above)
- No duplicate UUIDs in `uuid-index.json` pointing to different dirs

Exits 0 if clean, 1 if issues found. Use `--verbose` to see all checked paths.
