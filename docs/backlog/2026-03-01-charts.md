# Backlog: Chart Package — Full Visualization Suite

Priority 5 (last) — `@rokkit/chart` expansion.

**Source:** `docs/requirements/020-chart.md`, `docs/design/020-chart.md`

---

## 59. Chart Package — Full Visualization Suite

**Problem:** The `@rokkit/chart` package has a basic Plot system (Root/Axis/Bar/Grid/Legend) and pattern/symbol assets, but lacks standalone chart components, animated time-series support, sparklines, proper visual brewer (data→pattern+color mapping), and SVG/PNG export.

### Phase 1 — Foundation & Static Charts
- [ ] Migrate pattern/symbol/texture components to Svelte 5 (overlaps infrastructure #58)
- [ ] Move `palette.json` from `old_lib/` to `src/`
- [ ] Create `VisualBrewer` class — maps data field values → patterns + colors + symbols with tailwind shade ramps (50–950), theme-aware (light/dark)
- [ ] Create `Sparkline` component — compact inline charts (line/bar/area) with headline stat, trend indicator, and summary text
- [ ] Create `ChartExporter` — static SVG + PNG download
- [ ] Base chart CSS

### Phase 2 — Chart Type Components
- [ ] `BarChart` standalone (horizontal/vertical, sorted)
- [ ] `LineChart` standalone (single/multi-series, smoothing)
- [ ] `AreaChart` standalone (stacked, gradient fills)
- [ ] `ScatterPlot` standalone (symbols, size encoding, `<use>` optimization)
- [ ] `PieChart` standalone (donut variant, pattern fills)
- [ ] Unit tests per chart type

### Phase 3 — Animated Time Series (Chart Race)
- [ ] `AnimatedChart` wrapper — uses `@rokkit/data` rollup to group by time field
- [ ] Custom tweened store interpolating arrays of objects (rank + value fields)
- [ ] `TimelineControls` — play/pause/step/scrub slider/speed selector/loop toggle
- [ ] Timer system (`requestAnimationFrame`-based)
- [ ] Rank computation per frame for bar chart races
- [ ] `prefers-reduced-motion` support

### Phase 4 — Animated Export & Polish
- [ ] Animated SVG export (SMIL `<animate>` elements)
- [ ] PNG raster export with resolution control
- [ ] Accessibility audit (ARIA roles, keyboard nav, screen reader `<desc>`/`<title>`)
- [ ] Playground pages for all chart types
- [ ] Learn site stories

### Phase 5 — Advanced
- [ ] Grouped/stacked bar charts
- [ ] Multi-series line/area
- [ ] Canvas fallback for large scatter plots (10k+ points)
- [ ] Custom easing functions
- [ ] Remove `ramda` (#23) and `bits-ui` (#25) from chart package

**Key design decisions:**
- All charts render inside `<svg>` (not HTML divs)
- Pattern + color dual-coding for accessibility (color blindness, grayscale printing)
- AnimatedChart is a wrapper around base chart — base charts have no animation awareness
- `@rokkit/data` rollup handles data alignment for animation keyframes
- Palette uses 21 tailwind-style colors with shades 50–950

**Depends on:** #23 (ramda removal), #25 (bits-ui removal), #58 (Svelte 4→5 migration — chart subset)

**Reference:** [svelte-bar-chart-race](https://github.com/russellgoldenberg/svelte-bar-chart-race) for animation patterns
