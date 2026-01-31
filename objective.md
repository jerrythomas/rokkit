# Rokkit UI Component Library - Master Reference Document

## 1. Project Overview

### Monorepo Structure
Rokkit is a comprehensive UI component library organized as a monorepo with the following structure:
- **`packages/`** - Core component packages and utilities
- **`sites/learn/`** - Documentation and example site showcasing components
- **`sites/quickstart/`** - Template project for rapid application development

### Key Technologies and Dependencies
- **Base Framework**: Svelte/SvelteKit
- **Component Foundation**: bits-ui (composable, accessible components)
- **Custom Components**: Data-driven wrapper components built on top of bits-ui
- **Theme System**: Three built-in styles (rokkit, minimal, material)
- **Styling Approach**: CSS-based with semantic color variables for dark/light mode
- **Story System**: Custom rendering for showcasing components across styles and themes

### Project Vision and Goals
The Rokkit UI library aims to provide:
1. **Style-Agnostic Components**: Core functionality independent of visual design
2. **Data-Driven Approach**: Easy connection between data and UI components
3. **Dual API**: Both composable (low-level) and data-driven (high-level) interfaces
4. **Theme Flexibility**: Multiple built-in themes with easy customization
5. **Accessibility First**: Full ARIA compliance and keyboard navigation
6. **Developer Experience**: Comprehensive documentation, examples, and LLM-friendly reference

## 2. Current Architecture

### Package Structure Breakdown
```
rokkit/
├── packages/
│   ├── components/         # Core UI components
│   ├── bits-ui/           # Wrapper around bits-ui with data-driven API
│   ├── themes/            # Theme system (rokkit, minimal, material)
│   ├── forms/             # Dynamic form generation system
│   └── [other utilities]
├── sites/
│   ├── learn/            # Documentation and example site
│   │   ├── src/routes/(learn)/elements/  # Component examples
│   │   └── stories/      # Component story definitions
│   └── quickstart/       # Template project
└── docs/
    ├── requirements/     # (To be created)
    ├── design/          # (To be created)
    ├── plan/            # (To be created)
    └── tracking.md      # (To be created)
```

### Component Organization
- **Base Components**: Built on or inspired by bits-ui primitives
- **Data-Driven Wrappers**: Higher-level components accepting data configurations
- **Composable Patterns**: Allow combining base components for custom use cases
- **Hybrid Approach**: Support both composition and data-driven usage

### Theme System Architecture

#### Three Theme Variants
1. **Rokkit**: Default theme with distinctive styling
2. **Minimal**: Clean, minimal aesthetic
3. **Material**: Material Design-inspired theme

#### Theme Implementation
- Located in `packages/themes/`
- Uses data-attributes for component-specific styling
- Semantic CSS variables for colors (enables automatic dark/light mode)
- Color palette system with primary, secondary, surface, etc.

#### Current Theme Variables Structure
```css
:root {
  /* Semantic colors */
  --primary: ...;
  --secondary: ...;
  --surface: ...;
  --error: ...;
  /* ... etc */
}
```

### Story Rendering Approach
- Custom story system for component examples
- Reference implementation: `sites/learn/src/routes/(learn)/elements/list/+page.svelte`
- Stories demonstrate:
  - Various component configurations
  - Data-driven usage patterns
  - Composable usage patterns
  - Theme variations
  - Interactive examples

### Forms System Overview
**Current State**: Incomplete but functional foundation

**Architecture**:
- **Schema-Driven**: Forms defined by data schema and layout schema
- **Dynamic Rendering**: Components generated from configuration
- **Component Integration**: Uses core input components

**Known Gaps**:
- Validation system incomplete
- Error handling not fully implemented
- Submission workflows incomplete
- Dependent field logic missing
- Backend API integration patterns undefined

## 3. Requirements

### R1: llms.txt Implementation

#### Root Level llms.txt
- **Location**: `sites/learn/llms.txt` (served at root)
- **Content**: Overview of entire component library
- **Purpose**: Allow LLMs to quickly understand full library scope
- **Reference**: Similar to https://bits-ui.com/docs/llms

#### Per-Component llms.txt
- **Location**: `sites/learn/docs/components/{component-name}/llms.txt`
- **URL Pattern**: `https://[domain]/docs/components/{component-name}/llms.txt`
- **Content Per Component**:
  - Component description and purpose
  - API documentation (props, events, slots)
  - Usage examples (data-driven and composable)
  - Accessibility features
  - Theme/styling information
  - Common patterns and recipes
- **Reference**: Similar to https://bits-ui.com/docs/components/accordion/llms.txt

### R2: Documentation Structure Under docs/

#### docs/requirements/
**Purpose**: Capture all project requirements

**Files to Create**:
- `component-requirements.md` - Requirements for each component
- `accessibility-requirements.md` - ARIA and a11y standards
- `theme-requirements.md` - Theme system specifications
- `forms-requirements.md` - Forms system requirements
- `documentation-requirements.md` - Documentation standards

#### docs/design/
**Purpose**: Document design decisions and architecture

**Files to Create**:
- `project-status.md` - Overall project health and status
- `component-status.md` - Detailed status of each component
- `architecture.md` - System architecture documentation
- `theme-system-design.md` - Theme and styling approach
- `forms-design.md` - Forms system architecture
- `accessibility-design.md` - Accessibility implementation approach

#### docs/plan/
**Purpose**: Implementation roadmap and planning

**Files to Create**:
- `implementation-roadmap.md` - Phased implementation plan
- `component-priorities.md` - Component implementation order
- `milestone-definitions.md` - What defines each milestone
- `resource-allocation.md` - Effort estimates and priorities

### R3: Component Status Tracking System

**Location**: `docs/design/component-status.md`

**Status Dimensions** (see Section 4 for details):
1. Data attributes
2. Interactions (keyboard/mouse/tap)
3. ARIA accessibility
4. Theme coverage
5. Dark/light mode
6. Stories completeness

**Status Levels**:
- ✅ **Complete**: Fully implemented and tested
- 🟡 **Partial**: Basic implementation, gaps exist
- ❌ **Missing**: Not implemented
- 🚫 **N/A**: Not applicable for this component

### R4: Theme, Mode, and Palette Support in Learn App

#### Theme Switcher
- **Options**: rokkit, minimal, material
- **Implementation**: Global context/store
- **Persistence**: localStorage
- **UI Location**: Header/navigation area

#### Mode Switcher
- **Options**: dark, light
- **Implementation**: CSS class or data-attribute on root
- **Automatic**: Respect system preference with manual override
- **Current Status**: Partially implemented with known bugs (to be documented)

#### Palette Selector (New Feature)
- **Purpose**: Allow users to preview components with different color schemes
- **Named Palettes**:
  - `vibrant` (default): Orange, pink, bold colors
  - `sea-green`: Ocean-inspired blues and greens
  - `monochrome`: Grayscale-focused
  - `warm`: Earth tones
  - `cool`: Blues and purples
  - `custom`: User-defined values
  
- **Implementation Approach**:
  - Override CSS variables dynamically
  - Provide palette configuration format
  - Show color mappings visually
  - Allow palette preview before applying

- **Color Mappings Per Palette**:
  ```typescript
  interface Palette {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    background: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    // ... additional semantic colors
  }
  ```

### R5: Comprehensive Component Showcase Page

**Purpose**: Single page displaying all components together

**Features**:
- All components visible simultaneously
- Live theme switching (rokkit, minimal, material)
- Live mode switching (dark, light)
- Live palette switching
- Visual demonstration of consistency across components
- Export/share configuration settings

**Layout Considerations**:
- Organized by component category
- Compact but functional examples
- Scrollable with navigation
- Responsive design

### R6: Palette Designer Tool

**Purpose**: Help users design custom color systems using color theory

**Features**:
1. **Color Theory Foundation**:
   - Complementary colors
   - Analogous colors
   - Triadic harmony
   - Split-complementary
   - Monochromatic variations

2. **Interactive Designer**:
   - Color wheel visualization
   - Harmony rule selector
   - Base color picker
   - Auto-generate palette from base color
   - Adjust lightness/saturation/hue for each color
   - Contrast checker (WCAG compliance)

3. **Semantic Mapping**:
   - Map generated colors to semantic roles (primary, secondary, etc.)
   - Preview mapping on actual components
   - Suggest optimal mappings based on color properties

