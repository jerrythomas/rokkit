# Breadcrumbs

> A data-driven navigation trail with field mapping, separator icons, and per-crumb snippet override.

---

## Overview

Breadcrumbs renders an ordered list of navigation items from an array. Each item is accessed
through a ProxyItem so the component adapts to any data shape via `fields` — no pre-mapping
required. The last item is always treated as the current page and rendered as a non-interactive
`<span>` with `aria-current="page"`. All preceding items render as `<a>` or `<button>` depending
on whether the item has a resolved `href` field.

Separators between items are rendered as dedicated `<li>` elements so they are excluded from
keyboard navigation and screen reader list count without needing `aria-hidden` gymnastics.

---

## Anatomy

```html
<nav data-breadcrumbs class="...">
  <ol data-breadcrumb-list>
    <!-- Non-last item -->
    <li data-breadcrumb-item>
      <a data-breadcrumb-link href="/path">
        <span data-breadcrumb-icon>...</span>
        <span data-breadcrumb-label>Home</span>
      </a>
    </li>

    <!-- Separator -->
    <li data-breadcrumb-separator>
      <span>...</span>
      <!-- separator icon -->
    </li>

    <!-- Last item (current page) -->
    <li data-breadcrumb-item data-current>
      <span data-breadcrumb-current aria-current="page">
        <span data-breadcrumb-icon>...</span>
        <span data-breadcrumb-label>Current Page</span>
      </span>
    </li>
  </ol>
</nav>
```

When an item has no resolved `href`, it renders as a `<button data-breadcrumb-link>` instead
of `<a data-breadcrumb-link>`. The last item always renders as `<span data-breadcrumb-current>`.

---

## Props

```typescript
interface BreadcrumbsProps {
  items?: unknown[] // Source data array
  fields?: {
    label?: string | ((item) => string) // Display text; default: 'label'
    href?: string | ((item) => string) // Navigation URL; default: 'href'
    icon?: string | ((item) => string) // Icon identifier; default: 'icon'
  }
  icons?: {
    separator?: string // Icon for separator; default: chevron-right
  }
  onclick?: (value: unknown, item: unknown) => void // Called when a non-last item is activated
  crumb?: Snippet<[ProxyItem, boolean]> // Custom renderer; receives proxy + isLast flag
  class?: string // Additional CSS class on <nav>
}
```

---

## Snippets

| Snippet | Parameters        | Purpose                                          |
| ------- | ----------------- | ------------------------------------------------ |
| `crumb` | `[proxy, isLast]` | Replaces the entire item content for every crumb |

The `crumb` snippet replaces the interior of each `<li data-breadcrumb-item>` — the `<li>`
itself and `data-breadcrumb-separator` elements are still managed by the component. The
`isLast` boolean lets a single snippet branch between the interactive and current-page
renderings without writing two snippets.

When `crumb` is not provided the component renders its default icon + label layout.

---

## Data Attributes

| Attribute                   | Element          | Notes                                  |
| --------------------------- | ---------------- | -------------------------------------- |
| `data-breadcrumbs`          | `<nav>`          | Component root                         |
| `data-breadcrumb-list`      | `<ol>`           | The ordered list of crumbs             |
| `data-breadcrumb-item`      | `<li>`           | Each crumb item                        |
| `data-current`              | `<li>`           | Present on the last item only          |
| `data-breadcrumb-separator` | `<li>`           | Separator between items; not a crumb   |
| `data-breadcrumb-link`      | `<a>`/`<button>` | Interactive crumb (non-last items)     |
| `data-breadcrumb-current`   | `<span>`         | Non-interactive current page indicator |
| `data-breadcrumb-icon`      | `<span>`         | Icon within a crumb                    |
| `data-breadcrumb-label`     | `<span>`         | Text label within a crumb              |

---

## Accessibility

- `<nav data-breadcrumbs>` provides a landmark role. If multiple `<nav>` elements exist on
  the page, add `aria-label="Breadcrumb"` at the application layer via `class` is not enough —
  use a wrapping element or pass `aria-label` via the `class` attribute's parent.
- `aria-current="page"` on `data-breadcrumb-current` identifies the current location to
  screen readers.
- Separator `<li>` elements contain presentational content only; they carry no ARIA role and
  are skipped by screen readers that enumerate list items as meaningful navigation.
- When `onclick` is provided without an `href`, the item renders as `<button>` — keyboard
  focusable and activatable with Enter and Space. Do not pass click-only handlers expecting
  an `<a>` element.

---

## Design Notes

**Separator as a list item.** Separators live inside the `<ol>` as `<li>` elements rather than
as pseudo-elements or absolutely-positioned elements. This simplifies theme CSS — separators
can be styled with the same attribute selectors as items — and avoids the specificity issues
of `::before`/`::after` when custom separator icons are used.

**`isLast` in the crumb snippet.** Passing the boolean into the snippet rather than providing
two separate snippets (`crumb` and `currentCrumb`) keeps the API minimal. A consumer who
wants identical rendering for all crumbs ignores the flag; one who wants a distinct current
style branches on it.

**Field defaults match natural data shapes.** The default field names (`label`, `href`, `icon`)
map directly to typical API response shapes for navigation items. Most consumers will not
need to provide `fields` at all.
