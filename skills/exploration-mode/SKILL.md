---
name: exploration-mode
description: "Exploration Mode Skill - Teach an agent how Exploration Mode works on prooph board: running an Event Model with real data, scenarios, interactions, expectations/pinning, play functions for all five element types, play types, and local model file editing for programmatic scenario management. Use this skill to help users set up scenarios, write play functions, define expectations, and debug runs."
---

# Exploration Mode

> **Load this skill whenever you create, edit, or test a scenario or play function** — even if the task feels like a pure local model operation. The validation commands defined here are mandatory before any `sync-back` that touches scenario or play-function files.

Exploration Mode makes an Event Model **executable enough to demonstrate the behaviour it describes**. Real data flows through the model in a deterministic loop:

```
screen input  →  action  →  facts  →  updated information  →  Stage + Backpack
      ▲                                                              │
      └──────────────── automated reactions ◀────────────────────────┘
```

- **Screen input** — what someone types in a UI prototype becomes an action.
- **Action** — the system decides what facts result (and may refuse the action).
- **Facts** — recorded in order; shown in the Backpack.
- **Updated information** — facts update the projections the model carries.
- **Automated reactions** — some facts set off automatic follow-up actions.

Everything runs in the browser. Nothing is sent anywhere, nothing permanently executes, no real emails or payments ever happen — they are only *modeled*.

---

## How to enter Exploration Mode

1. Open **Presentation Mode**.
2. Switch on the **Exploration** toggle.
3. Advance through the model, enter data on screens, watch the Backpack fill with live values.
4. Save the run as a **scenario** so you can return to it or duplicate it.

Start with the defaults. Only add a play function when the model needs behaviour the defaults cannot express — a list, a status-only update, an action that produces more than one fact, or a refusal.

---

## Scenarios

A **scenario** captures a starting situation (initial state, seeded events, clock) and the inputs you fed in (recorded interactions). You can name them, re-run them, and duplicate one to explore a single variation ("what if I change this one input?").

### Scenario data structure

| Field | Purpose |
|---|---|
| `name` | Human-readable label |
| `clock` | ISO datetime — anchors the deterministic clock so replays produce identical results |
| `initialState` | Pre-loaded projection state, keyed as `state[Context][Element]` (className form) |
| `seededEvents` | Events injected before step 0 — give the model a history |
| `interactions` | Recorded UI input keyed by stable `uiElementId` — replay without human input |
| `expectations` | Pinned correctness oracles (see Expectations section) |

`className` form means PascalCase — `TodoManagement`, `TodoList` — matching TypeScript class-name conventions. Spaces are stripped and each word is capitalised.

### Setting up a scenario via local model files

Scenarios live under the chapter directory in the local model:

```
.spec-stream/model/chapters/[Context]/[Chapter]/scenarios/[Scenario name]/scenario.json
```

> For the full local model layout and general file-editing rules, see the `local-model` skill.

#### Prefer full-flow scenarios

**Start from the first UI or Automation in the chapter and follow the causal chain all the way to the slice you want to test.** A scenario that skips earlier slices by seeding state is testing less than it appears to — it hides whether the upstream flow actually produces the right data.

- If the chapter starts with a UI element, add an interaction for it.
- Add `apply` play functions on events to project their payloads into state — this is how downstream automations and commands receive the data they need.
- Only reach for `initialState` or `seededEvents` when the prior flow genuinely comes from **outside this chapter**: a different chapter, a different bounded context, or an external system. Using them to skip slices that exist in the current chapter is a shortcut that undermines the value of the scenario.