4. **Export Options**:
   - CSS variables
   - JSON configuration
   - Theme file format
   - Share palette via URL

5. **Accessibility Validation**:
   - Contrast ratios for text
   - Color blindness simulation
   - Warnings for accessibility issues

### R7: Style-Agnostic Component Design Philosophy

**Core Principle**: Separate functionality from presentation

**Implementation Strategy**:
1. **Data Attributes Over Classes**:
   ```html
   <button data-variant="primary" data-size="md" data-state="active">
     Button
   </button>
   ```
   - Themes target data attributes, not classes
   - Consistent attribute naming across components

2. **Semantic Color Variables**:
   - No hard-coded colors in components
   - Always use semantic variables (--primary, --error, etc.)
   - Themes only define these variables

3. **Behavioral Props**:
   - Component behavior defined by props
   - Visual styling defined by themes
   - Clear separation of concerns

4. **Theme Independence**:
   - Components work without any theme
   - Unstyled components still functional
   - Themes are pure enhancement

## 4. Component Status Framework

### Status Assessment Criteria

For each component, evaluate the following dimensions:

#### 4.1 Data Attributes for Different Elements

**Purpose**: Enable theme-based styling without coupling to specific CSS classes

**Requirements**:
- All interactive elements have state attributes (e.g., `data-state="active"`)
- Variant attributes for different visual styles (e.g., `data-variant="primary"`)
- Size attributes where applicable (e.g., `data-size="md"`)
- Disabled/loading/error states represented as attributes

**Example**:
```html
<div class="accordion" data-orientation="vertical">
  <div class="accordion-item" data-state="open">
    <button class="accordion-trigger" data-state="open" data-disabled="false">
      Header
    </button>
    <div class="accordion-content" data-state="open">
      Content
    </div>
  </div>
</div>
```

**Assessment Checklist**:
- [ ] Root element has identifying attribute
- [ ] All child elements have appropriate attributes
- [ ] State changes reflected in attributes
- [ ] Documented attribute API
- [ ] Consistent naming with other components

#### 4.2 Keyboard/Mouse/Tap Interaction Support

**Purpose**: Ensure full accessibility and device support

**Requirements**:

**Keyboard Interactions**:
- Tab navigation follows logical order
- Enter/Space activate buttons/controls
- Arrow keys for navigation (where applicable)
- Escape closes overlays/dialogs
- Home/End for lists/menus
- Component-specific shortcuts documented

**Mouse Interactions**:
- Click/double-click handling
- Hover states
- Drag interactions (where applicable)
- Context menu support (where applicable)

**Touch/Tap Interactions**:
- Touch-friendly hit targets (minimum 44x44px)
- Gesture support (swipe, pinch, etc. where applicable)
- No hover-dependent functionality
- Touch feedback

**Assessment Checklist**:
- [ ] All keyboard interactions documented and working
- [ ] Mouse interactions feel natural
- [ ] Touch interactions work on mobile devices
- [ ] Focus management correct
- [ ] No keyboard traps
- [ ] Visual feedback for all interaction states

#### 4.3 ARIA Accessibility Compliance

**Purpose**: Ensure screen reader and assistive technology support

**Requirements**:
- Proper ARIA roles assigned
- ARIA states and properties correctly applied
- Labels and descriptions provided
- Live regions for dynamic content
- Focus management for complex components
- Landmark roles for page structure

**Common ARIA Patterns**:
- Buttons: `role="button"`, `aria-pressed`, `aria-expanded`
- Dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`
- Menus: `role="menu"`, `role="menuitem"`, `aria-haspopup`
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Lists: `role="list"`, `role="listitem"`

**Assessment Checklist**:
- [ ] ARIA roles match W3C patterns
- [ ] Dynamic content announces correctly
- [ ] Tested with screen reader (NVDA, JAWS, VoiceOver)
- [ ] No ARIA violations in automated tests
- [ ] Semantic HTML used where possible (progressive enhancement)
- [ ] Focus indicators visible and clear

#### 4.4 Theme/Style Coverage

**Purpose**: Ensure component looks good in all three theme variants

**Requirements**:

**Rokkit Theme**:
- [ ] All component states styled
- [ ] Visual consistency with other Rokkit components
- [ ] Distinctive Rokkit aesthetic maintained
- [ ] All data attributes utilized for styling

**Minimal Theme**:
- [ ] Clean, minimal aesthetic
- [ ] Reduced visual noise
- [ ] Subtle state indicators
- [ ] Consistency with minimal philosophy

**Material Theme**:
- [ ] Material Design principles followed
- [ ] Elevation/shadow usage consistent
- [ ] Ripple effects where appropriate
- [ ] Material motion patterns

**Assessment Checklist**:
- [ ] Component styled in all three themes
- [ ] No missing states in any theme
- [ ] Visual consistency within each theme
- [ ] Theme switching works without refresh
- [ ] No layout shifts between themes

#### 4.5 Dark/Light Mode Support

**Purpose**: Automatic support through semantic color variables

**Implementation**:
- Themes define color variables for both modes
- Components only reference semantic variables
- No hard-coded light/dark colors in components

**Requirements**:
- All colors use semantic variables
- Sufficient contrast in both modes
- Shadows/borders visible in both modes
- Images/icons adapt to mode (where needed)

**Assessment Checklist**:
- [ ] Looks good in light mode
- [ ] Looks good in dark mode
- [ ] No contrast issues in either mode
- [ ] Mode switching smooth (no flash)
- [ ] All states visible in both modes
- [ ] Tested with automated contrast checkers

#### 4.6 Story Completeness and Examples

**Purpose**: Demonstrate all component capabilities and usage patterns

**Requirements**:

**Story Coverage**:
1. **Basic Usage**: Simplest possible implementation
2. **All Variants**: Every visual variant demonstrated
3. **All States**: Loading, error, disabled, active, etc.
4. **Data-Driven Usage**: Using the data-driven API
5. **Composable Usage**: Using low-level composition
6. **Edge Cases**: Empty states, overflow, long content
7. **Responsive Behavior**: Mobile, tablet, desktop
8. **Interactive Examples**: User can interact with live component
9. **Code Examples**: Copy-paste ready code snippets
10. **Guidelines**: When and how to use the component

**Reference Implementation**: `sites/learn/src/routes/(learn)/elements/list/+page.svelte`

**Story Structure**:
```typescript
interface ComponentStory {
  title: string;
  description: string;
  example: Component; // Live interactive example
  code: string; // Source code
  dataStructure?: object; // For data-driven examples
  notes?: string[]; // Usage notes and tips
}
```

**Assessment Checklist**:
- [ ] All usage patterns demonstrated
- [ ] Code examples provided and tested
- [ ] Both data-driven and composable examples
- [ ] Edge cases covered
- [ ] Usage guidelines written
- [ ] Common mistakes documented
- [ ] Performance considerations noted

### Component Status Matrix Template

For tracking in `docs/design/component-status.md`:

```markdown
## [Component Name]

| Dimension | Status | Notes |
|-----------|--------|-------|
| Data Attributes | ✅/🟡/❌ | Details... |
| Interactions | ✅/🟡/❌ | Details... |
| ARIA | ✅/🟡/❌ | Details... |
| Rokkit Theme | ✅/🟡/❌ | Details... |
| Minimal Theme | ✅/🟡/❌ | Details... |
| Material Theme | ✅/🟡/❌ | Details... |
| Dark/Light Mode | ✅/🟡/❌ | Details... |
| Stories | ✅/🟡/❌ | Details... |
| llms.txt | ✅/🟡/❌ | Details... |

**Overall Status**: [Ready/In Progress/Needs Work]

**Priority**: [High/Medium/Low]

**Known Issues**:
- Issue 1
- Issue 2

