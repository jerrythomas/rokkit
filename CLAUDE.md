# Rokkit — Agent Instructions

This file is the entry point for any AI agent working on this repo.

## MANDATORY: Load Workflow First

Before doing any work, read these files in order:
1. **`agents/workflow.md`** — methodology and pipeline
2. **`agents/memory.md`** — project knowledge, principles, tooling
3. **`agents/journal.md`** (last ~50 lines) — recent progress
4. **`docs/plans/README.md`** — check for active plan to resume

These files govern how you work. Do not skip them.

---

## Project Overview

**Rokkit** is a Svelte 5 component library and design system for data-driven applications. It features field mapping, snippet-based customization, keyboard navigation, and a theme/layout CSS separation architecture.

## Repository Structure

```
rokkit/
  CLAUDE.md                      <-- You are here
  agents/                        <-- AI operational files
    workflow.md                  <-- Methodology and pipeline (READ FIRST)
    memory.md                   <-- Project knowledge, principles, tooling
    journal.md                  <-- Chronological progress log
    design-patterns.md          <-- Established patterns cookbook
    references.md               <-- Coding conventions, styling, project structure
  docs/
    requirements/               <-- Per-module: what and why (numbered: NNN-xxx.md)
    design/                     <-- Per-module: how and why (numbered: NNN-xxx.md)
    backlog/                    <-- Priority-ordered work items (YYYY-MM-DD-topic.md)
    plans/                      <-- Active plan + archived completed plans
      README.md                 <-- Current active plan
  packages/                     <-- Library packages (@rokkit/ui, states, actions, etc.)
  sites/
    learn/                      <-- Documentation site + interactive demos + e2e tests
```

## Key Design Principles

- **Data-First** — Components adapt to data structures via field mapping, not the other way around
- **Composable** — Every component extensible via snippets without modification
- **Consistent API** — Standard props: `items`, `value` (bindable), `fields`, `onchange`/`onselect`
- **Accessible** — Keyboard navigation + ARIA via controller + navigator pattern
- **Themeable** — Unstyled components with data-attribute hooks, theme/layout CSS separation

## Working with this Repo

### Commands (run from `solution/`)

```bash
# Tests
bun run test:ci                   # All tests (~2536)
bun run test:ui                   # UI package tests

# Lint
bun run lint                      # 0 errors expected

# E2E tests
cd sites/learn && npx playwright test
```

## Conventions

### Pipeline for work items
For non-trivial work: **Backlog → Plan → Implement**.
See `agents/workflow.md` for the full process.

### When a feature design is agreed upon
1. Update the relevant `docs/design/*.md` module file
2. Log in `agents/journal.md`
3. Create plan in `docs/plans/README.md`

### When completing work
1. Run tests and lint — both must pass
2. Check requirements and design docs are still accurate
3. Archive plan to `docs/plans/<datetime>-<name>.md`
4. Update `agents/journal.md` with summary and commit hashes
5. Mark item done in `docs/backlog/`

### Handling interrupts
All interrupts go to `docs/backlog/`. Pick up next.

### Lint Rules
- Warnings are pre-existing and acceptable
- **Errors must be zero**

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `agents/workflow.md` | Methodology, pipeline, session lifecycle |
| `agents/memory.md` | Project knowledge, principles, tooling |
| `agents/journal.md` | Chronological progress log |
| `agents/design-patterns.md` | Established patterns cookbook |
| `agents/references.md` | Coding conventions, styling, structure |
| `docs/requirements/` | Module requirements — what and why |
| `docs/design/` | Module design — how and why |
| `docs/backlog/` | Priority-ordered work items |
| `docs/plans/README.md` | Current active plan |
