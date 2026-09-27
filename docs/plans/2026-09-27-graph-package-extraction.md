# `@rokkit/graph` slice 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`
> (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@rokkit/graph` — a node-link diagram package with a pluggable layout interface —
by porting dbd's ER viewer onto a canonical `{nodes, edges}` model, with the learn site as the
visual verification surface.

**Architecture:** Public API is field-mapped (`nodes`/`edges`/`fields`, like `List`/`Tree`); a
normalizer resolves the mapping once into concrete types; layouts are pure
`(model, options) => LayoutResult` functions; one `Graph` canvas renders any layout's result.
Theming splits by vocabulary — `data-node-kind` coloured in CSS where the set is closed, a
brewer preset for open-ended group names.

**Tech Stack:** Svelte 5 (runes), TypeScript, Vitest, Playwright, UnoCSS, `svelte-package`.

**Design doc:** `docs/design/23-graph.md` · **Backlog:** `docs/backlog/2026-09-27-graph-package-extraction.md` · **Issue:** #159

---

## Refinement discovered while reading the source

`EntityDiagram.svelte` (the entity-centric neighbour view) carries its **own** `C` constants,
`buildCard`, `anchorY` and `path` — roughly 100 lines duplicating `layout-cards.ts` and
`layout-edges.ts` with slightly different numbers.

Under this design that duplication **collapses**: its geometry becomes a second `LayoutFn`
(`neighborhood`), rendered by the same `Graph` canvas. So slice 1 ships **two** layouts, not
one — at _less_ code than porting `EntityDiagram` as its own component, and the layout seam is
validated by two real implementations instead of one plus a promise.

This is a scope reduction, not an expansion. Task 11 is where it lands.

---

## Source of truth for the port

All paths below relative to `~/Developer/dbd/site/src/lib/design/`. **Read each file before
porting it** — this plan gives the transformations, not a transcription.

| Source                                                    | Lines | Ports to                               | Task |
| --------------------------------------------------------- | ----: | -------------------------------------- | ---: |
| `model.ts` (`toLayoutData`, `neighborsOf`, `nodeId` only) |    68 | `src/model/normalize.ts`               |    4 |
| `layout-types.ts`                                         |    71 | `src/layout/types.ts` + `constants.ts` |    6 |
| `layout-cards.ts`                                         |    24 | `src/layout/cards.ts`                  |    7 |
| `layout-clusters.ts`                                      |   162 | `src/layout/clusters.ts`               |    8 |
| `layout-edges.ts`                                         |    82 | `src/layout/edges.ts`                  |    9 |
| `layout.ts`                                               |    60 | `src/layout/cluster.ts`                |   10 |
| `EntityDiagram.svelte` (geometry only)                    |   222 | `src/layout/neighborhood.ts`           |   11 |
| `DiagramView.svelte` (derivations)                        |     — | `src/GraphState.svelte.ts`             |   12 |
| `DiagramView.svelte` (render only)                        |   139 | `src/Graph.svelte`                     |   13 |
| `md.ts`                                                   |    50 | `src/schema/notes.ts`                  |   14 |
| `EntityView.svelte`                                       |   211 | `src/schema/EntityView.svelte`         |   17 |
| `EntitiesView.svelte`                                     |    80 | `src/schema/EntitiesView.svelte`       |   16 |
| `layout-clusters.test.ts`                                 |   192 | `spec/layout/clusters.spec.ts`         |    8 |
| `layout-edges.test.ts`                                    |   152 | `spec/layout/edges.spec.ts`            |    9 |

**Does not port:** `Icon.svelte`, `Header.svelte`, `store.ts`, `fragment.ts`, `data.ts`,
`ProjectsView.svelte`, `SchemaSnapshot.svelte`, `Tabs.svelte`, `ContentHeader.svelte`,
`Sidebar.svelte`, `styles.css`, and `model.ts`'s `SchemaModel`/`validateModel`.

---

## File structure

```
packages/graph/
  package.json              two exports: "." and "./schema"
  tsconfig.json             extends root; rootDir src
  svelte.config.js          vitePreprocess for svelte-package
  README.md
  src/
    index.ts                public barrel for "."
    types.ts                GraphNode, GraphRow, GraphEdge, GraphModel, GraphFields
    model/
      normalize.ts          normalizeGraph — the single mapping seam
      path.ts              readPath — dotted-path field reader
    layout/
      types.ts              LayoutFn, LayoutOptions, LayoutResult, Card, Cluster, Edge
      constants.ts          CARD_W, ROW_H, HEAD_H, GAP_*, CL_*, MAX_ROW_W
      cards.ts              buildCards
      clusters.ts           groupByGroup, buildAdjacency, buildClusters, pack, orderClusters, flow, barycenterPasses
      edges.ts              buildEdges, edgePath
      cluster.ts            the `cluster` LayoutFn
      neighborhood.ts       the `neighborhood` LayoutFn
      index.ts              layout registry { cluster, neighborhood }
    preset.ts               createGraphPreset, resolveGroupStyles
    GraphState.svelte.ts    THE STORE — every derivation lives here
    Graph.svelte            presentation only — reads state, renders, routes intent
    schema/
      index.ts              public barrel for "./schema"
      notes.ts              inlineSegs, noteBlocks
      fromSchemaModel.ts    optional sugar over normalizeGraph
      EntityView.svelte     presentation only — reads state.entity / state.relationships
      EntitiesView.svelte   presentation only — reads state.entities
      NoteBlocks.svelte     shared note renderer (used by both views)
  spec/
    setup.js
    dependencies.spec.js
    normalize.spec.ts
    path.spec.ts
    preset.spec.ts
    layout/
      cards.spec.ts
      clusters.spec.ts      ported
      edges.spec.ts         ported
      cluster.spec.ts
      neighborhood.spec.ts
    GraphState.spec.ts      NO DOM — the bulk of the behaviour coverage
    Graph.spec.ts           DOM only — fed a state, asserts attributes
    schema/
      notes.spec.ts
      fromSchemaModel.spec.ts
      EntitiesView.spec.ts
      EntityView.spec.ts
```

### Layer separation

Three layers, each testable alone — this is the `sensei:ui-state-pattern` shape, and it matches
how `PlotState`/`SparkState` already work in `@rokkit/chart`.

| Layer         | Here                                         | Owns                                                          | Tested by                    |
| ------------- | -------------------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| **Load**      | the consumer (and `demos/graph/datasets.ts`) | where `nodes`/`edges` come from                               | the consumer                 |
| **State**     | `GraphState.svelte.ts`                       | normalize → layout → preset → selection. **Every** derivation | `GraphState.spec.ts`, no DOM |
| **Component** | `Graph.svelte`, `EntityView`, `EntitiesView` | render + route user intent through state methods              | `*.spec.ts`, DOM only        |

`@rokkit/graph` is a library, not a screen, so the **load** layer belongs to the consumer — the
package's contract is `nodes`/`edges`/`fields` and it never fetches. The learn demo's
`datasets.ts` is the load layer for the demo specifically.

**The rule that makes this worth doing:** a component may not compute. No `refCount` loop in
`EntitiesView`, no `cardState()` helper in `Graph`, no relationship partitioning in `EntityView`.
If a template needs a value, `GraphState` exposes it. That is what lets the geometry, the badge
derivation and the selection logic be tested exhaustively without rendering anything, and lets
the DOM specs assert only attributes.

Plus, outside the package:

- `packages/themes/src/base/graph.css`, `packages/themes/src/rokkit/graph.css`
- `packages/core/src/colors/categorical.json`, `packages/core/src/colors/brewer.ts`
- `apps/learn/src/lib/koan/demos/graph/**`
- `vitest.config.ts`, root `package.json` (`check:svelte`)

---

## Task 1: Package scaffold

**Files:**

- Create: `packages/graph/package.json`, `packages/graph/tsconfig.json`,
  `packages/graph/svelte.config.js`, `packages/graph/README.md`,
  `packages/graph/src/index.ts`, `packages/graph/spec/setup.js`
- Modify: `vitest.config.ts`, `package.json`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/dependencies.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const PKG_DIR = join(process.cwd(), 'packages/graph')
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf-8'))

describe('@rokkit/graph — manifest', () => {
  it('takes svelte as a peer, never a hard dependency', () => {
    expect(pkg.dependencies?.svelte).toBeUndefined()
    expect(pkg.peerDependencies.svelte).toBe('^5.0.0')
  })

  it('declares no third-party runtime dependencies', () => {
    const thirdParty = Object.keys(pkg.dependencies ?? {}).filter((d) => !d.startsWith('@rokkit/'))

    expect(thirdParty).toEqual([])
  })

  it('exposes exactly the two designed entry points', () => {
    expect(Object.keys(pkg.exports).sort()).toEqual(['.', './package.json', './schema'])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — no `graph` project exists yet ("No test files found").

- [ ] **Step 3: Create the manifest**

`packages/graph/package.json`:

```json
{
  "name": "@rokkit/graph",
  "version": "1.6.0",
  "description": "Node-link diagram components — pluggable layouts, ER/schema views",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jerrythomas/rokkit.git"
  },
  "author": "Jerry Thomas <me@jerrythomas.name>",
  "license": "MIT",
  "type": "module",
  "svelte": "./src/index.ts",
  "types": "./dist/index.d.ts",
  "publishConfig": { "access": "public" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./schema": {
      "types": "./dist/schema/index.d.ts",
      "svelte": "./src/schema/index.ts",
      "default": "./src/schema/index.ts"
    },
    "./package.json": "./package.json"
  },
  "files": ["src", "dist/**/*.d.ts", "README.md", "LICENSE"],
  "scripts": {
    "prepublishOnly": "cp ../../LICENSE . && bun run clean && bun run build && node ../../config/pack-repoint.mjs",
    "postpublish": "node ../../config/pack-repoint.mjs --restore && rm -f LICENSE",
    "clean": "rm -rf dist",
    "build": "svelte-package -i src -o dist",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "check:types": "tsc --noEmit"
  },
  "dependencies": {
    "@rokkit/core": "workspace:*",
    "@rokkit/ui": "workspace:*"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "devDependencies": {
    "@sveltejs/package": "^2.5.8",
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "svelte": "^5.55.7",
    "svelte-check": "^4.7.6"
  }
}
```

`packages/graph/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"]
}
```

`packages/graph/svelte.config.js`:

```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Standalone config for `svelte-package`. vitePreprocess transpiles
// `<script lang="ts">` so svelte-package can emit processed `.svelte` + `.svelte.d.ts`.
/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: { runes: true }
}

export default config
```

`packages/graph/spec/setup.js`:

```js
import { vi } from 'vitest'

// Svelte 5's svelte/motion touches window.matchMedia at import time via MediaQuery,
// and JSDOM does not provide it. Same shape as packages/blocks/spec/setup.js.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    media: query,
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
}
```

`packages/graph/src/index.ts` (placeholder barrel, filled by later tasks):

```ts
export {} from './types.ts'
```

`packages/graph/README.md`:

```markdown
# @rokkit/graph

Node-link diagram components for Rokkit — a canonical `{nodes, edges}` model with pluggable
layouts, plus schema/ER views built on top.

- `@rokkit/graph` — `Graph` canvas, `normalizeGraph`, layouts, `createGraphPreset`
- `@rokkit/graph/schema` — `EntityView`, `EntitiesView`, `fromSchemaModel`

See `docs/design/23-graph.md`.
```

- [ ] **Step 4: Register the vitest project**

In `vitest.config.ts`, add to the `projects` array immediately after the `forms` entry:

```ts
			{
				extends: true,
				test: {
					name: 'graph',
					root: 'packages/graph',
					setupFiles: ['../helpers/src/mocks/index.js', 'spec/setup.js']
				}
			},
```

In the same file's `coverage.thresholds`, add after the `packages/forms` entries:

```ts
				'packages/graph/**/*.{js,ts}': { statements: 100, lines: 100 },
				'packages/graph/**/*.svelte': { statements: 90, lines: 90 },
```

- [ ] **Step 5: Add the package to `check:svelte`**

In root `package.json`, change the `check:svelte` script's package list from
`packages/ui packages/app packages/chart packages/forms packages/blocks apps/learn`
to include `packages/graph`:

```json
    "check:svelte": "for d in packages/ui packages/app packages/chart packages/forms packages/blocks packages/graph apps/learn; do echo \"→ svelte-check ${d}\"; (cd \"${d}\" && bun run check) || exit 1; done",
```

- [ ] **Step 6: Install and run the test to verify it passes**

Run: `bun install && bun run test:ci --project graph`
Expected: PASS — 3 tests in `spec/dependencies.spec.js`.

- [ ] **Step 7: Commit**

```bash
git add packages/graph vitest.config.ts package.json bun.lock
git commit -m "feat(graph): scaffold @rokkit/graph package

Two entry points, svelte as a peer, no third-party runtime deps — all three
pinned by spec/dependencies.spec.js so the manifest cannot drift into the
duplicate-runtime shape workspace-peers.spec.js exists to prevent."
```

---

## Task 2: Move the categorical palette to `@rokkit/core`

Chart's `lib/palette.json` is internal (absent from chart's `exports`), so this move cannot
break a consumer. The guard is that **chart's resolved colours do not change**.

**Files:**

- Create: `packages/core/src/colors/categorical.json` (moved),
  `packages/core/src/colors/brewer.ts`, `packages/core/spec/colors-categorical.spec.js`
- Modify: `packages/core/src/colors/index.ts`, `packages/chart/src/lib/swatch.js`,
  `packages/chart/src/lib/brewing/colors.js`, `packages/chart/package.json`
- Delete: `packages/chart/src/lib/palette.json`

- [ ] **Step 1: Write the failing test**

Create `packages/core/spec/colors-categorical.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { categoricalPalette, categoricalFamilies } from '../src/colors/brewer.ts'
import { defaultColors } from '../src/colors/index.ts'

