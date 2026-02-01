# Rokkit Architecture

> System architecture and design decisions for the Rokkit UI component library

## Package Architecture

### Package Hierarchy

```
@rokkit/core          ─── Foundation utilities, field mapping, types
     ↓
@rokkit/states        ─── Proxy system, controllers, vibe store
     ↓
@rokkit/actions       ─── Svelte actions (navigator, keyboard, themable)
     ↓
@rokkit/data          ─── Data utilities (filter, search, transform)
     ↓
@rokkit/ui            ─── Data-driven components
@rokkit/composables   ─── Composable primitives (bits-ui based)
     ↓
@rokkit/forms         ─── Form system (depends on ui)
@rokkit/chart         ─── Chart components
     ↓
@rokkit/themes        ─── CSS themes and styling
@rokkit/icons         ─── Icon system
```

### Component Categories

| Category | Package | Pattern | Example |
|----------|---------|---------|---------|
| Data-Driven | `@rokkit/ui` | Single component, options prop | `<List options={data} />` |
| Composable | `@rokkit/composables` | Compound components | `<Tree.Root><Tree.Node /></Tree.Root>` |
| Forms | `@rokkit/forms` | Schema-driven | `<FormRenderer {schema} />` |
| Charts | `@rokkit/chart` | Data + config | `<BarChart {data} {config} />` |
| Effects | `@rokkit/ui` | Wrapper components | `<Tilt><Card /></Tilt>` |

---

## Type System Architecture

### JSDoc Type Files

Each component category has a `types.js` file with JSDoc definitions:

```
packages/ui/src/
├── types.js                    # Base shared types
├── selection/
│   └── types.js               # Selection component types
├── hierarchical/
│   └── types.js               # Tree/nested component types
└── [component]/
    └── types.js               # Component-specific types
```

### Type Hierarchy

```javascript
// Base types (shared across all data-driven components)
BaseDataProps
├── options: any[]
├── fields: FieldMapping
└── class: string

BaseSelectionProps
├── value: any
├── name: string
├── tabindex: number
└── disabled: boolean

// Combined for selection components
DataSelectionProps = BaseDataProps & BaseSelectionProps

// Component-specific extensions
ListProps = DataSelectionProps & {
  multiSelect: boolean
  hierarchy: any[]
  child: Snippet
}
```

### Type Export Strategy

```javascript
// packages/ui/src/index.js
// Export all types for consumer verification
export * from './types.js'
export * from './list/types.js'
export * from './select/types.js'

// Export components
export { default as List } from './List.svelte'
export { default as Select } from './Select.svelte'
```

---

## Component Composition Patterns

### Separation of Concerns

#### ❌ Anti-Pattern: Feature Creep
```svelte
<!-- DON'T: Too many concerns in one component -->
<List 
  options={data}
  searchable={true}
  filterable={true}
  header="Title"
  footer={pagination}
  sortable={true}
/>
```

#### ✅ Pattern: Composition
```svelte
<!-- DO: Separate components composed together -->
<Panel>
  {#snippet header()}
    <SearchFilter bind:query onfilter={handleFilter} />
  {/snippet}
  
  <List options={filteredData} bind:value />
  
  {#snippet footer()}
    <Pagination {total} bind:page />
  {/snippet}
</Panel>
```

### Container Components

```
Panel (generic container)
├── header slot
├── body slot (default)
└── footer slot

SearchFilter (search/filter UI)
├── input
├── clear button
└── connects to @rokkit/data filter utilities

List/Tree (rendering only)
├── options rendering
├── selection handling
└── keyboard navigation
```

---

## State Management Architecture

### Vibe Store (Theme State)

```javascript
// @rokkit/states/vibe.svelte.js
export const vibe = $state({
  style: 'rokkit',        // Theme style: 'rokkit' | 'minimal' | 'material'
  palette: 'default',     // Color palette
  mode: 'light',          // Color mode: 'light' | 'dark'
  direction: 'ltr'        // Text direction: 'ltr' | 'rtl' (auto-detected)
})
```

**RTL Auto-Detection**:
```javascript
function detectDirection() {
  const lang = document.documentElement.lang || 'en'
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi']
  return rtlLanguages.some(l => lang.startsWith(l)) ? 'rtl' : 'ltr'
}
```

### ListController / NestedController

State management for selection components:

```javascript
// ListController manages:
- items (reactive array)
- selectedKeys (SvelteSet)
- focusedKey (current focus)
- selected (derived: selected values)
- focused (derived: focused value)

// Methods:
- moveFirst(), moveLast(), moveNext(), movePrev()
- select(key), extendSelection(key), toggleSelection(key)
```

### Proxy System

Data access abstraction for field mapping:

```javascript
import { Proxy } from '@rokkit/states'

const proxy = new Proxy(item, fields)

proxy.get('text')       // Get mapped field value
proxy.has('icon')       // Check field existence
proxy.value             // Original item
proxy.id                // Unique identifier
proxy.children          // Child proxies (hierarchical)
proxy.expanded          // Expansion state
```

---

## Navigation & Interaction Architecture

### Action System (`@rokkit/actions`)

| Action | Purpose |
|--------|---------|
| `navigator` | Keyboard navigation (arrows, home, end) |
| `navigable` | Makes element navigable |
| `keyboard` | Custom key mappings |
| `dismissable` | Escape/outside click handling |
| `swipeable` | Touch swipe gestures |
| `themable` | Theme attribute binding |
| `fillable` | Content-aware sizing |

