# Navigator + Wrapper + Keymap Design

> Clean three-layer keyboard/mouse navigation for all interactive list-like components.

---

## Overview

All interactive components in Rokkit that present a list of items — `List`, `Tree`, `Menu`, `Select`,
`MultiSelect`, `Tabs`, `Toolbar`, `Combobox` — share the same interaction model: items have paths,
keyboard and mouse events map to semantic actions, and a state controller reacts to those actions.

This design captures the architecture of the three-layer system built as a POC in
`sites/learn/src/lib/list/` before promotion to `packages/`.

```
DOM events (keyboard, click, focusin, focusout)
          │
          ▼
    ┌─────────────┐
    │  Navigator  │  Handles DOM events, resolves data-path, dispatches to Wrapper
    └──────┬──────┘
           │  wrapper[action](path)
           ▼
    ┌─────────────┐
    │   Wrapper   │  Interface contract — base class or adapter
    └──────┬──────┘
           │  controller methods
           ▼
    ┌────────────────────┐
    │ ListController /   │  Manages focus, selection, expansion state (Svelte $state)
    │ NestedController   │
    └────────────────────┘
```

The key design principle: **Navigator is dumb**. It only translates DOM events into semantic action
calls. It does not manage state. The Wrapper owns the bridge between Navigator calls and state.

---

## Layer 1: Keymap (`keymap.js`)

Maps keyboard input to named semantic actions, parameterized by orientation, direction, and
whether the component has collapsible groups.

### Actions

```js
export const ACTIONS = Object.freeze({
  next:     'next',     // focus next visible item
  prev:     'prev',     // focus previous visible item
  first:    'first',    // jump to first visible item
  last:     'last',     // jump to last visible item
  expand:   'expand',   // expand collapsed group (or move to first child if already open)
  collapse: 'collapse', // collapse expanded group (or move to parent if collapsed/leaf)
  select:   'select',   // activate the focused item
  extend:   'extend',   // toggle individual selection (Ctrl/Cmd + click or space)
  range:    'range',    // select contiguous range (Shift + click or space)
  cancel:   'cancel',   // Escape — close dropdown, clear selection, dismiss overlay
})
```

### Key Layers

Three modifier layers keep dispatch simple:

| Layer   | Condition                      | Example bindings |
|---------|-------------------------------|-----------------|
| `plain` | No modifiers (or Shift alone for caps) | ArrowDown, Enter, Space, Home, End, Escape |
| `shift` | Shift only                     | Shift+Space → range |
| `ctrl`  | Ctrl or Meta (Cmd)             | Ctrl+Space → extend, Ctrl+Home → first |

### Orientation Variants

| Orientation     | prev       | next        | collapse    | expand      |
|----------------|------------|-------------|-------------|-------------|
| `vertical`      | ArrowUp    | ArrowDown   | ArrowLeft   | ArrowRight  |
| `horizontal-ltr`| ArrowLeft  | ArrowRight  | ArrowUp     | ArrowDown   |
| `horizontal-rtl`| ArrowRight | ArrowLeft   | ArrowUp     | ArrowDown   |

`collapse` / `expand` keys are only registered when `collapsible: true`.

### API

```js
// Build a keymap for given options (memoizable — only rebuild on prop change)
const keymap = buildKeymap({
  orientation: 'vertical',   // 'vertical' | 'horizontal'
  dir: 'ltr',                // 'ltr' | 'rtl'
  collapsible: false         // whether to add collapse/expand key bindings
})

// Resolve action from a KeyboardEvent (returns null for unbound keys)
const action = resolveAction(event, keymap)
```

---

## Layer 2: Wrapper (`wrapper.js`)

The `Wrapper` base class defines the interface the Navigator calls. Every method has a **uniform
signature**: it receives `path` (a `string | null`). This makes dispatch trivial:
`wrapper[action](path)` for every action.

### Method Groups

**Selection actions** — use the explicit `path`, fall back to `focusedKey` when null:

| Method | Purpose |
|--------|---------|
| `select(path)` | Activate/select item at path |
| `extend(path)` | Toggle individual selection (multiselect Ctrl+click) |
| `range(path)` | Select contiguous range from anchor to path (Shift+click) |
| `toggle(path)` | Flip expansion state of group at path (accordion click) |
| `moveTo(path)` | Sync focused state to path (called on focusin, typeahead result) |
| `blur()` | Focus left the component entirely |
| `cancel(path)` | Escape pressed — close dropdown, deselect, dismiss |

**Movement actions** — `path` is passed through but ignored (use internal `focusedKey`):

