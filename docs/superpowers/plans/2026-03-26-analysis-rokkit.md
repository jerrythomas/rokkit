# Analysis & Visualization — Rokkit Rendering Layer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Repo:** This plan is executed in `~/Developer/rokkit/`, NOT the Strategos repo.

**Goal:** Add `<MarkdownRenderer>` to `@rokkit/ui`, `<Sparkline>` to `@rokkit/chart`, and create a new `@rokkit/blocks` package with `PlotPlugin`, `TablePlugin`, `SparklinePlugin`, and `MermaidPlugin` — enabling rich markdown with embedded interactive charts and tables.

**Architecture:** `<MarkdownRenderer>` uses `marked.lexer()` for tokenization (not HTML generation). A Svelte `{#each tokens}` loop renders plain tokens via safe HTML rendering and routes code blocks to plugin components by language name. Plugins ship in a separate `@rokkit/blocks` package to keep `@rokkit/ui` lean — heavy deps (chart, mermaid) only enter the bundle when blocks are actually used. `<Sparkline>` is a thin `<Plot>` wrapper with forced small-size/no-decoration defaults.

**Security:** All HTML rendered from markdown is sanitized with `isomorphic-dompurify` before being set. Mermaid SVG output is also sanitized before `innerHTML` assignment. Never render unsanitized HTML from user-supplied or AI-generated content.

**Tech Stack:** Svelte 5, TypeScript, `marked` (already a dep in Strategos UI — add to `@rokkit/ui`), `isomorphic-dompurify` for HTML sanitization, Vitest + Svelte Testing Library for components, `@rokkit/chart` for `<Plot>`/`<Sparkline>`. Run tests from `~/Developer/rokkit/` with the repo's test command.

**Spec:** `~/Developer/strategos/docs/superpowers/specs/2026-03-26-analysis-visualization-design.md`

**Out of scope for this plan** (covered in `2026-03-26-analysis-strategos.md`):
- `parseRichMarkdown()` and `RichSection` type in `@strategos/core`
- `data_extract`, `data_analyze`, `report_compose` tools in `@strategos/tools`
- `AnalysisOrchestrator` in `@strategos/agents`
- HITL `richmarkdown` format extension

---

## Before Starting: Understand the Repo Layout

```bash
ls ~/Developer/rokkit/packages/
# Expected: ui, chart, forms, themes, icons, actions, stories, cli, etc.
cat ~/Developer/rokkit/packages/ui/package.json   # check test command, deps
cat ~/Developer/rokkit/packages/chart/package.json
```

**Verify the test command before running any tests:**
```bash
cat ~/Developer/rokkit/package.json | grep -A5 '"scripts"'
# Note the actual test command — it may be `bun run test`, `bun run test:run`, `vitest`, etc.
# Use whatever this outputs throughout the plan. Do NOT assume `bun run test`.
```

**Verify FacetPlot and AnimatedPlot are supported in PlotSpec:**
```bash
grep -r "facet\|animate" packages/chart/src/PlotSpec* packages/chart/src/Plot.svelte 2>/dev/null | head -20
```
`facet` and `animate` fields in PlotSpec are used by the AI tools. If they are not yet implemented in `@rokkit/chart`, note this as a known limitation — the `data_analyze` tool may generate them but they will be silently ignored until chart support lands.

All commands below assume `~/Developer/rokkit/` as working directory unless stated.

---

## Chunk 1: `<Sparkline>` in `@rokkit/chart`

### File Map

- **Read first:** `packages/chart/src/Plot.svelte` — understand `PlotSpec` props interface
- **Create:** `packages/chart/src/Sparkline.svelte` — thin `<Plot>` wrapper with forced constraints
- **Modify:** `packages/chart/src/index.ts` (or main export file) — export `Sparkline`
- **Create:** `packages/chart/spec/Sparkline.spec.ts` — component tests

### Task 1: `<Sparkline>` component — TDD

- [ ] **Step 1: Read `Plot.svelte` to understand its props**

```bash
cat packages/chart/src/Plot.svelte | head -60
```

