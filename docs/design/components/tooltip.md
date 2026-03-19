# Tooltip

> Contextual text revealed on hover or focus, implemented as a Svelte action or wrapper component.

---

## Overview

Tooltip is available in two forms: a `use:tooltip` action for attaching to any existing element,
and a `<Tooltip>` wrapper component for declarative use. Both forms share the same positioning
engine, delay logic, and ARIA wiring.

Show is triggered by `mouseenter` or `focusin`. Hide is triggered by `mouseleave` or `focusout`.
A configurable delay (default 300ms) prevents tooltip flicker during mouse traversal. The delay
applies to show only — hide is immediate.

Position is one of `top`, `bottom`, `left`, `right`. The component auto-flips to the opposite
side when the preferred position would overflow the viewport. At viewport corners, it prefers
the axis with more room.

---

## Anatomy

```html
<!-- Wrapper component -->
<span data-tooltip-root>
  <button data-tooltip-trigger aria-describedby="tt-id">Trigger content</button>
  <div
    data-tooltip-content
    data-tooltip-position="top"
    data-tooltip-visible="true"
    id="tt-id"
    role="tooltip"
  >
    Tooltip text
  </div>
</span>

<!-- Action form — tooltip content is appended to the trigger's nearest positioned ancestor -->
<button data-tooltip-trigger aria-describedby="tt-id">Trigger content</button>
<div
  data-tooltip-content
  data-tooltip-position="top"
  data-tooltip-visible="false"
  id="tt-id"
  role="tooltip"
>
  Tooltip text
</div>
```

`data-tooltip-visible` is `"true"` while the tooltip is showing and `"false"` (or absent)
otherwise. Theme CSS drives the show/hide transition via this attribute — the component
never toggles `display: none` directly, leaving the animation strategy to the theme.

---

## Action API

```typescript
// use:tooltip
interface TooltipOptions {
  content: string              // Tooltip text
  position?: 'top' | 'bottom' | 'left' | 'right'  // Default: 'top'
  delay?: number               // Show delay in ms; default: 300
}

// Usage
<button use:tooltip={{ content: 'Save document', position: 'bottom' }}>
  Save
</button>
```

The action creates the tooltip element, manages its lifecycle, and removes it when the
element is destroyed or the action is destroyed. Updating options reactively is supported —
passing a new `content` string updates the rendered text without recreating the element.

---

## Component API

```typescript
interface TooltipProps {
  content?: string // Tooltip text (alternative: use children on content snippet)
  position?: 'top' | 'bottom' | 'left' | 'right' // Default: 'top'
  delay?: number // Show delay in ms; default: 300
  class?: string // CSS class on data-tooltip-root
  children?: Snippet // Trigger element(s)
  tooltipContent?: Snippet // Rich tooltip content (overrides `content` string)
}
```

```svelte
<!-- String content -->
<Tooltip content="Save document" position="bottom">
  <button>Save</button>
</Tooltip>

<!-- Rich content via snippet -->
<Tooltip position="top">
  {#snippet tooltipContent()}
    <strong>Keyboard shortcut:</strong> Ctrl+S
  {/snippet}
  <button>Save</button>
</Tooltip>
```

---

## Data Attributes

| Attribute               | Element  | Notes                                                                                 |
| ----------------------- | -------- | ------------------------------------------------------------------------------------- |
| `data-tooltip-root`     | `<span>` | Wrapper component root; absent in action form                                         |
| `data-tooltip-trigger`  | Trigger  | Applied to the element that activates the tooltip                                     |
| `data-tooltip-content`  | Tooltip  | The tooltip bubble element                                                            |
| `data-tooltip-position` | Tooltip  | `"top"`, `"bottom"`, `"left"`, or `"right"`; reflects actual position after auto-flip |
| `data-tooltip-visible`  | Tooltip  | `"true"` when visible, `"false"` when hidden                                          |

---

## CSS Custom Properties

| Property          | Default | Purpose                                                 |
| ----------------- | ------- | ------------------------------------------------------- |
| `--tooltip-delay` | `300ms` | Show delay; overrides the `delay` prop at the CSS layer |

The `delay` prop and `--tooltip-delay` are independent controls. The prop configures the
JavaScript timer; the CSS property can be used for CSS-driven transition delays. For most
cases, set `delay` on the action/component and leave `--tooltip-delay` to the theme.

---

## Accessibility

- `role="tooltip"` on the content element satisfies the WAI-ARIA tooltip pattern.
- `aria-describedby` on the trigger element links it to the tooltip by `id`. This means
  the tooltip text is announced by screen readers when the trigger receives focus, without
  being read as part of the trigger's label.
- The tooltip element itself is not focusable — it is purely descriptive. Interactive
  content (links, buttons) must not be placed inside a tooltip; use a popover instead.
- `data-tooltip-visible="false"` keeps the element in the DOM but hidden visually. Theme CSS
  should use `visibility: hidden` or `opacity: 0` rather than `display: none` to preserve
  the layout anchor and allow CSS transitions. Screen readers should not announce hidden
  tooltips; ensure `[data-tooltip-visible="false"]` also sets `visibility: hidden` which
  removes the element from the accessibility tree in most browsers.
- Tooltip does not trap focus. It is dismissed immediately on `focusout` from the trigger.

---

## Design Notes

**Action-first, component second.** The `use:tooltip` action is the primary implementation.
The `<Tooltip>` wrapper component is a thin declarative shell around the same action. This
means the positioning and ARIA logic lives in one place, and the wrapper does not duplicate it.

**No portal by default.** The tooltip element is appended to the trigger's nearest positioned
ancestor rather than `document.body`. This keeps tooltip DOM colocated with its trigger,
avoids z-index stacking context issues in most layouts, and makes SSR safer. An `appendTo`
option can be added when portal behavior is required.

**Auto-flip is position-aware.** `data-tooltip-position` reflects the position after auto-flip,
not the requested position. Theme CSS can therefore apply directional styles (arrow direction,
offset) reliably against `data-tooltip-position` without needing to know what was originally
requested.

**Delay on show only.** Hiding is always immediate. Delayed hide leads to tooltips lingering
after the user has clearly moved on, which is more disruptive than a brief delay before show.
