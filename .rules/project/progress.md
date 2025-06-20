# Rokkit Development Progress

## Current Phase: bits-ui Integration & Standardization

**Status**: Active Development - Svelte 5 migration complete, bits-ui integration in progress

## Foundation Status (✅ Completed)
- [x] Svelte 5 migration with runes system
- [x] Core package architecture established
- [x] Build system operational
- [x] Documentation site functional
- [x] Component portfolio using modern Svelte patterns

## Component Migration Status

### Selection Components
| Component | Svelte 5 Status | bits-ui Integration | Implementation Notes |
|-----------|-----------------|-------------------|---------------------|
| List | ✅ Complete | 🔄 Custom approach | Core pattern - field mapping priority |
| Tabs | ✅ Complete | 📋 bits-ui/tabs | Direct migration candidate |
| Select | ✅ Complete | 📋 bits-ui/select | Complex - requires field mapping preservation |
| MultiSelect | ✅ Complete | 📋 bits-ui/listbox | Custom behavior needed for multi-selection |
| Switch | ✅ Complete | 📋 bits-ui/toggle-group | Simple migration |
| DropDown | ✅ Complete | 📋 bits-ui/dropdown-menu | Architecture decision needed |

### Hierarchical Components  
| Component | Svelte 5 Status | bits-ui Integration | Implementation Notes |
|-----------|-----------------|-------------------|---------------------|
| Tree | ✅ Complete | ❌ No equivalent | Full custom implementation required |
| Accordion | ✅ Complete | 📋 bits-ui/accordion | Direct migration with field mapping |

### Data Components
| Component | Svelte 5 Status | bits-ui Integration | Implementation Notes |
|-----------|-----------------|-------------------|---------------------|
| Table | ✅ Complete | ❌ No equivalent | Complex data handling - custom required |

### Input Components
| Component | Svelte 5 Status | bits-ui Integration | Implementation Notes |
|-----------|-----------------|-------------------|---------------------|
| Rating | ✅ Complete | ❌ No equivalent | Custom input component |
| Range | ✅ Complete | 📋 bits-ui/slider | Feature gap analysis needed |

### Primitive Components (Complete)
| Component | Status | Notes |
|-----------|--------|-------|
| Icon | ✅ Complete | No migration needed |
| Item | ✅ Complete | Core rendering primitive |
| Pill | ✅ Complete | Wrapper component |

## Implementation Priorities

### Critical Path Components
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

## Technical Decisions Made

### Architecture Decisions
- **Field Mapping Priority**: Preserve existing field mapping system over bits-ui native patterns
- **Wrapper Strategy**: Use bits-ui as foundation but wrap with Rokkit API layer
- **Custom Components**: Build without bits-ui for components with no equivalent
- **Backward Compatibility**: Maintain existing APIs during transition

### Component-Specific Decisions
- **List**: Custom implementation with bits-ui accessibility patterns as reference
- **Tree/Table**: Full custom implementation due to complexity and no bits-ui equivalent
- **Select/Tabs**: bits-ui integration with field mapping wrapper layer
- **Primitives**: No changes needed, already optimal

## LLM Development Notes

### When Working on Components
1. **Always check existing patterns** in `sites/learn/src/lib/stories/` for current API expectations
2. **Field mapping is critical** - any component handling data must support the `fields` prop
3. **Snippet support required** - users expect to customize rendering via snippets
4. **Accessibility is non-negotiable** - keyboard navigation and ARIA support mandatory
5. **Performance matters** - test with realistic datasets (100-1000+ items)

### Common Patterns to Maintain
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