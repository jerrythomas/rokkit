# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rokkit is a cutting-edge data-driven UI library built for Svelte 5. It empowers developers to build stunning, flexible user interfaces with minimal effort while maintaining full control over styling and behavior. The library is designed around the principle that **data should drive the interface**, not the other way around.

## Core Principles

### Data-First Design
Components automatically understand and adapt to data structures without requiring data transformation:
```svelte
<!-- Data shapes the component, not vice versa -->
<List items={users} fields={{ text: 'fullName', image: 'avatar' }} />
<List items={products} fields={{ text: 'title', image: 'thumbnail' }} />
```

### Composable Flexibility
Every component is extensible without modification through snippets and component overrides:
```svelte
<List {items}>
  {#snippet customItem(node)}
    <MyCustomComponent data={node.value} />
  {/snippet}
</List>
```

### Consistent API Patterns
All selection components follow the same pattern:
- `items`: Data array
- `value`: Selected item(s) (bindable)
- `fields`: Field mapping configuration
- `using`: Custom component overrides (_deprecated_ but exists in some components.)
- `child`: Optional child snippet used for specific item. Takes a `Proxy` class instance as input
- `children`: standard children snippet for use in key value composite structures like Tabs/TabsGroup


## Architecture

The project is organized as a Bun workspace monorepo with the following structure:

- **packages/**: Contains the core library packages
  - `@rokkit/core`: Core utilities and field mapping system
  - `@rokkit/ui`: Main UI components
  - `@rokkit/actions`: Svelte actions for behaviors
  - `@rokkit/states`: State management utilities and Proxy system
  - `@rokkit/data`: Data manipulation utilities
  - `@rokkit/forms`: Form-related components
  - `@rokkit/themes`: CSS themes and styling
  - `@rokkit/icons`: Icon libraries
  - `@rokkit/bits-ui`: Data-driven wrappers for bits-ui components (migrating to use bits-ui under the hoods)
  - `@rokkit/tutorial`: Tutorial system
  - `@rokkit/chart`: Chart components
  - `@rokkit/cli`: Command-line tools
  - `@rokkit/helpers`: Testing helpers

- **sites/**: Contains example applications
  - `learn/`: Main documentation and tutorial site
  - `quick-start/`: Quick start template

## Common Development Commands

### Root Level Commands (Bun Workspace)
- `bun test:unit` - Run unit tests
- `bun test:ci` - Run tests in CI mode
- `bun coverage` - Generate test coverage report
- `bun lint` - Run ESLint with auto-fix
- `bun format` - Format code with Prettier
- `bun build:all` - Build all packages
- `bun publish:all` - Publish all packages

### Package-Level Commands
Most packages support these commands:
- `bun build` - Build the package
- `bun clean` - Clean build artifacts
- `bun prepublishOnly` - Prepare for publishing (TypeScript compilation)

### Site Development
For the learn site (must cd into `sites/learn/` first):
- `cd sites/learn && bun dev` - Start development server
- `cd sites/learn && bun build` - Build for production
- `cd sites/learn && bun preview` - Preview built site
- `cd sites/learn && bun test:e2e` - Run end-to-end tests

### Testing
- `bun test:unit` - Run unit tests (from project root)

## Key Technologies

- **Svelte 5**: Uses the new runes system
- **TypeScript**: Configured with strict settings
- **Vitest**: Testing framework with jsdom environment
- **ESLint**: Strict code quality rules
- **Prettier**: Code formatting
- **Bun**: Package manager, build tool, and workspace manager
- **UnoCSS**: Utility-first CSS framework

## Development Workflow

### CRITICAL: Progress Tracking
**MUST UPDATE** `.rules/project/progress.md` after any changes to:
- Component status (🔄 In Progress, ✅ Complete, etc.)
- Implementation decisions made
- Technical challenges encountered
- Quality gate completions

### Before Starting Any Component Work
1. **Ask clarifying questions** to understand requirements
2. **Analyze existing codebase** and provide clear understanding
3. **Present implementation strategy** with step-by-step approach
4. **Break down complex tasks** into manageable units
5. **Confirm approach** before writing any code

### Component Development Standards
All components MUST follow these patterns:
```svelte
let {
  items = [],                    // Data array
  value = $bindable(),          // Selected value(s) - bindable
  fields = {},                  // Field mapping object
  class: className = ''         // User CSS classes
} = $props()
```

### Data Handling Pattern
Use the Proxy system from `@rokkit/states` for consistent data access:
```svelte
import { Proxy } from '@rokkit/states'

let proxyItems = $derived(items.map(item => new Proxy(item, fields)))
// Access data: proxyItem.get('text'), proxyItem.has('href'), proxyItem.id
```

## Component Implementation Requirements

### Structure Standards
1. **No internal styling** - components must be completely unstyled
2. **Data attributes only** - use `data-component-element` pattern for styling hooks
3. **Proxy system** - use `@rokkit/states` Proxy for all data access
4. **Snippet support** - allow user customization via snippets
5. **Accessibility** - proper ARIA attributes and keyboard navigation

### bits-ui Integration
- Use bits-ui components as foundation when available
- Wrap with Rokkit API layer (items, fields, value props)
- Preserve bits-ui data attributes for theming
- See `packages/bits-ui/src/List.svelte` for reference

## Code Quality Rules

The project enforces strict code quality through ESLint:
- Maximum function complexity of 5
- Maximum function length of 30 lines
- Maximum nesting depth of 3
- Maximum 4 function parameters
- No console.log statements in production code
- Strict TypeScript settings

## Testing

- Test files use `.spec.js` or `.spec.svelte.js` extensions
- Tests are located in `spec/` directories within each package
- Use `@testing-library/svelte` for component testing
- Coverage reports are generated in HTML, LCOV, and JSON formats
- Tests run in jsdom environment

## Styling System

### UnoCSS Conventions
- **Neutral Colors**: `neutral-50` through `neutral-900`
- **Semantic Colors**: `primary-`, `secondary-`, `accent-`, `error-`, `warning-`, `success-`
- **Dark Mode**: Always include `dark:` variants.
- **Semantic Shortcuts**: Use semantic shortcuts (ex bg-surface-z2 instead of bg-surface-200 dark:bg-surface-800)
- **Interactive States**: Use `hover:`, `focus:`, `active:` variants

### Color Patterns
```css
/* Backgrounds */
bg-surface-z2        /* Page backgrounds */
bg-surface-z1       /* Card backgrounds */

