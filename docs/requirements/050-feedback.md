# Feedback & Display Component Requirements

> Requirements for ProgressBar, Message, Pill, Separator, Summary, Icon, and Link components.

## 1. Overview

| Component | Type | Package | Status |
|-----------|------|---------|--------|
| Icon | Icon rendering | `archive/ui/` (used internally by active components) | Archived |
| ProgressBar | Progress indicator | `archive/ui/` | Archived |
| Message | Alert/notification | `archive/ui/` | Archived |
| Pill | Tag/badge | `archive/ui/` | Archived |
| Separator | Visual divider | `archive/ui/` | Archived |
| Summary | Stat card | `archive/ui/` | Archived |
| Link | Styled link | `archive/ui/` | Archived |
| Accordion | Collapsible sections | `archive/ui/` | Archived |

## 2. Icon

### 2.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Icon class name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `class` | `string` | `''` | CSS classes |

### 2.2 Rendering

- Renders `<i>` element with icon class applied
- Uses UnoCSS icon class convention from `@rokkit/icons`
- Size maps to CSS custom properties or font-size

### 2.3 Notes

Icon is used internally by many components (Button, Menu, Select, Tree). Currently exists as a local component in archive, not exported from `@rokkit/ui`. Consider whether it should be a public export or remain internal.

## 3. ProgressBar

### 3.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress (0–100) |
| `max` | `number` | `100` | Maximum value |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height variant |
| `label` | `string` | — | Accessible label |
| `showValue` | `boolean` | `false` | Display percentage text |
| `indeterminate` | `boolean` | `false` | Indeterminate (loading) state |

### 3.2 Rendering

- Track with fill bar at `(value / max) * 100%` width
- Indeterminate mode shows animated cycling bar
- Optional percentage text overlay

### 3.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-progress` | root | Container |
| `data-variant` | root | Color variant |
| `data-indeterminate` | root | Indeterminate state |

### 3.4 ARIA

- `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

## 4. Message

### 4.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Message type |
| `title` | `string` | — | Message title |
| `dismissible` | `boolean` | `false` | Show close button |
| `icon` | `string` | — | Custom icon (defaults per variant) |
| `ondismiss` | callback | — | Dismiss handler |
| `children` | `Snippet` | — | Message body content |

### 4.2 Rendering

- Colored container with variant-specific icon, title, body
- Optional close button (dismissible)
- Default icons: info → `i-info`, success → `i-check`, warning → `i-warning`, error → `i-error`

### 4.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-message` | root | Container |
| `data-variant` | root | Message type |

### 4.4 ARIA

- `role="alert"` for error/warning, `role="status"` for info/success

## 5. Pill

### 5.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Pill text |
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `icon` | `string` | — | Leading icon |
| `removable` | `boolean` | `false` | Show remove button |
| `onremove` | callback | — | Remove handler |
| `children` | `Snippet` | — | Custom content |

### 5.2 Rendering

- Inline rounded element with text/icon
- Optional remove (×) button
- Used in MultiSelect for selected value tags

### 5.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-pill` | root | Container |
| `data-variant` | root | Color variant |
| `data-size` | root | Size variant |

## 6. Separator

### 6.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `label` | `string` | — | Optional center label |
| `class` | `string` | `''` | CSS classes |

### 6.2 Rendering

- Horizontal or vertical line
- Optional text label centered on the line
- Used between sections, form groups, menu items

### 6.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-separator` | root | Container |

### 6.4 ARIA

- `role="separator"`, `aria-orientation`

## 7. Summary

### 7.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | — | Primary display value |
| `label` | `string` | — | Description label |
| `icon` | `string` | — | Icon |
| `trend` | `'up' \| 'down' \| 'neutral'` | — | Trend indicator |
| `trendValue` | `string` | — | Trend text (e.g., "+12%") |

### 7.2 Rendering

- Stat card showing a prominent value with label
- Optional icon and trend indicator
- Used in dashboards for KPIs

### 7.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-summary` | root | Container |
| `data-trend` | span | Trend direction |

## 8. Link

### 8.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | URL |
| `target` | `string` | — | Link target |
| `variant` | `'default' \| 'muted' \| 'inherit'` | `'default'` | Style variant |
| `icon` | `string` | — | Leading icon |
| `children` | `Snippet` | — | Link content |

### 8.2 Notes

May not need a dedicated component — Button with `href` prop already renders as `<a>`. Evaluate if Link provides value beyond Button.

## 9. Accordion

### 9.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `options` | `AccordionItem[]` | `[]` | No | Accordion sections |
| `fields` | `AccordionFields` | defaults | No | Field mapping (title, content, icon, disabled) |
| `value` | `unknown \| unknown[]` | — | Yes | Open section(s) |
| `multiple` | `boolean` | `false` | No | Allow multiple open |
| `collapsible` | `boolean` | `true` | No | Allow all closed |
| `disabled` | `boolean` | `false` | No | Disable all sections |
| `item` | `Snippet` | — | No | Custom header rendering |
| `content` | `Snippet` | — | No | Custom content rendering |

### 9.2 Rendering

- Stacked sections with clickable headers
- Content area expands/collapses with animation
- Chevron/arrow indicator rotates on open

### 9.3 Keyboard

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle focused section |
| `ArrowDown` | Focus next header |
| `ArrowUp` | Focus previous header |
| `Home` | Focus first header |
| `End` | Focus last header |

### 9.4 ARIA

- Header: `role="button"`, `aria-expanded`, `aria-controls`
- Content: `role="region"`, `aria-labelledby`

## 10. Dependencies

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/core` | `defaultStateIcons` | Variant icons (Message) |
| `@rokkit/ui` | `ItemProxy` | Field mapping (Accordion) |

## 11. Gaps

1. None of these components exist in current `@rokkit/ui`
2. No toast/notification system (timed auto-dismiss messages)
3. No Tooltip component
4. No Skeleton/loading placeholder component
5. Accordion not in archive — may have been part of a different component set
6. Link may be redundant with Button href pattern