**Check for wireframes before writing interactions.** Before recording an interaction on a UI element, check whether its `description.md` contains an ` ```html ` code block. If no wireframe exists on any UI element in the chapter, ask the user whether to add one before proceeding — a scenario without a wireframe can test the data flow but cannot demonstrate the user journey interactively in Exploration Mode. See the `html-wireframe` skill for how to add one. Only skip this check if the user has already declined or explicitly said wireframes are out of scope for the current task.

When a full-flow scenario is not yet feasible (missing wireframe, missing play functions in earlier slices), note it explicitly in the scenario name or a slice detail as a known gap rather than silently seeding past it.

**1. Create the scenario directory and `scenario.json`**

Pick a descriptive name, create the directory, and write the initial file:

```json
{
  "id": "generate-a-new-uuid-here",
  "name": "Add first todo",
  "clock": "2026-10-12T10:00:00.000Z",
  "initialState": {},
  "seededEvents": [],
  "interactions": [],
  "expectations": []
}
```

The `id` must be a UUID v4. Generate one with `node -e "const {randomUUID}=require('crypto');console.log(randomUUID())"` or any UUID tool.

**2. Record a UI interaction**

Add an entry to the `interactions` array. Each entry captures the storage values the user typed on a particular UI screen:

```json
{
  "interactions": [
    {
      "uiElementId": "<UUID of the UI element>",
      "storage": { "title": "Walk Caramelo", "until": "2026-10-15" }
    }
  ]
}
```

`uiElementId` is the `id` field from the UI element's `element.json`. Look it up via `uuid-index.json` or by reading the element file in the relevant lane.

> **`uiElementId` is the only valid interaction key.** There is no `stepIndex` field. Interactions are keyed to a UI element's UUID, not to a slice position. If the slice being tested has no UI element (e.g. it is driven by an automation), use `initialState` or `seededEvents` to provide the input data instead of adding an interaction entry.

> **Use the exact element ID for the placement at that step.** When the same logical UI screen (same name, type, context) appears at multiple steps — for example, a "Lead Detail" page in slice 1, slice 3, and slice 5 — each appearance is a distinct element placement with its own UUID. Use the UUID of the placement in the slice you want the interaction to apply to, not the UUID of any other placement. This also applies to `elementId` in expectations: always reference the specific placement ID that is in the target slice, not a placement from a different slice.

**3. Seed initial state**

Populate `initialState` with projection data keyed by context (PascalCase) then element name (PascalCase). Use this only for state that originates **outside the current chapter** — from a prior chapter, a foreign context, or an external system. Do not use it to skip slices that exist earlier in the same chapter; model those slices instead.

```json
{
  "initialState": {
    "TodoManagement": {
      "TodoList": [{ "todoId": "todo-001", "title": "Buy milk", "done": false }]
    }
  }
}
```

**4. Seed prior events from another chapter**

Populate `seededEvents` with events that were emitted by a **different chapter or context** and that this chapter depends on. Do not use this to replay events that the current chapter's own slices would produce; let the flow produce them naturally.


```json
{
  "seededEvents": [
    {
      "name": "Todo Added",
      "context": "TodoManagement",
      "payload": { "todoId": "todo-001", "title": "Buy milk" }
    }
  ]
}
```

### Listing and reading scenarios

Scenarios are plain directories and JSON files on disk. Use standard filesystem tools:

```sh
# List all scenarios for a chapter
ls .spec-stream/model/chapters/TodoManagement/Todo\ Management/scenarios/

