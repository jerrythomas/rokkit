# Shared Content Component (Backlog #72)

**Date:** 2026-03-01
**Status:** Approved

## Goal

Expand `ItemContent.svelte` to be the canonical default item content renderer for all data-driven components (List, Menu, Select, MultiSelect, Tree). Renders the visual "cell" inside a button/link container.

## Scope

**Inner content only.** Each component keeps its own container element (button/link) with component-specific data attributes (`data-list-item`, `data-menu-item`, etc.) and ARIA roles. The shared component handles what goes *inside* that container.

**Generic `data-item-*` attributes** for all inner content elements. Component-specific prefixes (`data-list-item-icon`, `data-menu-item-icon`) are replaced with generic ones (`data-item-icon`).

## Template

```svelte
<!-- ItemContent.svelte -->
{#if proxy.get('avatar')}
  <img data-item-avatar src={proxy.get('avatar')} alt={proxy.get('tooltip') ?? proxy.label} />
{:else if proxy.get('icon')}
  <span data-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
{/if}
{#if proxy.label || proxy.get('subtext')}
  <span data-item-text>
    <span data-item-label>{proxy.label}</span>
    {#if proxy.get('subtext')}
      <span data-item-description>{proxy.get('subtext')}</span>
    {/if}
  </span>
{/if}
{#if proxy.get('badge')}
  <span data-item-badge>{proxy.get('badge')}</span>
{/if}
{#if proxy.get('shortcut')}
  <kbd data-item-shortcut>{proxy.get('shortcut')}</kbd>
{/if}
```

Fields rendered (all from BASE_FIELDS):
- `avatar` — `<img>` with alt from `tooltip ?? label` (mutually exclusive with icon)
- `icon` — iconify class `<span>` with aria-hidden
- `label` — primary text
- `subtext` — secondary text (smaller, below label)
- `badge` — trailing badge (pill-shaped)
- `shortcut` — keyboard shortcut (`<kbd>`)

## Component Changes

Each component replaces its inline `defaultItemContent` snippet body with `<ItemContent {proxy} />`:

| Component | Current default content | After |
|-----------|----------------------|-------|
| List | icon + label (inline snippet) | `<ItemContent {proxy} />` |
| Menu | icon + label (inline snippet) | `<ItemContent {proxy} />` |
| Select | icon + label + description (inline snippet) | `<ItemContent {proxy} />` |
| MultiSelect | icon + label (inline snippet) | `<ItemContent {proxy} />` |
| Tree | Already uses `<ItemContent {proxy} />` | Update to new template |

Group content stays component-specific (collapsible groups differ: expand icons, accordion triggers, non-interactive headers).

## Theme CSS Changes

- `base/item.css` — add `[data-item-avatar]` and `[data-item-shortcut]` rules
- `base/list.css` — remove `[data-list-item-icon]`, `[data-list-item-text]` if present (replaced by generic)
- `base/menu.css` — remove `[data-menu-item-icon]`, `[data-menu-item-text]` if present
- Theme variant files (rokkit/, minimal/, material/, glass/) — update selectors from component-specific to generic `data-item-*` for inner content elements
- Group content attributes (`data-list-group-icon`, `data-menu-group-icon`, etc.) stay component-specific

## Data Attribute Convention

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-item-avatar` | `<img>` | Avatar image |
| `data-item-icon` | `<span>` | Iconify icon class |
| `data-item-text` | `<span>` | Text container (label + subtext) |
| `data-item-label` | `<span>` | Primary text |
| `data-item-description` | `<span>` | Secondary text |
| `data-item-badge` | `<span>` | Badge pill |
| `data-item-shortcut` | `<kbd>` | Keyboard shortcut |
