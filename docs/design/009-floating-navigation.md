# FloatingNavigation — Design Document

> Design for a floating, collapsible page navigation widget. See requirements in `docs/requirements/009-navigation.md §6`.

## 1. Overview

FloatingNavigation is a fixed-position navigation widget that anchors to any screen edge. It shows icon-only items in its collapsed state and expands on hover to reveal text labels. It supports pinning open, active section tracking via IntersectionObserver, and smooth-scroll navigation.

**Reference**: Inspired by the floating nav in `/Users/Jerry/Work/website/site/src/components/FloatingNavigation.tsx` (React + Framer Motion), adapted to Svelte 5 with rokkit's data-driven patterns.

## 2. Architecture

### 2.1 Component

Single `FloatingNavigation.svelte` in `@rokkit/ui`. No controller needed — state is simple (expanded, pinned, active). Uses `ItemProxy` for field mapping.

### 2.2 Dependencies

| Dependency | Purpose |
|------------|---------|
| `@rokkit/ui` ItemProxy | Data-driven field mapping for items |
| `@rokkit/actions` keyboard | Escape to collapse |
| CSS transitions | All animations (no JS animation library) |

### 2.3 No Controller Needed

Unlike List/Tree, FloatingNavigation has no complex keyboard navigation state. A flat list of items with simple up/down focus management can be handled with native focus + `tabindex`.

## 3. Data Flow

```
items (prop) → ItemProxy[] → render icons + labels
    ↕
value (bindable) ← IntersectionObserver updates active section
    ↕
pinned (bindable) ← pin button toggle
    ↕
expanded (internal) ← mouseenter/mouseleave or pinned state
```

## 4. Position Layouts

| Position | Container | Items | Expand Direction |
|----------|-----------|-------|------------------|
| `right` | Fixed right edge, vertically centered | Column | Width: narrow → wide (left) |
| `left` | Fixed left edge, vertically centered | Column | Width: narrow → wide (right) |
| `top` | Fixed top edge, horizontally centered | Row | Height: narrow → tall (down) |
| `bottom` | Fixed bottom edge, horizontally centered | Row | Height: narrow → tall (up) |

CSS approach: A single `data-position` attribute drives all layout differences via CSS selectors. The component markup stays the same regardless of position.

## 5. Animation Strategy

All animations use **CSS transitions and keyframes** — no JS animation library required. This keeps the bundle small and leverages GPU-accelerated CSS.

### 5.1 CSS Custom Properties for Animation

```css
[data-floating-nav] {
  --fn-expand-duration: 300ms;
  --fn-expand-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --fn-label-duration: 200ms;
  --fn-indicator-duration: 300ms;
}
```

### 5.2 Animations

| Animation | CSS Approach |
|-----------|-------------|
| **Entrance slide-in** | `@keyframes fn-slide-in` — starts offscreen, slides to position. Applied once on mount via `animation`. |
| **Expand/collapse** | `transition: width` (left/right) or `transition: height` (top/bottom). Collapsed = icon-only width. Expanded = full width. |
| **Label fade** | Labels have `opacity: 0; translate: -0.5rem 0` collapsed, transitioning to `opacity: 1; translate: 0` expanded. Uses `transition` on `[data-expanded]` parent. |
| **Active indicator** | A pseudo-element or `<span>` with `transition: top` (vertical) or `transition: left` (horizontal) that moves to the active item. Position calculated via CSS `calc()` based on item index. |
| **Item hover** | `transform: scale(1.02)` on hover, `scale(0.98)` on `:active`. |
| **Edge indicator** | A gradient pill on the outer edge, `opacity` transitions in/out with collapsed state. |

### 5.3 Entrance Animation

```css
@keyframes fn-slide-in-right {
  from { opacity: 0; translate: 6rem 0; }
  to   { opacity: 1; translate: 0 0; }
}

[data-floating-nav][data-position="right"] {
  animation: fn-slide-in-right 0.5s ease-out 0.5s both;
}
```