# Read a specific scenario
cat ".spec-stream/model/chapters/TodoManagement/Todo Management/scenarios/Add first todo/scenario.json"
```

Use `uuid-index.json` to resolve a scenario ID to its directory path when you only have the UUID:

```sh
# Find the path for a known scenario UUID
node -e "const idx=require('.spec-stream/model/uuid-index.json'); console.log(idx['<scenario-uuid>'])"
```

---

## Expectations — scenarios as tests

A scenario becomes a **test** the moment you pin an expectation. An expectation records what must be true at a specific slice (step) of the run. Verdicts update live whenever the model or play functions change.

| Verdict | Meaning |
|---|---|
| 🟢 Pass | Every pinned expectation matched |
| 🔴 Broken | At least one expectation no longer matches — expected vs. actual is shown |
| 🟡 Neutral | Nothing is pinned yet; the scenario is a run, not a test |

Expectations are keyed to a **slice id** (not a step index), so inserting slices between pinned ones never breaks a pin.

### Pin outcomes, not mechanics

Each pinned expectation is a constraint that must be maintained whenever the model or play functions change. Too few pins and important regressions go undetected; too many and every small model change breaks tests that shouldn't care.

**As a default, pin the chapter's meaningful outcome** — the information or event that represents the business result the scenario was designed to demonstrate. For a qualification flow, that is the lead's `status: "qualified"` at the final read slice, not the intermediate events along the way.

Pin intermediate steps (individual events, intermediate read views) only when:
- They represent a distinct business invariant worth protecting independently.
- A regression at that step would not surface through the final outcome pin alone.

Avoid pinning every event and every read view by default. The scenario already demonstrates the full causal chain by running it; pinning adds regression protection, not documentation. Choose the smallest set of expectations that catches the regressions you actually care about.

### Information expectations require the playhead to reach the target slice

The scenario test runner folds the flow up to the last slice that has a UI element or automation. A slice that has **no UI element** will never have a recorded interaction, so the playhead never reaches it and any `information` expectation on that slice will always report broken — even though the `read()` function is correct.

**Rule: every slice where you want to pin an `information` expectation must contain a UI element.** If the slice is a pure read-only result screen with no UI element, add one — typically a read-only placement of the same UI screen that appeared earlier in the flow (e.g. a "Lead Detail" UI in both the navigation slice and the final result slice)  so the playhead extends to that slice.

This is a model design constraint, not a workaround: result screens should have a UI element representing what the user actually sees after the action completes.

### Three kinds of expectation

All expectations live in the `expectations` array inside `scenario.json`. Each entry has a `sliceId`, a `kind`, and an `expected` object. Optionally add a `match` field (`"exact"` or `"subset"`).

**`events`** — the events emitted by the pinned slice must match:

```json
{
  "expectations": [
    {
      "id": "<uuid>",
      "sliceId": "<id of the write slice>",
      "kind": "events",
      "match": "subset",
      "expected": {
        "events": [
          {
            "name": "Todo Added",
            "context": "TodoManagement",
            "payload": { "title": "Walk Caramelo" }
          }
        ]
      }
    }
  ]
}
```

Default match for `events` is `"exact"`. Use `"subset"` when you only care about specific payload fields.

**`information`** — an Information element's value at the end of replay must match:

```json
{
  "expectations": [
    {
      "id": "<uuid>",
      "sliceId": "<id of the read slice>",
      "elementId": "<UUID of the Information element instance>",
      "kind": "information",
      "match": "subset",
      "expected": {
        "value": [{ "title": "Walk Caramelo", "done": false }],
        "view": "stored"
      }
    }
  ]
}
```

`view` is `"stored"` or `"read"` — which tab was active when the expectation was pinned. Default match for `information` is `"subset"`.

**`rejection`** — the action at the pinned slice must be refused:

```json
{
  "expectations": [
    {
      "id": "<uuid>",
      "sliceId": "<id of the write slice>",
      "kind": "rejection",
      "expected": {
        "message": "already done",
        "elementName": "Mark Todo As Done"
      }
    }
  ]
}
```

`message` is an optional substring matched against the rejection reason.

### Removing an expectation

Delete the entry with the matching `id` from the `expectations` array in `scenario.json`.

---

## Play Functions

A play function is a short optional snippet that tells the runtime how an element should behave. Leave it empty — the built-in defaults carry data through the model automatically.

**Each element type has exactly one handler kind:**

| Element | Handler signature | What it does |
|---|---|---|
| UI (screen) | `interact(storage, state)` | Turns screen input into command(s) |
| Command (action) | `decide(command, state)` | Decides which events result — or refuses |
| Event (fact) | `apply(event, state)` | Updates (projects) information from the fact |
| Information | `read(state)` | Tailors the displayed view (filtering, sorting) without changing stored state |
| Automation (event-reaction slice) | `react(event, state)` | Reacts to a fact with follow-up commands |
| Automation (job slice) | `process(state)` | Runs from state alone when the playhead reaches it |

**Choosing between `react` and `process` for an Automation:**

- Use `react` when the automation slice sits immediately after an event and its purpose is to respond to that specific event. The triggering event is passed as the first argument.
- Use `process` when the automation reads from projected state (Information) rather than reacting to a specific event — for example, a synchronizer that reads data already projected into state and dispatches a follow-up command. The runtime calls `process(state)` when the playhead reaches the slice.

If you write `react` for a job-style automation, the runtime will throw: `Play function must define "process"`. Check the slice type and the element's position in the flow when in doubt.

Play functions live **inside Exploration Mode** — they are not element documentation. Double-click an element on the Stage or a Backpack card to open the editor in the Stage area. Click **Suggest function** to get a correct starting point.

A play function belongs to the element in the slice. Two elements with the same name, type, and context only share the same payload type — exactly like they share their documentation details. The play function on the other hand is flow specific and executes in concrete scenario step.

### Shared elements require a local copy of play type per placement

prooph board treats elements with the same name, type, and context as a single logical entity and automatically propagates a play type written on one placement to all other placements during sync. **However, the local model does not do this automatically.** When you write a `play-type.ts` for one placement and sync-back hasn't run yet, the other placements in the same chapter do not yet have their own copies.

This matters for two reasons:

1. **The scenario test runner evaluates each placement independently** using the play type declared in that placement's own `play-type.ts` file. If a placement has no `play-type.ts`, the runtime defaults to `any` — silently ignoring your play function — which causes scenario tests to produce wrong results.

2. **Expectations and interactions are bound to exact element IDs** (the specific placement in a specific slice), not to the logical shared element. An expectation with `elementId: "X"` is evaluated against placement X's own registered read view, not against any other placement's view — even if they share the same type.

**Rule: before running scenario tests, every placement of a shared element in the chapter must have its own `play-function.ts` and `play-type.ts` files.**

The simplest way to achieve this before sync-back has run:

```sh
# Copy the play function to each other placement that shares name+type+context
cp elements/[canonical-uuid]/play-function.ts elements/[other-uuid]/play-function.ts
cp elements/[canonical-uuid]/play-type.ts      elements/[other-uuid]/play-type.ts
```

After sync-back runs, prooph board will have propagated the shared play type to all placements and a subsequent `spec-stream run` will normalise the local copies. Until then, maintain the copies manually so scenario tests are meaningful.

**Note:** Play functions are no longer shared across similar elements in the local model. Each placement keeps its own play function, even if elements have the same name, type, and context. The sync-back process preserves each placement's individual play function.

### Writing play functions via local model files

Play functions are stored in `play-function.ts` files alongside the element:

```
.spec-stream/model/chapters/[Context]/[Chapter]/elements/[Element]/play-function.ts
```

Payload types live in the sibling `play-type.ts` file.

Use named function syntax matching the handler kind — `decide`, `apply`, `read`, `interact`, `react`, or `process`. Do not use a default export.

**Auto-discovery:** Creating the `play-function.ts` file is enough — the runtime automatically loads it. No `element.json` field is needed anymore. Similarly, a `play-type.ts` file is auto-discovered and used if present.

**Always write a `play-type.ts` alongside every `play-function.ts`.** For UI, Command, Event, and Information elements, declare the payload shape in the sibling `play-type.ts`. This is mandatory — not optional — even though prooph board accepts a missing type. Play types are what make the typecheck command meaningful: without them, `scenario typecheck` cannot catch payload field typos or detect breaking payload changes early.

**Command, Event, and Information elements also require a `play-type.ts` even when no play function is written.** When the default runtime behaviour is sufficient and no `play-function.ts` is needed, still create `play-type.ts`. Only `play-function.ts` can be omitted in that case.

Both paths are relative to the model root. You can verify the runtime picked up the handler by checking the `authoredHandlers=N` line in the verbose scenario test output — it must be greater than 0.

After writing or editing these files, run the scenario test and typecheck commands (see Validation section below) before synchronizing.

### Play functions are per-instance

Each element placement has its own play function. Two elements with the same name, type, and context may have different play functions — they are independent. The runtime does not propagate play functions during sync.

**Play types ARE shared**, so if one placement declares `type Payload = { title: string }`, prooph board will propagate that type to all other placements during sync. This means:

- Each placement's `play-function.ts` is independent
- All placements of the same element share the same payload type (after sync)

When writing a play function, focus on what THIS specific placement should do. Don't worry about other placements — they have their own functions.

### Runtime helpers available in every play function

| Helper | Returns | Notes |
|---|---|---|
| `now()` | ISO datetime string | Driven by the scenario clock — deterministic |
| `today()` | ISO date string `YYYY-MM-DD` | Same clock |
| `uuid()` | UUID v4 string | Deterministic per scenario |
| `advanceClock("30m")` | void | Moves the scenario clock forward (accepts `"1h"`, `"2d"`, etc.) |
| `reject("reason")` | never | Refuses the action; no event is recorded |
| `state.$events` | `RuntimeEvent[]` | Full ordered event log at the current step |
| `state.$input` | object | Captured UI input from recorded interactions (see below) |
| `state.$input.$byStep` | `Record<number, object>` | All captured inputs keyed by step index |
| `state.Context.Element` | any | Projected information value |

#### `state.$input` — captured UI input

`state.$input` exposes the storage collected via `window.storage.save()` (or manual capture) to **every handler**, including `read(state)`. The top level mirrors the **last captured step** at or before the current playhead, so `state.$input.todoId` reads the most recent captured value directly. `state.$input.$byStep` holds every step's storage keyed by step index.

This is the idiomatic way to implement **navigation without a command** — for example, a user picks a row on a list screen (capturing its id) and the next screen's `read()` uses that id to filter the projection:

```ts
// Information "Selected Todo" — read() resolves the pick from $input
function read(state: RuntimeState) {
  const id = state.$input.todoId;                          // captured on the list screen
  const todos = (state.TodoManagement?.TodoList as any[]) ?? [];
  return todos.find(t => t.todoId === id) ?? null;
}
```

The captured input for the list screen's UI element (the one that called `storage.save({ todoId: "…" })`) is injected into `state.$input` before `read()` runs. Only input from steps **at or before the playhead** is visible — future steps are never exposed, so the runtime stays deterministic.

---

## Play Function Reference — all six handlers

### `interact` — UI screen

Turns what the user entered into the command(s) this screen triggers.

```ts
function interact(storage: ThisUiStorage, state: RuntimeState): RuntimeCommand[] {
  return [
    {
      name: "Add Todo",
      context: "TodoManagement",
      payload: { ...storage },   // storage is whatever the prototype passed via window.storage.save()
    },
  ];
}
```

**Default behaviour** (no function written): if the UI drives a command, synthesize one command per driven element with `storage` as the payload. If the UI drives no command it is a pure display screen — nothing is emitted.

---

### `decide` — Command

Decides which events result. Can refuse the action.

```ts
function decide(command: ThisCommand, state: RuntimeState): RuntimeEventInput[] {
  // Guard against invalid state:
  const existing = (state.TodoManagement?.TodoList as any[]) ?? [];
  const alreadyDone = existing.find(t => t.todoId === command.payload.todoId && t.done);
  if (alreadyDone) reject("already done");

  return [
    {
      name: "Todo Added",
      context: command.context,
      payload: {
        todoId: uuid(),
        title: command.payload.title,
        until: command.payload.until || null,
        addedAt: now(),
      },
    },
  ];
}
```

**Default behaviour**: emit the connected event(s) carrying the command's payload unchanged.

---

### `apply` — Event

Projects the event into stored information. Return value is a `ProjectionPatch` — a two-level object merged leaf-by-leaf.

```ts
function apply(event: ThisEvent, state: RuntimeState): ProjectionPatch {
  const current = (state.TodoManagement?.TodoList as any[]) ?? [];
  return {
    TodoManagement: {
      TodoList: [...current, {
        todoId: event.payload.todoId,
        title: event.payload.title,
        until: event.payload.until,
        done: false,
      }],
    },
  };
}
```

For a `Mark Todo As Done` event that only updates one field:

```ts
function apply(event: ThisEvent, state: RuntimeState): ProjectionPatch {
  const current = (state.TodoManagement?.TodoList as any[]) ?? [];
  return {
    TodoManagement: {
      TodoList: current.map(t =>
        t.todoId === event.payload.todoId ? { ...t, done: true } : t
      ),
    },
  };
}
```

**Default behaviour**: merge the event payload into the single-object Information in the same slice (leaf-replace, two levels deep).

---

### `read` — Information (view only)

Returns a derived view for *display* at this step. Does not change stored state. The Backpack shows a "Stored / This view" toggle.

**Filter by status:**

```ts
function read(state: RuntimeState) {
  const all = (state.TodoManagement?.TodoList as any[]) ?? [];
  return all.filter(t => !t.done);   // only open todos
}
```

**Navigation pattern — resolve a picked item via `state.$input`:**

When a user picks a row on a list screen (the UI captures `{ todoId }` via `storage.save()`) and the next screen should show that item's detail, use `state.$input` in `read()` instead of dispatching a command just for navigation:

```ts
// "Selected Todo" Information — read() resolves the pick from state.$input
function read(state: RuntimeState) {
  const id = state.$input.todoId;                          // set by the list screen's storage.save()
  const todos = (state.TodoManagement?.TodoList as any[]) ?? [];
  return todos.find(t => t.todoId === id) ?? null;
}
```

`state.$input` always reflects the **last captured step at or before the current playhead**. `state.$input.$byStep` holds every step's captured values keyed by step index when you need to distinguish between inputs from multiple earlier screens.

**Default behaviour** (no function written): show the stored value as-is.

---

### `react` — Automation (event-reaction slice)

Runs when the triggering event occurs. Returns follow-up commands.

```ts
function react(event: RuntimeEvent, state: RuntimeState): RuntimeCommand[] {
  return [
    {
      name: "Send Reminder Email",
      context: "Notifications",
      payload: {
        todoId: event.payload.todoId,
        title: event.payload.title,
        until: event.payload.until,
      },
    },
  ];
}
```

---

### `process` — Automation (job slice)

Runs from state alone when the playhead reaches the automation's slice.

```ts
function process(state: RuntimeState): RuntimeCommand[] {
  const todos = (state.TodoManagement?.TodoList as any[]) ?? [];
  const overdue = todos.filter(t => !t.done && t.until && t.until < today());
  return overdue.map(t => ({
    name: "Flag Todo Overdue",
    context: "TodoManagement",
    payload: { todoId: t.todoId },
  }));
}
```

---

## Play Types — required payload shapes

Command, Event, and Information elements **always** require a `play-type.ts` declaring the payload shape — regardless of whether a play function is also written. UI elements require one too when they have a play function. Do not skip this step even when the default runtime behaviour is sufficient for a step. Types catch typos in payload field names and detect breaking changes that pinned expectations may not cover.

The type is stored as a bare TypeScript type expression in `play-type.ts`. The editor wraps it in `type Payload = …` for display, and sync-back strips the alias prefix where required — keep the full alias in the local file. Auto-discovery: the runtime automatically loads the play type when `play-type.ts` is present; no `element.json` field is needed anymore.

```ts
// play-type.ts for "Add Todo" command:
type Payload = {
  title: string;
  until?: string;   // ISO date, optional
};
```

```ts
// play-type.ts for "Todo Added" event:
type Payload = {
  todoId: string;
  title: string;
  until: string | null;
  addedAt: string;
};
```

```ts
// play-type.ts for "Todo List" information:
type Payload = {
  todoId: string;
  title: string;
  until: string | null;
  done: boolean;
};
```

```ts
// play-type.ts for a UI screen (the input it captures):
type Payload = {
  title: string;
  until?: string;
};
```

Once declared, the play function editor checks `command.payload.title` is a `string`, `event.payload.todoId` is a `string`, and so on. The typecheck command will catch mismatches before they reach the runtime.

---

## HTML Wireframe Prototypes

A UI element's description can contain a ` ```html ` code block. Exploration Mode renders it as an interactive prototype in the Stage.

