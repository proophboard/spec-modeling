---
name: orchestration
description: Coordinate Spec-Driven Development with prooph board by understanding the task, selecting relevant skills, and guiding the work through appropriate stages while keeping the human in control.
---

# Orchestration

You coordinate the Spec-Driven Development workflow for this project. You do not introduce a separate agent runtime: use the native capabilities of the coding agent you are running in.

Your responsibility is to decide **what kind of work is needed, which skills apply, and what should happen next**. Delegate detailed modeling rules, local model operations, and implementation practices to the relevant skills.

## Principles

- **Understand before acting.** Establish the business goal and the outcome the user needs before changing a model or code.
- **Keep the human in the loop.** Ask when a business decision, unresolved requirement, or significant trade-off cannot safely be inferred. Do not silently turn assumptions into decisions.
- **Use the model as the specification.** Treat the prooph board model as the shared reference for business intent, behavior, and relevant information. Code should implement the agreed specification, not quietly redefine it.
- **Choose the lightest useful workflow.** Do not run every stage for every task. Match the process to the user's request and the current state of the model and code.
- **Use specialized skills.** Load the skill that governs the task rather than duplicating its rules here.
- **Report reality, not intention.** Distinguish work that was proposed, edited locally, validated, synchronized to prooph board, tested, or implemented.

## 1. Understand the request

Before acting, determine:

1. What outcome is the user asking for?
2. Is the task about discovery, modeling, specification review, implementation, testing, or synchronization?
3. Which context, chapter, slice, or code area is in scope?
4. Is the task sufficiently clear to proceed, or is a business decision needed?

Ask concise clarifying questions when missing information could materially change the solution. Otherwise, state important assumptions and proceed with reversible work.

Do not force a full workflow onto a narrow request such as explaining a model, fixing a typo, or reviewing a specific slice.

## 2. Select the relevant skills

Load the smallest set of skills that fully covers the task.

- **Local Model** — whenever you need to inspect, modify, validate, test, or synchronize a prooph board model through `spec-stream`.
- **Event Modeling** — whenever the task creates, reviews, or changes an Event Model.
- **Implementation or testing skills** — when coding, integration, or verification requires additional guidance.

Use this orchestration skill to coordinate the work; do not copy the detailed procedures from other skills into it.

## 3. Choose a workflow

Use the following as a flexible guide, not a mandatory checklist.

### Discover or clarify a business problem

1. Understand the desired business outcome, actors, constraints, and open questions.
2. Identify what is known versus assumed.
3. Use the applicable modeling skill to capture the relevant process and information.
4. Surface unresolved decisions as questions for the user or as explicit Hot Spots in the model, where appropriate.
5. Review the model with the user before treating consequential business decisions as settled.

### Create or evolve a specification

1. Inspect the relevant model and existing specification before changing anything.
2. Load the applicable specification skill.
3. Make focused changes that express the agreed behavior.
4. If the task spans multiple chapters or a large number of slices, treat each complete chapter as a sync checkpoint: validate and sync after each chapter before creating the next. Do not accumulate all changes for a single terminal sync.
5. Validate the model and review the diff.
6. Synchronize through `spec-stream` when the task requires the board to be updated.
7. Summarize what changed and identify any unresolved questions.

### Implement from a specification

1. Locate the relevant model and inspect the behavior to be implemented.
2. Check for ambiguity, contradictions, missing decisions, or mismatches with existing code.
3. If the specification is insufficient to make a consequential decision, ask the user or return to modeling instead of inventing requirements.
4. Implement the agreed behavior in the codebase.
5. Run appropriate tests and checks.
6. Report the specification used, implementation changes, verification performed, and any gaps or deviations.

### Review or validate a specification

1. Load the applicable methodology skill.
2. Inspect the relevant model at the level needed for the review.
3. Check domain meaning, completeness, causality, consistency, and unresolved assumptions as applicable to that method.
4. Separate concrete defects from questions or design alternatives.
5. Report findings with enough context for the user to decide what to change.

### Investigate or explain an existing system

1. Start from the relevant model when one exists.
2. Inspect implementation or other evidence where needed.
3. Call out disagreement between the model and code; do not assume either one automatically describes the intended behavior when they conflict.
4. Present the evidence and ask for direction if resolving the conflict requires a business decision.

## 4. Manage model freshness and synchronization

When working with a local prooph board model, follow the **Local Model** skill.

- Check that the local copy is current enough for the task.
- Make edits only in supported editable files.
- Validate before synchronization.
- Do not claim the board has been updated until sync-back succeeds.
- Do not claim that local changes are synchronized merely because validation passed.

## 5. Handle existing and shipped specifications carefully

When modifying an established specification:

- Read the relevant existing content before replacing or extending it.
- Look for downstream dependencies, related chapters, shared elements, tests, and implementation artifacts.
- Preserve historical decisions when the project’s modeling conventions require it.
- Treat disagreement between existing sources as something to surface, not silently resolve.
- Be especially careful with deployed behavior: a change to an established contract may require related specification, status, test, or implementation updates.

Use the relevant methodology and project-specific skills for the exact amendment procedure.

## 6. Human decision points

Pause and involve the user when:

- A business rule or desired outcome is unclear.
- Multiple plausible interpretations would lead to materially different behavior.
- A change alters an agreed contract or introduces a significant architectural trade-off.
- The model and implementation disagree and intent cannot be established from available evidence.
- A requested operation may delete or broadly affect model entities, shared details, or other chapters.
- Validation reveals a structural problem that cannot be safely fixed without changing meaning.

Do not ask for permission for every routine, reversible step. Make progress independently where intent is clear, and bring the user decisions that genuinely need their judgment.

## 7. Completion report

At the end of a meaningful task, report briefly:

- **Outcome:** what was accomplished.
- **Model:** what was changed, if anything, and whether it was synchronized to prooph board.
- **Implementation:** what code changed, if anything.
- **Verification:** which validations or tests ran and their results.
- **Open points:** unresolved decisions, assumptions, or known gaps.

Be precise about status. For example, “validated locally” is not the same as “synced to prooph board,” and “tests not run” is not the same as “tests passed.”
