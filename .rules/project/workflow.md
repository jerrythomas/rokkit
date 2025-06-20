# Rokkit Development Workflow for LLMs

## CRITICAL: Progress Tracking Requirement

**MUST UPDATE** `.rules/project/progress.md` after any changes to:
- Component status (🔄 In Progress, ✅ Complete, etc.)
- Implementation decisions made
- Technical challenges encountered
- Quality gate completions
- Any deviations from planned approach

This maintains project continuity between development sessions.

## Component Development Standards

### File Structure Convention
```
packages/ui/src/components/ComponentName/
├── ComponentName.svelte          # Main component implementation
├── ComponentName.spec.svelte.js  # Unit tests for Svelte component
├── index.ts                      # Export declarations
└── types.ts                      # TypeScript definitions (if complex)
```

### Tutorial Structure Convention
```
sites/learn/src/lib/stories/component-name/
├── 01-intro/
│   ├── README.md                 # Component introduction
│   └── src/App.svelte           # Basic usage example
├── 02-fields/ or 02-snippets/   # Field mapping or customization
├── 03-advanced/                 # Complex scenarios
└── meta.json                    # Component metadata
```

## Component API Standards

### Required Props Pattern
All data-driven components MUST follow this pattern:
```svelte
let { 
  items = [],                    # Data array
  value = $bindable(),          # Selected value(s) - bindable
  fields = {},                  # Field mapping object
  class: className = ''         # User CSS classes
} = $props()
```

### Data Handling Pattern
```svelte
import { Proxy } from '@rokkit/states'

// Create proxy items for consistent data access
let proxyItems = $derived(items.map(item => new Proxy(item, fields)))

// Access data through proxy methods
proxyItem.get('text')    # Get field value
proxyItem.has('href')    # Check field existence  
proxyItem.id             # Auto-generated ID
```

### Snippet Support Pattern
```svelte
let { children } = $props()

// Provide default snippet with user override
let itemSnippet = $derived(children?.item ?? defaultItem)

{#snippet defaultItem(proxyItem)}
  {proxyItem.get('text')}
{/snippet}

// Render with snippet
{@render itemSnippet(proxyItem)}
```

## Implementation Requirements

### Component Structure Standards
1. **No internal styling** - components must be completely unstyled
2. **Data attributes only** - use `data-component-element` pattern for styling hooks
3. **Proxy system** - use `@rokkit/states` Proxy for all data access
4. **Snippet support** - allow user customization via snippets
5. **Accessibility** - proper ARIA attributes and keyboard navigation

### bits-ui Integration Pattern
- Use bits-ui components as foundation when available
- Wrap with Rokkit API layer (items, fields, value props)
- Preserve bits-ui data attributes for theming
- See `packages/bits-ui/src/List.svelte` for reference implementation

### Custom Component Pattern
For components without bits-ui equivalent:
- Follow same data attribute naming as bits-ui
- Implement full accessibility support
- Use established keyboard navigation patterns
- Ensure proper focus management

## Quality Requirements

### Before Component is Complete
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

### Testing Requirements
- Field mapping functionality (custom fields work)
- Data attribute presence and correctness
- Accessibility attributes and behavior
- Snippet rendering with custom content
- Performance with realistic datasets

## Development Process

### Before Starting Any Component Work

**MUST Provide Feature Breakdown:**
- Complete technical description
- List all files to be created/modified
- Integration points with existing components
- Testing requirements
- Reference implementations to study

**Example Breakdown:**
```
Component: TreeSelect

Overview:
- Hierarchical selection component
- Combines Tree navigation with Select behavior
- Supports multi-level data structures

Technical:
- Create: packages/ui/src/components/TreeSelect/TreeSelect.svelte
- Create: packages/ui/src/components/TreeSelect/TreeSelect.spec.svelte.js
- Modify: packages/ui/src/index.ts (add export)
- Create: sites/learn/src/lib/stories/tree-select/ (tutorials)

Functions:
- Tree navigation with arrow keys
- Selection at any level
- Field mapping for nested data
- Snippet support for custom rendering

Dependencies:
- @rokkit/states (Proxy system)
- bits-ui (if suitable component exists)

Testing:
- Nested data handling
- Keyboard navigation
- Accessibility compliance
- Performance with deep trees

Reference: Tree component + Select patterns
```

### During Development

**Incremental Changes:**
- Work on one file at a time
- Test each change before proceeding
- Update progress document after significant changes
- Follow conventional commit patterns if committing

**Conventional Commit Format:**
```
feat(ui): add TreeSelect component with keyboard navigation
fix(ui): resolve focus management in Tree component
test(ui): add accessibility tests for List component
docs(stories): update TreeSelect tutorial examples
```

### Component Development Workflow

1. **Study existing patterns** in stories/ for API expectations
2. **Check bits-ui options** for foundation components
3. **Use Proxy system** for any data handling
4. **Follow data attribute conventions** for styling hooks
5. **Implement snippet support** for user customization
6. **Test with realistic data** (100+ items, complex objects)
7. **Verify accessibility** with keyboard navigation
8. **Create/update tutorial examples** in stories/
9. **Update progress tracking** with current status

### Integration Priorities
- **Proxy over FieldMapper** - use @rokkit/states for data access
- **bits-ui where possible** - leverage for accessibility and behavior
- **Data attributes over classes** - use for theming hooks
- **Snippets for customization** - not exposed implementation details
- **Performance first** - handle large datasets efficiently

## Reference Resources

### Study These Files
- `packages/bits-ui/src/List.svelte` - bits-ui integration pattern
- `sites/learn/src/lib/stories/02-elements/01-list/` - tutorial structure
- Existing component tests for testing patterns

### Follow These Patterns
- `.rules/architecture/patterns.md` - component implementation patterns
- `.rules/references/external.md` - integration requirements
- `.rules/project/progress.md` - current component status

## Common Mistakes to Avoid

- Adding internal component styles (should be unstyled)
- Skipping Proxy system (assumes data structure)
- Exposing data attributes to snippet users
- Missing keyboard navigation support
- Forgetting to handle large datasets efficiently
- Not updating progress tracking document
- Starting work without proper breakdown and approval

## Success Criteria

A component is considered complete when:
- All quality requirements are met
- Tutorial examples demonstrate key features
- Tests verify functionality and accessibility
- Progress document reflects completion status
- Component follows established patterns
- Performance is acceptable with realistic data