Two runtime connections:

1. **Live state injection via `{{ }}`** — the runtime replaces `{{ state.Context.Element }}` expressions with the current JSON value before the HTML loads. Put these inside a `<script>` string (not directly in markup) to stay syntactically valid when the value is an array or object.

2. **Input capture via `window.storage.save()`** — calling `storage.save({ ...data })` hands the collected values to the runtime, which passes them to `interact(storage, state)` when the presenter clicks Submit & advance.

```html
<!DOCTYPE html>
<html>
<body>
  <ul id="list"></ul>
  <form id="form">
    <input id="title" type="text" placeholder="Todo title" />
    <button type="submit">Add</button>
  </form>
  <script>
    // Read live state — always wrap in quotes so an empty substitution is valid JS
    var raw = '{{ state.TodoManagement.TodoList }}';
    var todos = [];
    if (raw) { try { var p = JSON.parse(raw); if (Array.isArray(p)) todos = p; } catch(e){} }

    // Render list
    document.getElementById('list').innerHTML =
      todos.map(function(t){ return '<li>' + t.title + '</li>'; }).join('');

    // Capture form input
    document.getElementById('form').addEventListener('submit', function(e) {
      e.preventDefault();
      var title = document.getElementById('title').value.trim();
      if (!title) return;
      // Always guard — window.storage is absent outside Exploration Mode
      if (window.storage && typeof window.storage.save === 'function') {
        window.storage.save({ title: title });
      }
    });
  </script>
</body>
</html>
```

