# Component Inventory

> Complete listing of all Rokkit components organized by category, with implementation status.

## Summary

| Package | Exported Components | Status |
| --------------- | -------------------------------------------------------- | ------ |
| `@rokkit/ui` | 62 (from `packages/ui/src/index.ts`) | Active |
| `@rokkit/forms` | 30 | Active |
| `@rokkit/chart` | 40+ (Plot primitives, high-level charts, geoms, crossfilter) | Active |
| `@rokkit/app` | 1 | Active |

**Status key:**

- Implemented — component exists and is exported from the package
- In Progress — partial implementation or missing tests/stories
- Planned — designed but not built
- Proposed — considered but not yet designed

---

## Selection & Navigation

| Component    | Package      | Status      | Description                                                    |
| ------------ | ------------ | ----------- | -------------------------------------------------------------- |
| List         | `@rokkit/ui` | Implemented | Vertical list with keyboard navigation and selection           |
| Tree         | `@rokkit/ui` | Implemented | Hierarchical tree with expand/collapse and keyboard navigation |
| LazyTree     | `@rokkit/ui` | Implemented | Tree with lazy-loaded children for large datasets              |
| Toolbar      | `@rokkit/ui` | Implemented | Row of action items with arrow-key navigation                  |
| ToolbarGroup | `@rokkit/ui` | Implemented | Grouping container for Toolbar items                           |
| Tabs         | `@rokkit/ui` | Implemented | Tabbed interface with keyboard navigation                      |
| Menu         | `@rokkit/ui` | Implemented | Dropdown menu with grouped actions                             |
| Select       | `@rokkit/ui` | Implemented | Single-value dropdown selection                                |
| MultiSelect  | `@rokkit/ui` | Implemented | Multi-value selection with pill display                        |
| Toggle       | `@rokkit/ui` | Implemented | Exclusive option toggle (button group style)                   |
| BreadCrumbs  | `@rokkit/ui` | Implemented | Breadcrumb path navigation                                     |
| SearchFilter | `@rokkit/ui` | Implemented | Search input with filter behaviour                             |
| Dropdown     | `@rokkit/ui` | Implemented | Trigger + floating panel overlay (base for Select/Menu)        |
| NavContent   | `@rokkit/ui` | Implemented | Navigation content container                                   |
| CommandPalette | `@rokkit/ui` | Implemented | Command palette (search + run app commands)                  |

---

## Input & Forms

### Form Orchestration

| Component    | Package         | Status      | Description                                          |
| ------------ | --------------- | ----------- | ---------------------------------------------------- |
| FormRenderer | `@rokkit/forms` | Implemented | Schema-driven form rendering with layout support     |
| FormBuilder  | `@rokkit/forms` | Implemented | Reactive form state builder (class, not a component) |
| InputField   | `@rokkit/forms` | Implemented | Labeled input wrapper with validation display        |
| InfoField    | `@rokkit/forms` | Implemented | Read-only labeled field for display within forms     |
| StatusList   | `@rokkit/forms` | Implemented | Aggregated validation error list                     |
| FieldLayout  | `@rokkit/forms` | Implemented | Layout wrapper for form field positioning            |
| Input        | `@rokkit/forms` | Implemented | Universal base input component (wraps native inputs) |
| ArrayEditor  | `@rokkit/forms` | Implemented | Editor for array-typed fields                        |

### Standalone Input Controls

| Component        | Package      | Status      | Description                           |
| ---------------- | ------------ | ----------- | ------------------------------------- |
| Switch           | `@rokkit/ui` | Implemented | On/off toggle switch                  |
| Rating           | `@rokkit/ui` | Implemented | Star rating input                     |
| Range            | `@rokkit/ui` | Implemented | Range slider input                    |
| Stepper          | `@rokkit/ui` | Implemented | Step-through value input              |
| UploadTarget     | `@rokkit/ui` | Implemented | Drag-and-drop file upload target zone |
| UploadProgress   | `@rokkit/ui` | Implemented | File upload progress display          |
| UploadFileStatus | `@rokkit/ui` | Implemented | Per-file upload status indicator      |

### Native Input Wrappers (used by FormRenderer)

