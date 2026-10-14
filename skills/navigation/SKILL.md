---
name: prooph-board-navigation
description: "Prooph Board Navigation Skill - Parses deeplinks, retrieves chapter data from the local model, focuses on referenced elements or slices, and generates deeplinks for precise user navigation."
---

# Prooph Board — Navigation

This skill defines how to **interpret and generate deeplinks for prooph board**.

You are responsible for:

- extracting identifiers from deeplinks
- retrieving chapter data from the local model
- focusing responses on a specific element or slice
- generating deeplinks for user navigation

This skill is **read-only and focus-oriented**.

Before using this skill, load the **Local Model** skill. It explains how to locate the model directory, navigate the file tree, and use `uuid-index.json` to resolve IDs to paths.

---

# Core Principle

## Deeplinks Are References, Not Resources

A deeplink is a **pointer to a location**, not something to open.

**DO NOT:**

- fetch the URL
- open the URL
- interpret it as content
- call any MCP or API tool

**DO:**

1. extract identifiers from the deeplink
2. resolve them through the local model files
3. focus your response accordingly

---

# Deeplink Structure

```
https://flow.prooph-board.com/link/{workspaceId}/{chapterId}/{type}/{targetId}
```

Where:

- `workspaceId` → workspace identifier
- `chapterId` → chapter identifier
- `type` → `element` or `slice`
- `targetId` → elementId or sliceId

---

# Behavior 1 — Resolving Deeplinks

Use this when the user provides a deeplink.

## Step 1 — Parse the Deeplink

Extract:

- workspaceId
- chapterId
- type
- targetId

---

## Step 2 — Locate the Model Directory

Follow the **Local Model** skill to find the model root (default: `.spec-stream/model/`).

---

## Step 3 — Resolve the Chapter

Use `uuid-index.json` at the model root to resolve `chapterId` to a directory path.

Read the `chapter.json` in that directory to confirm you have the right chapter.

---

## Step 4 — Locate the Target

Based on `type`:

### element

- Use `uuid-index.json` to resolve `targetId` to a path.
- Read the `element.json` at that path to retrieve the element's properties.
- Optionally read its `description.md` and `details.md` for additional context.

### slice

- Use `uuid-index.json` to resolve `targetId` to a path.
- Read the `slice.json` at that path to retrieve the slice's properties.
- Optionally read its `details.md` for additional context.

---

## Step 5 — Focus the Response

Once located:

- treat the element/slice as the **primary context**
- apply user instructions ONLY to that target
- ignore unrelated parts unless explicitly requested

---

# Focus Rules

When a deeplink is used:

- the response MUST be scoped to the referenced element or slice
- do NOT analyze the entire chapter unless asked
- do NOT generalize beyond the target

---

# Error Handling

## Target Not Found in uuid-index.json

If the `chapterId` or `targetId` cannot be resolved through `uuid-index.json`:

- state that it was not found in the local model
- remind the user that spec-stream must be running to keep the local copy up to date (`npx @proophboard/spec-stream run`)
- ask the user for clarification or a correct link

## File Missing

If the resolved path does not contain the expected JSON file:

- report which file is missing
- suggest running spec-stream to refresh the local copy

---

## Invalid Deeplink

If the deeplink structure is invalid or incomplete:

- explain what is missing
- ask for a valid deeplink

---

## Missing Type

If `type` is missing:

- do NOT guess
- ask the user whether it refers to an element or slice

---

# Behavior 2 — Generating Deeplinks

Use this when:

- referencing specific elements or slices
- summarizing work
- asking targeted questions
- guiding user navigation

---

## Deeplink Format

Always generate links in this format:

```
https://flow.prooph-board.com/link/{workspaceId}/{chapterId}/{type}/{targetId}
```

Retrieve the `workspaceId` from `workspace.json` at the model root.  
Use the `chapterId` and element/slice IDs from the corresponding JSON files.

---

## When to Generate Deeplinks

Create deeplinks when:

- pointing to specific modeling issues
- referencing elements in feedback
- asking questions about a specific element/slice
- summarizing important parts of a model

---

## Example Usage

Instead of:

> The "Place Order" command looks incorrect.

Write:

> The command "Place Order" may violate modeling rules:  
> https://flow.prooph-board.com/link/{workspaceId}/{chapterId}/element/{elementId}

---

# Precision Rules

- always use exact IDs from the local model files
- NEVER invent IDs
- NEVER approximate or truncate IDs

---

# Anti-Patterns

## Fetching Deeplinks

Incorrect:

- treating the URL as a data source

---

## Calling MCP or API Tools

Incorrect:

- using `get_chapter()` or any MCP/API call to retrieve data
- the local model is the only data source for this skill

---

## Losing Focus

Incorrect:

- analyzing unrelated elements when a deeplink is provided

---

## Guessing Targets

Incorrect:

- assuming element/slice when not specified
- inventing IDs

---

# Integration with Other Skills

After resolving a deeplink:

- use **Event Modeling skills** for modeling or critique
- remain scoped to the referenced element/slice

---

# Goal

Correct behavior means:

- precise parsing of deeplinks
- deterministic data retrieval from the local model via `uuid-index.json` and entity JSON files
- strict focus on referenced element or slice
- clear, navigable deeplink generation for the user
