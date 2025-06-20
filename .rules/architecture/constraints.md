# Rokkit Architectural Constraints

## Technical Constraints

### Framework Dependencies

#### Svelte 5 Requirements
- **Minimum Version**: Svelte ^5.0.0
- **Reasoning**: Runes system is fundamental to our reactive architecture
- **Impact**: Cannot support Svelte 4 components without major API changes
- **Migration Path**: Wrapper components for legacy support

#### Node.js Compatibility
- **Minimum Version**: Node.js >= 18.0.0
- **Reasoning**: ESM support, modern JavaScript features
- **Build Targets**: ES2022+ for optimal performance
- **Legacy Support**: Transpilation for older browsers via build tools

#### TypeScript Integration
- **Requirement**: Full TypeScript support for all public APIs
- **Generic Support**: Components must support generic type parameters
- **Type Safety**: Runtime validation only in development mode
- **Inference**: Props should be inferrable from usage patterns

### Bundle Size Constraints

#### Core Package Limits
- **@rokkit/core**: < 15KB gzipped
- **@rokkit/ui**: < 50KB gzipped (full bundle)
- **Individual Components**: < 5KB gzipped each
- **Tree Shaking**: All exports must be tree-shakeable

#### Performance Budgets
- **Initial Load**: < 100KB total for basic usage
- **Component Import**: < 10KB additional per component
- **Runtime Overhead**: < 5% compared to vanilla implementation

### Browser Support

#### Modern Browsers (Primary Support)
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

#### Legacy Support (Best Effort)
- IE: Not supported
- Chrome < 90: Via build tool transpilation
- Safari < 14: Limited feature support

#### Required Features
- ES Modules
- CSS Custom Properties
- ResizeObserver
- IntersectionObserver

## Design Constraints

### API Consistency Requirements

#### Component Interface Pattern
All selection components MUST follow:
```typescript
interface SelectionComponent<T> {
  items: T[]
  value: T | T[] | null
  fields?: FieldMapping
  using?: ComponentMap
}
```

#### Event Pattern Consistency
```typescript
interface ComponentEvents<T> {
  select: CustomEvent<{ value: T }>
  change: CustomEvent<{ value: T | T[] }>
}
```

#### Field Mapping System
- MUST support nested field access
- MUST provide default field mappings
- MUST be runtime configurable
- MUST work with any data structure

### Component Composability Rules

#### Snippet System Requirements
- All components MUST support snippet-based customization
- Default snippets MUST be provided for all render points
- Snippet parameters MUST be consistently typed
- No component should require external styling

#### Using System Constraints
- Component override system MUST work with any Svelte component
- Default components MUST be replaceable
- Type system MUST understand component swapping
- Performance impact MUST be minimal

### Accessibility Constraints

#### WCAG 2.1 AA Compliance
- All interactive components MUST meet AA standards
- Keyboard navigation MUST be complete and intuitive
- Screen reader support MUST be comprehensive
- Focus management MUST be proper

#### Required ARIA Support
- All components MUST have appropriate roles
- Dynamic content MUST announce changes
- Complex widgets MUST have proper relationships
- Error states MUST be announced

#### Keyboard Navigation Standards
- Arrow keys for list navigation
- Enter/Space for activation
- Escape for dismissal
- Tab for focus movement

## Technical Limitations

### Svelte-Specific Constraints

#### Reactivity System Limitations
- Cannot break reactivity chains with intermediate functions
- Derived values must be pure computations
- Effects must handle cleanup properly
- State mutations must be direct for reactivity

#### Component System Limits
- Circular component references not supported
- Dynamic component imports require specific patterns
- Context API has performance implications at scale
- SSR requires careful hydration handling

#### Bundle Strategy Constraints
- Components cannot share complex internal state
- Tree shaking requires careful export structure
- Code splitting boundaries must be component-level
- Dynamic imports must be explicit

### Data Flow Constraints

