# @rokkit/ui

> 24 UI components for Svelte 5 with field mapping, custom snippets, keyboard navigation, and data-attribute theming.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/states, @rokkit/actions, svelte (peer), shiki (peer)
**Depended on by**: @rokkit/forms, @rokkit/app, application UI

**Note**: Per ADR-003, states and actions dependencies added. All interactive components use shared controllers/actions (ListController + navigator, or keyboard + swipeable).

## Exports

### Components

#### Interactive (data-driven, keyboard navigable)

| Export | Key Props | Navigation | Description |
|--------|-----------|------------|-------------|
| `List` | items, fields, value, size, collapsible, expanded, active, onselect | NestedController + navigator | Flat or grouped list with keyboard nav |
| `Tree` | items, fields, value, showLines, expanded, expandAll, active, onselect, ontoggle | NestedController + navigator | Hierarchical tree with connectors |
| `Select` | options, fields, value, placeholder, size, align, direction, maxRows, onchange | ListController + navigator | Single-select dropdown |
| `MultiSelect` | options, fields, value, maxDisplay, onchange | ListController + navigator | Multi-select with tag display |
| `Menu` | options, fields, label, icon, showArrow, size, align, direction, onselect | ListController + navigator | Action dropdown menu |
| `Toggle` | options, fields, value, showLabels, size, onchange | ListController + navigator | Mutually exclusive toggle group |
| `Tabs` | items, fields, value, position, size, onchange | ListController + navigator | Tab bar with panel content |
| `Toolbar` | items, fields, position, size, sticky, compact, showDividers, onclick | ListController + navigator | Horizontal/vertical toolbar |
| `Carousel` | count, current, autoplay, interval, loop, showDots, showArrows, transition, slide | keyboard + swipeable | Content slides with dots, arrows, swipe, autoplay |

#### Presentational

| Export | Key Props | Description |
|--------|-----------|-------------|
| `Button` | variant, style, size, label, icon, href, loading, disabled, onclick | Semantic button or link |
| `ButtonGroup` | size, children | Groups related buttons |
| `Code` | code, language, theme, showLineNumbers, showCopyButton | Syntax-highlighted code block (Shiki) |
| `BreadCrumbs` | items, fields, separator, onclick, crumb | Navigation breadcrumbs with ARIA |
| `Card` | href, onclick, header, footer, children | Flexible content container (div/a/button) |
| `Pill` | value, fields, removable, disabled, onremove, content | Tag/chip with optional icon and remove |
| `ProgressBar` | value, max | Determinate or indeterminate progress bar |
| `Rating` | value, max, disabled, filledIcon, emptyIcon, onchange | Star/icon rating input with keyboard nav |
| `ToolbarGroup` | label, gap, children | Grouped toolbar section |
| `FloatingAction` | items, fields, icon, position, expand, open, backdrop, onselect | Speed dial floating button |
| `PaletteManager` | (palette management props) | Color palette UI |

#### Visual Effects

| Export | Key Props | Description |
|--------|-----------|-------------|
| `Tilt` | maxRotation, setBrightness, perspective | Parallax 3D tilt effect on mouse move |
| `Shine` | color, radius, depth, surfaceScale, specularConstant, specularExponent | SVG specular lighting effect following cursor |

#### Internal

| Export | Description |
|--------|-------------|
| `Connector` | Tree line connector renderer |
| `ItemContent` | Item with icon, text, description, badge |

### Utilities

| Export | Signature | Description |
|--------|-----------|-------------|
| `highlightCode(code, lang, theme)` | Highlight code string using Shiki |
| `preloadHighlighter(languages)` | Pre-load highlighter for languages |
| `getSupportedLanguages()` | Get supported language identifiers |

### Types

All types exported from `@rokkit/ui/types`:

