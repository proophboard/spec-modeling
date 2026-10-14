# Spec-Driven Development with prooph board

This project uses the skills provided by `@proophboard/spec-modeling` to
support Spec-Driven Development with AI coding agents.

## Local Model Location

The local model is located at `./model/`. Always check this directory first before
asking for clarification. Use `model/uuid-index.json` to resolve element IDs to file paths.

## Working with the Model

The project may use [spec-stream](https://github.com/proophboard/spec-stream)
to maintain a local copy of a prooph board model.

When available, the local model is the primary working interface for agents:
read and modify its files, validate changes, and synchronize them back to
prooph board using spec-stream.

Follow the Local Model skill for instructions on accessing and modifying
the model. Never edit generated files or bypass the synchronization
mechanism.

### After Every Model Change

After modifying any file under `./model/`, always run these two steps — do not
ask the user to run them, they are your responsibility:

1. `npx @proophboard/spec-stream model validate` — validates the local model
2. `npx @proophboard/spec-stream sync-back` — synchronizes changes back to prooph board

Never declare a model change complete without both steps passing successfully.

## Skills

Skill files are located in the `./skills/` directory. Load the relevant skill
by reading its `SKILL.md` file before starting a task.

| Skill | File | When to load |
|---|---|---|
| Orchestration | `skills/orchestration/SKILL.md` | Coordinates the Spec-Driven Development workflow |
| Local Model | `skills/local-model/SKILL.md` | Any time you read or change model files |
| Event Modeling | `skills/event-modeling/SKILL.md` | Creating or reviewing Event Models |
| Navigation | `skills/navigation/SKILL.md` | Any time a deeplink is provided |
| Exploration Mode | `skills/exploration-mode/SKILL.md` | Creating, editing, or testing scenarios or play functions |
| HTML Wireframe | `skills/html-wireframe/SKILL.md` | Creating or updating a wireframe |

## General Principles

- Understand the business problem before committing to a solution.
- Keep humans involved in business decisions and significant design choices.
- Treat the specification as the reference for implementation.
- Use the native capabilities of the current coding agent.

This package provides reusable skills and instructions, not a separate
agent runtime. Its methodology must remain independent of any specific
AI provider or coding agent.
