---
description: Start a new feature. Usage: /feature-start FeatureName — brief description of what you're building
---

Starting feature: **$ARGUMENTS**

## Step 1: Load Context

Read these files in order before anything else:

1. `agents/workflow.md` — methodology and pipeline
2. `agents/memory.md` — project knowledge and gotchas
3. `agents/journal.md` (last 50 lines) — recent progress and current state
4. `docs/design/07-priority.md` — priority checklist, find if this is already tracked

## Step 2: Establish a Clean Baseline

Run tests and lint NOW, before any code changes. Record the result.

```bash
bun run test:ci        # full test suite
bun run lint           # zero lint errors expected
```

If there are failures before you start — fix them first. They are your responsibility.

## Step 3: Confirm Branch

Always work on `develop`. Never delete it.

```bash
git status             # confirm you are on develop and working tree is clean
git log --oneline -5   # orient yourself
```

If you need an isolated branch (large feature, experimental work), branch from develop:
```bash
git checkout -b feature/<kebab-case-name>
```

## Step 4: Classify the Work

**Design Work (full pipeline)** — use when:
- New component or new pattern
- Architectural change
- Anything that could be done multiple ways

**Tactical Work (lightweight)** — use when:
- Bug fix, small addition, clear scope

For design work: agree on approach before writing code. For tactical work: confirm reasoning, then proceed.

## Step 5: Check/Create Backlog Item

Look in `docs/backlog/` for an existing item. If none:

```bash
# Create: docs/backlog/YYYY-MM-DD-<feature-name>.md
```

Format:
```markdown
# <Feature Name>

**Status:** In Progress
**Added:** YYYY-MM-DD

## Goal

One sentence.

## Scope

What's in, what's out.
```

## Step 6: Active Plan

For non-trivial work, create or update `docs/plans/README.md`:

```markdown
# Active Plan: <Feature Name>

**Goal:** one sentence
**Backlog ref:** docs/backlog/YYYY-MM-DD-<name>.md

## Tasks
- [ ] Task 1
- [ ] Task 2
```

Present the plan and wait for confirmation before coding.

## Step 7: Track With Todos

Use TodoWrite to track tasks during the session. Update status (in_progress → completed) as you go.

---

You are now set up. Proceed with the plan, following the zero-errors-policy throughout.
