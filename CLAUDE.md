# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rokkit is a cutting-edge data-driven UI library built for Svelte 5. It empowers developers to build stunning, flexible user interfaces with minimal effort while maintaining full control over styling and behavior. The library is designed around the principle that **data should drive the interface**, not the other way around.

## Core Principles

### Data-First Design
Components automatically understand and adapt to data structures without requiring data transformation:
```svelte
<!-- Data shapes the component, not vice versa -->
<List options={users} fields={{ text: 'fullName', image: 'avatar' }} />
<List options={products} fields={{ text: 'title', image: 'thumbnail' }} />
```

### Composable Flexibility
Every component is extensible without modification through snippets:
```svelte
<List {options}>
  {#snippet child(node)}
    <MyCustomComponent data={node.value} />
  {/snippet}
</List>
```

### Consistent API Patterns
All data-driven selection components follow the same pattern:
- `options`: Data array (standardized name)
- `value`: Selected item(s) (bindable)
- `fields`: Field mapping configuration
- `child`: Optional child snippet. Takes a `Proxy` class instance as input

### Separation of Concerns
- **List/Tree**: Rendering and selection ONLY (no search/filter built-in)
- **SearchFilter**: Separate component for filtering
- **Panel**: Generic container with header/body/footer
- Compose components together rather than adding features to existing ones

## Architecture

The project is organized as a Bun workspace monorepo:

- **packages/**: Core library packages
  - `@rokkit/core`: Core utilities, field mapping, base types
  - `@rokkit/states`: Proxy system, controllers, vibe store
  - `@rokkit/actions`: Svelte actions (navigator, keyboard, themable)
  - `@rokkit/data`: Data utilities (filter, search, transform)
  - `@rokkit/ui`: Data-driven components
  - `@rokkit/composables`: Composable primitives (bits-ui based)
  - `@rokkit/forms`: Form system with schema support
  - `@rokkit/chart`: Chart components
  - `@rokkit/themes`: CSS themes and styling
  - `@rokkit/icons`: Icon system
  - `@rokkit/cli`: Command-line tools

- **sites/**: Applications
  - `learn/`: Documentation and tutorial site
  - `quick-start/`: Quick start template

## Component Development Workflow

### Strategy Checklist

Before creating or modifying a component:

- [ ] **Categorize**: Data-driven (`@rokkit/ui`) or Composable (`@rokkit/composables`)?
- [ ] **Requirements**: Discuss and clarify with user
- [ ] **Design**: Properties, events, actions, snippets
- [ ] **Types**: Define props interface in `types.js` (JSDoc)
- [ ] **Attributes**: Use `data-*` and `aria-*` attributes
- [ ] **Accessibility**: Keyboard navigation, screen reader support
- [ ] **Styles**: External themes only (focus, disabled, error states)
- [ ] **Unit Tests**: Using Vitest
- [ ] **Component Tests**: Playwright if applicable
- [ ] **Documentation**: llms.txt for the component
- [ ] **Stories**: Visual examples (simple → complex)
- [ ] **E2E Tests**: Playwright tests for stories

### Type System Requirements

**Extract props to separate `types.js` files:**

```javascript
// packages/ui/src/types.js - Base shared types
/**
 * @typedef {Object} BaseDataProps
 * @property {any[]} [options=[]] - Data array
 * @property {Object} [fields={}] - Field mapping
 * @property {string} [class=''] - CSS classes
 */

/**
 * @typedef {Object} BaseSelectionProps
 * @property {any} [value] - Selected value (bindable)
 * @property {string} [name] - Accessibility name
 * @property {number} [tabindex=0] - Tab index
 * @property {boolean} [disabled=false] - Disabled state
 */

/**
 * @typedef {BaseDataProps & BaseSelectionProps} DataSelectionProps
 */
```

```javascript
// packages/ui/src/list/types.js - Component-specific
/**
 * @typedef {import('../types.js').DataSelectionProps & ListSpecificProps} ListProps
 */

