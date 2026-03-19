# Card

> A content container that renders as a link, button, or static surface depending on props.

---

## Overview

Card is a surface component — it wraps content with a structured header/body/footer layout
and optionally makes the whole unit interactive. The element type is inferred from props:
an `href` renders an `<a>`, an `onclick` renders a `<button>`, and neither renders a `<div>`.
This means interactive cards are semantically correct without extra configuration.

Card is not a data-driven component. It has no `items` or `fields` props. It is a layout
primitive composed with snippets. When you need a grid of cards from an array, iterate
externally and render one Card per item.

---

## Anatomy

```html
<!-- Static card -->
<div data-card class="...">
  <div data-card-header>...</div>
  <div data-card-body>...</div>
  <div data-card-footer>...</div>
</div>

<!-- Interactive card (href or onclick set) -->
<a data-card data-card-interactive href="/path"> ... </a>

<button data-card data-card-interactive type="button">...</button>
```

The `data-card-body` section is always rendered and receives the default `children` snippet.
`data-card-header` and `data-card-footer` are rendered only when their respective snippets
are provided.

---

## Props

```typescript
interface CardProps {
  href?: string // Renders as <a href="..."> when set
  onclick?: () => void // Renders as <button> when set (href takes precedence)
  class?: string // Additional CSS class on root element
  header?: Snippet // Content for data-card-header
  footer?: Snippet // Content for data-card-footer
  children?: Snippet // Content for data-card-body
}
```

When both `href` and `onclick` are provided, `href` takes precedence and the card renders
as an `<a>` element. The `onclick` is still attached as an event listener on the `<a>`.

---

## Snippets

| Snippet    | Rendered in        | Notes                                 |
| ---------- | ------------------ | ------------------------------------- |
| `header`   | `data-card-header` | Omitted from DOM when not provided    |
| `children` | `data-card-body`   | Always rendered; use for main content |
| `footer`   | `data-card-footer` | Omitted from DOM when not provided    |

---

## Data Attributes

| Attribute               | Element        | Notes                                          |
| ----------------------- | -------------- | ---------------------------------------------- |
| `data-card`             | Root           | Always present; identifies the component       |
| `data-card-header`      | Header section | Present only when `header` snippet is provided |
| `data-card-body`        | Body section   | Always present                                 |
| `data-card-footer`      | Footer section | Present only when `footer` snippet is provided |
| `data-card-interactive` | Root           | Present when `href` or `onclick` is set        |

Theme CSS uses `[data-card-interactive]` to apply hover/focus/active states. Static cards
do not receive these styles by default.

---

## Accessibility

- `<a>` renders with `href` — keyboard focusable, activatable with Enter.
- `<button>` renders with `type="button"` — keyboard focusable, activatable with Enter and Space.
- `<div>` is not focusable; do not set `onclick` on non-interactive cards without a structural
  reason. Prefer `<button>` for click targets.
- When composing a grid of cards, wrap in an appropriate landmark (`<ul>` / `<li>` or a
  `role="list"` container) at the application layer. Card itself does not impose list semantics.

---

## Design Notes

**Element inference over an `interactive` prop.** The element type is determined from props
rather than an explicit `variant` or `interactive` prop. This avoids the common mistake of
rendering a `<div>` with an `onclick` — the correct element is always used automatically.

**No data binding.** Card is intentionally outside the data-first pattern. It is a layout
shell, not a selection component. Mapping an array of items to cards is the application's
responsibility; Card does not add `items` or `fields` props because doing so would couple
a general-purpose layout primitive to a specific data iteration pattern.

**Header/footer are opt-in.** The DOM elements for header and footer are only rendered when
the snippets are provided. Theme CSS can therefore rely on `[data-card-header]` being absent
when no header was passed — no need for an `empty` state or conditional classes in the theme.