| Component     | Package         | Status      | Description                                    |
| ------------- | --------------- | ----------- | ---------------------------------------------- |
| InputText     | `@rokkit/forms` | Implemented | Text input                                     |
| InputNumber   | `@rokkit/forms` | Implemented | Number input                                   |
| InputEmail    | `@rokkit/forms` | Implemented | Email input                                    |
| InputPassword | `@rokkit/forms` | Implemented | Password input                                 |
| InputUrl      | `@rokkit/forms` | Implemented | URL input                                      |
| InputTel      | `@rokkit/forms` | Implemented | Telephone input                                |
| InputTextArea | `@rokkit/forms` | Implemented | Multi-line text input                          |
| InputCheckbox | `@rokkit/forms` | Implemented | Checkbox input                                 |
| InputRadio    | `@rokkit/forms` | Implemented | Radio button input                             |
| InputSelect   | `@rokkit/forms` | Implemented | Native select input                            |
| InputSwitch   | `@rokkit/forms` | Implemented | Switch input (form-connected)                  |
| InputToggle   | `@rokkit/forms` | Implemented | Toggle input (form-connected)                  |
| InputRange    | `@rokkit/forms` | Implemented | Range slider input (form-connected)            |
| InputDate     | `@rokkit/forms` | Implemented | Date picker input                              |
| InputDateTime | `@rokkit/forms` | Implemented | Date-time picker input                         |
| InputTime     | `@rokkit/forms` | Implemented | Time picker input                              |
| InputMonth    | `@rokkit/forms` | Implemented | Month picker input                             |
| InputWeek     | `@rokkit/forms` | Implemented | Week picker input                              |
| InputColor    | `@rokkit/forms` | Implemented | Color picker input                             |
| InputFile     | `@rokkit/forms` | Implemented | File input                                     |
| FileUpload    | `@rokkit/ui`    | Proposed    | Standalone drag-and-drop file upload component |

---

## Display & Content

### Form Display Components

| Component       | Package         | Status      | Description                               |
| --------------- | --------------- | ----------- | ----------------------------------------- |
| DisplayValue    | `@rokkit/forms` | Implemented | Read-only display of a single field value |
| DisplaySection  | `@rokkit/forms` | Implemented | Grouped section display within a form     |
| DisplayTable    | `@rokkit/forms` | Implemented | Tabular display of form data              |
| DisplayCardGrid | `@rokkit/forms` | Implemented | Card grid display of form data            |
| DisplayList     | `@rokkit/forms` | Implemented | List display of form data                 |

### UI Display Components

| Component   | Package      | Status      | Description                                               |
| ----------- | ------------ | ----------- | --------------------------------------------------------- |
| Card        | `@rokkit/ui` | Implemented | Content card container with selection and snippet support |
| Code        | `@rokkit/ui` | Implemented | Syntax-highlighted inline/code display                     |
| CodeBlock   | `@rokkit/ui` | Implemented | Standalone syntax-highlighted code block                   |
| CodeGroup   | `@rokkit/ui` | Implemented | Tabbed group of code blocks                                |
| Timeline    | `@rokkit/ui` | Implemented | Chronological event display                               |
| Table       | `@rokkit/ui` | Implemented | Tabular data display                                      |
| TreeTable   | `@rokkit/ui` | Implemented | Tabular display with collapsible hierarchical rows         |
| Pill        | `@rokkit/ui` | Implemented | Tag/label pill display                                    |
| Badge       | `@rokkit/ui` | Implemented | Numeric or status badge indicator                         |
| Avatar      | `@rokkit/ui` | Implemented | User/entity avatar (image or initials)                     |
| ItemContent | `@rokkit/ui` | Implemented | Standardised item content layout (used inside List/Tree)  |
| ItemSwitch  | `@rokkit/ui` | Implemented | Item renderer with a switch control                        |
| ItemToggle  | `@rokkit/ui` | Implemented | Item renderer with a toggle control                        |
| Connector   | `@rokkit/ui` | Implemented | Visual connector line between elements                    |
| Reveal      | `@rokkit/ui` | Implemented | Content reveal/show-more container                        |
| MarkdownRenderer | `@rokkit/ui` | Implemented | Renders Markdown (with pluggable renderers) to components |

### Buttons

| Component   | Package      | Status      | Description                              |
| ----------- | ------------ | ----------- | ---------------------------------------- |
| Button      | `@rokkit/ui` | Implemented | Themed button with variants and sizes    |
| ButtonGroup | `@rokkit/ui` | Implemented | Grouping container for related buttons    |

