---
description: Edit an existing @rokkit/ui component. Usage: /edit-component ComponentName — what you want to change
---

You are editing an existing Rokkit UI component. Request: **$ARGUMENTS**

## Mandatory Pre-Work

Read these files before touching any code:

1. `agents/memory.md` — project gotchas (Svelte 5 reactivity, navigator click interception, etc.)
2. `agents/design-patterns.md` — patterns cookbook
3. `agents/references.md` — conventions

Then read the component file itself and all related test/spec files before making changes.

## Architecture Invariants — Do Not Break

### Svelte 5 Runes
- Use `$props()`, `$state()`, `$derived()`, `$effect()` — never Svelte 4 patterns
- `export let` → `$props()`, `$:` → `$derived()`, `on:event` → `onevent`
- **Bindable + derived gotcha**: assigning to a `$bindable` prop inside a closure defined within `$derived` does NOT propagate to the parent. Define event handlers at component scope, outside `$derived`.

### Data Attributes
- All CSS hooks are `data-<component>-<element>` attributes — never classes
- State: `data-open={isOpen || undefined}` — undefined omits the attribute
- Required for navigation: `data-path={key}` on every interactive item

### Navigator Interception
- The `navigator` action intercepts ALL clicks on `[data-path]` elements
- **Never add `onclick` on elements that also have `data-path`** — causes double-handling
- Let navigator call the `onselect`/`ontoggle` wrapper methods

### Controller / Wrapper Pattern
```svelte
const tree = $derived(new ProxyTree(items, fields))
const wrapper = $derived(new Wrapper(tree, { onselect: handleSelect }))
// handleSelect must be defined outside the $derived above ↑
function handleSelect(v, proxy) { value = v; onchange?.(v) }
```

### ProxyItem Default Fields
- `proxy.label` → `item[fields.label ?? 'label']` — default is `label`, NOT `text`
- `proxy.value` → `item[fields.value ?? 'value']`
- `proxy.get('icon')` → `item[fields.icon ?? 'icon']`

## Zero-Errors Policy (Non-Negotiable)

Before touching anything: run `bun run test:ui && bun run lint` and record the baseline. If errors exist before you start, fix them first — they are your responsibility regardless of who introduced them.

After all changes: run both again. Do not commit until both return zero errors.

```bash
bun run test:ui        # unit tests — zero errors required
bun run lint           # lint — zero errors required
```

Forbidden rationalizations: "no new errors", "pre-existing", "unrelated files". Zero means zero.

## After Editing

If you changed any theme CSS:
```bash
cd packages/themes && bun run build   # MANDATORY — changes won't appear without this
```

If you changed the component API (new props, renamed props, changed behavior):
- Update `site/static/llms/components/<name>.txt`
- Update `site/src/routes/(learn)/docs/components/<name>/+page.svelte`
- Update `site/src/routes/(learn)/docs/components/<name>/meta.json` if needed

## Commit on Completion

When tests and lint are clean:

```bash
git add -p
git commit -m "fix|feat|refactor: <component> — <what changed and why>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