**Key rule**: always provide default fallback values. When `{{ }}` is unresolved (Presentation Mode, plain HTML preview, before any state is projected) it substitutes an empty string. A well-written prototype handles this gracefully.

> Read the `html-wireframe` skill for details.

---

## Refusing an action

Call `reject("reason")` inside a `decide` function to refuse the action. The Stage shows the refusal and its reason; no event is recorded; information is left unchanged.

```ts
function decide(command: ThisCommand, state: RuntimeState): RuntimeEventInput[] {
  const todos = (state.TodoManagement?.TodoList as any[]) ?? [];
  const todo = todos.find(t => t.todoId === command.payload.todoId);
  if (!todo) reject("todo not found");
  if (todo.done) reject("already done");

  return [{ name: "Todo Marked As Done", context: command.context, payload: command.payload }];
}
```

Refusals are computed from state *before* the action. Moving the playhead backward and changing an earlier input can turn a refused step into a success — and vice versa.

---

## Deterministic clock

Exploration Mode produces identical results on every re-run. Use these helpers instead of `Date.now()` or `Math.random()`:

| Helper | Example output |
|---|---|
| `now()` | `"2026-10-12T10:00:00.000Z"` |
| `today()` | `"2026-10-12"` |
| `uuid()` | `"a1b2c3d4-…"` |
| `advanceClock("30m")` | — (moves the clock 30 minutes forward) |

