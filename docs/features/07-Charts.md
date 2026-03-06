# Charts

Rokkit includes charting components designed to feel native to the rest of the library. They follow the same data-driven approach — pass data as-is, map fields, apply themes — and extend it to data visualization. Charts are accessible, interactive, and support the same theming system, including skins, dark mode, and pattern fills for non-color differentiation.

## Features

### Sparklines

Compact, inline charts that communicate a trend or shape at a glance. Sparklines are embeddable anywhere — inside cards, tables, or list items — without requiring a dedicated chart container.

```gherkin
Feature: Sparklines

  Scenario: Sparkline renders a trend from a data series
    Given a Sparkline component with a numeric array
    When rendered inline within a card or table cell
    Then a compact line, bar, or area chart appears
    And no axes, labels, or legends are shown by default

  Scenario: Sparkline inherits theme colors
    Given a themed application
    When a sparkline renders
    Then it uses the theme's primary or accent color
    And switches correctly in dark mode

  Scenario: Sparkline supports pattern fill
    Given a sparkline in a context where color alone is insufficient
    When a pattern fill is configured
    Then the chart area uses a repeating pattern instead of a solid color
    And the chart remains distinguishable without relying on color
```

### Animated Charts

Full chart components with animation that communicate data transitions and draw user attention to changes.

```gherkin
Feature: Animated Charts

  Scenario: Chart animates on initial render
    Given a chart component with data
    When the component mounts
    Then the chart animates into view — bars grow, lines draw, arcs expand
    And animation completes in a reasonable time

  Scenario: Chart animates when data changes
    Given a chart displaying a data series
    When the data prop is updated
    Then the chart transitions smoothly to the new data
    And previous values are visibly replaced

  Scenario: Animation is disabled for reduced motion preference
    Given a user with prefers-reduced-motion set
    When a chart renders or updates
    Then data is shown immediately without animation
    And no motion is introduced
```

### Chart Types

A range of chart types covering the most common data visualization needs in application interfaces.

```gherkin
Feature: Chart Types

  Scenario: Bar chart compares values across categories
    Given a bar chart with categorical data
    When rendered
    Then each category is represented by a bar proportional to its value
    And grouped or stacked variants are available

  Scenario: Line chart shows trends over time
    Given a line chart with time-series data
    When rendered
    Then a line connects data points in sequence
    And multiple series can be overlaid

  Scenario: Area chart shows volume over time
    Given an area chart
    When rendered
    Then the region below the line is filled
    And stacked area charts are available for part-to-whole relationships

  Scenario: Pie and donut charts show part-to-whole proportions
    Given a pie or donut chart with segment data
    When rendered
    Then each segment is proportional to its share of the total
    And a center label is available on donut charts

  Scenario: Scatter chart shows correlation between two variables
    Given a scatter chart with x/y data pairs
    When rendered
    Then each pair is plotted as a point
    And point size and color can encode additional dimensions
```

### Interactive Charts

Charts respond to user interaction — hover, click, and zoom — so that data visualization is explorable, not just decorative.

```gherkin
Feature: Interactive Charts

  Scenario: Tooltip appears on hover
    Given a chart with hover interaction enabled
    When the user hovers over a data point or bar
    Then a tooltip displays the exact value and associated label
    And disappears when the cursor moves away

  Scenario: Data point is selectable
    Given a chart with click interaction enabled
    When the user clicks on a data point
    Then a selection event fires with the data for that point
    And the application can respond to the selection

  Scenario: Chart supports zoom and pan
    Given a chart with a large data range
    When the user scrolls or drags within the chart
    Then the visible range adjusts
    And the chart re-renders to the new view window

  Scenario: Keyboard interaction works within charts
    Given a chart with keyboard interaction enabled
    When the user tabs into the chart
    Then focus moves between data points or segments
    And the current point's data is announced to screen readers
```

### Theme and Pattern Support

Charts participate in the same theming system as other components. Pattern fills provide an alternative to color for differentiating data series.

```gherkin
Feature: Chart Theme and Pattern Support

  Scenario: Chart uses theme color palette
    Given a chart in a themed application
    When rendered
    Then series colors are drawn from the theme's palette
    And switching themes updates chart colors

  Scenario: Pattern fills differentiate series without color
    Given a chart displaying multiple data series
    When pattern fills are enabled
    Then each series uses a distinct repeating pattern — stripes, dots, hatching
    And the chart is interpretable without relying on color contrast alone

  Scenario: Dark mode applies correctly
    Given a chart in dark mode
    When rendered
    Then background, gridlines, labels, and series colors adapt
    And the chart remains readable against a dark surface
```

### Accessible Chart Data

Charts are readable by screen readers and provide non-visual access to the underlying data they represent.

```gherkin
Feature: Accessible Chart Data

  Scenario: Chart has an accessible label
    Given a chart component
    Then it has an aria-label or associated heading that describes the chart's subject

  Scenario: Data is available as a structured table
    Given a chart with data series
    When rendered
    Then a visually hidden data table is present in the DOM
    And screen readers can navigate the table to access the values

  Scenario: Key data points are announced on keyboard focus
    Given a keyboard-navigable chart
    When focus moves to a data point
    Then its label and value are announced by screen readers
    And the context (series name, category) is included
```

## Status

| Feature | Status |
|---------|--------|
| Sparklines — line/bar/area | ✅ Implemented |
| Sparkline pattern fills | 🔲 Planned |
| Animated bar chart | 🔲 Planned |
| Animated line / area chart | 🔲 Planned |
| Pie / donut chart | 🔲 Planned |
| Scatter chart | 🔲 Planned |
| Interactive tooltips | 🔲 Planned |
| Click selection on data points | 🔲 Planned |
| Zoom and pan | 🔲 Planned |
| Keyboard navigation within charts | 🔲 Planned |
| Theme color palette integration | 🔲 Planned |
| Pattern fills for series | 🔲 Planned |
| Dark mode support | 🔲 Planned |
| Accessible data table fallback | 🔲 Planned |
