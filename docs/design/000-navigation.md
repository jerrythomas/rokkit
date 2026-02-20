# Navigation System Design

> Architecture and analysis of Rokkit's data-driven navigation and keyboard handling

## Overview

The `@rokkit/actions` package implements a layered, data-driven approach to navigation:

```
navigable (Simple/Foundational)
    ↓ Emits CustomEvents (previous, next, select, expand, collapse)

navigator (Advanced/Full-Featured)
    ↓ Integrates with ListController/NestedController
    ↓ Manages state, scrolling, complex event mapping
```

## Core Components

### navigable.svelte.js (Simple Foundation)

Low-level keyboard-to-event mapper for basic navigation.

**Data-Driven Options:**
```javascript
{
  orientation: 'vertical' | 'horizontal',  // Arrow key meaning
  dir: 'ltr' | 'rtl',                      // Text direction
  nested: boolean,                          // Enable expand/collapse
  enabled: boolean                          // Toggle on/off
}
```

**Emitted Events:**
- `previous`, `next` - Directional navigation
- `first`, `last` - Jump navigation
- `select` - Item selection
- `expand`, `collapse`, `toggle` - Hierarchy control (when nested)

### navigator.svelte.js (Full Integration)

Complete navigation controller with state management.

**Key Features:**
1. **Smart Scrolling** - `scrollFocusedIntoView()` with fallback strategies
2. **Event Mapping** - Differentiates click vs keyboard
3. **Modifier Keys** - Ctrl/Cmd + keys for extended selection
4. **State Coordination** - Works with ListController/NestedController

**Event Map:**
```javascript
EVENT_MAP = {
  first: ['move'],
  last: ['move'],
  previous: ['move'],
  next: ['move'],
  select: ['move', 'select'],    // Click fires both
  extend: ['move', 'select'],    // Multi-select
  collapse: ['toggle'],
  expand: ['toggle'],
  toggle: ['toggle']
}
```

### kbd.js (Keyboard Configuration)

Central keyboard configuration with smart direction handling:

| Context | ArrowUp | ArrowDown | ArrowLeft | ArrowRight |
|---------|---------|-----------|-----------|------------|
| Vertical, LTR | previous | next | collapse* | expand* |
| Vertical, RTL | previous | next | expand* | collapse* |
| Horizontal, LTR | - | - | previous | next |
| Horizontal, RTL | - | - | next | previous |

*Only when `nested: true`

## State Controllers

### ListController (Flat Selection)

```javascript
class ListController {
  selectedKeys: SvelteSet       // Selected item identifiers
  focusedKey: string            // Currently focused item
  
  moveNext() / movePrev()       // Directional navigation
  moveFirst() / moveLast()      // Jump navigation
  select(key)                   // Set selection
  extendSelection(key)          // Multi-select support
}
```

### NestedController (Hierarchical)

```javascript
class NestedController extends ListController {
  ensureVisible(value)          // Expand parents to show item
  toggleExpansion(key)          // Toggle node expansion
  expand(key) / collapse(key)   // Explicit control
}
```

## Usage in Components

### List
```svelte
<div use:navigator={{ wrapper }} onaction={handleAction}>
```
- Uses ListController
- Vertical navigation (default)

### Tree
```svelte
<div use:navigator={{ wrapper, nested: true }} onaction={handleAction}>
```
- Uses NestedController
- Includes expand/collapse

### Tabs
```svelte
<div use:navigator={{ wrapper, orientation: 'horizontal' }} onaction={handleAction}>
```
- Uses ListController
- Horizontal navigation

## Strengths

1. **Data-Driven Design** - Orientation, direction, nesting from options
2. **Comprehensive Keyboard Support** - Home, End, modifiers, RTL
3. **Smart Event Mapping** - Differentiates click vs keyboard
4. **State Integration** - Clean separation between action and state
5. **Scrolling Implemented** - `scrollFocusedIntoView()` with fallbacks
6. **Framework Agnostic** - Works with any element/state system

## Identified Gaps

### Gap 1: Scroll-to-Active Not Automatic on Init

**Current**: Scrolls only on keyboard navigation
**Missing**: No scroll on initial value binding or programmatic changes

**Solution**:
```javascript
// Add to component
$effect(() => {
  if (value && scrollOnBind) {
    wrapper.scrollFocusedIntoView()
  }
})
```

### Gap 2: RTL Not Exposed in UI Components

**Current**: kbd.js supports RTL, but components don't pass `dir`
**Missing**: No way to enable RTL in List/Tree/Tabs

**Solution**:
```svelte
<List options={data} dir="rtl" />
<!-- Passes to navigator -->
use:navigator={{ wrapper, dir }}
```

### Gap 3: No Scroll Behavior Customization

**Current**: Hard-coded `{ behavior: 'smooth', block: 'nearest' }`
**Missing**: Can't customize scroll position or disable smooth scroll

**Solution**:
```javascript
navigator(node, { 
  wrapper,
  scrollBehavior: { behavior: 'auto', block: 'center' }
})
```

### Gap 4: No Virtualization Support

**Current**: Queries DOM for element by key
**Missing**: Virtual lists don't have all items in DOM

**Solution**: Provide scroll position calculation based on index

### Gap 5: No Focus Visual Management

**Current**: Sets `aria-current` but no focus ring styles
**Missing**: Consistent focus indicators

**Solution**: Add `data-focused` attribute, provide theme styles

### Gap 6: Limited Tree Navigation

**Current**: Home/End go to absolute first/last
**Missing**: Sibling navigation, parent navigation

**Solution**:
- `moveToFirstSibling()` / `moveToLastSibling()`
- `moveToPrevParent()` / `moveToNextParent()`
- Map to Alt+Home, Alt+End, etc.

### Gap 7: No Escape Key Behavior

**Current**: No standardized escape handling
**Missing**: Collapse current or blur container

**Solution**: Add escape support to navigator options

## Comparison with bits-ui

| Aspect | Rokkit Actions | bits-ui |
|--------|----------------|---------|
| Data-Driven | Yes (options configure behavior) | Less flexible |
| RTL Support | Built-in | Built-in |
| Scroll Focus | Manual trigger | Auto in some components |
| State Management | External controllers | Internal |
| Customization | Field mapping + snippets | Less data-driven |
| Testing | Easy (separated concerns) | Harder (coupled) |

## Implementation Priority

1. **High**: Scroll-to-active on value binding
2. **High**: RTL exposure in components
3. **Medium**: Scroll behavior customization
4. **Medium**: Enhanced tree navigation
5. **Low**: Virtualization support
6. **Low**: Focus visual management

## Files Reference

- `/packages/actions/src/navigable.svelte.js` - Simple event emitter
- `/packages/actions/src/navigator.svelte.js` - Full integration
- `/packages/actions/src/keyboard.svelte.js` - Custom mappings
- `/packages/actions/src/kbd.js` - Configuration
- `/packages/states/src/list-controller.svelte.js` - Flat state
- `/packages/states/src/nested-controller.svelte.js` - Tree state