describe('categorical palette', () => {
  it('carries every family chart relied on', () => {
    expect(categoricalFamilies).toEqual([
      'amber',
      'blue',
      'cyan',
      'emerald',
      'gold',
      'gray',
      'indigo',
      'lavender',
      'lime',
      'orange',
      'pink',
      'purple',
      'red',
      'rose',
      'sky',
      'stone',
      'teal',
      'violet',
      'wood',
      'yellow',
      'zinc'
    ])
  })

  it('gives every family the full 50-950 ladder', () => {
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

    for (const family of categoricalFamilies) {
      expect(Object.keys(categoricalPalette[family]).sort(), family).toEqual(shades.sort())
    }
  })

  it('stays SEPARATE from defaultColors — it is a different palette, not a superset', () => {
    // core's tailwind.json and chart's palette disagree on shared families, so merging
    // them would silently move every chart's colours. `wood` proves the split: it exists
    // only in the categorical palette.
    expect(categoricalPalette.wood).toBeDefined()
    expect(defaultColors.wood).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project core`
Expected: FAIL — `Cannot find module '../src/colors/brewer.ts'`.

- [ ] **Step 3: Capture chart's current colours as a guard**

Create `packages/chart/spec/palette-move.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { assignColors } from '../src/lib/brewing/colors.js'

// The palette moved to @rokkit/core. These are the colours chart resolved BEFORE the
// move, recorded so the move is provably value-preserving. If this fails, the move
// changed chart's output — which is the one thing it must not do.
describe('chart colours survive the palette move', () => {
  it('assigns the same light-mode fill/stroke pairs as before the move', () => {
    const colors = assignColors(['a', 'b', 'c'], 'light')

    expect(colors.get('a')).toEqual({ fill: '#bfdbfe', stroke: '#1d4ed8' })
    expect(colors.get('b')).toEqual({ fill: '#a7f3d0', stroke: '#047857' })
    expect(colors.get('c')).toEqual({ fill: '#fecdd3', stroke: '#be123c' })
  })
})
```

Run: `bun run test:ci --project chart -t "survive the palette move"`

**These expected values are placeholders.** They are Tailwind's blue/emerald/rose 200/700, and
chart's palette differs on every one (`blue.200` is `#bfeeff`, not `#bfdbfe`) — so they will fail,
loudly. That is the point: the failure proves the guard is wired to the real code path before you
trust it.

- [ ] **Step 3a: Run it and confirm it FAILS with the placeholders**

Run: `bun run test:ci --project chart -t "survive the palette move"`
Expected: **FAIL**, showing chart's real hex values in the diff. If it PASSES, stop — the test is
not reaching `assignColors` and the guard is worthless.

- [ ] **Step 3b: Substitute the real values and confirm it PASSES, still pre-move**

```bash
cd packages/chart && bun -e "
import { assignColors } from './src/lib/brewing/colors.js'
console.log(JSON.stringify([...assignColors(['a','b','c'],'light')], null, 2))
"
```

Paste those values in, re-run, expect PASS. **This green run is the baseline** — it records
chart's colours _before_ anything moves, which is what makes a later failure unambiguous. Without
this observed red→green pair, a post-move failure could mean either "the move broke chart" or "the
baseline was wrong all along", and the plan's instruction to fix the move rather than the test
would be guesswork.

- [ ] **Step 4: Move the file**

```bash
git mv packages/chart/src/lib/palette.json packages/core/src/colors/categorical.json
```

Create `packages/core/src/colors/brewer.ts`:

```ts
import categorical from './categorical.json' with { type: 'json' }

/**
 * Categorical colour families with full 50-950 ladders, used to differentiate
 * open-ended groups (chart series, graph node groups).
 *
 * Deliberately NOT merged into `defaultColors`: core's `tailwind.json` is a
 * different palette that disagrees on shared families, so merging would move
 * every chart's resolved colours.
 */
export const categoricalPalette: Record<string, Record<string, string>> = categorical

export const categoricalFamilies = Object.keys(categorical).sort()
```

In `packages/core/src/colors/index.ts`, add the re-export at the end:

```ts
export { categoricalPalette, categoricalFamilies } from './brewer.ts'
```

- [ ] **Step 5: Point chart at core**

In `packages/chart/src/lib/brewing/colors.js`, replace:

```js
import masterPalette from '../palette.json'
```

with:

```js
import { categoricalPalette as masterPalette } from '@rokkit/core'
```

In `packages/chart/src/lib/swatch.js`, replace:

```js
import palette from './palette.json'
```

with:

```js
import { categoricalPalette as palette } from '@rokkit/core'
```

Then verify nothing else references the old path:

```bash
rg --no-ignore -g '!node_modules' -g '!dist' "palette\.json" packages/
```

Expected: only `packages/core/src/colors/brewer.ts`.

- [ ] **Step 6: Run the full chart + core suites**

Run: `bun run test:ci --project chart --project core`
Expected: PASS, including `palette-move.spec.js` with **unchanged** values. A failure there
means the move altered chart's colours — fix the move, do not rebaseline the test.

- [ ] **Step 7: Commit**

```bash
git add packages/core packages/chart
git commit -m "refactor(core): move the categorical palette out of chart

Both @rokkit/chart and the new @rokkit/graph need categorical colour, so the
palette belongs in core rather than being duplicated or making graph depend on
chart. Safe to move: it was absent from chart's exports map, so internal-only.

Kept SEPARATE from defaultColors. core's tailwind.json is a different palette
that disagrees with this one on shared families, so merging would silently move
every chart's colours. palette-move.spec.js pins chart's resolved fill/stroke
pairs across the move to prove it didn't."
```

---

## Task 3: Canonical types and the dotted-path reader

**Files:**

- Create: `packages/graph/src/types.ts`, `packages/graph/src/model/path.ts`,
  `packages/graph/spec/path.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/path.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readPath } from '../src/model/path.ts'

describe('readPath', () => {
  it('reads a top-level key', () => {
    expect(readPath({ name: 'users' }, 'name')).toBe('users')
  })

  it('reads a dotted path — dbd refs nest as { from: { s, t, c } }', () => {
    expect(readPath({ from: { s: 'public', t: 'users', c: 'id' } }, 'from.t')).toBe('users')
  })

  it('returns undefined for a missing leaf rather than throwing', () => {
    expect(readPath({ from: { s: 'public' } }, 'from.t')).toBeUndefined()
  })

  it('returns undefined when an intermediate segment is absent', () => {
    expect(readPath({}, 'from.t')).toBeUndefined()
  })

  it('returns undefined when an intermediate segment is not an object', () => {
    expect(readPath({ from: 'public' }, 'from.t')).toBeUndefined()
  })

  it('returns undefined when the row itself is null', () => {
    expect(readPath(null, 'name')).toBeUndefined()
  })

  it('does not treat an array index as a path segment', () => {
    // Field maps name object paths, never array positions — `rows.0` is not a
    // contract we support, and silently reading it would invite maps that break
    // as soon as the data reorders.
    expect(readPath({ rows: [{ name: 'id' }] }, 'rows.0.name')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../src/model/path.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/model/path.ts`:

```ts
/**
 * Reads a dotted field path off a source row.
 *
 * Field maps name object paths only. Arrays are rejected on purpose: a map like
 * `rows.0.name` would break the moment the data reorders, so it is better to
 * return undefined than to make it appear to work.
 */
export function readPath(row: unknown, path: string): unknown {
  let current = row

  for (const segment of path.split('.')) {
    if (current === null || typeof current !== 'object' || Array.isArray(current)) return undefined
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}
```

Create `packages/graph/src/types.ts`:

```ts
/** A flag rendered as a badge on a node row. */
export type RowBadge = 'pk' | 'fk' | 'uq' | 'nn'

/** One row inside a node — a column, a parameter, a field. */
export type GraphRow = {
  name: string
  type?: string
  badges: RowBadge[]
  note?: string
}

/**
 * Whether an edge expresses a data reference (a foreign key) or a dependency
 * (a view reading a table, a procedure calling a function). Layouts branch on
 * this rather than on any schema-specific notion.
 */
export type EdgeKind = 'reference' | 'dependency'

export type GraphNode = {
  /** Stable key. `${group}.${label}` when a group is present, else `label`. */
  id: string
  label: string
  /** Open vocabulary — a schema name. Drives cluster grouping and group colour. */
  group?: string
  /** Closed vocabulary — table | view | matview | function | procedure | enum. */
  kind?: string
  rows: GraphRow[]
  note?: string
  /** Source fields the map did not claim, passed through untouched. */
  meta: Record<string, unknown>
}

export type GraphEdge = {
  id: string
  /** GraphNode.id */
  source: string
  /** GraphNode.id */
  target: string
  /** GraphRow.name — the anchor row on the source card. */
  sourceRow?: string
  /** GraphRow.name — the anchor row on the target card. */
  targetRow?: string
  kind: EdgeKind
  cardinality?: string
  action?: string
}

export type GraphModel = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  byId: Map<string, GraphNode>
  /** Undirected adjacency, self-edges excluded. */
  neighbors: Map<string, Set<string>>
}

/**
 * Field map from a consumer's shape to the canonical model. Every entry is a
 * dotted path read with `readPath`. Anything omitted falls back to the
 * same-named key, so a source already shaped like the canonical model needs no map.
 */
export type GraphFields = {
  id?: string
  label?: string
  group?: string
  kind?: string
  rows?: string
  note?: string
  /** Row-level paths, read against each entry of the `rows` array. */
  rowName?: string
  rowType?: string
  rowNote?: string
  /** Row badge flags — each names a truthy path on the row. */
  rowBadges?: Partial<Record<RowBadge, string>>
  /** Edge-level paths. */
  source?: string
  target?: string
  /**
   * Where each endpoint's GROUP is read from, when the endpoint value is a bare label.
   * Declared explicitly rather than guessed: dbd's refs nest as `from: { s, t, c }`, so the
   * group is `from.s`. Falls back to `group` (the node-level path) when unset.
   */
  sourceGroup?: string
  targetGroup?: string
  sourceRow?: string
  targetRow?: string
  edgeKind?: string
  cardinality?: string
  action?: string
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 7 `readPath` tests plus the 3 manifest tests.

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/types.ts packages/graph/src/model/path.ts packages/graph/spec/path.spec.ts
git commit -m "feat(graph): canonical model types + dotted-path field reader

readPath rejects array indices deliberately — a map like rows.0.name breaks as
soon as the data reorders, so returning undefined beats appearing to work."
```

---

## Task 4: `normalizeGraph`

The single mapping seam. `toLayoutData`'s per-column `fk` derivation moves here, so dbd#24
delivering `fk`/`uq` natively becomes a change to this file alone.

**Files:**

- Create: `packages/graph/src/model/normalize.ts`, `packages/graph/spec/normalize.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/normalize.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.ts'

const TABLES = [
  {
    schema: 'public',
    name: 'users',
    kind: 'table',
    note: 'People',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'email', type: 'text', nn: true }
    ]
  },
  {
    schema: 'public',
    name: 'orders',
    kind: 'table',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'user_id', type: 'uuid' }
    ]
  }
]

const REFS = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const FIELDS = {
  label: 'name',
  group: 'schema',
  kind: 'kind',
  rows: 'columns',
  rowName: 'name',
  rowType: 'type',
  rowBadges: { pk: 'pk', nn: 'nn' },
  source: 'from.t',
  target: 'to.t',
  sourceGroup: 'from.s',
  targetGroup: 'to.s',
  sourceRow: 'from.c',
  targetRow: 'to.c'
}

describe('normalizeGraph', () => {
  it('derives node ids as group.label', () => {
    const model = normalizeGraph(TABLES, REFS, FIELDS)

    expect(model.nodes.map((n) => n.id)).toEqual(['public.users', 'public.orders'])
  })

  it('falls back to the label as id when no group is mapped', () => {
    const model = normalizeGraph([{ name: 'solo', columns: [] }], [], {
      label: 'name',
      rows: 'columns'
    })

    expect(model.nodes[0].id).toBe('solo')
  })

  it('maps rows and their badges', () => {
    const model = normalizeGraph(TABLES, REFS, FIELDS)

    expect(model.nodes[0].rows).toEqual([
      { name: 'id', type: 'uuid', badges: ['pk'], note: undefined },
      { name: 'email', type: 'text', badges: ['nn'], note: undefined }
    ])
  })

  it('DERIVES fk on the source row of every reference edge', () => {
    // dbd's toLayoutData did this; it belongs in the normalizer so dbd#24
    // shipping fk natively is a change to this file alone.
    const model = normalizeGraph(TABLES, REFS, FIELDS)
    const orders = model.byId.get('public.orders')

    expect(orders?.rows.find((r) => r.name === 'user_id')?.badges).toEqual(['fk'])
  })

  it('does not mark a target row as fk', () => {
    const model = normalizeGraph(TABLES, REFS, FIELDS)
    const users = model.byId.get('public.users')

    expect(users?.rows.find((r) => r.name === 'id')?.badges).toEqual(['pk'])
  })

  it('keeps a mapped badge and a derived fk together on one row', () => {
    const model = normalizeGraph(
      TABLES,
      [{ from: { s: 'public', t: 'orders', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }],
      FIELDS
    )

    expect(model.byId.get('public.orders')?.rows[0].badges).toEqual(['pk', 'fk'])
  })

  it('resolves edge endpoints to node ids and defaults kind to reference', () => {
    const model = normalizeGraph(TABLES, REFS, FIELDS)

    expect(model.edges).toEqual([
      {
        id: 'public.orders:user_id->public.users:id',
        source: 'public.orders',
        target: 'public.users',
        sourceRow: 'user_id',
        targetRow: 'id',
        kind: 'reference',
        cardinality: undefined,
        action: undefined
      }
    ])
  })

  it('maps cardinality and action when the source carries them', () => {
    // The only coverage these had was asserting they default to undefined — which a
    // normalizer that ignored the fields entirely would also satisfy.
    const edges = [
      {
        from: { s: 'public', t: 'orders', c: 'user_id' },
        to: { s: 'public', t: 'users', c: 'id' },
        cardinality: '1:N',
        action: 'cascade'
      }
    ]
    const model = normalizeGraph(TABLES, edges, FIELDS)

    expect(model.edges[0]).toMatchObject({ cardinality: '1:N', action: 'cascade' })
  })

  it('reads an explicit edge kind when mapped', () => {
    const model = normalizeGraph(
      TABLES,
      [
        {
          from: { s: 'public', t: 'orders', c: 'id' },
          to: { s: 'public', t: 'users', c: 'id' },
          rel: 'dependency'
        }
      ],
      { ...FIELDS, edgeKind: 'rel' }
    )

    expect(model.edges[0].kind).toBe('dependency')
  })

  it('drops an edge whose endpoint is not a known node', () => {
    const model = normalizeGraph(
      TABLES,
      [{ from: { s: 'public', t: 'ghost', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }],
      FIELDS
    )

    expect(model.edges).toEqual([])
  })

  it('builds undirected adjacency and excludes self-edges', () => {
    const model = normalizeGraph(
      TABLES,
      [
        ...REFS,
        { from: { s: 'public', t: 'users', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }
      ],
      FIELDS
    )

    expect([...(model.neighbors.get('public.users') ?? [])]).toEqual(['public.orders'])
    expect([...(model.neighbors.get('public.orders') ?? [])]).toEqual(['public.users'])
  })

  it('collects unmapped source fields into meta', () => {
    const model = normalizeGraph(
      [{ ...TABLES[0], rls: true, indexes: [{ def: 'btree(email)' }] }],
      [],
      FIELDS
    )

    expect(model.nodes[0].meta).toEqual({ rls: true, indexes: [{ def: 'btree(email)' }] })
  })

  it('does NOT duplicate a claimed field into meta', () => {
    // `note` is read into node.note, so leaving it in meta would put the same
    // value in two places and let the two drift.
    const model = normalizeGraph(TABLES, REFS, FIELDS)

    expect(model.nodes[0].note).toBe('People')
    expect(model.nodes[0].meta).not.toHaveProperty('note')
  })

  it('accepts a source already shaped like the canonical model, with no map', () => {
    const model = normalizeGraph(
      [{ id: 'a', label: 'a', rows: [{ name: 'x' }] }],
      [{ source: 'a', target: 'a' }],
      {}
    )

    expect(model.nodes[0]).toMatchObject({ id: 'a', label: 'a' })
    expect(model.nodes[0].rows[0]).toMatchObject({ name: 'x', badges: [] })
  })

  it('returns an empty model for empty input', () => {
    const model = normalizeGraph([], [], FIELDS)

    expect(model.nodes).toEqual([])
    expect(model.edges).toEqual([])
    expect(model.byId.size).toBe(0)
  })

  it('gives each edge a distinct id when two refs join the same pair via different rows', () => {
    const model = normalizeGraph(
      TABLES,
      [
        {
          from: { s: 'public', t: 'orders', c: 'user_id' },
          to: { s: 'public', t: 'users', c: 'id' }
        },
        { from: { s: 'public', t: 'orders', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }
      ],
      FIELDS
    )

    expect(new Set(model.edges.map((e) => e.id)).size).toBe(2)
  })

  it('gives each edge a distinct id when two ROW-LESS edges join the same pair', () => {
    // The case endpoints-plus-rows cannot key: a dependency edge has no column anchors, so
    // both would be `dependency:p.a:->p.b:`. A procedure calling a function twice, or a view
    // reaching a table by two paths, produces exactly this.
    const nodes = [
      { schema: 'p', name: 'a', columns: [] },
      { schema: 'p', name: 'b', columns: [] }
    ]
    const edges = [
      { from: { s: 'p', t: 'a' }, to: { s: 'p', t: 'b' }, rel: 'dependency' },
      { from: { s: 'p', t: 'a' }, to: { s: 'p', t: 'b' }, rel: 'dependency' }
    ]
    const model = normalizeGraph(nodes, edges, { ...FIELDS, edgeKind: 'rel' })

    expect(model.edges).toHaveLength(2)
    expect(new Set(model.edges.map((e) => e.id)).size).toBe(2)
  })

  it('distinguishes a reference edge from a dependency edge on the same pair and rows', () => {
    const edges = [
      {
        from: { s: 'public', t: 'orders', c: 'user_id' },
        to: { s: 'public', t: 'users', c: 'id' }
      },
      {
        from: { s: 'public', t: 'orders', c: 'user_id' },
        to: { s: 'public', t: 'users', c: 'id' },
        rel: 'dependency'
      }
    ]
    const model = normalizeGraph(TABLES, edges, { ...FIELDS, edgeKind: 'rel' })

    expect(new Set(model.edges.map((e) => e.id)).size).toBe(2)
  })

  it('DROPS an unresolvable endpoint rather than guessing a coincidental node', () => {
    // `staging.orders` does not exist, but `legacy.orders` does. A resolver that swept every
    // sibling field for a match would attach the edge to `legacy.orders` and draw a
    // relationship between two entities that have none.
    const nodes = [
      { schema: 'legacy', name: 'orders', columns: [{ name: 'id' }] },
      { schema: 'public', name: 'users', columns: [{ name: 'id' }] }
    ]
    const edges = [
      { from: { s: 'staging', t: 'orders', c: 'legacy' }, to: { s: 'public', t: 'users', c: 'id' } }
    ]

    expect(normalizeGraph(nodes, edges, FIELDS).edges).toEqual([])
  })

  it('drops the edge when no group path resolves on the edge object', () => {
    // `group: 'schema'` is a path on a NODE. Read against dbd's edge shape
    // (`{ from: { s, t, c } }`) it finds nothing, so the bare label `orders` cannot be
    // qualified and the edge is dropped. This is why SCHEMA_FIELDS declares
    // sourceGroup/targetGroup explicitly — see fromSchemaModel.
    const withoutEndpointGroups = { ...FIELDS }
    delete withoutEndpointGroups.sourceGroup
    delete withoutEndpointGroups.targetGroup

    expect(normalizeGraph(TABLES, REFS, withoutEndpointGroups).edges).toEqual([])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../src/model/normalize.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/model/normalize.ts`:

```ts
import { readPath } from './path.ts'
import type {
  EdgeKind,
  GraphEdge,
  GraphFields,
  GraphModel,
  GraphNode,
  GraphRow,
  RowBadge
} from '../types.ts'

const BADGE_ORDER: RowBadge[] = ['pk', 'fk', 'uq', 'nn']

function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function pick(row: unknown, path: string | undefined, fallbackKey: string): unknown {
  return readPath(row, path ?? fallbackKey)
}

function buildRows(source: unknown, fields: GraphFields): GraphRow[] {
  const raw = pick(source, fields.rows, 'rows')
  if (!Array.isArray(raw)) return []

  const badgePaths = fields.rowBadges ?? {}

  return raw.map((entry) => {
    const badges = BADGE_ORDER.filter((badge) => {
      const path = badgePaths[badge]
      return path ? Boolean(readPath(entry, path)) : false
    })

    return {
      name: String(pick(entry, fields.rowName, 'name') ?? ''),
      type: str(pick(entry, fields.rowType, 'type')),
      badges,
      note: str(pick(entry, fields.rowNote, 'note'))
    }
  })
}

// Every node-level field the canonical model reads. A claimed key must NOT also
// land in `meta`, or the same value sits in two places and the two can drift.
const CLAIMED_NODE_KEYS = ['id', 'label', 'group', 'kind', 'rows', 'note'] as const

function buildMeta(source: unknown, fields: GraphFields): Record<string, unknown> {
  if (source === null || typeof source !== 'object') return {}

  const claimed = new Set<string>()
  for (const key of CLAIMED_NODE_KEYS) {
    // Only the FIRST segment is claimed: a map of `from.t` claims `from`.
    claimed.add((fields[key] ?? key).split('.')[0])
  }

  const meta: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source)) {
    if (!claimed.has(key)) meta[key] = value
  }

  return meta
}

function buildNode(source: unknown, fields: GraphFields): GraphNode {
  const label = String(pick(source, fields.label, 'label') ?? '')
  const group = str(pick(source, fields.group, 'group'))
  const explicitId = str(pick(source, fields.id, 'id'))

  return {
    id: explicitId ?? (group ? `${group}.${label}` : label),
    label,
    group,
    kind: str(pick(source, fields.kind, 'kind')),
    rows: buildRows(source, fields),
    note: str(pick(source, fields.note, 'note')),
    meta: buildMeta(source, fields)
  }
}

/**
 * Resolves an edge endpoint to a node id.
 *
 * Exactly two strategies, both explicit:
 *   1. the raw value already IS a node id
 *   2. `${group}.${raw}` where the group comes from a DECLARED path
 *
 * There is deliberately no third "try every sibling field and take the first hit"
 * fallback. That shape guesses: for `{ from: { s: 'staging', t: 'orders', c: 'legacy' } }`
 * where `staging.orders` does not exist but `legacy.orders` does, it would resolve the
 * endpoint to `legacy.orders` — silently drawing a relationship between two entities
 * that have none. An unresolvable endpoint must drop the edge, not land on a
 * coincidental match.
 */
function resolveEndpoint(
  source: unknown,
  path: string | undefined,
  fallbackKey: string,
  groupPath: string | undefined,
  byId: Map<string, GraphNode>
): string | undefined {
  const raw = str(pick(source, path, fallbackKey))
  if (raw === undefined) return undefined
  if (byId.has(raw)) return raw

  const group = groupPath ? str(readPath(source, groupPath)) : undefined
  if (group && byId.has(`${group}.${raw}`)) return `${group}.${raw}`

  return undefined
}

function buildEdge(
  source: unknown,
  fields: GraphFields,
  byId: Map<string, GraphNode>,
  seen: Map<string, number>
): GraphEdge | null {
  const from = resolveEndpoint(
    source,
    fields.source,
    'source',
    fields.sourceGroup ?? fields.group,
    byId
  )
  const to = resolveEndpoint(
    source,
    fields.target,
    'target',
    fields.targetGroup ?? fields.group,
    byId
  )
  if (!from || !to) return null

  const sourceRow = str(pick(source, fields.sourceRow, 'sourceRow'))
  const targetRow = str(pick(source, fields.targetRow, 'targetRow'))
  const rawKind = str(pick(source, fields.edgeKind, 'kind'))
  const kind: EdgeKind = rawKind === 'dependency' ? 'dependency' : 'reference'

  // `kind` is in the key, and a per-key counter breaks the remaining ties. Endpoints plus row
  // names are NOT unique on their own: two dependency edges between the same pair (a procedure
  // calling a function twice, a view reaching a table by two paths) carry no row anchors at
  // all, so they would both key as `a:->b:`. A duplicate id silently breaks every id-keyed
  // use — `{#each … as e (e.id)}` first among them.
  const base = `${kind}:${from}:${sourceRow ?? ''}->${to}:${targetRow ?? ''}`
  const seq = seen.get(base) ?? 0
  seen.set(base, seq + 1)

  return {
    id: seq === 0 ? base : `${base}#${seq}`,
    source: from,
    target: to,
    sourceRow,
    targetRow,
    kind,
    cardinality: str(pick(source, fields.cardinality, 'cardinality')),
    action: str(pick(source, fields.action, 'action'))
  }
}

/** Adds the derived `fk` badge to each reference edge's source row. */
function markForeignKeys(byId: Map<string, GraphNode>, edges: GraphEdge[]): void {
  for (const edge of edges) {
    if (edge.kind !== 'reference' || !edge.sourceRow) continue

    const row = byId.get(edge.source)?.rows.find((r) => r.name === edge.sourceRow)
    if (row && !row.badges.includes('fk')) {
      row.badges = BADGE_ORDER.filter((b) => b === 'fk' || row.badges.includes(b))
    }
  }
}

function buildNeighbors(edges: GraphEdge[]): Map<string, Set<string>> {
  const neighbors = new Map<string, Set<string>>()

  const link = (a: string, b: string) => {
    const set = neighbors.get(a) ?? new Set<string>()
    set.add(b)
    neighbors.set(a, set)
  }

  for (const edge of edges) {
    if (edge.source === edge.target) continue
    link(edge.source, edge.target)
    link(edge.target, edge.source)
  }

  return neighbors
}

/**
 * Resolves a consumer's `nodes`/`edges`/`fields` into the canonical model — ONCE.
 * Everything downstream (layouts, routing, components) sees concrete types, so no
 * field mapping leaks past this function.
 */
export function normalizeGraph(
  nodes: unknown[],
  edges: unknown[],
  fields: GraphFields = {}
): GraphModel {
  const built = nodes.map((source) => buildNode(source, fields))
  const byId = new Map(built.map((node) => [node.id, node]))

  const seen = new Map<string, number>()
  const resolved = edges
    .map((source) => buildEdge(source, fields, byId, seen))
    .filter((edge): edge is GraphEdge => edge !== null)

  markForeignKeys(byId, resolved)

  return { nodes: built, edges: resolved, byId, neighbors: buildNeighbors(resolved) }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 15 `normalizeGraph` tests.

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/model/normalize.ts packages/graph/spec/normalize.spec.ts
git commit -m "feat(graph): normalizeGraph — the single field-mapping seam

Resolves nodes/edges/fields into canonical types once, so no field mapping
leaks into layouts or components. dbd's per-column fk derivation moves here,
which makes dbd#24 shipping fk natively a change to this file alone."
```

---

## Task 5: `createGraphPreset`

Colour for the **open** vocabulary (group names). The closed vocabulary (`data-node-kind`) is
pure CSS and needs no JS — that lands in Task 18.

**Files:**

- Create: `packages/graph/src/preset.ts`, `packages/graph/spec/preset.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/preset.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createGraphPreset, defaultGraphPreset, resolveGroupStyles } from '../src/preset.ts'

describe('createGraphPreset', () => {
  it('returns the defaults when given no overrides', () => {
    expect(createGraphPreset()).toEqual(defaultGraphPreset)
  })

  it('merges shades key-by-key so a partial override keeps the rest', () => {
    const preset = createGraphPreset({ shades: { light: { fill: '200' } } })

    expect(preset.shades.light.fill).toBe('200')
    expect(preset.shades.light.stroke).toBe(defaultGraphPreset.shades.light.stroke)
    expect(preset.shades.dark).toEqual(defaultGraphPreset.shades.dark)
  })

  it('merges kinds so an override adds without dropping the built-ins', () => {
    const preset = createGraphPreset({ kinds: { trigger: 'rose' } })

    expect(preset.kinds.trigger).toBe('rose')
    expect(preset.kinds.table).toBe(defaultGraphPreset.kinds.table)
  })

  it('replaces the groups ramp wholesale — order is the assignment', () => {
    const preset = createGraphPreset({ groups: ['teal', 'gold'] })

    expect(preset.groups).toEqual(['teal', 'gold'])
  })

  it('defaults `using` to color', () => {
    expect(defaultGraphPreset.using).toBe('color')
  })
})

describe('resolveGroupStyles', () => {
  it('assigns families in ramp order and returns CSS custom properties', () => {
    const styles = resolveGroupStyles(
      ['public', 'audit'],
      'light',
      createGraphPreset({ groups: ['blue', 'emerald'] })
    )

    expect(Object.keys(styles.get('public') ?? {})).toEqual([
      '--group-fill',
      '--group-stroke',
      '--group-label'
    ])
  })

  it('gives two groups different fills', () => {
    const styles = resolveGroupStyles(
      ['public', 'audit'],
      'light',
      createGraphPreset({ groups: ['blue', 'emerald'] })
    )

    expect(styles.get('public')?.['--group-fill']).not.toBe(styles.get('audit')?.['--group-fill'])
  })

  it('wraps the ramp when there are more groups than families', () => {
    const preset = createGraphPreset({ groups: ['blue'] })
    const styles = resolveGroupStyles(['a', 'b'], 'light', preset)

    expect(styles.get('a')).toEqual(styles.get('b'))
  })

  it('picks different shades in dark mode than light', () => {
    const preset = createGraphPreset({ groups: ['blue'] })
    const light = resolveGroupStyles(['a'], 'light', preset)
    const dark = resolveGroupStyles(['a'], 'dark', preset)

    expect(light.get('a')?.['--group-fill']).not.toBe(dark.get('a')?.['--group-fill'])
  })

  it('assigns by sorted group name so colour is stable across arrange order', () => {
    const preset = createGraphPreset({ groups: ['blue', 'emerald'] })
    const forward = resolveGroupStyles(['audit', 'public'], 'light', preset)
    const reversed = resolveGroupStyles(['public', 'audit'], 'light', preset)

    expect(forward.get('public')).toEqual(reversed.get('public'))
  })

  it('emits pattern ids instead of colours when using = pattern', () => {
    const preset = createGraphPreset({ using: 'pattern', groups: ['blue', 'emerald'] })
    const styles = resolveGroupStyles(['a', 'b'], 'light', preset)

    expect(styles.get('a')?.['--group-pattern']).toBeDefined()
    expect(styles.get('a')?.['--group-pattern']).not.toBe(styles.get('b')?.['--group-pattern'])
  })

  it('returns an empty map for no groups', () => {
    expect(resolveGroupStyles([], 'light', createGraphPreset()).size).toBe(0)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../src/preset.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/preset.ts`:

```ts
import { categoricalPalette } from '@rokkit/core'

/**
 * How open-ended groups are differentiated.
 *
 * `pattern` is the colour-blind- and print-safe path and reuses chart's patterns.js.
 * A `symbol` channel is deliberately NOT here in slice 1: the preset could emit a name, but
 * nothing renders a glyph (chart's Shape.svelte stays in chart), so it would be a documented
 * API that silently does nothing. It returns when it has a renderer.
 */
export type GraphChannel = 'color' | 'pattern'

export type GraphShades = { fill: string; stroke: string; label: string }

export type GraphPreset = {
  /** Palette family per KNOWN node kind. Kinds are also themeable in pure CSS. */
  kinds: Record<string, string>
  /** Ordered ramp assigned to open-ended group names, wrapping when exhausted. */
  groups: string[]
  shades: { light: GraphShades; dark: GraphShades }
  patterns: string[]
  using: GraphChannel
}

/**
 * Mirrors `createChartPreset`'s shape on purpose — a consumer who has met one
 * has met both. Shade picks differ from chart's because a cluster is a large
 * background area rather than a small mark.
 */
export const defaultGraphPreset: GraphPreset = {
  kinds: {
    table: 'blue',
    view: 'emerald',
    matview: 'teal',
    function: 'amber',
    procedure: 'violet',
    enum: 'rose'
  },
  groups: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal'],
  shades: {
    light: { fill: '100', stroke: '400', label: '700' },
    dark: { fill: '900', stroke: '600', label: '200' }
  },
  patterns: ['diagonal', 'dots', 'triangles', 'hatch', 'lattice', 'swell', 'checkerboard', 'waves'],
  using: 'color'
}

export function createGraphPreset(overrides: Partial<GraphPreset> = {}): GraphPreset {
  return {
    ...defaultGraphPreset,
    ...overrides,
    kinds: { ...defaultGraphPreset.kinds, ...overrides.kinds },
    shades: {
      light: { ...defaultGraphPreset.shades.light, ...overrides.shades?.light },
      dark: { ...defaultGraphPreset.shades.dark, ...overrides.shades?.dark }
    }
  }
}

/**
 * Resolves group names to CSS custom properties.
 *
 * Returns custom properties rather than concrete fills so a theme or an app can
 * still override with one attribute rule — the JS decides the DEFAULT, never the
 * final paint.
 *
 * Assignment is by SORTED group name so a group keeps its colour when `arrange`
 * reorders the layout.
 */
export function resolveGroupStyles(
  groups: string[],
  mode: 'light' | 'dark',
  preset: GraphPreset = defaultGraphPreset
): Map<string, Record<string, string>> {
  const styles = new Map<string, Record<string, string>>()
  const ordered = [...new Set(groups)].sort()

  ordered.forEach((group, index) => {
    if (preset.using === 'pattern') {
      styles.set(group, { '--group-pattern': preset.patterns[index % preset.patterns.length] })
      return
    }

    const family = categoricalPalette[preset.groups[index % preset.groups.length]]
    const shades = preset.shades[mode]

    styles.set(group, {
      '--group-fill': family[shades.fill],
      '--group-stroke': family[shades.stroke],
      '--group-label': family[shades.label]
    })
  })

  return styles
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 5 `createGraphPreset` + 8 `resolveGroupStyles` tests.

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/preset.ts packages/graph/spec/preset.spec.ts
git commit -m "feat(graph): createGraphPreset for open-ended group colour

Group names are not knowable at build time, so they cannot be pre-written in
CSS the way data-node-kind can. The preset resolves them to custom properties
rather than concrete fills, so an attribute rule still wins — JS picks the
default, CSS keeps the final say.

Assignment is by sorted group name so a group keeps its colour when `arrange`
reorders the layout. using: 'pattern' gives a colour-blind- and
print-safe path for free."
```

---

## Task 6: Layout types and geometry constants

Port of `layout-types.ts`. **One behavioural change:** `Cluster.hue` (an oklch angle) becomes
`Cluster.groupIndex` (a position), because colour now comes from CSS and the preset. `HUES` is
deleted.

**Files:**

- Create: `packages/graph/src/layout/constants.ts`, `packages/graph/src/layout/types.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/layout-types.ts` in full (71 lines).

- [ ] **Step 2: Create the constants**

`packages/graph/src/layout/constants.ts` — values copied **unchanged** from the source so the
ported characterization tests keep passing:

```ts
/* Geometry constants for card and cluster layout. Values are carried over from
   dbd's layout-types.ts unchanged — the ported characterization specs pin exact
   pixel output, so changing any of these is a visible behaviour change. */

export const CARD_W = 248
export const ROW_H = 24
export const HEAD_H = 40
export const MORE_H = 22
export const PAD_B = 6

export const GAP_X = 36
export const GAP_Y = 30

export const CL_PAD = 26
export const CL_TITLE = 16
export const CL_GAP_X = 110
export const CL_GAP_Y = 110

export const MAX_ROW_W = 2750
```

- [ ] **Step 3: Create the layout types**

`packages/graph/src/layout/types.ts`:

```ts
import type { GraphModel, GraphNode, GraphRow } from '../types.ts'

/** How much of each node's row list a card shows. */
export type Density = 'names' | 'keys' | 'full'

/** Cluster and in-cluster ordering strategy. */
export type Arrange = 'untangle' | 'a-z'

export type EdgeStyle = 'curved' | 'orthogonal'

/** A positioned node card. */
export type Card = {
  node: GraphNode
  /** The rows this card shows at the current density. */
  vis: GraphRow[]
  /** Count of rows hidden by the density. */
  more: number
  w: number
  h: number
  x: number
  y: number
  /**
   * Position of the card's group in the sorted group list. Replaces dbd's
   * `hue` — colour now comes from CSS plus the preset, never from a
   * hardcoded oklch angle baked into the layout.
   */
  groupIndex?: number
}

export type Cluster = {
  name: string
  list: GraphNode[]
  count: number
  groupIndex: number
  x: number
  y: number
  w?: number
  h?: number
  pos?: { key: string; dx: number; dy: number }[]
}

export type RoutedEdge = {
  i: number
  /** GraphEdge.id */
  id: string
  fromKey: string
  toKey: string
  kind: GraphModel['edges'][number]['kind']
  self: boolean
  x1: number
  y1: number
  x2: number
  y2: number
  /** 1 = right side of the card, -1 = left. */
  s1: number
  s2: number
}

export type Cards = Record<string, Card>
export type Size = { w: number; h: number }

export type LayoutOptions = {
  density?: Density
  arrange?: Arrange
  edgeStyle?: EdgeStyle
  /** `neighborhood` only — the node the view centres on. */
  focus?: string | null
}

export type LayoutResult = {
  clusters: Cluster[]
  cards: Cards
  edges: RoutedEdge[]
  size: Size
}

/**
 * A layout is a pure function of the model and its options. DOM-free,
 * synchronous, deterministic: card heights come from row counts, nothing is
 * measured. That is what makes layouts unit-testable to exact pixels.
 */
export type LayoutFn = (model: GraphModel, options: LayoutOptions) => LayoutResult
```

- [ ] **Step 4: Verify it type-checks**

Run: `cd packages/graph && bun run check:types`
Expected: no output (success).

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/layout/constants.ts packages/graph/src/layout/types.ts
git commit -m "feat(graph): layout types + geometry constants

Constants carried over unchanged so the ported characterization specs keep
pinning exact pixel output.

One deliberate change: Cluster.hue (an oklch angle) becomes groupIndex (a
position). Colour is CSS's job now, so the layout has no business baking a
hue into its output. HUES is deleted."
```

---

## Task 7: `buildCards`

**Files:**

- Create: `packages/graph/src/layout/cards.ts`, `packages/graph/spec/layout/cards.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/layout/cards.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildCards } from '../../src/layout/cards.ts'
import { CARD_W, HEAD_H, MORE_H, PAD_B, ROW_H } from '../../src/layout/constants.ts'
import type { GraphNode, GraphRow } from '../../src/types.ts'

function row(name: string, badges: GraphRow['badges'] = []): GraphRow {
  return { name, type: 'text', badges }
}

function node(id: string, rows: GraphRow[]): GraphNode {
  return { id, label: id, rows, meta: {} }
}

describe('buildCards', () => {
  it('shows no rows at density names — the card is head-only', () => {
    const cards = buildCards([node('a', [row('id'), row('x')])], 'names')

    expect(cards.a.vis).toEqual([])
    expect(cards.a.more).toBe(2)
    expect(cards.a.h).toBe(HEAD_H + MORE_H + PAD_B)
  })

  it('shows only pk and fk rows at density keys', () => {
    const rows = [row('id', ['pk']), row('name'), row('owner', ['fk'])]
    const cards = buildCards([node('a', rows)], 'keys')

    expect(cards.a.vis.map((r) => r.name)).toEqual(['id', 'owner'])
    expect(cards.a.more).toBe(1)
  })

  it('shows all rows at density full', () => {
    const cards = buildCards([node('a', [row('id'), row('x')])], 'full')

    expect(cards.a.vis.map((r) => r.name)).toEqual(['id', 'x'])
    expect(cards.a.more).toBe(0)
  })

  it('caps density full at 14 rows', () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))
    const cards = buildCards([node('a', rows)], 'full')

    expect(cards.a.vis).toHaveLength(14)
    expect(cards.a.more).toBe(6)
  })

  it('caps density keys at 8 rows', () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(`c${i}`, ['pk']))
    const cards = buildCards([node('a', rows)], 'keys')

    expect(cards.a.vis).toHaveLength(8)
    expect(cards.a.more).toBe(4)
  })

  it('derives height from visible rows plus the more-row', () => {
    const cards = buildCards([node('a', [row('id'), row('x'), row('y')])], 'full')

    expect(cards.a.h).toBe(HEAD_H + 3 * ROW_H + PAD_B)
  })

  it('omits the bottom pad when a card has neither rows nor a more-row', () => {
    const cards = buildCards([node('a', [])], 'full')

    expect(cards.a.h).toBe(HEAD_H)
    expect(cards.a.more).toBe(0)
  })

  it('gives every card the fixed card width and a zero origin', () => {
    const cards = buildCards([node('a', [])], 'full')

    expect(cards.a).toMatchObject({ w: CARD_W, x: 0, y: 0 })
  })

  it('keys cards by node id', () => {
    const cards = buildCards([node('public.users', []), node('public.orders', [])], 'full')

    expect(Object.keys(cards).sort()).toEqual(['public.orders', 'public.users'])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/layout/cards.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/layout/cards.ts`:

```ts
import { CARD_W, HEAD_H, MORE_H, PAD_B, ROW_H } from './constants.ts'
import type { Cards, Density } from './types.ts'
import type { GraphNode, GraphRow } from '../types.ts'

/** The rows a card shows at the given density (none at 'names'). */
function visibleRows(node: GraphNode, density: Density): GraphRow[] {
  if (density === 'names') return []

  const rows =
    density === 'keys'
      ? node.rows.filter((r) => r.badges.includes('pk') || r.badges.includes('fk'))
      : node.rows

  return rows.slice(0, density === 'full' ? 14 : 8)
}

/** Build a card per node. Height is derived from row count — nothing is measured. */
export function buildCards(nodes: GraphNode[], density: Density): Cards {
  const cards: Cards = {}

  for (const node of nodes) {
    const vis = visibleRows(node, density)
    const more = node.rows.length - vis.length
    const h =
      HEAD_H + vis.length * ROW_H + (more > 0 ? MORE_H : 0) + (vis.length || more > 0 ? PAD_B : 0)

    cards[node.id] = { node, vis, more, w: CARD_W, h, x: 0, y: 0 }
  }

  return cards
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 9 `buildCards` tests.

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/layout/cards.ts packages/graph/spec/layout/cards.spec.ts
git commit -m "feat(graph): buildCards — density-driven card sizing

Ported from dbd's layout-cards.ts against canonical rows. The density caps
(14 full / 8 keys) and the height formula are carried over unchanged."
```

---

## Task 8: Cluster building, ordering, packing, flow

The big one. Port `layout-clusters.ts` **and** its 192-line characterization suite.

**Files:**

- Create: `packages/graph/src/layout/clusters.ts`, `packages/graph/spec/layout/clusters.spec.ts`

- [ ] **Step 1: Read both sources in full**

Read `~/Developer/dbd/site/src/lib/design/layout-clusters.ts` (162 lines) and
`layout-clusters.test.ts` (192 lines).

- [ ] **Step 2: Port the test suite**

Create `packages/graph/spec/layout/clusters.spec.ts`. Apply exactly these transformations to
the source test file, changing **nothing else** — every numeric assertion stays:

| Source                                       | Becomes                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| `import … from './layout-clusters'`          | `import … from '../../src/layout/clusters.ts'`        |
| `groupBySchema`                              | `groupByGroup`                                        |
| `LayoutData` fixtures (`{ tables, refs }`)   | a `GraphModel` from `normalizeGraph(...)`             |
| `table('a','t2')` helper                     | `node('a.t2', 'a', 't2')` returning a `GraphNode`     |
| `makeCard(x,y,w,h)` helper                   | same shape, but `node:` instead of `t:` and `vis: []` |
| `refs: [{ from: { s,t,c }, to: { s,t,c } }]` | canonical `GraphEdge` objects                         |
| `nbrs['a.x']` is `string[]`                  | `buildAdjacency(edges).get('a.x')` is a `string[]`    |
| `expect(clusters[0].hue).toBe(HUES[0])`      | `expect(clusters[0].groupIndex).toBe(0)`              |
| `import { HUES }`                            | **deleted**                                           |

**Keep the `describe('buildAdjacency')` block pointed at `buildAdjacency`.** It must call
`clusters.ts`'s own `buildAdjacency(edges)` and assert on its return value — **not**
`model.neighbors`, which is a different function in a different file built for a different
question. `cluster.ts` calls `buildAdjacency`, so redirecting its test leaves the function that
actually runs untested, including its self-edge skip.

- [ ] **Step 2b: Add the two cases the source suite is blind to**

The source's 192 lines contain no fixture that repeats a from/to pair, so nothing in it pins the
duplicate-weighting that `barycenter` depends on. Add these — they are new coverage, not a port:

```ts
describe('buildAdjacency — multiplicity', () => {
  it('records a neighbour once per edge, so a doubly-linked pair appears twice', () => {
    // barycenter divides by the ARRAY LENGTH, so this duplicate is what makes a
    // twice-referenced neighbour pull twice as hard. De-duplicating changes the layout.
    const edges = [edge('a.x', 'b.y'), edge('a.x', 'b.y')]

    expect(buildAdjacency(edges).get('a.x')).toEqual(['b.y', 'b.y'])
  })

  it('skips a self-edge', () => {
    expect(buildAdjacency([edge('a.x', 'a.x')]).get('a.x')).toBeUndefined()
  })
})

describe('barycenterPasses — multiplicity weighting', () => {
  it('pulls a table further toward a neighbour it references twice', () => {
    const cards: Cards = {
      's.t': makeCard(0, 0, 248, 100),
      's.hi': makeCard(0, 470, 248, 100),
      's.lo': makeCard(0, 0, 248, 60)
    }
    const twice = buildAdjacency([edge('s.t', 's.hi'), edge('s.t', 's.hi'), edge('s.t', 's.lo')])
    const once = buildAdjacency([edge('s.t', 's.hi'), edge('s.t', 's.lo')])

    // (520 + 520 + 30) / 3 ≈ 356.67 vs (520 + 30) / 2 = 275 — a real divergence, and the
    // one a Set-based adjacency map would silently erase.
    expect(twice.get('s.t')).toHaveLength(3)
    expect(once.get('s.t')).toHaveLength(2)
  })
})
```

The new fixture helpers to put at the top of the ported file:

```ts
import { describe, it, expect } from 'vitest'
import {
  barycenterPasses,
  buildAdjacency,
  buildClusters,
  flow,
  groupByGroup,
  orderClusters,
  pack
} from '../../src/layout/clusters.ts'
import type { Card, Cards, Cluster } from '../../src/layout/types.ts'
import type { GraphEdge, GraphNode } from '../../src/types.ts'

function node(id: string, group: string, label: string): GraphNode {
  return { id, label, group, rows: [], meta: {} }
}

function makeCard(x: number, y: number, w: number, h: number): Card {
  return { node: node('s.t', 's', 't'), vis: [], more: 0, w, h, x, y }
}

function edge(source: string, target: string): GraphEdge {
  return { id: `${source}->${target}`, source, target, kind: 'reference' }
}
```

- [ ] **Step 3: Run the ported suite to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/layout/clusters.ts'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/layout/clusters.ts` by porting `layout-clusters.ts` with these
changes and no others:

1. `LayoutData` → `GraphNode[]` plus `GraphEdge[]`.
2. `t.schema` → `node.group ?? ''`; `r.from.s + '.' + r.from.t` → `edge.source`;
   `r.to.s + '.' + r.to.t` → `edge.target`.
3. `c.name + '.' + t.name` (the card key) → `node.id`. The cluster no longer rebuilds keys
   from parts — ids come from the normalizer.
4. `hue: HUES[i % HUES.length]` → `groupIndex: i`.
5. `card.hue = c.hue` in `placeCluster` → `card.groupIndex = c.groupIndex`.
6. `groupBySchema` → `groupByGroup`, keyed on `node.group ?? ''`.
7. `buildAdjacency(data)` → `buildAdjacency(edges: GraphEdge[])`, returning
   **`Map<string, string[]>`** — an array per key, **not a `Set`**. See the warning below.

Keep the exported surface, the JSDoc, the `ncols` formula
(`Math.max(1, Math.min(6, Math.round(Math.sqrt(n * 1.15))))`), the two barycenter iterations,
and the `+60` canvas margin exactly as they are.

> ### Do NOT de-duplicate the adjacency list
>
> The source pushes once per ref (`layout-clusters.ts:27-28`), so two refs between the same
> table pair put the neighbour in the list **twice**. `barycenter` then divides by `ns.length`
> (`:141-143`), so that neighbour is **weighted 2×** — it pulls the table twice as hard.
>
> This is not incidental. Two FKs to the same table is routine (`orders.created_by` and
> `orders.approved_by` both → `users.id`). Converting to a `Set` changes the averaged score and
> therefore `reorderTowardNeighbors`' sort order and final card positions. Worked example with
> the ported suite's own fixtures (`anchor.hi` centre y=520, `anchor.lo` y=30): a table linked
> twice to `hi` and once to `lo` scores `(520+520+30)/3 ≈ 356.67` with arrays, `(520+30)/2 = 275`
> with a Set.
>
> **The characterization suite cannot catch this** — no fixture in its 192 lines repeats a
> from/to pair. So a `Set` here would pass every ported assertion while silently changing the
> layout of every real multi-FK schema, and the commit message claiming the port is
> behaviour-preserving would be false.
>
> `GraphModel.neighbors` is a `Set` and stays one: it answers "is X related to Y", where
> multiplicity is meaningless. `buildAdjacency` answers "how strongly is X pulled toward Y",
> where multiplicity is the whole point. They are different questions — keep both, and do not
> collapse `cluster.ts` onto `model.neighbors` to save a function.

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — every ported assertion green with its original numbers. **If a numeric
assertion fails, the port changed behaviour — fix the port, do not rebaseline the test.**

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/layout/clusters.ts packages/graph/spec/layout/clusters.spec.ts
git commit -m "feat(graph): port cluster build/order/pack/flow

The characterization suite comes across with every numeric assertion intact —
only fixtures change shape (LayoutData -> GraphModel), so the suite still
proves the algorithm is behaviour-preserving across the model change.

hue -> groupIndex is the one assertion that moves, because colour left the
layout for CSS."
```

---

## Task 9: Edge routing

**Files:**

- Create: `packages/graph/src/layout/edges.ts`, `packages/graph/spec/layout/edges.spec.ts`

- [ ] **Step 1: Read both sources in full**

Read `~/Developer/dbd/site/src/lib/design/layout-edges.ts` (82 lines) and
`layout-edges.test.ts` (152 lines).

- [ ] **Step 2: Port the test suite**

Create `packages/graph/spec/layout/edges.spec.ts`. Transformations — again, **every path
string and every coordinate stays exactly as written**:

| Source                                                              | Becomes                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `import … from './layout-edges'`                                    | `import … from '../../src/layout/edges.ts'`                                                             |
| `col(name)` returning `LayoutColumn`                                | `row(name)` returning `GraphRow` (`{ name, type: 'text', badges: [] }`)                                 |
| `makeCard(..., vis)` with `t:`                                      | same, with `node:`                                                                                      |
| `data: LayoutData` with `refs`                                      | a plain `GraphEdge[]` passed straight to `buildEdges`                                                   |
| `{ from: { s: 'a', t: 'x', c: 'id' }, to: {…} }`                    | `{ id: 'a.x->b.y', source: 'a.x', target: 'b.y', sourceRow: 'id', targetRow: 'id', kind: 'reference' }` |
| `base = { i: 0, ref: {} as Edge['ref'], fromKey: 'a', toKey: 'b' }` | `base = { i: 0, id: 'e', fromKey: 'a', toKey: 'b', kind: 'reference' as const }`                        |

Keep the test names. The `preserves the original refs index even when an earlier ref is
skipped` case is load-bearing — it pins that a skipped edge does not shift later indices.

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/layout/edges.ts'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/layout/edges.ts` by porting `layout-edges.ts` with these changes:

1. `buildEdges(data, cards)` → `buildEdges(edges: GraphEdge[], cards: Cards)`.
2. `cards[r.from.s + '.' + r.from.t]` → `cards[edge.source]`; likewise `edge.target`.
3. `anchorY(card, r.from.c)` → `anchorY(card, edge.sourceRow)`, with `sourceRow` optional —
   `undefined` falls through to the existing head-centre fallback (`card.y + HEAD_H / 2`),
   which is already what a non-matching column name did.
4. `card.vis.findIndex((c) => c.name === colName)` → unchanged; `vis` is now `GraphRow[]` and
   still has `.name`.
5. The returned object gains `id: edge.id` and `kind: edge.kind`; drops `ref`.

Keep `edgePath`, `orthogonalPath`, `curvedPath`, the self-loop `bow = 46`, the same-side
`bow = 64`, the `Math.max(46, Math.min(170, …))` clamp, the `+ 52` orthogonal sweep, the `50`px
side-gap threshold and the `+14` same-anchor nudge **exactly** as they are.

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — all ported assertions, including the seven exact SVG path strings.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/layout/edges.ts packages/graph/spec/layout/edges.spec.ts
git commit -m "feat(graph): port edge routing + path building

The seven exact SVG path-string assertions come across unchanged, so the
bezier and orthogonal geometry is provably identical after the model swap.

sourceRow/targetRow are optional now: an unset anchor falls through to the
head-centre fallback, which is what a non-matching column name already did."
```

---

## Task 10: The `cluster` layout

**Files:**

- Create: `packages/graph/src/layout/cluster.ts`, `packages/graph/spec/layout/cluster.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/layout/cluster.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cluster } from '../../src/layout/cluster.ts'
import { normalizeGraph } from '../../src/model/normalize.ts'

const FIELDS = {
  label: 'name',
  group: 'schema',
  rows: 'columns',
  source: 'from.t',
  target: 'to.t',
  sourceGroup: 'from.s',
  targetGroup: 'to.s',
  sourceRow: 'from.c',
  targetRow: 'to.c'
}

const NODES = [
  { schema: 'public', name: 'users', columns: [{ name: 'id', type: 'uuid' }] },
  { schema: 'public', name: 'orders', columns: [{ name: 'user_id', type: 'uuid' }] },
  { schema: 'audit', name: 'log', columns: [{ name: 'id', type: 'uuid' }] }
]

const EDGES = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const model = () => normalizeGraph(NODES, EDGES, FIELDS)

describe('cluster layout', () => {
  it('returns one cluster per group', () => {
    const result = cluster(model(), {})

    expect(result.clusters.map((c) => c.name).sort()).toEqual(['audit', 'public'])
  })

  it('returns a positioned card for every node', () => {
    const result = cluster(model(), {})

    expect(Object.keys(result.cards).sort()).toEqual(['audit.log', 'public.orders', 'public.users'])
  })

  it('routes every edge whose endpoints are laid out', () => {
    const result = cluster(model(), {})

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toMatchObject({ fromKey: 'public.orders', toKey: 'public.users' })
  })

  it('reports a canvas size large enough to contain every cluster', () => {
    const result = cluster(model(), {})

    for (const c of result.clusters) {
      expect(result.size.w).toBeGreaterThanOrEqual(c.x + (c.w ?? 0))
      expect(result.size.h).toBeGreaterThanOrEqual(c.y + (c.h ?? 0))
    }
  })

  it('defaults to density keys', () => {
    const result = cluster(model(), {})
    const explicit = cluster(model(), { density: 'keys' })

    expect(result.cards['public.users'].h).toBe(explicit.cards['public.users'].h)
  })

  it('produces taller cards at density full than at names', () => {
    const full = cluster(model(), { density: 'full' })
    const names = cluster(model(), { density: 'names' })

    expect(full.cards['public.users'].h).toBeGreaterThan(names.cards['public.users'].h)
  })

  it('is deterministic — same input, same output', () => {
    expect(cluster(model(), {})).toEqual(cluster(model(), {}))
  })

  it('assigns each card its cluster groupIndex', () => {
    const result = cluster(model(), {})

    // audit sorts before public, so audit is index 0.
    expect(result.cards['audit.log'].groupIndex).toBe(0)
    expect(result.cards['public.users'].groupIndex).toBe(1)
  })

  it('handles an empty model without throwing', () => {
    const result = cluster(normalizeGraph([], [], FIELDS), {})

    expect(result.clusters).toEqual([])
    expect(result.cards).toEqual({})
    expect(result.edges).toEqual([])
  })

  it('accepts arrange a-z as well as untangle', () => {
    expect(() => cluster(model(), { arrange: 'a-z' })).not.toThrow()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/layout/cluster.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/layout/cluster.ts`, porting `layout.ts`'s `compute` to the `LayoutFn`
signature:

```ts
import { buildCards } from './cards.ts'
import {
  barycenterPasses,
  buildAdjacency,
  buildClusters,
  flow,
  groupByGroup,
  orderClusters,
  pack
} from './clusters.ts'
import { buildEdges } from './edges.ts'
import type { LayoutFn, LayoutResult } from './types.ts'

/**
 * Deterministic cluster layout: groups become clusters, clusters are ordered to
 * reduce edge crossings, and each cluster's nodes are masonry-packed then flowed
 * into wrapping rows.
 *
 * `arrange: 'untangle'` (default) chains clusters by inter-group link weight and
 * reorders nodes inside each cluster with barycenter passes. `'a-z'` is plain
 * area-descending order with alphabetical lists.
 */
export const cluster: LayoutFn = (model, options): LayoutResult => {
  const density = options.density ?? 'keys'
  const arrange = options.arrange ?? 'untangle'

  const cards = buildCards(model.nodes, density)
  // NOT model.neighbors. That is a Set; barycenter needs the duplicate-preserving array so a
  // twice-referenced neighbour weighs twice. See Task 8's warning.
  const neighbors = buildAdjacency(model.edges)

  let clusters = buildClusters(groupByGroup(model.nodes))
  clusters.forEach((c) => pack(c, cards))
  clusters = orderClusters(clusters, model.edges, arrange)

  let size = flow(clusters, cards)
  if (arrange === 'untangle') size = barycenterPasses(clusters, cards, neighbors)

  return { clusters, cards, edges: buildEdges(model.edges, cards), size }
}
```

If `flow` throws on an empty cluster list (`Math.max(...[])` is `-Infinity`), guard it in
`clusters.ts` by returning `{ w: 0, h: 0 }` when `clusters.length === 0`, and add the
corresponding case to `clusters.spec.ts`.

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 10 `cluster layout` tests.

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/layout/cluster.ts packages/graph/spec/layout/cluster.spec.ts
git commit -m "feat(graph): the cluster LayoutFn

Ports layout.ts's compute to the (model, options) => LayoutResult signature.
Determinism is asserted directly, since every downstream spec depends on it."
```

---

## Task 11: The `neighborhood` layout

This is where `EntityDiagram.svelte`'s ~100 lines of duplicate geometry collapse into a second
`LayoutFn`. Two layouts behind one interface, rendered by one canvas.

**Files:**

- Create: `packages/graph/src/layout/neighborhood.ts`,
  `packages/graph/spec/layout/neighborhood.spec.ts`, `packages/graph/src/layout/index.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/EntityDiagram.svelte` (222 lines). Only the `$derived`
block `m` and its helpers (`buildCard`, `anchorY`, `find`) are geometry; everything from the
`{#snippet edCard}` onward is rendering and belongs to `Graph.svelte`.

- [ ] **Step 2: Write the failing test**

Create `packages/graph/spec/layout/neighborhood.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { neighborhood } from '../../src/layout/neighborhood.ts'
import { normalizeGraph } from '../../src/model/normalize.ts'

const FIELDS = {
  label: 'name',
  group: 'schema',
  rows: 'columns',
  rowBadges: { pk: 'pk' },
  source: 'from.t',
  target: 'to.t',
  sourceGroup: 'from.s',
  targetGroup: 'to.s',
  sourceRow: 'from.c',
  targetRow: 'to.c'
}

const NODES = [
  { schema: 'p', name: 'users', columns: [{ name: 'id', pk: true }, { name: 'email' }] },
  { schema: 'p', name: 'orders', columns: [{ name: 'id', pk: true }, { name: 'user_id' }] },
  { schema: 'p', name: 'profiles', columns: [{ name: 'id', pk: true }, { name: 'user_id' }] }
]

// orders -> users and profiles -> users: users is the target of both.
const EDGES = [
  { from: { s: 'p', t: 'orders', c: 'user_id' }, to: { s: 'p', t: 'users', c: 'id' } },
  { from: { s: 'p', t: 'profiles', c: 'user_id' }, to: { s: 'p', t: 'users', c: 'id' } }
]

const model = () => normalizeGraph(NODES, EDGES, FIELDS)

describe('neighborhood layout', () => {
  it('lays out the focus node and its direct neighbours only', () => {
    const result = neighborhood(model(), { focus: 'p.users' })

    expect(Object.keys(result.cards).sort()).toEqual(['p.orders', 'p.profiles', 'p.users'])
  })

  it('excludes a node that is not adjacent to the focus', () => {
    const detached = [
      ...NODES,
      { schema: 'p', name: 'settings', columns: [{ name: 'id', pk: true }] }
    ]
    const result = neighborhood(normalizeGraph(detached, EDGES, FIELDS), { focus: 'p.users' })

    expect(Object.keys(result.cards)).not.toContain('p.settings')
  })

  it('centres the focus node horizontally between the two neighbour columns', () => {
    const result = neighborhood(model(), { focus: 'p.users' })
    const focus = result.cards['p.users']
    const inbound = result.cards['p.orders']

    expect(focus.x).toBeGreaterThan(inbound.x)
  })

  it('puts nodes that reference the focus on the left', () => {
    const result = neighborhood(model(), { focus: 'p.users' })

    expect(result.cards['p.orders'].x).toBeLessThan(result.cards['p.users'].x)
    expect(result.cards['p.profiles'].x).toBeLessThan(result.cards['p.users'].x)
  })

  it('puts nodes the focus references on the right', () => {
    const result = neighborhood(model(), { focus: 'p.orders' })

    expect(result.cards['p.users'].x).toBeGreaterThan(result.cards['p.orders'].x)
  })

  it('stacks two same-side neighbours without overlapping', () => {
    const result = neighborhood(model(), { focus: 'p.users' })
    const a = result.cards['p.orders']
    const b = result.cards['p.profiles']
    const [upper, lower] = a.y <= b.y ? [a, b] : [b, a]

    expect(upper.y + upper.h).toBeLessThanOrEqual(lower.y)
  })

  it('routes one edge per reference touching the focus', () => {
    const result = neighborhood(model(), { focus: 'p.users' })

    expect(result.edges).toHaveLength(2)
  })

  it('reports no clusters — neighbourhood is ungrouped by design', () => {
    const result = neighborhood(model(), { focus: 'p.users' })

    expect(result.clusters).toEqual([])
  })

  it('lays out the focus alone when it has no neighbours', () => {
    const result = neighborhood(normalizeGraph(NODES, [], FIELDS), { focus: 'p.users' })

    expect(Object.keys(result.cards)).toEqual(['p.users'])
    expect(result.edges).toEqual([])
  })

  it('returns an empty result when the focus is unknown', () => {
    const result = neighborhood(model(), { focus: 'p.nope' })

    expect(result.cards).toEqual({})
    expect(result.edges).toEqual([])
  })

  it('returns an empty result when no focus is given', () => {
    const result = neighborhood(model(), {})

    expect(result.cards).toEqual({})
  })

  it('keeps a self-reference on the focus card', () => {
    const selfRef = [
      { from: { s: 'p', t: 'users', c: 'email' }, to: { s: 'p', t: 'users', c: 'id' } }
    ]
    const result = neighborhood(normalizeGraph(NODES, selfRef, FIELDS), { focus: 'p.users' })

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0].self).toBe(true)
  })

  it('shows a neighbour only its key and referenced rows, not every row', () => {
    const result = neighborhood(model(), { focus: 'p.users' })

    expect(result.cards['p.orders'].vis.map((r) => r.name).sort()).toEqual(['id', 'user_id'])
  })

  it('is deterministic', () => {
    expect(neighborhood(model(), { focus: 'p.users' })).toEqual(
      neighborhood(model(), { focus: 'p.users' })
    )
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/layout/neighborhood.ts'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/layout/neighborhood.ts`. Port `EntityDiagram.svelte`'s `m` block,
with these changes:

1. It reads `model.edges` instead of `model.refs`, and `options.focus` instead of the
   `entityKey` prop.
2. Card sizing reuses **`buildCards`** rather than a private `buildCard` — but the row caps
   differ from the cluster layout's, so they must be passed in, not inherited.

   `EntityDiagram.svelte:23-27` caps the **focus** card at **16** rows
   (`vis = t.columns.slice(0, 16)`) and each **neighbour** at **8** (pk plus the referenced
   columns). `buildCards`'s `visibleRows` hardcodes `density === 'full' ? 14 : 8`, so routing the
   focus card through `density: 'full'` silently caps it at **14** and hides two real columns
   behind "+2 more" on any 15- or 16-column table — common in practice.

   So **Task 7's `buildCards` gains an optional `limit` parameter** before this task uses it:

   ```ts
   export function buildCards(nodes: GraphNode[], density: Density, limit?: number): Cards
   ```

   `visibleRows` uses `limit ?? (density === 'full' ? 14 : 8)`, leaving the cluster layout's
   behaviour byte-identical (it passes no limit). `neighborhood` then calls
   `buildCards([focus], 'full', 16)` and `buildCards(neighbours, 'full', 8)` over rows
   pre-filtered to `badges.includes('pk') || referenced.has(row.name)`.

   Add to Task 7's spec, since the default must not move:

   ```ts
   it('caps at an explicit limit when one is given', () => {
     const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))

     expect(buildCards([node('a', rows)], 'full', 16).a.vis).toHaveLength(16)
   })

   it('keeps the 14-row default when no limit is given', () => {
     const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))

     expect(buildCards([node('a', rows)], 'full').a.vis).toHaveLength(14)
   })
   ```

   And to this task's spec, because the plan's own 2-column fixture cannot see the cap:

   ```ts
   it('shows all 16 rows of a 16-column focus node, matching dbd', () => {
     const wide = [
       {
         schema: 'p',
         name: 'wide',
         columns: Array.from({ length: 16 }, (_, i) => ({ name: `c${i}` }))
       }
     ]
     const result = neighborhood(normalizeGraph(wide, [], FIELDS), { focus: 'p.wide' })

     expect(result.cards['p.wide'].vis).toHaveLength(16)
     expect(result.cards['p.wide'].more).toBe(0)
   })
   ```

3. Its `COL_GAP: 170` and `GAP_Y: 26` are local to this layout; put them at the top of the file
   as `COL_GAP` and `STACK_GAP` with a comment saying they intentionally differ from
   `constants.ts`'s cluster gaps.
4. Edge geometry reuses **`buildEdges`** from `edges.ts`, called after the cards are positioned.
   Delete `EntityDiagram`'s private `anchorY`/`path`/`loopPath`.
5. Returns `clusters: []`.

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 14 `neighborhood layout` tests.

- [ ] **Step 6: Create the layout registry**

Create `packages/graph/src/layout/index.ts`:

```ts
import { cluster } from './cluster.ts'
import { neighborhood } from './neighborhood.ts'
import type { LayoutFn } from './types.ts'

/** Built-in layouts, addressable by name from `Graph`'s `layout` prop. */
export const layouts: Record<string, LayoutFn> = { cluster, neighborhood }

export type LayoutName = keyof typeof layouts

export { cluster, neighborhood }
export * from './types.ts'
```

- [ ] **Step 7: Commit**

```bash
git add packages/graph/src/layout/neighborhood.ts packages/graph/src/layout/index.ts packages/graph/spec/layout/neighborhood.spec.ts
git commit -m "feat(graph): neighborhood layout — EntityDiagram becomes a LayoutFn

EntityDiagram carried its own C constants, buildCard, anchorY and path: ~100
lines duplicating layout-cards and layout-edges with slightly different
numbers. Expressed as a LayoutFn it reuses both instead, so the duplication is
gone rather than ported.

Side benefit: slice 1 now validates the layout interface with TWO real
implementations instead of one plus a promise about d3-force."
```

---

## Task 12: `GraphState` — the store

**Every** derivation in the package lives here. After this task, no component computes anything.

Follow the house idiom — but read the RIGHT house, because the two candidates differ on the one
thing this task depends on:

| Read                                              | For                                                                                                                                                                          | Do **not** copy                                                                                                                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/chart/src/SparkState.svelte.js:174-185` | `update(config)` — reassigns **every** field unconditionally, and its doc comment states the contract: "re-callable… it must fully re-apply config rather than merge deltas" | —                                                                                                                                                                                |
| `packages/chart/src/PlotState.svelte.js:416-471`  | the class shape only: private `$state` fields, `$derived` getters, `constructor(config)`                                                                                     | **its `update()`.** It guards 15 fields with `if (config.X !== undefined)`, so an omitted key keeps its old value — that is merge-by-delta, the opposite of what this task needs |
| `packages/chart/src/Spark.svelte:60-80`           | `untrack(() => new State(config()))`, `setContext`, and the single `$effect(() => state.update(config()))`                                                                   | —                                                                                                                                                                                |

Copying `PlotState.update`'s guard pattern makes this task fail its own test
("fully re-applies on update rather than merging deltas"). `SparkState` is the model.

**Files:**

- Create: `packages/graph/src/GraphState.svelte.ts`, `packages/graph/spec/GraphState.spec.ts`
- Modify: `packages/graph/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/GraphState.spec.ts`. **No DOM anywhere in this file** — that is the
whole point of the layer.

```ts
import { describe, it, expect, vi } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.ts'
import { createGraphPreset } from '../src/preset.ts'

const FIELDS = {
  label: 'name',
  group: 'schema',
  kind: 'kind',
  rows: 'columns',
  rowBadges: { pk: 'pk' },
  source: 'from.t',
  target: 'to.t',
  sourceGroup: 'from.s',
  targetGroup: 'to.s',
  sourceRow: 'from.c',
  targetRow: 'to.c'
}

const NODES = [
  {
    schema: 'public',
    name: 'users',
    kind: 'table',
    noteMd: 'People',
    columns: [{ name: 'id', type: 'uuid', pk: true }]
  },
  { schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id', type: 'uuid' }] },
  { schema: 'audit', name: 'log', kind: 'table', columns: [{ name: 'id', type: 'uuid', pk: true }] }
]

const EDGES = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const make = (config = {}) =>
  new GraphState({ nodes: NODES, edges: EDGES, fields: FIELDS, ...config })

describe('GraphState — model', () => {
  it('normalizes nodes and edges on construction', () => {
    const state = make()

    expect(state.model.nodes).toHaveLength(3)
    expect(state.model.edges).toHaveLength(1)
  })

  it('exposes the node ids it laid out', () => {
    expect(Object.keys(make().cards).sort()).toEqual(['audit.log', 'public.orders', 'public.users'])
  })

  it('re-normalizes when nodes change through update', () => {
    const state = make()
    state.update({ nodes: [NODES[0]], edges: [], fields: FIELDS })

    expect(state.model.nodes).toHaveLength(1)
  })

  // update() follows SparkState (unconditional reassign), NOT PlotState (which guards 15
  // fields with `if (config.X !== undefined)` and therefore merges). EVERY field gets its own
  // revert case: a lone `density` assertion passes against an implementation that merged the
  // other nine — which is exactly the PlotState pattern an implementer might copy.
  it.each([
    ['density', { density: 'full' }, (s) => s.density, 'keys'],
    ['arrange', { arrange: 'a-z' }, (s) => s.arrange, 'untangle'],
    ['edgeStyle', { edgeStyle: 'orthogonal' }, (s) => s.edgeStyle, 'curved'],
    ['mode', { mode: 'dark' }, (s) => s.mode, 'light'],
    ['layout', { layout: 'neighborhood' }, (s) => s.layoutName, 'cluster']
  ])('update() reverts %s to its default when the key is omitted', (_n, seed, read, expected) => {
    const state = make(seed)
    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

    expect(read(state)).toBe(expected)
  })

  it('update() reverts preset to the default when omitted', () => {
    const state = make({ preset: createGraphPreset({ using: 'pattern' }) })
    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

    expect(state.groupStyle('public')).toHaveProperty('--group-fill')
  })

  it('update() reverts label to the data-derived name when omitted', () => {
    const state = make({ label: 'Custom' })
    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

    expect(state.label).not.toBe('Custom')
  })

  it('update() reverts focus when omitted', () => {
    const state = make({ layout: 'neighborhood', focus: 'public.users' })
    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS, layout: 'neighborhood' })

    expect(state.cards).toEqual({})
  })

  it('update() drops onselect when omitted', () => {
    const onselect = vi.fn()
    const state = make({ onselect })
    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })
    state.select('public.users')

    expect(onselect).not.toHaveBeenCalled()
  })

  it('update() does NOT reset value — it is input and output both', () => {
    // The documented exception. An unconditional reset would wipe a selection the user
    // just made, on every re-render.
    const state = make()
    state.select('public.users')
    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

    expect(state.value).toBe('public.users')
  })
})

describe('GraphState — layout', () => {
  it('defaults to the cluster layout', () => {
    expect(
      make()
        .clusters.map((c) => c.name)
        .sort()
    ).toEqual(['audit', 'public'])
  })

  it('resolves a layout named as a string', () => {
    const state = make({ layout: 'neighborhood', focus: 'public.users' })

    expect(state.clusters).toEqual([])
  })

  it('accepts a LayoutFn directly', () => {
    const state = make({
      layout: () => ({ clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } })
    })

    expect(state.cards).toEqual({})
  })

  it('falls back to cluster for an unknown layout name', () => {
    expect(make({ layout: 'nope' }).clusters).toHaveLength(2)
  })

  it('recomputes the layout when density changes', () => {
    const state = make({ density: 'names' })
    const short = state.cards['public.users'].h

    state.update({ nodes: NODES, edges: EDGES, fields: FIELDS, density: 'full' })
    expect(state.cards['public.users'].h).toBeGreaterThan(short)
  })

  it('exposes the canvas size', () => {
    expect(make().size.w).toBeGreaterThan(0)
  })

  it('exposes routed edges', () => {
    expect(make().routedEdges).toHaveLength(1)
  })

  it('builds an SVG path per edge at the configured edge style', () => {
    const curved = make({ edgeStyle: 'curved' })
    const orthogonal = make({ edgeStyle: 'orthogonal' })

    expect(curved.edgePath(curved.routedEdges[0])).not.toBe(
      orthogonal.edgePath(orthogonal.routedEdges[0])
    )
  })
})

describe('GraphState — group styles', () => {
  it('resolves a style per group', () => {
    const state = make()

    expect(state.groupStyle('public')).toHaveProperty('--group-fill')
    expect(state.groupStyle('audit')).toHaveProperty('--group-fill')
  })

  it('gives two groups different fills', () => {
    const state = make()

    expect(state.groupStyle('public')['--group-fill']).not.toBe(
      state.groupStyle('audit')['--group-fill']
    )
  })

  it('returns an empty style object for an unknown group', () => {
    expect(make().groupStyle('nope')).toEqual({})
  })

  it('switches to patterns when the preset says using: pattern', () => {
    const state = make({ preset: createGraphPreset({ using: 'pattern' }) })

    expect(state.groupStyle('public')).toHaveProperty('--group-pattern')
  })

  it('picks dark-mode shades when mode is dark', () => {
    const light = make({ mode: 'light' }).groupStyle('public')
    const dark = make({ mode: 'dark' }).groupStyle('public')

    expect(light['--group-fill']).not.toBe(dark['--group-fill'])
  })
})

describe('GraphState — selection', () => {
  it('starts with nothing selected', () => {
    expect(make().value).toBeNull()
  })

  it('select() sets the value', () => {
    const state = make()
    state.select('public.users')

    expect(state.value).toBe('public.users')
  })

  it('clear() unsets it', () => {
    const state = make()
    state.select('public.users')
    state.clear()

    expect(state.value).toBeNull()
  })

  it('calls onselect when select() runs', () => {
    const onselect = vi.fn()
    make({ onselect }).select('public.users')

    expect(onselect).toHaveBeenCalledWith('public.users')
  })

  it('reports related node ids for the selection', () => {
    const state = make()
    state.select('public.users')

    expect([...state.related]).toEqual(['public.orders'])
  })

  it('reports an empty related set with nothing selected', () => {
    expect(make().related.size).toBe(0)
  })

  it('nodeState returns null with nothing selected', () => {
    expect(make().nodeState('public.users')).toBeNull()
  })

  it('nodeState marks the selection, its neighbours, and everything else', () => {
    const state = make()
    state.select('public.users')

    expect(state.nodeState('public.users')).toBe('selected')
    expect(state.nodeState('public.orders')).toBe('related')
    expect(state.nodeState('audit.log')).toBe('dim')
  })

  it('edgeState returns null with nothing selected', () => {
    const state = make()

    expect(state.edgeState(state.routedEdges[0])).toBeNull()
  })

  it('edgeState highlights an edge touching the selection', () => {
    const state = make()
    state.select('public.users')

    expect(state.edgeState(state.routedEdges[0])).toBe('highlight')
  })

  it('edgeState dims an edge that does not touch the selection', () => {
    const state = make()
    state.select('audit.log')

    expect(state.edgeState(state.routedEdges[0])).toBe('dim')
  })
})

describe('GraphState — entity derivations', () => {
  it('exposes one entity row per node, with row and ref counts', () => {
    const state = make()
    const users = state.entities.find((e) => e.id === 'public.users')

    expect(users).toMatchObject({
      label: 'users',
      group: 'public',
      kind: 'table',
      rowCount: 1,
      refCount: 1
    })
  })

  it('counts references in both directions', () => {
    const state = make()

    expect(state.entities.find((e) => e.id === 'public.orders')?.refCount).toBe(1)
  })

  it('reports zero refs for an unreferenced node', () => {
    expect(make().entities.find((e) => e.id === 'audit.log')?.refCount).toBe(0)
  })

  it('exposes the focused entity', () => {
    const state = make()
    state.select('public.users')

    expect(state.entity?.label).toBe('users')
  })

  it('exposes no entity when nothing is selected', () => {
    expect(make().entity).toBeNull()
  })

  it('exposes no entity for an unknown id', () => {
    const state = make()
    state.select('public.ghost')

    expect(state.entity).toBeNull()
  })

  it('partitions relationships into inbound and outbound', () => {
    const state = make()
    state.select('public.users')

    expect(state.relationships).toEqual([
      {
        direction: 'in',
        id: 'public.orders',
        label: 'orders',
        group: 'public',
        edge: expect.anything()
      }
    ])
  })

  it('reports an outbound relationship from the other side', () => {
    const state = make()
    state.select('public.orders')

    expect(state.relationships[0].direction).toBe('out')
  })

  it('reports no relationships for an unconnected node', () => {
    const state = make()
    state.select('audit.log')

    expect(state.relationships).toEqual([])
  })

  it('reports relationships the ACTIVE LAYOUT did not place', () => {
    // `focus` and `value` are independent, so a neighbourhood layout centred elsewhere lays
    // out none of the selection's edges. Deriving relationships from the layout's edges would
    // make the state contradict itself — see the #relationships doc comment.
    const state = make({ layout: 'neighborhood', focus: 'audit.log' })
    state.select('public.orders')

    expect(state.relationships).toHaveLength(1)
    expect(state.relationships[0].id).toBe('public.users')
  })

  it('never disagrees with refCount about whether a node has relationships', () => {
    const state = make({ layout: 'neighborhood', focus: 'audit.log' })

    for (const entity of state.entities) {
      state.select(entity.id)
      expect(state.relationships.length, entity.id).toBe(entity.refCount)
    }
  })

  it('omits routed geometry for an edge the layout did not place', () => {
    const state = make({ layout: 'neighborhood', focus: 'audit.log' })
    state.select('public.orders')

    expect(state.relationships[0].edge).toBeDefined()
    expect(state.relationships[0].routed).toBeUndefined()
  })

  it('attaches routed geometry when the layout did place the edge', () => {
    const state = make()
    state.select('public.orders')

    expect(state.relationships[0].routed).toBeDefined()
  })
})

describe('GraphState — accessible name', () => {
  it('uses an explicit label when given', () => {
    expect(make({ label: 'Schema diagram' }).label).toBe('Schema diagram')
  })

  it('derives a name from the data when no label is given', () => {
    const label = make().label

    expect(label).toContain('3')
    expect(label).toContain('1')
  })
})

describe('GraphState — edges', () => {
  it('handles an empty model without throwing', () => {
    const state = new GraphState({ nodes: [], edges: [], fields: FIELDS })

    expect(state.cards).toEqual({})
    expect(state.clusters).toEqual([])
    expect(state.entities).toEqual([])
    expect(state.label).toContain('0')
  })

  it('survives construction with no config at all', () => {
    expect(() => new GraphState()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../src/GraphState.svelte.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/GraphState.svelte.ts`. Shape — `#private $state` inputs, `$derived`
outputs, explicit getters, named methods for every transition:

```ts
import { SvelteSet } from 'svelte/reactivity'
import { normalizeGraph } from './model/normalize.ts'
import { layouts } from './layout/index.ts'
import { edgePath } from './layout/edges.ts'
import { defaultGraphPreset, resolveGroupStyles } from './preset.ts'
import type { GraphPreset } from './preset.ts'
import type {
  Arrange,
  Cards,
  Cluster,
  Density,
  EdgeStyle,
  LayoutFn,
  RoutedEdge
} from './layout/types.ts'
import type { GraphEdge, GraphFields, GraphModel, GraphNode } from './types.ts'

export type EntityRow = {
  id: string
  label: string
  group?: string
  kind?: string
  rowCount: number
  refCount: number
  note?: string
}

export type Relationship = {
  direction: 'in' | 'out'
  id: string
  label: string
  group?: string
  /** The canonical edge — always present. A relationship is a fact about the model. */
  edge: GraphEdge
  /** Routed geometry, present only when the ACTIVE layout placed this edge. */
  routed?: RoutedEdge
}

export type GraphStateConfig = {
  nodes?: unknown[]
  edges?: unknown[]
  fields?: GraphFields
  layout?: string | LayoutFn
  density?: Density
  arrange?: Arrange
  edgeStyle?: EdgeStyle
  focus?: string | null
  value?: string | null
  preset?: GraphPreset
  mode?: 'light' | 'dark'
  label?: string
  onselect?: (id: string) => void
}

/**
 * The store. Turns raw `nodes`/`edges`/`fields` into the reactive shape the visuals
 * render, and owns every transition.
 *
 * Components read from this and call its methods — they never compute. That is what
 * lets the geometry, badge derivation and selection logic be covered exhaustively
 * with no DOM, and lets the component specs assert only attributes.
 *
 * `update()` is re-callable and FULLY re-applies config rather than merging deltas,
 * matching `PlotState.update` — so a prop reverting to undefined actually reverts.
 */
export class GraphState {
  #nodes = $state<unknown[]>([])
  #edges = $state<unknown[]>([])
  #fields = $state<GraphFields>({})
  #layout = $state<string | LayoutFn>('cluster')
  #density = $state<Density>('keys')
  #arrange = $state<Arrange>('untangle')
  #edgeStyle = $state<EdgeStyle>('curved')
  #focus = $state<string | null>(null)
  #value = $state<string | null>(null)
  #preset = $state<GraphPreset>(defaultGraphPreset)
  #mode = $state<'light' | 'dark'>('light')
  #label = $state<string | undefined>(undefined)
  #onselect = $state<((id: string) => void) | undefined>(undefined)

  #model = $derived(normalizeGraph(this.#nodes, this.#edges, this.#fields))

  #layoutFn = $derived(
    typeof this.#layout === 'function' ? this.#layout : (layouts[this.#layout] ?? layouts.cluster)
  )

  #result = $derived(
    this.#layoutFn(this.#model, {
      density: this.#density,
      arrange: this.#arrange,
      edgeStyle: this.#edgeStyle,
      focus: this.#focus ?? this.#value
    })
  )

  #groups = $derived([
    ...new Set(this.#model.nodes.map((n) => n.group).filter(Boolean))
  ] as string[])

  #groupStyles = $derived(resolveGroupStyles(this.#groups, this.#mode, this.#preset))

  #related = $derived(
    this.#value
      ? new SvelteSet(this.#model.neighbors.get(this.#value) ?? [])
      : new SvelteSet<string>()
  )

  #entities = $derived(
    this.#model.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      group: node.group,
      kind: node.kind,
      rowCount: node.rows.length,
      refCount: this.#model.edges.filter((e) => e.source === node.id || e.target === node.id)
        .length,
      note: node.note
    }))
  )

  #entity = $derived(this.#value ? (this.#model.byId.get(this.#value) ?? null) : null)

  /**
   * Derived from `#model.edges` — the canonical, unfiltered model — NOT from `#result.edges`.
   *
   * A layout filters: `cluster` drops edges whose endpoints were not laid out, and
   * `neighborhood` lays out only the focus node's 1-hop neighbourhood. Since `focus` and
   * `value` are independent config fields, reading the layout's edges lets the state
   * contradict itself: with `focus: 'audit.log'` (no neighbours) and `value: 'public.orders'`,
   * `relationships` would be `[]` while `entities`' `refCount` for the same node is 1.
   *
   * Routed geometry is attached opportunistically — it exists only for edges the active layout
   * actually placed, so `edge` is optional on `Relationship`. A relationship is a fact about
   * the model; its geometry is a fact about the current view.
   */
  #relationships = $derived.by((): Relationship[] => {
    const id = this.#value
    if (!id) return []

    const routed = new Map(this.#result.edges.map((e) => [e.id, e]))

    const describe = (other: string, direction: 'in' | 'out', edge: GraphEdge): Relationship => {
      const node = this.#model.byId.get(other)
      return {
        direction,
        id: other,
        label: node?.label ?? other,
        group: node?.group,
        edge,
        routed: routed.get(edge.id)
      }
    }

    return this.#model.edges.flatMap((edge) => {
      if (edge.source === id && edge.target === id) return [describe(id, 'out', edge)]
      if (edge.target === id) return [describe(edge.source, 'in', edge)]
      if (edge.source === id) return [describe(edge.target, 'out', edge)]
      return []
    })
  })

  constructor(config: GraphStateConfig = {}) {
    this.update(config)
  }

  /** Fully re-applies config. Safe to call on every prop change. */
  update(config: GraphStateConfig = {}): void {
    this.#nodes = config.nodes ?? []
    this.#edges = config.edges ?? []
    this.#fields = config.fields ?? {}
    this.#layout = config.layout ?? 'cluster'
    this.#density = config.density ?? 'keys'
    this.#arrange = config.arrange ?? 'untangle'
    this.#edgeStyle = config.edgeStyle ?? 'curved'
    this.#focus = config.focus ?? null
    this.#preset = config.preset ?? defaultGraphPreset
    this.#mode = config.mode ?? 'light'
    this.#label = config.label
    this.#onselect = config.onselect
    // `value` is input AND output, so it is only adopted when the caller supplies
    // one — otherwise a re-render would wipe a selection the user just made.
    if (config.value !== undefined) this.#value = config.value
  }

  // ─── transitions ───────────────────────────────────────────────────────────
  select(id: string): void {
    this.#value = id
    this.#onselect?.(id)
  }

  clear(): void {
    this.#value = null
  }

  // ─── per-item lookups the templates need ───────────────────────────────────
  nodeState(id: string): 'selected' | 'related' | 'dim' | null {
    if (!this.#value) return null
    if (id === this.#value) return 'selected'
    return this.#related.has(id) ? 'related' : 'dim'
  }

  edgeState(edge: RoutedEdge): 'highlight' | 'dim' | null {
    if (!this.#value) return null
    return edge.fromKey === this.#value || edge.toKey === this.#value ? 'highlight' : 'dim'
  }

  edgePath(edge: RoutedEdge): string {
    return edgePath(edge, this.#edgeStyle)
  }

  groupStyle(group: string | undefined): Record<string, string> {
    return (group && this.#groupStyles.get(group)) || {}
  }

  // ─── reads ─────────────────────────────────────────────────────────────────
  get model(): GraphModel {
    return this.#model
  }
  get clusters(): Cluster[] {
    return this.#result.clusters
  }
  get cards(): Cards {
    return this.#result.cards
  }
  get routedEdges(): RoutedEdge[] {
    return this.#result.edges
  }
  get size() {
    return this.#result.size
  }
  get related(): SvelteSet<string> {
    return this.#related
  }
  get entities(): EntityRow[] {
    return this.#entities
  }
  get entity(): GraphNode | null {
    return this.#entity
  }
  get relationships(): Relationship[] {
    return this.#relationships
  }
  get density(): Density {
    return this.#density
  }
  get arrange(): Arrange {
    return this.#arrange
  }
  get edgeStyle(): EdgeStyle {
    return this.#edgeStyle
  }
  get mode(): 'light' | 'dark' {
    return this.#mode
  }
  /** The layout's registry key, or 'custom' when a LayoutFn was passed directly. */
  get layoutName(): string {
    return typeof this.#layout === 'string' ? this.#layout : 'custom'
  }
  get value(): string | null {
    return this.#value
  }
  get label(): string {
    return (
      this.#label ??
      `Diagram of ${this.#model.nodes.length} nodes and ${this.#model.edges.length} relationships`
    )
  }
}
```

Then add to `packages/graph/src/index.ts`:

```ts
export { GraphState } from './GraphState.svelte.ts'
export type { EntityRow, GraphStateConfig, Relationship } from './GraphState.svelte.ts'
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 38 `GraphState` tests, none of which render anything.

- [ ] **Step 5: Check types**

Run: `cd packages/graph && bun run check:types`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/GraphState.svelte.ts packages/graph/src/index.ts packages/graph/spec/GraphState.spec.ts
git commit -m "feat(graph): GraphState — every derivation in one store

Layer 2 of the ui-state-pattern, in the shape PlotState/SparkState already use:
private \$state inputs, \$derived outputs, explicit getters, named methods for
every transition. update() fully re-applies rather than merging deltas, matching
PlotState, so a prop reverting to undefined actually reverts.

38 tests and not one of them renders anything. Normalization, layout resolution,
group-style assignment, selection, node/edge state and the entity derivations are
all covered without a DOM, which leaves the component specs free to assert only
attributes.

One asymmetry worth noting: \`value\` is input AND output, so update() adopts it
only when the caller supplies one — otherwise a re-render would wipe a selection
the user just made."
```

---

## Task 13: The `Graph` canvas — presentation only

`Graph.svelte` renders what `GraphState` already computed and routes clicks back through its
methods. **It computes nothing.** No `cardState()` helper, no `edgeClass()` helper, no
normalization, no layout call — all of that moved to Task 12.

The spec here therefore asserts **only DOM and attributes**. Everything about _what_ the values
should be is already covered by `GraphState.spec.ts` with no DOM; duplicating it here would just
make the same assertion slower.

**Files:**

- Create: `packages/graph/src/Graph.svelte`, `packages/graph/spec/Graph.spec.ts`
- Modify: `packages/graph/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/Graph.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Graph from '../src/Graph.svelte'
import { GraphState } from '../src/GraphState.svelte.ts'

const FIELDS = {
  label: 'name',
  group: 'schema',
  kind: 'kind',
  rows: 'columns',
  rowBadges: { pk: 'pk' },
  source: 'from.t',
  target: 'to.t',
  sourceGroup: 'from.s',
  targetGroup: 'to.s',
  sourceRow: 'from.c',
  targetRow: 'to.c'
}

const NODES = [
  {
    schema: 'public',
    name: 'users',
    kind: 'table',
    columns: [{ name: 'id', type: 'uuid', pk: true }]
  },
  { schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id', type: 'uuid' }] },
  { schema: 'audit', name: 'log', kind: 'matview', columns: [] }
]

const EDGES = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

/** A second, geometrically distinct edge — needed to catch loop-variable bugs. */
const SECOND_EDGE = {
  from: { s: 'audit', t: 'log', c: 'actor' },
  to: { s: 'public', t: 'users', c: 'id' }
}

/** A state is the component's ONLY input — that is what makes this spec DOM-only. */
const state = (config = {}) =>
  new GraphState({ nodes: NODES, edges: EDGES, fields: FIELDS, ...config })

describe('Graph — structure', () => {
  it('renders one node element per laid-out card', () => {
    const { container } = render(Graph, { state: state() })

    expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(3)
  })

  it('renders one edge element per routed edge', () => {
    const { container } = render(Graph, { state: state() })

    expect(container.querySelectorAll('[data-graph-edge]')).toHaveLength(1)
  })

  it('renders one cluster element per cluster the state reports', () => {
    const { container } = render(Graph, { state: state() })

    expect(container.querySelectorAll('[data-graph-cluster]')).toHaveLength(2)
  })

  it('renders no clusters when the state reports none', () => {
    const { container } = render(Graph, {
      state: state({ layout: 'neighborhood', focus: 'public.users' })
    })

    expect(container.querySelectorAll('[data-graph-cluster]')).toHaveLength(0)
  })

  it('reuses the dotted canvas primitive instead of shipping its own', () => {
    // [data-graph-paper] already exists in @rokkit/themes; .dg-dots is deleted.
    const { container } = render(Graph, { state: state() })

    expect(container.querySelector('[data-graph-paper]')).not.toBeNull()
  })

  it('renders an empty canvas for an empty model', () => {
    const { container } = render(Graph, {
      state: new GraphState({ nodes: [], edges: [], fields: FIELDS })
    })

    expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(0)
    expect(container.querySelector('[data-graph-paper]')).not.toBeNull()
  })
})

describe('Graph — published attributes', () => {
  it('publishes each node kind as data-node-kind so CSS can colour it', () => {
    const { container } = render(Graph, { state: state() })
    const kinds = [...container.querySelectorAll('[data-graph-node]')].map((el) =>
      el.getAttribute('data-node-kind')
    )

    expect(kinds.sort()).toEqual(['matview', 'table', 'view'])
  })

  it('publishes the group name for attribute overrides', () => {
    const { container } = render(Graph, { state: state() })

    expect(container.querySelector('[data-node-group="public"]')).not.toBeNull()
  })

  it('publishes the edge kind', () => {
    const { container } = render(Graph, { state: state() })

    expect(container.querySelector('[data-graph-edge]')?.getAttribute('data-edge-kind')).toBe(
      'reference'
    )
  })

  it('marks a pk row with data-row-badge', () => {
    const { container } = render(Graph, { state: state({ density: 'full' }) })

    expect(container.querySelector('[data-row-badge="pk"]')).not.toBeNull()
  })

  it('marks a derived fk row with data-row-badge', () => {
    const { container } = render(Graph, { state: state({ density: 'full' }) })

    expect(container.querySelector('[data-row-badge="fk"]')).not.toBeNull()
  })

  it('renders a row element per visible row and none at density names', () => {
    const { container: full } = render(Graph, { state: state({ density: 'full' }) })
    const { container: names } = render(Graph, { state: state({ density: 'names' }) })

    expect(full.querySelectorAll('[data-graph-row]').length).toBeGreaterThan(0)
    expect(names.querySelectorAll('[data-graph-row]')).toHaveLength(0)
  })

  it('shows the hidden-row count when the density hides rows', () => {
    const { container } = render(Graph, { state: state({ density: 'names' }) })

    expect(container.querySelector('[data-graph-more]')?.textContent).toContain('1')
  })
})

describe('Graph — state reflected into the DOM', () => {
  it('reflects nodeState onto data-node-state', () => {
    const s = state()
    s.select('public.users')
    const { container } = render(Graph, { state: s })

    expect(container.querySelector('[data-node-state="selected"]')).not.toBeNull()
    expect(container.querySelector('[data-node-state="related"]')).not.toBeNull()
    expect(container.querySelector('[data-node-state="dim"]')).not.toBeNull()
  })

  it('reflects edgeState onto data-edge-state', () => {
    const s = state()
    s.select('public.users')
    const { container } = render(Graph, { state: s })

    expect(container.querySelector('[data-edge-state="highlight"]')).not.toBeNull()
  })

  it('spreads the state group style onto the cluster as custom properties', () => {
    const { container } = render(Graph, { state: state() })
    const cluster = container.querySelector('[data-graph-cluster]') as HTMLElement

    expect(cluster.style.getPropertyValue('--group-fill')).not.toBe('')
  })

  it('uses the state edge path for EACH edge, keyed by the loop variable', () => {
    // TWO edges on purpose. With one, `graph.edgePath(graph.routedEdges[0])` hardcoded in
    // place of the loop variable passes — there is nothing else in the array to disagree.
    const s = state({ edges: [...EDGES, SECOND_EDGE] })
    const { container } = render(Graph, { state: s })
    const rendered = [...container.querySelectorAll('[data-graph-edge] path')].map((p) =>
      p.getAttribute('d')
    )

    expect(rendered).toHaveLength(2)
    expect(new Set(rendered).size).toBe(2)
    expect(rendered).toEqual(s.routedEdges.map((e) => s.edgePath(e)))
  })
})

describe('Graph — intent routing', () => {
  it('routes a node click through state.select', () => {
    const s = state()
    const { container } = render(Graph, { state: s })

    ;(container.querySelector('[data-graph-node]') as HTMLElement).click()
    expect(s.value).not.toBeNull()
  })

  it('routes a canvas click through state.clear', () => {
    const s = state()
    s.select('public.users')
    const { container } = render(Graph, { state: s })

    ;(container.querySelector('[data-graph-paper]') as HTMLElement).click()
    expect(s.value).toBeNull()
  })
})

describe('Graph — accessibility and construction', () => {
  it('takes its accessible name from the state', () => {
    // Cycle 1 of the radar work shipped sparklines with no role/accessible name
    // and had to pay it back later. Not repeating that here.
    const { container } = render(Graph, { state: state({ label: 'Schema diagram' }) })

    expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Schema diagram'
    )
  })

  it('constructs its own state when given nodes/edges/fields instead', () => {
    // The common case stays a one-liner; passing a state is for composition and tests.
    const { container } = render(Graph, { nodes: NODES, edges: EDGES, fields: FIELDS })

    expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../src/Graph.svelte'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/Graph.svelte`, porting `DiagramView.svelte`'s **render only**.

**Props.** `state?: GraphState`, plus the config props (`nodes`, `edges`, `fields`, `layout`,
`density`, `arrange`, `edgeStyle`, `focus`, `value`, `preset`, `mode`, `label`, `onselect`,
`icons`). Follow the `Spark.svelte` idiom exactly — read it first:

```ts
const config = $derived(() => ({
  nodes,
  edges,
  fields,
  layout,
  density,
  arrange,
  edgeStyle,
  focus,
  value,
  preset,
  mode,
  label,
  onselect
}))

// untrack: the constructor's initial read must not become a dependency of the
// creating scope — mirrors Spark's `untrack(() => new SparkState(config()))`.
const own = untrack(() => new GraphState(config()))
const graph = $derived(state ?? own)

setContext('graph-state', graph)

// Only sync the state WE own. A caller-supplied state is theirs to drive.
$effect(() => {
  if (!state) own.update(config())
})
```

**The template reads, never computes.** Every value comes off `graph`:
`graph.clusters`, `graph.cards`, `graph.routedEdges`, `graph.size`, `graph.label`,
`graph.nodeState(id)`, `graph.edgeState(edge)`, `graph.edgePath(edge)`,
`graph.groupStyle(group)`. Clicks call `graph.select(id)` and `graph.clear()`.

**Attribute vocabulary** — every BEM class from the source becomes a data-attribute:

| `DiagramView.svelte`               | `Graph.svelte`                                                      |
| ---------------------------------- | ------------------------------------------------------------------- |
| `.dg-viewport` + `.dg-dots`        | root, with `data-graph-paper` (**do not** port `.dg-dots`)          |
| `.dg-world`                        | `data-graph-world`                                                  |
| `.dg-cluster`                      | `data-graph-cluster` + `data-node-group` + `data-graph-group-index` |
| `.dg-cluster-label`                | `data-graph-cluster-label`                                          |
| `.dg-card`                         | `data-graph-node` + `data-node-kind` + `data-node-state`            |
| `.dg-card.sel/.rel/.dim`           | `data-node-state="selected\|related\|dim"`                          |
| `.dg-card.headonly`                | `data-node-headonly`                                                |
| `.dg-card-head` / `.dg-card-title` | `data-graph-node-head` / `data-graph-node-title`                    |
| `.dg-row` / `.dg-row.iskey`        | `data-graph-row` / `data-graph-row-key`                             |
| `.cname` / `.ctype`                | `data-graph-row-name` / `data-graph-row-type`                       |
| `.dg-more`                         | `data-graph-more`                                                   |
| `.dg-keyicon` / `.dg-fkicon`       | one element with `data-row-badge="pk\|fk\|uq"`                      |
| `g.dg-edge`                        | `data-graph-edge` + `data-edge-kind` + `data-edge-state`            |
| `.dot-from` / `.dot-to`            | `data-graph-edge-dot="from\|to"`                                    |
| `.tinted`                          | dropped — group colour is always on, via custom properties          |

Also:

1. **`--cl-h: {c.hue}` is gone.** Spread `graph.groupStyle(...)` onto the cluster and card
   elements instead.
2. **Icons are CSS classes, not a component.** Replace `<Icon name="table" size={13} />` with a
   `<span>` carrying an icon class keyed off `data-node-kind`, from an `icons` prop merged over a
   default — the `defaultIcons` + per-instance `icons` pattern already in `@rokkit/core`.
3. **Accessibility:** `role="img"`, `aria-label={graph.label}`, plus `<title>`/`<desc>`.
4. Keep `bind:clientWidth`/`bind:clientHeight` and the `scale`/`tx`/`ty` fit maths — these are
   genuinely view concerns (they depend on the rendered viewport, which state cannot know).
   Keep the source's comment explaining why it centres on content bounds rather than
   `layout.size`.
5. **No `data-path`** on the clickable node element — there is no navigator here, so a direct
   `onclick` is correct, but `data-path` would invite the double-handling the navigator note in
   `agents/memory.md` warns about.

Then add to `packages/graph/src/index.ts`:

```ts
export { default as Graph } from './Graph.svelte'
export { normalizeGraph } from './model/normalize.ts'
export { readPath } from './model/path.ts'
export { createGraphPreset, defaultGraphPreset, resolveGroupStyles } from './preset.ts'
export { cluster, neighborhood, layouts } from './layout/index.ts'
export type * from './types.ts'
export type * from './layout/types.ts'
export type { GraphChannel, GraphPreset, GraphShades } from './preset.ts'
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 20 `Graph` tests.

- [ ] **Step 5: Check types and svelte**

Run: `cd packages/graph && bun run check:types && bun run check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/Graph.svelte packages/graph/src/index.ts packages/graph/spec/Graph.spec.ts
git commit -m "feat(graph): Graph canvas — presentation only

Reads GraphState and renders it. No cardState/edgeClass helpers, no
normalization, no layout call — the component computes nothing, so its spec
asserts only DOM and attributes and the behaviour coverage stays in
GraphState.spec.ts where it needs no renderer.

Every BEM class from dbd's DiagramView becomes a data-attribute, so themes
target structure rather than implementation. --cl-h (a raw oklch hue angle) is
replaced by state-resolved custom properties, and the dotted background reuses
the existing [data-graph-paper] primitive rather than porting .dg-dots.

The fit maths (clientWidth/scale/tx/ty) deliberately STAYS in the component —
it depends on the rendered viewport, which state cannot know."
```

---

## Task 14: Note rendering

**Files:**

- Create: `packages/graph/src/schema/notes.ts`, `packages/graph/src/schema/NoteBlocks.svelte`,
  `packages/graph/spec/schema/notes.spec.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/md.ts` (50 lines).

- [ ] **Step 2: Write the failing test**

Create `packages/graph/spec/schema/notes.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { inlineSegs, noteBlocks } from '../../src/schema/notes.ts'

describe('inlineSegs', () => {
  it('returns a single plain segment for text with no code', () => {
    expect(inlineSegs('hello')).toEqual([{ code: false, text: 'hello' }])
  })

  it('splits a backtick span into a code segment', () => {
    expect(inlineSegs('use `id` here')).toEqual([
      { code: false, text: 'use ' },
      { code: true, text: 'id' },
      { code: false, text: ' here' }
    ])
  })

  it('handles a code span at the start', () => {
    expect(inlineSegs('`id` first')).toEqual([
      { code: true, text: 'id' },
      { code: false, text: ' first' }
    ])
  })

  it('handles two code spans', () => {
    expect(inlineSegs('`a` and `b`')).toEqual([
      { code: true, text: 'a' },
      { code: false, text: ' and ' },
      { code: true, text: 'b' }
    ])
  })

  it('returns an empty list for an empty string', () => {
    expect(inlineSegs('')).toEqual([])
  })
})

describe('noteBlocks', () => {
  it('returns an empty list for undefined', () => {
    expect(noteBlocks(undefined)).toEqual([])
  })

  it('returns an empty list for an empty string', () => {
    expect(noteBlocks('')).toEqual([])
  })

  it('joins consecutive lines into one paragraph', () => {
    expect(noteBlocks('one\ntwo')).toEqual([
      { type: 'p', lines: [[{ code: false, text: 'one two' }]] }
    ])
  })

  it('splits paragraphs on a blank line', () => {
    const blocks = noteBlocks('one\n\ntwo')

    expect(blocks).toHaveLength(2)
    expect(blocks.every((b) => b.type === 'p')).toBe(true)
  })

  it('collects dash bullets into one list block', () => {
    expect(noteBlocks('- a\n- b')).toEqual([
      { type: 'ul', lines: [[{ code: false, text: 'a' }], [{ code: false, text: 'b' }]] }
    ])
  })

  it('accepts a bullet character as well as a dash', () => {
    expect(noteBlocks('• a')[0].type).toBe('ul')
  })

  it('keeps a paragraph and a following list as separate blocks', () => {
    const blocks = noteBlocks('intro\n- a')

    expect(blocks.map((b) => b.type)).toEqual(['p', 'ul'])
  })

  it('parses inline code inside a bullet', () => {
    expect(noteBlocks('- use `id`')[0].lines[0]).toEqual([
      { code: false, text: 'use ' },
      { code: true, text: 'id' }
    ])
  })

  it('ignores leading and trailing blank lines', () => {
    expect(noteBlocks('\n\nonly\n\n')).toHaveLength(1)
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/schema/notes.ts'`.

- [ ] **Step 4: Implement**

Copy `md.ts` to `packages/graph/src/schema/notes.ts` **verbatim** — it is framework-free, has no
imports and needs no transformation. Only the header comment changes (drop the dbd reference).

Create `packages/graph/src/schema/NoteBlocks.svelte`, extracting the `segs` snippet that
`EntitiesView` and `EntityView` both inline today so the two format notes identically:

```svelte
<script lang="ts">
  import { noteBlocks } from './notes.ts'

  let { note }: { note?: string } = $props()

  const blocks = $derived(noteBlocks(note))
</script>

{#snippet segs(parts: ReturnType<typeof noteBlocks>[number]['lines'][number])}
  {#each parts as part (part.text)}
    {#if part.code}<code data-graph-note-code>{part.text}</code>{:else}{part.text}{/if}
  {/each}
{/snippet}

<div data-graph-note>
  {#each blocks as block (block)}
    {#if block.type === 'ul'}
      <ul data-graph-note-list>
        {#each block.lines as line (line)}
          <li>{@render segs(line)}</li>
        {/each}
      </ul>
    {:else}
      <p>{@render segs(block.lines[0])}</p>
    {/if}
  {/each}
</div>
```

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 15 note tests.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/schema/notes.ts packages/graph/src/schema/NoteBlocks.svelte packages/graph/spec/schema/notes.spec.ts
git commit -m "feat(graph): note rendering for DDL comments

notes.ts is md.ts verbatim — framework-free with no imports, so it needed no
transformation, only tests it never had.

NoteBlocks extracts the segs snippet that EntitiesView and EntityView each
inlined separately, which is what kept their formatting in sync by hand."
```

---

## Task 15: `fromSchemaModel`

Optional sugar for dbd. Proves the canonical model is reachable from dbd's JSON without dbd's
types entering the package.

**Files:**

- Create: `packages/graph/src/schema/fromSchemaModel.ts`,
  `packages/graph/spec/schema/fromSchemaModel.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/schema/fromSchemaModel.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { SCHEMA_FIELDS, fromSchemaModel } from '../../src/schema/fromSchemaModel.ts'

const MODEL = {
  project: { name: 'demo', db: 'postgres' },
  schemas: [{ name: 'public', tables: 2, enums: 0 }],
  tables: [
    {
      schema: 'public',
      name: 'users',
      kind: 'table',
      noteMd: 'People',
      columns: [{ name: 'id', type: 'uuid', pk: true, nn: true }]
    },
    {
      schema: 'public',
      name: 'orders',
      kind: 'table',
      columns: [{ name: 'user_id', type: 'uuid' }]
    }
  ],
  refs: [
    { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
  ]
}

describe('fromSchemaModel', () => {
  it('produces canonical node ids from schema and table name', () => {
    expect(fromSchemaModel(MODEL).nodes.map((n) => n.id)).toEqual(['public.users', 'public.orders'])
  })

  it('carries the table kind through', () => {
    expect(fromSchemaModel(MODEL).nodes[0].kind).toBe('table')
  })

  it('maps pk and nn flags to badges', () => {
    expect(fromSchemaModel(MODEL).nodes[0].rows[0].badges).toEqual(['pk', 'nn'])
  })

  it('derives fk on the referencing column', () => {
    const model = fromSchemaModel(MODEL)

    expect(model.byId.get('public.orders')?.rows[0].badges).toEqual(['fk'])
  })

  it('resolves refs to canonical edges', () => {
    expect(fromSchemaModel(MODEL).edges[0]).toMatchObject({
      source: 'public.orders',
      target: 'public.users',
      kind: 'reference'
    })
  })

  it('carries noteMd through as the node note', () => {
    expect(fromSchemaModel(MODEL).nodes[0].note).toBe('People')
  })

  it('exports the field map so a consumer can pass it to Graph directly', () => {
    expect(SCHEMA_FIELDS.source).toBe('from.t')
    expect(SCHEMA_FIELDS.target).toBe('to.t')
  })

  it('handles a model with no tables or refs', () => {
    const model = fromSchemaModel({ ...MODEL, tables: [], refs: [] })

    expect(model.nodes).toEqual([])
    expect(model.edges).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/schema/fromSchemaModel.ts'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/schema/fromSchemaModel.ts`:

```ts
import { normalizeGraph } from '../model/normalize.ts'
import type { GraphFields, GraphModel } from '../types.ts'

/**
 * Field map from a dbd `SchemaModel` to the canonical model.
 *
 * Exported so a consumer can hand it straight to `<Graph fields={SCHEMA_FIELDS}>`
 * and skip the transform entirely.
 *
 * Note what is NOT here: dbd's `SchemaModel` type. The package never imports it,
 * so the hand-written TS mirror of `schema_model.rs` stays dbd's concern and this
 * package is not a third definition to keep in step.
 */
export const SCHEMA_FIELDS: GraphFields = {
  label: 'name',
  group: 'schema',
  kind: 'kind',
  rows: 'columns',
  note: 'noteMd',
  rowName: 'name',
  rowType: 'type',
  rowNote: 'note',
  rowBadges: { pk: 'pk', uq: 'uq', nn: 'nn' },
  source: 'from.t',
  target: 'to.t',
  sourceGroup: 'from.s',
  targetGroup: 'to.s',
  sourceRow: 'from.c',
  targetRow: 'to.c',
  cardinality: 'cardinality',
  action: 'action'
}

/** Convenience wrapper over `normalizeGraph` for dbd-shaped schema JSON. */
export function fromSchemaModel(model: { tables: unknown[]; refs: unknown[] }): GraphModel {
  return normalizeGraph(model.tables, model.refs, SCHEMA_FIELDS)
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 8 `fromSchemaModel` tests.

- [ ] **Step 5: Commit**

```bash
git add packages/graph/src/schema/fromSchemaModel.ts packages/graph/spec/schema/fromSchemaModel.spec.ts
git commit -m "feat(graph): fromSchemaModel sugar for dbd-shaped JSON

Deliberately does NOT import dbd's SchemaModel type. The hand-written mirror of
schema_model.rs stays dbd's concern, so this package never becomes a third
definition to keep in step by hand — which was issue #159's top-listed risk."
```

---

## Task 16: `EntitiesView` — presentation only, on `@rokkit/ui` Table

Two changes from dbd's version, both structural:

1. It reads `state.entities` — the derived rows from Task 12. **No `refCount` loop in the
   component.** That derivation is already covered by `GraphState.spec.ts` with no DOM.
2. It composes `@rokkit/ui`'s `Table` instead of hand-rolling a `<table>` with `onclick` on each
   `<tr>` and no keyboard handler, which made dbd's rows mouse-only.

**Files:**

- Create: `packages/graph/src/schema/EntitiesView.svelte`,
  `packages/graph/spec/schema/EntitiesView.spec.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/EntitiesView.svelte` (80 lines). Its `refCount`
function and its `<table>` markup are both replaced, not ported — only the column set and the
note formatting carry over.

- [ ] **Step 2: Write the failing test**

Create `packages/graph/spec/schema/EntitiesView.spec.ts`. DOM only — the counts themselves are
`GraphState`'s tests, not this file's:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EntitiesView from '../../src/schema/EntitiesView.svelte'
import { GraphState } from '../../src/GraphState.svelte.ts'
import { SCHEMA_FIELDS } from '../../src/schema/fromSchemaModel.ts'

const TABLES = [
  {
    schema: 'public',
    name: 'users',
    kind: 'table',
    noteMd: 'People who sign in',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'email', type: 'text' }
    ]
  },
  { schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id', type: 'uuid' }] }
]

const REFS = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const state = (tables = TABLES, refs = REFS) =>
  new GraphState({ nodes: tables, edges: refs, fields: SCHEMA_FIELDS })

describe('EntitiesView', () => {
  it('renders a row per entity the state reports', () => {
    const { container } = render(EntitiesView, { state: state() })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(2)
  })

  it('shows each entity name', () => {
    const { getByText } = render(EntitiesView, { state: state() })

    expect(getByText('users')).toBeTruthy()
  })

  it('renders the row count the state derived', () => {
    const s = state()
    const { container } = render(EntitiesView, { state: s })
    const shown = [...container.querySelectorAll('[data-graph-entity-rows]')].map(
      (el) => el.textContent
    )

    expect(shown).toEqual(s.entities.map((e) => String(e.rowCount)))
  })

  it('renders the ref count the state derived', () => {
    const s = state()
    const { container } = render(EntitiesView, { state: s })
    const shown = [...container.querySelectorAll('[data-graph-entity-refs]')].map(
      (el) => el.textContent
    )

    expect(shown).toEqual(s.entities.map((e) => String(e.refCount)))
  })

  it('shows an em dash rather than a zero when an entity has no references', () => {
    const { container } = render(EntitiesView, { state: state(TABLES, []) })
    const shown = [...container.querySelectorAll('[data-graph-entity-refs]')].map(
      (el) => el.textContent
    )

    expect(shown).toEqual(['—', '—'])
  })

  it('renders the note as formatted blocks', () => {
    const { container } = render(EntitiesView, { state: state() })

    expect(container.querySelector('[data-graph-note]')?.textContent).toContain(
      'People who sign in'
    )
  })

  it('publishes the entity kind for theming', () => {
    const { container } = render(EntitiesView, { state: state() })
    const kinds = [...container.querySelectorAll('[data-graph-entity-row]')].map((el) =>
      el.getAttribute('data-node-kind')
    )

    expect(kinds.sort()).toEqual(['table', 'view'])
  })

  it('routes a row click through state.select', () => {
    const s = state()
    const { container } = render(EntitiesView, { state: s })

    ;(container.querySelector('[data-graph-entity-row]') as HTMLElement).click()
    expect(s.value).toBe('public.users')
  })

  it('reaches every row from the keyboard — the hand-rolled table could not', () => {
    const { container } = render(EntitiesView, { state: state() })
    const row = container.querySelector('[data-graph-entity-row]') as HTMLElement

    expect(row.tabIndex).toBeGreaterThanOrEqual(0)
  })

  it('renders an empty table for an empty model', () => {
    const { container } = render(EntitiesView, { state: state([], []) })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(0)
  })

  it('constructs its own state from raw props when given neither state nor context', () => {
    const { container } = render(EntitiesView, {
      nodes: TABLES,
      edges: REFS,
      fields: SCHEMA_FIELDS
    })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(2)
  })

  it('resolves the state from CONTEXT when no prop is given', () => {
    // The previous test exercises the self-construct fallback, not this. <Graph> publishes on
    // 'graph-state', so the context branch needs a real provider to be exercised at all —
    // otherwise the branch ships with no discriminating coverage under a name that claims it.
    const s = state()
    const { container } = render(EntitiesView, {
      context: new Map([['graph-state', s]])
    })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(2)
  })

  it('prefers the state PROP over context when both are present', () => {
    const fromProp = state()
    const fromContext = state([], [])
    const { container } = render(EntitiesView, {
      props: { state: fromProp },
      context: new Map([['graph-state', fromContext]])
    })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(2)
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/schema/EntitiesView.svelte'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/schema/EntitiesView.svelte`:

1. **Props:** `state?: GraphState`, plus `nodes`/`edges`/`fields` for standalone use. Resolve in
   this order: the `state` prop, then `getContext('graph-state')`, then a state it constructs
   itself — same three-way resolution `Graph.svelte` uses, so a view works inside a `<Graph>`,
   beside one, or alone.
2. **Compose `@rokkit/ui`'s `Table`** with columns Entity / Rows / Refs / Comment, fed
   `state.entities` directly. **Read `packages/ui/src/components/` for the current `Table` props
   before writing this** — use its per-column named snippets for the Entity cell (group prefix
   plus label) and the Comment cell (`<NoteBlocks note={entity.note} />`).
3. Each row carries `data-graph-entity-row` and `data-node-kind`; the numeric cells carry
   `data-graph-entity-rows` and `data-graph-entity-refs`. The em dash for a zero ref count is a
   **presentation** choice and belongs here — `state.entities` reports the number `0`.
4. **Selection goes through `Table`'s own mechanism**, calling `state.select(id)`. Keyboard
   activation then comes for free instead of being bolted onto a `<tr onclick>`.
5. **Token translation.** dbd's `text-faint` on the group prefix → **`ink-mute`**, not
   `ink-soft`: the row is interactive, and `ink-soft` cannot carry an interactive control's text.
   Also `bg-bg` → `paper`, `border-line-soft` → `paper-edge`, `hover:bg-paper-2` → `paper-mute`,
   `text-fg` → `ink`, `text-muted` → `ink-mute`, `text-accent-2` → `primary`.

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 11 `EntitiesView` tests.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/schema/EntitiesView.svelte packages/graph/spec/schema/EntitiesView.spec.ts
git commit -m "feat(graph): EntitiesView — reads state.entities, renders a ui Table

Two structural changes from dbd's version. The refCount loop is gone from the
component — it is a GraphState derivation now, covered without a DOM. And
composing @rokkit/ui's Table replaces a hand-rolled <table> with onclick on each
<tr> and no keyboard handler, which made dbd's rows mouse-only.

The em dash for a zero ref count stays HERE: state reports the number 0, and
how to display it is presentation.

Token fix carried in: the group prefix was text-faint (ink-soft) inside an
interactive row, which the ink-soft rule forbids. It is ink-mute now."
```

---

## Task 17: `EntityView` — presentation only

Reads `state.entity` and `state.relationships` from Task 12. **No relationship partitioning in
the component** — the in/out split is a `GraphState` derivation, already covered without a DOM.

**Files:**

- Create: `packages/graph/src/schema/EntityView.svelte`, `packages/graph/src/schema/index.ts`,
  `packages/graph/spec/schema/EntityView.spec.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/EntityView.svelte` (211 lines) in full. It is the
single-entity detail panel: header, note, column table with `pk`/`fk` badges, indexes, and the
relationship list. Its inbound/outbound partitioning loop does **not** port — that moved to
`GraphState.#relationships`.

- [ ] **Step 2: Write the failing test**

Create `packages/graph/spec/schema/EntityView.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EntityView from '../../src/schema/EntityView.svelte'
import { GraphState } from '../../src/GraphState.svelte.ts'
import { SCHEMA_FIELDS } from '../../src/schema/fromSchemaModel.ts'

const TABLES = [
  {
    schema: 'public',
    name: 'users',
    kind: 'table',
    noteMd: 'People who sign in',
    indexes: [{ def: 'btree(email)', unique: true, name: 'users_email_key' }],
    columns: [
      { name: 'id', type: 'uuid', pk: true, note: 'Primary key' },
      { name: 'email', type: 'text', nn: true }
    ]
  },
  {
    schema: 'public',
    name: 'orders',
    kind: 'table',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'user_id', type: 'uuid' }
    ]
  }
]

const REFS = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

/** Selection drives which entity is shown, so the fixture selects. */
function state(value: string | null = 'public.users', refs = REFS) {
  const s = new GraphState({ nodes: TABLES, edges: refs, fields: SCHEMA_FIELDS })
  if (value) s.select(value)
  return s
}

describe('EntityView', () => {
  it('shows the entity label and group', () => {
    const { getByText } = render(EntityView, { state: state() })

    expect(getByText('users')).toBeTruthy()
    expect(getByText(/public/)).toBeTruthy()
  })

  it('renders the entity note', () => {
    const { container } = render(EntityView, { state: state() })

    expect(container.querySelector('[data-graph-note]')?.textContent).toContain(
      'People who sign in'
    )
  })

  it('lists every row of the entity', () => {
    const { container } = render(EntityView, { state: state() })

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
  })

  it('badges the primary key', () => {
    const { container } = render(EntityView, { state: state() })

    expect(container.querySelector('[data-row-badge="pk"]')).not.toBeNull()
  })

  it('badges a derived foreign key on the referencing entity', () => {
    const { container } = render(EntityView, { state: state('public.orders') })

    expect(container.querySelector('[data-row-badge="fk"]')).not.toBeNull()
  })

  it('renders a per-row note when present', () => {
    const { getByText } = render(EntityView, { state: state() })

    expect(getByText('Primary key')).toBeTruthy()
  })

  it('lists indexes from the node meta passthrough', () => {
    const { container } = render(EntityView, { state: state() })

    expect(container.querySelectorAll('[data-graph-index]')).toHaveLength(1)
  })

  it('renders one element per relationship the state reports', () => {
    const s = state()
    const { container } = render(EntityView, { state: s })

    expect(container.querySelectorAll('[data-graph-relationship]')).toHaveLength(
      s.relationships.length
    )
  })

  it('reflects the relationship direction onto the attribute', () => {
    const { container } = render(EntityView, { state: state() })

    expect(
      container.querySelector('[data-graph-relationship]')?.getAttribute('data-graph-relationship')
    ).toBe('in')
  })

  it('reflects an outbound relationship from the other side', () => {
    const { container } = render(EntityView, { state: state('public.orders') })

    expect(container.querySelector('[data-graph-relationship="out"]')).not.toBeNull()
  })

  it('routes a relationship click through state.select', () => {
    const s = state()
    const { container } = render(EntityView, { state: s })

    ;(container.querySelector('[data-graph-relationship]') as HTMLElement).click()
    expect(s.value).toBe('public.orders')
  })

  it('publishes the entity kind for theming', () => {
    const { container } = render(EntityView, { state: state() })

    expect(container.querySelector('[data-node-kind="table"]')).not.toBeNull()
  })

  it('renders an empty state when nothing is selected', () => {
    const { container } = render(EntityView, { state: state(null) })

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(0)
  })

  it('renders an empty state when the selection names no known node', () => {
    const { container } = render(EntityView, { state: state('public.ghost') })

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(0)
  })

  it('says so when an entity has no relationships', () => {
    const { container } = render(EntityView, { state: state('public.users', []) })

    expect(container.querySelectorAll('[data-graph-relationship]')).toHaveLength(0)
    expect(container.querySelector('[data-graph-relationships-empty]')).not.toBeNull()
  })

  it('constructs its own state from raw props when given neither state nor context', () => {
    const { container } = render(EntityView, {
      nodes: TABLES,
      edges: REFS,
      fields: SCHEMA_FIELDS,
      value: 'public.users'
    })

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
  })

  it('resolves the state from CONTEXT when no prop is given', () => {
    // Exercises the middle branch of the three-way resolution, which the test above does not.
    const { container } = render(EntityView, {
      context: new Map([['graph-state', state()]])
    })

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/schema/EntityView.svelte'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/schema/EntityView.svelte`, porting the source's markup with:

1. **Props:** `state?: GraphState`, plus `nodes`/`edges`/`fields`/`value` for standalone use. Same
   three-way resolution as `EntitiesView` — prop, then `getContext('graph-state')`, then
   construct.
2. **Reads only.** `state.entity` for the header/note/rows/indexes, `state.relationships` for the
   list. Clicking a relationship calls `state.select(rel.id)`. No loops that derive anything.
3. **Attribute vocabulary:** `data-graph-entity`, `data-node-kind`, `data-graph-column`,
   `data-row-badge="pk|fk|uq"`, `data-graph-index`, `data-graph-relationship="in|out"`,
   `data-graph-relationships-empty`. The source's `col-badge.pk`/`col-badge.fk` classes become
   `data-row-badge` values.
4. Notes render through `<NoteBlocks />` — do **not** re-inline the `segs` snippet.
5. Indexes come from `state.entity.meta.indexes` when present — `GraphNode.meta` is exactly the
   passthrough for source fields the canonical model does not name.
6. **Token translation, same table as Task 16.** In particular any `--faint` on text inside a
   clickable relationship row becomes **`ink-mute`**.

Create `packages/graph/src/schema/index.ts`:

```ts
export { default as EntityView } from './EntityView.svelte'
export { default as EntitiesView } from './EntitiesView.svelte'
export { default as NoteBlocks } from './NoteBlocks.svelte'
export { SCHEMA_FIELDS, fromSchemaModel } from './fromSchemaModel.ts'
export { inlineSegs, noteBlocks } from './notes.ts'
export type { Block, Seg } from './notes.ts'
```

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 16 `EntityView` tests.

- [ ] **Step 6: Full gate**

Run: `bun run lint && bun run check:types && bun run check:svelte && bun run test:ci`
Expected: lint 0 errors 0 warnings; types 0; svelte 0; all tests pass.

- [ ] **Step 7: Verify the layer rule actually held**

The point of Task 12 was that components stop computing. Check it rather than assume it — but
these greps are a **triage aid, not a gate**. Two things a regex cannot do here: it cannot tell
`graph.edgePath(edge)` (required, a state call) from a component recomputing geometry itself, and
it cannot catch an expression-bodied arrow like
`{#each graph.entities.map((e) => e.rowCount + e.refCount) as total}` — a real derivation with no
brace after `=>`.

**Hard rule — a genuine gate, zero hits permitted:**

```bash
rg -n "normalizeGraph|buildCards|buildEdges|buildClusters|resolveGroupStyles|layouts\[" \
  packages/graph/src/*.svelte packages/graph/src/schema/*.svelte
```

Expected: **no hits.** Any of these in a component means the layer boundary broke outright — the
component reached past `GraphState` into the machinery it is supposed to be insulated from.

**Soft sweep — expect hits, read each one:**

```bash
rg -n "\.filter\(|\.reduce\(|\.flatMap\(|\.sort\(|\.map\(" \
  packages/graph/src/*.svelte packages/graph/src/schema/*.svelte
```

Judge each hit:

| Shape                                                                                    | Verdict                                                                                |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `{#each graph.clusters as c}` with no transform                                          | fine                                                                                   |
| `graph.edgePath(edge)`, `graph.nodeState(id)`, `graph.groupStyle(g)`                     | fine — these are state calls, and Task 13 requires them                                |
| `{...graph.groupStyle(g)}` spread                                                        | fine                                                                                   |
| `graph.entities.map(e => …)`, `.filter(…)`, `.sort(…)` — expression- **or** block-bodied | **violation.** Move it to `GraphState` as a getter and add a `GraphState.spec.ts` test |
| any arithmetic over two state values in the template                                     | **violation**, same fix                                                                |

If a hit is a violation, moving it is not optional — the design's testability claim rests on it.

- [ ] **Step 8: Commit**

```bash
git add packages/graph/src/schema packages/graph/spec/schema/EntityView.spec.ts
git commit -m "feat(graph): EntityView — reads state.entity + state.relationships

The inbound/outbound partitioning loop does not port; it is a GraphState
derivation now, so the in/out split is tested without a renderer and this
component only reflects direction onto an attribute.

Reads entirely off GraphState — no SchemaModel anywhere. Indexes come through
GraphNode.meta, which is what that passthrough is for.

Notes render via the shared NoteBlocks rather than a second inlined copy of the
segs snippet, so the two views cannot drift apart again."
```

---

## Task 18: Theme CSS

`base/*.css` is structure only and carries **no colour** — that is the headless-base rule.

**Files:**

- Create: `packages/themes/src/base/graph.css`, `packages/themes/src/rokkit/graph.css`
- Modify: `packages/themes/src/base/index.css`, `packages/themes/src/rokkit/index.css`

- [ ] **Step 1: Read the conventions**

Read `packages/themes/src/base/chart.css` and `packages/themes/src/rokkit/chart.css` to match
structure. Read `packages/themes/src/base/graph-paper.css` — it already provides the dotted
canvas and must **not** be duplicated.

- [ ] **Step 2: Write the failing test**

Create `packages/themes/spec/graph-css.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')

describe('graph theme CSS', () => {
  it('is imported by both index files', () => {
    expect(read('base/index.css')).toContain('graph.css')
    expect(read('rokkit/index.css')).toContain('graph.css')
  })

  // A colour token or literal in base/ bleeds into every style and makes a missing theme
  // override invisible instead of actionable.
  //
  // Every colour FORM, not just the three the first draft of this test checked. A guard that
  // catches oklch/hex/named-token but waves through `hsl()`, `color-mix()` or a bare `red`
  // does not enforce the invariant the checkpoint claims it does.
  it.each([
    [
      'named tokens',
      /var\(--(paper|ink|primary|accent|success|warning|danger|error|info|focus-ring|shadow-tint|on-)[a-z-]*\)/
    ],
    ['hex literals', /#[0-9a-fA-F]{3,8}\b/],
    ['oklch()', /\boklch\(/],
    ['oklab()', /\boklab\(/],
    ['hsl()/hsla()', /\bhsla?\(/],
    ['rgb()/rgba()', /\brgba?\(/],
    ['lab()/lch()', /\bl(ab|ch)\(/],
    ['hwb()', /\bhwb\(/],
    ['color-mix()', /\bcolor-mix\(/],
    [
      'CSS named colours',
      /:\s*(red|green|blue|black|white|gray|grey|orange|purple|pink|yellow|teal|cyan|magenta)\s*[;!]/
    ]
  ])('keeps base structural — no %s', (_form, pattern) => {
    expect(read('base/graph.css')).not.toMatch(pattern)
  })

  it('does assert on a non-empty file — the guard above is vacuous on an empty one', () => {
    expect(read('base/graph.css').length).toBeGreaterThan(200)
  })

  it('styles every node kind the preset names', () => {
    const rokkit = read('rokkit/graph.css')

    for (const kind of ['table', 'view', 'matview', 'function', 'procedure', 'enum']) {
      expect(rokkit, kind).toContain(`[data-node-kind='${kind}']`)
    }
  })

  // ink-soft is the placeholder tone (ink.500, 1.95-2.13:1 on paper) and cannot carry an
  // interactive control's label or icon — the graph node card IS a button.
  //
  // Matched per RULE, not per line. A line-by-line filter cannot see this at all: normal CSS
  // puts the selector and the declaration on separate lines, so no single line carries both
  // `row-type` and `--ink-soft`, and the guard passes while the violation ships. That is
  // exactly the defect this test exists to catch.
  it.each(['data-graph-row-type', "data-row-badge='fk'", 'data-graph-entity'])(
    'never puts ink-soft on %s',
    (selector) => {
      const rules = read('rokkit/graph.css')
        .split('}')
        .filter((rule) => rule.includes(selector))

      expect(rules.length, `no rule found for ${selector}`).toBeGreaterThan(0)
      for (const rule of rules) expect(rule).not.toMatch(/--ink-soft/)
    }
  )

  it('puts ink-mute on the row type — the positive case, not just the absence', () => {
    const rules = read('rokkit/graph.css')
      .split('}')
      .filter((rule) => rule.includes('data-graph-row-type'))

    expect(rules.some((r) => /--ink-mute/.test(r))).toBe(true)
  })

  it('backs the selected node with primary, never accent', () => {
    // text-on-accent compiles to a build-time-baked hex and cannot react to a skin;
    // only on-primary is a real CSS variable. This is the design's defect #2.
    const rules = read('rokkit/graph.css')
      .split('}')
      .filter((rule) => rule.includes("data-node-state='selected'"))

    expect(rules.length).toBeGreaterThan(0)
    expect(rules.some((r) => /--primary/.test(r))).toBe(true)
    for (const rule of rules) expect(rule).not.toMatch(/var\(--accent\b/)
  })

  it('does not redefine the dotted canvas that graph-paper.css already provides', () => {
    expect(read('base/graph.css')).not.toContain('radial-gradient')
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project themes`
Expected: FAIL — `ENOENT` on `base/graph.css`.

- [ ] **Step 4: Write `base/graph.css`**

Structure only — positioning, sizing, overflow, the `--control`-style custom-property
declarations with **no** colour values. Cover: `[data-graph-world]`, `[data-graph-cluster]`,
`[data-graph-cluster-label]`, `[data-graph-node]`, `[data-graph-node-head]`,
`[data-graph-node-title]`, `[data-graph-row]`, `[data-graph-row-name]`,
`[data-graph-row-type]`, `[data-graph-more]`, `[data-row-badge]`, `[data-graph-edge]`,
`[data-graph-edge-dot]`, `[data-graph-entity-row]`, `[data-graph-column]`,
`[data-graph-relationship]`, `[data-graph-note]`, `[data-graph-note-code]`.

Include the naming note the design calls for:

```css
/* NOTE ON NAMING: [data-graph-paper] in graph-paper.css is a BACKGROUND utility
   (a grid/dot pattern), unrelated to the node-link parts below. Graph reuses it
   for its canvas rather than shipping its own dotted background. */
```

Carry over the geometry that must agree with `constants.ts`:
`--graph-head-h: 40px`, `--graph-row-h: 24px`, `--graph-more-h: 22px`.

- [ ] **Step 5: Write `rokkit/graph.css`**

Colour only, using the canonical named tokens and the translation table from the design doc:

- canvas `--paper`; cluster fill `var(--group-fill, var(--paper-soft))`; cluster border
  `var(--group-stroke, var(--paper-edge))`; cluster label `var(--group-label, var(--ink-mute))`
- node background `--paper-soft`; border `--paper-edge`; head `--paper-mute`
- node title `--ink`; row name `--ink`; **row type `--ink-mute`** (never `ink-soft`)
- `[data-row-badge='pk']` `--primary`; `[data-row-badge='fk']` **`--ink-mute`**;
  `[data-row-badge='uq']` `--accent`
- `[data-node-state='selected']` border `--primary` plus a `--focus-ring` ring;
  `related` border `--accent`; `dim` `opacity: 0.35`
- edges `--graph-edge` defaulting to `--paper-edge`; `[data-edge-state='highlight']`
  `--primary`; `dim` `--graph-edge-dim`
- `[data-edge-kind='dependency']` dashed, so dbd#24's second edge kind is already themed
- one `[data-node-kind='…']` rule per preset kind, each setting `--node-accent`
- hover moves a fill **away** from its label with
  `oklch(from … calc(l + (l - 0.566) * 0.3) …)` — never a fixed darken or lighten

- [ ] **Step 6: Register the imports**

Add `@import './graph.css';` to `packages/themes/src/base/index.css` and
`packages/themes/src/rokkit/index.css`.

**These files are not alphabetical** — they are grouped (typography/density/radius/layout first,
then components). Add the import to the component group, next to `chart.css`.

- [ ] **Step 7: Run to verify it passes**

Run: `bun run test:ci --project themes && bun run build --filter @rokkit/themes`
Expected: PASS on 5 tests; themes build emits `dist/base/graph.css` and `dist/rokkit/graph.css`.

- [ ] **Step 8: Commit**

```bash
git add packages/themes
git commit -m "feat(themes): graph component CSS (base + rokkit)

base/ is structure only and a spec asserts it — a colour token there bleeds into
every style and turns a missing override from actionable into invisible.

Two rules encoded from the contrast gates: row types and fk badges take ink-mute
rather than ink-soft (the node card is a button, and ink-soft cannot carry an
interactive label), and hover moves a fill away from its label via relative
oklch rather than a fixed darken.

data-edge-kind='dependency' is already themed, so dbd#24's second edge kind
arrives styled."
```

---

## Task 19: Learn demo

The examples **are** the verification surface. Every control in the design's table must exist.

**The demo is where all three layers are visible at once**, which makes it the readable reference
for how to use the package:

| Layer     | File                                           | Owns                                                                                                     |
| --------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Load      | `datasets.ts`                                  | the two datasets — hand-crafted to exercise every kind, group wrap and an empty case                     |
| State     | `store.svelte.ts` + `GraphState`               | `store` holds the **UI control** choices; `GraphState` turns them plus a dataset into render-ready shape |
| Component | `GraphExplorer.svelte`, `GraphControls.svelte` | render + route intent                                                                                    |

Keep those two states distinct. `store.svelte.ts` is "which dataset, which view, which density" —
demo chrome. `GraphState` is the package's own store and must not be reimplemented in the demo.

**Files:**

- Create: `apps/learn/src/lib/koan/demos/graph/{meta.ts,index.svelte,docs.md,GraphExplorer.svelte,GraphControls.svelte,GraphConversation.svelte,store.svelte.ts,datasets.ts}`
- Modify: `apps/learn/src/lib/koan/catalog.ts` (the demo entry **and** `DEMO_ROUTE`),
  `apps/learn/src/lib/koan/shell.svelte.ts` (`ShellDemoType`),
  `apps/learn/src/routes/app/+layout.svelte` (the `DemoKind` union and `pickDemoKind`),
  `apps/learn/package.json`

**Verified file locations — do not guess these.** `conversations.svelte.ts` is **not** involved
(it owns conversation-history persistence and contains neither symbol):

| Symbol           | Actually lives in                              |
| ---------------- | ---------------------------------------------- |
| `DEMO_ROUTE`     | `apps/learn/src/lib/koan/catalog.ts:144`       |
| `pickDemoKind`   | `apps/learn/src/routes/app/+layout.svelte:108` |
| `DemoKind` union | `apps/learn/src/routes/app/+layout.svelte`     |
| `ShellDemoType`  | `apps/learn/src/lib/koan/shell.svelte.ts`      |

- [ ] **Step 1: Read the pattern**

Read `apps/learn/src/lib/koan/demos/chart/` in full — `meta.ts`, `index.svelte`,
`ChartExplorer.svelte`, `ChartControls.svelte`, `store.svelte.ts`, `registry.ts`, `datasets.ts`.
Match it. Then trace how `sparkline` is registered — it appears in exactly three places:
`shell.svelte.ts` (as a `ShellDemoType` member), `catalog.ts` (the import + registration **and**
the `DEMO_ROUTE` entry), and `routes/app/+layout.svelte` (the `DemoKind` union plus
`pickDemoKind`'s keyword list). Grep for `sparkline` across `apps/learn/src` and follow all hits.

- [ ] **Step 2: Add `@rokkit/graph` to the learn app**

In `apps/learn/package.json`, add to `dependencies`:

```json
		"@rokkit/graph": "workspace:*",
```

Run `bun install`.

- [ ] **Step 3: Write two datasets**

Create `apps/learn/src/lib/koan/demos/graph/datasets.ts` exporting **two** shapes:

1. `ecommerceSchema` — dbd-shaped JSON (`{ tables, refs }`) with **at least three groups**
   (`public`, `audit`, `billing`) and nodes covering **every** kind the preset names: `table`,
   `view`, `matview`, `function`, `procedure`, `enum`. Enough nodes that the group ramp visibly
   wraps and `arrange` visibly changes edge crossings.
2. `serviceCallGraph` — a **deliberately non-dbd shape**, e.g.
   `{ services: [{ key, team, type, endpoints: [{ label, kind }] }], calls: [{ caller, callee, via }] }`,
   with its own `fields` map exported beside it as `serviceCallFields`.

The second dataset is the point: it is the only thing that proves the contract is general rather
than a `SchemaModel` in disguise.

- [ ] **Step 4: Write the store and controls**

`store.svelte.ts` holds `$state` for `dataset`, `layout`, `density`, `arrange`, `edgeStyle`,
`using`, `selected`, `view`. `GraphControls.svelte` renders one control per row of the design's
verification table:

| Control          | Values                            |
| ---------------- | --------------------------------- |
| Dataset          | `ecommerce` / `service-calls`     |
| View             | `diagram` / `entity` / `entities` |
| Layout           | `cluster` / `neighborhood`        |
| Density          | `names` / `keys` / `full`         |
| Arrange          | `untangle` / `a-z`                |
| Edge style       | `curved` / `orthogonal`           |
| Differentiate by | `color` / `pattern`               |

Use `@rokkit/ui` controls (`Select`, `Toggle`), not bespoke ones.

- [ ] **Step 5: Write `GraphExplorer.svelte`**

Construct **one** `GraphState` from the store's choices and feed it to whichever view the `view`
state selects — `<Graph>`, `<EntityView>` or `<EntitiesView>`. One state shared across all three
is what makes selection two-way for free: clicking a node in the diagram sets `state.value`, and
`EntityView` already reads it.

Include a `data-graph-explorer` marker element for the smoke gate.

- [ ] **Step 6: Write `meta.ts`**

Follow `demos/chart/meta.ts` exactly. `id: 'graph'`, `category: 'data'`, keywords covering
`graph`, `diagram`, `er-diagram`, `schema`, `entity`, `nodes`, `edges`, `call-graph`,
`dependency`, `force-directed`. The `api.attrs` list must publish **every** data-attribute from
`base/graph.css` — it is the consumer's override contract, not decoration. `snippets` must
include: a minimal `<Graph>`, the `fields`-mapped non-dbd example, `fromSchemaModel` sugar, a
`createGraphPreset` override, and a **one-rule CSS override** showing
`[data-node-kind='table'] { --node-accent: var(--primary) }` taking effect.

- [ ] **Step 7: Register it**

Four edits, in the files verified above:

1. `apps/learn/src/lib/koan/catalog.ts` — the `graph` import and catalog entry, **and** a `graph`
   row in `DEMO_ROUTE` (line 144; it lives here, not in `shell.svelte.ts`).
2. `apps/learn/src/lib/koan/shell.svelte.ts` — add `graph` to `ShellDemoType`.
3. `apps/learn/src/routes/app/+layout.svelte` — add `graph` to the `DemoKind` union and its
   keywords to `pickDemoKind` (line 108).
4. Keyword collision: `demos/chart/meta.ts` currently claims `graph` and `graphs`. **Move those
   two to this demo** and leave chart the plotting words.

- [ ] **Step 8: Write `docs.md`**

Cover: the data contract and `fields`, the layout interface and the two built-ins, the full
data-attribute vocabulary, `createGraphPreset` and `using`, and the one-rule CSS override. State
plainly that `SchemaModel` stays in the consuming app.

- [ ] **Step 9: Verify both routes render**

Run: `cd apps/learn && bun run build`
Expected: build succeeds; `/components/graph` prerenders. This command exits.

**Do not run `bun run dev` as a plan step.** It is a long-running Vite server with no timeout; an
unattended executor never gets a prompt back and the whole plan stalls here, 3 tasks short of the
end. The automated coverage for "each control changes the render" is Task 20's Playwright spec,
which does exit.

If you want a smoke check that the route serves, bound it:

```bash
cd apps/learn && (bun run preview &) && sleep 4 && \
  curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:4173/app/graph && pkill -f 'vite preview'
```

Expected: `200`.

Exercising every control by hand is a **human, non-blocking** checklist item — valuable, but not a
step an executor waits on.

- [ ] **Step 10: Commit**

```bash
git add apps/learn packages/graph bun.lock
git commit -m "feat(learn): graph demo — the verification surface for @rokkit/graph

One control per claim in the design's verification table, so layout, density,
arrange, edge style and the color|pattern channel are all checkable by
eye rather than only by unit test.

Two datasets on purpose. The second is deliberately NOT dbd-shaped — it maps a
service call graph through `fields` — because that is the only thing that
proves the contract is general and not a SchemaModel in disguise.

Moved the `graph`/`graphs` keywords off the chart demo, which had claimed them."
```

---

## Task 20: E2E and contrast gates

**Files:**

- Create: `apps/learn/e2e/graph.e2e.ts`
- Modify: `apps/learn/src/routes/embed/gallery/+page.svelte`

- [ ] **Step 1: Read the gates**

Read `apps/learn/e2e/screens-smoke.e2e.ts`, `apps/learn/e2e/theme-contrast.e2e.ts`,
`apps/learn/e2e/interaction-contrast.e2e.ts` and `apps/learn/src/routes/embed/gallery/+page.svelte`.

- [ ] **Step 2: Add the diagram to the contrast gallery**

Add a `<Graph>` section to `/embed/gallery` using the ecommerce dataset at `density: 'full'` so
node titles, row names, row types and badges are all present and measurable.

**The sweep must run against a non-default skin.** The default skin maps primary _and_ accent to
`shu`, so a bad token swap is invisible under it. Follow the existing gallery's skin-switching
mechanism.

- [ ] **Step 3: Write the e2e spec**

Create `apps/learn/e2e/graph.e2e.ts`:

```ts
import { expect, test } from '@playwright/test'

test.describe('graph demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/graph')
    await expect(page.locator('[data-graph-explorer]')).toBeVisible()
  })

  test('renders nodes, edges and clusters', async ({ page }) => {
    await expect(page.locator('[data-graph-node]').first()).toBeVisible()
    await expect(page.locator('[data-graph-edge]').first()).toBeVisible()
    await expect(page.locator('[data-graph-cluster]').first()).toBeVisible()
  })

  test('density full shows more rows than density names', async ({ page }) => {
    await page.getByLabel('Density').selectOption('names')
    const namesRows = await page.locator('[data-graph-row]').count()

    await page.getByLabel('Density').selectOption('full')
    expect(await page.locator('[data-graph-row]').count()).toBeGreaterThan(namesRows)
  })

  test('switching to the neighborhood layout drops the clusters', async ({ page }) => {
    await page.locator('[data-graph-node]').first().click()
    await page.getByLabel('Layout').selectOption('neighborhood')

    await expect(page.locator('[data-graph-cluster]')).toHaveCount(0)
    await expect(page.locator('[data-graph-node]').first()).toBeVisible()
  })

  test('every preset node kind is rendered and distinguishable', async ({ page }) => {
    for (const kind of ['table', 'view', 'matview', 'function', 'procedure', 'enum']) {
      await expect(page.locator(`[data-node-kind="${kind}"]`).first()).toBeVisible()
    }
  })

  test('differentiating by pattern sets a pattern instead of a group fill', async ({ page }) => {
    await page.getByLabel('Differentiate by').selectOption('pattern')
    const cluster = page.locator('[data-graph-cluster]').first()

    await expect(cluster).toHaveAttribute('style', /--group-pattern/)
  })

  test('the non-dbd dataset renders through field mapping alone', async ({ page }) => {
    await page.getByLabel('Dataset').selectOption('service-calls')

    await expect(page.locator('[data-graph-node]').first()).toBeVisible()
    await expect(page.locator('[data-graph-edge]').first()).toBeVisible()
  })

  test('selecting a node highlights its edges and dims the rest', async ({ page }) => {
    await page.locator('[data-graph-node]').first().click()

    await expect(page.locator('[data-node-state="selected"]')).toHaveCount(1)
    await expect(page.locator('[data-edge-state="highlight"]').first()).toBeVisible()
  })

  test('the entity table reaches every row from the keyboard', async ({ page }) => {
    await page.getByLabel('View').selectOption('entities')
    await page.locator('[data-graph-entity-row]').first().focus()
    await page.keyboard.press('Enter')

    await expect(page.locator('[data-graph-entity]')).toBeVisible()
  })
})
```

- [ ] **Step 4: Run the e2e suite**

Run: `cd apps/learn && npx playwright test graph.e2e.ts`
Expected: 8 tests pass.

- [ ] **Step 5: Run the gates**

Run:

```bash
cd apps/learn
npx playwright test screens-smoke.e2e.ts theme-contrast.e2e.ts interaction-contrast.e2e.ts
```

Expected: all pass. A contrast failure on a graph selector is a **real** finding — fix the token
in `rokkit/graph.css`, do not add it to the accept-list.

- [ ] **Step 6: Commit**

```bash
git add apps/learn
git commit -m "test(learn): graph e2e + contrast gallery entry

The diagram enters /embed/gallery at density full so titles, row names, row
types and badges are all measurable, and the sweep runs against a NON-default
skin — the default maps primary and accent to the same palette, which hides a
bad token swap.

The e2e covers what a unit test cannot: that each control visibly changes the
render, that every preset kind is distinguishable, and that the non-dbd dataset
renders through field mapping alone."
```

---

## Task 21: Docs, journal, and slice close-out

**Files:**

- Modify: `docs/design/23-graph.md`, `docs/design/12-priority.md`, `agents/journal.md`,
  `agents/memory.md`, `docs/backlog/2026-09-27-graph-package-extraction.md`,
  `docs/CHECKPOINT.md`
- Create: `docs/llms/components/graph.txt`

- [ ] **Step 1: Check the design doc still matches what got built**

`docs/design/23-graph.md` already records the `neighborhood` refinement (it was folded in when
this plan was written, so spec and plan agree from the start). Re-read it against the finished
code and correct anything that drifted during implementation — that is the whole point of this
step, not a rubber stamp.

- [ ] **Step 2: Write the llms doc**

Create `docs/llms/components/graph.txt` following the shape of
`docs/llms/components/sparkline.txt`. Then mirror it to the site per the release checklist:

```bash
cd apps/learn && bun run sync:assets
```

- [ ] **Step 2b: Sync the shipped skills**

The release checklist requires **all four** doc surfaces, not just the obvious ones.
`packages/cli/skills/` already ships a `charts-rokkit` skill; a node-link diagram package is the
same kind of thing and `rokkit-components` is the skill that tells an agent which component to
reach for.

1. Add a `Graph` / `EntityView` / `EntitiesView` entry to
   `packages/cli/skills/rokkit-components/SKILL.md` — the data contract (`nodes`/`edges`/`fields`),
   the layout names, and that `SchemaModel` stays in the consuming app.
2. Check for a second copy: `rg --no-ignore -g '!node_modules' -l "rokkit-components" docs/ src/ packages/`
   — the release checklist names `docs/skills/` and `src/assets/skills/` as a pair that must
   match. Update whichever copies exist.
3. Add the skill/doc entries to `sensei.library.json` if it enumerates them per-file.

Run: `bun run test:ci --project cli`
Expected: PASS — the skills-catalog tests see the new content.

- [ ] **Step 3: Update the priority checklist and backlog**

Mark the slice-1 item shipped in `docs/design/12-priority.md` with the date and commit range.
Set the backlog item's status to `CLOSED <date> — slice 1 shipped. Slices 2-3 open.`

- [ ] **Step 4: Write the journal entry**

Add an entry to `agents/journal.md` covering: why a new package rather than `@rokkit/chart`; the
canonical-model decision and that it dissolved #159's drift risk; the `neighborhood`
discovery; the two live defects fixed (`ink-soft` in a button, `accent`'s baked on-colour); the
palette move and how it was proved value-preserving; and the measured gate numbers.

- [ ] **Step 5: Add the memory entries**

Append to `agents/memory.md` under _Architecture_: a `@rokkit/graph` row. Under _Key
Decisions_: "Node-link diagrams live in `@rokkit/graph`, not `@rokkit/chart` — scales/channels/marks
vs nodes/edges/layout; `d3-force` must not reach chart consumers."

- [ ] **Step 6: Run the full gate**

Run:

```bash
bun run lint && bun run check:types && bun run check:build && bun run check:svelte && bun run build:apps && bun run test:ci
cd apps/learn && npx playwright test
```

Expected: lint 0/0; types 0; declarations 0; svelte 0; apps build; all unit tests pass; all e2e
pass. Record the actual counts in the journal entry.

- [ ] **Step 7: Update the checkpoint**

Rewrite `docs/CHECKPOINT.md` (**under 40 lines**) for the new state: slice 1 shipped, slices 2
and 3 open, dbd consumption as the next actionable. Then run
`/sensei:checkpoint <one-line state>`.

- [ ] **Step 8: Commit**

```bash
git add docs agents apps/learn
git commit -m "docs: close out @rokkit/graph slice 1 (#159)

Records the neighborhood refinement in the design doc: EntityDiagram's geometry
is a layout, not a component, so slice 1 ships two LayoutFns and the interface
is validated by two real implementations rather than one plus a promise."
```

---

## Task 22: dbd consumes the package

**This task is in a different repository** (`~/Developer/dbd`) and must be a separate PR. It is
the acceptance proof for slice 1 — do not call the slice done without it.

> ### Safety preconditions — all three, before touching anything
>
> This task deletes 16 files in a repo that is not the one you have been working in, and the
> global Git Safety rules apply: never `git checkout --`/`git restore` over uncommitted work,
> stage one concern at a time, and confirm with `git diff --cached --stat` before committing.
>
> **The order below is deliberate: verify BEFORE deleting.** The original ordering deleted first
> and verified fifth, which left no sanctioned recovery path if verification failed.

- [ ] **Step 1: Confirm dbd is clean and branch**

```bash
cd ~/Developer/dbd
git status --porcelain
```

**If that prints anything, STOP.** Do not proceed, do not `git rm -f`, do not restore. Report the
dirty paths and ask — there is uncommitted work here that is not yours.

With a clean tree:

```bash
git checkout -b graph-slice-1
```

- [ ] **Step 2: Use a linked workspace, not a published package**

**Do not publish `@rokkit/graph` yet.** Publishing is irreversible — a version cannot be reused,
so a publish that precedes this verification burns the number if the exports map or the
`svelte-package` output turns out to be wrong.

Link instead:

```bash
cd ~/Developer/rokkit/packages/graph && bun link
cd ~/Developer/dbd/site && bun link @rokkit/graph
```

Publication happens **after** Step 6 passes, as a separate action gated on the release checklist.

- [ ] **Step 3: Rewrite the consuming routes**

Rewrite `site/src/routes/diagram/+page.svelte` and `site/src/routes/projects/+page.svelte` to
import `Graph` from `@rokkit/graph` and `EntityView`/`EntitiesView`/`fromSchemaModel` from
`@rokkit/graph/schema`.

- [ ] **Step 4: Port the orphaned route test**

`site/src/lib/design/diagram.page.test.ts` renders `../../routes/diagram/+page.svelte` and asserts
`container.querySelectorAll('[data-card]')`. The new package emits no `data-card` — the vocabulary
is `data-graph-node`/`data-graph-cluster`. **This test will fail, and that failure is expected at
this point and is not one of the two intended visual differences below.**

Port its assertions to the new attributes (`[data-graph-node]` for the card count). Do **not**
delete it to get a green suite — it is the only dbd-side test that the route still renders.

- [ ] **Step 5: Verify BEFORE deleting anything**

The old files are still present, so a failure here costs nothing:

```bash
cd ~/Developer/dbd/site && bun run test && bun run build
```

Both must pass. `bun run build` exits; **do not run `bun run preview` or `bun run dev` here** —
they are long-running Vite servers with no timeout and will hang an unattended run. For a visual
check, use a bounded probe instead:

```bash
cd ~/Developer/dbd/site && (bun run preview &) && sleep 4 && curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:4173/diagram && pkill -f 'vite preview'
```

Expected: `200`. Any side-by-side visual comparison against `main` is an explicitly **human**,
non-blocking step — not a gate the executor waits on.

Two **intended** differences from `main`, both contrast fixes: column types and fk icons are
`ink-mute` rather than `ink-soft`, and the selected card uses `primary`/`on-primary` rather than
baked-hex `accent`.

- [ ] **Step 6: Now delete what moved**

Only once Step 5 is green:

```bash
cd ~/Developer/dbd
git rm site/src/lib/design/{layout,layout-cards,layout-clusters,layout-edges,layout-types,md}.ts
git rm site/src/lib/design/{EntityDiagram,EntityView,EntitiesView,DiagramView,Icon}.svelte
git rm site/src/lib/design/{layout,layout-clusters,layout-edges}.test.ts
```

Note `model.ts` and `model.test.ts` are **not** in those lists. Check their callers first:

```bash
rg --no-ignore -g '!node_modules' "validateModel|SchemaModel" site/src
```

`SchemaModel`/`validateModel` stay in dbd by design, so expect hits. Reduce `model.ts` to just
those two plus their types, drop `toLayoutData`/`neighborsOf`/`nodeId` (now in the package), and
keep the `model.test.ts` cases that cover what remains.

**Keep** `Header.svelte`, `store.ts`, `fragment.ts`, `data.ts`, `ProjectsView.svelte`,
`SchemaSnapshot.svelte`, `Tabs.svelte`, `ContentHeader.svelte`, `Sidebar.svelte`,
`diagram.page.test.ts`.

- [ ] **Step 7: Strip the superseded CSS**

From `site/src/lib/design/styles.css`, delete the `DIAGRAM` block (`.dg-*`, lines ~144-232) and
the `.dbd-app` scoped preflight if nothing else in the subtree needs it. **Keep** the
`SCHEMA SNAPSHOT THUMBNAIL` block — `SchemaSnapshot.svelte` stays, and so do its six hue rules.

- [ ] **Step 8: Re-run the suite after deletion**

```bash
cd ~/Developer/dbd/site && bun run test && bun run build
```

Both must pass again. A failure here means a deleted file still had a caller — recover with
`git checkout graph-slice-1 -- <path>` (safe: the branch has the file staged for deletion, and
nothing else is uncommitted because Step 1 verified that).

- [ ] **Step 9: Commit, scoped**

```bash
cd ~/Developer/dbd
git add site/src/lib/design site/src/routes/diagram site/src/routes/projects site/package.json
git diff --cached --stat
```

**Read that stat output.** It must contain only the paths this task touched — no unrelated file.
`git add -A` is deliberately not used here, per the stage-one-concern-at-a-time rule.

```bash
git commit -m "refactor(site): consume @rokkit/graph for the schema viewer

Deletes the viewer source and its layout tests, now shared with sensei via
@rokkit/graph. SchemaModel stays here — the package speaks its own canonical
model, so the hand-written mirror of schema_model.rs is not duplicated into a
third place.

diagram.page.test.ts is ported rather than deleted: its [data-card] assertions
become [data-graph-node], since it is the only dbd-side test that the route
still renders at all.

Two intended visual changes, both contrast fixes: column types and fk icons
move off ink-soft (which cannot carry an interactive control's text) onto
ink-mute, and the selected card uses primary/on-primary instead of accent,
whose on-colour was a build-time-baked hex that could not react to a skin."
```

- [ ] **Step 10: Publish, then switch off the link**

Only now, and only after the Rokkit-side release checklist passes: `bun run bump` in Rokkit, then
in dbd replace the link with the published range and re-run Step 8's gate.

- [ ] **Step 11: Close the loop on the issue**

**Chained**, so the announcement cannot outrun the commit:

```bash
cd ~/Developer/dbd && git log --oneline -1 && \
  gh issue comment 159 --repo jerrythomas/rokkit \
    --body "Slice 1 shipped — see docs/design/23-graph.md. dbd now consumes @rokkit/graph. Slices 2 (force-directed) and 3 (dbd#24 v2 model) remain."
```

Confirm the `git log` line is the commit from Step 9 before the comment posts. An unchained
sequence would announce "Slice 1 shipped" publicly even if the commit had failed.

---

## Verification summary

| Gate         | Command                                | Expected                                                                                  |
| ------------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| Unit         | `bun run test:ci`                      | All pass, incl. every ported numeric assertion unchanged                                  |
| Layer rule   | Task 17 Step 7 grep                    | No component computes — no `normalizeGraph`, no deriving `filter`/`reduce` in a `.svelte` |
| Lint         | `bun run lint`                         | 0 errors, **0 warnings**                                                                  |
| Types        | `bun run check:types`                  | 0 errors                                                                                  |
| Declarations | `bun run check:build`                  | 0 errors                                                                                  |
| Svelte       | `bun run check:svelte`                 | 0 errors, 0 warnings                                                                      |
| Apps build   | `bun run build:apps`                   | Success                                                                                   |
| Coverage     | `bun run coverage`                     | Meets the `packages/graph` thresholds                                                     |
| E2E          | `cd apps/learn && npx playwright test` | All pass, accept-lists unchanged                                                          |
| Acceptance   | dbd's site on the package              | Renders equivalently, two intended contrast fixes                                         |

**Two rules for this slice specifically:**

1. **A failing ported assertion means the port changed behaviour.** Fix the port. Do not
   rebaseline a characterization test — its whole purpose is to fail when geometry moves.
2. **A contrast failure on a graph selector is a real finding.** Fix the token in
   `rokkit/graph.css`. Do not add it to an accept-list.
