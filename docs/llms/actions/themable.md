# themable

> Applies `data-style`, `data-mode`, and `data-density` attributes from a Vibe state object, with optional localStorage persistence.

**Package**: `@rokkit/actions`
**File**: `themable.svelte.js`

## Usage

```svelte
<div use:themable={{ theme: vibe, storageKey: 'app-theme' }}>
  <!-- All @rokkit/ui components inside inherit the theme -->
</div>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `Vibe` | — | Vibe instance from `@rokkit/states` |
| `storageKey` | `string` | — | localStorage key to persist theme |

## Attributes Applied

| Attribute | Value | Source |
|-----------|-------|--------|
| `data-style` | `vibe.style` | e.g. `'rokkit'`, `'minimal'` |
| `data-mode` | `vibe.mode` | `'light'` or `'dark'` |
| `data-density` | `vibe.density` | `'cozy'`, `'compact'`, `'comfortable'` |

## Example

```svelte
<script>
  import { vibe } from '@rokkit/states'
  import { themable } from '@rokkit/actions'

  vibe.mode = 'dark'
  vibe.style = 'glass'
</script>

<main use:themable={{ theme: vibe, storageKey: 'my-app-theme' }}>
  <App />
</main>
```

## Notes

- Reactively updates attributes when `vibe` properties change.
- `storageKey` saves to localStorage on change; loads on mount.
- Used by `@rokkit/app`'s `ThemeSwitcherToggle` internally.
