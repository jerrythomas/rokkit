export const guideContent = `# Toolkit

The Rokkit toolkit is the set of supporting packages that power
data manipulation, reactive state, and shared utilities across
every component. They're also published as standalone packages —
useful even if you're not consuming \`@rokkit/ui\` directly.

## \`@rokkit/states\`

Reactive state machines + proxies:

- **Controllers** — \`ListController\`, \`NestedController\`,
  \`Wrapper\` (multi-select) — the same state machines every
  selection component uses.
- **Proxies** — \`ProxyItem\`, \`ProxyTree\`, \`LazyProxyItem\` —
  thin reactive wrappers that adapt your raw data via the
  \`fields\` mapping.
- **Stores** — \`alerts\` (for AlertList), \`messages\`
  (localised labels), \`vibe\` (the active style / skin / mode).

See the [Utilities](/app/guide-utilities) guide for how to use
controllers + proxies to build your own components.

## \`@rokkit/data\`

Data manipulation utilities used by FormRenderer, Table, and the
chart aggregations:

- **Field inference** — \`infer(rows)\` walks a sample of rows
  and produces typed field summaries (string / number / boolean
  / date / nested / array).
- **Schema derivation** — \`schemaFromRecord(rec)\` turns a
  single object into a JSON-Schema-shaped spec — what
  FormRenderer falls back to when no schema is provided.
- **Filtering** — \`parseFilters(text)\` turns search-style
  query strings ("status:active age>30") into
  \`FilterObject[]\` for client-side filtering (powers
  SearchFilter).
- **Aggregations** — \`rollup\` / \`groupBy\` / \`stat\` helpers
  for the chart pipeline.
- **Joins** — \`leftJoin\` / \`innerJoin\` for combining
  datasets without pulling in a full table library.

## \`@rokkit/actions\`

Svelte actions used as building blocks:

- \`navigator\` — keyboard + ARIA handler attached to any
  container (see Utilities guide).
- \`navigable\` — the legacy single-controller binder; kept
  for backward compat.
- \`tooltip\` — lazy-mount Tooltip wrapper (also exposed as
  the \`<Tooltip>\` component).
- \`ripple\` — material-style click ripple.
- \`reveal\` — IntersectionObserver-based scroll-reveal (the
  Reveal component is a thin wrapper).
- \`magnetic\` / \`tilt\` / \`shine\` — pointer-tracking effects.
- \`pannable\` / \`swipeable\` — touch gestures.
- \`dismissable\` — Escape / click-outside handling.
- \`themable\` / \`skinnable\` — apply theme attributes to
  arbitrary roots.

## \`@rokkit/core\`

Pure utilities — no Svelte runes, no dependencies:

- **Field mapping** — \`getMappedField\`, \`resolveSnippet\`.
- **String + nested** — dot-path getters, label inference,
  primitives-to-object normalisation.
- **Color space** — OKLCH / HSL / RGB conversions used by the
  palette manager + theme tools.
- **Named tokens** — the trimmed CSS-vars vocabulary that
  themes resolve to (\`--paper\`, \`--ink\`, etc.).
- **Calendar / ticks** — date math + axis-tick helpers.
- **State icons** — \`DEFAULT_STATE_ICONS\` map.

## \`@rokkit/blocks\`

MarkdownRenderer plugins that turn fenced code blocks into live
components — see the [AI Chatbots](/app/guide-ai-chatbots) guide
for the integration story.

| Plugin | Language | Renders |
| --- | --- | --- |
| \`PlotPlugin\` | \`plot\` | \`PlotChart\` / \`FacetPlot\` |
| \`TablePlugin\` | \`table\` | \`Table\` |
| \`FormPlugin\` | \`form\` | \`FormRenderer\` |
| \`ListPlugin\` | \`list\` | \`List\` |
| \`StepperPlugin\` | \`stepper\` | \`Stepper\` |
| \`SparklinePlugin\` | \`sparkline\` | inline \`Sparkline\` |
| \`MermaidPlugin\` | \`mermaid\` | a Mermaid diagram (lazy) |

## \`@rokkit/themes\`

Shipped styles: \`rokkit\`, \`minimal\`, \`material\`, \`zen-sumi\`.
Each is a self-contained CSS file consuming the same named-token
vocabulary so they're swappable at runtime via \`data-style\`.
`
