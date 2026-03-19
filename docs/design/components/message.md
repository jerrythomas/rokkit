# Message / Alerts

Display a single notification or alert; push programmatic notifications via the alerts store.

---

## Overview

The system has three parts:

1. **`Message` component** — renders one alert/notification with type, text, optional dismiss button, and optional action slot.
2. **`alerts` store** (`@rokkit/states`) — manages a reactive list of active alerts; push, dismiss, and auto-dismiss.
3. **`AlertList` component** — renders all active alerts from the store in a positioned container; thin wrapper around `Message`.

The component was originally a minimal wrapper (`text`, `type`, `children`). This design restores that core and extends it to a dismissible, actionable notification primitive with a matching store.

---

## Anatomy

### Message

```html
<div
  data-message-root
  data-type="error|info|success|warning"
  data-dismissible="true|false"
  role="alert"
>
  <span data-message-icon aria-hidden="true" />
  <!-- type icon -->

  <span data-message-text>
    <!-- text or children -->
    {text}
    <!-- or {children} snippet -->
  </span>

  <div data-message-actions>
    <!-- optional: actions snippet -->
    {actions}
  </div>

  <button data-message-dismiss aria-label="Dismiss">
    <!-- if dismissible -->
    ×
  </button>
</div>
```

### AlertList

```html
<div data-alert-list data-position="top-right|top-center|bottom-right|...">
  <!-- for each alert in store -->
  <Message {alert} ondismiss={() => alerts.dismiss(alert.id)} />
</div>
```

---

## Props

### Message

```ts
interface MessageProps {
  type?: 'error' | 'info' | 'success' | 'warning' // default: 'error'
  text?: string
  dismissible?: boolean // default: false
  timeout?: number // ms; 0 = no auto-dismiss; default: 0
  actions?: Snippet
  children?: Snippet
  ondismiss?: () => void
  class?: string
}
```

`children` and `text` are mutually exclusive — `children` takes precedence when both are provided. `text` is the common shorthand; `children` is for richer content.

### AlertList

```ts
interface AlertListProps {
  position?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left' // default: 'top-right'
  class?: string
}
```

`AlertList` is connected to the `alerts` store by default. It has no `items` prop — it reads from the store directly.

---

## Alerts Store (`@rokkit/states`)

```ts
interface Alert {
  id: string // auto-generated
  type: 'error' | 'info' | 'success' | 'warning'
  text?: string
  dismissible?: boolean
  timeout?: number
  actions?: unknown // Snippet reference (opaque to store)
}

interface AlertsStore {
  current: Alert[] // reactive list
  push(alert: Omit<Alert, 'id'>): string // returns id
  dismiss(id: string): void
  clear(): void
}

export const alerts: AlertsStore
```

**Usage:**

```js
import { alerts } from '@rokkit/states'

// Basic
alerts.push({ type: 'success', text: 'Saved!' })

// Auto-dismiss after 3 s
alerts.push({ type: 'success', text: 'Saved!', timeout: 3000 })

// Persistent error, dismissible
alerts.push({ type: 'error', text: 'Failed to save', dismissible: true })

// Programmatic dismiss
const id = alerts.push({ type: 'info', text: 'Processing...' })
alerts.dismiss(id)

// Clear all
alerts.clear()
```

The store manages `setTimeout` internally when `timeout > 0`. Dismissing an alert before the timeout cancels the timer. `clear()` cancels all pending timers.

---

## Data Attributes

| Attribute              | Element          | Values                                     | Purpose                             |
| ---------------------- | ---------------- | ------------------------------------------ | ----------------------------------- |
| `data-message-root`    | root `div`       | (presence)                                 | Component identity; theme hook      |
| `data-type`            | root `div`       | `"error"` `"info"` `"success"` `"warning"` | Type-based color theming            |
| `data-dismissible`     | root `div`       | `"true"` `"false"`                         | Layout hint (reserve space for ×)   |
| `data-message-icon`    | icon element     | (presence)                                 | Theme hook for icon sizing/color    |
| `data-message-text`    | text wrapper     | (presence)                                 | Theme hook for text layout          |
| `data-message-actions` | actions wrapper  | (presence)                                 | Theme hook for action button layout |
| `data-message-dismiss` | dismiss `button` | (presence)                                 | Theme hook for dismiss button       |
| `data-alert-list`      | `AlertList` root | (presence)                                 | Container identity; theme hook      |
| `data-position`        | `AlertList` root | position string                            | Positioning variant                 |

---

## Accessibility

- `role="alert"` on the root element makes it an ARIA live region with `aria-live="assertive"`. Alerts injected into the DOM are immediately announced by screen readers.
- For lower-urgency notifications (info, success), consider `role="status"` (`aria-live="polite"`) — implementors may expose a `polite` boolean prop or derive it from `type`.
- The dismiss button must have an accessible label (`aria-label="Dismiss"` or visible text). It should be focusable and operable with Enter/Space.
- The icon element carries `aria-hidden="true"` — the type is conveyed by text content and `data-type` color.
- `AlertList` should trap no focus; alerts are non-modal by design.

---

## Design Notes

**`role="alert"` fires on DOM insertion.** `AlertList` renders `Message` components for each store entry. Because `role="alert"` is already on the root, adding a new `<Message>` to the DOM is sufficient — no `aria-live` wrapper is needed on `AlertList`. Do not pre-render hidden messages and toggle visibility; that does not trigger the live region announcement.

**Store lives in `@rokkit/states`.** The alerts store follows the same class-based pattern as `MessagesStore` (using Svelte 5 `$state` internally). It is named `alerts` (not `alertsStore`) to match the `messages` convention.

**`AlertList` is a thin rendering component.** Its only job is to loop over `alerts.current` and render `Message` for each. Position, stacking order, and animation belong to the theme layer via `[data-alert-list][data-position="..."]` CSS.

**`timeout` lives on both store and component.** When using the store, `timeout` is part of the pushed alert and managed by the store's timer. When using `Message` standalone (no store), `timeout` is handled by the component itself — after the delay, it calls `ondismiss`. This keeps standalone usage consistent with store-driven usage.

**`actions` snippet with the store.** Passing a Snippet reference through the store requires the consumer to keep the snippet in scope. The store stores it as an opaque value; `AlertList` forwards it to `Message`. This pattern works in Svelte 5 because snippets are functions — they are stable references.