Note the props interface — `Sparkline` will spread a `PlotSpec`-compatible object onto `Plot` with forced overrides.

- [ ] **Step 2: Write the failing test**

Create `packages/chart/spec/Sparkline.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Sparkline from '../src/Sparkline.svelte'

const spec = {
  data: [{ m: 'Jan', v: 10 }, { m: 'Feb', v: 20 }, { m: 'Mar', v: 15 }],
  x: 'm',
  y: 'v',
  geoms: [{ type: 'line' }]
}

describe('Sparkline', () => {
  it('renders without error', () => {
    const { container } = render(Sparkline, { props: { spec } })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders at small size by default', () => {
    const { container } = render(Sparkline, { props: { spec } })
    const svg = container.querySelector('svg')!
    const width = Number(svg.getAttribute('width') ?? svg.style.width)
    expect(width).toBeLessThanOrEqual(200)
  })

  it('accepts a width prop to override default size', () => {
    const { container } = render(Sparkline, { props: { spec, width: 300 } })
    const svg = container.querySelector('svg')!
    const width = Number(svg.getAttribute('width') ?? svg.style.width)
    expect(width).toBe(300)
  })

  it('suppresses legend — no legend element rendered', () => {
    const specWithColor = { ...spec, color: 'm', legend: true }
    const { container } = render(Sparkline, { props: { spec: specWithColor } })
    // Sparkline forces legend:false regardless of spec value
    expect(container.querySelector('[data-chart-legend]')).toBeNull()
  })

  it('suppresses grid — no grid lines rendered', () => {
    const specWithGrid = { ...spec, grid: true }
    const { container } = render(Sparkline, { props: { spec: specWithGrid } })
    expect(container.querySelector('[data-chart-grid]')).toBeNull()
  })

  it('uses only the first geom when spec has multiple', () => {
    const multiGeomSpec = { ...spec, geoms: [{ type: 'line' }, { type: 'point' }] }
    const { container } = render(Sparkline, { props: { spec: multiGeomSpec } })
    // Should render without error — single geom constraint enforced
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
bun run test packages/chart/spec/Sparkline.spec.ts
```

Expected: fail with `Cannot find module` or import error

- [ ] **Step 4: Implement `Sparkline.svelte`**

Create `packages/chart/src/Sparkline.svelte`:

```svelte
<script lang="ts">
  /**
   * Sparkline — thin Plot wrapper for small inline trend indicators.
   *
   * Accepts a full PlotSpec but forces small-size/no-decoration defaults.
   * Override width/height via props if needed (e.g., in a plugin block).
   */
  import Plot from './Plot.svelte'
  import type { PlotSpec } from './PlotSpec.js'

  interface Props {
    spec: PlotSpec
    width?: number
    height?: number
  }

  let { spec, width = 120, height = 36 }: Props = $props()

  // Force sparkline constraints over any values in the spec
  const sparklineSpec = $derived({
    ...spec,
    width,
    height,
    grid: false,
    legend: false,
    tooltip: false,
    // Only use first geom
    geoms: spec.geoms?.slice(0, 1) ?? [],
  })
</script>

<Plot spec={sparklineSpec} />
```

> **Note:** Adjust the import path for `PlotSpec` based on what `@rokkit/chart` actually exports. Run `grep -r "PlotSpec" packages/chart/src/` to find the type location.

- [ ] **Step 5: Export `Sparkline` from chart package**

Find the chart package's main export file (e.g., `packages/chart/src/index.ts`), then add:

```typescript
export { default as Sparkline } from './Sparkline.svelte'
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
bun run test packages/chart/spec/Sparkline.spec.ts
```

Expected: all 3 tests pass

- [ ] **Step 7: Commit**

```bash
cd ~/Developer/rokkit
git add packages/chart/src/Sparkline.svelte packages/chart/src/index.ts packages/chart/spec/Sparkline.spec.ts
git commit -m "feat(chart): add Sparkline component — thin Plot wrapper with small-size defaults"
```

---

## Chunk 2: `<MarkdownRenderer>` in `@rokkit/ui`