### Navigator Configuration

```javascript
use:navigator={{
  orientation: 'vertical',  // 'vertical' | 'horizontal' | 'both'
  wrap: true,               // Wrap at boundaries
  rtl: vibe.direction === 'rtl'  // RTL awareness
}}
```

---

## Data Flow Architecture

### Filter/Search Pipeline

```
Raw Data
    ↓
@rokkit/data filter utilities
    ↓
Filtered Data (reactive)
    ↓
Component (List, Tree, etc.)
```

```javascript
import { createFilter } from '@rokkit/data'

const filter = createFilter({
  fields: ['name', 'description'],
  mode: 'fuzzy'  // 'exact' | 'fuzzy' | 'regex'
})

let filtered = $derived(filter.apply(options, searchText))
```

### TreeTable Data Transformation

```
Flat Tabular Data
    ↓
Hierarchy Column Config { field: 'path', separator: '/' }
    ↓
@rokkit/data transform
    ↓
Hierarchical Structure
    ↓
TreeTable Component
```

---

## Dropdown/Popover Architecture

### Directional Opening

```javascript
// Position calculation
function calculateDirection(triggerEl, viewportHeight) {
  const rect = triggerEl.getBoundingClientRect()
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top
  
  if (direction === 'auto') {
    return spaceBelow >= 300 || spaceBelow > spaceAbove ? 'down' : 'up'
  }
  return direction
}
```

### Component Structure

```
Select/Dropdown
├── Trigger (selected display)
├── Portal (optional)
│   └── Popover
│       ├── position: 'up' | 'down'
│       ├── align: 'start' | 'center' | 'end'
│       └── Content (List)
```

---

## Floating Actions Architecture

### FloatingActions Component

```svelte
<FloatingActions
  position="bottom-right"
  draggable={true}
  expanded={false}
>
  <FloatingAction icon="chat" label="Chat" onclick={openChat} />
  <FloatingAction icon="compose" label="New" onclick={compose} />
</FloatingActions>
```

### Implementation

```javascript
// Position management
const positions = {
  'bottom-right': { bottom: '24px', right: '24px' },
  'bottom-left': { bottom: '24px', left: '24px' },
  'top-right': { top: '24px', right: '24px' },
  'top-left': { top: '24px', left: '24px' }
}

// Drag handling
function handleDrag(event) {
  // Update position
  // Persist to localStorage
}
```

---

## Chart Architecture

### Animated Time Series

```
Time Series Data [{year, data}, ...]
    ↓
AnimatedChart wrapper
├── Time slider/playback controls
├── Interpolation engine (tweened arrays)
└── Current frame data
    ↓
Child Chart Component (BarChart, etc.)
```

### Array Interpolation

```javascript
import { tweened } from 'svelte/motion'

// Extend tweened to handle object arrays
function tweenedArray(initial, options) {
  return tweened(initial, {
    ...options,
    interpolate: (a, b) => (t) => {
      return a.map((item, i) => ({
        ...item,
        value: item.value + (b[i].value - item.value) * t
      }))
    }
  })
}
```

### Accessible Patterns

```
Symbol Library
├── circle, square, triangle, diamond, star
├── Used for data point markers
└── Distinguishable without color

Texture Library  
├── solid, striped, dotted, crosshatch, diagonal
├── Used for area/bar fills
└── SVG pattern definitions
```

---

## Forms Architecture

### Dynamic Lookups

```javascript
// Schema with lookup configuration
const schema = {
  country: {
    type: 'select',
    lookup: {
      url: '/api/countries',
      valueField: 'code',
      textField: 'name',
      cache: true
    }
  },
  city: {
    type: 'select',
    lookup: {
      url: '/api/cities',
      params: { country: '{country}' },  // Template reference
      dependsOn: ['country']
    }
  }
}
```

### Lookup Resolution Flow

```
Field Interaction
    ↓
Check dependsOn fields
    ↓
Resolve URL template with current values
    ↓
Fetch (with caching)
    ↓
Update field options
    ↓
Clear dependent fields if needed
```

---

## Accessibility Architecture

### Data Attributes

All interactive elements use data attributes for styling hooks:

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

### ARIA Pattern Library

| Component | Role | Key ARIA |
|-----------|------|----------|
| List | listbox | aria-selected, aria-activedescendant |
| Tree | tree | aria-expanded, aria-level |
| Tabs | tablist | aria-selected, aria-controls |
| Select | combobox | aria-expanded, aria-haspopup |
| Switch | listbox | aria-orientation |

### Keyboard Patterns

| Component | Navigation | Selection |
|-----------|------------|-----------|
| List | Up/Down | Enter/Space |
| Tree | Up/Down/Left/Right | Enter/Space |
| Tabs | Left/Right or Up/Down | Auto on focus |
| Select | Up/Down | Enter |

---

## Build & Distribution

### Package Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./src/index.js",
      "svelte": "./src/index.js"
    },
    "./types": {
      "types": "./dist/types.d.ts",
      "import": "./src/types.js"
    }
  }
}
```

### TypeScript Generation

```bash
# Generate .d.ts from JSDoc
tsc --project tsconfig.build.json
```

```json
// tsconfig.build.json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "allowJs": true,
    "checkJs": true
  }
}
```
