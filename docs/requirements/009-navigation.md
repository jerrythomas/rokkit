# Navigation Component Requirements

> Requirements for Tabs, BreadCrumbs, Stepper, and PageNavigator components.

## 1. Overview

| Component | Type | Package | Status |
|-----------|------|---------|--------|
| Tabs | Tab navigation | `@rokkit/composables` (as TabGroup) | Active (bits-ui based) |
| BreadCrumbs | Breadcrumb trail | `archive/ui/` | Archived |
| Stepper | Step wizard | `archive/ui/` | Archived |
| PageNavigator | Page dots/numbers | `archive/ui/` | Archived |

## 2. Tabs

### 2.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `options` | `any[]` | `[]` | Yes | Tab items |
| `fields` | `TabFields` | defaults | No | Field mapping (id, label, value, content) |
| `value` | `unknown` | — | Yes | Selected tab value |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | No | Tab bar direction |
| `position` | `'before' \| 'after'` | `'before'` | No | Tab bar position relative to content |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | No | Tab alignment |
| `editable` | `boolean` | `false` | No | Enable add/remove tabs |
| `placeholder` | `string` | `'Select a tab...'` | No | Empty selection text |
| `icons` | `TabStateIcons` | defaults | No | Add/close icons |
| `onselect` | callback | — | No | `(value, item) => void` |
| `onchange` | callback | — | No | `(value, item) => void` |
| `onadd` | callback | — | No | `() => void` |
| `onremove` | callback | — | No | `(item) => void` |
| `tabItem` | `Snippet` | — | No | Custom tab header |
| `tabPanel` | `Snippet` | — | No | Custom tab content |
| `empty` | `Snippet` | — | No | Empty state |

### 2.2 Rendering

- Tab list with trigger buttons, separate tab panels
- Uses `Proxy` from `@rokkit/states` for field mapping
- Editable mode: close icon on tabs, add button at end
- Placeholder shown when no tab selected

### 2.3 Keyboard

| Key | Action |
|-----|--------|
| `ArrowLeft` / `ArrowRight` | Move focus (horizontal) |
| `ArrowUp` / `ArrowDown` | Move focus (vertical) |
| `Enter` / `Space` | Select tab |
| `Home` | Focus first tab |
| `End` | Focus last tab |

### 2.4 ARIA

- Tab list: `role="tablist"`, `aria-orientation`
- Tab trigger: `role="tab"`, `aria-selected`, `aria-controls`
- Tab panel: `role="tabpanel"`, `aria-labelledby`

### 2.5 Current State

`TabGroup` in `@rokkit/composables` wraps `bits-ui` Tabs. The archived `Tabs.svelte` used `@rokkit/actions` navigator and `@rokkit/states` ListController. Recreation should evaluate whether bits-ui wrapper is sufficient or custom implementation needed.

## 3. BreadCrumbs

### 3.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any[]` | `[]` | Breadcrumb items |
| `fields` | `BreadCrumbFields` | defaults | Field mapping (text, value, href) |
| `separator` | `string` | `'/'` | Separator icon name |
| `child` | `Snippet` | — | Custom item rendering |

### 3.2 Rendering

- Horizontal item sequence with separators between items
- Last item marked as current (non-interactive)
- Items with `href` render as links
- Uses `Proxy` from `@rokkit/states`

### 3.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-breadcrumbs` | root | Container |
| `data-breadcrumb-item` | li | Individual item |
| `data-current` | li | Last/active item |

### 3.4 ARIA

- Root: `role="navigation"`, `aria-label="Breadcrumb"`
- List: `<ol>` element
- Current item: `aria-current="page"`

## 4. Stepper

### 4.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `steps` | `StepItem[]` | `[]` | No | Step definitions |
| `currentStage` | `number` | `0` | Yes | Active step index |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | No | Layout direction |
| `onclick` | callback | — | No | `(stage, item) => void` |

### 4.2 Step Item

```
StepItem {
  text: string          // Step identifier
  label: string         // Step description
  completed: boolean    // Completed state
  active: boolean       // Active state
  steps?: {             // Sub-step progress
    count: number
    value: number
    current: number
  }
}
```

### 4.3 Rendering

- Grid layout with stage circles and labels
- Completed stages show check icon
- Active stage highlighted
- Optional sub-step progress dots between stages
- Connecting lines between stage circles

### 4.4 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-stepper` | root | Container |
| `data-step` | div | Step element |
| `data-completed` | div | Completed step |
| `data-active` | div | Active step |

### 4.5 ARIA

- Each stage: `role="option"`, `aria-selected`
- Progress dots: `role="option"`, `aria-selected`

## 5. PageNavigator

### 5.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `any[]` | `[]` | No | Page items |
| `fields` | `PageFields` | defaults | No | Field mapping (text, value) |
| `value` | `unknown` | `items[0]` | Yes | Current page |
| `numbers` | `boolean` | `false` | No | Show page numbers (vs dots) |
| `onselect` | callback | — | No | `(value, item) => void` |

### 5.2 Rendering