### File Map

- **Create:** `packages/ui/src/MarkdownRenderer.svelte` — tokenizer loop + plugin dispatch
- **Create:** `packages/ui/src/markdown-plugin.ts` — `MarkdownPlugin` interface type
- **Modify:** `packages/ui/package.json` — add `marked` + `isomorphic-dompurify` as deps
- **Modify:** `packages/ui/src/index.ts` — export `MarkdownRenderer` and `MarkdownPlugin`
- **Create:** `packages/ui/spec/MarkdownRenderer.spec.ts`

### Task 2: `MarkdownPlugin` type and `<MarkdownRenderer>` — TDD

- [ ] **Step 1: Check existing deps and add missing ones**

```bash
cat packages/ui/package.json | grep -E "marked|dompurify"
```

Add any missing dependencies:
```bash
cd packages/ui
bun add marked isomorphic-dompurify
bun add -d @types/dompurify
```

- [ ] **Step 2: Write the failing tests**

Create `packages/ui/spec/MarkdownRenderer.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MarkdownRenderer from '../src/MarkdownRenderer.svelte'

// Minimal stub — a real Svelte component that renders a marker div
// Adjust to actual Svelte 5 testing patterns used in this repo
import StubPlugin from './fixtures/StubPlugin.svelte'

describe('MarkdownRenderer', () => {
  it('renders plain markdown as HTML', () => {
    const { container } = render(MarkdownRenderer, {
      props: { markdown: '**bold** and _italic_' }
    })
    expect(container.querySelector('strong')).toBeTruthy()
    expect(container.querySelector('em')).toBeTruthy()
  })

  it('renders a heading', () => {
    const { container } = render(MarkdownRenderer, {
      props: { markdown: '## Hello' }
    })
    expect(container.querySelector('h2')?.textContent).toContain('Hello')
  })

  it('renders an unknown code block as pre > code', () => {
    const { container } = render(MarkdownRenderer, {
      props: { markdown: '```python\nprint("hi")\n```' }
    })
    expect(container.querySelector('pre code')).toBeTruthy()
  })

  it('routes a recognised code block to a plugin component', () => {
    const { container } = render(MarkdownRenderer, {
      props: {
        markdown: '```plot\n{"data":[]}\n```',
        plugins: [{ language: 'plot', component: StubPlugin }]
      }
    })
    expect(container.querySelector('[data-stub-plugin]')).toBeTruthy()
  })

  it('falls back to code block when no plugin matches the language', () => {
    const { container } = render(MarkdownRenderer, {
      props: {
        markdown: '```table\n{"columns":[],"rows":[]}\n```',
        plugins: []
      }
    })
    expect(container.querySelector('pre')).toBeTruthy()
  })

  it('renders mixed content: text + plugin block + text', () => {
    const { container } = render(MarkdownRenderer, {
      props: {
        markdown: 'Before.\n\n```plot\n{"data":[]}\n```\n\nAfter.',
        plugins: [{ language: 'plot', component: StubPlugin }]
      }
    })
    expect(container.textContent).toContain('Before.')
    expect(container.textContent).toContain('After.')
    expect(container.querySelector('[data-stub-plugin]')).toBeTruthy()
  })

  it('renders with no plugins prop without error', () => {
    expect(() =>
      render(MarkdownRenderer, { props: { markdown: '# Hello' } })
    ).not.toThrow()
  })
})
```

Create the stub fixture `packages/ui/spec/fixtures/StubPlugin.svelte`:

```svelte
<script lang="ts">
  let { code }: { code: string } = $props()
</script>
<div data-stub-plugin>{code}</div>
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
bun run test packages/ui/spec/MarkdownRenderer.spec.ts
```

Expected: fail with `Cannot find module`

- [ ] **Step 4: Create the `MarkdownPlugin` type**

Create `packages/ui/src/markdown-plugin.ts`:

