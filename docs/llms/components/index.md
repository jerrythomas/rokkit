# @rokkit/ui — Components Overview

> 33 Svelte 5 components with field mapping, custom snippets, keyboard navigation, and data-attribute theming.

**Package**: `@rokkit/ui`
**Depends on**: `@rokkit/core`, `@rokkit/states`, `@rokkit/actions`, `svelte` (peer), `shiki` (peer)

## Component Categories

### Interactive — Data-driven, keyboard navigable

Uses `ListController` or `NestedController` + `navigator` action (ADR-003).

| Component | Navigation | Description |
|-----------|------------|-------------|
| [List](list.md) | NestedController + navigator | Flat or grouped list |
| [Tree](tree.md) | NestedController + navigator | Hierarchical tree with connectors |
| [Select](select.md) | ListController + navigator | Single-select dropdown |
| [MultiSelect](multi-select.md) | ListController + navigator | Multi-select with tags |
| [Menu](menu.md) | ListController + navigator | Action dropdown menu |
| [Toggle](toggle.md) | ListController + navigator | Mutually exclusive button group |
| [Tabs](tabs.md) | ListController + navigator | Tab bar with panel content |
| [Toolbar](toolbar.md) | ListController + navigator | Horizontal/vertical toolbar |
| [Switch](switch.md) | None (single button) | iOS-style binary toggle |
| [Carousel](carousel.md) | keyboard + swipeable | Content slides with autoplay |
| [Table](table.md) | TableController + navigator | Sortable data table |
| [Range](range.md) | keyboard + pannable | Single or dual-handle slider |
| [SearchFilter](search-filter.md) | None (text input) | Search with structured filter parsing |

### Presentational

| Component | Description |
|-----------|-------------|
| [Button / ButtonGroup](button.md) | Semantic button or link (div/a/button) |
| [BreadCrumbs](breadcrumbs.md) | Navigation breadcrumbs with ARIA |
| [Card](card.md) | Flexible content container |
| [Pill](pill.md) | Tag/chip with optional icon and remove |
| [ProgressBar](progress-bar.md) | Determinate or indeterminate progress |
| [Rating](rating.md) | Star/icon rating input |
| [Stepper](stepper.md) | Step progress indicator |
| [Timeline](timeline.md) | Vertical sequence of events |
| [Code](code.md) | Syntax-highlighted code block (Shiki) |

### Overlay / Navigation

| Component | Description |
|-----------|-------------|
| [FloatingAction](floating-action.md) | Speed dial floating button |
| [FloatingNavigation](floating-navigation.md) | Edge-anchored nav with IntersectionObserver |

### Visual Effects

| Component | Description |
|-----------|-------------|
| [Reveal](reveal.md) | Scroll-triggered entry animation wrapper |
| [Tilt](tilt.md) | Parallax 3D tilt on mouse move |
| [Shine](shine.md) | SVG specular lighting following cursor |

### Internal (not for direct use)

| Component | Description |
|-----------|-------------|
| `Connector` | Tree line connector renderer |
| `ItemContent` | Item with icon, text, description, badge |
| `PaletteManager` | Color palette management UI |

---

## Universal Patterns

### Field Mapping

All data-driven components accept a `fields` prop to map custom property names:

```svelte
<Select options={users} fields={{ text: 'fullName', value: 'userId', description: 'email' }} />
<List items={data} fields={{ text: 'label', icon: 'avatar', children: 'nodes' }} />
```

Default field names: `text`, `value`, `icon`, `description`, `disabled`, `children`, `href`.

### Custom Snippets

```svelte
{#snippet customItem(item, fields, handlers)}
  <button onclick={handlers.onclick}>
    <span class={item.icon}></span> {item.text}
  </button>
{/snippet}

<Menu options={items} item={customItem} />
```

### Value Binding Contract

All selection components bind **extracted primitives** (not full item objects):

```svelte
<!-- bind:value gets item[fields.value] -->
<Select options={users} fields={{ text: 'name', value: 'id' }} bind:value={selectedUserId} />

<!-- For primitive arrays, the item IS the value -->
<Toggle options={['day', 'week', 'month']} bind:value={period} />
```

`onchange(value, item)` — first arg is the extracted primitive, second is the full item object.

### Multi-Selection (List + Tree)

```svelte
<List items={data} multiselect bind:selected={selectedItems} onselectedchange={(items) => ...} />
```
`Ctrl+click` toggles; `Shift+click` selects a range; `Shift+Space` keyboard range.

### MVC Navigation (ADR-003)

All interactive components use:
- **Model**: `ListController` or `NestedController` from `@rokkit/states`
- **Controller**: `navigator` action from `@rokkit/actions`
- **View**: `.svelte` file handles rendering + DOM focus

Key rule: **do not add `onclick` on elements with `data-path`** — navigator intercepts clicks.

### Theming

Components use `data-*` attributes for CSS hooks:

```css
[data-list] { ... }
[data-list-item][data-focused] { ... }
[data-list-item][data-selected] { ... }
[data-style="minimal"] [data-list] { ... }
```

Import theme CSS from `@rokkit/themes`:

```js
import '@rokkit/themes'               // All themes bundled
import '@rokkit/themes/base'          // Structural only
import '@rokkit/themes/rokkit'        // Default theme
```

## Utilities

| Export | Description |
|--------|-------------|
| `highlightCode(code, lang, theme)` | Syntax highlight via Shiki |
| `preloadHighlighter(languages)` | Pre-load Shiki for languages |
| `getSupportedLanguages()` | List supported language IDs |

## Types

All types from `@rokkit/ui/types`:

```typescript
import type { ListProps, SelectProps, ButtonProps, TreeProps } from '@rokkit/ui/types'
```

| Module | Key Types |
|--------|-----------|
| `button.ts` | `ButtonVariant`, `ButtonStyle`, `ButtonProps`, `ButtonGroupProps` |
| `select.ts` | `SelectFields`, `SelectProps`, `MultiSelectProps`, `SelectStateIcons` |
| `menu.ts` | `MenuFields`, `MenuProps`, `MenuStateIcons` |
| `list.ts` | `ListFields`, `ListProps`, `ListStateIcons` |
| `tree.ts` | `TreeFields`, `TreeProps`, `TreeStateIcons` |
| `toggle.ts` | `ToggleFields`, `ToggleProps` |
| `toolbar.ts` | `ToolbarProps`, `ToolbarGroupProps` |
| `floating-action.ts` | `FloatingActionProps` |
| `floating-navigation.ts` | `FloatingNavigationProps` |
| `code.ts` | `CodeProps`, `CodeStateIcons` |
| `item-proxy.ts` | `ItemFields`, `ItemProxy` class |
| `switch.ts` | `SwitchProps`, `SwitchFields`, `SwitchItem` |
| `range.ts` | `RangeProps` |
| `timeline.ts` | `TimelineProps`, `TimelineFields` |
| `search-filter.ts` | `SearchFilterProps`, `FilterObject` |