Set `clock` on a scenario to anchor the starting point. Every `now()` / `uuid()` call after that is seeded from the same root, so re-running a scenario always produces the same events and IDs.

---

## Automated reactions and pending commands

When an automation's `react` or `process` handler dispatches a command, that command is **deferred** — it fires only when the playhead reaches the slice where the command element lives (exactly where you placed it on the board). Until then it appears in the Backpack as a **pending command** card. This keeps the story honest: nothing jumps ahead of where it sits in the flow.

---

## Seeding subsequent chapter scenarios (cross-chapter)

Large processes are typically split across multiple chapters. Use the Backpack to bridge them.

1. Run chapter A's scenario to the point where the desired state is visible.
2. Click **Copy JSON** on the Backpack's **Events** section header → paste into chapter B's **Seeded Events** field.
3. Or click **Copy JSON** on the **Information** section header → paste into chapter B's **Seeded Information** (Initial State) field.

When working from the local model, copy the desired events or state from chapter A's scenario and paste them into chapter B's `scenario.json`:

```json
// Chapter B's scenario.json — seededEvents from chapter A's output
{
  "seededEvents": [
    { "name": "Todo Added", "context": "TodoManagement", "payload": { "todoId": "…", "title": "…" } }
  ]
}

// …or initialState for projection-level seeding:
{
  "initialState": {
    "TodoManagement": {
      "TodoList": [{ "todoId": "…", "title": "…", "done": false }]
    }
  }
}
```

Use `uuid-index.json` to look up the chapter paths if you need to find chapter B's scenario directory by ID.

---

## Full example — Todo app flow

This example walks through a complete **Add Todo → Mark Todo As Done** flow, covering all element types.

### Event model structure (TodoManagement context)

```
Slice 1 (Read):    Todo List UI   ←  TodoList (information)
Slice 2 (Write):   Todo List UI  →  Add Todo (command)  →  Todo Added (event)
Slice 3 (Read):    Todo List UI   ←  TodoList (updated)
Slice 4 (Write):   Todo UI       →  Mark Todo As Done (command)  →  Todo Marked As Done (event)
Slice 5 (Read):    Todo UI        ←  TodoList (updated, only open)
```

### Play type — `Add Todo` command (`play-type.ts`)

```ts
type Payload = {
  title: string;
  until?: string;
};
```

### Play type — `Todo Added` event (`play-type.ts`)

```ts
type Payload = {
  todoId: string;
  title: string;
  until: string | null;
  addedAt: string;
};
```

### Play type — `TodoList` information (`play-type.ts`)

```ts
type Payload = {
  todoId: string;
  title: string;
  until: string | null;
  done: boolean;
};
```

### Play function — `Add Todo` command (`play-function.ts`)

```ts
function decide(command: ThisCommand, state: RuntimeState): RuntimeEventInput[] {
  if (!command.payload.title) reject("title is required");

  return [
    {
      name: "Todo Added",
      context: command.context,
      payload: {
        todoId: uuid(),
        title: command.payload.title,
        until: command.payload.until || null,
        addedAt: now(),
      },
    },
  ];
}
```

### Play function — `Todo Added` event (`play-function.ts`)

```ts
function apply(event: ThisEvent, state: RuntimeState): ProjectionPatch {
  const current = (state.TodoManagement?.TodoList as any[]) ?? [];
  return {
    TodoManagement: {
      TodoList: [
        ...current,
        {
          todoId: event.payload.todoId,
          title: event.payload.title,
          until: event.payload.until,
          done: false,
        },
      ],
    },
  };
}
```

