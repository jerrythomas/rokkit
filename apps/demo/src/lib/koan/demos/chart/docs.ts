export const chartDocs = `## Data-driven charts

BarChart turns categorical-to-numeric data into an SVG bar chart with
field-mapped axes, palette colours, gridlines, and hover tooltips —
all data-first, no chart configuration scaffolding required.

## Basic example

Pass an array of rows, name the categorical \`x\` field and the
numeric \`y\` field. The component infers the axes, builds the bars,
and picks colours from the active theme palette.

\`\`\`svelte
<script>
  import { BarChart } from '@rokkit/chart'
  const data = [
    { quarter: 'Q1', revenue: 120 },
    { quarter: 'Q2', revenue: 180 },
    { quarter: 'Q3', revenue: 160 },
    { quarter: 'Q4', revenue: 210 }
  ]
</script>

<BarChart {data} x="quarter" y="revenue" />
\`\`\`

## Grouping and stacking

Add a \`fill\` field name to group bars by colour — e.g. revenue by
product within each quarter. Set \`stack={true}\` to stack the groups
instead of placing them side by side. \`legend\` reveals the colour-
group legend.

\`\`\`svelte
<BarChart {data} x="quarter" y="revenue" fill="product" stack legend />
\`\`\`

## Aggregation

When multiple rows share an x value, the component aggregates them.
\`stat\` controls how — default is \`sum\`; other options include
\`mean\`, \`count\`, \`min\`, \`max\`. Useful when you pass raw events and
want the chart to roll up per category.

## Value labels

\`label={true}\` draws the aggregated value on top of each bar. Reads
the theme's ink-soft for contrast against any palette background.

## Palette override

By default colours come from the active theme. Pass a \`palette\`
array of CSS colour strings to override per-instance — useful for
brand-aligned reports that need specific brand colours regardless of
the chrome theme.

## Data attributes

- \`[data-chart]\` — root SVG container
- \`[data-bar]\` — individual bar (carries \`data-fill\`, \`data-group\`)
- \`[data-axis]\` — axis group
- \`[data-legend]\` — colour-group legend

Style with attribute selectors instead of overriding component
classes — the same approach used across the rest of Rokkit.
`