- Three-column layout: previous | indicators | next
- Previous/next buttons with arrow icons and page text
- Center shows dot indicators or numbered buttons
- Previous/next hidden at boundaries

### 5.3 Keyboard

| Key | Action |
|-----|--------|
| `ArrowLeft` | Previous page |
| `ArrowRight` | Next page |

### 5.4 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-page-nav` | root | Container |
| `data-page-prev` | button | Previous button |
| `data-page-next` | button | Next button |
| `data-page-indicator` | button | Dot/number indicator |
| `data-selected` | indicator | Current page |

## 6. Dependencies

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/core` | `defaultStateIcons`, `defaultFields` | Icons, field defaults |
| `@rokkit/states` | `Proxy`, `ListController` | Field mapping, list state |
| `@rokkit/actions` | `navigator` | Keyboard navigation |
| `@rokkit/composables` | `bits-ui` | TabGroup wrapper |

## 6. FloatingNavigation

A floating, collapsible navigation widget that anchors to a screen edge. Primarily shows icons; expands on hover to reveal text labels. Supports pinning open and tracks the active section via IntersectionObserver.

### 6.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `any[]` | `[]` | No | Navigation items (data-driven) |
| `fields` | `ItemFields` | defaults | No | Field mapping (text, value, icon, href) |
| `value` | `unknown` | — | Yes | Active item value |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | No | Screen edge to anchor to |
| `pinned` | `boolean` | `false` | Yes | Whether nav is pinned open |
| `observe` | `boolean` | `true` | No | Auto-track active section via IntersectionObserver |
| `observerOptions` | `object` | `{ rootMargin: '-20% 0px -70% 0px' }` | No | IntersectionObserver config |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Size variant |
| `class` | `string` | `''` | No | CSS classes |
| `onselect` | callback | — | No | `(value, item) => void` — fires on item click |
| `onpinchange` | callback | — | No | `(pinned: boolean) => void` |
| `item` | `Snippet` | — | No | Custom item rendering |

### 6.2 Rendering

- Fixed-position container on the configured screen edge, centered along that edge
- **Collapsed state**: Icon-only buttons in a column (left/right) or row (top/bottom), with active indicator dot
- **Expanded state**: Icons + text labels visible, with chevron indicators on active item
- **Pin button**: Header area with pin/unpin toggle; when pinned, nav stays expanded regardless of hover
- **Hover expand**: On mouseenter the nav expands; on mouseleave it collapses (unless pinned)
- Smooth scroll to target section on item click (`element.scrollIntoView({ behavior: 'smooth' })`)

### 6.3 Animations

| Animation | Description |
|-----------|-------------|
| Entrance | Slide in from edge with fade (e.g. right position: `opacity: 0, x: 100` → `opacity: 1, x: 0`) |
| Expand/collapse | Width (left/right) or height (top/bottom) animates between icon-only and full size; 300ms ease-in-out |
| Label appear | Text labels fade in with slight slide from icon direction; 200ms |
| Active indicator | Animated dot/pill that moves between items (CSS transition or `layoutId`-style shared element) |
| Item hover | Subtle scale (1.02) on hover, scale (0.98) on press |
| Staggered items | Items animate in with staggered delay (index × 100ms) on mount |
| Edge indicator | When collapsed, a gradient pill on the outer edge fades in/out |

### 6.4 IntersectionObserver

When `observe` is true, the component watches elements whose `id` matches each item's `value` (or `href` target). As sections scroll into view, `value` updates to reflect the active section. This provides automatic scroll-tracking without manual state management.

### 6.5 Keyboard

| Key | Action |
|-----|--------|
| `ArrowUp` / `ArrowDown` (vertical) | Navigate items |
| `ArrowLeft` / `ArrowRight` (horizontal) | Navigate items |
| `Enter` / `Space` | Activate item (scroll to section) |
| `Escape` | Collapse (if not pinned) |

### 6.6 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-floating-nav` | root | Container |
| `data-position` | root | Anchor position (left/right/top/bottom) |
| `data-expanded` | root | Expanded state |
| `data-pinned` | root | Pinned state |
| `data-floating-nav-item` | button/a | Navigation item |
| `data-active` | item | Active/current item |
| `data-floating-nav-pin` | button | Pin toggle button |
| `data-floating-nav-indicator` | span | Active indicator dot |

### 6.7 ARIA

- Root: `role="navigation"`, `aria-label="Page navigation"`
- Items: anchor (`<a>`) when `href` available, `<button>` otherwise
- Active item: `aria-current="true"`
- Pin button: `aria-pressed` reflecting pin state
- Expanded state: `aria-expanded` on container

## 7. Gaps

1. ~~BreadCrumbs not recreated from archive~~ ✅ Done
2. ~~Stepper not recreated from archive~~ ✅ Done
3. PageNavigator not recreated from archive
4. TabGroup (composables) may need to move to `@rokkit/ui` per package clarity
5. No animated tab transitions
6. No lazy tab panel rendering (render only active panel)
7. FloatingNavigation not yet implemented
