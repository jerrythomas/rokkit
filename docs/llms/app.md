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

### Theme Switcher

```svelte
<script>
  import { ThemeSwitcherToggle } from '@rokkit/app'
</script>

<ThemeSwitcherToggle modes={['system', 'light', 'dark']} showLabels size="md" />
```

### ColorModeManager

```javascript
import { ColorModeManager } from '@rokkit/app'
import { vibe } from '@rokkit/states'

const manager = new ColorModeManager(vibe, 'system')
manager.listen()           // Listen for OS preference changes
manager.mode = 'dark'      // Update mode, syncs to vibe
```
