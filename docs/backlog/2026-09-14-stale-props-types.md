# Four published `*Props` types describe components that no longer exist

**Raised:** 2026-09-14, while typing snippet props.
**Status:** open.

## The defect

`@rokkit/ui` publishes a props interface per component. For four of them the
interface and the component have drifted, and nothing catches it because **the
component never imports its own props type** — so there is no cross-check
between the declared shape and the real `$props()`.

`types/list.ts` is the clearest case. `ListProps` declares:

| `ListProps` says | `List.svelte` actually has |
| --- | --- |
| `item?: ListItemSnippet` — `(item, fields, handlers, isActive)` | `itemContent` — `(proxy)` |
| `groupLabel?: ListGroupLabelSnippet` | `groupContent` — `(proxy)` |
| `multiselect`, `expanded`, `selected`, `active` | *(absent)* |
| `onselectedchange`, `onexpandedchange` | *(absent)* |
| `onselect?: (value, item: ListItem)` | `onselect?: (value, proxy: ProxyItem)` |

A consumer typing against `ListProps` gets a shape the component will not
accept, and snippets that will never be rendered. It is published and wrong.

## Scope

Exactly four of 48 are unwired — and they are precisely the four free to drift:

- `ListProps` (`types/list.ts`)
- `MenuProps` (`types/menu.ts`)
- `SelectBaseProps` (`types/select.ts`)
- `TreeProps` (`types/tree.ts`)

The other 44 import their type into the component, which keeps them honest.

## Why it is booked rather than fixed

Correcting these is a **breaking change to published types** for anyone who
imported them, and the four components are the most-used in the library. It also
wants a decision that is not mine to make: whether to correct the interfaces to
match the components, or treat the interfaces as the intended API and change the
components toward them. `ListProps`'s `multiselect` / `expanded` / `selected`
look like a *designed* API someone meant to build, not an accident — that is
worth confirming before deleting.

## Suggested approach

1. Decide, per component, which side is the truth.
2. Make each component import and use its own `*Props`, so the two cannot drift
   again. That single change is what turns this from a recurring class of bug
   into a compile error.
3. Note that `check:types` on `packages/ui` alone will **not** catch a
   regression here — only a consumer does. Keep `apps/learn` in the gate.

## Related

- `2026-09-14-untyped-snippet-props.md` — where this was found, now closed.
- `2026-09-14-learn-app-untypechecked.md` — the consumer-side gate that
  surfaced it, along with the `ChatMessage` collision.
