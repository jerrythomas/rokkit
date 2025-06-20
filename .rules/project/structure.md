# Rokkit Monorepo Structure

## Overview

This is a monorepo containing multiple packages and demo sites for the Rokkit ecosystem. The structure follows modern monorepo patterns with clear separation between library packages and demonstration sites.

## Directory Structure

```
rokkit/
├── packages/           # Library packages
│   ├── core/          # Core utilities and shared code
│   ├── forms/         # Form builder system
│   ├── ui/            # UI component library
│   └── data/          # Data manipulation utilities
├── sites/             # Demo sites and documentation
│   └── learn/         # Learning site with examples
├── apps/              # Applications (if present)
├── docs/              # Documentation
└── .rules/            # Project guidelines and rules
```

## Package Development (`packages/`)

### Purpose
- Create reusable, framework-agnostic libraries
- Provide core functionality for the Rokkit ecosystem
- Maintain strict separation of concerns

### Guidelines
- Each package should have a clear, single responsibility
- Use semantic versioning for releases
- Include comprehensive TypeScript definitions
- Provide thorough documentation and examples
- Test all public APIs extensively

### Structure Pattern
```
packages/[package-name]/
├── src/
│   ├── lib/           # Main library code
│   ├── types/         # TypeScript definitions
│   └── index.js       # Main entry point
├── spec/              # Test files
├── docs/              # Package-specific documentation
├── package.json       # Package configuration
└── README.md          # Package overview
```

## Site Development (`sites/`)

### Purpose
- Demonstrate library package capabilities
- Provide educational content and examples
- Show progressive enhancement patterns

### Guidelines
- Import packages as dependencies (e.g., `@rokkit/forms`)
- Create step-by-step learning experiences
- Follow established styling patterns
- Include both basic and advanced examples

### Learning Site Structure (`sites/learn/`)
```
sites/learn/
├── src/
│   ├── lib/
│   │   └── future/    # Example components organized by category
│   │       ├── 04-input/     # Input components examples
│   │       └── 05-templates/ # Template examples
│   └── routes/        # Page routes
│       └── forms/     # Forms demo pages
└── static/            # Static assets
```

## Development Workflow

### Package Development
1. Develop in `packages/[name]/src/`
2. Test thoroughly with unit and integration tests
3. Update documentation in `packages/[name]/docs/`
4. Version according to semantic versioning

### Demo Development
1. Import published packages or use workspace references
2. Create progressive examples in `sites/learn/src/lib/future/`
3. Build route pages in `sites/learn/src/routes/`
4. Follow UnoCSS styling conventions

## Styling System

### UnoCSS Conventions
- **Neutral Colors**: `neutral-50` through `neutral-900`
- **Semantic Colors**: `primary-`, `secondary-`, `accent-`, `error-`, `warning-`, `success-`
- **Dark Mode**: Always include `dark:` variants
- **Interactive States**: Use `hover:`, `focus:`, `active:` variants

### Color Patterns
```css
/* Backgrounds */
bg-neutral-50 dark:bg-neutral-900        /* Page backgrounds */
bg-neutral-100 dark:bg-neutral-800       /* Card backgrounds */
bg-neutral-200 dark:bg-neutral-700       /* Subtle backgrounds */

/* Text */
text-neutral-900 dark:text-white         /* Primary text */
text-neutral-700 dark:text-neutral-300   /* Secondary text */
text-neutral-600 dark:text-neutral-400   /* Muted text */

/* Borders */
border-neutral-200 dark:border-neutral-700    /* Standard borders */
border-neutral-300 dark:border-neutral-600    /* Emphasized borders */

/* Interactive Elements */
hover:bg-neutral-100 dark:hover:bg-neutral-800
focus:ring-2 focus:ring-primary-500
```

## Documentation Standards

### Package Documentation
- Clear API reference in `docs/` folder
- Usage examples with code snippets
- Migration guides for breaking changes
- Contributing guidelines

### Demo Documentation
- Step-by-step tutorials
- Progressive complexity examples
- Real-world use cases
- Best practices guidance

## Cross-Package Dependencies

### Allowed Dependencies
- `@rokkit/core` can be used by any package
- UI packages can depend on core utilities
- Sites can use any published package

### Dependency Guidelines
- Minimize cross-package dependencies
- Use peer dependencies for optional features
- Document all external dependencies clearly
- Keep dependency trees shallow