| Method | Purpose |
|--------|---------|
| `next(_path)` | Move focus to next visible item |
| `prev(_path)` | Move focus to previous visible item |
| `first(_path)` | Move focus to first visible item |
| `last(_path)` | Move focus to last visible item |
| `expand(_path)` | Expand focused group (or enter if already expanded) |
| `collapse(_path)` | Collapse focused group (or move to parent) |

**State read by Navigator:**

| Property | Type | Purpose |
|----------|------|---------|
| `focusedKey` | `string \| null` | Key of currently focused item — Navigator reads this after keyboard actions to scroll matching `[data-path]` element into view |

**Typeahead support:**

```js
findByText(query, startAfterKey)
  // Return key of first visible item whose text starts with query (case-insensitive).
  // startAfterKey allows cycling through multiple matches.
  // Returns null if no match.
```

### Why Uniform Signature?

The Navigator resolves the current path from `document.activeElement` (keyboard events) or
`event.target` (click events) and passes it to **all** actions uniformly:

```js
this.#dispatch(action, path)   // always wrapper[action]?.(path)
```

Movement methods receive path but ignore it — they use `focusedKey` internally via the controller.
Selection methods use the provided path (and fall back to `focusedKey` when it's null, e.g. if
keyboard focus is on the container rather than a specific item).

This keeps the Navigator free of branching logic about which actions need paths and which don't.

---

## Layer 3: Navigator (`navigator.js`)

`Navigator` is a plain class that attaches to a **root element** and translates DOM events into
`wrapper[action](path)` calls. It also handles scrolling and typeahead.

### Constructor

```js
const nav = new Navigator(root, wrapper, {
  orientation: 'vertical',  // passed to buildKeymap
  dir: 'ltr',
  collapsible: false
})
```

Four event listeners are attached to `root`: `keydown`, `click`, `focusin`, `focusout`.

### Event Handling

**`keydown`:**
1. Try typeahead — if consumed, return
2. Resolve action via keymap (null → return)
3. Special case: links (`a[href]`) handle Enter/Space natively — skip `select` action for them
4. `preventDefault()` + `stopPropagation()`
5. Resolve current path from `document.activeElement`
6. `wrapper[action](path)`
7. `scrollFocusedIntoView()`

**`click`:**
1. Walk up from `event.target` to find nearest `[data-path]` element
2. If none found → ignore
3. Determine action: `range` (Shift), `extend` (Ctrl/Meta), `toggle` (`[data-accordion-trigger]`), `select`
4. For non-links: `preventDefault()` (browser already handles link navigation)
5. `wrapper[action](path)`
6. No scroll — user clicked where they wanted

**`focusin`:**
- If event target has a `data-path` → `wrapper.moveTo(path)`
- If target is the container itself (user tabbed in):
  - Redirect to `wrapper.focusedKey` element if set, otherwise first `[data-path]` item
  - Call `.focus()` on that element; the re-fired `focusin` is handled by the first branch

**`focusout`:**
- If `event.relatedTarget` is null or outside `root` → `wrapper.blur?.()`
- If focus moved to another item inside `root` → ignore (internal navigation)

### ScrollIntoView

After any keyboard action (movement, selection, typeahead match), Navigator scrolls the focused
element into view:

```js
#scrollFocusedIntoView() {
  const key = this.#wrapper.focusedKey
  if (!key) return
  const el = this.#root.querySelector(`[data-path="${key}"]`)
  el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
}
```

- Not called on click (user can see what they clicked)
- Not called on focusin (tab-in should not cause scroll jumps)
- `?.` optional chaining on `scrollIntoView` for JSDOM compatibility in unit tests

### Typeahead

Printable character keys (length 1, no modifier, not Space) trigger typeahead search:

1. Append char to `#buffer`
2. Cancel previous reset timer; start new 500ms timer
3. `wrapper.findByText(buffer, startAfterKey)` where `startAfterKey` is `focusedKey` on first char, null when accumulating (to search from beginning)
4. If match → `wrapper.moveTo(matchKey)` + scroll

The timer only resets the buffer — it does NOT cancel mid-accumulation. Pressing 'l' then 'i' quickly sends `"l"` then `"li"` to `findByText`; after 500ms of silence the buffer clears for the next typeahead.

### Data-Path Resolution

```js
function getPath(target, root) {
  let el = target
  while (el && el !== root) {
    if (el.dataset?.path !== undefined) return el.dataset.path
    el = el.parentElement
  }
  return null
}
```

Walks up the DOM from the event target to find the nearest element with `data-path`. This handles
clicks on child elements (e.g. an icon inside a button that has `data-path`).

### Accordion Trigger

Elements with `data-accordion-trigger` signal that a click should dispatch `toggle` instead of
`select`. This allows group headers to expand/collapse without also being "selected".

