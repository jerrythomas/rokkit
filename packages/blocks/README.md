# @rokkit/blocks

Markdown block plugins for [`@rokkit/ui`'s `MarkdownRenderer`](https://rokkit.dev/docs/components/markdown-renderer) — renders fenced code blocks as interactive Svelte components.

## Install

```bash
bun add @rokkit/blocks
# or
npm install @rokkit/blocks
```

## Overview

Each plugin maps a fenced code block language to a Svelte component. Pass one or more plugins to `MarkdownRenderer` via the `plugins` prop and any matching code blocks will be rendered as live components instead of plain code.

| Plugin           | Language     | Renders                                      | Peer dep     |
| ---------------- | ------------ | -------------------------------------------- | ------------ |
| `PlotPlugin`     | ` ```plot `  | `@rokkit/chart` `Plot` or `FacetPlot`        | `@rokkit/chart` |
| `TablePlugin`    | ` ```table ` | `@rokkit/ui` `Table`                         | `@rokkit/ui` |
| `SparklinePlugin`| ` ```sparkline ` | `@rokkit/chart` `Sparkline`              | `@rokkit/chart` |
| `MermaidPlugin`  | ` ```mermaid ` | Mermaid diagram                            | `mermaid`    |

## Usage

```svelte
<script>
  import { MarkdownRenderer } from '@rokkit/ui'
  import { PlotPlugin, TablePlugin, MermaidPlugin } from '@rokkit/blocks'

  const content = `
# My Report

\`\`\`plot
{"type":"bar","data":[{"month":"Jan","sales":120},{"month":"Feb","sales":150}],"x":"month","y":"sales"}
\`\`\`

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\`
  `
</script>

<MarkdownRenderer {content} plugins={[PlotPlugin, TablePlugin, MermaidPlugin]} />
```

## Plugins

### `PlotPlugin`

Renders a `Plot` or `FacetPlot` from `@rokkit/chart`. The code block body must be valid JSON matching the chart spec.

```
\`\`\`plot
{
  "type": "bar",
  "data": [...],
  "x": "category",
  "y": "value",
  "fill": "category"
}
\`\`\`
```

### `TablePlugin`

Renders a `Table` from `@rokkit/ui`. The code block body must be valid JSON — either an array of objects or `{ data, fields }`.

```
\`\`\`table
[{"name":"Alice","age":30},{"name":"Bob","age":25}]
\`\`\`
```

### `SparklinePlugin`

Renders a `Sparkline` from `@rokkit/chart`. The code block body must be valid JSON matching the sparkline spec.

```
\`\`\`sparkline
{"values":[10,20,15,30,25],"type":"line","color":"steelblue"}
\`\`\`
```

### `MermaidPlugin`

Renders a Mermaid diagram. Requires `mermaid` as a peer dependency. The code block body is passed directly to Mermaid.

```
\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: Hello
  Bob-->>Alice: Hi
\`\`\`
```

## Peer Dependencies

- `@rokkit/ui` — required for `TablePlugin` and the `MarkdownPlugin` type
- `@rokkit/chart` — required for `PlotPlugin` and `SparklinePlugin`
- `mermaid >= 11.0.0` — optional, required only for `MermaidPlugin`
- `svelte ^5.0.0`

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
