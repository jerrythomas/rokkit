# Layout Container Requirements

> Requirements for Card, Panel, Overlay, ResponsiveGrid, Carousel, and SlidingColumns components.

## 1. Overview

| Component | Type | Package | Status |
|-----------|------|---------|--------|
| Card | Content card | `archive/ui/` | Archived |
| Panel | Section container | `archive/ui/` | Archived |
| Overlay | Modal backdrop | `archive/ui/` | Archived |
| ResponsiveGrid | Adaptive grid/carousel | `archive/ui/` | Archived |
| Carousel | Image slider | `archive/ui/` | Archived |
| SlidingColumns | Sequential column view | `archive/ui/` | Archived |

## 2. Panel

### 2.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | `''` | CSS classes |
| `header` | `Snippet` | — | Header section |
| `body` | `Snippet` | — | Body section |
| `footer` | `Snippet` | — | Footer section |
| `children` | `Snippet` | — | Default content (fallback for body) |

### 2.2 Rendering

- Three-section container: header, body, footer
- All sections optional — only rendered when snippet provided
- `children` used as body when `body` snippet not provided
- Pure layout component with no internal behavior

### 2.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-panel` | root | Panel container |
| `data-panel-header` | div | Header section |
| `data-panel-body` | div | Body section |
| `data-panel-footer` | div | Footer section |

### 2.4 Priority

**High** — Panel is the primary composition container. Used with SearchFilter + List, Toolbar + content, etc. See [000-architecture.md](../design/000-architecture.md) § Composition Patterns.

## 3. Card

### 3.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | — | Data object (bindable) |
| `fields` | `CardFields` | defaults | Field mapping (title, description, icon, href) |
| `onclick` | callback | — | Click handler |
| `child` | `Snippet` | — | Custom content (receives Proxy) |
| `children` | `Snippet` | — | Full custom content |

### 3.2 Rendering

- Renders as `<a>` when `href` field present on value, `<div role="button">` otherwise
- Default snippet: icon + title + description from field mapping
- Custom `child` snippet receives a `Proxy` for field access
- Keyboard: Enter triggers onclick

### 3.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-card` | root | Card container |

### 3.4 Dependencies

- `@rokkit/states` — Proxy for field mapping

## 4. Overlay

### 4.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Bindable open state |
| `children` | `Snippet` | — | Overlay content |
| `ondismiss` | callback | — | Dismiss handler |

### 4.2 Rendering

- Full-screen backdrop with content centered
- Click-outside-content dismisses (via `dismissable` action)
- Escape key dismisses

### 4.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-overlay` | root | Overlay container |
| `data-dismissed` | root | Dismissed state |

### 4.4 ARIA

- `role="dialog"`, `aria-modal="true"`

### 4.5 Dependencies

- `@rokkit/actions` — `dismissable` action

## 5. Carousel

### 5.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `any[]` | `[]` | No | Carousel items |
| `fields` | `CarouselFields` | defaults | No | Field mapping (src, alt, text) |
| `value` | `unknown` | — | Yes | Current item |
| `autoplay` | `boolean` | `false` | No | Auto-advance |
| `interval` | `number` | `5000` | No | Autoplay interval (ms) |
| `duration` | `number` | `400` | No | Transition duration (ms) |

### 5.2 Rendering

- Single visible slide with transition animation
- Dot/number navigation indicators below
- Previous/next navigation arrows (optional)
- Swipe support on touch devices

### 5.3 Keyboard

| Key | Action |
|-----|--------|
| `ArrowLeft` | Previous slide |
| `ArrowRight` | Next slide |

### 5.4 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-carousel` | root | Carousel container |
| `data-carousel-slide` | div | Current slide |
| `data-carousel-indicator` | button | Dot/number indicator |
| `data-selected` | indicator | Active indicator |

### 5.5 Dependencies

- `@rokkit/actions` — `swipeable` action

## 6. ResponsiveGrid

### 6.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `any[]` | required | No | Grid items |
| `fields` | `GridFields` | defaults | No | Field mapping |
| `value` | `unknown` | — | Yes | Selected item |
| `columns` | `number \| string` | `3` | No | Column count or CSS class |
| `breakpoint` | `number` | — | No | Pixel width to switch carousel/grid |
| `duration` | `number` | `400` | No | Transition duration (ms) |
| `disabled` | `boolean` | `false` | No | Disable interaction |

### 6.2 Rendering

- **Above breakpoint**: Multi-column grid showing all items
- **Below breakpoint**: Single-item carousel with swipe navigation
- Animated transitions between items in carousel mode
- Uses `fly` and `fade` transitions

### 6.3 Dependencies

- `@rokkit/actions` — `swipeable` action
- `svelte/transition` — `fly`, `fade`

## 7. SlidingColumns

### 7.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `activeIndex` | `number` | `0` | Yes | Visible column index |
| `columns` | `Snippet[]` | — | No | Column content snippets |
| `disabled` | `boolean` | `false` | No | Disable interaction |

### 7.2 Rendering

- Single column visible at a time with directional slide transitions
- Swipe and keyboard navigation between adjacent columns
- Transition direction follows navigation direction (left/right)

### 7.3 Keyboard

| Key | Action |
|-----|--------|
| `ArrowLeft` | Previous column |
| `ArrowRight` | Next column |

### 7.4 Dependencies

- `@rokkit/actions` — `swipeable`, `navigable`
- `svelte/transition` — `fly`, `fade`

## 8. Dependencies Summary

| Package | What | Used By |
|---------|------|---------|
| `@rokkit/states` | `Proxy` | Card |
| `@rokkit/actions` | `dismissable` | Overlay |
| `@rokkit/actions` | `swipeable` | Carousel, ResponsiveGrid, SlidingColumns |
| `@rokkit/actions` | `navigable` | SlidingColumns |
| `svelte/transition` | `fly`, `fade` | Carousel, ResponsiveGrid, SlidingColumns |

## 9. Gaps

1. Panel not recreated from archive — blocks composition pattern
2. Card not recreated from archive
3. Overlay not recreated — no modal/dialog support
4. No portal support for Overlay (render outside parent DOM)
5. No focus trap for Overlay
6. Carousel lacks autoplay, lazy image loading
7. ResponsiveGrid uses old `FieldMapper` instead of `Proxy`/`ItemProxy`
8. No ResizeObserver-based breakpoint detection (ResponsiveGrid uses prop, not auto)