### Play function — `Mark Todo As Done` command (`play-function.ts`)

```ts
function decide(command: ThisCommand, state: RuntimeState): RuntimeEventInput[] {
  const todos = (state.TodoManagement?.TodoList as any[]) ?? [];
  const todo = todos.find(t => t.todoId === command.payload.todoId);
  if (!todo) reject("todo not found");
  if (todo.done) reject("already done");

  return [
    {
      name: "Todo Marked As Done",
      context: command.context,
      payload: { todoId: command.payload.todoId, markedAt: now() },
    },
  ];
}
```

### Play function — `Todo Marked As Done` event (`play-function.ts`)

```ts
function apply(event: ThisEvent, state: RuntimeState): ProjectionPatch {
  const current = (state.TodoManagement?.TodoList as any[]) ?? [];
  return {
    TodoManagement: {
      TodoList: current.map(t =>
        t.todoId === event.payload.todoId ? { ...t, done: true } : t
      ),
    },
  };
}
```

### Play function — `TodoList` information (`play-function.ts`) — open items only view

```ts
function read(state: RuntimeState) {
  const all = (state.TodoManagement?.TodoList as any[]) ?? [];
  return all.filter(t => !t.done);
}
```

### Scenario: add a todo and assert the result (`scenario.json`)

```json
{
  "id": "<uuid>",
  "name": "Add first todo",
  "clock": "2026-10-12T10:00:00.000Z",
  "initialState": {},
  "seededEvents": [],
  "interactions": [
    {
      "uiElementId": "<UUID of the Add Todo UI element>",
      "storage": { "title": "Walk Caramelo", "until": "2026-10-15" }
    }
  ],
  "expectations": [
    {
      "id": "<uuid>",
      "sliceId": "<id of the Add Todo write slice>",
      "kind": "events",
      "match": "subset",
      "expected": {
        "events": [
          {
            "name": "Todo Added",
            "context": "TodoManagement",
            "payload": { "title": "Walk Caramelo" }
          }
        ]
      }
    },
    {
      "id": "<uuid>",
      "sliceId": "<id of the TodoList read slice after Add Todo>",
      "elementId": "<UUID of the TodoList information element>",
      "kind": "information",
      "match": "subset",
      "expected": {
        "value": [{ "title": "Walk Caramelo", "done": false }],
        "view": "stored"
      }
    }
  ]
}
```

### Scenario: assert rejection of already-done todo (`scenario.json`)

```json
{
  "id": "<uuid>",
  "name": "Cannot mark done twice",
  "clock": "2026-10-12T10:00:00.000Z",
  "initialState": {
    "TodoManagement": {
      "TodoList": [{ "todoId": "todo-001", "title": "Walk Caramelo", "done": true }]
    }
  },
  "seededEvents": [],
  "interactions": [
    {
      "uiElementId": "<UUID of the Mark Todo As Done UI element>",
      "storage": { "todoId": "todo-001" }
    }
  ],
  "expectations": [
    {
      "id": "<uuid>",
      "sliceId": "<id of the Mark Todo As Done write slice>",
      "kind": "rejection",
      "expected": { "message": "already done" }
    }
  ]
}
```

---

## Validating scenarios and play functions locally

**Always run both commands below before calling `sync-back`.** Skipping them risks pushing a broken scenario to the board — expectations that never pass, play functions that throw at runtime, or, in the worst case, unintended board mutations triggered by the sync itself.

spec-stream ships two CLI commands that cover the two failure modes: type errors in play functions, and expectation mismatches in scenario runs.

### Run scenario tests

Execute all scenarios for a chapter and check their pinned expectations:

```sh
npx @proophboard/spec-stream scenario test --chapter <chapter-path> --all
```

Either `--all` (run every scenario in the chapter) or `--scenario <id|name>` (run one specific scenario) is required — the command fails without one of them.

Replace `<chapter-path>` with the chapter directory relative to the model root, for example:

```sh
npx @proophboard/spec-stream scenario test \
  --chapter "model/chapters/TodoManagement/Todo Management" --all
```

The command replays every scenario in that chapter, evaluates all pinned expectations, and exits 0 if every expectation passes, or 1 with a per-expectation failure report. A 🔴 Broken result means a play function or scenario data is wrong — fix it before synchronizing.

Run this command every time you:
- Write or edit a `play-function.ts`.
- Add or change an expectation in `scenario.json`.
- Change `initialState`, `seededEvents`, or `interactions` in `scenario.json`.

**Do not call `sync-back` before this command exits 0.** A 🔴 Broken result means a play function or scenario data is wrong and must be fixed first. Syncing a broken scenario can have side-effects on the board that are hard to reverse (elements deleted, scenarios overwritten with empty state).

### Typecheck play functions

Verify that all `play-function.ts` and `play-type.ts` files in the model are type-correct:

```sh
npx @proophboard/spec-stream scenario typecheck
```

This compiles every play function against the declared `play-type.ts` payload types and the Exploration Mode runtime types (`RuntimeState`, `RuntimeCommand`, `ProjectionPatch`, etc.). It exits 0 if clean, 1 with TypeScript diagnostic output if not.

