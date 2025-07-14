# Rokkit Development Progress

## Current Phase: Forms System Development & Tutorial Implementation

**Status**: Active Development - Forms system architecture implemented, progressive tutorial creation in progress

## Foundation Status (✅ Completed)

- [x] Svelte 5 migration with runes system
- [x] Core package architecture established
- [x] Build system operational
- [x] Documentation site functional
- [x] Component portfolio using modern Svelte patterns
- [x] Monorepo structure guidelines documented
- [x] UnoCSS styling conventions established

## Forms System Status

### Core Architecture (✅ Completed)

- [x] FormBuilder class with reactive state management
- [x] Separate validation state with dedicated methods
- [x] Property composition system (schema + layout + validation → props)
- [x] Element structure with scope, type, value, override, props
- [x] JSON Pointer scope format for field paths
- [x] Validation utility with message object structure
- [x] Flexible arbitrary property support from layout

### Components Implementation

| Component          | Status      | Implementation Notes                                   |
| ------------------ | ----------- | ------------------------------------------------------ |
| FormBuilder        | ✅ Complete | Three-parameter constructor, separate validation state |
| Input.svelte       | ✅ Complete | Universal wrapper with type-aware layouts              |
| FormRenderer       | ✅ Complete | Snippet-based rendering with defaultInput and child    |
| Validation Utility | ✅ Complete | Schema-based validation with message objects           |

### Tutorial Implementation

| Section              | Status         | Description                                  | URL                 |
| -------------------- | -------------- | -------------------------------------------- | ------------------- |
| Main Tutorial Page   | ✅ Complete    | Progressive navigation with sidebar          | `/forms`            |
| 1. Input Components  | ✅ Complete    | Universal Input examples and properties      | `/forms/inputs`     |
| 2. FormBuilder       | ✅ Complete    | Data-driven form creation with schema/layout | `/forms/builder`    |
| 3. FormRenderer      | 🔄 In Progress | Snippet-based rendering and customization    | `/forms/renderer`   |
| 4. Validation        | 📋 Planned     | Real-time validation and message handling    | `/forms/validation` |
| 5. Advanced Features | 📋 Planned     | Custom snippets and complex layouts          | `/forms/advanced`   |

### Shared Components

| Component           | Status      | Description                                                    | Location                     |
| ------------------- | ----------- | -------------------------------------------------------------- | ---------------------------- |
| CodeViewer          | ✅ Complete | Demo component with source code display and copy functionality | `tutorial/CodeViewer.svelte` |
| Demo Loader         | ✅ Complete | Utility for loading demo components and source code            | `tutorial/demo-loader.js`    |
| Source Code API     | ✅ Complete | API endpoint for serving demo source files securely            | `/api/source-code`           |
| Syntax Highlighting | ✅ Complete | Shiki.js integration for code highlighting                     | `$lib/shiki.js`              |

### Component Migration Status (Background Task)

### Selection Components

| Component   | Svelte 5 Status | bits-ui Integration      | Implementation Notes                          |
| ----------- | --------------- | ------------------------ | --------------------------------------------- |
| List        | ✅ Complete     | 🔄 Custom approach       | Core pattern - field mapping priority         |
| Tabs        | ✅ Complete     | 📋 bits-ui/tabs          | Direct migration candidate                    |
| Select      | ✅ Complete     | 📋 bits-ui/select        | Complex - requires field mapping preservation |
| MultiSelect | ✅ Complete     | 📋 bits-ui/listbox       | Custom behavior needed for multi-selection    |
| Switch      | ✅ Complete     | 📋 bits-ui/toggle-group  | Simple migration                              |
| DropDown    | ✅ Complete     | 📋 bits-ui/dropdown-menu | Architecture decision needed                  |

### Hierarchical Components

| Component | Svelte 5 Status | bits-ui Integration  | Implementation Notes                |
| --------- | --------------- | -------------------- | ----------------------------------- |
| Tree      | ✅ Complete     | ❌ No equivalent     | Full custom implementation required |
| Accordion | ✅ Complete     | 📋 bits-ui/accordion | Direct migration with field mapping |

### Data Components

