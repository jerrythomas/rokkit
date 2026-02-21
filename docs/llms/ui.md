# @rokkit/ui

> 15 data-driven UI components for Svelte 5 with field mapping, custom snippets, and keyboard navigation.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/states, @rokkit/actions, svelte (peer), shiki (peer)
**Depended on by**: @rokkit/forms, @rokkit/app, application UI

**Note**: Per ADR-003, states and actions dependencies added. Components are being migrated from inline logic to shared controllers/actions (Phase C).

## Exports

### Components

| Export | Key Props | Description |
|--------|-----------|-------------|
| `Button` | variant, style, size, label, icon, href, loading, disabled, onclick | Semantic button or link |
| `ButtonGroup` | size, children | Groups related buttons |
| `Code` | code, language, theme, showLineNumbers, showCopyButton | Syntax-highlighted code block (Shiki) |
| `List` | items, fields, value, size, collapsible, expanded, active, onselect | Flat or grouped list with keyboard nav |
| `Tree` | items, fields, value, showLines, expanded, expandAll, active, onselect, ontoggle | Hierarchical tree with connectors |
| `Select` | options, fields, value, placeholder, size, align, direction, maxRows, onchange | Single-select dropdown |
| `MultiSelect` | options, fields, value, maxDisplay, onchange | Multi-select with tag display |
| `Menu` | options, fields, label, icon, showArrow, size, align, direction, onselect | Action dropdown menu |
| `Toggle` | options, fields, value, showLabels, size, onchange | Mutually exclusive toggle group (uses ListController + navigator) |
| `Toolbar` | items, fields, position, size, sticky, compact, showDividers, onclick | Horizontal/vertical toolbar |
| `ToolbarGroup` | label, gap, children | Grouped toolbar section |
| `FloatingAction` | items, fields, icon, position, expand, open, backdrop, onselect | Speed dial floating button |
| `PaletteManager` | (palette management props) | Color palette UI |
| `Connector` | (internal) | Tree line connector renderer |
| `ItemContent` | (internal) | Item with icon, text, description, badge |

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

Toggle is the first component migrated to the shared MVC pattern:
- **Model**: `ListController` from `@rokkit/states` — manages focus, selection, navigation state
- **Controller**: `navigator` action from `@rokkit/actions` — keyboard (ArrowLeft/Right, Home/End) and click handling
- **View**: Component `.svelte` file — rendering, DOM focus management

`ListController.moveToValue()` accepts both full item objects and extracted value-field primitives (e.g., `'a'` matches `{ text: 'A', value: 'a' }`). Use `lastSyncedValue` guard to prevent the value-sync `$effect` from fighting navigator focus moves.

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

**Compliant**: Toggle, Select, List, Tree. **Pending migration**: MultiSelect (backlog #34 — currently stores full item objects).

### Button Variants

```svelte
<Button variant="primary" style="outline" size="lg" icon="i-save" label="Save" />
<Button href="/about">About</Button>  <!-- renders as <a> -->
```
