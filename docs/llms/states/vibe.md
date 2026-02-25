# Vibe

> Global singleton for theme/appearance state — mode, style, density, direction, and color palette.

**Package**: `@rokkit/states`
**File**: `vibe.svelte.js`
**Import**: `import { vibe } from '@rokkit/states'`

## Properties (reactive get/set)

```javascript
vibe.mode               // 'light' | 'dark'
vibe.style              // Theme name: 'rokkit' | 'minimal' | 'material' | 'glass' | custom
vibe.density            // 'cozy' | 'compact' | 'comfortable'
vibe.direction          // 'ltr' | 'rtl' (auto-detected from document)
vibe.colors             // Color palette object (get/set)
vibe.colorMap           // Variant → color name mapping
vibe.palette            // Computed CSS variable rules ($derived from colors + colorMap)
vibe.allowedStyles      // Array of allowed style names
vibe.isRTL              // Boolean shortcut
```

## Methods

```javascript
vibe.load(storageKey)         // Load theme from localStorage by key
vibe.save(storageKey)         // Save current theme to localStorage
vibe.update(partial)          // Update multiple properties at once
vibe.detectDirection()        // Re-detect dir from document.documentElement
```

## Examples

### Set theme

```javascript
import { vibe } from '@rokkit/states'

vibe.mode = 'dark'
vibe.style = 'glass'
vibe.density = 'compact'
```

### Persist to localStorage

```javascript
vibe.load('my-app-theme')   // On app init
vibe.save('my-app-theme')   // On change (or automatic via themable action)
```

### Bulk update

```javascript
vibe.update({ mode: 'dark', style: 'minimal', density: 'cozy' })
```

### Use with themable action

```svelte
<div use:themable={{ theme: vibe, storageKey: 'my-theme' }}>
  <!-- sets data-mode, data-style, data-density attributes reactively -->
</div>
```

### Custom color palette

```javascript
vibe.colors = {
  primary: { 50: '#...', 100: '#...', ..., 950: '#...' },
  secondary: { ... },
  // ...
}
vibe.colorMap = { primary: 'primary', surface: 'slate', ... }
// vibe.palette auto-derives CSS variable rules
```

## Notes

- `vibe` is a singleton — import and mutate from anywhere.
- `direction` auto-detects from `document.documentElement.dir` on init.
- `allowedStyles` is used by the theme switcher to validate style names.
- `palette` is `$derived` and recalculates whenever `colors` or `colorMap` changes.
