## Sanitized Markdown → HTML with pluggable code blocks

MarkdownRenderer parses Markdown via `marked`, sanitizes the
output with DOMPurify, and renders standard nodes inline.
Fenced code blocks whose language matches a registered `plugin`
are rendered by that plugin's Svelte component instead — which is
how `@rokkit/blocks` embeds live charts, tables, and diagrams
inside docs.

## Basic example

```svelte
<script>
  import { MarkdownRenderer } from '@rokkit/ui'

  const content = `# Title

Body paragraph with **bold**, _italic_, and \`inline\`.

- Bullet one
- Bullet two

\`\`\`javascript
console.log('hello')
\`\`\``
</script>

<MarkdownRenderer markdown={content} />
```

Unmatched code blocks fall back to plain highlighted HTML. There's
no escape-hatch for raw HTML inside the source — DOMPurify strips
`<script>` tags and other unsafe content.

## Plugins

Plugins are Svelte components that accept the fenced block's raw
text as the `code` prop, plus a `language` discriminant.

```svelte
import { PlotPlugin, TablePlugin, MermaidPlugin } from '@rokkit/blocks'

<MarkdownRenderer
  markdown={content}
  plugins={[PlotPlugin, TablePlugin, MermaidPlugin]}
/>
```

Available plugins from `@rokkit/blocks`:

| Plugin            | Language    | Renders                                        |
| ----------------- | ----------- | ---------------------------------------------- |
| `PlotPlugin`      | `plot`      | `PlotChart` / `FacetPlot` from `@rokkit/chart` |
| `TablePlugin`     | `table`     | `Table` from `@rokkit/ui`                      |
| `MermaidPlugin`   | `mermaid`   | a Mermaid diagram (lazy-loaded)                |
| `FormPlugin`      | `form`      | `FormRenderer` from `@rokkit/forms`            |
| `SparklinePlugin` | `sparkline` | inline `Sparkline`                             |

## Crossfilter wrapper

When you pass `crossfilterWrapper`, plot blocks that share a
`crossfilter` field in their JSON spec are grouped into a single
shared crossfilter instance — so brushing one chart updates the
others. Used to compose linked dashboards from a Markdown source.