```typescript
import type { Component } from 'svelte'

/**
 * A plugin that renders a fenced code block as a Svelte component.
 *
 * The component receives { code: string } as props.
 * If the component throws or the code is invalid, the renderer
 * falls back to displaying the raw code block.
 */
export interface MarkdownPlugin {
  /** Fenced code block language to match (e.g. 'plot', 'table', 'sparkline') */
  language: string
  /** Svelte component to render the block. Receives { code: string } */
  component: Component<{ code: string }>
}
```

- [ ] **Step 5: Implement `MarkdownRenderer.svelte`**

Create `packages/ui/src/MarkdownRenderer.svelte`:

```svelte
<script lang="ts">
  /**
   * MarkdownRenderer — renders markdown with plugin-extensible code blocks.
   *
   * Uses marked.lexer() for tokenization (not HTML generation).
   * Plain markdown tokens sanitized with DOMPurify then rendered via {@html}.
   * Recognised code blocks rendered as Svelte components via plugin registry.
   *
   * Security: all HTML rendered via {@html} is sanitized with DOMPurify.
   *
   * Unstyled by default — themes provide typography and spacing.
   */
  import { marked } from 'marked'
  import type { Token } from 'marked'
  import DOMPurify from 'isomorphic-dompurify'
  import type { MarkdownPlugin } from './markdown-plugin.js'

  interface Props {
    markdown: string
    plugins?: MarkdownPlugin[]
  }

  let { markdown, plugins = [] }: Props = $props()

  // Build plugin lookup map from plugins array
  const pluginMap = $derived(
    Object.fromEntries(plugins.map((p) => [p.language.toLowerCase(), p.component]))
  )

  // Tokenize markdown — runs when markdown prop changes
  const tokens = $derived(marked.lexer(markdown))

  // Sanitize and render a single non-plugin token to safe HTML
  function tokenToSafeHtml(token: Token): string {
    const raw = marked.parser([token] as Token[])
    return DOMPurify.sanitize(raw)
  }
</script>

<div class="markdown-renderer" data-markdown>
  {#each tokens as token (token)}
    {#if token.type === 'code'}
      {@const lang = (token.lang ?? '').toLowerCase()}
      {@const Plugin = pluginMap[lang]}
      {#if Plugin}
        <Plugin code={token.text} />
      {:else}
        {@html tokenToSafeHtml(token)}
      {/if}
    {:else}
      {@html tokenToSafeHtml(token)}
    {/if}
  {/each}
</div>
```

- [ ] **Step 6: Export from `@rokkit/ui`**

Find `packages/ui/src/index.ts`, add:

```typescript
export { default as MarkdownRenderer } from './MarkdownRenderer.svelte'
export type { MarkdownPlugin } from './markdown-plugin.js'
```

- [ ] **Step 7: Run tests to confirm they pass**

```bash
bun run test packages/ui/spec/MarkdownRenderer.spec.ts
```

Expected: all 7 tests pass

- [ ] **Step 8: Commit**

```bash
cd ~/Developer/rokkit
git add packages/ui/src/MarkdownRenderer.svelte \
        packages/ui/src/markdown-plugin.ts \
        packages/ui/src/index.ts \
        packages/ui/package.json \
        packages/ui/spec/MarkdownRenderer.spec.ts \
        packages/ui/spec/fixtures/StubPlugin.svelte
git commit -m "feat(ui): add MarkdownRenderer with plugin system and DOMPurify sanitization"
```

---

## Chunk 3: `@rokkit/blocks` package

### File Map

- **Create:** `packages/blocks/` — new package (scaffold from existing package as template)
- **Create:** `packages/blocks/package.json`
- **Create:** `packages/blocks/src/index.ts`
- **Create:** `packages/blocks/src/PlotPlugin.svelte`
- **Create:** `packages/blocks/src/TablePlugin.svelte`
- **Create:** `packages/blocks/src/SparklinePlugin.svelte`
- **Create:** `packages/blocks/src/MermaidPlugin.svelte`
- **Create:** `packages/blocks/spec/PlotPlugin.spec.ts`
- **Create:** `packages/blocks/spec/TablePlugin.spec.ts`
- **Create:** `packages/blocks/spec/SparklinePlugin.spec.ts`

