# @proophboard/spec-modeling

A skeleton package that equips AI coding agents with specialized skills for
[Spec-Driven Development](https://flow.prooph-board.com) using a local copy of a
[prooph board](https://flow.prooph-board.com) model.

After initialization the files are **yours** — modify, extend, and adapt them to
your project as you see fit.

## What's included

The package installs a set of skill files that teach AI agents how to work with
your prooph board model locally. The model is synced to a `model/` directory by
[@proophboard/spec-stream](https://github.com/proophboard/spec-stream), which
keeps it in sync with your prooph board workspace in near real-time.

### Skills

| Skill | Purpose |
|---|---|
| **Orchestration** | Coordinates the Spec-Driven Development workflow — selects the right skills, keeps humans in the loop, and matches process to task |
| **Local Model** | Teaches agents to read, modify, validate, and sync changes back to prooph board via spec-stream |
| **Event Modeling** | Guides agents through creating, extending, and reviewing Event Models — domain discovery, causality, slice structure, element semantics |
| **Exploration Mode** | Makes the Event Model executable: scenarios, play functions, screen input, actions, and automated reactions |
| **HTML Wireframes** | Creates focused, realistic HTML wireframes that reflect the modeled user experience and integrate with Exploration Mode |
| **Navigation** | Parses and generates prooph board deeplinks so agents can navigate to and reference specific elements or slices |

Skills are plain markdown files in `skills/`. Add new ones, edit existing ones,
or remove any that don't apply to your project.

## Quick start

Scaffold a new project with a single command — no git history, just the files:

```bash
npx @proophboard/spec-modeling init [target-directory]
```

If no directory is given the files are placed in the current directory.

## Setup

**1. Copy the example environment file**

```bash
cp .env.example .env
```

**2. Get a prooph board API key**

Open your workspace on [prooph board](https://flow.prooph-board.com), go to
workspace settings, and generate an API key.

**3. Add the key to your `.env` file**

```
PROOPH_BOARD_API_KEY=your-api-key-here
```

**4. Configure the spec-stream connection**

Edit `proophboard.spec-stream.json` to point at your workspace and board.
You can also extend it to react to events received in real-time from prooph board —
see the [spec-stream documentation](https://github.com/proophboard/spec-stream)
for details.

## Start the local model sync

Run this in the background whenever you're working on the local model. It
keeps `model/` in sync with your prooph board workspace:

```bash
npm run model:sync
```

> Always start this before asking an agent to read or modify the model.

## Available scripts

```bash
npm run model:sync          # Start the real-time sync (keep running in background)
npm run model:sync-back     # Push local model changes back to prooph board
npm run model:validate      # Validate the local model
npm run model:typecheck     # Type-check scenario play functions
npm run model:scenario-test # Run scenario tests
```

## Project structure

```
skills/               # AI agent skill files — edit freely
  orchestration/      # Workflow coordination
  local-model/        # Model file mechanics and spec-stream operations
  event-modeling/     # Event Modeling methodology
  exploration-mode/   # Scenarios, play functions, executable prototypes
  html-wireframe/     # UI wireframe creation
  navigation/         # Deeplink parsing and generation
model/                # Local copy of your prooph board model (synced by spec-stream)
AGENTS.md             # Agent instructions — loaded automatically by supported agents
proophboard.spec-stream.json  # spec-stream configuration
.env.example          # Environment variable template
```

## Learn more

- [prooph board](https://flow.prooph-board.com) — collaborative Event Modeling and Spec-Driven Development
- [spec-stream](https://github.com/proophboard/spec-stream) — local model sync and real-time event integration
