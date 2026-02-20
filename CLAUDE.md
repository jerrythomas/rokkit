# Project Name — Agent Instructions

This file is the entry point for any AI agent working on this repo.

## MANDATORY: Load Workflow First

Before doing any work, read these files in order:
1. **`agents/workflow.md`** — methodology, session lifecycle, question protocol
2. **`agents/memory.md`** — shared project knowledge and decisions
3. **`agents/journal.md`** (last ~50 lines) — recent progress
4. **`agents/plan.md`** — check for active plan to resume
5. **`agents/design-patterns.md`** — established patterns to follow for implementation

These files govern how you work. Do not skip them.

---

## Project Overview

<!-- Replace with a 2-3 sentence description of what this project does. -->

**Project Name** is ...

## Repository Structure

```
project-root/
  CLAUDE.md                      <-- You are here
  agents/                        <-- Agent instructions, session tracking, patterns
    workflow.md                  <-- Methodology and session lifecycle (READ FIRST)
    memory.md                   <-- Shared project knowledge
    journal.md                  <-- Chronological progress log
    plan.md                     <-- Active plan/checklist
    open-questions.md           <-- Q&A tracking for design discussions
    design-patterns.md          <-- Established patterns cookbook
    backlog.md                  <-- Deferred items for future phases
    sessions/                   <-- Archived completed plans
  docs/
    requirements/               <-- Feature requirements (numbered: 01-xxx.md)
    design/                     <-- Module design documents (numbered: 01-xxx.md)
    examples/                   <-- Usage examples
  solution/                     <-- All source code lives here
```

## Key Design Principles

<!-- Replace with 3-5 principles that guide this project's architecture. -->

- **Principle 1** — ...
- **Principle 2** — ...
- **Principle 3** — ...

## Working with this Repo

### Commands (run from `solution/`)

<!-- Replace with actual commands for your project. -->

```bash
# Tests
bun run test                      # Run all tests

# Lint
bun run lint                      # 0 errors expected
```

**Important:** Always run commands from the project root.

## Conventions

### Design before implementation
For non-trivial work: ask questions, agree on approach with examples, then implement.
See `agents/workflow.md` for the full process.

### When a feature design is agreed upon
1. Update the relevant `docs/design/*.md` module file
2. Log in `agents/journal.md`
3. Create plan in `agents/plan.md`

### When completing work
1. Run tests and lint — both must pass
2. Update `agents/plan.md` — mark steps complete
3. Update `agents/journal.md` — log what was done with commit hashes
4. On plan completion: archive to `agents/sessions/YYYY-MM-DD-<name>.md`

### Lint Rules
- Warnings are pre-existing and acceptable
- **Errors must be zero**

## Key Files Quick Reference

<!-- Replace with key files for your project. -->

| File | Purpose |
|------|---------|
| `agents/workflow.md` | Methodology and session lifecycle |
| `agents/memory.md` | Shared project knowledge |
| `agents/plan.md` | Active plan/checklist |
| `agents/journal.md` | Chronological progress log |
| `agents/backlog.md` | Deferred items for future phases |
| `agents/design-patterns.md` | Established patterns cookbook |