### Task 3a: Scaffold `@rokkit/blocks`

- [ ] **Step 1: Copy a minimal package as template**

```bash
cd ~/Developer/rokkit
cat packages/forms/package.json  # check package structure pattern
```

- [ ] **Step 2: Create `packages/blocks/package.json`**

```json
{
  "name": "@rokkit/blocks",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "svelte": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "test": "vitest run"
  },
  "peerDependencies": {
    "@rokkit/chart": "workspace:*",
    "@rokkit/ui": "workspace:*",
    "svelte": "^5.0.0"
  },
  "peerDependenciesMeta": {
    "mermaid": { "optional": true }
  },
  "devDependencies": {
    "@rokkit/chart": "workspace:*",
    "@rokkit/ui": "workspace:*",
    "vitest": "workspace:*",
    "@testing-library/svelte": "workspace:*"
  }
}
```

> Adjust version numbers to match the rest of the monorepo. Check `packages/ui/package.json` for reference.

### Task 3b: `PlotPlugin` — TDD

- [ ] **Step 3: Write the failing test**

Create `packages/blocks/spec/PlotPlugin.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import PlotPlugin from '../src/PlotPlugin.svelte'

const validSpec = JSON.stringify({
  data: [{ year: 2023, revenue: 4.2 }, { year: 2024, revenue: 4.7 }],
  x: 'year', y: 'revenue',
  geoms: [{ type: 'bar' }]
})

describe('PlotPlugin', () => {
  it('renders an SVG chart for valid PlotSpec JSON', () => {
    const { container } = render(PlotPlugin, { props: { code: validSpec } })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders an error badge for invalid JSON', () => {
    const { container } = render(PlotPlugin, { props: { code: '{bad json' } })
    expect(container.querySelector('[data-block-error]')).toBeTruthy()
  })

  it('shows raw code in error details', () => {
    const { container } = render(PlotPlugin, { props: { code: 'invalid' } })
    const details = container.querySelector('details')
    expect(details?.textContent).toContain('invalid')
  })
})
```

- [ ] **Step 4: Run test to confirm it fails**

```bash
bun run test packages/blocks/spec/PlotPlugin.spec.ts
```

- [ ] **Step 5: Implement `PlotPlugin.svelte`**

Create `packages/blocks/src/PlotPlugin.svelte`:

```svelte
<script lang="ts">
  import { Plot } from '@rokkit/chart'
  import type { PlotSpec } from '@rokkit/chart'

  let { code }: { code: string } = $props()

  const result = $derived.by(() => {
    try {
      return { spec: JSON.parse(code) as PlotSpec, error: null }
    } catch (e) {
      return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  })
</script>

{#if result.error}
  <div data-block-error class="block-error">
    <span>Plot error: {result.error}</span>
    <details><summary>Raw spec</summary><pre>{code}</pre></details>
  </div>
{:else}
  <Plot spec={result.spec} />
{/if}
```

- [ ] **Step 6: Run test to confirm it passes**

```bash
bun run test packages/blocks/spec/PlotPlugin.spec.ts
```

### Task 3c: `TablePlugin` — TDD

- [ ] **Step 7: Write the failing test**

Create `packages/blocks/spec/TablePlugin.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TablePlugin from '../src/TablePlugin.svelte'

const validTable = JSON.stringify({
  columns: ['Year', 'Revenue'],
  rows: [{ Year: 2023, Revenue: 4.2 }, { Year: 2024, Revenue: 4.7 }]
})

describe('TablePlugin', () => {
  it('renders a table element', () => {
    const { container } = render(TablePlugin, { props: { code: validTable } })
    expect(container.querySelector('table')).toBeTruthy()
  })

  it('renders column headers', () => {
    const { container } = render(TablePlugin, { props: { code: validTable } })
    const headers = container.querySelectorAll('th')
    expect(headers.length).toBe(2)
    expect(headers[0]?.textContent).toContain('Year')
    expect(headers[1]?.textContent).toContain('Revenue')
  })

  it('renders data rows', () => {
    const { container } = render(TablePlugin, { props: { code: validTable } })
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(2)
  })

  it('renders error badge for invalid JSON', () => {
    const { container } = render(TablePlugin, { props: { code: 'not json' } })
    expect(container.querySelector('[data-block-error]')).toBeTruthy()
  })
})
```

