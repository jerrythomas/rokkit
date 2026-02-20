# @rokkit/actions

> Svelte actions for keyboard navigation, gestures, theming, and DOM interactions.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, ramda
**Depended on by**: application components (and @rokkit/ui per ADR-003)

## Exports

### navigator

High-level navigation action: keyboard + click events, focus/selection management, scroll-into-view.

```svelte
<div use:navigator={{ wrapper: controller, direction: 'vertical' }}
     on:action={(e) => handle(e.detail.name, e.detail.data)}>
```

**Options**: `{ wrapper: Controller, enabled: boolean, direction: 'vertical'|'horizontal', multiselect: boolean }`

**Keyboard**: ArrowUp/Down → move, ArrowLeft/Right → collapse/expand, Enter → select, Escape → deselect, Home/End → first/last

**Actions emitted**: `move`, `select`, `toggle`

### keyboard

Captures keyboard and click events, dispatches custom events by key mapping.

```svelte
<div use:keyboard on:remove on:submit on:add={(e) => console.log(e.detail)}>
```

**Default mappings**: `{ remove: ['Backspace','Delete'], submit: ['Enter'], add: /^[a-zA-Z]$/ }`

### navigable

Simplified keyboard navigation — emits directional events without requiring a controller.

```svelte
<div use:navigable on:previous on:next on:expand on:collapse on:select>
```

### dismissable

Closes element on outside click or Escape key.

```svelte
<div use:dismissable on:dismiss={() => open = false}>
```

### swipeable

Touch and mouse swipe gestures.

```svelte
<div use:swipeable={{ horizontal: true, threshold: 50 }}
     on:swipeLeft on:swipeRight>
```

**Options**: `{ horizontal: boolean, vertical: boolean, threshold: number, enabled: boolean, minSpeed: number }`

### pannable

Pan/drag gestures with coordinate tracking.

```svelte
<div use:pannable on:panstart on:panmove={(e) => e.detail.dx} on:panend>
```

**Event detail**: `{ x, y, dx, dy }`

### themable

Applies theme attributes and persists to localStorage.

```svelte
<div use:themable={{ theme: vibe, storageKey: 'app-theme' }}>
```

Sets `data-style`, `data-mode`, `data-density` attributes.

### skinnable

Applies CSS variables to element inline styles.

```svelte
<div use:skinnable={{ '--primary': '#ff0000' }}>
```

### fillable

Interactive fill-in-the-blank action for educational content.

```svelte
<div use:fillable={fillOptions} on:fill on:remove>
```

### delegateKeyboardEvents

Forwards keyboard events from parent to child element.

```svelte
<div use:delegateKeyboardEvents={{ selector: 'input', events: ['keydown'] }}>
```

## Key Patterns

### Navigation with Controller

```svelte
<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  let controller = new ListController(items, null, fields)
</script>

<div use:navigator={{ wrapper: controller }} on:action={(e) => {
  if (e.detail.name === 'select') handleSelect(e.detail.data.value)
}}>
  {#each controller.data as row (row.key)}
    <div data-path={row.key}>{row.value.text}</div>
  {/each}
</div>
```

### Modal Pattern

```svelte
<div use:themable={{ theme: vibe }} use:dismissable on:dismiss={() => open = false}>
  <div role="dialog"><!-- content --></div>
</div>
```

## Internal (not exported but notable)

| Module | What | Notes |
|--------|------|-------|
| `kbd.js` | `getKeyboardAction()`, `defaultNavigationOptions` | Key → action mapping |
| `utils.js` | `getClosestAncestorWithAttribute()`, `getPathFromEvent()` | DOM helpers |
| `lib.js` | `EventManager()`, `setupListeners()` | Event lifecycle management |
| `types.js` | TypeScript definitions | Controller interface, option types |
