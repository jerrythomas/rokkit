# Component Requirements

> Standards and requirements for all Rokkit UI components

## Type System Architecture

### JSDoc Types with Separate Type Files

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

### Base Props Types

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

### Component-Specific Types

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

### Type Export Requirements

All types MUST be exported from the package for consumer type verification:

```javascript
// packages/ui/src/index.js
export * from './types.js'
export * from './list/types.js'
export * from './select/types.js'
// ... etc
```

---

## Component Architecture Patterns

### Data-Driven vs Composable Components

#### Data-Driven Components (`@rokkit/ui`)
- Accept `options` prop with data array
- Use Proxy system for field mapping
- Single component usage: `<List options={data} />`
- Handle data transformation internally

#### Composable Components (`@rokkit/composables`)
- Compound component pattern
- Maximum flexibility: `<Tree.Root><Tree.Node /></Tree.Root>`
- User controls structure explicitly
- Built on bits-ui for a11y foundation

### Separation of Concerns

#### Search/Filter Component (NEW REQUIREMENT)

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

#### Container Components (NEW REQUIREMENT)

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
- `Panel` - Generic header/body/footer container
- `SearchFilter` - Search input with filter capabilities
- Connect to `@rokkit/data` filter/search utilities

---

## Dropdown/Popover Requirements

### Directional Support (NEW REQUIREMENT)

Select and dropdown components MUST support directional opening:

```svelte
<Select 
  options={data} 
  direction="up"      <!-- 'up' | 'down' | 'auto' -->
  align="start"       <!-- 'start' | 'center' | 'end' -->
/>
```

**Auto direction**: Detect available viewport space and open in direction with more room.

---

## Floating Action Menu (NEW REQUIREMENT)

Create overlay action menu component:

```svelte
<FloatingActions 
  position="bottom-right"   <!-- 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' -->
  draggable={true}          <!-- Allow repositioning -->
>
  <FloatingAction icon="chat" onclick={openChat} />
  <FloatingAction icon="compose" onclick={newEmail} />
  <FloatingAction icon="settings" onclick={openSettings} />
</FloatingActions>
```

**Features**:
- Fixed position with configurable anchor
- Draggable repositioning (persists position)
- Expandable/collapsible menu
- Mobile-friendly touch targets
- Similar to Outlook mobile action button

---

## RTL Support (NEW REQUIREMENT)

### Implicit RTL Detection

RTL support should derive from HTML `lang` attribute automatically:

```javascript
// @rokkit/states/vibe.svelte.js
import { detectRTL } from '@rokkit/core'

export const vibe = $state({
  style: 'rokkit',      // Theme style
  palette: 'default',   // Color palette  
  mode: 'light',        // 'light' | 'dark'
  direction: detectRTL() // 'ltr' | 'rtl' - derived from document.documentElement.lang
})
```

**Implementation**:
- Auto-detect from `<html lang="ar">` or similar RTL languages
- Expose as reactive store value
- Components read direction from vibe store
- Arrow key navigation adapts automatically

### Vibe Store Naming

Consider renaming for clarity:
- `vibe` → `theme` or `skin` (more familiar terminology)
- Keep `vibe` as alias for backwards compatibility

---

## TreeTable Requirements (NEW REQUIREMENT)

### Tabular Data Input

TreeTable MUST support flat array of objects with hierarchy column configuration:

```svelte
<script>
  // Flat tabular data
  const data = [
    { path: 'src/components/Button.svelte', size: 2048, modified: '2024-01-15' },
    { path: 'src/components/List.svelte', size: 4096, modified: '2024-01-14' },
    { path: 'src/utils/helpers.js', size: 1024, modified: '2024-01-13' }
  ]
  
  const columns = [
    { field: 'path', hierarchy: true, separator: '/' },  // Hierarchy column
    { field: 'size', format: 'bytes' },
    { field: 'modified', format: 'date' }
  ]
</script>

<TreeTable {data} {columns} />
```

**Data transformation**:
- Uses `@rokkit/data` DataFrame or similar utility
- Transforms flat data into hierarchical structure
- Hierarchy column config: `{ hierarchy: true, separator: '/' }`
- Preserves original row data at leaf nodes

---

## Presentation Effect Components

### Effect Wrappers

Components focused on visual presentation effects:

| Component | Effect |
|-----------|--------|
| `Tilt` | 3D tilt on hover/mouse movement |
| `Shine` | Glossy shine effect |
| `Glow` | Glow/shadow effect (NEW) |
| `Depth3D` | 3D depth/perspective (NEW) |
| `Motion` | Entry/exit animations (NEW) |
| `Parallax` | Parallax scroll effect (NEW) |

```svelte
<Tilt intensity={0.5}>
  <Shine>
    <Card>Content</Card>
  </Shine>
</Tilt>
```

---

## Chart Components Requirements

### Animated Time Series (NEW REQUIREMENT)

Support animated transitions showing data evolution over time:

```svelte
<script>
  import { AnimatedChart, BarChart } from '@rokkit/chart'
  
  const timeSeriesData = [
    { year: 2020, data: [...] },
    { year: 2021, data: [...] },
    { year: 2022, data: [...] }
  ]
</script>

<AnimatedChart 
  data={timeSeriesData} 
  timeField="year"
  duration={500}
  interpolate={true}
>
  <BarChart />
</AnimatedChart>
```

**Features**:
- Wrapper component handles animation
- Uses Svelte's tweened/spring for smooth transitions
- Extends array interpolation for object arrays
- Bars smoothly shift positions as values change

### Accessible Chart Patterns

Support for color perception accessibility:

```svelte
<BarChart {data} accessible={true}>
  <!-- Uses patterns/textures instead of colors only -->
</BarChart>
```

**Implementation**:
- Symbol library for data points
- Texture library for filled areas
- Pattern fills for bars/areas
- Works alongside color for dual-coding

---

## Forms Requirements

### Dynamic Lookups (NEW REQUIREMENT)

Forms must support external data sources and connected fields:

```svelte
<script>
  const schema = {
    country: { 
      type: 'select',
      lookup: '/api/countries',  // External source
      onChange: 'city'           // Triggers city reload
    },
    city: {
      type: 'select',
      lookup: '/api/cities?country={country}',  // Depends on country
      dependsOn: ['country']
    }
  }
</script>

<FormRenderer {schema} bind:data />
```

**Features**:
- Async lookup data fetching
- Field dependencies (changing A affects B's options)
- Caching for repeated lookups
- Loading states during fetch

---

## TypeScript Strategy

### Recommended Approach

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

---

## CLI Integration (NEW REQUIREMENT)

### svelte-add Support

Enable adding Rokkit to existing projects:

```bash
# Using svelte-add
npx svelte-add rokkit

# Or using rokkit CLI
npx @rokkit/cli init
npx @rokkit/cli add ui forms themes
```

**CLI features**:
- Add packages selectively
- Configure theme
- Setup TypeScript types
- Add UnoCSS preset
