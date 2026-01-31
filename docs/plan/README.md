# Implementation Plan

> Roadmap and priorities for Rokkit UI documentation and development

## Overview

This section contains the implementation roadmap, component priorities, and milestone definitions for the Rokkit UI project.

## Documents

| Document | Description | Status |
|----------|-------------|--------|
| [implementation-roadmap.md](./implementation-roadmap.md) | Phased implementation approach | ❌ |
| [component-priorities.md](./component-priorities.md) | Priority ordering for components | ❌ |

## Implementation Phases

### Phase 1: Foundation Setup ✅
- Documentation folder structure
- Tracking system
- Section READMEs
- Root llms.txt
- Component inventory and status templates

### Phase 2: Core Packages
- @rokkit/core documentation
- @rokkit/states documentation

### Phase 3: UI Components (High Priority)
- Selection components (List, Select, Tabs, etc.)
- Hierarchical components (Tree, Accordion, etc.)
- Form input components

### Phase 4: UI Components (Medium Priority)
- Layout components
- Navigation components
- Feedback components
- Display components

### Phase 5: Supporting Packages
- @rokkit/composables
- @rokkit/actions
- @rokkit/data
- @rokkit/themes

### Phase 6: Requirements & Design Docs
- Requirements documentation
- Design documentation
- Architecture documentation

## Package Priority Order

| Priority | Package | Reason |
|----------|---------|--------|
| 1 | @rokkit/core | Foundation utilities |
| 2 | @rokkit/states | Core dependency (Proxy) |
| 3 | @rokkit/ui | Main components |
| 4 | @rokkit/composables | Composable primitives |
| 5 | @rokkit/forms | Form system |
| 6 | @rokkit/actions | Svelte actions |
| 7 | @rokkit/data | Data utilities |
| 8 | @rokkit/themes | Theme system |
| 9+ | Others | Lower priority |

## Component Priority Factors

Components are prioritized based on:

1. **Usage Frequency** (40%) - How often is component used?
2. **Foundation Dependencies** (30%) - Do other components depend on it?
3. **Current State** (20%) - How incomplete is it?
4. **Complexity** (10%) - How much effort required?

### High Priority Components
- List, Select, Tabs (selection foundations)
- Tree, Accordion (hierarchical data)
- Form, Input, InputField (forms system)

### Medium Priority Components
- Card, ResponsiveGrid (layout)
- Button, Icon (primitives)
- ProgressBar, ValidationReport (feedback)

## Progress Tracking

See [../tracking.md](../tracking.md) for current progress.

## Related

- [Requirements](../requirements/) - What to build
- [Design](../design/) - How to build
- [.rules/project/progress.md](../../.rules/project/progress.md) - Development progress
