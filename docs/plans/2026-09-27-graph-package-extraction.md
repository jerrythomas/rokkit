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
| `DiagramView.svelte` (render only)                        |   139 | `src/Graph.svelte`                     |   12 |
| `md.ts`                                                   |    50 | `src/schema/notes.ts`                  |   14 |
| `EntityView.svelte`                                       |   211 | `src/schema/EntityView.svelte`         |   15 |
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
    Graph.svelte            the canvas — renders any LayoutResult
    schema/
      index.ts              public barrel for "./schema"
      notes.ts              inlineSegs, noteBlocks
      fromSchemaModel.ts    optional sugar over normalizeGraph
      EntityView.svelte
      EntitiesView.svelte
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
    Graph.spec.ts
    schema/
      notes.spec.ts
      fromSchemaModel.spec.ts
      EntitiesView.spec.ts
      EntityView.spec.ts
```

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

**These expected values are placeholders you must replace with real ones.** Before making any
change, print the actual values and paste them in:

```bash
cd packages/chart && bun -e "
import { assignColors } from './src/lib/brewing/colors.js'
console.log(JSON.stringify([...assignColors(['a','b','c'],'light')], null, 2))
"
```

Expected after substitution: PASS (it pins current behaviour, pre-move).

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

  it('gives each edge a distinct id when two refs join the same pair of nodes', () => {
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
 * Resolves the source edge's endpoint to a node id. A map may name either the
 * node's own id field or its label — when a group is in play the raw value is a
 * bare label, so try the qualified form against the known nodes first.
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

  // A source like dbd's puts the group beside the table on the same endpoint
  // object (`from.s` next to `from.t`), so derive it from the endpoint prefix.
  const prefix = (path ?? fallbackKey).split('.').slice(0, -1)
  if (prefix.length) {
    const endpoint = readPath(source, prefix.join('.'))
    for (const value of Object.values((endpoint ?? {}) as Record<string, unknown>)) {
      if (typeof value === 'string' && byId.has(`${value}.${raw}`)) return `${value}.${raw}`
    }
  }

  return undefined
}

function buildEdge(
  source: unknown,
  fields: GraphFields,
  byId: Map<string, GraphNode>
): GraphEdge | null {
  const from = resolveEndpoint(source, fields.source, 'source', fields.group, byId)
  const to = resolveEndpoint(source, fields.target, 'target', fields.group, byId)
  if (!from || !to) return null

  const sourceRow = str(pick(source, fields.sourceRow, 'sourceRow'))
  const targetRow = str(pick(source, fields.targetRow, 'targetRow'))
  const kind = str(pick(source, fields.edgeKind, 'kind'))

  return {
    id: `${from}:${sourceRow ?? ''}->${to}:${targetRow ?? ''}`,
    source: from,
    target: to,
    sourceRow,
    targetRow,
    kind: kind === 'dependency' ? 'dependency' : ('reference' as EdgeKind),
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

  const resolved = edges
    .map((source) => buildEdge(source, fields, byId))
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
pure CSS and needs no JS — that lands in Task 17.

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

export type GraphChannel = 'color' | 'pattern' | 'symbol'

export type GraphShades = { fill: string; stroke: string; label: string }

export type GraphPreset = {
  /** Palette family per KNOWN node kind. Kinds are also themeable in pure CSS. */
  kinds: Record<string, string>
  /** Ordered ramp assigned to open-ended group names, wrapping when exhausted. */
  groups: string[]
  shades: { light: GraphShades; dark: GraphShades }
  patterns: string[]
  symbols: string[]
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
  symbols: ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'],
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
    if (preset.using === 'symbol') {
      styles.set(group, { '--group-symbol': preset.symbols[index % preset.symbols.length] })
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
reorders the layout. using: pattern|symbol gives a colour-blind- and
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
| `nbrs['a.x']` is `string[]`                  | `model.neighbors.get('a.x')` is a `Set<string>`       |
| `expect(clusters[0].hue).toBe(HUES[0])`      | `expect(clusters[0].groupIndex).toBe(0)`              |
| `import { HUES }`                            | **deleted**                                           |

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
7. `buildAdjacency` returns `Map<string, Set<string>>` to match `GraphModel.neighbors`; the
   `barycenter` helper reads it with `.get()` and checks `.size`.

Keep the exported surface, the JSDoc, the `ncols` formula
(`Math.max(1, Math.min(6, Math.round(Math.sqrt(n * 1.15))))`), the two barycenter iterations,
and the `+60` canvas margin exactly as they are.

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
2. Card sizing reuses **`buildCards`** rather than a private `buildCard`: build the focus card
   at `density: 'full'`, and neighbour cards by filtering each neighbour's rows to
   `badges.includes('pk') || referenced.has(row.name)` before sizing. Do not reintroduce a
   second height formula — that duplication is what this task removes.
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

## Task 12: The `Graph` canvas

**Files:**

- Create: `packages/graph/src/Graph.svelte`, `packages/graph/spec/Graph.spec.ts`
- Modify: `packages/graph/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/graph/spec/Graph.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Graph from '../src/Graph.svelte'

