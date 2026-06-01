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

## The navigator pattern

Rokkit's interactivity is built on two composable primitives:

- **Controllers** — pure state machines (`ListController`,
  `NestedController`, etc.) with no DOM dependency.
- **`navigator` action** — a Svelte action that binds a
  controller to a container element, attaches keyboard
  handlers, and manages ARIA attributes.

The separation means you can use a controller in tests **without
a browser**, and swap the visual rendering without touching the
interaction logic.

```svelte
<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  const controller = new ListController(items)
</script>

<ul use:navigator={controller}>
  {#each controller.flatView as node (node.key)}
    <li
      data-path={node.key}
      data-active={node.proxy.value === controller.value || undefined}
    >
      {node.proxy.label}
    </li>
  {/each}
</ul>
```

That's the entire interaction layer for an arrow-key-navigable
list. Same controller powers `List`, `Menu`, and
`MultiSelect` internally.

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