- [ ] **Step 8: Check for existing `<Table>` component in `@rokkit/ui`**

```bash
grep -r "export.*Table\|Table.svelte" packages/ui/src/ | grep -v node_modules
```

If a `<Table>` component exists: use it in `TablePlugin.svelte` (it will have sorting/filtering already). If not: implement with a plain `<table>`.

- [ ] **Step 9: Implement `TablePlugin.svelte`**

Create `packages/blocks/src/TablePlugin.svelte` — choose the appropriate implementation based on Step 8:

**If `@rokkit/ui` exports a `<Table>` component:**
```svelte
<script lang="ts">
  import { Table } from '@rokkit/ui'

  let { code }: { code: string } = $props()

  interface TableData { columns: string[]; rows: Record<string, unknown>[] }

  const result = $derived.by(() => {
    try {
      return { data: JSON.parse(code) as TableData, error: null }
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  })
</script>

{#if result.error}
  <div data-block-error class="block-error">
    <span>Table error: {result.error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  <Table columns={result.data!.columns} rows={result.data!.rows} />
{/if}
```

**If no `<Table>` component exists (fallback):**
```svelte
<script lang="ts">
  let { code }: { code: string } = $props()

  interface TableData { columns: string[]; rows: Record<string, unknown>[] }

  const result = $derived.by(() => {
    try {
      return { data: JSON.parse(code) as TableData, error: null }
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  })
</script>

{#if result.error}
  <div data-block-error class="block-error">
    <span>Table error: {result.error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  {@const { columns, rows } = result.data!}
  <div class="table-block" data-table-block>
    <table>
      <thead><tr>{#each columns as col}<th>{col}</th>{/each}</tr></thead>
      <tbody>
        {#each rows as row}
          <tr>{#each columns as col}<td>{row[col] ?? ''}</td>{/each}</tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
```

- [ ] **Step 10: Run table tests**

```bash
bun run test packages/blocks/spec/TablePlugin.spec.ts
```

### Task 3d: `SparklinePlugin` — TDD

- [ ] **Step 10: Write the failing test**

Create `packages/blocks/spec/SparklinePlugin.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparklinePlugin from '../src/SparklinePlugin.svelte'

const validSpec = JSON.stringify({
  data: [{ m: 'Jan', v: 10 }, { m: 'Feb', v: 20 }],
  x: 'm', y: 'v',
  geoms: [{ type: 'line' }]
})

describe('SparklinePlugin', () => {
  it('renders an SVG', () => {
    const { container } = render(SparklinePlugin, { props: { code: validSpec } })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders error badge for invalid JSON', () => {
    const { container } = render(SparklinePlugin, { props: { code: 'bad' } })
    expect(container.querySelector('[data-block-error]')).toBeTruthy()
  })
})
```

- [ ] **Step 11: Implement `SparklinePlugin.svelte`**

Create `packages/blocks/src/SparklinePlugin.svelte`:

```svelte
<script lang="ts">
  import { Sparkline } from '@rokkit/chart'
  import type { PlotSpec } from '@rokkit/chart'

  let { code }: { code: string } = $props()

  const result = $derived.by(() => {
    try {
      return { spec: JSON.parse(code) as PlotSpec, error: null }
    } catch (e) {
      return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  })
</script>

{#if result.error}
  <div data-block-error class="block-error">
    <span>Sparkline error: {result.error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  <Sparkline spec={result.spec} />
{/if}
```

### Task 3e: `MermaidPlugin` — TDD then barrel export

- [ ] **Step 12: Write the failing test for MermaidPlugin**