const FIELDS = {
  label: 'name',
  group: 'schema',
  kind: 'kind',
  rows: 'columns',
  rowBadges: { pk: 'pk' },
  source: 'from.t',
  target: 'to.t',
  sourceRow: 'from.c',
  targetRow: 'to.c'
}

const NODES = [
  { schema: 'public', name: 'users', kind: 'table', columns: [{ name: 'id', pk: true }] },
  { schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id' }] }
]

const EDGES = [
  { from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const props = (extra = {}) => ({ nodes: NODES, edges: EDGES, fields: FIELDS, ...extra })

describe('Graph', () => {
  it('renders one node element per node', () => {
    const { container } = render(Graph, props())

    expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(2)
  })

  it('publishes each node kind as data-node-kind so CSS can colour it', () => {
    const { container } = render(Graph, props())
    const kinds = [...container.querySelectorAll('[data-graph-node]')].map((el) =>
      el.getAttribute('data-node-kind')
    )

    expect(kinds.sort()).toEqual(['table', 'view'])
  })

  it('publishes the group name for attribute overrides', () => {
    const { container } = render(Graph, props())

    expect(container.querySelector('[data-node-group="public"]')).not.toBeNull()
  })

  it('renders one edge element per routed edge, carrying its kind', () => {
    const { container } = render(Graph, props())
    const edges = container.querySelectorAll('[data-graph-edge]')

    expect(edges).toHaveLength(1)
    expect(edges[0].getAttribute('data-edge-kind')).toBe('reference')
  })

  it('renders a cluster per group under the cluster layout', () => {
    const { container } = render(Graph, props())

    expect(container.querySelectorAll('[data-graph-cluster]')).toHaveLength(1)
  })

  it('renders no clusters under the neighborhood layout', () => {
    const { container } = render(Graph, props({ layout: 'neighborhood', focus: 'public.users' }))

    expect(container.querySelectorAll('[data-graph-cluster]')).toHaveLength(0)
  })

  it('switches layout by name — proving the seam is real', () => {
    const { container: a } = render(Graph, props({ layout: 'cluster' }))
    const { container: b } = render(Graph, props({ layout: 'neighborhood', focus: 'public.users' }))

    expect(a.querySelectorAll('[data-graph-node]').length).not.toBe(
      b.querySelectorAll('[data-graph-node]').length
    )
  })

  it('accepts a LayoutFn directly, not just a registered name', () => {
    const empty = () => ({ clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } })
    const { container } = render(Graph, props({ layout: empty }))

    expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(0)
  })

  it('marks the selected node and its related neighbours', () => {
    const { container } = render(Graph, props({ value: 'public.users' }))

    expect(container.querySelector('[data-node-state="selected"]')).not.toBeNull()
    expect(container.querySelector('[data-node-state="related"]')).not.toBeNull()
  })

  it('dims a node that is neither selected nor related', () => {
    const detached = [...NODES, { schema: 'public', name: 'solo', kind: 'table', columns: [] }]
    const { container } = render(Graph, {
      ...props({ value: 'public.users' }),
      nodes: detached
    })

    expect(container.querySelector('[data-node-state="dim"]')).not.toBeNull()
  })

  it('highlights an edge touching the selection and dims the rest', () => {
    const { container } = render(Graph, props({ value: 'public.users' }))

    expect(container.querySelector('[data-edge-state="highlight"]')).not.toBeNull()
  })

  it('marks a pk row with data-row-badge', () => {
    const { container } = render(Graph, props({ density: 'full' }))

    expect(container.querySelector('[data-row-badge="pk"]')).not.toBeNull()
  })

  it('marks a derived fk row with data-row-badge', () => {
    const { container } = render(Graph, props({ density: 'full' }))

    expect(container.querySelector('[data-row-badge="fk"]')).not.toBeNull()
  })

  it('sets group custom properties from the preset rather than a hardcoded fill', () => {
    const { container } = render(Graph, props())
    const cluster = container.querySelector('[data-graph-cluster]') as HTMLElement

    expect(cluster.style.getPropertyValue('--group-fill')).not.toBe('')
  })

  it('reuses the dotted canvas primitive instead of shipping its own', () => {
    // [data-graph-paper] already exists in @rokkit/themes; .dg-dots is deleted.
    const { container } = render(Graph, props())

    expect(container.querySelector('[data-graph-paper]')).not.toBeNull()
  })

  it('calls onselect with the node id when a node is activated', async () => {
    let picked: string | null = null
    const { container } = render(Graph, props({ onselect: (id: string) => (picked = id) }))
    const node = container.querySelector('[data-graph-node]') as HTMLElement

    node.click()
    expect(picked).not.toBeNull()
  })

  it('gives the canvas an accessible role and name', () => {
    // Cycle 1 of the radar work shipped sparklines with no role/accessible
    // name and had to pay it back later. Not repeating that here.
    const { container } = render(Graph, props({ label: 'Schema diagram' }))
    const svg = container.querySelector('[role="img"]')

    expect(svg?.getAttribute('aria-label')).toBe('Schema diagram')
  })

  it('derives an accessible name from the data when no label is given', () => {
    const { container } = render(Graph, props())

    expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('2')
  })

  it('renders nothing but an empty canvas for an empty model', () => {
    const { container } = render(Graph, { nodes: [], edges: [], fields: FIELDS })

    expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../src/Graph.svelte'`.

- [ ] **Step 3: Implement**

Create `packages/graph/src/Graph.svelte`, porting `DiagramView.svelte`'s render with these
changes:

1. **Props:** `nodes`, `edges`, `fields`, `layout` (a `LayoutName` **or** a `LayoutFn`, default
   `'cluster'`), `density`, `arrange`, `edgeStyle`, `focus`, `value` (bindable — the selected
   node id), `preset`, `label`, `onselect`. `$derived`: `normalizeGraph(nodes, edges, fields)`
   then the resolved layout.
2. **Every class becomes a data-attribute**, per the design's published vocabulary:
   - `.dg-viewport`/`.dg-dots` → the root, with `data-graph-paper` (the existing themes
     primitive) — **do not** port `.dg-dots`
   - `.dg-world` → `data-graph-world`
   - `.dg-cluster` → `data-graph-cluster`, `data-node-group`, `data-graph-group-index`
   - `.dg-cluster-label` → `data-graph-cluster-label`
   - `.dg-card` → `data-graph-node`, plus `data-node-kind` and `data-node-state`
   - `.dg-card.sel|rel|dim` → `data-node-state="selected|related|dim"`
   - `.dg-card.headonly` → `data-node-headonly`
   - `.dg-card-head` → `data-graph-node-head`; `.dg-card-title` → `data-graph-node-title`
   - `.dg-row` → `data-graph-row`; `.dg-row.iskey` → `data-graph-row-key`
   - `.cname`/`.ctype` → `data-graph-row-name`/`data-graph-row-type`
   - `.dg-more` → `data-graph-more`
   - `.dg-keyicon`/`.dg-fkicon` → a single element with `data-row-badge="pk|fk|uq"`
   - `g.dg-edge` → `data-graph-edge`, plus `data-edge-kind` and `data-edge-state`
   - `.dot-from`/`.dot-to` → `data-graph-edge-dot="from|to"`
   - `.tinted` → dropped; group colour is always on via custom properties
3. **`--cl-h: {c.hue}` is replaced** by the custom properties from
   `resolveGroupStyles(groups, mode, preset)`, spread onto the cluster and card elements.
4. **Icons are CSS classes, not a component.** Replace `<Icon name="table" size={13} />` with a
   `<span>` carrying an icon class resolved from `data-node-kind`; take the class map from an
   `icons` prop merged over a default, matching the `defaultIcons` + per-instance `icons`
   pattern in `@rokkit/core`.
5. **Accessibility:** give the canvas `role="img"`, an `aria-label` from `label` falling back to
   a data-derived string (node and edge counts), and `<title>`/`<desc>`.
6. Keep `bind:clientWidth`/`bind:clientHeight`, the `content` extent calculation and the
   `scale`/`tx`/`ty` fit maths as they are — including the comment explaining why it centres on
   content bounds rather than `layout.size`.
7. **No `onclick` on an element that also carries a `data-path`** — there is no navigator here,
   so a direct `onclick` on the node element is correct, but do not add `data-path`.

Then fill in `packages/graph/src/index.ts`:

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
Expected: PASS — 19 `Graph` tests.

- [ ] **Step 5: Check types and svelte**

Run: `cd packages/graph && bun run check:types && bun run check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/Graph.svelte packages/graph/src/index.ts packages/graph/spec/Graph.spec.ts
git commit -m "feat(graph): Graph canvas — one renderer for any layout

Every BEM class from dbd's DiagramView becomes a data-attribute, so themes
target structure instead of implementation. --cl-h (a raw oklch hue angle) is
replaced by preset-resolved custom properties, and the dotted background reuses
the existing [data-graph-paper] primitive rather than porting .dg-dots.

role=img + a data-derived aria-label from the start: the radar work shipped
sparklines with no accessible name and had to pay it back a cycle later."
```

---

## Task 13: Note rendering

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

## Task 14: `fromSchemaModel`

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
  sourceRow: 'from.c',
  targetRow: 'to.c',
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

## Task 15: `EntitiesView` on `@rokkit/ui` Table

**Files:**

- Create: `packages/graph/src/schema/EntitiesView.svelte`,
  `packages/graph/spec/schema/EntitiesView.spec.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/EntitiesView.svelte` (80 lines). Note that it hand-rolls
a `<table>` with `onclick` on each `<tr>` and **no keyboard handler** — this port fixes that by
composing `@rokkit/ui`'s `Table`.

- [ ] **Step 2: Write the failing test**

Create `packages/graph/spec/schema/EntitiesView.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EntitiesView from '../../src/schema/EntitiesView.svelte'
import { normalizeGraph } from '../../src/model/normalize.ts'
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

const model = () => normalizeGraph(TABLES, REFS, SCHEMA_FIELDS)

describe('EntitiesView', () => {
  it('renders a row per node', () => {
    const { container } = render(EntitiesView, { model: model() })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(2)
  })

  it('shows each entity name', () => {
    const { getByText } = render(EntitiesView, { model: model() })

    expect(getByText('users')).toBeTruthy()
  })

  it('shows the row count per entity', () => {
    const { container } = render(EntitiesView, { model: model() })
    const counts = [...container.querySelectorAll('[data-graph-entity-rows]')].map(
      (el) => el.textContent
    )

    expect(counts).toContain('2')
  })

  it('counts references in both directions', () => {
    const { container } = render(EntitiesView, { model: model() })
    const refs = [...container.querySelectorAll('[data-graph-entity-refs]')].map(
      (el) => el.textContent
    )

    // One ref touches both nodes, so each shows 1.
    expect(refs).toEqual(['1', '1'])
  })

  it('shows an em dash when an entity has no references', () => {
    const { container } = render(EntitiesView, { model: normalizeGraph(TABLES, [], SCHEMA_FIELDS) })
    const refs = [...container.querySelectorAll('[data-graph-entity-refs]')].map(
      (el) => el.textContent
    )

    expect(refs).toEqual(['—', '—'])
  })

  it('renders the note as formatted blocks', () => {
    const { container } = render(EntitiesView, { model: model() })

    expect(container.querySelector('[data-graph-note]')?.textContent).toContain(
      'People who sign in'
    )
  })

  it('publishes the entity kind for theming', () => {
    const { container } = render(EntitiesView, { model: model() })
    const kinds = [...container.querySelectorAll('[data-graph-entity-row]')].map((el) =>
      el.getAttribute('data-node-kind')
    )

    expect(kinds.sort()).toEqual(['table', 'view'])
  })

  it('calls onselect with the node id when a row is activated', () => {
    let picked: string | null = null
    const { container } = render(EntitiesView, {
      model: model(),
      onselect: (id: string) => (picked = id)
    })

    ;(container.querySelector('[data-graph-entity-row]') as HTMLElement).click()
    expect(picked).toBe('public.users')
  })

  it('reaches every row from the keyboard — the hand-rolled table could not', () => {
    const { container } = render(EntitiesView, { model: model() })
    const row = container.querySelector('[data-graph-entity-row]') as HTMLElement

    // A clickable row must be focusable and activatable without a pointer.
    expect(row.tabIndex).toBeGreaterThanOrEqual(0)
  })

  it('renders an empty table for an empty model', () => {
    const { container } = render(EntitiesView, {
      model: normalizeGraph([], [], SCHEMA_FIELDS)
    })

    expect(container.querySelectorAll('[data-graph-entity-row]')).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/schema/EntitiesView.svelte'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/schema/EntitiesView.svelte`. Requirements:

1. Props: `model: GraphModel`, `onselect?: (id: string) => void`.
2. Derive per-node `{ id, group, label, kind, rowCount, refCount, note }`. `refCount` counts
   edges where the node is source **or** target.
3. Compose `@rokkit/ui`'s `Table` with columns Entity / Rows / Refs / Comment. Read
   `packages/ui/src/components/` for the current `Table` props before writing this — use its
   per-column named snippets for the Entity cell (group prefix plus label) and the Comment cell
   (`<NoteBlocks note={...} />`).
4. Each row carries `data-graph-entity-row` and `data-node-kind`; the numeric cells carry
   `data-graph-entity-rows` and `data-graph-entity-refs`.
5. **Selection goes through `Table`'s own mechanism**, so keyboard activation comes for free
   rather than being bolted onto a `<tr onclick>`.
6. **Token translation.** dbd's `text-faint` on the group prefix → **`ink-mute`**, not
   `ink-soft`: the row is interactive, and `ink-soft` cannot carry an interactive control's
   text. Also `bg-bg` → `paper`, `border-line-soft` → `paper-edge`, `hover:bg-paper-2` →
   `paper-mute`, `text-fg` → `ink`, `text-muted` → `ink-mute`, `text-accent-2` → `primary`.

- [ ] **Step 5: Run to verify it passes**

Run: `bun run test:ci --project graph`
Expected: PASS — 11 `EntitiesView` tests.

- [ ] **Step 6: Commit**

```bash
git add packages/graph/src/schema/EntitiesView.svelte packages/graph/spec/schema/EntitiesView.spec.ts
git commit -m "feat(graph): EntitiesView on @rokkit/ui Table

dbd's version hand-rolls a <table> with onclick on each <tr> and no keyboard
handler, so the rows were mouse-only. Composing @rokkit/ui's Table fixes that
rather than porting it, and the spec pins it.

Token fix carried in: the group prefix was text-faint (ink-soft) inside an
interactive row, which the ink-soft rule forbids. It is ink-mute now."
```

---

## Task 16: `EntityView`

**Files:**

- Create: `packages/graph/src/schema/EntityView.svelte`, `packages/graph/src/schema/index.ts`,
  `packages/graph/spec/schema/EntityView.spec.ts`

- [ ] **Step 1: Read the source**

Read `~/Developer/dbd/site/src/lib/design/EntityView.svelte` (211 lines) in full. It is the
single-entity detail panel: header, note, column table with `pk`/`fk` badges, indexes, and the
relationship list.

- [ ] **Step 2: Write the failing test**

Create `packages/graph/spec/schema/EntityView.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EntityView from '../../src/schema/EntityView.svelte'
import { normalizeGraph } from '../../src/model/normalize.ts'
import { SCHEMA_FIELDS } from '../../src/schema/fromSchemaModel.ts'

const TABLES = [
  {
    schema: 'public',
    name: 'users',
    kind: 'table',
    noteMd: 'People who sign in',
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

const model = () => normalizeGraph(TABLES, REFS, SCHEMA_FIELDS)
const props = (extra = {}) => ({ model: model(), value: 'public.users', ...extra })

describe('EntityView', () => {
  it('shows the entity label and group', () => {
    const { getByText } = render(EntityView, props())

    expect(getByText('users')).toBeTruthy()
    expect(getByText(/public/)).toBeTruthy()
  })

  it('renders the entity note', () => {
    const { container } = render(EntityView, props())

    expect(container.querySelector('[data-graph-note]')?.textContent).toContain(
      'People who sign in'
    )
  })

  it('lists every row of the entity', () => {
    const { container } = render(EntityView, props())

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
  })

  it('badges the primary key', () => {
    const { container } = render(EntityView, props())

    expect(container.querySelector('[data-row-badge="pk"]')).not.toBeNull()
  })

  it('badges a derived foreign key on the referencing entity', () => {
    const { container } = render(EntityView, props({ value: 'public.orders' }))

    expect(container.querySelector('[data-row-badge="fk"]')).not.toBeNull()
  })

  it('renders a per-row note when present', () => {
    const { getByText } = render(EntityView, props())

    expect(getByText('Primary key')).toBeTruthy()
  })

  it('lists inbound relationships', () => {
    const { container } = render(EntityView, props())
    const rels = [...container.querySelectorAll('[data-graph-relationship]')]

    expect(rels).toHaveLength(1)
    expect(rels[0].getAttribute('data-graph-relationship')).toBe('in')
  })

  it('lists outbound relationships', () => {
    const { container } = render(EntityView, props({ value: 'public.orders' }))

    expect(container.querySelector('[data-graph-relationship="out"]')).not.toBeNull()
  })

  it('calls onselect when a related entity is activated', () => {
    let picked: string | null = null
    const { container } = render(EntityView, props({ onselect: (id: string) => (picked = id) }))

    ;(container.querySelector('[data-graph-relationship]') as HTMLElement).click()
    expect(picked).toBe('public.orders')
  })

  it('publishes the entity kind for theming', () => {
    const { container } = render(EntityView, props())

    expect(container.querySelector('[data-node-kind="table"]')).not.toBeNull()
  })

  it('renders an empty state when the value names no known node', () => {
    const { container } = render(EntityView, props({ value: 'public.ghost' }))

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(0)
  })

  it('renders an empty state when value is null', () => {
    const { container } = render(EntityView, props({ value: null }))

    expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(0)
  })

  it('says so when an entity has no relationships', () => {
    const { container } = render(EntityView, {
      model: normalizeGraph(TABLES, [], SCHEMA_FIELDS),
      value: 'public.users'
    })

    expect(container.querySelectorAll('[data-graph-relationship]')).toHaveLength(0)
    expect(container.querySelector('[data-graph-relationships-empty]')).not.toBeNull()
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun run test:ci --project graph`
Expected: FAIL — `Cannot find module '../../src/schema/EntityView.svelte'`.

- [ ] **Step 4: Implement**

Create `packages/graph/src/schema/EntityView.svelte`, porting the source with:

1. Props `model: GraphModel`, `value: string | null`, `onselect?: (id: string) => void`.
   Everything reads off `model.byId` and `model.edges` — no `SchemaModel`.
2. Attribute vocabulary: `data-graph-entity`, `data-node-kind`, `data-graph-column`,
   `data-row-badge="pk|fk|uq"`, `data-graph-index`, `data-graph-relationship="in|out"`,
   `data-graph-relationships-empty`. `col-badge.pk`/`col-badge.fk` become
   `data-row-badge` values.
3. Notes render through `<NoteBlocks />` — do **not** re-inline the `segs` snippet.
4. Token translation, same table as Task 15. In particular any `--faint` on text inside a
   clickable relationship row becomes **`ink-mute`**.
5. Indexes come from `node.meta.indexes` when present — `GraphNode.meta` is exactly the
   passthrough for source fields the canonical model does not name.

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
Expected: PASS — 13 `EntityView` tests.

- [ ] **Step 6: Full gate**

Run: `bun run lint && bun run check:types && bun run check:svelte && bun run test:ci`
Expected: lint 0 errors 0 warnings; types 0; svelte 0; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/graph/src/schema packages/graph/spec/schema/EntityView.spec.ts
git commit -m "feat(graph): EntityView detail panel + ./schema barrel

Reads entirely off GraphModel — no SchemaModel anywhere. Indexes come through
GraphNode.meta, which is what that passthrough is for.

Notes render via the shared NoteBlocks rather than a second inlined copy of the
segs snippet, so the two views cannot drift apart again."
```

---

## Task 17: Theme CSS

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

  it('keeps base structural — no colour, per the headless-base rule', () => {
    const base = read('base/graph.css')

    // A colour token or literal in base/ bleeds into every style and makes a
    // missing theme override invisible instead of actionable.
    expect(base).not.toMatch(/var\(--(paper|ink|primary|accent|danger|on-)[a-z-]*\)/)
    expect(base).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(base).not.toMatch(/oklch\(/)
  })

  it('styles every node kind the preset names', () => {
    const rokkit = read('rokkit/graph.css')

    for (const kind of ['table', 'view', 'matview', 'function', 'procedure', 'enum']) {
      expect(rokkit, kind).toContain(`[data-node-kind='${kind}']`)
    }
  })

  it('never puts ink-soft on a row type or a badge', () => {
    // ink-soft is the placeholder tone and cannot carry an interactive
    // control's label or icon — the graph node card IS a button.
    const rokkit = read('rokkit/graph.css')
    const offending = rokkit
      .split('\n')
      .filter((l) => /--ink-soft/.test(l))
      .filter((l) => /row-type|row-badge|entity/.test(l))

    expect(offending).toEqual([])
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

## Task 18: Learn demo

The examples **are** the verification surface. Every control in the design's table must exist.

**Files:**

- Create: `apps/learn/src/lib/koan/demos/graph/{meta.ts,index.svelte,docs.md,GraphExplorer.svelte,GraphControls.svelte,GraphConversation.svelte,store.svelte.ts,datasets.ts}`
- Modify: `apps/learn/src/lib/koan/catalog.ts`, `apps/learn/src/lib/koan/shell.svelte.ts`,
  `apps/learn/src/lib/koan/conversations.svelte.ts`, `apps/learn/package.json`

- [ ] **Step 1: Read the pattern**

Read `apps/learn/src/lib/koan/demos/chart/` in full — `meta.ts`, `index.svelte`,
`ChartExplorer.svelte`, `ChartControls.svelte`, `store.svelte.ts`, `registry.ts`, `datasets.ts`.
Match it. Also read how `sparkline` is registered in `catalog.ts`, `shell.svelte.ts`
(`DEMO_ROUTE`, `ShellDemoType`) and `conversations.svelte.ts` (`pickDemoKind`).

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
| Differentiate by | `color` / `pattern` / `symbol`    |

Use `@rokkit/ui` controls (`Select`, `Toggle`), not bespoke ones.

- [ ] **Step 5: Write `GraphExplorer.svelte`**

Renders `<Graph>`, `<EntityView>` or `<EntitiesView>` per the `view` state, driven by the store,
with a `data-graph-explorer` marker element for the smoke gate. Selection is two-way:
clicking a node in the diagram sets `selected`, which `EntityView` reads.

- [ ] **Step 6: Write `meta.ts`**

Follow `demos/chart/meta.ts` exactly. `id: 'graph'`, `category: 'data'`, keywords covering
`graph`, `diagram`, `er-diagram`, `schema`, `entity`, `nodes`, `edges`, `call-graph`,
`dependency`, `force-directed`. The `api.attrs` list must publish **every** data-attribute from
`base/graph.css` — it is the consumer's override contract, not decoration. `snippets` must
include: a minimal `<Graph>`, the `fields`-mapped non-dbd example, `fromSchemaModel` sugar, a
`createGraphPreset` override, and a **one-rule CSS override** showing
`[data-node-kind='table'] { --node-accent: var(--primary) }` taking effect.

- [ ] **Step 7: Register it**

Add the `graph` import and catalog entry in `catalog.ts`; add `graph` to `DEMO_ROUTE` and
`ShellDemoType` in `shell.svelte.ts`; add its keywords to `pickDemoKind` in
`conversations.svelte.ts`. Make sure the `graph`/`diagram` keywords do not collide with the
chart demo's — `demos/chart/meta.ts` currently claims `graph` and `graphs`, so **move those two
keywords to this demo** and leave chart the plotting words.

- [ ] **Step 8: Write `docs.md`**

Cover: the data contract and `fields`, the layout interface and the two built-ins, the full
data-attribute vocabulary, `createGraphPreset` and `using`, and the one-rule CSS override. State
plainly that `SchemaModel` stays in the consuming app.

- [ ] **Step 9: Verify both routes render**

Run: `cd apps/learn && bun run build`
Expected: build succeeds; `/components/graph` prerenders.

Run: `cd apps/learn && bun run dev`, then open `/app/graph` and exercise **every** control.
Expected: each control visibly changes the render; no console errors.

- [ ] **Step 10: Commit**

```bash
git add apps/learn packages/graph bun.lock
git commit -m "feat(learn): graph demo — the verification surface for @rokkit/graph

One control per claim in the design's verification table, so layout, density,
arrange, edge style and the color|pattern|symbol channel are all checkable by
eye rather than only by unit test.

Two datasets on purpose. The second is deliberately NOT dbd-shaped — it maps a
service call graph through `fields` — because that is the only thing that
proves the contract is general and not a SchemaModel in disguise.

Moved the `graph`/`graphs` keywords off the chart demo, which had claimed them."
```

---

## Task 19: E2E and contrast gates

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

## Task 20: Docs, journal, and slice close-out

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

## Task 21: dbd consumes the package

**This task is in a different repository** (`~/Developer/dbd`) and must be a separate PR. It is
the acceptance proof for slice 1 — do not call the slice done without it.

- [ ] **Step 1: Wait for the npm release**

`@rokkit/graph` must be published before dbd can depend on it. Either release from Rokkit
(`bun run bump`, per the release checklist in the global instructions) or link the workspace
locally for the port and switch to the published range before merging dbd's PR.

- [ ] **Step 2: Install and replace**

In `~/Developer/dbd/site`:

```bash
bun add @rokkit/graph
```

Rewrite `site/src/routes/diagram/+page.svelte` and `site/src/routes/projects/+page.svelte` to
import `Graph` from `@rokkit/graph` and `EntityView`/`EntitiesView`/`fromSchemaModel` from
`@rokkit/graph/schema`.

- [ ] **Step 3: Delete what moved**

```bash
cd ~/Developer/dbd
git rm site/src/lib/design/{model,layout,layout-cards,layout-clusters,layout-edges,layout-types,md}.ts
git rm site/src/lib/design/{EntityDiagram,EntityView,EntitiesView,DiagramView,Icon}.svelte
git rm site/src/lib/design/{layout,layout-clusters,layout-edges,model}.test.ts
```

**Keep** `model.ts` if `SchemaModel`/`validateModel` still have callers — check first:

```bash
rg --no-ignore -g '!node_modules' "validateModel|SchemaModel" site/src
```

If they do, reduce `model.ts` to just those two and keep `model.test.ts`'s cases for them.

**Keep** `Header.svelte`, `store.ts`, `fragment.ts`, `data.ts`, `ProjectsView.svelte`,
`SchemaSnapshot.svelte`, `Tabs.svelte`, `ContentHeader.svelte`, `Sidebar.svelte`.

- [ ] **Step 4: Strip the superseded CSS**

From `site/src/lib/design/styles.css`, delete the `DIAGRAM` block (`.dg-*`, lines ~144-232) and
the `.dbd-app` scoped preflight if nothing else in the subtree needs it. **Keep** the
`SCHEMA SNAPSHOT THUMBNAIL` block — `SchemaSnapshot.svelte` stays.

- [ ] **Step 5: Verify against the original**

Run dbd's own suite and compare the rendered diagram with `main` side by side:

```bash
cd ~/Developer/dbd/site && bun run test && bun run build && bun run preview
```

Expected: the diagram, entity view and entity table render equivalently. Two **intended**
differences: column types and fk icons are now `ink-mute` rather than `ink-soft` (a contrast
fix), and the selected card uses `primary`/`on-primary` rather than baked-hex `accent`.

- [ ] **Step 6: Commit in dbd and close the issue**

```bash
cd ~/Developer/dbd
git add -A
git commit -m "refactor(site): consume @rokkit/graph for the schema viewer

Deletes 1,170 lines of viewer source and ~400 of tests, now shared with sensei
via @rokkit/graph. SchemaModel stays here — the package speaks its own
canonical model, so the hand-written mirror of schema_model.rs is not
duplicated into a third place.

Two intended visual changes, both contrast fixes: column types and fk icons
move off ink-soft (which cannot carry an interactive control's text) onto
ink-mute, and the selected card uses primary/on-primary instead of accent,
whose on-colour was a build-time-baked hex that could not react to a skin."
gh issue comment 159 --body "Slice 1 shipped — see rokkit docs/design/23-graph.md. Slices 2 (force-directed) and 3 (dbd#24 v2 model) remain."
```

---

## Verification summary

| Gate         | Command                                | Expected                                                 |
| ------------ | -------------------------------------- | -------------------------------------------------------- |
| Unit         | `bun run test:ci`                      | All pass, incl. every ported numeric assertion unchanged |
| Lint         | `bun run lint`                         | 0 errors, **0 warnings**                                 |
| Types        | `bun run check:types`                  | 0 errors                                                 |
| Declarations | `bun run check:build`                  | 0 errors                                                 |
| Svelte       | `bun run check:svelte`                 | 0 errors, 0 warnings                                     |
| Apps build   | `bun run build:apps`                   | Success                                                  |
| Coverage     | `bun run coverage`                     | Meets the `packages/graph` thresholds                    |
| E2E          | `cd apps/learn && npx playwright test` | All pass, accept-lists unchanged                         |
| Acceptance   | dbd's site on the package              | Renders equivalently, two intended contrast fixes        |

**Two rules for this slice specifically:**

1. **A failing ported assertion means the port changed behaviour.** Fix the port. Do not
   rebaseline a characterization test — its whole purpose is to fail when geometry moves.
2. **A contrast failure on a graph selector is a real finding.** Fix the token in
   `rokkit/graph.css`. Do not add it to an accept-list.