| Component | Svelte 5 Status | bits-ui Integration | Implementation Notes                    |
| --------- | --------------- | ------------------- | --------------------------------------- |
| Table     | ✅ Complete     | ❌ No equivalent    | Complex data handling - custom required |

### Input Components

| Component | Svelte 5 Status | bits-ui Integration | Implementation Notes        |
| --------- | --------------- | ------------------- | --------------------------- |
| Rating    | ✅ Complete     | ❌ No equivalent    | Custom input component      |
| Range     | ✅ Complete     | 📋 bits-ui/slider   | Feature gap analysis needed |

### Primitive Components (Complete)

| Component | Status      | Notes                    |
| --------- | ----------- | ------------------------ |
| Icon      | ✅ Complete | No migration needed      |
| Item      | ✅ Complete | Core rendering primitive |
| Pill      | ✅ Complete | Wrapper component        |

## Implementation Priorities

### Tutorial System (Recently Completed)

1. **CodeViewer Component** - ✅ Complete - Reusable component for demo display with source code viewing
2. **Demo Structure** - ✅ Complete - Standardized src/App.svelte pattern for maintainable demos
3. **Source Code Loading** - ✅ Complete - API endpoint and fallback strategies for code display
4. **Copy Functionality** - ✅ Complete - One-click code copying with user feedback
5. **Error Handling** - ✅ Complete - Proper error display instead of hardcoded fallbacks
6. **Code Highlighting** - ✅ Complete - Shiki.js integration for syntax highlighting

### Forms System (Active)

1. **FormRenderer Tutorial** (`/forms/renderer`) - Complete snippet-based rendering examples
2. **Validation Tutorial** (`/forms/validation`) - Real-time validation and user-action triggers
3. **Advanced Features Tutorial** (`/forms/advanced`) - Custom snippets, nested forms, complex layouts

### Critical Path Components (Background)

1. **List** - Establishes core data-driven patterns for all other components
2. **Select** - Tests field mapping complexity with bits-ui integration
3. **Tree** - Custom implementation reference for components without bits-ui equivalents

### Integration Strategy

- **bits-ui Components**: Wrap with Rokkit API layer maintaining field mapping
- **Custom Components**: Build with accessibility patterns inspired by bits-ui
- **API Preservation**: Maintain existing component interfaces during transition

## Technical Requirements

### Field Mapping System Preservation

- All components must maintain current field mapping capabilities
- `fields` prop must work identically across bits-ui and custom components
- Dynamic component selection via `using` prop must be preserved

### Accessibility Standards

- WCAG 2.1 AA compliance for all components
- Keyboard navigation patterns consistent with bits-ui standards
- Screen reader compatibility maintained or improved

### Performance Constraints

- Bundle size impact from bits-ui must be justified by accessibility gains
- Component rendering performance must not degrade
- Tree-shaking must work effectively with wrapper approach

## Implementation Guidelines

### Component Migration Checklist

When working on any component:

- [ ] Preserve existing API surface (items, value, fields, using props)
- [ ] Maintain field mapping system functionality
- [ ] Ensure snippet/children support works identically
- [ ] Verify keyboard navigation matches expectations
- [ ] Test with complex data structures
- [ ] Validate accessibility with screen readers
- [ ] Check performance with large datasets
- [ ] Update documentation examples

### Quality Requirements

All components must meet:

- [ ] Field mapping system preserved and working
- [ ] Custom component support via `using` prop maintained
- [ ] Snippet-based customization functional
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Keyboard navigation complete
- [ ] Performance acceptable with 1000+ items
- [ ] Bundle size impact documented
- [ ] TypeScript types accurate and complete

### Technical Decisions Made

### Forms System Decisions

- **Separate Validation State**: Independent validation management from data/schema/layout
- **Element Structure**: `{ scope, type, value, override, props }` pattern with JSON Pointer scopes
- **Property Composition**: Schema + layout + validation merged into single props object
- **Snippet-Based Rendering**: defaultInput vs child snippet selection based on override flag
- **Flexible Properties**: Arbitrary layout properties passed through to components
- **Message Object Structure**: `{ state: 'error|warning|info|success', text: 'Message content' }`
- **URL Structure**: Clean slug-based URLs (`/forms/inputs`, `/forms/builder`) instead of numbered prefixes
- **Browser Compatibility**: Fixed URL constructor issues for cross-environment compatibility