Create `packages/blocks/spec/MermaidPlugin.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import MermaidPlugin from '../src/MermaidPlugin.svelte'

// Mermaid lazy-loads — mock the dynamic import for tests
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg><rect/></svg>' })
  }
}))

describe('MermaidPlugin', () => {
  it('renders a mermaid container div', () => {
    const { container } = render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })
    expect(container.querySelector('[data-mermaid-block]')).toBeTruthy()
  })

  it('renders error badge when mermaid throws', async () => {
    const { default: mermaid } = await import('mermaid')
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error('parse error'))
    const { container } = render(MermaidPlugin, { props: { code: 'invalid diagram' } })
    // Wait for onMount + async render to settle
    await new Promise((r) => setTimeout(r, 0))
    expect(container.querySelector('[data-block-error]')).toBeTruthy()
  })
})
```

- [ ] **Step 13: Run test to confirm it fails**

```bash
bun run test packages/blocks/spec/MermaidPlugin.spec.ts
```

Expected: fail with `Cannot find module`

- [ ] **Step 14: Implement `MermaidPlugin.svelte`**

Create `packages/blocks/src/MermaidPlugin.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import DOMPurify from 'isomorphic-dompurify'

  let { code }: { code: string } = $props()
  let container: HTMLDivElement
  let error = $state<string | null>(null)

  onMount(async () => {
    try {
      // Lazy-load mermaid — only pulled in when this component mounts
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({ startOnLoad: false, theme: 'default' })
      const { svg } = await mermaid.render(
        'mermaid-' + Math.random().toString(36).slice(2),
        code
      )
      // Sanitize the SVG before assigning to innerHTML
      container.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } })
    } catch (e) {
      error = e instanceof Error ? e.message : 'Mermaid render failed'
    }
  })
</script>

{#if error}
  <div data-block-error class="block-error">
    <span>Mermaid error: {error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  <div bind:this={container} class="mermaid-block" data-mermaid-block></div>
{/if}
```

Add `isomorphic-dompurify` to blocks package:
```bash
cd packages/blocks && bun add isomorphic-dompurify && bun add -d @types/dompurify
```

- [ ] **Step 15: Run MermaidPlugin tests to confirm they pass**

```bash
bun run test packages/blocks/spec/MermaidPlugin.spec.ts
```

Expected: all 2 tests pass

- [ ] **Step 16: Create barrel export**

Create `packages/blocks/src/index.ts`:

```typescript
import type { MarkdownPlugin } from '@rokkit/ui'
import PlotPluginComponent from './PlotPlugin.svelte'
import TablePluginComponent from './TablePlugin.svelte'
import SparklinePluginComponent from './SparklinePlugin.svelte'
import MermaidPluginComponent from './MermaidPlugin.svelte'

export const PlotPlugin: MarkdownPlugin = {
  language: 'plot',
  component: PlotPluginComponent
}

export const TablePlugin: MarkdownPlugin = {
  language: 'table',
  component: TablePluginComponent
}

export const SparklinePlugin: MarkdownPlugin = {
  language: 'sparkline',
  component: SparklinePluginComponent
}

export const MermaidPlugin: MarkdownPlugin = {
  language: 'mermaid',
  component: MermaidPluginComponent
}
```

- [ ] **Step 14: Add `packages/blocks` to workspace**

Check the root `package.json` workspaces array and add `"packages/blocks"` if not already covered by a glob.

- [ ] **Step 15: Run all blocks tests**

```bash
bun run test packages/blocks/
```

Expected: all tests pass

- [ ] **Step 16: Run full suite**

```bash
bun run test
```

Expected: 0 failures

- [ ] **Step 17: Commit**

```bash
cd ~/Developer/rokkit
git add packages/blocks/
git commit -m "feat: add @rokkit/blocks package with PlotPlugin, TablePlugin, SparklinePlugin, MermaidPlugin"
```

---

## Chunk 4: CrossFilter Support in `<MarkdownRenderer>`

> **Prerequisites:** Chunks 1–3 must be complete. Also requires `CrossFilter` component API in `@rokkit/chart` to be stable. **Check before starting:**
> ```bash
> grep -r "CrossFilter\|createCrossFilter" packages/chart/src/ | head -10
> ```
> If `CrossFilter` is not yet implemented in `@rokkit/chart`, **skip this chunk entirely** — the basic renderer works without it. CrossFilter support is an enhancement, not a blocker.