/**
 * @typedef {Object} ListSpecificProps
 * @property {boolean} [multiSelect=false]
 * @property {import('svelte').Snippet<[Proxy]>} [child]
 */
```

**Export types from package:**
```javascript
// packages/ui/src/index.js
export * from './types.js'
export * from './list/types.js'
```

### Component Standards

```svelte
<script>
  /** @type {import('./types.js').ListProps} */
  let {
    options = [],
    value = $bindable(),
    fields = {},
    class: className = ''
  } = $props()
</script>
```

### Data Handling Pattern

Use the Proxy system from `@rokkit/states`:
```svelte
import { Proxy } from '@rokkit/states'

let proxyItems = $derived(options.map(item => new Proxy(item, fields)))
// Access: proxyItem.get('text'), proxyItem.has('href'), proxyItem.id
```

## Key Design Decisions

### Search/Filter is Separate
```svelte
<!-- CORRECT: Compose filter with list -->
<SearchFilter bind:query />
<List options={filteredData} />

<!-- INCORRECT: searchable prop -->
<List options={data} searchable={true} />
```

### Container Components
```svelte
<!-- Use Panel for header/body/footer -->
<Panel>
  {#snippet header()}<SearchFilter />{/snippet}
  <List {options} />
  {#snippet footer()}<Pagination />{/snippet}
</Panel>
```

### Dropdown Direction
Select/dropdown must support opening up or down:
```svelte
<Select options={data} direction="up" />  <!-- 'up' | 'down' | 'auto' -->
```

### RTL Support
Implicit detection from HTML lang attribute:
```javascript
// vibe store auto-detects direction
vibe.direction  // 'ltr' | 'rtl' (derived from document.documentElement.lang)
```

### TreeTable Tabular Input
Support flat data with hierarchy column:
```svelte
<TreeTable 
  data={flatData} 
  columns={[
    { field: 'path', hierarchy: true, separator: '/' },
    { field: 'size' }
  ]} 
/>
```

## Common Development Commands

### Root Level
- `bun test:unit` - Run unit tests
- `bun lint` - ESLint with auto-fix
- `bun format` - Prettier formatting
- `bun build:all` - Build all packages

### Site Development
```bash
cd sites/learn && bun dev    # Start dev server
cd sites/learn && bun build  # Production build
```

## Code Quality Rules

- Maximum function complexity: 5
- Maximum function length: 30 lines
- Maximum nesting depth: 3
- Maximum 4 function parameters
- No console.log in production
- JSDoc types for all public APIs

## Quality Checklist

Before marking a component complete:

- [ ] Standard prop pattern (options, value, fields)
- [ ] Props types in separate `types.js`
- [ ] Proxy system for data access
- [ ] Snippet customization support
- [ ] Data attributes for theming
- [ ] ARIA attributes for accessibility
- [ ] Keyboard navigation
- [ ] Works with 100+ items
- [ ] Unit tests passing
- [ ] llms.txt documentation
- [ ] Story examples
- [ ] Progress document updated

## TypeScript Strategy

- **Packages**: JSDoc with `types.js` files (generates `.d.ts`)
- **Sites**: TypeScript in SvelteKit routes

## Reference Documentation

- `docs/requirements/component-requirements.md` - Full requirements spec
- `docs/design/architecture.md` - System architecture
- `docs/design/component-status.md` - Component status matrix
- `.rules/project/progress.md` - Current progress

## StoryBuilder System

The learn site uses `StoryBuilder` for managing examples:

```javascript
// stories.js
import { StoryBuilder } from '$lib/components/Story/builder.svelte.js'
const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })
export const storyBuilder = new StoryBuilder(sources, modules)
```

```svelte
<!-- +page.svelte -->
<StoryViewer {...storyBuilder.getExample('intro')} />
<Code {...storyBuilder.getFragment(0)} />
```

### Story Folder Structure

```
component/
├── +page.svelte
├── stories.js
├── fragments/
│   ├── 01-basic.svelte
│   └── 02-advanced.svelte
├── intro/
│   └── App.svelte
└── meta.json
```