#### Field Mapping Limitations
- Deep nesting has performance implications (>5 levels)
- Circular references in data cause infinite loops
- Function-based mappings break SSR
- Dynamic field changes trigger full re-renders

#### Performance Boundaries
- Lists >1000 items require virtual scrolling
- Deep object comparison is O(n) complexity
- Frequent field mapping changes cause thrashing
- Large datasets need pagination strategies

### bits-ui Integration Constraints

#### Wrapper Layer Requirements
- Cannot modify bits-ui component internals
- Must maintain API compatibility layer
- Event handling must be proxied
- Styling must work through CSS variables

#### Feature Gaps
- Some Rokkit features have no bits-ui equivalent
- Custom behaviors require workaround implementations
- Performance characteristics may differ
- Update cycles must be synchronized

## Deployment Constraints

### Package Distribution

#### NPM Publishing Requirements
- All packages MUST use same versioning scheme
- Dependencies MUST be explicitly declared
- Peer dependencies MUST be minimal
- Breaking changes MUST follow semver

#### CDN Delivery Constraints
- UMD builds for script tag usage
- ES modules for modern bundlers
- CSS must be separately loadable
- Icons must be externally referenceable

### Framework Integration Limits

#### SvelteKit Compatibility
- Must work with both SSR and SPA modes
- Cannot rely on browser-only APIs during SSR
- Hydration must be seamless
- App directory structure must be respected

#### Build Tool Requirements
- Vite: Primary support with official plugin
- Webpack: Community support only
- Rollup: Basic compatibility
- Other tools: Best effort

## Security Constraints

### XSS Prevention
- No innerHTML usage without sanitization
- User content must be escaped by default
- Dynamic script execution prohibited
- Event handlers must be properly scoped

### Content Security Policy
- No inline styles in components (CSP compliance)
- No eval() or Function() constructor usage
- External resource loading must be explicit
- Script sources must be whitelisted

### Dependency Security
- Regular security audits required
- No dependencies with known vulnerabilities
- Minimal dependency tree to reduce attack surface
- Automated vulnerability monitoring

## Data Processing Constraints

### Memory Management
- Components must not leak memory
- Event listeners must be properly cleaned up
- Large datasets must use streaming approaches
- Circular references must be avoided

### Performance Limits
- Initial render: < 16ms for 60fps
- Update operations: < 5ms for smooth interaction
- Memory usage: < 10MB for typical applications
- CPU usage: < 10% for idle state

### Scalability Boundaries
- Maximum recommended items per component: 10,000
- Maximum nesting depth: 10 levels
- Maximum concurrent components: 1,000
- Maximum field mappings per component: 50

## Future Constraint Considerations

### Svelte Evolution
- Must be adaptable to future Svelte versions
- Cannot rely on unstable internal APIs
- Must follow Svelte ecosystem best practices
- Should leverage new features when stable

### Web Standards Evolution
- Must work with evolving browser standards
- Should adopt new web APIs when beneficial
- Must maintain backwards compatibility
- Should progressive enhance with new features

### Ecosystem Changes
- Must adapt to CSS framework evolution
- Should integrate with new accessibility tools
- Must work with evolving build tools
- Should support new testing frameworks

## Breaking Change Policy

### Allowed Breaking Changes
- Major version bumps only
- 6-month minimum notice period
- Clear migration path provided
- Deprecated API support for 2 versions

### Protected APIs
- Core component props (items, value, fields)
- Event emission patterns
- Basic accessibility features
- Field mapping system fundamentals

### Change Management
- RFC process for major changes
- Community feedback period
- Beta releases for validation
- Comprehensive migration guides

## Exception Handling

### Constraint Violations
- Document all exceptions with rationale
- Time-bound exceptions with review dates
- Alternative solutions must be provided
- Impact assessment required

### Emergency Overrides
- Critical security issues
- Major browser breaking changes
- Ecosystem-wide migrations
- Performance critical optimizations

### Review Process
- Quarterly constraint review
- Exception audit and cleanup
- Performance budget adjustments
- Technology update assessments