| Module | Key Exports |
|--------|-------------|
| `button.ts` | `ButtonVariant`, `ButtonStyle`, `ButtonProps`, `ButtonGroupProps` |
| `select.ts` | `SelectFields`, `SelectProps`, `MultiSelectProps`, `SelectStateIcons` |
| `menu.ts` | `MenuFields`, `MenuProps`, `MenuStateIcons` |
| `list.ts` | `ListFields`, `ListProps`, `ListStateIcons` |
| `tree.ts` | `TreeFields`, `TreeProps`, `TreeStateIcons`, `getLineTypes()`, `getNodeKey()` |
| `toggle.ts` | `ToggleFields`, `ToggleProps` |
| `toolbar.ts` | `ToolbarProps`, `ToolbarGroupProps` |
| `floating-action.ts` | `FloatingActionProps` |
| `code.ts` | `CodeProps`, `CodeStateIcons` |
| `item-proxy.ts` | `ItemFields`, `ItemProxy` class |

### ItemProxy

Field mapping accessor for data-driven components (parallel to `@rokkit/states.Proxy`):

```typescript
const proxy = new ItemProxy(item, fields)
proxy.text              // Mapped text field
proxy.value             // Mapped value field
proxy.icon              // Mapped icon field
proxy.description       // Mapped description
proxy.disabled          // Mapped disabled state
proxy.hasChildren       // Boolean
proxy.children          // Child items
proxy.createChildProxy(child)  // Create proxy for child item
```

## Key Patterns

### Field Mapping

```svelte
<Select options={users} fields={{ text: 'fullName', value: 'userId', description: 'email' }} bind:value />
```

### Custom Snippets

```svelte
{#snippet customItem(item, fields, handlers)}
  <button onclick={handlers.onclick}>
    <i class={item.icon}></i> {item.text}
  </button>
{/snippet}

<Menu options={items} item={customItem} />
```

### Grouped/Hierarchical Data

```svelte
<List items={groupedData} collapsible bind:expanded />
<Tree items={nestedData} showLines expandAll />
```

### MVC Pattern (ADR-003)

All interactive components use shared controllers and actions:

**Pattern A — ListController + navigator** (Toggle, Tabs, Select, MultiSelect, Menu, Toolbar):
- **Model**: `ListController` from `@rokkit/states` — manages focus, selection, navigation
- **Controller**: `navigator` action from `@rokkit/actions` — keyboard (ArrowLeft/Right, Home/End) and click interception via `data-path`
- **View**: Component `.svelte` file — rendering, DOM focus management

**Pattern B — NestedController + navigator** (List, Tree):
- Same as Pattern A but with `NestedController` for hierarchical data (expand/collapse, parent/child navigation)

**Pattern C — keyboard + swipeable** (Carousel):
- `keyboard` action maps keys to named custom events (prev, next, first, last)
- `swipeable` action handles touch/mouse swipe gestures
- No controller needed — simple index state

**Key implementation notes:**
- `ListController.moveToValue()` accepts both full item objects and extracted value-field primitives
- Use `lastSyncedValue` guard to prevent value-sync `$effect` from fighting navigator focus moves
- Elements with `data-path` have clicks intercepted by navigator — do NOT add `onclick` handlers on these elements

```svelte
let controller = new ListController(options, value, userFields)
let lastSyncedValue = value

$effect(() => {
  if (value !== lastSyncedValue) {
    lastSyncedValue = value
    controller.moveToValue(value)
  }
})
```

### Value Binding Contract

All selection components use extracted value-field primitives (not full objects) for `value`:

| Prop | Type | Description |
|------|------|-------------|
| `value` (bindable) | `unknown` (single) or `unknown[]` (multi) | The extracted `item[fields.value]` primitive |
| `onchange` / `onselect` | `(value, item) => void` | First arg: extracted primitive. Second arg: full item object |

```svelte
<!-- fields.value defaults to 'value', so value binds to item.value -->
<Select options={users} fields={{ text: 'name', value: 'id' }} bind:value={selectedUserId} />

<!-- For string arrays, the item IS the value -->
<Toggle options={['day', 'week', 'month']} bind:value={period} />
```

**Compliant**: Toggle, Select, List, Tree, Tabs, Toolbar, Menu. **Pending migration**: MultiSelect (backlog #28 — currently stores full item objects).

### Button Variants

```svelte
<Button variant="primary" style="outline" size="lg" icon="i-save" label="Save" />
<Button href="/about">About</Button>  <!-- renders as <a> -->
```
