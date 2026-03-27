---
description: Scaffold a new @rokkit/ui component end-to-end (component, exports, themes, unit tests, e2e tests, playground, docs, llms.txt)
---

You are creating a new Rokkit UI component: **$ARGUMENTS**

## Step 1 — Read the Blueprint

Read `docs/llms/component-blueprint.md` in full before writing any code. It is the single authoritative source for:
- Tier classification (pick Tier 1–4 based on the decision table)
- Standard props API
- Data-attribute conventions
- ProxyItem, Wrapper, Navigator, Trigger wiring
- Messages integration
- Snippet customization
- Theme CSS structure
- File checklist

## Step 2 — Check Recent State

Read `agents/journal.md` (last 50 lines) for anything that affects this work.

## Step 3 — Classify the Tier

Using the decision table in the blueprint, state which tier this component is and why before writing any code.

## Step 4 — Implement

Follow the blueprint exactly. Use the Tier example in §11 as a template.

Key invariants (non-negotiable):
- **Data attributes only** — never style by class or tag name
- **`proxy.label`** — default text field is `label`, not `text`
- **`handleSelect` outside `$derived`** — define at component scope or bindings won't propagate
- **No `onclick` on `[data-path]` elements** — Navigator intercepts clicks; double-handling breaks things
- **`scrollIntoView?.(...)`** — optional chaining required for JSDOM test compat
- **Themes build** — `cd packages/themes && bun run build` after every CSS change

## Step 5 — File Checklist

Work through the checklist in §10 of the blueprint. Don't skip the theme build step.

## Step 6 — Zero Errors

```bash
bun run test:ci && bun run lint          # zero errors required
cd packages/themes && bun run build      # if CSS changed
```

Fix every error before committing. "Pre-existing" is not a valid reason to leave an error.

## Step 7 — Commit

```bash
git add -p
git commit -m "feat: add <ComponentName> component

- Tier N: <brief architecture note>
- Theme CSS: base + rokkit/minimal/material/frosted
- Unit tests, e2e tests, playground page, docs page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Update `agents/journal.md` with a summary and the commit hash.
