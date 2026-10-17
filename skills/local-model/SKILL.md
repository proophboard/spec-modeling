---
name: local-model
description: Work with prooph board models through spec-stream. Use this skill to inspect, edit, validate, test, and synchronize a local model copy safely.
---

# Local Model: Working with prooph board through spec-stream

Use this skill whenever a task requires reading or changing a prooph board model through its local file representation.

This skill covers the **local workflow and file mechanics**. It does not define how to model a business process. For modeling decisions, also load the relevant methodology skill, such as `event-modeling`. For anything involving scenarios, play functions, or play types, also load the `exploration-mode` skill — it owns those concepts entirely and defines the mandatory validation steps before sync-back.

For the complete file tree layout, every JSON schema, field types and allowed values see [`MODEL_SCHEMA.md`](./MODEL_SCHEMA.md).

## Core rules

1. **Near real-time refresh.** The live prooph board is the source of truth. The local copy is updated near real-time with the help of `npx @proophboard/spec-stream run` running in the background. The user has to run it, if you detect that your changes are not synced, provide a hint to the user that spec-stream is maybe not running or has technical problem.
2. **Treat the local model as a working copy, not a second source of truth.** Make changes in the local model and use `npx @proophboard/spec-stream sync-back` to synchronize them back.
3. **Never edit generated or mirrored files directly.** In particular, do not edit `index.md`, `uuid-index.json`, or `workspace.json`.
4. **Validate before sync-back.** Run model validation, inspect the proposed changes, then synchronize.
5. **Treat deletions as destructive.** Deleting a primary entity JSON file can delete that entity from prooph board. Never delete files as a cleanup shortcut.
6. **Do not assume a successful local edit means the board is updated.** Changes reach prooph board only after sync-back succeeds.

## 1. Locate the model

By default, the local model is written to:

```text
model/
```

The directory can be changed through the `localSync.dir` configuration. Check the project configuration and existing files rather than assuming the default path.

### Navigating the tree

- Names in directory paths are sanitized slugs. The raw names are stored in the corresponding JSON files.
- Slice and element directories have zero-padded numeric prefixes that reflect their board order.
- Lane directories are not numerically prefixed; use `lane.json`'s `index` to determine lane order.
- `uuid-index.json` maps UUIDs to relative paths. Use it to find an entity from an ID returned by another tool or present in a reference.
- Read the relevant entity JSON before changing its name, type, placement, status, or other structured properties. Do not infer those values from the directory name alone.

## 2. Know which files are safe to edit

### Generated or mirrored: do not edit

| Path | Reason |
|---|---|
| `index.md` | Generated chapter summary; overwritten on sync |
| `uuid-index.json` | Generated UUID-to-path index |
| `workspace.json` | Generated workspace metadata |

Do not try to make a change persist by editing a generated file. Change the appropriate editable source file and let `spec-stream` regenerate its outputs.

### Editable files

| File | Represents                                                                                                               |
|---|--------------------------------------------------------------------------------------------------------------------------|
| `chapter.json` | Chapter name and context                                                                                                 |
| `slice.json` | Slice label and status                                                                                                   |
| Slice `details.md` | Slice details                                                                                                            |
| `lane.json` | Lane label, index, and height                                                                                            |
| `element.json` | Element name, type, and placement properties such as `laneId`, `sliceId`, and index                                      |
| Element `description.md` | Short, placement-specific sticky-note description                                                                        |
| Element `details.md` | Rich details for the element. Syncing back propagates the change to all same-name/type/context elements on prooph board. |
| `play-function.ts` | Exploration Mode handler — see `exploration-mode` skill                                                                  |
| `play-type.ts` | Payload type for the Element — see `event-modeling` skill and `exploration-mode` skill                                   |
| `scenario.json` | Scenario definition — see `exploration-mode` skill                                                                       |
| `milestone.json` / `description.md` | Milestone properties and description                                                                                     |
| HTML snippet files | HTML snippet content and associated metadata                                                                             |

Use the existing file format and nearby examples. Do not invent fields or reshape JSON without checking the project's existing model files and schema/reference documentation.

### Important distinction: element description vs. details

- `description.md` is short text for the particular placement of an element.
- Element `details.md` is the details body for that element placement. When you edit it and sync back, prooph board propagates the change to all other elements sharing the same name, type, and context — you do not need to touch the other placements manually.
- Slice-specific behavior and Given/When/Then material belong in the **slice details**, not in element details.

## 3. Make a focused change

Before editing:

1. Identify the exact chapter, slice, lane, element, or scenario involved.
2. Read the relevant JSON and Markdown files, including nearby examples.
3. Use `uuid-index.json` to resolve IDs to paths when needed.
4. Check whether the change affects a shared element or other chapters.
5. Keep the diff limited to the requested change.

