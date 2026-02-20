# Component Patterns & Standards

> Architectural standards and conventions for all Rokkit UI components.

## 1. Type System Architecture

### 1.1 JSDoc Types with Separate Type Files

All component props must be extracted into separate `types.js` files using JSDoc for type definitions.

```
packages/ui/src/
├── types.js              # Shared base types
├── list/
│   ├── List.svelte
│   └── types.js          # List-specific types
├── select/
│   ├── Select.svelte
│   └── types.js          # Select-specific types
```

### 1.2 Base Props Types

Common props shared across data-driven components:

```javascript
// packages/ui/src/types.js

/**
 * Base props for all data-driven components
 * @typedef {Object} BaseDataProps
 * @property {any[]} [options=[]] - Data array
 * @property {Object} [fields={}] - Field mapping configuration
 * @property {string} [class=''] - CSS class names
 */

/**
 * Base props for selection components
 * @typedef {Object} BaseSelectionProps
 * @property {any} [value] - Selected value (bindable)
 * @property {string} [name] - Accessibility name / form name
 * @property {number} [tabindex=0] - Tab index for keyboard focus
 * @property {boolean} [disabled=false] - Disable interaction
 */

/**
 * Combined base for data-driven selection components
 * @typedef {BaseDataProps & BaseSelectionProps} DataSelectionProps
 */

/**
 * Standard field mapping
 * @typedef {Object} FieldMapping
 * @property {string} [value='value'] - Unique identifier field
 * @property {string} [text='text'] - Display text field
 * @property {string} [icon='icon'] - Icon field
 * @property {string} [image='image'] - Image URL field
 * @property {string} [children='children'] - Nested items field
 * @property {string} [disabled='disabled'] - Disabled state field
 * @property {string} [expanded='_expanded'] - Expansion state field
 * @property {string} [selected='_selected'] - Selection state field
 */
```

### 1.3 Component-Specific Types

Extend base types for specific components:

```javascript
// packages/ui/src/list/types.js
import { DataSelectionProps, FieldMapping } from '../types.js'

/**
 * List component props
 * @typedef {DataSelectionProps & ListSpecificProps} ListProps
 */

/**
 * @typedef {Object} ListSpecificProps
 * @property {boolean} [multiSelect=false] - Enable multiple selection
 * @property {any[]} [hierarchy=[]] - Nested list support
 * @property {import('svelte').Snippet} [header] - Header snippet
 * @property {import('svelte').Snippet} [footer] - Footer snippet
 * @property {import('svelte').Snippet} [empty] - Empty state snippet
 * @property {import('svelte').Snippet<[Proxy]>} [child] - Item renderer
 */
```

### 1.4 Type Export Requirements

All types MUST be exported from the package for consumer type verification:

```javascript
// packages/ui/src/index.js
export * from './types.js'
export * from './list/types.js'
export * from './select/types.js'
// ... etc
```

## 2. Component Architecture Patterns

### 2.1 Data-Driven vs Composable Components

#### Data-Driven Components (`@rokkit/ui`)
- Accept `items` prop with data array
- Use Proxy/ItemProxy for field mapping
- Single component usage: `<List items={data} />`
- Handle data transformation internally

#### Composable Components (`@rokkit/composables`)
- Compound component pattern
- Maximum flexibility: `<Tree.Root><Tree.Node /></Tree.Root>`
- User controls structure explicitly
- Built on bits-ui for a11y foundation

### 2.2 Separation of Concerns

#### Search/Filter — Always a Separate Component

Search and filter functionality MUST be a separate component, NOT built into List/Tree:

```svelte
<!-- CORRECT: Separate filter component -->
<script>
  import { SearchFilter, List } from '@rokkit/ui'
  import { filterStore } from '@rokkit/data'

  let options = [...]
  let filtered = $derived(filterStore.apply(options, searchText))
</script>

<SearchFilter bind:value={searchText} />
<List options={filtered} />
```

```svelte
<!-- INCORRECT: searchable prop on List -->
<List options={data} searchable={true} />
```

**Rationale**:
- Keeps List focused on rendering and selection
- Filter logic is reusable across components
- Enables complex filter combinations
- Works with `@rokkit/data` filter utilities

#### Container Components — Composition Over Props

Header/body/footer structure should be a SEPARATE container component:

```svelte
<!-- CORRECT: Use Panel container -->
<Panel>
  {#snippet header()}
    <SearchFilter bind:value={searchText} />
  {/snippet}

  {#snippet body()}
    <List options={filtered} />
  {/snippet}

  {#snippet footer()}
    <Pagination {total} bind:page />
  {/snippet}
</Panel>
```

**Components to create**:
- `Panel` — Generic header/body/footer container (see `040-layout.md`)
- `SearchFilter` — Search input with filter capabilities (see `070-data.md`)

## 3. TypeScript Strategy

### 3.1 Recommended Approach

**Packages**: JSDoc with separate `types.js` files
- Generates `.d.ts` on build
- Works in plain JS environments
- Types exported for consumers

**Sites (SvelteKit)**: TypeScript
- Full TS support in routes/components
- Better IDE integration
- Type imports from packages

```javascript
// Package: packages/ui/src/types.js (JSDoc)
/**
 * @typedef {Object} ListProps
 * ...
 */

// Site: sites/learn/src/routes/+page.svelte (TypeScript)
<script lang="ts">
  import type { ListProps } from '@rokkit/ui'
</script>
```

### 3.2 Current State

The current implementation uses TypeScript `.ts` type files rather than JSDoc. This works but diverges from the target convention. Migration is low priority since `.ts` files work well in the SvelteKit ecosystem.

## 4. Data Attributes

All interactive elements use data attributes for theming hooks (no CSS class names):

```html
<div
  data-list-item
  data-selected="true"
  data-focused="false"
  data-disabled="false"
  role="option"
  aria-selected="true"
>
```

## 5. Snippet Support

Components must support customization via snippets:

```svelte
{#snippet child(node)}
  <CustomRenderer data={node.value} />
{/snippet}
```
