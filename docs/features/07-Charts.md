# Charts

Rokkit includes a composable `Plot` system for data visualization. It follows the same data-driven philosophy as the rest of the library — pass data as-is, map fields to visual channels, apply themes — and extends it to cover the full range of chart types, overlays, facets, animation, and linked interaction.

Charts are configured via a `PlotSpec` JSON schema (suitable for AI/backend generation) or a declarative component API. Both normalize to the same internal `PlotState` before rendering. Theme, dark mode, and pattern fills are all supported.

---

## Features

### Plot System

The core composable chart primitive. A `Plot` hosts one or more geom layers on shared axes.

```gherkin
Feature: Plot System

  Scenario: Plot renders a single geom
    Given a Plot with data, x/y channels, and a Bar geom
    When rendered
    Then a bar chart appears with shared axis and grid

  Scenario: Plot overlays multiple geoms on shared axes
    Given a Plot with Bar and Line geoms on the same data
    When rendered
    Then both geoms share the same x and y scales
    And the y domain is the union of both geoms' data ranges

  Scenario: Plot accepts a serializable PlotSpec
    Given a PlotSpec object with data, channels, and geoms array
    When passed to <Plot spec={...} />
    Then the chart renders identically to the declarative form
    And the spec can be JSON.stringify'd without loss

  Scenario: Plot accepts helpers for function-based extensions
    Given a spec with a custom stat name and tooltip: true
    And a helpers object with stats and tooltip functions
    When rendered
    Then the custom stat is applied and tooltip uses the provided function

  Scenario: Geom orientation is inferred from scale types
    Given a bar chart with x mapped to a numeric field and y mapped to a categorical field
    When rendered
    Then horizontal bars are produced without any explicit orientation prop
    And swapping x and y back produces vertical bars
```

### PlotSpec — Serializable Chart Schema

```gherkin
Feature: PlotSpec

  Scenario: Spec is fully serializable
    Given a PlotSpec with data, channels, geoms, labels, and stat
    When JSON.stringify is called on it
    Then no functions, components, or non-serializable values are present

  Scenario: Labels map field names to display names
    Given a spec with labels: { cty: 'City MPG', hwy: 'Highway MPG' }
    When rendered
    Then axis labels and legend titles show the display names
    And Plot does not perform any translation — labels are pre-resolved by the caller

  Scenario: Labels support i18n from outside
    Given a spec where labels are resolved by a Paraglide message function
    When the user switches language
    Then the parent re-resolves labels and passes new strings
    And Plot re-renders with updated labels
```

### Geom Layer

Pure render components. Each geom reads post-stat data and shared scales from context.

```gherkin
Feature: Geom Layer

  Scenario: Bar geom renders grouped bars by default
    Given a Bar geom with color channel set
    When rendered
    Then one bar group per x value, one bar per color value

  Scenario: Bar geom supports stacking
    Given a Bar geom with options: { stack: true }
    When rendered
    Then bars are stacked, total height equals sum of values

  Scenario: Arc geom renders as pie by default
    Given an Arc geom with theta channel
    When rendered with options: { innerRadius: 0 }
    Then a full pie chart is shown

  Scenario: Arc geom renders as donut
    Given an Arc geom with options: { innerRadius: 0.6 }
    When rendered
    Then a donut chart is shown with inner hole at 60% of outer radius

  Scenario: Custom geom is registered via helpers
    Given a helpers object with geoms: { hexbin: HexbinComponent }
    And a spec with geoms: [{ type: 'hexbin' }]
    When rendered
    Then the custom component is used for that geom layer
```

### Stat Transforms

Charts accept raw unaggregated data. Stats aggregate per geom before rendering.

```gherkin
Feature: Stat Transforms

  Scenario: Built-in stat aggregates value channel
    Given a Bar geom with stat: 'sum' and raw transactional data
    When rendered
    Then values are summed per x+color group before bars are drawn

  Scenario: Multiple geoms use different stats on the same data
    Given a Plot with Bar (stat: 'sum') and Line (stat: 'mean') on the same raw data
    When rendered
    Then bars show totals and the line shows averages on a shared y axis

  Scenario: Custom stat name resolves via helpers
    Given a geom with stat: 'weighted_mean'
    And helpers.stats.weighted_mean defined as a function
    When rendered
    Then the custom function is used for aggregation

  Scenario: Unknown stat name falls back gracefully
    Given a geom with stat: 'unknown_stat' and no helpers entry
    When rendered
    Then a console warning is issued and identity (no aggregation) is used
```

### Color Scales

```gherkin
Feature: Color Scales

  Scenario: Categorical color — string field
    Given a color channel mapped to a string field (e.g. region)
    When rendered
    Then each distinct value gets a palette color
    And the legend shows labeled swatches

  Scenario: Sequential color — numeric field
    Given a color channel mapped to a numeric field (e.g. contribution count)
    And colorScale: 'sequential' or field is numeric (inferred)
    When rendered
    Then color interpolates from light to dark across the value range
    And the legend shows a gradient bar

  Scenario: Diverging color — numeric field with midpoint
    Given a color channel mapped to a numeric field and colorMidpoint: 0
    When rendered
    Then color diverges from the midpoint in two directions
    And the legend shows a gradient bar centered at the midpoint

  Scenario: Color scale overridden via helpers
    Given helpers.colorScale set to a d3 sequential scale
    When rendered
    Then the provided scale is used for color mapping
```

