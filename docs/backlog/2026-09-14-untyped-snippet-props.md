# Snippet props are untyped across the component surface

**Raised:** 2026-09-14, while adding `apps/learn` to `check:svelte`.
**Status:** open.

## The gap

`List` collects its snippets with a rest element behind an index signature:

```svelte
let {
    items = [], fields = {}, /* … */
    ...snippets
}: {
    /* … typed props … */
    [key: string]: unknown
} = $props()
```

`itemContent` is therefore `unknown`, and every consumer's snippet parameter
arrives implicitly `any`:

    Parameter 'proxy' implicitly has an 'any' type.

The index signature exists for a real reason — `List` supports per-item snippet
selection via `item.snippet = 'name'`, so arbitrary named snippets must be
accepted (documented in the component header). But the *documented* snippets
(`itemContent`, and the group/leaf variants) are a known, closed set and could be
declared explicitly alongside it. TypeScript prefers an explicit member over the
index signature, so the two coexist.

## Why it matters

The whole point of shipping `.d.ts` is that a consumer's snippet body is checked
against what the component actually passes. Today it is not: a snippet can read
`proxy.whatever`, pass `proxy` somewhere expecting a different type, and nothing
complains until runtime.

`packages/ui` is 0 errors / 0 warnings under `svelte-check`, but that measures
the library against itself. This only shows up from a consumer — it surfaced the
moment `apps/learn` was added to the gate.

## Scope

Not just `List`. Any component using the `...snippets` + `[key: string]: unknown`
shape has it. Worth enumerating before starting — `Tree`, `Select`,
`MultiSelect`, `Menu`, `Table`, `Toolbar` are the likely set, and the fix should
be uniform rather than per-component.

Note `packages/ui/src/types/` already does this correctly in places —
`breadcrumbs.ts` declares `crumb?: Snippet<[ProxyItem, boolean]>`. That is the
pattern to spread, not a new one to invent.

## Interim

Two call sites in learn annotate the parameter explicitly so the gate can go
green, each with a comment pointing here:

- `src/lib/koan/demos/list/placeholder.svelte`
- `src/lib/koan/demos/theme-wizard/index.svelte`

Those annotations should be deleted when the props are typed properly — they are
a workaround, not the destination.

## Related

- `docs/backlog/2026-09-14-learn-app-untypechecked.md` — the gate that found it,
  and the `ChatMessage` collision found the same way.
