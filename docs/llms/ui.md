# @rokkit/ui

> 15 data-driven UI components for Svelte 5 with field mapping, custom snippets, and keyboard navigation.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, svelte (peer), shiki (peer)
**Depended on by**: @rokkit/forms, @rokkit/app, application UI

**Note**: ADR-003 proposes adding @rokkit/states and @rokkit/actions as dependencies to eliminate ~1200 lines of duplicated navigation/selection logic.

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
| `Toggle` | options, fields, value, showLabels, size, onchange | Mutually exclusive toggle group |
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

### Button Variants

```svelte
<Button variant="primary" style="outline" size="lg" icon="i-save" label="Save" />
<Button href="/about">About</Button>  <!-- renders as <a> -->
```
