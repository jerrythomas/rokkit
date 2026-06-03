# Accessibility & i18n

All interactive Rokkit components support full keyboard
navigation and ARIA out of the box. This is implemented via two
primitives — **controllers** (state machines) and the
`navigator` action (DOM binding) — that you can also use to
build your own accessible components.

## What you get for free

- Arrow-key navigation in all lists, trees, menus, and selects.
- Home / End to jump to the first / last item.
- Enter / Space to select.
- Escape to close dropdowns and restore focus to the trigger.
- ARIA roles, states, and properties on every interactive element.
- Focus management — focus returns to the trigger on close.
- Type-ahead search where it makes sense (selects, dropdowns).

## The Wrapper + Navigator pattern

Rokkit's interactivity is built on three composable primitives:

- **ProxyTree / ProxyTable** — reactive data layer.
- **Wrapper / LazyWrapper** — pure state machine for focus,
  selection, and expansion. No DOM dependency.
- **`Navigator` class** — binds a Wrapper to a container
  element, attaches keyboard / click / focus handlers, and
  contains `scrollIntoView` to the list.

The separation means you can test interaction logic **without
a browser**, and swap the visual rendering without touching
the navigation behavior.

```svelte
<script>
  import { ProxyTree, Wrapper } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'

  const tree = $derived(new ProxyTree(items))
  const wrapper = $derived(new Wrapper(tree, { onselect }))

  let rootRef = $state(null)
  $effect(() => {
    if (!rootRef) return
    const nav = new Navigator(rootRef, wrapper, { orientation: 'vertical' })
    return () => nav.destroy()
  })
</script>

<ul bind:this={rootRef}>
  {#each wrapper.flatView as node (node.key)}
    <li
      data-path={node.key}
      data-active={node.proxy.value === wrapper.selected || undefined}
    >
      {node.proxy.label}
    </li>
  {/each}
</ul>
```

That's the entire interaction layer for an arrow-key-navigable
list. The same primitives power `List`, `Menu`, `Tree`,
`MultiSelect`, `Tabs`, `Toolbar`, and `Table` internally.

## Screen-reader semantics

Every component carries appropriate ARIA roles:

- `role="listbox"` / `role="menu"` on the parent container
- `role="option"` / `role="menuitem"` on each row
- `role="tree"` + `role="treeitem"` for hierarchies
- `role="status"` for live regions (StatusList, alerts)
- `role="tooltip"` + `aria-describedby` on Tooltip wrappers

ARIA labels come from the active locale's `messages` bundle, so
swapping locale changes the screen-reader announcements too.

## i18n

Localised labels live in `@rokkit/states`'s `messages` export.
Each component imports its own slice (`messages.tree`,
`messages.menu`, …) for default `aria-label`, "no results"
copy, etc. Override per-component via a `labels` prop or
globally via `setMessages()`.

## Focus rings

Components style `:focus-visible` (not `:focus`) so the ring
only shows on keyboard interaction, not pointer clicks. The
ring style itself is theme-driven — usually
`box-shadow: 0 0 0 2px var(--accent-soft)` — so it matches
whatever skin is active without per-component overrides.

## Reduced motion

Animation-bearing components (Carousel, Reveal, FloatingAction
expand, alert dismiss transitions) respect
`@media (prefers-reduced-motion)` automatically — animations
collapse to instantaneous transitions when the user has the OS
setting enabled.