**Next Steps**:
1. Step 1
2. Step 2
```

## 5. Identified Gaps and Issues

### 5.1 Incomplete Components

**Category: Confidence Level**
- Some components lack full confidence in their implementation
- Need systematic audit to identify specific gaps
- Incomplete documentation on what "full confidence" means

**Action Items**:
- Audit all components against status framework
- Document specific gaps for each component
- Prioritize components by usage importance

### 5.2 Missing Component Features

**Likely Gaps** (to be confirmed through audit):
- Incomplete data attribute coverage
- Missing keyboard shortcuts
- Partial ARIA implementation
- Theme coverage incomplete for some components
- Stories not comprehensive

### 5.3 Theme/Mode/Palette System Bugs

**Known Issues**:
- Theme switching bugs (specifics to be documented)
- Mode switching bugs (specifics to be documented)
- Palette system not yet implemented
- Potential flash of unstyled content (FOUC)
- localStorage persistence issues (possible)

**Discovery Needed**:
- Systematic testing of theme switching
- Document all edge cases and bugs
- Create reproducible test cases

### 5.4 Forms System Incompleteness

#### Missing: Validation System
**Required Features**:
- Field-level validation rules
- Form-level validation
- Async validation support
- Custom validator functions
- Built-in validators (email, URL, regex, etc.)
- Validation timing (onChange, onBlur, onSubmit)
- Cross-field validation

**Proposed Validation Schema**:
```typescript
interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'regex' | 'custom' | 'async';
  message: string;
  params?: any;
  validator?: (value: any, formData?: any) => boolean | Promise<boolean>;
}

interface FieldSchema {
  name: string;
  type: string;
  validations?: ValidationRule[];
  // ... other properties
}
```

#### Missing: Error Handling
**Required Features**:
- Display validation errors
- Error message positioning (inline, tooltip, summary)
- Field-level error states
- Form-level error summary
- Server-side error integration
- Error clearing logic

#### Missing: Submission Workflows
**Required Features**:
- Submit button states (idle, submitting, success, error)
- Prevent double-submission
- Form data serialization
- API integration patterns
- Success/error callbacks
- Redirect after submission
- Optimistic updates

#### Missing: Corrections Support
**Required Features**:
- Pre-populate form with existing data
- Track which fields have changed
- Dirty state management
- Unsaved changes warning
- Reset to original values

### 5.5 Dependent Field Logic

**Use Case**: Country → State Selection

**Required Features**:
1. **Field Dependencies Declaration**:
   ```typescript
   interface FieldDependency {
     field: string; // Field name that this depends on
     triggers: 'onChange' | 'onLoad'; // When to trigger
     action: 'populate' | 'filter' | 'enable' | 'show'; // What to do
     source: 'api' | 'cache' | 'static'; // Where to get data
     endpoint?: string; // API endpoint
     transform?: (parentValue: any) => any; // Transform parent value
   }
   ```

2. **Data Loading**:
   - Async data fetching
   - Loading states for dependent fields
   - Caching strategy
   - Error handling

3. **Field State Management**:
   - Enable/disable based on parent
   - Show/hide based on parent
   - Clear value when parent changes
   - Preserve value when appropriate

4. **API Integration Patterns**:
   - RESTful endpoints
   - GraphQL queries
   - WebSocket for real-time
   - Debouncing for search

**Example Configuration**:
```typescript
{
  name: 'state',
  type: 'select',
  label: 'State',
  dependencies: [
    {
      field: 'country',
      triggers: 'onChange',
      action: 'populate',
      source: 'api',
      endpoint: '/api/states?country={country}',
      clearOnChange: true
    }
  ]
}
```

### 5.6 Documentation Gaps

**Current State**:
- No docs/requirements/ folder
- No docs/design/ folder
- No docs/plan/ folder
- No tracking.md
- Inconsistent component documentation
- No llms.txt files exist yet

**Required Documentation**:
- All items in Section 3 (Requirements)
- All items in Section 4 (Component Status Framework)
- This master reference document

### 5.7 Testing Gaps

**Likely Issues** (to be confirmed):
- Incomplete test coverage
- No automated accessibility testing
- Manual testing required for themes
- No visual regression testing
- Missing integration tests

## 6. Strategic Decisions Needed

### 6.1 Continue with bits-ui vs. Custom Components

**Current Approach**: Wrapper around bits-ui with data-driven API

**Advantages of bits-ui Base**:
- ✅ Well-tested accessibility implementation
- ✅ Comprehensive keyboard navigation
- ✅ ARIA patterns follow W3C specs
- ✅ Active maintenance and updates
- ✅ Can leverage both composable and data-driven APIs
- ✅ Faster development (build on existing foundation)
- ✅ Community support and documentation

**Disadvantages of bits-ui Base**:
- ❌ Dependency on external package
- ❌ Potential breaking changes
- ❌ Less control over implementation details
- ❌ Bundle size includes full bits-ui
- ❌ May not match all design decisions
- ❌ Learning curve for contributors

**Advantages of Custom Components**:
- ✅ Full control over implementation
- ✅ No external dependencies
- ✅ Smaller bundle size (tree-shaking)
- ✅ Match exact design requirements
- ✅ Easier to customize and extend

**Disadvantages of Custom Components**:
- ❌ Significant development effort
- ❌ Need to reimplement accessibility features
- ❌ More testing required
- ❌ Ongoing maintenance burden
- ❌ Potential accessibility gaps

**Recommendation Path**:
1. **Audit Current Implementation**: Assess how heavily bits-ui is used
2. **Identify Blockers**: Are there specific limitations with bits-ui?
3. **Hybrid Approach**: Consider keeping bits-ui for complex components (Dialog, Dropdown, Combobox) while building custom simple components (Button, Input, Card)
4. **Migration Strategy**: If moving away from bits-ui, do it gradually component by component
5. **Performance Testing**: Compare bundle sizes and runtime performance

**Decision Factors**:
- Team size and capacity
- Timeline constraints
- Customization requirements
- Bundle size importance
- Maintenance capacity

### 6.2 Composable + Data-Driven Hybrid Approach

**Current Implementation**: Both APIs available

**Question**: Is this the right approach or does it create confusion?

**Arguments For Hybrid Approach**:
- ✅ Flexibility: Users choose based on needs
- ✅ Simple cases use data-driven (faster)
- ✅ Complex cases use composable (more control)
- ✅ Progressive complexity (start simple, go complex)
- ✅ Covers more use cases

**Arguments Against Hybrid Approach**:
- ❌ Two APIs to maintain
- ❌ Two sets of documentation
- ❌ Potential confusion for users
- ❌ Increased testing surface
- ❌ May dilute focus

**Recommendation**:
- **Keep Hybrid Approach** with clear guidance:
  - Data-driven as primary API (80% use cases)
  - Composable as escape hatch (20% use cases)
  - Clear documentation on when to use each
  - Examples showing both approaches
  - Easy migration path between approaches

**Implementation Guidelines**:
```typescript
// Data-driven (recommended for most cases)
<DataList items={data} />