```html
<button data-path="0" data-accordion-trigger>Elements</button>
```

### Svelte Action Adapter

```js
export function navigator(node, options) {
  const { wrapper, ...navOptions } = options
  const nav = new Navigator(node, wrapper, navOptions)
  return { destroy: () => nav.destroy() }
}
```

Usage in Svelte templates:

```svelte
<nav use:navigator={{ wrapper, collapsible }}>
  ...items...
</nav>
```

---

## Layer 4: ListWrapper (`list-wrapper.js`)

`ListWrapper` bridges the Wrapper interface to `NestedController` (or `ListController` for flat
lists). It subclasses `Wrapper` and delegates all calls to the controller.

```
Navigator calls  →  ListWrapper translates  →  Controller methods
```

### Method Mapping

| Wrapper method | Controller call |
|----------------|----------------|
| `next(_path)` | `controller.moveNext()` |
| `prev(_path)` | `controller.movePrev()` |
| `first(_path)` | `controller.moveFirst()` |
| `last(_path)` | `controller.moveLast()` |
| `expand(_path)` | `controller.expand()` — uses internal focusedKey |
| `collapse(_path)` | `controller.collapse()` — uses internal focusedKey |
| `select(path)` | `controller.select(path)` |
| `extend(path)` | `controller.extendSelection(path)` |
| `range(path)` | `controller.selectRange(path)` |
| `toggle(path)` | `controller.toggleExpansion(path)` |
| `moveTo(path)` | `controller.moveTo(path)` |
| `blur()` | component-specific (e.g. close dropdown) |
| `cancel(path)` | component-specific (e.g. close dropdown, clear selection) |
| `findByText(q, k)` | `controller.findByText(q, k)` |
| `focusedKey` | `controller.focusedKey` (getter) |

### Usage in a Component

```svelte
<script>
  import { NestedController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'  // new navigator
  import { ListWrapper } from '@rokkit/states'  // bridge class

  let { items, fields, value, collapsible, onselect } = $props()

  const controller = untrack(() => new NestedController(items, value, fields, {}))
  const wrapper = new ListWrapper(controller, {
    onselect: (key) => {
      const item = controller.lookup.get(key)
      onselect?.(item.value)
    }
  })
</script>

<nav use:navigator={{ wrapper, collapsible }}>
  {#each controller.data as node (node.key)}
    <!-- render items with data-path={node.key} -->
  {/each}
</nav>
```

### Why Not Subclass NestedController?

`NestedController` is a Svelte `$state` class that manages data. `ListWrapper` is a DOM adapter
that translates event calls. Keeping them separate means:

- Controllers can be used without a DOM (in tests, server-side)
- ListWrapper can wrap any compatible controller (not locked to NestedController)
- Different components can share a controller but have different blur/cancel behavior

---

## Composite Widget Pattern

Dropdown components (Menu, Select, MultiSelect, Combobox) have two interactive parts:

```
┌──────────────────────────┐
│  Trigger (always present) │  button/input that opens the dropdown
│  ├── click → open()       │
│  ├── Enter/Space → open() │
│  └── Escape → close()     │
└──────────────────────────┘
         ↕ shared Wrapper
┌──────────────────────────┐
│  Dropdown (when open)     │  list of options
│  └── use:navigator        │  ← Navigator attached HERE only
└──────────────────────────┘
```

**The Wrapper is the coordination point** between the two halves:

```js
class MenuWrapper extends ListWrapper {
  #open = $state(false)

  // Called by trigger
  open() {
    this.#open = true
    // re-attach navigator to dropdown container
  }

  // Called by trigger or navigator (Escape)
  close() {
    this.#open = false
    this.#triggerEl?.focus()  // return focus to trigger
  }

  // Wrapper.cancel() called by Navigator on Escape
  cancel(_path) {
    this.close()
  }

  // Wrapper.blur() called by Navigator when focus leaves dropdown
  blur() {
    this.close()
  }
}
```

This pattern gives full coverage with no special casing in Navigator:

| Component | Trigger | Navigator | Wrapper subclass |
|-----------|---------|-----------|-----------------|
| List | (none — persistent) | on root element | `ListWrapper` |
| Tree | (none — persistent) | on root element | `ListWrapper` |
| Menu | `<button>` | on dropdown `<ul>` | `MenuWrapper` |
| Select | `<button>` | on dropdown `<ul>` | `SelectWrapper` |
| MultiSelect | `<button>` | on dropdown `<ul>` | `MultiSelectWrapper` |
| Tabs | (tab list is always visible) | on `[role=tablist]` | `ListWrapper` |
| Toolbar | (toolbar is always visible) | on `[role=toolbar]` | `ListWrapper` |
| Combobox | `<input>` | on dropdown `<ul>` | `ComboboxWrapper` |