Similar keyframes for left/top/bottom directions.

## 6. IntersectionObserver Integration

When `observe` is true:

```javascript
$effect(() => {
  if (!observe) return
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        value = /* matching item value */
      }
    }
  }, observerOptions)

  for (const item of itemProxies) {
    const id = item.get('href')?.replace('#', '') ?? item.itemValue
    const el = document.getElementById(String(id))
    if (el) observer.observe(el)
  }

  return () => observer.disconnect()
})
```

Item `href` (e.g. `#section-id`) or `value` maps to the DOM element `id` to observe.

## 7. Template Structure

```svelte
<nav
  data-floating-nav
  data-position={position}
  data-expanded={expanded || undefined}
  data-pinned={pinned || undefined}
  data-size={size}
  role="navigation"
  aria-label="Page navigation"
  on:mouseenter={() => !pinned && (expanded = true)}
  on:mouseleave={() => !pinned && (expanded = false)}
>
  <!-- Header with title + pin button -->
  <div data-floating-nav-header>
    {#if expanded}
      <span data-floating-nav-title>Navigation</span>
    {/if}
    <button data-floating-nav-pin aria-pressed={pinned} onclick={togglePin}>
      <!-- pin/unpin icon -->
    </button>
  </div>

  <!-- Items -->
  <div data-floating-nav-items>
    {#each itemProxies as proxy, index}
      {@const isActive = proxy.itemValue === value}
      <a|button
        data-floating-nav-item
        data-active={isActive || undefined}
        href={proxy.get('href')}
        aria-current={isActive ? 'true' : undefined}
        onclick={() => handleClick(proxy)}
      >
        <span data-floating-nav-icon class={proxy.icon}></span>
        <span data-floating-nav-label>{proxy.text}</span>
      </a|button>
    {/each}

    <!-- Active indicator (positioned via CSS) -->
    <span data-floating-nav-indicator style="--fn-active-index: {activeIndex}"></span>
  </div>
</nav>
```

## 8. CSS Architecture

### 8.1 Base CSS (`base/floating-navigation.css`)

Structural layout, positioning, sizing, transitions. No colors.

### 8.2 Theme CSS

Each theme provides colors, backgrounds, borders, shadows, gradient indicator styles.

### 8.3 Active Indicator Positioning

The indicator dot/pill is absolutely positioned within the items container. Its position is driven by a CSS custom property:

```css
[data-floating-nav-indicator] {
  position: absolute;
  transition: top var(--fn-indicator-duration) ease;
}

/* Vertical (left/right position) */
[data-floating-nav][data-position="left"] [data-floating-nav-indicator],
[data-floating-nav][data-position="right"] [data-floating-nav-indicator] {
  top: calc(var(--fn-active-index) * var(--fn-item-height) + var(--fn-item-height) / 2);
}
```

## 9. Size Variants

| Size | Icon area | Expanded width (left/right) | Item height |
|------|-----------|----------------------------|-------------|
| `sm` | 2.5rem | 14rem | 2rem |
| `md` | 3.5rem | 17rem | 2.5rem |
| `lg` | 4rem | 20rem | 3rem |

## 10. Accessibility

- `role="navigation"` with `aria-label`
- Items are `<a>` when `href` provided, `<button>` otherwise
- Active item has `aria-current="true"`
- Pin button has `aria-pressed`
- Container has `aria-expanded` reflecting expanded state
- Focus management: Tab into nav focuses first item, arrow keys move between items
- `prefers-reduced-motion`: disable entrance animation, reduce transition durations

## 11. Implementation Order

1. Component scaffold with props, ItemProxy mapping, expand/collapse
2. Position layouts (CSS for all 4 edges)
3. Pin toggle
4. IntersectionObserver active tracking
5. CSS animations (entrance, expand, labels, indicator, hover)
6. Keyboard navigation (arrows, Enter, Escape)
7. Theme CSS (base + 4 themes)
8. Tests + playground page