### Facet Plots

```gherkin
Feature: Facet Plots

  Scenario: Data is split into panels by a field
    Given a spec with facet: { by: 'region', cols: 3 }
    When rendered
    Then one panel per distinct region value is shown in a 3-column CSS grid
    And each panel title shows the region value

  Scenario: Fixed scales keep panels comparable
    Given a facet plot with scales: 'fixed' (default)
    When rendered
    Then all panels share the same x and y domains
    And the same bar height means the same value across panels

  Scenario: Free scales let panels use independent domains
    Given a facet plot with scales: 'free'
    When rendered
    Then each panel uses its own x and y domain

  Scenario: Missing values produce gaps not errors
    Given a facet plot where one panel has no data for a particular x category
    When rendered
    Then the x-axis still shows that category (gap in bars)
    And no error or reordering occurs
    And other panels remain aligned

  Scenario: Stat runs within each panel
    Given a facet plot with Bar stat: 'sum'
    When rendered
    Then each panel aggregates its own data slice independently

  Scenario: Axis and legend are shared across panels
    Given a facet plot with legend: true
    When rendered
    Then y-axis appears only on leftmost column
    And x-axis appears only on bottom row
    And a single legend appears outside the grid
```

### Animation / Race Plot

```gherkin
Feature: Animation

  Scenario: Frames are built from a time field
    Given a spec with animate: { by: 'year' } and raw multi-year data
    When AnimatedPlot renders
    Then one frame per distinct year is produced
    And missing combinations per frame are filled with 0

  Scenario: Scales are computed from full data before animation
    Given an animated bar chart
    When frames advance
    Then the y axis domain does not change between frames
    And bars can be compared across frames by absolute height

  Scenario: Stat runs within each frame
    Given animate: { by: 'year' } and Bar stat: 'sum'
    When rendered
    Then each year's data is aggregated independently

  Scenario: Timeline controls are rendered
    Given an AnimatedPlot
    When rendered
    Then play/pause, scrub slider, speed control, and frame label are shown below the chart

  Scenario: Animation respects reduced-motion preference
    Given prefers-reduced-motion is set
    When frames advance
    Then the chart jumps directly to each frame without tweening

  Scenario: Bar chart race animates sorted positions
    Given a bar chart with animate.by set and bars sorted by value per frame
    When frames advance
    Then bar positions tween smoothly as rankings change between frames
```

### CrossFilter — Linked Interactive Charts

dc.js-style: multiple charts share a filter context. Interacting with one chart filters all others.

```gherkin
Feature: CrossFilter

  Scenario: Multiple plots share a filter context
    Given a CrossFilter wrapping two Plot components
    When the user clicks a bar in Plot 1 (filterable)
    Then Plot 2 re-renders showing only data matching the selected value
    And filtered-out marks in Plot 1 are dimmed (data-dimmed attribute)

  Scenario: Click interaction filters a categorical dimension
    Given a Bar geom with filterable prop
    When the user clicks a bar
    Then that bar's x value is added to the filter for that dimension
    And clicking again removes it (toggle)

  Scenario: Brush interaction filters a continuous range
    Given a Point geom with brush prop
    When the user drags a range on the canvas
    Then a [min, max] range filter is applied to the brushed dimension

  Scenario: Filtered-out marks are dimmed by default
    Given a CrossFilter with default mode
    When a filter is active
    Then out-of-filter marks remain visible at reduced opacity
    And in-filter marks render at full opacity

  Scenario: Filtered-out marks can be hidden
    Given a CrossFilter with mode="hide"
    When a filter is active
    Then out-of-filter marks are not rendered

  Scenario: CrossFilter works with spec API
    Given a createCrossFilter() instance passed in helpers
    When any linked Plot's filter changes
    Then all other Plots using the same crossfilter instance re-render

  Scenario: FilterBar is a compact filterable chart
    Given a FilterBar component with data and field
    When rendered
    Then a small filterable bar chart appears suitable for a filter panel
    And clicking a bar updates the shared CrossFilter state
```

### Tooltips

```gherkin
Feature: Tooltips

  Scenario: Default tooltip shows field values on hover
    Given a Plot with tooltip: true
    When the user hovers a mark
    Then a tooltip shows the data fields for that mark using display labels

  Scenario: Custom tooltip renderer from helpers
    Given helpers.tooltip defined as a function
    When the user hovers a mark
    Then the function's return string is shown in the tooltip

  Scenario: Tooltip uses label map for field names
    Given a spec with labels: { cty: 'City MPG' }
    When the tooltip appears
    Then it shows 'City MPG' not 'cty'
```

### Sparklines

