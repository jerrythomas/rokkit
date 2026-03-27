---
description: Edit an existing @rokkit/ui component. Usage: /edit-component ComponentName — what you want to change
---

You are editing an existing Rokkit UI component. Request: **$ARGUMENTS**

## Step 1 — Read the Blueprint

Read `docs/llms/component-blueprint.md` §§3–9 for the invariants that must not be broken:
- Data-attribute conventions (§3)
- ProxyItem API (§4)
- Primitives wiring — Wrapper, Navigator, Trigger (§5)
- Messages integration (§6)
- Svelte 5 gotchas (§9)

Then read the component file itself and its spec file before making any changes.

## Step 2 — Baseline

```bash
bun run test:ui && bun run lint   # record errors before touching anything
```

If errors exist before you start, fix them first.

## Step 3 — Make the Change

Apply only what was requested. Do not refactor surrounding code, add comments to unchanged lines, or introduce features that weren't asked for.

## Step 4 — If CSS changed

```bash
cd packages/themes && bun run build   # MANDATORY — changes won't appear without this
```

## Step 5 — Zero Errors

```bash
bun run test:ui && bun run lint   # must be zero errors
```

## Step 6 — If API changed (new/renamed props, changed behavior)

Update these files to stay in sync:
- `docs/llms/components/<name>.txt`
- `site/src/routes/(learn)/docs/components/<name>/+page.svelte`

## Step 7 — Commit

```bash
git add -p
git commit -m "fix|feat|refactor: <component> — <what changed and why>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