When creating entities, follow the existing directory and JSON conventions. New files may represent new entities during sync-back; make sure references, names, and paths are consistent. Do not manually update generated indexes.

For `play-function.ts`, `play-type.ts`, and `scenario.json`, load the `exploration-mode` skill. It defines the correct file format, content rules, and the validation commands that must pass before sync-back.

## 4. Incremental sync for multi-entity work

When creating or modifying more than one logical unit — for example, multiple chapters, or multiple slices that span more than one chapter — do not accumulate all changes before syncing. Validate and sync after each complete logical unit, then continue.

**Natural checkpoint boundaries:**

- One complete chapter (all its slices, lanes, and elements)
- One scenario
- One cohesive set of changes to a shared element used across chapters

**Why this matters:**

- If sync-back fails, only the last checkpoint is affected — earlier work is already on the board.
- Progress is visible on the board throughout the work, not only at the end.
- Errors are easier to diagnose when the diff is small and focused.

After each successful sync-back, confirm the result before continuing to the next unit. If sync-back fails, diagnose and fix the issue before moving on — do not silently skip ahead and defer the failure to a later checkpoint.

## 5. Validate the local model

Run the model validator before sync-back:

```sh
npx @proophboard/spec-stream model validate
```

Use verbose output when diagnosing issues:

```sh
npx @proophboard/spec-stream model validate --verbose
```

The validator checks, among other things:

- JSON files parse correctly.
- Element `laneId` and `sliceId` references resolve through `uuid-index.json`.
- Scenario expectation references resolve to known slice and element IDs.
- UUIDs are not duplicated across different directories.
- Directory slugs match the sanitized names in the corresponding JSON.

Resolve validation errors rather than bypassing them. If a validation result appears inconsistent with the files, inspect the relevant paths and references before continuing.

If the change involves scenarios, play functions, or play types, **load the `exploration-mode` skill** and follow its validation checklist before sync-back. Do not call `sync-back` on those files without first passing both typecheck and scenario tests as defined there.

## 6. Synchronize changes

When the model is valid, synchronize:

```sh
npx @proophboard/spec-stream sync-back
```

Sync-back translates local changes into prooph board API calls. Modified files update the corresponding board entities; added files can create entities; deleting a primary entity JSON file can delete that entity. If sync-back exits non-zero, inspect the error, correct the underlying issue, and rerun validation before retrying.

After a successful sync-back, check the command result.

## 7. Avoid common mistakes

- **Renaming by moving directories:** To rename an entity, change only the `name`/`label` field in the JSON — never rename the directory yourself. Renaming the directory makes sync-back see a delete + create, which duplicates the entity on the board. The directory is updated automatically by `spec-stream run` after the board confirms the rename.
- **Editing generated output:** Change source files, not `index.md`, indexes, or workspace metadata.
- **Editing by slug alone:** Slugs are for paths; use JSON for the actual name and properties.
- **Ignoring shared details:** Element details may be shared across placements and chapters.
- **Deleting files casually:** A deleted primary JSON file may delete the corresponding board entity.
- **Treating local validation as a board sync:** Validation checks the local model; sync-back is a separate operation.
- **Changing methodology in this skill:** Use the relevant modeling skill for business and modeling rules.

## 8. Chapters are self-contained

**Each chapter is independent and must contain all its own entities.** When creating a new chapter:

- **Generate fresh UUIDs for every entity** (chapter, lanes, slices, elements, scenarios).
- **Never reuse UUIDs from other chapters** - each UUID must be unique across the entire model.
- **Every lane, slice, and element must be created within the chapter's own directories** - they cannot be copied or referenced from other chapters.
- **Elements reference their lane and slice via `laneId` and `sliceId` using UUIDs from the same chapter** - these UUIDs must exist in `uuid-index.json` or be locally-assigned UUIDs not yet synced.

**Example structure for a new chapter:**
```
chapters/[new-chapter-uuid]/
  chapter.json          # id: [new-chapter-uuid]
  slices/
    [new-slice-uuid]/
      slice.json        # id: [new-slice-uuid]
  lanes/
    [new-lane-uuid]/
      lane.json         # id: [new-lane-uuid]
  elements/
    [new-element-uuid]/
      element.json      # id: [new-element-uuid],
                        # laneId: [new-lane-uuid],
                        # sliceId: [new-slice-uuid]
```

## Completion checklist

Before declaring a model change complete:

- [ ] Only intended editable files were changed.
- [ ] Generated and mirrored files were left untouched.
- [ ] Shared element details and cross-chapter effects were considered.
- [ ] `@proophboard/spec-stream model validate` passes.
- [ ] If scenarios, play functions, or play types were touched: the `exploration-mode` skill checklist was followed in full (typecheck + scenario tests pass before sync-back).
- [ ] Sync-back completed successfully. **Run `npx @proophboard/spec-stream sync-back` yourself — do not ask the user to run it.** It is the expected final step after all validation passes.