### Tutorial System Decisions

- **Demo Structure**: Standardized `src/App.svelte` pattern for maintainable tutorial demos
- **Source Code Loading**: Multi-strategy approach (API endpoint, raw imports, error on failure)
- **Component Separation**: CodeViewer as shared component, demo-loader as utility module
- **Security**: Path validation and file type restrictions for source code API
- **User Experience**: Toggle code view, copy functionality, loading states
- **Error Handling**: Show clear error messages instead of hardcoded fallback code
- **Syntax Highlighting**: Shiki.js integration with fallback to plain text
- **Code Safety**: Proper HTML escaping and error boundaries

### Architecture Decisions (Background)

- **Field Mapping Priority**: Preserve existing field mapping system over bits-ui native patterns
- **Wrapper Strategy**: Use bits-ui as foundation but wrap with Rokkit API layer
- **Custom Components**: Build without bits-ui for components with no equivalent
- **Backward Compatibility**: Maintain existing APIs during transition

### Component-Specific Decisions

- **Forms**: Complete custom implementation with accessibility patterns
- **List**: Custom implementation with bits-ui accessibility patterns as reference
- **Tree/Table**: Full custom implementation due to complexity and no bits-ui equivalent
- **Select/Tabs**: bits-ui integration with field mapping wrapper layer
- **Primitives**: No changes needed, already optimal

## LLM Development Notes

### When Working on Tutorial System

1. **Use CodeViewer for demos** - Replace hardcoded examples with CodeViewer components
2. **Follow demo structure** - Create `src/App.svelte` files for reusable, testable demos
3. **Show errors clearly** - Display error messages instead of hardcoded fallback code
4. **Handle loading states** - Show loading indicators while demos are being imported
5. **Security considerations** - Only allow source code access within tutorial directories
6. **Proper error handling** - Use try/catch blocks and show meaningful error messages

### When Working on Forms System

1. **Maintain separate validation state** - validation should be user-action triggered, not automatic
2. **Preserve element structure** - scope, type, value, override, props pattern is critical
3. **Support arbitrary properties** - layout can contain any custom properties for components
4. **Follow snippet patterns** - defaultInput vs child snippet selection based on override
5. **Use UnoCSS conventions** - neutral colors, semantic colors, dark mode support

### When Working on Components (Background)

1. **Always check existing patterns** in `sites/learn/src/lib/stories/` for current API expectations
2. **Field mapping is critical** - any component handling data must support the `fields` prop
3. **Snippet support required** - users expect to customize rendering via snippets
4. **Accessibility is non-negotiable** - keyboard navigation and ARIA support mandatory
5. **Performance matters** - test with realistic datasets (100-1000+ items)

### Tutorial System Patterns

- Demo structure: `tutorial/{section}/{topic}/src/App.svelte`
- CodeViewer usage: `<CodeViewer component={demoComponent} code={demoCode} title="..." description="..." />`
- Demo loading: `const demo = await loadDemo('section/topic')`
- Error handling: Use `demoError` state to show clear error messages
- API endpoint: `/api/source-code?path=src/routes/(learn)/tutorial/...`
- Code highlighting: Automatic syntax highlighting with Shiki.js
- Error boundaries: Proper try/catch blocks and HTML escaping

### Forms System Patterns

- FormBuilder constructor: `new FormBuilder(data, schema?, layout?)`
- Element structure: `{ scope, type, value, override, props }`
- JSON Pointer scopes: `#/fieldPath` format
- Message objects: `{ state: 'error|warning|info|success', text: 'content' }`
- Property composition: schema + layout + validation → props
- Snippet selection: defaultInput vs child based on override flag

### Common Patterns to Maintain (Background)

- `items` prop for data arrays
- `value` prop with `$bindable()` for selections
- `fields` prop for data mapping configuration
- `using` prop for component overrides
- Standard event patterns (select, change, move)
- Snippet support for customization

### Integration Strategy Notes

- bits-ui provides accessibility foundation but may not support our data-driven patterns
- Custom wrapper layer needed to preserve field mapping
- Some components will remain fully custom (Tree, Table, Rating)
- Bundle size impact must be measured and justified
