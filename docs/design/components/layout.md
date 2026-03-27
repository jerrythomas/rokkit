# Layout Components Design

**Status:** Complete
**Last updated:** 2026-03-27

This document covers the three layout utility components in `@rokkit/ui`: `Stack`, `Divider`, and `Grid`.

---

## Overview

These are pure layout utilities — they carry no business logic and no selection state (except `Grid`, which is a selectable tile grid). They use `data-*` attribute hooks for CSS targeting and accept a `class` prop for any additional UnoCSS utilities.

---

## Stack

`Stack` is a flex container for arranging children in a row or column with consistent spacing.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Flex direction |
| `gap` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Gap between children |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Cross-axis alignment (`align-items`) |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | — | Main-axis justification (`justify-content`) |
| `children` | `Snippet` | required | Slot for child elements |
| `class` | `string` | `''` | Additional CSS classes |

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-stack` | — | Root element |
| `data-direction` | `vertical` \| `horizontal` | Flex direction |
| `data-gap` | `none` \| `xs` \| `sm` \| `md` \| `lg` \| `xl` | Spacing token |
| `data-align` | `start` \| `center` \| `end` \| `stretch` | Alignment |
| `data-justify` | `start` \| `center` \| `end` \| `between` \| `around` | Justification |

### Usage

```svelte
<Stack direction="horizontal" gap="sm" align="center">
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</Stack>
```

---

## Divider

`Divider` renders a horizontal or vertical separator line. It maps to `<hr>` semantics via `role="separator"`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Separator direction |
| `label` | `string` | — | Optional text centered in the divider |
| `class` | `string` | `''` | Additional CSS classes |

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-divider` | — | Root element |
| `data-orientation` | `horizontal` \| `vertical` | Direction |

The label, when present, renders inside `<span data-divider-label>` for independent CSS targeting.

### Usage

```svelte
<!-- Simple horizontal rule -->
<Divider />

<!-- Labeled section divider -->
<Divider label="or continue with" />

<!-- Vertical separator in a flex row -->
<div class="flex items-center gap-2">
  <span>Option A</span>
  <Divider orientation="vertical" />
  <span>Option B</span>
</div>
```

---

## Grid

`Grid` is a responsive selectable tile grid. Items lay out using CSS `grid` with a configurable minimum tile width (`auto-fill` + `minmax`). It uses the same controller + navigator pattern as `List`, with horizontal keyboard navigation.

### Architecture

```
Wrapper       — owns focusedKey $state + flatView $derived
Navigator     — attaches DOM event handlers, calls wrapper[action](path)
              — horizontal orientation (ArrowLeft/ArrowRight)
flatView loop — single flat {#each} rendering items as <button> tiles
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `unknown[]` | `[]` | Data array (objects or primitives) |
| `fields` | `Record<string, string>` | `{}` | Field mapping overrides |
| `value` | `unknown` | — | Selected value — use `bind:value` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tile size variant |
| `disabled` | `boolean` | `false` | Disable all tiles |
| `minSize` | `string` | `'120px'` | Minimum tile width (any CSS value) |
| `gap` | `string` | `'1rem'` | Grid gap (any CSS value) |
| `label` | `string` | — | Accessible label for the grid (`aria-label`) |
| `onselect` | `(value, proxy) => void` | — | Called when a tile is selected |
| `class` | `string` | `''` | Additional CSS classes |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--grid-min-size` | `120px` | Minimum tile width for `auto-fill` |
| `--grid-gap` | `1rem` | Gap between tiles |

These are set inline from `minSize` and `gap` props, so they can also be overridden via a parent `style` attribute.

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-grid` | — | Root container |
| `data-grid-item` | — | Individual tile `<button>` |
| `data-active` | present when selected | Selected tile indicator |
| `data-disabled` | present when disabled | Disabled state |
| `data-size` | `sm` \| `md` \| `lg` | Size variant |
| `data-grid-min-size` | CSS value | Passed-through for CSS reference |

### Snippets

- `itemContent(proxy)` — overrides the tile content. `proxy` is a `ProxyItem` with `label`, `icon`, `value`, `raw`, and `disabled` properties.

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight` | Next tile |
| `ArrowLeft` | Previous tile |
| `Enter` / `Space` | Select focused tile |
| `Home` / `End` | First / last tile |

### Usage

```svelte
<script>
  import { Grid } from '@rokkit/ui'

  const items = [
    { label: 'Dashboard', icon: 'i-glyph:widget', value: 'dashboard' },
    { label: 'Analytics', icon: 'i-glyph:chart-2', value: 'analytics' },
    { label: 'Settings', icon: 'i-glyph:settings', value: 'settings' }
  ]
  let value = $state('dashboard')
</script>

<Grid {items} bind:value minSize="140px" />
```

**Custom tile content:**

```svelte
<Grid {items} bind:value>
  {#snippet itemContent(proxy)}
    <span class="text-2xl mb-1">{proxy.raw.emoji}</span>
    <span class="text-sm font-medium">{proxy.label}</span>
  {/snippet}
</Grid>
```

---

## File Reference

| Path | Purpose |
|------|---------|
| `packages/ui/src/components/Stack.svelte` | Flex layout container |
| `packages/ui/src/components/Divider.svelte` | Separator line with optional label |
| `packages/ui/src/components/Grid.svelte` | Responsive selectable tile grid |
| `packages/themes/src/base/stack.css` | Stack structural CSS |
| `packages/themes/src/base/divider.css` | Divider structural CSS |
| `packages/themes/src/base/grid.css` | Grid structural CSS |