### Chat

| Component    | Package      | Status      | Description                                          |
| ------------ | ------------ | ----------- | ---------------------------------------------------- |
| ChatShell    | `@rokkit/ui` | Implemented | Chat layout shell (history + composer regions)       |
| ChatHistory  | `@rokkit/ui` | Implemented | Scrollable list of chat messages                     |
| ChatMessage  | `@rokkit/ui` | Implemented | Single chat message bubble (rich content via snippet) |
| ChatComposer | `@rokkit/ui` | Implemented | Message input composer (plain-Enter submit)          |
| ChatTimeline | `@rokkit/ui` | Implemented | Timeline grouping for chat messages                  |

---

## Overlay & Feedback

| Component          | Package      | Status      | Description                              |
| ------------------ | ------------ | ----------- | ---------------------------------------- |
| FloatingAction     | `@rokkit/ui` | Implemented | Floating action button (FAB)             |
| FloatingNavigation | `@rokkit/ui` | Implemented | Floating navigation panel                |
| ProgressBar        | `@rokkit/ui` | Implemented | Linear progress indicator                |
| Message            | `@rokkit/ui` | Implemented | Inline status/notification message       |
| AlertList          | `@rokkit/ui` | Implemented | List of dismissable alerts (from `alerts` store) |
| Tooltip            | `@rokkit/ui` | Implemented | Contextual hover/focus tooltip           |
| Modal              | `@rokkit/ui` | Proposed    | Dialog/modal overlay with focus trapping |
| Toast              | `@rokkit/ui` | Proposed    | Transient notification messages          |

---

## Layout

| Component | Package | Status | Description |
| --------- | ------------ | ----------- | ---------------------------------------- |
| Carousel | `@rokkit/ui` | Implemented | Horizontally scrolling content carousel |
| Grid | `@rokkit/ui` | Implemented | Data-driven tile grid with keyboard navigation |
| ResponsiveGrid | `@rokkit/ui` | Implemented | Responsive CSS grid layout container |
| Stack | `@rokkit/ui` | Implemented | Row/column stacking layout with gap |
| Divider | `@rokkit/ui` | Implemented | Horizontal or vertical content separator |
| Frame | `@rokkit/ui` | Implemented | Framed/bordered content container |
| Shine | `@rokkit/ui` | Implemented | Shine/gloss visual effect layer |
| Tilt | `@rokkit/ui` | Implemented | 3D tilt interaction effect container |
| Panel | `@rokkit/ui` | Proposed | Collapsible side or content panel |

---

## Charts

### Plot Primitives (`@rokkit/chart` — `Plot.*`)

| Component   | Package         | Status      | Description                           |
| ----------- | --------------- | ----------- | ------------------------------------- |
| Plot.Root   | `@rokkit/chart` | Implemented | SVG chart root with coordinate system |
| Plot.Axis   | `@rokkit/chart` | Implemented | Chart axis (x or y)                   |
| Plot.Bar    | `@rokkit/chart` | Implemented | Bar series primitive                  |
| Plot.Grid   | `@rokkit/chart` | Implemented | Background grid lines                 |
| Plot.Legend | `@rokkit/chart` | Implemented | Chart legend                          |
| Plot.Line   | `@rokkit/chart` | Implemented | Line series primitive                 |
| Plot.Area   | `@rokkit/chart` | Implemented | Area series primitive                 |
| Plot.Point  | `@rokkit/chart` | Implemented | Point/scatter primitive               |
| Plot.Arc    | `@rokkit/chart` | Implemented | Arc/pie segment primitive             |

### Pattern Fills (`@rokkit/chart`)

| Component                                                                            | Package         | Status      | Description                                    |
| ------------------------------------------------------------------------------------ | --------------- | ----------- | ---------------------------------------------- |
| Texture / DefinePatterns                                                             | `@rokkit/chart` | Implemented | SVG pattern fill definitions for accessibility |
| Brick, Circles, CrossHatch, CurvedWave, Dots, OutlineCircles, Tile, Triangles, Waves | `@rokkit/chart` | Implemented | Individual repeating pattern fills             |

### High-Level Chart Components

