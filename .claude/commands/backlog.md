---
description: View and pick a backlog item to work on, then kick off the feature. Usage: /backlog [item name or number — optional]
---

Working with the backlog. Request: **$ARGUMENTS**

## Step 1: Read the Priority Checklist

Read `docs/design/12-priority.md` in full. This is the canonical list of all pending work, organized by priority tier (P1 → P4).

Also skim:
- `agents/journal.md` (last 50 lines) — what was recently completed
- `docs/plans/README.md` — is there already an active plan?

## Step 2: Surface the Backlog

If no specific item was requested in `$ARGUMENTS`, present the open items grouped by priority. Format:

```
P1 — High Impact
  [ ] Item name — one-line description
  [ ] Item name — one-line description

P2 — UX Enhancements
  [ ] Item name — ...

(P3, P4 collapsed unless user asks)
```

Ask the user which item they want to work on.

If a specific item was named in `$ARGUMENTS`, find it in the checklist and jump to Step 3.

## Step 3: Load Item Context

For the chosen item, read its linked design/feature doc. Common locations:
- `docs/features/NN-<name>.md` — feature spec (what + scenarios)
- `docs/design/NN-<name>.md` — design doc (how)
- `docs/design/components/<name>.md` — component-specific design

Summarize:
- What it is and why it matters
- Current state (what exists vs what's missing)
- Estimated scope: tactical (bug/small addition) or design work (new component/pattern)

## Step 4: Decide Classification

**Tactical** (bug fix, small addition, clear scope):
→ Confirm reasoning with user, then proceed directly — use `/feature-start` to set up

**Design work** (new component, architectural change, anything multi-approach):
→ Need to agree on approach first. Read related components for patterns, then present 2-3 options.
→ Use `/feature-start` once approach is agreed.

## Step 5: Kick Off

Once the user confirms the item:

1. Invoke `/feature-start <ItemName> — <description>` to load full context, baseline tests, and set up tracking
2. For new components: invoke `/new-component <Name>` for the full scaffold workflow
3. For theme work: invoke `/edit-theme <Name> style=<theme>` for theme-specific guidance

---

## Backlog Maintenance

When an item is done, update `docs/design/12-priority.md`:
- Change `- [ ]` to `- [x]` for the completed item
- Add the completion date as a note if significant

When adding a new backlog item, append it under the appropriate priority tier.