```gherkin
Feature: Sparklines

  Scenario: Sparkline renders a trend inline
    Given a Sparkline with a numeric array
    When rendered inside a card or table cell
    Then a compact line, bar, or area chart appears
    And no axes, labels, or legends are shown

  Scenario: Sparkline inherits theme color
    Given a themed application
    When a sparkline renders
    Then it uses the theme's semantic color (primary, danger, etc.)
    And switches correctly in dark mode
```

### Accessibility

```gherkin
Feature: Accessible Charts

  Scenario: Chart has an accessible label
    Given a chart component with title or aria-label
    Then screen readers announce the chart subject

  Scenario: Data is available as a structured table
    Given any chart with data
    When rendered
    Then a visually hidden data table is present in the DOM
    And screen readers can navigate it to access values

  Scenario: Key data points are announced on keyboard focus
    Given a keyboard-navigable chart
    When focus moves to a mark
    Then label, value, and series context are announced
```

---

## Status

### Plot System

| Feature | Status |
|---------|--------|
| `Plot.svelte` orchestrator | 🔲 Planned |
| `PlotSpec` JSON schema | 🔲 Planned |
| `PlotState` reactive class | 🔲 Planned |
| Declarative geom children API | 🔲 Planned |
| Spec-driven API | 🔲 Planned |
| Helpers pattern (stats, format, tooltip, geoms) | 🔲 Planned |

### Geoms

| Feature | Status |
|---------|--------|
| Bar (vertical + horizontal via scale inference) | 🔲 Planned |
| Bar stacked | 🔲 Planned |
| Line | ✅ Implemented (extract to geom) |
| Area | ✅ Implemented (extract to geom) |
| Area stacked | 🔲 Planned |
| Point / Scatter | ✅ Implemented (extract to geom) |
| Box | ✅ Implemented (extract to geom) |
| Violin | ✅ Implemented (extract to geom) |
| Arc (pie + donut via innerRadius) | ✅ Implemented (extract to geom) |
| Hexbin | 🔲 Planned (#121) |
| Heatmap | 🔲 Planned (#122) |
| Candlestick | 🔲 Planned (#123) |
| Waterfall | 🔲 Planned (#124) |
| Ribbon / Sankey | 🔲 Planned (#125) |

### Visual Encoding

| Feature | Status |
|---------|--------|
| Categorical color scale (palette) | ✅ Implemented |
| Sequential color scale | 🔲 Planned (#126) |
| Diverging color scale | 🔲 Planned (#126) |
| Pattern fills | ✅ Implemented |
| Symbol shapes | ✅ Implemented |
| Labels map + i18n-external contract | 🔲 Planned |
| Tick formatters via helpers.format | 🔲 Planned |
| Dark mode / theme integration | ✅ Implemented |

### Infrastructure

| Feature | Status |
|---------|--------|
| Shared axis (Axis.svelte) | ✅ Implemented |
| Quadrant-aware axis (axisOrigin) | 🔲 Planned (future) |
| Shared grid | ✅ Implemented |
| Shared legend (categorical) | ✅ Implemented |
| Shared legend (gradient — sequential/diverging) | 🔲 Planned |
| Stat transforms (built-in) | ✅ Implemented |
| Stat via helpers.stats (custom) | 🔲 Planned |
| Orientation via scale-type inference | 🔲 Planned |

### Facets

| Feature | Status |
|---------|--------|
| `FacetPlot.svelte` | 🔲 Planned |
| Fixed scales (shared domain) | 🔲 Planned |
| Free scales (per-panel domain) | 🔲 Planned |
| Missing values → gaps | 🔲 Planned |
| Shared axis/legend across panels | 🔲 Planned |

### Animation

| Feature | Status |
|---------|--------|
| `AnimatedPlot.svelte` | 🔲 Planned |
| Frame normalization (fill missing with 0) | 🔲 Planned |
| Static scales across frames | 🔲 Planned |
| Timeline controls (play/pause/scrub/speed) | 🔲 Planned |
| Bar chart race (sorted positions) | 🔲 Planned |
| `prefers-reduced-motion` | 🔲 Planned |

### CrossFilter

| Feature | Status |
|---------|--------|
| `CrossFilter` context provider | 🔲 Planned |
| `createCrossFilter()` for spec API | 🔲 Planned |
| Click filter (categorical) | 🔲 Planned |
| Brush filter (continuous range) | 🔲 Planned |
| Dimming filtered-out marks | 🔲 Planned |
| `FilterBar` wrapper component | 🔲 Planned |
| `FilterSlider` wrapper component | 🔲 Planned |

### Tooltips & Interactivity

| Feature | Status |
|---------|--------|
| Default tooltip on hover | 🔲 Planned |
| Custom tooltip via helpers.tooltip | 🔲 Planned |
| Click selection events | 🔲 Planned |
| Zoom and pan | 🔲 Planned |
| Keyboard navigation within charts | 🔲 Planned |

### Sparklines

| Feature | Status |
|---------|--------|
| Sparkline — line/bar/area | ✅ Implemented |

### Accessibility

| Feature | Status |
|---------|--------|
| aria-label on chart | 🔲 Planned |
| Visually hidden data table | 🔲 Planned |
| Keyboard focus on data points | 🔲 Planned |
