# Rokkit — Agent Instructions

This file is the entry point for any AI agent working on this repo.

## MANDATORY: Load Workflow First

Before doing any work, read these files in order:
1. **`agents/workflow.md`** — methodology, session lifecycle, question protocol
2. **`agents/memory.md`** — shared project knowledge and decisions
3. **`agents/journal.md`** (last ~50 lines) — recent progress
4. **`agents/plan.md`** — check for active plan to resume
5. **`agents/design-patterns.md`** — established patterns to follow for implementation
6. **`agents/references.md`** — coding conventions, styling rules, project structure

These files govern how you work. Do not skip them.

---

## Project Overview

**Rokkit** is a Svelte 5 component library and design system for data-driven applications. It features field mapping, snippet-based customization, keyboard navigation, and a theme/layout CSS separation architecture.

## Repository Structure

```
rokkit/
  CLAUDE.md                      <-- You are here
  agents/                        <-- Agent instructions, session tracking, patterns
    workflow.md                  <-- Methodology and session lifecycle (READ FIRST)
    memory.md                   <-- Shared project knowledge
    journal.md                  <-- Chronological progress log
    plan.md                     <-- Active plan/checklist
    open-questions.md           <-- Q&A tracking for design discussions
    design-patterns.md          <-- Established patterns cookbook
    references.md               <-- Coding conventions, styling, project structure
    backlog/                    <-- Priority-ordered backlog files
    sessions/                   <-- Archived completed plans
  docs/
    requirements/               <-- Feature requirements (numbered: 001-xxx.md)
    design/                     <-- Module design documents (numbered: 001-xxx.md)
  packages/                     <-- Library packages (@rokkit/ui, states, actions, etc.)
  sites/
    learn/                      <-- Documentation site
    playground/                 <-- Interactive demos + e2e tests
```

## Key Design Principles

- **Data-First** — Components adapt to data structures via field mapping, not the other way around
- **Composable** — Every component extensible via snippets without modification
- **Consistent API** — Standard props: `items`, `value` (bindable), `fields`, `onchange`/`onselect`
- **Accessible** — Keyboard navigation + ARIA via controller + navigator pattern
- **Themeable** — Unstyled components with data-attribute hooks, theme/layout CSS separation

## Working with this Repo

### Commands (run from project root)

```bash
# Tests
bun run test:ci                   # All tests (~1057)
bun run test:ui                   # UI package tests (~655)

# Lint
bun run lint                      # 0 errors expected

# E2E tests
cd sites/playground && npx playwright test
```

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

| File | Purpose |
|------|---------|
| `agents/workflow.md` | Methodology and session lifecycle |
| `agents/memory.md` | Shared project knowledge |
| `agents/plan.md` | Active plan/checklist |
| `agents/journal.md` | Chronological progress log |
| `agents/backlog/` | Priority-ordered backlog files |
| `agents/design-patterns.md` | Established patterns cookbook |
| `agents/references.md` | Coding conventions, styling, structure |
