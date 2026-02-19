# Agent Workflow

Rules and methodology for AI agents working on this repository.
CLAUDE.md loads this file at session start — follow it.

---

## Core Principles

1. **Understand "why" before "how"** — even for tactical tasks, confirm the reasoning before coding. If the direction seems wrong, say so and suggest an alternative.
2. **Ask, don’t assume** — if instructions are vague, ask a clarifying question. One question at a time. Don’t dump a wall of questions.
3. **Design before implementation** — for non-trivial work, agree on the approach with concrete examples (before/after) before writing code.
4. **Document as you go** — if it was discussed, write it down. Decisions decay if not captured immediately.
5. **One piece at a time** — break work into small, reviewable increments. Commit after each coherent unit.

---

## Task Classification

Assess every task before starting:

### Design Work (questions + plan required)
- New features, new patterns, architectural changes
- Anything that could be done multiple ways
- Anything where the "why" isn’t obvious
- **Process**: Questions first (use `agents/open-questions.md`) → agree on approach with examples → write plan (`agents/plan.md`) → implement

### Tactical Work (lightweight check)
- Bug fixes, field additions, clear-scope changes
- Code quality, documentation, coverage improvements
- **Process**: Confirm the reasoning makes sense → plan if multi-step → implement
- Even here: if you see a better alternative, speak up before coding

### When in Doubt
Ask. The cost of a question is low. The cost of implementing the wrong thing is high.

---

## Session Lifecycle

### Session Start
1. Read `agents/memory.md` — shared project knowledge
2. Read `agents/journal.md` (last ~50 lines) — recent progress and open items
3. Read `agents/plan.md` — check for active plan to resume
4. If resuming from crash/interruption: pick up from unchecked items in the plan

### During Session
1. Track steps in `agents/plan.md` — check off items as completed
2. Use TodoWrite tool for real-time progress visibility
3. Capture decisions in `agents/memory.md` immediately (if they’re project-level knowledge)
4. Update relevant `docs/design/*.md` when a design is agreed upon

### Before Commit
1. Run tests — all must pass
2. Run lint — 0 errors
3. Update `agents/plan.md` — mark completed steps
4. Update `agents/journal.md` — log what was done with commit hashes

### Session End / Plan Completion
1. When all plan steps are done **and tests + lint pass**:
   - Archive: move `agents/plan.md` content to `agents/sessions/YYYY-MM-DD-<feature-name>.md`
   - Clear `agents/plan.md` for next plan
   - **Do NOT archive until verification passes** — a plan with failing tests is not complete
2. Update `agents/journal.md` — final summary
3. Update `agents/memory.md` — if new persistent knowledge was established

---

## Question Protocol

For design discussions and unclear requirements:

### Setup
1. Formulate your questions — think through what you need to know
2. Write them to `agents/open-questions.md` as a checklist (for tracking)
3. Mark status: `[ ]` not asked, `[~]` awaiting answer, `[x]` answered

### Execution
1. **Ask one question at a time** — present it in conversation, wait for the answer
2. **Stay adaptive** — the next question may change based on the current answer
3. **Capture answers immediately** — update `open-questions.md` and relevant docs
4. An answer may make other questions irrelevant or spawn new ones — adjust the list

### Why This Matters
- Dumping multiple questions causes context-switching and tangents
- Answers to early questions often reshape later ones
- One-at-a-time keeps the conversation focused and productive

---

## Plan Format

When creating `agents/plan.md` for a unit of work:

```markdown
# Plan: <Feature Name>

## Context
Why we’re doing this. What problem it solves.

## Approach
The agreed-upon design. Include concrete before/after examples where possible.

## Steps
- [ ] Step 1: Description (files: x.ts, y.ts)
- [ ] Step 2: Description
- [ ] Step 3: Run tests + lint
- [ ] Step 4: Commit

## Verification
How to confirm it works (test commands, expected outcomes).
```

### Plan Rules
- One active plan at a time
- Each step should be small enough to verify independently
- Include "run tests + lint" as an explicit step
- Include "commit" as the final step
- When complete **and verified (tests + lint pass)**: archive to `agents/sessions/`, clear `agents/plan.md`

---

## Backlog Management

Deferred work lives in `agents/backlog.md`:

- Items are added when features are explicitly scoped out of current work
- Each item includes: what exists, what’s needed, relevant design docs
- Items are numbered and have actionable checklists
- Review the backlog periodically during housekeeping sessions

---

## Crash Recovery

If a session ends unexpectedly:
1. Read `agents/plan.md` — find unchecked steps
2. Read `agents/journal.md` — last recorded state
3. Resume from where work stopped — don’t restart from scratch
4. Note the interruption in the journal

---

## Design Agreement Process

For non-trivial implementation:

1. **Discuss** — understand the requirement, ask clarifying questions
2. **Propose with examples** — show before/after code, not just abstract descriptions
3. **Get explicit agreement** — don’t proceed on assumed approval
4. **Document** — write the agreed design in relevant `docs/design/*.md`
5. **Plan** — create `agents/plan.md` with concrete steps
6. **Implement** — follow the plan, one step at a time
7. **Archive** — move completed plan to `agents/sessions/`

---

## File Reference

| File | Purpose | When to update |
|------|---------|---------------|
| `agents/workflow.md` | This file — methodology rules | When workflow evolves |
| `agents/memory.md` | Shared project knowledge, confirmed decisions | When decisions are made |
| `agents/journal.md` | Chronological progress log | Every session |
| `agents/plan.md` | Active plan/checklist | During implementation |
| `agents/open-questions.md` | Q&A tracking for design discussions | During question phases |
| `agents/design-patterns.md` | Established patterns cookbook | When patterns are proven |
| `agents/backlog.md` | Deferred items for future phases | When items are scoped out |
| `agents/sessions/` | Archived completed plans | On plan completion |
| `docs/design/*.md` | Module design documents | When designs are agreed |
| `docs/requirements/*.md` | Feature requirements | Reference only |
