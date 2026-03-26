# Component Traceability Map

> Four artifacts per component: **llms** (LLM reference doc) · **learn** (doc page) · **play** (playground) · **impl** (source)
>
> ✓ = exists · ✗ = missing · ~ = covered via another page

## UI Components (`@rokkit/ui`)

| Component | llms | learn | play | impl | Notes |
|-----------|------|-------|------|------|-------|
| AlertList | ✓ | ~ | ✓ | ✓ | Learn covered in Message page |
| Avatar | ✓ | ✓ | — | ✓ | |
| Badge | ✓ | ✓ | — | ✓ | |
| BreadCrumbs | ✓ | ✓ | ✓ | ✓ | |
| Button | ✓ | ✓ | ✓ | ✓ | |
| ButtonGroup | — | — | ✓ | ✓ | Internal — no standalone docs needed |
| Card | ✓ | ✓ | ✓ | ✓ | |
| Carousel | ✓ | ✓ | ✓ | ✓ | |
| Code | ✓ | ✓ | ✓ | ✓ | |
| Connector | — | — | — | ✓ | Internal utility |
| Divider | ✓ | ✓ | — | ✓ | |
| Dropdown / Menu | ✓ | ✓ | ✓ | ✓ | Single page covers both |
| FloatingAction | ✓ | ✓ | ✓ | ✓ | |
| FloatingNavigation | ✓ | ✓ | ✓ | ✓ | |
| Grid | ✓ | ✓ | ✓ | ✓ | |
| Icon | ✓ | ~ | ✓ | ✓ | Learn under utilities/icons |
| ItemContent | — | — | — | ✓ | Internal — list item renderer |
| LazyTree | ✓ | ✓ | ✓ | ✓ | |
| List | ✓ | ✓ | ✓ | ✓ | |
| MarkdownRenderer | ✓ | ✓ | — | ✓ | No interactive playground needed |
| Message | ✓ | ✓ | ✓ | ✓ | |
| MultiSelect | ✓ | ✓ | ✓ | ✓ | |
| PaletteManager | ✓ | ✓ | ✓ | ✓ | |
| Pill | ✓ | ✓ | ✓ | ✓ | |
| ProgressBar | ✓ | ✓ | ✓ | ✓ | Learn/play as "Progress" |
| Range | ✓ | ✓ | ✓ | ✓ | |
| Rating | ✓ | ✓ | ✓ | ✓ | |
| Reveal | ✓ | ✓ | — | ✓ | Learn under effects/ |
| SearchFilter | ✓ | ✓ | ✓ | ✓ | |
| Select | ✓ | ✓ | ✓ | ✓ | |
| Shine | ✓ | ✓ | — | ✓ | Learn under effects/ |
| Stack | ✓ | ✓ | — | ✓ | |
| StatusList | ✓ | ✓ | ✓ | ✓ | From `@rokkit/forms` |
| Stepper | ✓ | ✓ | ✓ | ✓ | |
| Swatch | ✓ | ✓ | — | ✓ | No playground needed (used inside PaletteManager) |
| Switch | ✓ | ✓ | ~ | ✓ | Play under inputs/ |
| Table | ✓ | ✓ | ✓ | ✓ | |
| Tabs | ✓ | ✓ | ✓ | ✓ | |
| Tilt | ✓ | ✓ | — | ✓ | Learn under effects/ |
| Timeline | ✓ | ✓ | ✓ | ✓ | |
| Toggle | ✓ | ✓ | ✓ | ✓ | |
| Toolbar | ✓ | ✓ | ✓ | ✓ | |
| ToolbarGroup | — | — | — | ✓ | Internal — used inside Toolbar |
| Tree | ✓ | ✓ | ✓ | ✓ | |
| UploadFileStatus | — | — | — | ✓ | Internal — used inside UploadProgress |
| UploadProgress | ✓ | ✓ | ✓ | ✓ | |
| UploadTarget | ✓ | ✓ | ✓ | ✓ | |

## Chart Components (`@rokkit/chart`)

| Component | llms | learn | play | impl | Notes |
|-----------|------|-------|------|------|-------|
| AnimatedPlot | ✓ | ✓ | ✓ | ✓ | |
| AreaChart | ✓ | ✓ | ✓ | ✓ | |
| BarChart | ✓ | ✓ | ✓ | ✓ | |
| BoxPlot | ✓ | ✓ | ✓ | ✓ | |
| BubbleChart | ✓ | ✓ | ✓ | ✓ | |
| CrossFilter | ✓ | ✓ | ✓ | ✓ | |
| FacetPlot | ✓ | ✓ | ✓ | ✓ | |
| LineChart | ✓ | ✓ | ✓ | ✓ | |
| PieChart | ✓ | ✓ | ✓ | ✓ | |
| PlotChart + Geoms | ✓ | ~ | ~ | ✓ | Learn/play via chart-marks page |
| ScatterPlot | ✓ | ✓ | ✓ | ✓ | |
| Sparkline | ✓ | ✓ | ✓ | ✓ | |
| ViolinPlot | ✓ | ✓ | ✓ | ✓ | |

## Forms Components (`@rokkit/forms`)

| Component | llms | learn | play | impl | Notes |
|-----------|------|-------|------|------|-------|
| Form / FormRenderer | ✓ | ✓ | ✓ | ✓ | |
| CheckBox | ✓ | ~ | ~ | ✓ | Rendered by FormRenderer only |
| RadioGroup | ✓ | ~ | ~ | ✓ | Rendered by FormRenderer only |
| StatusList | ✓ | ✓ | ✓ | ✓ | Also usable standalone |

## Gaps Summary

### Missing learn pages (user-facing components)

None — all user-facing components with llms docs now have learn pages.

### "Coming soon" stubs (learn pages exist but are placeholders)

Calendar · Item · data-table

These components either don't exist yet or are in backlog.

### Notes on intentional omissions

- **Internal components** (ButtonGroup, Connector, ItemContent, ToolbarGroup, UploadFileStatus) — used inside parent components, not directly by consumers
- **Effects without playground** (Reveal, Shine, Tilt) — visual effects are best shown inline in the learn page; no interactive playground needed
- **MarkdownRenderer without playground** — doc-rendering component; demonstrated in the blocks learn page