// Composable (for custom behavior)
<List>
  {#each items as item}
    <ListItem>
      <CustomComponent {item} />
    </ListItem>
  {/each}
</List>

// Hybrid (composable with data-driven children)
<List>
  <ListItem>Custom header</ListItem>
  <DataListItems items={data} />
  <ListItem>Custom footer</ListItem>
</List>
```

### 6.3 Forms Architecture for Complex Scenarios

**Challenges**:
1. Dependent field selection (country → state)
2. Async validation
3. Dynamic field visibility
4. Conditional field requirements
5. Multi-step forms
6. Field arrays (repeating groups)
7. File uploads
8. Rich text editing
9. Backend API integration
10. Caching and performance

**Proposed Architecture**:

#### Form Schema Definition
```typescript
interface FormSchema {
  fields: FieldSchema[];
  layout?: LayoutSchema;
  validation?: ValidationSchema;
  submission?: SubmissionConfig;
  dependencies?: DependencyMap;
}

interface FieldSchema {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  validations?: ValidationRule[];
  dependencies?: FieldDependency[];
  defaultValue?: any;
  props?: Record<string, any>; // Component-specific props
}
```

#### Dependency Management System
```typescript
interface DependencyManager {
  register(field: string, dependency: FieldDependency): void;
  trigger(field: string, value: any): Promise<void>;
  resolve(field: string): Promise<any>;
  cache: DependencyCache;
}
```

#### API Integration Layer
```typescript
interface APIAdapter {
  fetch(endpoint: string, params: any): Promise<any>;
  cache?: CacheStrategy;
  transform?: TransformFunction;
  errorHandler?: ErrorHandler;
}
```

#### State Management
```typescript
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  submitting: boolean;
  submitted: boolean;
  validating: Record<string, boolean>;
}
```

**Key Design Decisions**:

1. **Centralized vs. Distributed State**:
   - Recommendation: Centralized form state with reactive updates
   - Use Svelte stores for reactivity

2. **Validation Timing**:
   - OnChange: For immediate feedback (after first blur)
   - OnBlur: To avoid aggressive validation
   - OnSubmit: Final validation before submission
   - Configurable per field

3. **Dependency Resolution**:
   - Topological sort of dependencies
   - Parallel loading where possible
   - Debounced API calls
   - Cached responses

4. **Error Handling**:
   - Field-level errors
   - Form-level errors
   - Server-side errors
   - Network errors
   - Clear distinction between types

5. **Performance**:
   - Lazy field registration
   - Debounced validation
   - API response caching
   - Virtual scrolling for long forms

**Next Steps**:
- Prototype dependency system
- Test with real-world use cases
- Document API patterns
- Create examples for common scenarios

## 7. Implementation Plan Structure

### Phase 1: Assessment and Documentation
**Duration**: 2-3 weeks
**Priority**: Critical foundation

#### Week 1: Project Audit
**Tasks**:
1. **Component Inventory**:
   - List all existing components
   - Categorize by type (input, layout, feedback, navigation, etc.)
   - Identify which use bits-ui vs. custom

2. **Status Assessment**:
   - Apply status framework to each component
   - Document gaps in detail
   - Prioritize by severity and usage

3. **Theme Audit**:
   - Test each component in all three themes
   - Document missing styles
   - Screenshot comparisons
   - Identify inconsistencies

4. **Accessibility Audit**:
   - Run automated tools (axe, WAVE, Lighthouse)
   - Manual keyboard testing
   - Screen reader testing (spot check)
   - Document ARIA issues

**Deliverables**:
- `docs/design/component-inventory.md`
- `docs/design/component-status.md`
- `docs/design/theme-audit-results.md`
- `docs/design/accessibility-audit.md`

#### Week 2: Requirements Documentation
**Tasks**:
1. **Write Requirements Docs**:
   - Component requirements
   - Accessibility requirements
   - Theme requirements
   - Forms requirements
   - Documentation requirements

2. **Design Documentation**:
   - Architecture overview
   - Theme system design
   - Forms system design
   - Dependency management design

3. **Gap Analysis**:
   - Detailed gap documentation
   - Root cause analysis
   - Effort estimates

**Deliverables**:
- All files in `docs/requirements/`
- All files in `docs/design/`
- `docs/design/gap-analysis.md`

#### Week 3: Planning and Prioritization
**Tasks**:
1. **Create Implementation Plan**:
   - Component priorities
   - Milestone definitions
   - Resource allocation
   - Timeline estimates

2. **Set Up Tracking**:
   - Create tracking.md structure
   - Define progress metrics
   - Set up review cadence

3. **Tooling Setup**:
   - Automated testing setup
   - Visual regression tests
   - Accessibility testing automation
   - Documentation generation

**Deliverables**:
- `docs/plan/implementation-roadmap.md`
- `docs/plan/component-priorities.md`
- `docs/plan/milestone-definitions.md`
- `docs/tracking.md`

### Phase 2: Component-by-Component Implementation
**Duration**: 8-12 weeks (depending on component count)
**Priority**: Core functionality

#### Implementation Order Criteria
**Priority Factors** (weighted):
1. **Usage Frequency** (40%): How often is component used?
2. **Foundation Dependencies** (30%): Do other components depend on it?
3. **Current State** (20%): How incomplete is it?
4. **Complexity** (10%): How much effort required?

**Suggested Priority Tiers**:

**Tier 1: Foundation Components** (Weeks 1-3)
- Button
- Input (Text, Number, Email, etc.)
- Checkbox
- Radio
- Select
- Label
- Form Field wrapper

**Tier 2: Layout & Structure** (Weeks 4-5)
- Card
- Container
- Grid
- Stack
- Divider

**Tier 3: Navigation** (Weeks 6-7)
- Menu
- Tabs
- Breadcrumb
- Pagination
- Link

**Tier 4: Feedback & Overlays** (Weeks 8-9)
- Dialog/Modal
- Tooltip
- Popover
- Alert
- Toast/Notification

**Tier 5: Data Display** (Weeks 10-11)
- List
- Table
- Tree
- Accordion
- Badge
- Avatar

**Tier 6: Advanced Inputs** (Week 12)
- Date Picker
- Color Picker
- File Upload
- Rich Text Editor
- Combobox/Autocomplete

#### Per-Component Implementation Checklist

**1. Component Design** (Day 1)
- [ ] Review current implementation
- [ ] Design/update API
- [ ] Plan data attributes
- [ ] Design interaction patterns
- [ ] Plan accessibility approach
- [ ] Document decisions in `docs/design/components/{name}.md`

**2. Implementation** (Days 2-3)
- [ ] Implement/refactor component logic
- [ ] Add all data attributes
- [ ] Implement keyboard navigation
- [ ] Implement ARIA attributes
- [ ] Add TypeScript types
- [ ] Handle edge cases

**3. Testing** (Day 4)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Accessibility tests (automated)
- [ ] Keyboard navigation tests
- [ ] Visual regression tests
- [ ] Cross-browser testing

**4. Theming** (Day 5)
- [ ] Rokkit theme implementation
- [ ] Minimal theme implementation
- [ ] Material theme implementation
- [ ] Dark mode verification
- [ ] Light mode verification
- [ ] Theme switching tests

**5. Stories & Documentation** (Days 6-7)
- [ ] Basic usage story
- [ ] All variants story
- [ ] All states story
- [ ] Data-driven example
- [ ] Composable example
- [ ] Edge cases story
- [ ] Interactive playground
- [ ] Usage guidelines
- [ ] API documentation
- [ ] Accessibility notes

**6. llms.txt Creation** (Day 8)
- [ ] Write component description
- [ ] Document API (props, events, slots)
- [ ] Include code examples
- [ ] Document accessibility features
- [ ] Note theme variations
- [ ] Common patterns
- [ ] Gotchas and tips

**7. Review & Polish** (Day 9)
- [ ] Code review
- [ ] Documentation review
- [ ] Accessibility audit
- [ ] Performance check
- [ ] Bundle size impact
- [ ] Cross-component consistency check

**8. Localization** (Day 10)
- [ ] Extract user-facing strings
- [ ] Add i18n support
- [ ] Document localization approach
- [ ] Test with sample translations
- [ ] RTL support (if applicable)

**Per-Component Timeline**: ~2 weeks per component (varies by complexity)

#### Tracking Progress

**Weekly Review**:
- Update `docs/tracking.md`
- Review completed components against checklist
- Identify blockers
- Adjust priorities as needed

**Tracking Format**:
```markdown
## Week X: [Dates]

### Completed
- [x] Component A - All tasks complete
- [x] Component B - Theme work

### In Progress
- [ ] Component C - Day 5/10 (Theming phase)
  - Blockers: Need design input on Material variant

### Next Week
- [ ] Component D
- [ ] Component E