| Component     | Package         | Status      | Description                                     |
| ------------- | --------------- | ----------- | ----------------------------------------------- |
| Chart         | `@rokkit/chart` | Implemented | Generic chart wrapper                           |
| PlotChart     | `@rokkit/chart` | Implemented | Declarative plot host for Geom components       |
| Sparkline     | `@rokkit/chart` | Implemented | Compact inline trend chart (line/bar/area)      |
| BarChart      | `@rokkit/chart` | Implemented | Full bar chart with axes, legend, and animation |
| LineChart     | `@rokkit/chart` | Implemented | Line chart with multi-series support            |
| AreaChart     | `@rokkit/chart` | Implemented | Area chart with stacked variant                 |
| PieChart      | `@rokkit/chart` | Implemented | Pie chart for part-to-whole data                |
| ScatterPlot   | `@rokkit/chart` | Implemented | Scatter chart for correlation data              |
| BubbleChart   | `@rokkit/chart` | Implemented | Scatter chart with size-encoded third dimension |
| BoxPlot       | `@rokkit/chart` | Implemented | Box-and-whisker distribution chart              |
| ViolinPlot    | `@rokkit/chart` | Implemented | Violin distribution chart                       |
| FacetPlot     | `@rokkit/chart` | Implemented | Small-multiples / faceted plot                  |
| AnimatedPlot  | `@rokkit/chart` | Implemented | Animated plot with transition support           |
| DonutChart    | `@rokkit/chart` | Planned     | Donut chart with centre label (not yet exported) |

### Geom Components (`@rokkit/chart` — declarative marks for `PlotChart`)

| Component | Package | Status | Description |
| --------- | ------- | ------ | ----------- |
| GeomBar, GeomLine, GeomArea, GeomPoint, GeomArc, GeomBox, GeomViolin, GeomHeatmap, GeomCandlestick, GeomWaterfall, GeomHexbin, GeomRibbon | `@rokkit/chart` | Implemented | Declarative mark components rendered inside `PlotChart` |

### CrossFilter (`@rokkit/chart`)

| Component       | Package         | Status      | Description                                     |
| --------------- | --------------- | ----------- | ----------------------------------------------- |
| CrossFilter     | `@rokkit/chart` | Implemented | Linked charts with cross-filtering interaction  |
| FilterBar       | `@rokkit/chart` | Implemented | Categorical cross-filter control                |
| FilterSlider    | `@rokkit/chart` | Implemented | Range cross-filter control                      |
| FilterHistogram | `@rokkit/chart` | Implemented | Histogram cross-filter control                  |

---

## Theme & Utilities

| Component           | Package         | Status      | Description                                                            |
| ------------------- | --------------- | ----------- | ---------------------------------------------------------------------- |
| PaletteManager      | `@rokkit/ui`    | Implemented | UI for browsing and switching colour palettes                          |
| ThemeSwitcherToggle | `@rokkit/app`   | Implemented | Toggle button for switching between themes/modes                       |
| ChartBrewer         | `@rokkit/chart` | Implemented | Utility class for deriving chart colour palettes from the active theme |

---

## Package Cross-Reference

| Package           | Purpose                     | Key Exports                                                                 |
| ----------------- | --------------------------- | -------------------------------------------------------------------------- |
| `@rokkit/ui`      | Main component library      | 62 UI components                                                           |
| `@rokkit/forms`   | Form generation and inputs  | FormRenderer, FormBuilder, 30 form components                             |
| `@rokkit/chart`   | Data visualisation          | Plot primitives, high-level charts, Geom marks, crossfilter, ChartBrewer   |
| `@rokkit/app`     | Application shell utilities | ThemeSwitcherToggle                                                        |
| `@rokkit/states`  | Reactive state controllers  | Wrapper, LazyWrapper, ProxyItem, ProxyTree, ProxyTable, ProxyTableTree, vibe, alerts, messages, commands, watchMedia |
| `@rokkit/actions` | Svelte actions + classes    | `Navigator`, `Trigger`, `shortcuts`, `dismissable`, `themable`, `skinnable`, `lockMode`, `tooltip`, `ripple`, `hoverLift`, `magnetic`, `reveal` |
| `@rokkit/core`    | Shared utilities            | field-mapper, mapping, types                                              |
| `@rokkit/themes`  | CSS theme definitions       | rokkit, minimal, material, frosted, zen-sumi themes                       |