/* Text */
text-surface-z6        /* Primary text */
text-surface-z6   /* Secondary text */

/* Borders */
border-surface-z2    /* Standard borders */
```

## Workspace Dependencies

Packages use `workspace:latest` for internal dependencies to ensure consistency across the monorepo.

## Quality Requirements

Before any component is complete:
- [ ] Follows standard prop pattern (items, value, fields)
- [ ] Uses Proxy system for data access
- [ ] Supports snippet customization
- [ ] Has proper data attributes for theming
- [ ] Implements keyboard navigation
- [ ] Passes accessibility tests (WCAG 2.1 AA)
- [ ] Works with 100+ items efficiently
- [ ] Has tutorial examples in stories/
- [ ] TypeScript types are accurate
- [ ] **Progress document updated**

## Field Mapping System

Components adapt to any data structure through the field mapping system:
```javascript
// Custom mapping
const fields = {
  text: 'name',        // Map 'name' to text display
  image: 'avatar',     // Map 'avatar' to image display
  children: 'items'    // Map 'items' to nested children
}
```

## StoryBuilder System

The learn site uses a `StoryBuilder` class for managing interactive examples and code fragments in tutorials. This provides a clean, reactive API for story management.

### Basic Usage

**stories.js**
```javascript
import { StoryBuilder } from '$lib/components/Story/builder.svelte.js'

const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })

export const storyBuilder = new StoryBuilder(sources, modules)
```

**+page.svelte**
```svelte
<script>
  import { StoryViewer, Code } from '$lib/components/Story'
  import { storyBuilder } from './stories.js'
</script>

<!-- Interactive Examples -->
<StoryViewer {...storyBuilder.getExample('intro')} />

<!-- Code Fragments -->
<Code {...storyBuilder.getFragment(0)} />
```

### API Reference

**Properties:**
- `storyBuilder.loading` - Reactive loading state
- `storyBuilder.error` - Error state if story loading fails
- `storyBuilder.examples` - All processed examples
- `storyBuilder.fragments` - Processed fragment files

**Methods:**
- `getExample(name)` - Get specific example by name
- `getFragment(index)` - Get specific fragment by index
- `hasExample(name)` - Check if example exists
- `hasFragment(index)` - Check if fragment exists

### Folder Structure

```
component/
├── +page.svelte (tutorial content)
├── stories.js (StoryBuilder instance)
├── fragments/ (code examples for syntax highlighting)
│   ├── 01-basic.svelte
│   ├── 02-advanced.svelte
│   └── ...
├── intro/ (interactive examples)
│   └── App.svelte
├── mapping/
│   └── App.svelte
└── meta.json
```

### Code Fragments

Create fragments for reusable code examples with syntax highlighting:

```svelte
<!-- fragments/01-basic.svelte -->
<Component value="example" />
```

Access in templates:
```svelte
<Code {...storyBuilder.getFragment(0)} />
```

### Benefits

- **Reactive**: Automatic updates when data loads
- **Clean Templates**: No `#await` blocks needed
- **Type Safety**: Helper methods with existence checks
- **Performance**: Single async operation per page
- **Maintainable**: Code fragments in separate files

### Testing

The StoryBuilder includes comprehensive test coverage and works in both runtime and test environments by detecting availability of Svelte's `$state` rune.

## Reference Files

Study these files for implementation patterns:
- `packages/bits-ui/src/List.svelte` - bits-ui integration pattern
- `sites/learn/src/lib/stories/02-elements/01-list/` - tutorial structure
- `.rules/architecture/patterns.md` - component implementation patterns
- `.rules/project/progress.md` - current component status