Run this command every time you:
- Write or edit a `play-function.ts`.
- Write or edit a `play-type.ts`.

**Do not call `sync-back` before this command exits 0.** Always fix type errors before synchronizing. A type error in a play function means the runtime will encounter an unexpected shape and the scenario will produce wrong results or throw at runtime.

---

## Debugging play functions

- **Double-click the element** on the Stage or Backpack to open the editor. An error banner also offers an **Edit Play Function** button that jumps straight to the failing element.
- Open **browser DevTools** → console to see the full execution trace, color-coded by handler kind:

| Color | Channel | What it traces |
|---|---|---|
| violet | interact | UI → commands |
| blue | decide | Command → events |
| orange | apply | Event → projection patch |
| green | read | Information view |
| pink | react | Automation event-reaction → commands |
| fuchsia | process | Automation job → commands |
| amber | event | Each emitted event with payload |
| cyan | input | Captured UI input exposed via `state.$input` |
| teal | pending | Automation-dispatched command deferred to its slice |
| red | error | Handler threw, rejected, or cascade exceeded |

- If a play function references `state.Context.Element` for a projection that hasn't been populated yet, `state.Context?.Element` will be `undefined`. Always use `?? []` or `?? null` defaults.
- Runaway automation loops are stopped automatically with a clear message.
- The runtime logger is always on — no flag to set.

---

## Local model reference — scenario and play function files

| File | Editable | Purpose |
|---|---|---|
| `scenario.json` | ✅ | Scenario definition: name, clock, initialState, seededEvents, interactions, expectations |
| `play-function.ts` | ✅ | Exploration Mode handler (`decide`, `apply`, `read`, `interact`, `react`, `process`) |
| `play-type.ts` | ✅ | Payload type declaration for commands, events, information, and UI elements |

Play functions and play types are written directly to their files on disk. `sync-back` pushes them to prooph board along with any other local changes. The `element-details/` mirror is read-only — never edit it. For general file-editing rules, entity JSON schemas, and the sync workflow, see the `local-model` skill.

---

## Checklist — setting up a scenario from scratch

- [ ] Identify the chapter directory and the flow you want to run.
- [ ] Trace the flow back to its origin in this chapter. Start from the first UI or Automation slice, not from the slice being tested. Only use `initialState` or `seededEvents` for data that genuinely originates outside this chapter.
- [ ] **Check for wireframes:** for each UI element in scope, verify its `description.md` contains an ` ```html ` code block. If none do, ask the user whether to add wireframes before proceeding (see the `html-wireframe` skill). Only skip if the user has declined or said wireframes are out of scope.
- [ ] Create the scenario directory under `scenarios/` and write `scenario.json` with a name and a fixed `clock`.
- [ ] If the flow depends on prior state, populate `initialState` or `seededEvents`.
- [ ] If UI screens need specific input, add entries to the `interactions` array.
- [ ] Write `decide` play functions (`play-function.ts`) for any command that needs rules or ID generation.
- [ ] Write `apply` play functions for any event that projects into a list or partial update.
- [ ] Write `read` play functions for any Information view that should filter or reshape stored state.
- [ ] For each `play-function.ts` written, the runtime automatically discovers it — no `element.json` field is needed anymore.
- [ ] Write a `play-type.ts` declaring `type Payload = …` for **every** Command, Event, and Information element in the chapter, and for any UI element that has a play function. This is required even when no play function is written for that element. Auto-discovery: the runtime automatically loads the play type when `play-type.ts` is present.
- [ ] **Copy play functions and play types to every other placement of the same logical element.** When an element (same name, type, context) appears in more than one slice, each placement needs its own `play-function.ts` and `play-type.ts` files. prooph board propagates these automatically after sync-back, but the local model does not — until sync runs, copy the files manually so the scenario test runner can evaluate each placement independently.
- [ ] **Run typecheck** — catches type errors in play functions before they cause runtime failures:
  ```sh
  npx @proophboard/spec-stream scenario typecheck
  ```
- [ ] Pin expectations by adding entries to the `expectations` array in `scenario.json`.
- [ ] **Verify UI coverage for information expectations.** For every slice where you want to pin an `information` expectation, confirm that slice has a UI element and a corresponding interaction in the scenario. If the slice has no UI element, the playhead cannot reach it and the expectation will always be broken. Add a UI element to the slice (e.g. a read-only placement of the detail screen) and record an interaction for it before pinning.
- [ ] **Run scenario tests** — replays all scenarios in the chapter and evaluates pinned expectations:
  ```sh
  npx @proophboard/spec-stream scenario test --chapter <chapter-path> --all
  ```
  Use `--scenario <id|name>` instead of `--all` to run a single scenario. One of the two is required.
- [ ] Fix any 🔴 Broken expectations or typecheck errors before continuing.
- [ ] Run model validation:
  ```sh
  npx @proophboard/spec-stream model validate
  ```
- [ ] Synchronize with `npx @proophboard/spec-stream sync-back` and confirm success. **Run this yourself — do not ask the user to run it.** Sync-back is the expected completion step after all validation passes; prompting the user adds no value and breaks the workflow.
