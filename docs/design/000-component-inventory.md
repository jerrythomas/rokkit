# Component Inventory

> Complete listing of all Rokkit components organized by category, with implementation status.

## Summary

| Package | Exported Components | Status |
|---------|---------------------|--------|
| `@rokkit/ui` | 38 | Active |
| `@rokkit/forms` | 30 | Active |
| `@rokkit/chart` | 6 (Plot primitives + ChartBrewer) | Active |
| `@rokkit/app` | 1 | Active |

**Status key:**
- Implemented — component exists and is exported from the package
- In Progress — partial implementation or missing tests/stories
- Planned — designed but not built
- Proposed — considered but not yet designed

---

## 1. Selection & Navigation

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| List | `@rokkit/ui` | Implemented | Vertical list with keyboard navigation and selection |
| Tree | `@rokkit/ui` | Implemented | Hierarchical tree with expand/collapse and keyboard navigation |
| LazyTree | `@rokkit/ui` | Implemented | Tree with lazy-loaded children for large datasets |
| Toolbar | `@rokkit/ui` | Implemented | Row of action items with arrow-key navigation |
| ToolbarGroup | `@rokkit/ui` | Implemented | Grouping container for Toolbar items |
| Tabs | `@rokkit/ui` | Implemented | Tabbed interface with keyboard navigation |
| Menu | `@rokkit/ui` | Implemented | Dropdown menu with grouped actions |
| Select | `@rokkit/ui` | Implemented | Single-value dropdown selection |
| MultiSelect | `@rokkit/ui` | Implemented | Multi-value selection with pill display |
| Toggle | `@rokkit/ui` | Implemented | Exclusive option toggle (button group style) |
| BreadCrumbs | `@rokkit/ui` | Implemented | Breadcrumb path navigation |
| SearchFilter | `@rokkit/ui` | Implemented | Search input with filter behaviour |

---

## 2. Input & Forms

### Form Orchestration

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| FormRenderer | `@rokkit/forms` | Implemented | Schema-driven form rendering with layout support |
| FormBuilder | `@rokkit/forms` | Implemented | Reactive form state builder (class, not a component) |
| InputField | `@rokkit/forms` | Implemented | Labeled input wrapper with validation display |
| InfoField | `@rokkit/forms` | Implemented | Read-only labeled field for display within forms |
| ValidationReport | `@rokkit/forms` | Implemented | Aggregated validation error list |
| FieldLayout | `@rokkit/forms` | Implemented | Layout wrapper for form field positioning |
| Input | `@rokkit/forms` | Implemented | Universal base input component (wraps native inputs) |
| ArrayEditor | `@rokkit/forms` | Implemented | Editor for array-typed fields |

### Standalone Input Controls

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| Switch | `@rokkit/ui` | Implemented | On/off toggle switch |
| Rating | `@rokkit/ui` | Implemented | Star rating input |
| Range | `@rokkit/ui` | Implemented | Range slider input |
| Stepper | `@rokkit/ui` | Implemented | Step-through value input |
| UploadTarget | `@rokkit/ui` | Implemented | Drag-and-drop file upload target zone |
| UploadProgress | `@rokkit/ui` | Implemented | File upload progress display |
| UploadFileStatus | `@rokkit/ui` | Implemented | Per-file upload status indicator |

### Native Input Wrappers (used by FormRenderer)

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| InputText | `@rokkit/forms` | Implemented | Text input |
| InputNumber | `@rokkit/forms` | Implemented | Number input |
| InputEmail | `@rokkit/forms` | Implemented | Email input |
| InputPassword | `@rokkit/forms` | Implemented | Password input |
| InputUrl | `@rokkit/forms` | Implemented | URL input |
| InputTel | `@rokkit/forms` | Implemented | Telephone input |
| InputTextArea | `@rokkit/forms` | Implemented | Multi-line text input |
| InputCheckbox | `@rokkit/forms` | Implemented | Checkbox input |
| InputRadio | `@rokkit/forms` | Implemented | Radio button input |
| InputSelect | `@rokkit/forms` | Implemented | Native select input |
| InputSwitch | `@rokkit/forms` | Implemented | Switch input (form-connected) |
| InputToggle | `@rokkit/forms` | Implemented | Toggle input (form-connected) |
| InputRange | `@rokkit/forms` | Implemented | Range slider input (form-connected) |
| InputDate | `@rokkit/forms` | Implemented | Date picker input |
| InputDateTime | `@rokkit/forms` | Implemented | Date-time picker input |
| InputTime | `@rokkit/forms` | Implemented | Time picker input |
| InputMonth | `@rokkit/forms` | Implemented | Month picker input |
| InputWeek | `@rokkit/forms` | Implemented | Week picker input |
| InputColor | `@rokkit/forms` | Implemented | Color picker input |
| InputFile | `@rokkit/forms` | Implemented | File input |
| FileUpload | `@rokkit/ui` | Proposed | Standalone drag-and-drop file upload component |

---

## 3. Display & Content

### Form Display Components

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| DisplayValue | `@rokkit/forms` | Implemented | Read-only display of a single field value |
| DisplaySection | `@rokkit/forms` | Implemented | Grouped section display within a form |
| DisplayTable | `@rokkit/forms` | Implemented | Tabular display of form data |
| DisplayCardGrid | `@rokkit/forms` | Implemented | Card grid display of form data |
| DisplayList | `@rokkit/forms` | Implemented | List display of form data |