### Metrics
- Components complete: X/Y
- Test coverage: Z%
- Documentation coverage: W%
```

### Phase 3: Forms System Implementation
**Duration**: 4-6 weeks
**Priority**: Build after core components complete

#### Week 1: Forms Foundation
**Tasks**:
1. **Schema System**:
   - Define form schema structure
   - Define field schema structure
   - Define validation schema
   - Define layout schema

2. **State Management**:
   - Implement form state store
   - Field registration system
   - Value change handling
   - Touch/dirty tracking

3. **Basic Rendering**:
   - Schema to component mapping
   - Layout rendering
   - Field wrapper component
   - Form wrapper component

**Deliverables**:
- Form schema TypeScript types
- Form state management
- Basic rendering engine

#### Week 2: Validation System
**Tasks**:
1. **Validation Rules**:
   - Built-in validators (required, email, url, etc.)
   - Custom validator support
   - Async validator support
   - Cross-field validation

2. **Validation Timing**:
   - OnChange validation
   - OnBlur validation
   - OnSubmit validation
   - Configurable per field

3. **Error Handling**:
   - Error state management
   - Error display component
   - Error summary component
   - Field-level error integration

**Deliverables**:
- Validation system implementation
- Error handling components
- Validation tests

#### Week 3: Dependency System
**Tasks**:
1. **Dependency Declaration**:
   - Dependency schema definition
   - Dependency registration
   - Dependency graph building

2. **Dependency Resolution**:
   - Change detection
   - Dependency triggering
   - Parallel resolution
   - Circular dependency handling

3. **API Integration**:
   - API adapter interface
   - Fetch implementation
   - Caching layer
   - Error handling

**Deliverables**:
- Dependency management system
- API integration layer
- Example dependent fields

#### Week 4: Submission & Advanced Features
**Tasks**:
1. **Submission Workflow**:
   - Pre-submit validation
   - Submit button states
   - Form serialization
   - API submission
   - Success/error handling
   - Redirect logic

2. **Advanced Features**:
   - Field arrays (repeating groups)
   - Multi-step forms
   - Conditional fields
   - Dynamic field visibility
   - Draft saving
   - Unsaved changes warning

**Deliverables**:
- Submission system
- Advanced form features
- Example complex forms

#### Week 5: Testing & Documentation
**Tasks**:
1. **Comprehensive Testing**:
   - Unit tests for all features
   - Integration tests for workflows
   - Complex form examples
   - Performance testing

2. **Documentation**:
   - Form system guide
   - Schema documentation
   - API reference
   - Examples and recipes
   - Migration guide (if updating existing)

**Deliverables**:
- Test suite
- Forms documentation
- Example applications

#### Week 6: Polish & Integration
**Tasks**:
1. **Component Integration**:
   - Test with all input components
   - Handle edge cases
   - Performance optimization
   - Bundle size optimization

2. **Developer Experience**:
   - Type safety improvements
   - Error messages
   - Dev tools
   - Debugging support

3. **Real-World Testing**:
   - Build sample application
   - Identify pain points
   - Iterate on DX
   - Document patterns

**Deliverables**:
- Polished forms system
- Sample application
- Best practices guide

## 8. Documentation Structure

### Folder Organization

```
docs/
├── requirements/
│   ├── README.md                          # Overview of requirements
│   ├── component-requirements.md          # Requirements for components
│   ├── accessibility-requirements.md      # ARIA and a11y standards
│   ├── theme-requirements.md              # Theme system specs
│   ├── forms-requirements.md              # Forms system requirements
│   ├── documentation-requirements.md      # Documentation standards
│   └── testing-requirements.md            # Testing standards
│
├── design/
│   ├── README.md                          # Design documentation overview
│   ├── project-status.md                  # Overall project health
│   ├── component-status.md                # Detailed component status
│   ├── component-inventory.md             # List of all components
│   ├── architecture.md                    # System architecture
│   ├── theme-system-design.md             # Theme and styling approach
│   ├── forms-design.md                    # Forms system architecture
│   ├── accessibility-design.md            # A11y implementation approach
│   ├── dependency-management-design.md    # Dependency resolution system
│   ├── api-integration-design.md          # API integration patterns
│   ├── theme-audit-results.md             # Theme audit findings
│   ├── accessibility-audit.md             # A11y audit findings
│   ├── gap-analysis.md                    # Detailed gap documentation
│   └── components/
│       ├── button.md                      # Button component design
│       ├── input.md                       # Input component design
│       └── [other components].md
│
├── plan/
│   ├── README.md                          # Planning overview
│   ├── implementation-roadmap.md          # Phased implementation plan
│   ├── component-priorities.md            # Component implementation order
│   ├── milestone-definitions.md           # Milestone criteria
│   ├── resource-allocation.md             # Effort estimates
│   └── timeline.md                        # Project timeline
│
├── tracking.md                            # Progress tracking
├── llms-master-reference.md               # This document
└── decisions/
    ├── 001-bits-ui-vs-custom.md          # ADR: Component foundation choice
    ├── 002-hybrid-api-approach.md        # ADR: Data-driven + composable
    └── [other decisions].md              # Additional ADRs
```

### Document Templates

#### Component Requirements Template
```markdown
# [Component Name] Requirements

## Functional Requirements
- FR1: Description
- FR2: Description

## Accessibility Requirements
- AR1: ARIA role and attributes
- AR2: Keyboard interactions
- AR3: Screen reader announcements

## Visual Requirements
- VR1: States and variants
- VR2: Responsive behavior
- VR3: Theme compatibility

## API Requirements
- Props
- Events
- Slots

## Data-Driven API
- Data structure
- Configuration options

## Testing Requirements
- Unit tests
- Integration tests
- Accessibility tests
```

#### Component Design Template
```markdown
# [Component Name] Design

## Overview
Brief description and purpose

## Current Implementation
Description of current state

## Proposed Changes
What needs to change and why

## API Design
### Props
### Events
### Slots

## Data Attributes
List of all data attributes and their values

## Interaction Design
### Keyboard
### Mouse
### Touch

## Accessibility Implementation
### ARIA Roles
### ARIA States and Properties
### Focus Management
### Screen Reader Behavior

## Theme Implementation
### Rokkit
### Minimal
### Material

## Dependencies
Other components or packages this depends on

## Open Questions
Questions that need answers

## Decisions
Key design decisions made
```

#### Component Status Template
```markdown
## [Component Name]

**Category**: [Input/Layout/Feedback/Navigation/Data Display/Advanced]

**Foundation**: [bits-ui/Custom/Hybrid]

**Priority**: [High/Medium/Low]

| Dimension | Status | Notes |
|-----------|--------|-------|
| Data Attributes | ✅/🟡/❌ | Details... |
| Interactions | ✅/🟡/❌ | Details... |
| ARIA | ✅/🟡/❌ | Details... |
| Rokkit Theme | ✅/🟡/❌ | Details... |
| Minimal Theme | ✅/🟡/❌ | Details... |
| Material Theme | ✅/🟡/❌ | Details... |
| Dark/Light Mode | ✅/🟡/❌ | Details... |
| Stories | ✅/🟡/❌ | Details... |
| llms.txt | ✅/🟡/❌ | Details... |
| Tests | ✅/🟡/❌ | Details... |
| Localization | ✅/🟡/❌ | Details... |

**Overall Status**: [Ready/In Progress/Needs Work/Planned]

**Completion**: X/11 dimensions complete

**Known Issues**:
- Issue 1
- Issue 2

**Blockers**:
- Blocker 1

**Next Steps**:
1. Step 1
2. Step 2

**Effort Estimate**: X days

**Target Completion**: [Date]
```

## 9. Learn Site Enhancements

### 9.1 Theme Switcher

**Location**: Header/Navigation (persistent across pages)

**UI Component**:
```svelte
<ThemeSwitcher
  themes={['rokkit', 'minimal', 'material']}
  current={$themeStore}
  onChange={(theme) => themeStore.set(theme)}
/>
```

**Visual Design**:
- Dropdown or segmented control
- Icon/preview for each theme
- Active state indication
- Smooth transition on change

**Implementation**:
- Svelte store for theme state
- localStorage persistence
- Apply via root data-attribute: `<html data-theme="rokkit">`
- CSS applies styles based on attribute

**Features**:
- Instant preview on hover (optional)
- Keyboard accessible
- URL parameter support (`?theme=minimal`)

### 9.2 Mode Switcher

**Location**: Header/Navigation (next to theme switcher)

**UI Component**:
```svelte
<ModeSwitcher
  mode={$modeStore}
  onChange={(mode) => modeStore.set(mode)}
/>
```

**Visual Design**:
- Sun/moon icon toggle
- Or: Auto/Light/Dark three-way toggle
- Active state indication

**Implementation**:
- Svelte store for mode state
- Respect `prefers-color-scheme` media query
- localStorage override
- Apply via root class or data-attribute: `<html data-mode="dark">`

**Features**:
- Auto mode respects system preference
- Manual override persists
- Smooth transition between modes
- Flash prevention on page load

**Current Bugs to Fix**:
- Document specific bugs in `docs/design/theme-mode-bugs.md`
- Test and fix theme/mode interaction issues
- Ensure no FOUC (Flash of Unstyled Content)
- Test localStorage edge cases

### 9.3 Palette Selector

**Location**: Header/Navigation or Settings panel

**UI Component**:
```svelte
<PaletteSelector
  palettes={availablePalettes}
  current={$paletteStore}
  onChange={(palette) => paletteStore.set(palette)}
