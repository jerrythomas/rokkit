## Pin a subtree to a fixed color mode

`LockMode` wraps its children in a `<div>` that holds `data-mode`
fixed — dark or light — regardless of what the surrounding page is
set to. The preset's token rules key off `[data-mode="dark"]` and
`:root, [data-mode="light"]`, so every CSS custom property (`--paper`,
`--ink`, `--accent`, …) resolves to the locked mode's values inside
the wrapper.

```svelte
<script>
  import { LockMode } from '@rokkit/ui'
</script>

<!-- Always dark, even on a light page -->
<LockMode mode="dark">
  <div class="my-card">Dark surface here</div>
</LockMode>

<!-- Always light, even on a dark page -->
<LockMode mode="light">
  <div class="my-card">Light surface here</div>
</LockMode>
```

## How it works

Under the hood `LockMode` renders `<div data-mode={mode} use:lockMode={mode}>`.
The `lockMode` Svelte action mirrors the document root's
`data-style` / `data-skin` / `data-density` onto the element via a
`MutationObserver`, then hard-sets `data-mode` back to the locked
value. This means:

- Theme switching (style, skin, density) flows through normally.
- Mode is pinned — the observer keeps overwriting any change.

## Use cases

- **Dark hero on a light page** — place a dramatic dark banner without
  flipping the whole page.
- **Light card in a dark app** — keep a form or data-entry surface
  always-light for readability.
- **Side-by-side mode comparison** — render both modes simultaneously
  to audit contrast or visual parity during design.