### UI Display Components

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| Card | `@rokkit/ui` | Implemented | Content card container with selection and snippet support |
| Code | `@rokkit/ui` | Implemented | Syntax-highlighted code block display |
| Timeline | `@rokkit/ui` | Implemented | Chronological event display |
| Table | `@rokkit/ui` | Implemented | Tabular data display |
| Pill | `@rokkit/ui` | Implemented | Tag/label pill display |
| ItemContent | `@rokkit/ui` | Implemented | Standardised item content layout (used inside List/Tree) |
| Connector | `@rokkit/ui` | Implemented | Visual connector line between elements |
| Reveal | `@rokkit/ui` | Implemented | Content reveal/show-more container |
| Badge | `@rokkit/ui` | Proposed | Numeric or status badge indicator |

---

## 4. Overlay & Feedback

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| FloatingAction | `@rokkit/ui` | Implemented | Floating action button (FAB) |
| FloatingNavigation | `@rokkit/ui` | Implemented | Floating navigation panel |
| ProgressBar | `@rokkit/ui` | Implemented | Linear progress indicator |
| Modal | `@rokkit/ui` | Proposed | Dialog/modal overlay with focus trapping |
| Toast | `@rokkit/ui` | Proposed | Transient notification messages |
| Tooltip | `@rokkit/ui` | Proposed | Contextual hover tooltip |

---

## 5. Layout

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| Carousel | `@rokkit/ui` | Implemented | Horizontally scrolling content carousel |
| Grid | `@rokkit/ui` | Implemented | Responsive CSS grid layout container |
| Shine | `@rokkit/ui` | Implemented | Shine/gloss visual effect layer |
| Tilt | `@rokkit/ui` | Implemented | 3D tilt interaction effect container |
| Panel | `@rokkit/ui` | Proposed | Collapsible side or content panel |
| Divider | `@rokkit/ui` | Planned | Horizontal or vertical content separator |

---

## 6. Charts

### Plot Primitives (`@rokkit/chart` — `Plot.*`)

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| Plot.Root | `@rokkit/chart` | Implemented | SVG chart root with coordinate system |
| Plot.Axis | `@rokkit/chart` | Implemented | Chart axis (x or y) |
| Plot.Bar | `@rokkit/chart` | Implemented | Bar series primitive |
| Plot.Grid | `@rokkit/chart` | Implemented | Background grid lines |
| Plot.Legend | `@rokkit/chart` | Implemented | Chart legend |

### Pattern Fills (`@rokkit/chart`)

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| Texture / DefinePatterns | `@rokkit/chart` | Implemented | SVG pattern fill definitions for accessibility |
| Brick, Circles, CrossHatch, CurvedWave, Dots, OutlineCircles, Tile, Triangles, Waves | `@rokkit/chart` | Implemented | Individual repeating pattern fills |

### High-Level Chart Components (planned)

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| Sparkline | `@rokkit/chart` | Implemented | Compact inline trend chart (line/bar/area) |
| BarChart | `@rokkit/chart` | Planned | Full bar chart with axes, legend, and animation |
| LineChart | `@rokkit/chart` | Planned | Line chart with multi-series support |
| AreaChart | `@rokkit/chart` | Planned | Area chart with stacked variant |
| PieChart | `@rokkit/chart` | Planned | Pie chart for part-to-whole data |
| DonutChart | `@rokkit/chart` | Planned | Donut chart with centre label |
| ScatterPlot | `@rokkit/chart` | Planned | Scatter chart for correlation data |
| BubbleChart | `@rokkit/chart` | Planned | Scatter chart with size-encoded third dimension |
| AnimatedChart | `@rokkit/chart` | Planned | Shared animation wrapper for chart transitions |
| CrossFilter | `@rokkit/chart` | Proposed | Linked charts with cross-filtering interaction |

---

## 7. Theme & Utilities

| Component | Package | Status | Description |
|-----------|---------|--------|-------------|
| PaletteManager | `@rokkit/ui` | Implemented | UI for browsing and switching colour palettes |
| ThemeSwitcherToggle | `@rokkit/app` | Implemented | Toggle button for switching between themes/modes |
| ChartBrewer | `@rokkit/chart` | Implemented | Utility class for deriving chart colour palettes from the active theme |

---

## Package Cross-Reference

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@rokkit/ui` | Main component library | 38 UI components |
| `@rokkit/forms` | Form generation and inputs | FormRenderer, FormBuilder, 30 form components |
| `@rokkit/chart` | Data visualisation | Plot primitives, patterns, ChartBrewer |
| `@rokkit/app` | Application shell utilities | ThemeSwitcherToggle |
| `@rokkit/states` | Reactive state controllers | ListController, NestedController, Proxy, Vibe |
| `@rokkit/actions` | Svelte actions | `navigator`, `controller`, drag-and-drop |
| `@rokkit/core` | Shared utilities | field-mapper, mapping, types |
| `@rokkit/themes` | CSS theme definitions | rokkit, glass, material, minimal themes |
