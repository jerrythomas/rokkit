---
description: Scaffold a new @rokkit/ui component end-to-end (component, exports, themes, unit tests, e2e tests, playground, docs, llms.txt)
---

You are creating a new Rokkit UI component: **$ARGUMENTS**

## Mandatory Pre-Work

Before writing a single line, read these files in this order:

1. `agents/workflow.md` — methodology and pipeline
2. `agents/memory.md` — project knowledge and gotchas
3. `agents/design-patterns.md` — established patterns cookbook
4. `agents/references.md` — coding conventions and architecture rules
5. `~/.claude/skills/writing-new-component.md` — the full step-by-step component skill

Then follow the `writing-new-component` skill exactly.

## Quick-Reference: Tier Selection

| Tier | Pattern             | When                                 | Examples                 |
| ---- | ------------------- | ------------------------------------ | ------------------------ |
| 1    | Simple display      | No items, no keyboard nav            | Button, Card, Badge      |
| 2    | Data-driven         | items array, click only              | BreadCrumbs              |
| 3    | Interactive list    | items + keyboard nav, always visible | List, Tree, Tabs, Toggle |
| 4    | Complex interactive | Dropdown, multi-select, lazy         | Menu, Select, Dropdown   |

## Quick-Reference: File Checklist

- [ ] `packages/ui/src/components/<Name>.svelte`
- [ ] Export in `packages/ui/src/components/index.ts`
- [ ] Export in `packages/ui/src/index.ts`
- [ ] `packages/themes/src/base/<name>.css` + import in base index
- [ ] `packages/themes/src/rokkit/<name>.css` + import in rokkit index
- [ ] `packages/themes/src/minimal/<name>.css` + import in minimal index
- [ ] `packages/themes/src/material/<name>.css` + import in material index
- [ ] `packages/themes/src/glass/<name>.css` + import in glass index
- [ ] `cd packages/themes && bun run build` ← **MANDATORY after any CSS change**
- [ ] `packages/ui/spec/<Name>.spec.svelte.ts` — vitest unit tests
- [ ] `site/e2e/<name>.e2e.ts` — playwright e2e tests
- [ ] `site/src/routes/(play)/playground/components/<name>/+page.svelte`
- [ ] Register in `site/src/routes/(play)/playground/+page.svelte` GROUPS
- [ ] Register in `site/src/routes/(play)/playground/+layout.svelte` sidebar
- [ ] `site/src/routes/(learn)/docs/components/<name>/+page.svelte`
- [ ] `site/src/routes/(learn)/docs/components/<name>/meta.json`
- [ ] `site/static/llms/components/<name>.txt`

## Key Invariants

- **Data attributes only** — never style by class or tag name
- **ProxyItem default fields**: `label` (not `text`), `value`, `icon`, `disabled`
- **`$bindable` + callbacks**: define `handleSelect` outside `$derived` to allow parent binding propagation
- **Navigator click interception**: never add `onclick` on elements that also have `data-path`
- **Themes build**: changes to CSS source don't take effect until `cd packages/themes && bun run build`

## Zero-Errors Policy (Non-Negotiable)

Before starting: run `bun run test:ui && bun run lint` and record baseline. Errors that exist before you start are still your responsibility — fix them first.

After implementing: run both again. The task is NOT done until both return zero errors.

```bash
bun run test:ui        # unit tests — zero errors required
bun run lint           # lint — zero errors required
cd site && npx playwright test e2e/<name>.e2e.ts --update-snapshots  # e2e baseline
```

Forbidden rationalizations: "no new errors", "pre-existing", "files I didn't touch". Zero means zero.

## Commit on Completion

When tests and lint are clean, commit with a descriptive message:

```bash
git add -p   # stage relevant files
git commit -m "feat: add <ComponentName> component

- Tier N: <brief architecture note>
- Theme CSS for rokkit/minimal/material/glass
- Unit tests, e2e tests, playground page, docs page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Then update `agents/journal.md` with a summary and the commit hash.