Enables multiple `plot` blocks in the same markdown document to share a CrossFilter context for linked interactive filtering. A `"crossfilter": "group-id"` field in a `plot` spec groups co-labelled plots into a shared `<CrossFilter>` wrapper.

### File Map

- **Modify:** `packages/ui/src/MarkdownRenderer.svelte` — pre-pass to group crossfilter plots
- **Modify:** `packages/ui/spec/MarkdownRenderer.spec.ts` — add crossfilter grouping tests

### Task 4: CrossFilter grouping — TDD

- [ ] **Step 1: Write the failing crossfilter tests**

Add to `packages/ui/spec/MarkdownRenderer.spec.ts`:

```typescript
import CrossFilterStub from './fixtures/CrossFilterStub.svelte'

// CrossFilterStub: a component that renders [data-crossfilter-group] around its children
// Create packages/ui/spec/fixtures/CrossFilterStub.svelte:
// <div data-crossfilter-group><slot /></div>

describe('MarkdownRenderer — CrossFilter grouping', () => {
  it('wraps co-grouped plot blocks in a CrossFilter context', () => {
    const md = [
      '```plot',
      '{"data":[],"x":"a","y":"b","geoms":[{"type":"bar"}],"crossfilter":"group1"}',
      '```',
      '',
      '```plot',
      '{"data":[],"x":"a","y":"b","geoms":[{"type":"line"}],"crossfilter":"group1"}',
      '```',
    ].join('\n')
    const { container } = render(MarkdownRenderer, {
      props: {
        markdown: md,
        plugins: [{ language: 'plot', component: StubPlugin }],
        crossfilter: true
      }
    })
    // Both plots should be inside the same crossfilter group wrapper
    expect(container.querySelectorAll('[data-crossfilter-group]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-stub-plugin]')).toHaveLength(2)
  })

  it('does not group plots without crossfilter field', () => {
    const md = [
      '```plot',
      '{"data":[],"x":"a","y":"b","geoms":[{"type":"bar"}]}',
      '```',
    ].join('\n')
    const { container } = render(MarkdownRenderer, {
      props: { markdown: md, plugins: [{ language: 'plot', component: StubPlugin }], crossfilter: true }
    })
    expect(container.querySelectorAll('[data-crossfilter-group]')).toHaveLength(0)
  })
})
```

Create `packages/ui/spec/fixtures/CrossFilterStub.svelte`:
```svelte
<div data-crossfilter-group><slot /></div>
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun run test packages/ui/spec/MarkdownRenderer.spec.ts
```

Expected: new crossfilter tests fail, existing tests still pass

- [ ] **Step 3: Add `crossfilter` prop and pre-pass grouping to `MarkdownRenderer.svelte`**

Read current `MarkdownRenderer.svelte`, then:
1. Add `crossfilter?: boolean` to the `Props` interface
2. Add a `CrossFilter` import from `@rokkit/chart`
3. Add a `segments` derived value: pre-pass groups consecutive `plot` tokens with matching `crossfilter` field values into group segments; wraps them in `<CrossFilter>` in the template
4. Replace the `{#each tokens}` loop with `{#each segments}` loop

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test packages/ui/spec/MarkdownRenderer.spec.ts
```

Expected: all tests pass including the new crossfilter tests

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): add CrossFilter grouping support in MarkdownRenderer"
```

---

## Final Verification

- [ ] Run full test suite: 0 failures
- [ ] Verify `<MarkdownRenderer plugins={[PlotPlugin, TablePlugin, SparklinePlugin]}>` renders correctly in the Rokkit site/playground
- [ ] Verify `<Sparkline>` renders inline at small size in a story/playground page
- [ ] Confirm `@rokkit/blocks` is importable from an app: `import { PlotPlugin } from '@rokkit/blocks'`
- [ ] Confirm DOMPurify sanitization is active in MarkdownRenderer (check no unsanitized HTML paths exist)
