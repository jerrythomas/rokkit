# @rokkit/app

> App-level controls — theme switching UI and color mode management.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/states, @rokkit/ui
**Depended on by**: application root layouts

## Exports

### Components

| Export | Key Props | Description |
|--------|-----------|-------------|
| `ThemeSwitcherToggle` | modes, icons, showLabels, size, onchange | Three-mode theme toggle (system/light/dark) |

### Classes

| Export | Signature | Description |
|--------|-----------|-------------|
| `ColorModeManager` | `new ColorModeManager(target, initialMode?)` | Bridges three-mode UI (system/light/dark) with Vibe's two-mode store (light/dark). Detects OS preference via matchMedia. |

### Functions

| Export | Signature | Description |
|--------|-----------|-------------|
| `resolveMode(mode)` | `(ColorMode) => 'light' \| 'dark'` | Resolves 'system' to actual OS preference |

### Types

| Export | Definition |
|--------|-----------|
| `ColorMode` | `'system' \| 'light' \| 'dark'` |
| `ResolvedMode` | `'light' \| 'dark'` |

## Key Patterns

### Full theme-switching setup

`ThemeSwitcherToggle` changes the mode; `use:themable` (from `@rokkit/actions`) applies it to the DOM. They are always used together:

```svelte
<!-- +layout.svelte (app root) -->
<script>
  import { vibe } from '@rokkit/states'
  import { themable } from '@rokkit/actions'
  import { ThemeSwitcherToggle, ColorModeManager } from '@rokkit/app'

  // Bridges 3-mode UI (system/light/dark) with vibe's 2-mode store
  const manager = new ColorModeManager(vibe, 'system')
  manager.listen()   // Tracks OS preference when mode is 'system'
</script>

<!-- themable applies data-style / data-mode / data-density to the root -->
<body use:themable={{ theme: vibe, storageKey: 'app-theme' }}>
  <header>
    <ThemeSwitcherToggle
      onchange={(mode) => (manager.mode = mode)}
      showLabels
    />
  </header>
  <slot />
</body>
```

### Icons

Default icons come from `defaultStateIcons.mode.*` in `@rokkit/core` — all three modes use UnoCSS shortcuts registered as `mode-system`, `mode-light`, `mode-dark`. Override any via the `icons` prop:

```svelte
<ThemeSwitcherToggle icons={{ system: 'i-custom:monitor' }} />
```

### ColorModeManager standalone

```javascript
import { ColorModeManager } from '@rokkit/app'
import { vibe } from '@rokkit/states'

const manager = new ColorModeManager(vibe, 'system')
manager.listen()           // Listen for OS preference changes
manager.mode = 'dark'      // Update mode, syncs to vibe
```
