# AI Chatbots & the Blocks Plugin

`@rokkit/blocks` is a set of `MarkdownRenderer` plugins that
turn **fenced code blocks** in markdown into **live components**:
charts, tables, forms, lists, steppers, sparklines, mermaid
diagrams. That's the entire surface — but it's the bridge that
makes Rokkit click with LLM-powered chat UIs.

## The idea

LLMs are good at producing markdown. They're also good at
producing JSON. `@rokkit/blocks` says: let the model emit a
**fenced code block with a JSON spec**, and the markdown
renderer will draw the live component for you.

```markdown
Here's quarterly revenue:

\`\`\`plot
{
  "data": [
    { "quarter": "Q1", "revenue": 120 },
    { "quarter": "Q2", "revenue": 180 }
  ],
  "x": "quarter",
  "y": "revenue",
  "geoms": [{ "type": "bar" }]
}
\`\`\`

Want me to add forecasts on top?
```

That renders as: prose → a real `<PlotChart>` → prose. No
custom React-flavoured `<Tool>` wrappers, no schema dance — just
markdown the model already knows how to emit.

## Available plugins

| Plugin            | Language    | Renders                                        |
| ----------------- | ----------- | ---------------------------------------------- |
| `PlotPlugin`      | `plot`      | `PlotChart` / `FacetPlot` from `@rokkit/chart` |
| `TablePlugin`     | `table`     | `Table` from `@rokkit/ui`                      |
| `FormPlugin`      | `form`      | `FormRenderer` from `@rokkit/forms`            |
| `ListPlugin`      | `list`      | `List` from `@rokkit/ui`                       |
| `StepperPlugin`   | `stepper`   | `Stepper` from `@rokkit/ui`                    |
| `SparklinePlugin` | `sparkline` | inline `Sparkline`                             |
| `MermaidPlugin`   | `mermaid`   | lazy-loaded Mermaid diagram                    |

Each plugin defines: `language` (the fence label), `component`
(the Svelte component to mount), and an optional sanitization
step.

## Mount the plugins

```svelte
<script>
  import { MarkdownRenderer } from '@rokkit/ui'
  import {
    PlotPlugin,
    TablePlugin,
    FormPlugin,
    ListPlugin,
    SparklinePlugin,
    MermaidPlugin
  } from '@rokkit/blocks'
</script>

<MarkdownRenderer
  markdown={llmResponse}
  plugins={[PlotPlugin, TablePlugin, FormPlugin, ListPlugin, SparklinePlugin, MermaidPlugin]}
/>
```

That's the full integration. Whatever the LLM emits as markdown,
the renderer either treats as prose, or — if the fence label
matches a plugin — mounts a live component.

## Prompting the model

The trick is teaching the model **the JSON shape per language**.
Use a system prompt that includes a tool-style catalog:

```
You can render rich responses using fenced code blocks. When the
user wants a visualization, table, form, or list, emit a block
whose language is the renderer name (plot / table / form / list)
and whose body is a JSON spec.

PLOT spec:
  { data: Array<Row>, x: string, y: string,
    fill?: string, color?: string, size?: string,
    geoms: Array<{ type: 'bar'|'line'|'area'|'point'|'arc'|'box'|'violin', ... }>,
    height?: number, legend?: boolean }

TABLE spec:
  { data: Array<Row>, columns?: Array<{ field: string, label?: string }> }

FORM spec:
  { schema: JSONSchema, data: object }

LIST spec:
  { items: Array<{ label: string, value: any, icon?: string, children?: ... }> }
```

The `docs/llms/` directory ships ready-made versions of these
specs — see [llms.txt](/llms/index.txt) and the per-component files
under `/llms/components/`.

## Crossfilter — linked dashboards from one prompt

When the model emits multiple plot blocks whose specs share a
`crossfilter: 'name'` field, MarkdownRenderer wraps them in a
shared `CrossFilter` instance. Brushing one chart filters the
others — no client-side wiring per prompt.

```svelte
<MarkdownRenderer
  markdown={llmResponse}
  plugins={[PlotPlugin]}
  crossfilterWrapper={CrossFilter}
/>
```

## Provider-agnostic

The plugin system has no opinion on **how** the markdown was
produced. The same plumbing works with:

- **Scripted responses** — see the demo's `/chat` route + its
  mock router for keyword-matched responses (no tokens spent).
- **Server-side LLM** — emit markdown from your backend
  (OpenAI / Anthropic / OpenRouter) and pipe it to
  MarkdownRenderer client-side.
- **In-browser LLM** — `@webllm/web-llm` or
  `@xenova/transformers` running entirely client-side. No
  network round-trip; same renderer.

The demo at `/chat` includes a runtime switch between
Scripted / OpenRouter / Web-LLM so you can A/B compare them
against the same blocks.

## Security

`MarkdownRenderer` sanitises non-block markdown with DOMPurify
— raw `<script>` tags and dangerous HTML are stripped before
rendering. Each plugin owns its own JSON parse + validation,
so a malformed spec renders a graceful error block, not a
runtime crash.

## When NOT to use it

If your responses are tightly constrained (e.g. always exactly
one table, always exactly five rows), you may want explicit
function-calling against typed tools and skip the markdown layer.
Blocks shines when the model has freedom to **mix prose,
visualisations, and structured data** — exactly the chatbot UX
where every response shape is unique.
