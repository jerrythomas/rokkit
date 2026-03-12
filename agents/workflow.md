# Agent Workflow

Rules and methodology for AI agents working on this repository.
CLAUDE.md loads this file at session start — follow it.

---

## Core Principles

1. **Understand "why" before "how"** — confirm reasoning before coding. If direction seems wrong, say so.
2. **Ask, don't assume** — if instructions are vague, ask one question at a time.
3. **Design before implementation** — for non-trivial work, agree on approach before writing code.
4. **Document as you go** — decisions decay if not captured immediately.
5. **One piece at a time** — small reviewable increments. Commit after each coherent unit.

---

## Task Classification

### Design Work (full pipeline)

- New features, new patterns, architectural changes
- Anything that could be done multiple ways
- **Process:** Backlog → Plan → Implement (see below)

### Tactical Work (lightweight)

- Bug fixes, small changes, clear scope
- **Process:** Confirm reasoning → implement → update docs if needed

### When in Doubt

Ask. The cost of a question is low.

---

## Pipeline: Backlog → Plan → Implement

### 1. BACKLOG

Identify or create a work item in `docs/backlog/`.

- If the work touches a **new module**: create requirements (`docs/requirements/NNN-<module>.md`) and design (`docs/design/NNN-<module>.md`) first.
- If the work touches an **existing module**: check that requirements and design docs are still current.
- Clarifications happen inline in conversation — capture answers in the relevant docs.
- Add the item to the appropriate backlog file in `docs/backlog/`.

### 2. PLAN

Create an implementation plan in `docs/plans/README.md`.

- Define: goal, tasks, approach, and reference to the backlog item.
- **Present the plan to the user for agreement.** No code until agreed.
- One active plan at a time.

### 3. IMPLEMENT

Execute the agreed plan.

- Work through tasks in order.
- Before marking work done, run the **completion checklist**:
  1. Code complete, tests pass
  2. Requirements doc still accurate? Update if not.
  3. Design doc still accurate? Update if not.
  4. Archive plan to `docs/plans/<datetime>-<name>.md`
  5. Update `agents/journal.md`
  6. Mark item done in `docs/backlog/`

---

## Interrupts

Everything goes to `docs/backlog/`. No inline insertion into current work. Pick it up next.

---

## Session Lifecycle

### Session Start

1. Read `agents/workflow.md` — this file
2. Read `agents/memory.md` — project knowledge
3. Read `agents/journal.md` (last ~50 lines) — recent progress
4. Check `docs/plans/README.md` — active plan to resume?
5. Consult `agents/design-patterns.md` and `agents/references.md` as needed during implementation

### During Session

- Track progress in the active plan
- Capture decisions in `agents/memory.md` immediately
- Update `docs/design/*.md` when designs change

### Before Commit

1. Run tests — all must pass
2. Run lint — 0 errors
3. Update `agents/journal.md`

---

## Crash Recovery

1. Check `docs/plans/README.md` — find active plan
2. Read `agents/journal.md` — last recorded progress
3. Resume from where work stopped

---

## File Reference

| File                        | Purpose                        | When to update                 |
| --------------------------- | ------------------------------ | ------------------------------ |
| `agents/workflow.md`        | This file — methodology        | When workflow evolves          |
| `agents/memory.md`          | Project knowledge, principles  | When decisions are made        |
| `agents/journal.md`         | Progress log                   | Every session                  |
| `agents/design-patterns.md` | Established patterns cookbook  | When patterns are proven       |
| `agents/references.md`      | Coding conventions, styling    | When conventions change        |
| `docs/requirements/`        | Module requirements (what/why) | When module scope changes      |
| `docs/design/`              | Module design (how/why)        | When design changes            |
| `docs/backlog/`             | Prioritized work items         | When items are added/completed |
| `docs/plans/README.md`      | Active plan                    | When starting/finishing work   |