/>
```

**Available Palettes**:

#### Vibrant (Default)
```css
--primary: #FF6B35;        /* Orange */
--secondary: #F72585;      /* Pink */
--accent: #7209B7;         /* Purple */
--success: #06D6A0;        /* Teal */
--warning: #FFD500;        /* Yellow */
--error: #EF233C;          /* Red */
--info: #4361EE;           /* Blue */
```

#### Sea Green
```css
--primary: #06A77D;        /* Sea green */
--secondary: #005F73;      /* Deep teal */
--accent: #0A9396;         /* Turquoise */
--success: #52B788;        /* Light green */
--warning: #FFB703;        /* Amber */
--error: #D62828;          /* Red */
--info: #023047;           /* Navy */
```

#### Monochrome
```css
--primary: #2B2D42;        /* Charcoal */
--secondary: #8D99AE;      /* Gray */
--accent: #EDF2F4;         /* Light gray */
/* ... */
```

#### Warm
```css
--primary: #E63946;        /* Warm red */
--secondary: #F77F00;      /* Orange */
--accent: #FCBF49;         /* Yellow */
/* ... */
```

#### Cool
```css
--primary: #4361EE;        /* Blue */
--secondary: #3A0CA3;      /* Purple */
--accent: #7209B7;         /* Deep purple */
/* ... */
```

**Palette Visualization**:
- Color swatches for each semantic color
- Label for each color role
- Contrast ratios shown
- WCAG compliance indicators

**Implementation**:
- Override CSS variables dynamically via JavaScript
- Svelte store for palette state
- localStorage persistence
- JSON format for palette definitions

**Palette Format**:
```typescript
interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    surface: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    // ... other semantic colors
  };
  dark?: Partial<ColorPalette['colors']>; // Dark mode overrides
}
```

**User Features**:
- Preview palette before applying
- Create custom palette
- Share palette via URL
- Export palette as CSS/JSON
- Import palette from file

### 9.4 Comprehensive Component Showcase Page

**Route**: `/showcase` or `/components/all`

**Purpose**: Display all components on one page with live controls

**Layout**:
```
┌─────────────────────────────────────────┐
│ Header with Controls                     │
│ [Theme] [Mode] [Palette]                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Table of Contents (Sidebar/Top)         │
│ - Inputs                                 │
│ - Layout                                 │
│ - Navigation                             │
│ - Feedback                               │
│ - Data Display                           │
│ - Advanced                               │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Component Grid                           │
│                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Button  │ │ Input   │ │ Select  │   │
│ │         │ │         │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Card    │ │ Dialog  │ │ Menu    │   │
│ │         │ │         │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                          │
│ [... more components ...]               │
└─────────────────────────────────────────┘
```

**Features**:
- All components visible and interactive
- Compact but functional examples
- Instant theme/mode/palette switching
- Jump to component on page
- Link to detailed component documentation
- Export configuration as JSON
- Screenshot/share current view

**Component Display**:
- Component name
- Brief description
- Interactive example (1-2 variants)
- Link to full stories
- Status indicator (ready/beta/experimental)

**Responsive Behavior**:
- Grid layout on desktop
- Stack layout on mobile
- Sticky controls header
- Smooth scrolling navigation

**Implementation Considerations**:
- Performance: Lazy load components in viewport
- Bundle size: Code splitting
- State: Global context for theme/mode/palette
- Navigation: Intersection observer for ToC highlighting

### 9.5 Palette Designer Tool

**Route**: `/tools/palette-designer`

**UI Layout**:
```
┌─────────────────────────────────────────┐
│ Palette Designer                         │
└─────────────────────────────────────────┘
┌──────────────────┬──────────────────────┐
│ Color Theory     │ Preview              │
│ Panel            │ Panel                │
│                  │                      │
│ [Color Wheel]    │ [Component Examples] │
│                  │                      │
│ Base Color:      │ ┌─────────┐         │
│ [#FF6B35]        │ │ Button  │         │
│                  │ └─────────┘         │
│ Harmony Rule:    │                      │
│ [▼ Triadic]      │ ┌──────────────┐   │
│                  │ │ Card         │   │
│ Generated:       │ │              │   │
│ 🟠 Primary       │ └──────────────┘   │
│ 🟣 Secondary     │                      │
│ 🟢 Accent        │ [... more ...]      │
│                  │                      │
│ [Adjust Colors]  │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
┌─────────────────────────────────────────┐
│ Semantic Mapping                         │
│ Primary:    🟠 [Color 1] ▼              │
│ Secondary:  🟣 [Color 2] ▼              │
│ Accent:     🟢 [Color 3] ▼              │
│ Success:    ✓  [Auto]    ▼              │
│ Warning:    ⚠  [Auto]    ▼              │
│ Error:      ✗  [Auto]    ▼              │
│ [... more ...]                          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Accessibility Check                      │
│ ✅ Primary/Background: 4.8:1 (AA)       │
│ ✅ Secondary/Background: 5.2:1 (AA)     │
│ ⚠️  Accent/Background: 3.8:1 (Fail)     │
│ [View Simulations]                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Export                                   │
│ [Save Palette] [Export CSS] [Share URL] │
└─────────────────────────────────────────┘
```

**Color Theory Panel Features**:

1. **Interactive Color Wheel**:
   - Click to select base color
   - Visualize color relationships
   - Show harmony rules overlaid

2. **Harmony Rules**:
   - Complementary (2 colors)
   - Analogous (3 adjacent colors)
   - Triadic (3 equally spaced)
   - Split-complementary
   - Tetradic (square or rectangle)
   - Monochromatic (single hue variations)

3. **Color Adjustment**:
   - Hue slider
   - Saturation slider
   - Lightness slider
   - Individual color tweaking
   - Shade/tint generation

4. **Auto-Generation**:
   - Generate full palette from base color
   - Suggest optimal mappings
   - Create light/dark mode variants

**Preview Panel Features**:
- Live component examples using palette
- Switch between light/dark mode
- Common UI patterns (form, card grid, navigation)
- Instant updates on color changes

**Semantic Mapping Features**:
- Drag-drop colors to semantic roles
- Dropdown to select from generated colors
- Auto-suggest based on color properties:
  - Warm colors → warning/error
  - Cool colors → info/primary
  - Greens → success
- Preview each mapping

**Accessibility Check Features**:
1. **Contrast Ratios**:
   - Calculate for all text/background combinations
   - Show WCAG level (AA/AAA/Fail)
   - Suggest adjustments for failures

2. **Color Blindness Simulation**:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
   - Monochromacy
   - Show palette in each mode

3. **Recommendations**:
   - Suggest color adjustments
   - Show which combinations to avoid
   - Alternative color suggestions

**Export Options**:

1. **Save Palette**:
   - Save to browser localStorage
   - Name and describe palette
   - Add tags for organization

2. **Export CSS**:
   ```css
   :root {
     --primary: #FF6B35;
     --secondary: #F72585;
     /* ... */
   }
   ```

3. **Export JSON**:
   ```json
   {
     "id": "my-palette",
     "name": "My Custom Palette",
     "colors": {
       "primary": "#FF6B35",
       "secondary": "#F72585"
     }
   }
   ```

4. **Share URL**:
   - Encode palette in URL parameters
   - Shareable link
   - QR code generation

5. **Export to Theme**:
   - Generate full theme package
   - Include light/dark variants
   - Ready to use in project

**Implementation Technologies**:
- Color manipulation: `chroma.js` or `color.js`
- Color wheel: Custom Canvas or SVG
- Contrast calculation: WCAG formula
- Color blindness simulation: Daltonization algorithms

**Advanced Features**:
- Import palette from image
- Extract palette from URL/screenshot
- AI-assisted palette generation
- Palette collections/library
- Community sharing

## 10. Success Criteria

### 10.1 Component Completion Criteria

A component is considered **COMPLETE** when:

1. **Implementation** ✅:
   - [ ] All functionality implemented
   - [ ] All props/events/slots working
   - [ ] Edge cases handled
   - [ ] TypeScript types complete
   - [ ] Performance optimized

2. **Data Attributes** ✅:
   - [ ] All elements have appropriate data attributes
   - [ ] States reflected in attributes
   - [ ] Variants available via attributes
   - [ ] Documented in component docs

3. **Interactions** ✅:
   - [ ] Full keyboard navigation
   - [ ] Mouse interactions natural
   - [ ] Touch-friendly (44x44px targets minimum)
   - [ ] Focus management correct
   - [ ] No keyboard traps

4. **Accessibility** ✅:
   - [ ] ARIA roles correct
   - [ ] ARIA states and properties correct
   - [ ] Tested with screen reader
   - [ ] No automated a11y violations
   - [ ] Keyboard only navigation works
   - [ ] Focus indicators visible

5. **Theme Coverage** ✅:
   - [ ] Rokkit theme complete
   - [ ] Minimal theme complete
   - [ ] Material theme complete
   - [ ] All states styled in each theme
   - [ ] Visual consistency within each theme

6. **Dark/Light Mode** ✅:
   - [ ] Looks good in light mode
   - [ ] Looks good in dark mode
   - [ ] Sufficient contrast in both modes
   - [ ] All states visible in both modes
   - [ ] Automated contrast checks pass

7. **Stories** ✅:
   - [ ] Basic usage example
   - [ ] All variants shown
   - [ ] All states demonstrated
   - [ ] Data-driven example
   - [ ] Composable example
   - [ ] Edge cases covered
   - [ ] Interactive playground
   - [ ] Code examples provided

8. **Documentation** ✅:
   - [ ] API documented (props/events/slots)
   - [ ] Usage guidelines written
   - [ ] Common patterns documented
   - [ ] Accessibility notes included
   - [ ] When to use / when not to use
   - [ ] Related components noted

9. **llms.txt** ✅:
   - [ ] Component description
   - [ ] API reference
   - [ ] Code examples
   - [ ] Accessibility info
   - [ ] Common patterns
   - [ ] Tips and gotchas

10. **Tests** ✅:
    - [ ] Unit tests written
    - [ ] Integration tests written
    - [ ] Accessibility tests automated
    - [ ] Visual regression tests
    - [ ] >80% code coverage
    - [ ] All tests passing

11. **Localization** ✅:
    - [ ] User-facing strings extracted
    - [ ] i18n support implemented
    - [ ] Tested with sample translations
    - [ ] RTL support (if applicable)
    - [ ] Documentation on localization

**Scoring**: 11/11 dimensions complete = READY

### 10.2 Theme System Completion Criteria

The theme system is considered **COMPLETE** when:

1. **All Components Themed** ✅:
   - [ ] Every component styled in Rokkit
   - [ ] Every component styled in Minimal
   - [ ] Every component styled in Material
   - [ ] No missing states in any theme

2. **Consistency** ✅:
   - [ ] Visual consistency within each theme
   - [ ] Common patterns applied consistently
   - [ ] Spacing/sizing consistent
   - [ ] Typography consistent

3. **Theme Switching** ✅:
   - [ ] Instant switching with no flash
   - [ ] No layout shifts
   - [ ] Persistence works
   - [ ] URL parameter support

4. **Dark/Light Mode** ✅:
   - [ ] All themes work in both modes
   - [ ] Automatic mode detection
   - [ ] Manual override works
   - [ ] Persistence works

5. **Palette System** ✅:
   - [ ] Named palettes implemented
   - [ ] Palette switching works
   - [ ] Custom palettes supported
   - [ ] Palette designer functional

6. **Documentation** ✅:
   - [ ] Theme system documented
   - [ ] How to create custom themes
   - [ ] Palette format documented
   - [ ] Migration guide (if needed)

### 10.3 Forms System Completion Criteria

The forms system is considered **COMPLETE** when:

1. **Schema System** ✅:
   - [ ] Form schema defined
   - [ ] Field schema defined
   - [ ] Validation schema defined
   - [ ] Layout schema defined
   - [ ] TypeScript types complete

2. **Rendering** ✅:
   - [ ] Schema to components working
   - [ ] Layout rendering correct
   - [ ] All input types supported
   - [ ] Field wrappers working

3. **Validation** ✅:
   - [ ] Built-in validators working
   - [ ] Custom validators supported
   - [ ] Async validators working
   - [ ] Cross-field validation
   - [ ] Validation timing configurable

4. **Error Handling** ✅:
   - [ ] Field-level errors display
   - [ ] Form-level errors display
   - [ ] Server-side error integration
   - [ ] Error clearing works

5. **Submission** ✅:
   - [ ] Pre-submit validation
   - [ ] Submit button states
   - [ ] API integration
   - [ ] Success handling
   - [ ] Error handling
   - [ ] Redirect logic

6. **Dependencies** ✅:
   - [ ] Dependent fields working
   - [ ] API integration for dependencies
   - [ ] Caching implemented
   - [ ] Loading states

7. **Advanced Features** ✅:
   - [ ] Field arrays (repeating groups)
   - [ ] Multi-step forms
   - [ ] Conditional fields
   - [ ] Dynamic visibility
   - [ ] Draft saving
   - [ ] Unsaved changes warning

8. **Documentation** ✅:
   - [ ] Forms guide written
   - [ ] Schema API documented
   - [ ] Examples provided
   - [ ] Recipes for common patterns
   - [ ] Migration guide

9. **Tests** ✅:
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Complex form examples tested
   - [ ] Performance tested

### 10.4 Documentation Completion Criteria

Documentation is considered **COMPLETE** when:

1. **Structure** ✅:
   - [ ] All folders created (requirements/design/plan)
   - [ ] tracking.md in use
   - [ ] Templates documented
   - [ ] Consistent formatting

2. **Requirements** ✅:
   - [ ] All requirement docs written
   - [ ] Clear and unambiguous
   - [ ] Prioritized
   - [ ] Stakeholder reviewed

3. **Design** ✅:
   - [ ] Architecture documented
   - [ ] Component designs complete
   - [ ] System designs complete
   - [ ] Design decisions recorded (ADRs)

4. **Plan** ✅:
   - [ ] Implementation roadmap clear
   - [ ] Milestones defined
   - [ ] Priorities set
   - [ ] Timeline estimated

5. **Component Docs** ✅:
   - [ ] Every component documented
   - [ ] API reference complete
   - [ ] Examples provided
   - [ ] llms.txt generated

6. **Root llms.txt** ✅:
   - [ ] Overview complete
   - [ ] Component list
   - [ ] Getting started guide
   - [ ] Common patterns

7. **Learn Site** ✅:
   - [ ] All stories complete
   - [ ] Showcase page working
   - [ ] Theme/mode/palette switching
   - [ ] Navigation intuitive

### 10.5 Accessibility Completion Criteria

Accessibility is considered **COMPLETE** when:

1. **ARIA Implementation** ✅:
   - [ ] All components follow W3C patterns
   - [ ] Roles correct
   - [ ] States and properties correct
   - [ ] Labels and descriptions provided

2. **Keyboard Navigation** ✅:
   - [ ] All components keyboard accessible
   - [ ] Tab order logical
   - [ ] Shortcuts documented
   - [ ] No keyboard traps

3. **Screen Reader** ✅:
   - [ ] Tested with NVDA
   - [ ] Tested with JAWS
   - [ ] Tested with VoiceOver
   - [ ] All content announced correctly

4. **Automated Testing** ✅:
   - [ ] axe tests passing
   - [ ] WAVE tests passing
   - [ ] Lighthouse accessibility 100
   - [ ] Pa11y tests passing

5. **Contrast** ✅:
   - [ ] All text meets WCAG AA
   - [ ] Important text meets WCAG AAA
   - [ ] Interactive elements distinguishable
   - [ ] Both modes tested

6. **Documentation** ✅:
   - [ ] A11y features documented per component
   - [ ] Keyboard shortcuts listed
   - [ ] Screen reader notes
   - [ ] Known issues documented

### 10.6 Overall Project Completion

The project is considered **COMPLETE** when:

- [ ] All priority components complete (11/11 dimensions)
- [ ] All three themes complete
- [ ] Forms system fully functional
- [ ] Documentation comprehensive
- [ ] llms.txt at root and per-component
- [ ] Learn site fully functional
- [ ] Palette designer working
- [ ] Showcase page working
- [ ] All tests passing
- [ ] Accessibility criteria met
- [ ] Ready for production use
- [ ] Ready for public release

**Phased Milestones**:

**Milestone 1: Foundation** (End of Phase 1)
- [ ] Documentation structure complete
- [ ] All components audited and status known
- [ ] Plan finalized
- [ ] Tracking in place

**Milestone 2: Core Components** (Mid Phase 2)
- [ ] Tier 1 components complete
- [ ] Tier 2 components complete
- [ ] Theme system stable
- [ ] Component showcase working

**Milestone 3: Full Component Library** (End of Phase 2)
- [ ] All components complete
- [ ] All themes complete
- [ ] All llms.txt files created
- [ ] Learn site comprehensive

**Milestone 4: Forms System** (End of Phase 3)
- [ ] Forms system complete
- [ ] Complex form examples
- [ ] Full documentation
- [ ] Ready for v1.0 release

## 11. Next Steps

### Immediate Actions (Week 1)

#### Day 1-2: Initial Setup
1. **Create Documentation Structure**:
   ```bash
   mkdir -p docs/{requirements,design,plan,decisions}
   mkdir -p docs/design/components
   touch docs/tracking.md
   ```

2. **Copy Master Reference**:
   - Save this document as `docs/llms-master-reference.md`
   - Share with team

3. **Set Up Tracking**:
   - Create initial `tracking.md` structure
   - Define update schedule (weekly)
   - Assign tracking owner

#### Day 3-5: Component Audit
4. **Create Component Inventory**:
   - List all existing components
   - Categorize by type
   - Note which use bits-ui

5. **Initial Status Assessment**:
   - Quick pass through all components
   - Identify obvious gaps
   - Rough priority assignment

6. **Document Current State**:
   - Create `docs/design/project-status.md`
   - Create `docs/design/component-inventory.md`
   - Begin `docs/design/component-status.md`

### Short-term Actions (Week 2-3)

#### Week 2: Deep Dive Documentation
7. **Requirements Documentation**:
   - Write all requirement docs
   - Define success criteria
   - Get stakeholder review

8. **Design Documentation**:
   - Document architecture
   - Document theme system
   - Document forms system
   - Start per-component designs for priority items

9. **Test Current State**:
   - Test theme switching
   - Test mode switching
   - Document bugs in detail
   - Test accessibility (spot check)

#### Week 3: Planning and Prioritization
10. **Create Implementation Roadmap**:
    - Define milestones
    - Set timeline estimates
    - Allocate resources

11. **Prioritize Components**:
    - Apply priority criteria
    - Create ordered list
    - Assign to phases

12. **Set Up Tooling**:
    - Automated testing framework
    - Visual regression setup
    - Accessibility testing automation
    - CI/CD for documentation

### Medium-term Actions (Weeks 4-12)

#### Weeks 4-12: Component Implementation
13. **Begin Component Work**:
    - Start with Tier 1 components
    - Follow per-component checklist
    - Track progress weekly

14. **Theme Development**:
    - Work on themes in parallel
    - Maintain consistency
    - Regular reviews

15. **Learn Site Enhancements**:
    - Implement theme/mode/palette switchers
    - Begin showcase page
    - Create component stories

16. **llms.txt Creation**:
    - Create per-component as components complete
    - Draft root llms.txt
    - Iterate based on usage

### Long-term Actions (Weeks 13-18)

#### Weeks 13-18: Forms System
17. **Forms Implementation**:
    - Follow Phase 3 plan
    - Build incrementally
    - Test with real-world scenarios

18. **Palette Designer**:
    - Design UI/UX
    - Implement color theory algorithms
    - Build preview system
    - Test accessibility features

19. **Final Polish**:
    - Performance optimization
    - Bundle size reduction
    - Documentation review
    - User testing

### Ongoing Actions

20. **Weekly Review**:
    - Update `tracking.md`
    - Review progress against plan
    - Adjust priorities as needed
    - Identify blockers

21. **Documentation Maintenance**:
    - Keep docs up to date
    - Add new discoveries
    - Refine based on feedback

22. **Testing**:
    - Run automated tests
    - Manual accessibility testing
    - Cross-browser testing
    - Performance monitoring

23. **Community Engagement** (if applicable):
    - Gather feedback
    - Address issues
    - Update based on real-world usage

### Decision Points

**By End of Week 1**:
- [ ] Documentation structure approved
- [ ] Tracking system in place
- [ ] Component inventory complete

**By End of Week 3**:
- [ ] All requirements documented
- [ ] Implementation plan approved
- [ ] Priorities finalized
- [ ] Ready to begin implementation

**By End of Week 6** (Mid Phase 2):
- [ ] Decision: Continue with bits-ui or move to custom?
- [ ] Tier 1 components complete
- [ ] Theme system stable

**By End of Week 12** (End Phase 2):
- [ ] All components complete
- [ ] Ready for forms work

**By End of Week 18** (End Phase 3):
- [ ] Forms system complete
- [ ] Ready for v1.0 release

### Success Metrics to Track

**Weekly**:
- Components completed
- Test coverage percentage
- Documentation coverage
- Blockers identified
- Progress vs. plan

**Monthly**:
- Milestone completion
- Overall project health
- Team velocity
- Quality metrics (bug count, a11y violations)

**Overall**:
- Time to completion
- Budget vs. actual
- Quality achieved
- Stakeholder satisfaction

---

## Appendix A: Quick Reference

### Key File Locations
- Master Reference: `docs/llms-master-reference.md`
- Tracking: `docs/tracking.md`
- Component Status: `docs/design/component-status.md`
- Project Status: `docs/design/project-status.md`
- Roadmap: `docs/plan/implementation-roadmap.md`

### Status Indicators
- ✅ Complete
- 🟡 Partial / In Progress
- ❌ Missing / Not Started
- 🚫 Not Applicable

### Priority Levels
- **High**: Critical path, foundational, or frequently used
- **Medium**: Important but not blocking
- **Low**: Nice to have, can be deferred

### Component Categories
- **Input**: Form controls (Button, Input, Select, etc.)
- **Layout**: Structure (Card, Grid, Stack, etc.)
- **Navigation**: Wayfinding (Menu, Tabs, Breadcrumb, etc.)
- **Feedback**: Status communication (Alert, Toast, Dialog, etc.)
- **Data Display**: Show information (List, Table, Tree, etc.)
- **Advanced**: Complex interactions (Date Picker, Color Picker, etc.)

### Review Cadence
- **Daily**: Team standup (blockers, progress)
- **Weekly**: Update tracking.md, review progress
- **Bi-weekly**: Milestone review, priority adjustment
- **Monthly**: Stakeholder review, roadmap adjustment

---

## Appendix B: Glossary

**Data-Driven**: Components configured via data structures rather than composition

**Composable**: Low-level components that can be combined to create custom UIs

**Semantic Colors**: Color variables named by purpose (--primary) rather than value (--blue)

**ARIA**: Accessible Rich Internet Applications - W3C accessibility standard

**llms.txt**: Text file format optimized for LLM consumption

**Story**: Example usage of a component with code and documentation

**Theme**: Complete visual styling for all components (rokkit, minimal, material)

**Mode**: Light or dark color scheme

**Palette**: Set of colors used throughout the theme

**Data Attribute**: HTML attribute used for styling (data-state="active")

**Progressive Enhancement**: Start with semantic HTML, enhance with JavaScript

**WCAG**: Web Content Accessibility Guidelines

**ADR**: Architecture Decision Record

**FOUC**: Flash of Unstyled Content

---

## Document Maintenance

**Version**: 1.0
**Last Updated**: [Current Date]
**Next Review**: [Date + 2 weeks]
**Owner**: [Project Lead]
**Contributors**: [Team Members]

**Change Log**:
- v1.0: Initial comprehensive master reference created

**Feedback**:
- Submit suggestions via [method]
- Questions to [contact]

---

*This document serves as the source of truth for the Rokkit UI Component Library project. All team members and AI assistants should reference this document when working on any aspect of the project.*

Note: Some parts of this document are abstract and needs to be adjusted based on the library

- Documentation can take time so we need to plan and follow documentation in chunks (maybe by package and component)
- Don't use the weeks, days listed in example for the plan. Just organize in packages/modules/components. And we follow a checklist while documenting and implementing.