---

## DOM Conventions

### `data-path`

Every focusable item in the list MUST have a `data-path` attribute containing its key:

```html
<button data-path="0">Group</button>
<a href="/list" data-path="0-0">List</a>
<button data-path="1">Introduction</button>
```

Path format: `"0"`, `"1"`, `"0-0"`, `"0-1"`, `"1-0-2"` — dash-separated indices matching the
item's position in the nested data structure.

### `data-accordion-trigger`

Group headers that should toggle expansion on click (not select):

```html
<button data-path="0" data-accordion-trigger aria-expanded={isExpanded}>
  Elements
</button>
```

Without this attribute, clicking the element dispatches `select`. With it, clicking dispatches
`toggle`.

### Container `tabindex="-1"`

The root container should have `tabindex="-1"` so it can receive programmatic focus (when
redirecting from `focusin` on the container) without appearing in the natural tab order:

```html
<nav tabindex="-1" use:navigator={{ wrapper, collapsible }}>
```

Items managed with roving tabindex get `tabindex="0"` on the focused item, `tabindex="-1"` on
others. The component (not Navigator) manages `tabindex` attributes.

---

## Testing

### Unit Testing Navigator

Because `Navigator` is a plain class, it can be tested against a real JSDOM with a `MockWrapper`:

```js
class MockWrapper {
  focusedKey = null
  calls = []
  // ... record all action calls
}

const wrapper = new MockWrapper()
const nav = new Navigator(dom.root, wrapper, { collapsible: true })

// Fire DOM events and assert wrapper.calls
keydown(dom.btn1, 'ArrowDown')
expect(wrapper.lastCall()).toEqual({ action: 'next', path: '1' })
```

Key test patterns:
- `wrapper.reset()` **after** `.focus()` — focusin fires moveTo before the test assertion
- `wrapper.focusedKey = null` **after** `.focus()` — focusin sets it; test must override after
- `vi.useFakeTimers()` for typeahead reset timeout testing

### Unit Testing Keymap

`buildKeymap` and `resolveAction` are pure functions, trivially testable without DOM:

```js
const km = buildKeymap({ orientation: 'vertical', collapsible: true })
const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
expect(resolveAction(event, km)).toBe('next')
```

---

## Migration from Old Navigator

The existing `@rokkit/actions` navigator uses a different pattern:

| Aspect | Old navigator | New Navigator |
|--------|--------------|---------------|
| Dispatch | Emits `'action'` custom event | Calls `wrapper[action](path)` directly |
| Scroll | After keyboard navigation | After keyboard navigation (same) |
| Keymap | Inline in `kbd.js` | Separate `keymap.js` module |
| Wrapper | Called `wrapper`, ad-hoc interface | Explicit `Wrapper` base class |
| Typeahead | Not implemented | Built-in with buffer + timeout |
| Escape / cancel | Not handled | `cancel` action |
| click on accordion | `toggle` via `data-accordion-trigger` | Same |
| Testing | Hard (events + component coupling) | Easy (plain class + MockWrapper) |

Migration path for each component:
1. Create a `XxxWrapper extends ListWrapper` for component-specific `blur`/`cancel`
2. Replace `use:navigator` (old) with new `navigator` action
3. Remove custom `onaction` event listener — wrapper handles state directly
4. Keep `data-path` attributes unchanged

---

## Files Reference

**Implementation (in `packages/testbed/src/`):**

| File | Tests | Status |
|------|-------|--------|
| `navigator/keymap.js` | `keymap.spec.js` (32 tests) | ✅ 100% coverage |
| `navigator/wrapper.js` | `wrapper.spec.js` (17 tests) | ✅ 100% coverage |
| `navigator/navigator.js` | `navigator.spec.js` (49 tests) | ✅ 100% coverage |
| `proxy/proxy.svelte.js` | `proxy.spec.svelte.js` (78 tests) | ✅ 100% coverage |
| `constants.js` | (covered by above) | ✅ |
| `types.ts` | (TypeScript interfaces, no runtime code) | ✅ |
| `wrapper/list-wrapper.svelte.js` | `list-wrapper.spec.svelte.js` | 🔨 In progress |
| `ui/List.svelte` | — | 🔨 In progress |

**Promotion plan (when design is proven):**
- `Wrapper`, `Navigator`, `keymap` → `packages/actions/src/`
- `ProxyItem`, `buildProxyList`, `buildFlatView` → `packages/states/src/`
- `ListWrapper` → `packages/states/src/`
- `List.svelte` → `packages/ui/src/components/List.svelte` (replacing old impl)
