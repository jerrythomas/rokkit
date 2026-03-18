# StatusList

Display a list of pass/fail/warn/unknown status checks — password strength, form rule summary, any multi-rule validation result.

---

## Overview

`StatusList` renders an ordered list of validation items, each with a status icon and descriptive text. It is a pure display component — it reflects whatever status array is passed in without managing state itself. The component is unstyled; themes target the data-attribute hooks.

Typical uses: password strength rules, pre-submit form validation summaries, system health checks, criteria checklists.

---

## Anatomy

```html
<!-- StatusList -->
<div data-validation-report-root role="status" class?="{class}">
  <!-- for each item -->
  <div data-validation-item data-status="pass|fail|warn|unknown">
    <i class="{icons[item.status]}" />
    <!-- status icon -->
    <p>{item.text}</p>
    <!-- rule description -->
  </div>
</div>
```

The root has `role="status"` so screen readers announce updates when the list changes (e.g. as the user types a password).

---

## Props

```ts
interface ValidationItem {
  text: string
  status: 'pass' | 'fail' | 'warn' | 'unknown'
}

interface StatusListProps {
  items: ValidationItem[]
  icons?: {
    pass?: string // icon class — defaults to DEFAULT_STATE_ICONS.badge.pass
    fail?: string // icon class — defaults to DEFAULT_STATE_ICONS.badge.fail
    warn?: string // icon class — defaults to DEFAULT_STATE_ICONS.badge.warn
    unknown?: string // icon class — defaults to DEFAULT_STATE_ICONS.badge.unknown
  }
  class?: string
}
```

`icons` is a partial map — any key omitted falls back to `DEFAULT_STATE_ICONS.badge` from `@rokkit/core`. This lets consumers override a single status icon without providing all four.

---

## Data Attributes

| Attribute                     | Element    | Values                                 | Purpose                                     |
| ----------------------------- | ---------- | -------------------------------------- | ------------------------------------------- |
| `data-validation-report-root` | root `div` | (presence)                             | Component identity; theme hook              |
| `data-validation-item`        | item `div` | (presence)                             | Item identity; theme hook                   |
| `data-status`                 | item `div` | `"pass"` `"fail"` `"warn"` `"unknown"` | Drives icon color and icon selection in CSS |

Theme CSS targets `[data-validation-item][data-status="fail"]` etc. to apply per-status colors (green for pass, red for fail, yellow for warn, grey for unknown).

---

## Accessibility

- Root element carries `role="status"` — a live region with politeness `polite`. Updates (e.g. status changes as the user types) are announced without interrupting the current speech stream.
- Each item's status is conveyed visually by icon and color. The icon element should carry `aria-hidden="true"` since the text in `<p>` fully describes the rule and its outcome.
- If the consuming context needs a label for the report region, pass `aria-label` via `class` prop or add it via Svelte spread.

---

## Design Notes

**Why `role="status"` instead of `role="list"`?** The primary function of this component is to communicate changing validation state, not to present a navigable list. `role="status"` (live region) is appropriate here — screen readers announce changes as the user interacts. If the use case is a static checklist that never updates, the consumer can override the role via spread props.

**Icons default to badge group.** The `DEFAULT_STATE_ICONS.badge` group (`badge-pass`, `badge-fail`, `badge-warn`, `badge-unknown`) is the intended default. These are compact filled icons suited to inline status indicators. Consumers can swap to a different icon set (e.g. a larger outlined variant) by passing a custom `icons` map.

**No selection, no navigation.** This is a display-only component. It holds no internal state and does not use a controller or `use:navigator`. Field mapping (`fields` prop) is not relevant here — items have a fixed, narrow schema (`text` + `status`).

**Item order is the consumer's responsibility.** The component renders items in the order they are given. Sorting (e.g. failures first) is done before passing to the component, not inside it.

**Snippet extension is intentionally absent.** The item structure is minimal enough that the consumer is unlikely to need partial slot overrides. If the use case demands more complex item content, the consumer should compose a plain loop with `StatusList`'s styling conventions as reference.
