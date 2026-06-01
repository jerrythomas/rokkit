# Guides Section + Prose-Doc `.md` Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the eleven guide pages into a dedicated `/guides` section with its own layout, search, and TOC; convert all 59 prose-doc files (11 guide bodies + 48 per-component docs) from TypeScript template-literal exports to plain `.md` files loaded via Vite's `?raw` import suffix.

**Architecture:** Two coordinated changes. (1) A new `/guides` route group with a top-bar + 240px TOC rail + scrollable content column, backed by a single `guides` array in `src/lib/guides/index.ts` that drives routes, TOC, and a minisearch index. (2) All `<demo>/docs.ts` and `guide-*/content.ts` files become sibling `.md` files; consumers swap `import { xDocs } from './docs'` for `import docs from './docs.md?raw'`. The chat-shell layout (`src/routes/app/+layout.svelte`) needs no changes — `meta.docs` stays a `string` at the consumer.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), Vite 7, minisearch 7, UnoCSS, Bun, TypeScript, vitest, Playwright.

**Backlog:** `docs/backlog/2026-06-01-guides-section-split.md`

---

## File Structure

### New files (created)

| Path | Responsibility |
|---|---|
| `apps/learn/scripts/ts-doc-to-md.mjs` | One-shot converter — strips `export const xDocs = \`…\`` scaffolding and unescapes backticks / `${...}`. Throwaway. |
| `apps/learn/src/lib/guides/index.ts` | Exports the ordered `guides` array, `findGuide(slug)`, and a memoised minisearch index. Single source of truth. |
| `apps/learn/src/lib/guides/GuidePage.svelte` | Moved from `src/lib/koan/components/GuidePage.svelte` — markdown renderer with prose styling. |
| `apps/learn/src/lib/guides/Search.svelte` | Top-bar search input + dropdown of matches. Uses the minisearch index from `index.ts`. |
| `apps/learn/src/lib/guides/<slug>/content.md` × 11 | Migrated guide bodies (markdown, no escapes). |
| `apps/learn/src/lib/koan/demos/<component>/docs.md` × 48 | Migrated per-component docs (markdown, no escapes). |
| `apps/learn/src/routes/guides/+layout.svelte` | Top-bar + two-column grid; sets up scroll containers. |
| `apps/learn/src/routes/guides/+page.svelte` | Index page listing all guides grouped by category. |
| `apps/learn/src/routes/guides/[slug]/+page.svelte` | `<GuidePage markdown={data.guide.content} />`. |
| `apps/learn/src/routes/guides/[slug]/+page.ts` | Load fn: `findGuide(slug)` → 404 on miss. |
| `apps/learn/src/routes/app/guide-[slug]/+page.ts` | 301 redirect to `/guides/<slug>`. |
| `apps/learn/src/lib/guides/index.test.ts` | Unit tests for `findGuide` + search. |

### Modified files

| Path | Change |
|---|---|
| `apps/learn/src/lib/koan/catalog.ts` | Remove 11 guide imports + catalog entries + intent-map entries. |
| `apps/learn/src/lib/koan/shell.svelte.ts` | Remove `guide-*` literals from `ShellDemoType` union. |
| `apps/learn/src/lib/koan/demos/<component>/meta.ts` × 48 | Swap import: `import { xDocs } from './docs'` → `import docs from './docs.md?raw'`. Update `docs: xDocs` → `docs`. |

### Deleted files

| Path | Reason |
|---|---|
| `apps/learn/src/lib/koan/demos/guide-*/` × 11 folders | Whole guide demos retired (meta, index, content). |
| `apps/learn/src/routes/app/guide-<each-slug>/` × 11 folders | Replaced by single dynamic `app/guide-[slug]` redirect. |
| `apps/learn/src/lib/koan/components/GuidePage.svelte` | Moved to `src/lib/guides/`. |
| `apps/learn/src/lib/koan/demos/<component>/docs.ts` × 48 | Replaced by sibling `docs.md`. |

---

## Working Directory

**All paths in this plan are relative to `/Users/Jerry/Developer/rokkit` (the repo root). All `bun` commands run from `apps/learn/` unless otherwise noted.**

---

## Task 1: Converter script + dry-run

Build the throwaway `.ts` → `.md` converter, then dry-run it against one guide and one component-doc file to verify output. No file system writes in production paths yet — the script writes to `apps/learn/.tmp-md-migration/` first.

**Files:**
- Create: `apps/learn/scripts/ts-doc-to-md.mjs`
- Create: `apps/learn/scripts/ts-doc-to-md.test.mjs`

- [ ] **Step 1.1: Write the failing test for the converter**

Create `apps/learn/scripts/ts-doc-to-md.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { convert } from './ts-doc-to-md.mjs'

test('strips export const scaffolding', () => {
  const input = "export const buttonDocs = `# Button\n\nA button.`"
  assert.equal(convert(input), '# Button\n\nA button.')
})

test('unescapes backticks', () => {
  const input = "export const xDocs = `Use \\`code\\` inline.`"
  assert.equal(convert(input), 'Use `code` inline.')
})

test("unescapes template interpolation sequences", () => {
  const input = "export const xDocs = `Var: \\${name}`"
  assert.equal(convert(input), 'Var: ${name}')
})

test('handles trailing newline before closing backtick', () => {
  const input = "export const xDocs = `# H1\n\nbody\n`\n"
  assert.equal(convert(input), '# H1\n\nbody\n')
})

test('throws on file without the expected pattern', () => {
  assert.throws(() => convert('const x = 1'), /no matching `export const/i)
})
```

- [ ] **Step 1.2: Run the test to verify it fails**

```bash
cd apps/learn && bun test scripts/ts-doc-to-md.test.mjs
```

Expected: 5 failures (module not found).

- [ ] **Step 1.3: Implement `convert`**

Create `apps/learn/scripts/ts-doc-to-md.mjs`:

```js
#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, basename, join } from 'node:path'

const PATTERN = /^\s*export\s+const\s+\w+\s*=\s*`([\s\S]*)`\s*;?\s*$/

export function convert(source) {
  const m = source.match(PATTERN)
  if (!m) throw new Error('no matching `export const NAME = `...`` pattern found')
  return m[1]
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${')
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('usage: ts-doc-to-md.mjs <input.ts> [<input.ts> ...]')
    process.exit(1)
  }
  for (const inPath of args) {
    const source = await readFile(inPath, 'utf8')
    const md = convert(source)
    const outPath = inPath.replace(/\.ts$/, '.md')
    if (!existsSync(dirname(outPath))) await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, md, 'utf8')
    console.log(`✓ ${inPath} → ${basename(outPath)}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
```

- [ ] **Step 1.4: Run the test to verify it passes**

```bash
cd apps/learn && bun test scripts/ts-doc-to-md.test.mjs
```

Expected: 5/5 pass.

- [ ] **Step 1.5: Dry-run against one file each**

```bash
cd apps/learn && node scripts/ts-doc-to-md.mjs src/lib/koan/demos/guide-getting-started/content.ts src/lib/koan/demos/button/docs.ts
```

Expected: two files created — `src/lib/koan/demos/guide-getting-started/content.md` and `src/lib/koan/demos/button/docs.md`. Open both manually and confirm:
- No `\`` or `\${` sequences remain.
- The first heading (`# Getting Started`, `## A flexible interactive primitive`) is on line 1.
- A code block in each file looks correct in a markdown preview.

If anything looks wrong, delete the two `.md` files and fix the converter before continuing.

- [ ] **Step 1.6: Delete the dry-run outputs**

```bash
cd apps/learn && rm src/lib/koan/demos/guide-getting-started/content.md src/lib/koan/demos/button/docs.md
```

We'll regenerate them in the bulk pass.

- [ ] **Step 1.7: Commit**

```bash
git add apps/learn/scripts/ts-doc-to-md.mjs apps/learn/scripts/ts-doc-to-md.test.mjs
git commit -m "chore(learn): add ts-doc-to-md converter for prose-doc migration"
```

---

## Task 2: Migrate all 48 per-component `docs.ts` → `docs.md`

Run the converter against every `<demo>/docs.ts` file, swap the `meta.ts` import for each, delete the `.ts` files, verify build still works.

**Files:**
- Run converter against: `apps/learn/src/lib/koan/demos/*/docs.ts` (48 files)
- Modify: `apps/learn/src/lib/koan/demos/<component>/meta.ts` × 48

- [ ] **Step 2.1: Generate the `.md` files in bulk**

```bash
cd apps/learn && find src/lib/koan/demos -mindepth 2 -maxdepth 2 -name 'docs.ts' -print0 | xargs -0 node scripts/ts-doc-to-md.mjs
```

Expected: 48 lines of `✓ <path> → docs.md`. Verify count:

```bash
ls apps/learn/src/lib/koan/demos/*/docs.md | wc -l
```

Expected: `48`.

- [ ] **Step 2.2: Swap one `meta.ts` import as a smoke test**

Edit `apps/learn/src/lib/koan/demos/button/meta.ts`. Find the import line near the top:

```ts
import { buttonDocs } from './docs'
```

Replace with:

```ts
import docs from './docs.md?raw'
```

And in the exported meta object, find:

```ts
docs: buttonDocs
```

Replace with:

```ts
docs
```

- [ ] **Step 2.3: Smoke-test build**

```bash
cd apps/learn && bun run build
```

Expected: build completes, no errors mentioning `button/meta.ts` or `docs.md`. (Other meta.ts files still using the old import are fine — their `docs.ts` still exists.)

If the build complains that Vite can't resolve `?raw`, check that `vite` is 5+ (it is — `vite v7.1.6`). The `?raw` suffix is built in; no plugin needed.

- [ ] **Step 2.4: Swap the other 47 `meta.ts` imports**

For each `<component>` in:
`avatar`, `badge`, `breadcrumbs`, `button-group`, `card`, `carousel`, `chart`, `code-group`, `code`, `combo`, `date-picker`, `divider`, `dropdown`, `effects`, `floating-action`, `floating-navigation`, `form`, `grid`, `lazy-tree`, `list`, `markdown-renderer`, `menu`, `message`, `multi-select`, `palette-manager`, `pill`, `progress`, `range`, `rating`, `search-filter`, `select`, `stack`, `status-list`, `stepper`, `swatch`, `switch`, `table`, `tabs`, `theme-wizard`, `timeline`, `toasts`, `toggle`, `toolbar`, `tooltip`, `tree`, `upload-progress`, `upload-target`

…apply the same edit pattern as Step 2.2 to `apps/learn/src/lib/koan/demos/<component>/meta.ts`:
- Change `import { <camelCaseName>Docs } from './docs'` → `import docs from './docs.md?raw'`
- Change `docs: <camelCaseName>Docs` → `docs`

The camelCase export name varies (e.g. `tableDocs`, `themeWizardDocs`, `datePickerDocs`, `lazyTreeDocs`). Read each file first to confirm the exact symbol name.

Verify with:

```bash
cd apps/learn && grep -l "from './docs'" src/lib/koan/demos/*/meta.ts
```

Expected: no output (all imports switched).

- [ ] **Step 2.5: Delete all 48 `docs.ts` files**

```bash
cd apps/learn && find src/lib/koan/demos -mindepth 2 -maxdepth 2 -name 'docs.ts' -delete
```

Verify:

```bash
ls apps/learn/src/lib/koan/demos/*/docs.ts 2>&1 | head -2
```

Expected: `ls: ... No such file or directory` (zsh) — no files found.

- [ ] **Step 2.6: Full build to verify all 48 swaps**

```bash
cd apps/learn && bun run build
```

Expected: build completes with no new warnings, no missing-import errors.

- [ ] **Step 2.7: Lint**

```bash
cd /Users/Jerry/Developer/rokkit && bun run lint
```

Expected: 0 errors (warnings are pre-existing and acceptable per CLAUDE.md).

- [ ] **Step 2.8: Manually verify rendering for three representative demos**

```bash
cd apps/learn && bun run dev
```

Then in a browser:
1. Open `http://localhost:5173/app/table` and click the **Docs** tab on the canvas. Confirm the markdown renders identically to before — headings, code blocks, lists.
2. Repeat for `/app/form` and `/app/chart`.

Stop the dev server.

- [ ] **Step 2.9: Commit**

```bash
git add apps/learn/src/lib/koan/demos/
git commit -m "refactor(learn): migrate 48 component docs.ts to docs.md (Vite ?raw)"
```

---

## Task 3: Build the `/guides` section infrastructure (no content yet)

Create the layout, GuidePage component, `guides` index module, and search component. Routes will resolve from an empty `guides` array for now — Task 4 fills the content.

**Files:**
- Create: `apps/learn/src/lib/guides/index.ts`
- Create: `apps/learn/src/lib/guides/GuidePage.svelte`
- Create: `apps/learn/src/lib/guides/Search.svelte`
- Create: `apps/learn/src/lib/guides/index.test.ts`
- Create: `apps/learn/src/routes/guides/+layout.svelte`
- Create: `apps/learn/src/routes/guides/+page.svelte`
- Create: `apps/learn/src/routes/guides/[slug]/+page.svelte`
- Create: `apps/learn/src/routes/guides/[slug]/+page.ts`

- [ ] **Step 3.1: Move `GuidePage.svelte` and update the one remaining reference**

```bash
cd /Users/Jerry/Developer/rokkit && git mv apps/learn/src/lib/koan/components/GuidePage.svelte apps/learn/src/lib/guides/GuidePage.svelte
```

(Manually `mkdir -p apps/learn/src/lib/guides` first if it doesn't exist.)

The only reference to it lives in the soon-to-be-deleted `guide-*/index.svelte` files (still referenced as `'$lib/koan/components/GuidePage.svelte'`) — leave those broken for now; Task 5 deletes them.

- [ ] **Step 3.2: Write the failing test for `findGuide` and search**

Create `apps/learn/src/lib/guides/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { findGuide, searchGuides, guides } from './index'

describe('guides registry', () => {
  it('exposes a non-empty ordered array', () => {
    expect(guides.length).toBeGreaterThan(0)
    expect(guides[0]).toHaveProperty('slug')
    expect(guides[0]).toHaveProperty('title')
    expect(guides[0]).toHaveProperty('content')
  })

  it('finds a guide by slug', () => {
    const g = findGuide('getting-started')
    expect(g?.title).toMatch(/getting started/i)
  })

  it('returns undefined for unknown slug', () => {
    expect(findGuide('does-not-exist')).toBeUndefined()
  })

  it('searches title and body content', () => {
    const results = searchGuides('accessibility')
    expect(results.some((r) => r.slug === 'accessibility')).toBe(true)
  })

  it('returns empty array for empty query', () => {
    expect(searchGuides('')).toEqual([])
  })
})
```

- [ ] **Step 3.3: Run the test to verify it fails**

```bash
cd apps/learn && bun run test:unit -- guides/index.test.ts
```

Expected: failures — module not found.

- [ ] **Step 3.4: Implement `src/lib/guides/index.ts`**

Create `apps/learn/src/lib/guides/index.ts`:

```ts
import MiniSearch from 'minisearch'

export interface Guide {
  slug: string
  title: string
  description: string
  category: 'basics' | 'data' | 'design' | 'workflows' | 'advanced'
  content: string
}

// Glob loads every co-located content.md as a raw string at build time.
const raw = import.meta.glob('./*/content.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

interface GuideManifestEntry {
  slug: string
  title: string
  description: string
  category: Guide['category']
}

// Hand-ordered manifest — order here = order in the TOC and index page.
const manifest: GuideManifestEntry[] = [
  { slug: 'getting-started', title: 'Getting Started', description: 'Install, set up, render your first component.', category: 'basics' },
  { slug: 'data-binding', title: 'Data Binding', description: 'Field mapping, value, onchange.', category: 'data' },
  { slug: 'composability', title: 'Composability', description: 'Snippets and proxy items.', category: 'design' },
  { slug: 'theming', title: 'Theming & Design', description: 'Themes, layouts, design tokens.', category: 'design' },
  { slug: 'accessibility', title: 'Accessibility & i18n', description: 'Keyboard, ARIA, localisation.', category: 'design' },
  { slug: 'forms', title: 'Forms', description: 'FormRenderer, FormBuilder, lookups, validation.', category: 'workflows' },
  { slug: 'charts', title: 'Charts', description: 'Chart shapes, axes, data binding.', category: 'workflows' },
  { slug: 'utilities', title: 'Utilities', description: 'Helpers, hooks, small pieces.', category: 'advanced' },
  { slug: 'toolkit', title: 'Toolkit', description: 'Controllers, actions, navigator.', category: 'advanced' },
  { slug: 'toolchain', title: 'Toolchain', description: 'Build, lint, test setup.', category: 'advanced' },
  { slug: 'ai-chatbots', title: 'AI Chatbots & Blocks', description: 'Building chat interfaces.', category: 'workflows' }
]

export const guides: Guide[] = manifest.map((entry) => {
  const content = raw[`./${entry.slug}/content.md`]
  if (!content) throw new Error(`Missing content for guide "${entry.slug}" — expected ./${entry.slug}/content.md`)
  return { ...entry, content }
})

export function findGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

const index = new MiniSearch<Guide>({
  fields: ['title', 'description', 'content'],
  storeFields: ['slug', 'title', 'description', 'category'],
  idField: 'slug',
  searchOptions: { boost: { title: 3, description: 2 }, fuzzy: 0.2, prefix: true }
})
index.addAll(guides)

export interface SearchResult {
  slug: string
  title: string
  description: string
  category: Guide['category']
  score: number
}

export function searchGuides(query: string): SearchResult[] {
  const q = query.trim()
  if (!q) return []
  return index.search(q).map((r) => ({
    slug: r.id as string,
    title: r.title as string,
    description: r.description as string,
    category: r.category as Guide['category'],
    score: r.score
  }))
}

export function guidesByCategory(): Record<Guide['category'], Guide[]> {
  const out: Record<string, Guide[]> = {}
  for (const g of guides) {
    (out[g.category] ??= []).push(g)
  }
  return out as Record<Guide['category'], Guide[]>
}
```

- [ ] **Step 3.5: Create placeholder content.md files so the test passes**

We need each of the 11 slug folders to exist with a content.md. They will be properly populated in Task 4, but we need them now for `guides` to load without throwing. For each slug in the manifest, create a stub:

```bash
cd apps/learn && for slug in getting-started data-binding composability theming accessibility forms charts utilities toolkit toolchain ai-chatbots; do
  mkdir -p "src/lib/guides/$slug"
  echo "# ${slug}\n\nStub — to be filled in Task 4." > "src/lib/guides/$slug/content.md"
done
```

- [ ] **Step 3.6: Run the unit tests**

```bash
cd apps/learn && bun run test:unit -- guides/index.test.ts
```

Expected: 5/5 pass.

- [ ] **Step 3.7: Implement `Search.svelte`**

Create `apps/learn/src/lib/guides/Search.svelte`:

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'
  import { searchGuides, type SearchResult } from './index'

  let query = $state('')
  const results = $derived<SearchResult[]>(searchGuides(query).slice(0, 8))
  let open = $state(false)

  function select(slug: string) {
    open = false
    query = ''
    goto(`/guides/${slug}`)
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { open = false; query = '' }
    if (e.key === 'Enter' && results.length > 0) select(results[0].slug)
  }
</script>

<div class="search" role="search">
  <input
    type="search"
    placeholder="Search guides…"
    bind:value={query}
    onfocus={() => (open = true)}
    onblur={() => setTimeout(() => (open = false), 120)}
    onkeydown={onKey}
    aria-label="Search guides"
  />
  {#if open && results.length > 0}
    <ul class="results" role="listbox">
      {#each results as r (r.slug)}
        <li role="option">
          <button type="button" onclick={() => select(r.slug)}>
            <strong>{r.title}</strong>
            <span>{r.description}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search { position: relative; width: 100%; max-width: 360px; }
  input {
    width: 100%;
    padding: 8px 12px;
    font: 400 13px var(--font-ui);
    background: var(--paper-soft, #f6f4ef);
    border: 1px solid var(--paper-edge, #e0dccc);
    border-radius: 6px;
    color: var(--ink, #1a1a1a);
    outline: none;
  }
  input:focus { border-color: var(--ink-soft, #555); }
  .results {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    list-style: none;
    margin: 0; padding: 4px;
    background: var(--paper, #fff);
    border: 1px solid var(--paper-edge, #e0dccc);
    border-radius: 6px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    max-height: 320px;
    overflow-y: auto;
    z-index: 10;
  }
  .results li button {
    display: flex; flex-direction: column; align-items: flex-start;
    width: 100%; padding: 8px 10px;
    background: transparent; border: 0; cursor: pointer; text-align: left;
    border-radius: 4px;
  }
  .results li button:hover { background: var(--paper-soft, #f6f4ef); }
  .results li strong {
    font: 600 13px var(--font-display); color: var(--ink);
  }
  .results li span {
    font: 400 11px/1.4 var(--font-ui); color: var(--ink-soft, #666); margin-top: 2px;
  }
</style>
```

- [ ] **Step 3.8: Implement `/guides/+layout.svelte` with deterministic scroll containers**

Create `apps/learn/src/routes/guides/+layout.svelte`:

```svelte
<script lang="ts">
  import { page } from '$app/state'
  import { guides, guidesByCategory } from '$lib/guides'
  import Search from '$lib/guides/Search.svelte'

  let { children } = $props()
  const grouped = guidesByCategory()
  const categories = ['basics', 'data', 'design', 'workflows', 'advanced'] as const

  const activeSlug = $derived(page.params.slug ?? null)
</script>

<div class="guides-shell">
  <header class="topbar">
    <a href="/" class="brand">道 Rokkit</a>
    <Search />
    <a href="/app" class="back">Open Koan →</a>
  </header>

  <div class="body">
    <nav class="rail" aria-label="Guides">
      {#each categories as cat (cat)}
        {#if grouped[cat]?.length}
          <div class="cat-label">{cat}</div>
          <ul>
            {#each grouped[cat] as g (g.slug)}
              <li>
                <a
                  href={`/guides/${g.slug}`}
                  class:active={activeSlug === g.slug}
                  aria-current={activeSlug === g.slug ? 'page' : undefined}
                >{g.title}</a>
              </li>
            {/each}
          </ul>
        {/if}
      {/each}
    </nav>
    <main class="content">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  /* Load-bearing — see backlog 2026-06-01-guides-section-split.md. */
  /* Every flex/grid ancestor on the path to a scroll container needs min-height: 0,
     or the flex item refuses to shrink below content height and scroll disappears. */
  .guides-shell {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--paper, #fff);
  }
  .topbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 24px;
    border-bottom: 1px solid var(--paper-edge, #e0dccc);
  }
  .brand {
    font: 600 16px var(--font-display);
    color: var(--ink);
    text-decoration: none;
    letter-spacing: -0.01em;
  }
  .back {
    margin-left: auto;
    font: 400 13px var(--font-ui);
    color: var(--ink-soft, #666);
    text-decoration: none;
  }
  .back:hover { color: var(--ink); }
  .body {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-columns: 240px 1fr;
    overflow: hidden;
  }
  .rail {
    overflow-y: auto;
    min-height: 0;
    padding: 16px 12px;
    border-right: 1px solid var(--paper-edge, #e0dccc);
    background: var(--paper-soft, #faf8f3);
  }
  .cat-label {
    font: 500 10px var(--font-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft, #888);
    margin: 14px 8px 6px;
  }
  .rail ul { list-style: none; margin: 0; padding: 0; }
  .rail li a {
    display: block;
    padding: 6px 8px;
    font: 400 13px var(--font-ui);
    color: var(--ink, #1a1a1a);
    text-decoration: none;
    border-radius: 4px;
  }
  .rail li a:hover { background: var(--paper-edge, #ece7d6); }
  .rail li a.active {
    background: var(--ink, #1a1a1a);
    color: var(--paper, #fff);
  }
  .content {
    overflow-y: auto;
    min-height: 0;
    padding: 32px 48px 64px;
  }
</style>
```

- [ ] **Step 3.9: Implement the slug route and load function**

Create `apps/learn/src/routes/guides/[slug]/+page.ts`:

```ts
import { error } from '@sveltejs/kit'
import { findGuide } from '$lib/guides'
import type { PageLoad } from './$types'

export const load: PageLoad = ({ params }) => {
  const guide = findGuide(params.slug)
  if (!guide) error(404, `Guide "${params.slug}" not found`)
  return { guide }
}
```

Create `apps/learn/src/routes/guides/[slug]/+page.svelte`:

```svelte
<script lang="ts">
  import GuidePage from '$lib/guides/GuidePage.svelte'
  let { data } = $props()
</script>

<svelte:head><title>{data.guide.title} — Rokkit Guides</title></svelte:head>

<GuidePage markdown={data.guide.content} />

<footer class="follow-up">
  Have a follow-up? <a href={`/app?q=${encodeURIComponent(data.guide.title)}`}>Ask Koan →</a>
</footer>

<style>
  .follow-up {
    margin: 48px 0 0;
    padding: 16px 0 0;
    border-top: 1px solid var(--paper-edge, #e0dccc);
    font: 400 13px var(--font-ui);
    color: var(--ink-soft, #666);
  }
  .follow-up a { color: var(--ink); text-decoration: underline; }
</style>
```

- [ ] **Step 3.10: Implement the guides index page**

Create `apps/learn/src/routes/guides/+page.svelte`:

```svelte
<script lang="ts">
  import { guidesByCategory } from '$lib/guides'
  const grouped = guidesByCategory()
  const categories = ['basics', 'data', 'design', 'workflows', 'advanced'] as const
</script>

<svelte:head><title>Guides — Rokkit</title></svelte:head>

<h1>Guides</h1>
<p class="lead">Long-form reference for building with Rokkit.</p>

{#each categories as cat (cat)}
  {#if grouped[cat]?.length}
    <section>
      <h2>{cat}</h2>
      <ul class="cards">
        {#each grouped[cat] as g (g.slug)}
          <li>
            <a href={`/guides/${g.slug}`}>
              <strong>{g.title}</strong>
              <span>{g.description}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
{/each}

<style>
  h1 { font: 700 28px var(--font-display); margin: 0 0 6px; }
  .lead { font: 400 15px var(--font-ui); color: var(--ink-soft, #666); margin: 0 0 32px; }
  h2 {
    font: 500 12px var(--font-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft, #888);
    margin: 24px 0 12px;
  }
  .cards { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .cards li a {
    display: flex; flex-direction: column; gap: 4px;
    padding: 14px 16px;
    border: 1px solid var(--paper-edge, #e0dccc);
    border-radius: 8px;
    text-decoration: none;
    color: var(--ink);
    background: var(--paper, #fff);
  }
  .cards li a:hover { border-color: var(--ink-soft, #888); }
  .cards li strong { font: 600 14px var(--font-display); }
  .cards li span { font: 400 12.5px/1.5 var(--font-ui); color: var(--ink-soft, #666); }
</style>
```

- [ ] **Step 3.11: Build + smoke-test**

```bash
cd apps/learn && bun run build && bun run dev
```

Then in a browser:
1. Visit `http://localhost:5173/guides` — index page lists all 11 stubs grouped by category.
2. Click any guide — renders the stub markdown inside the layout.
3. Resize browser to 1024×600 and visit `/guides/getting-started`. Confirm: page itself does not scroll, content column scrolls if content overflows.
4. Tab through search input → type "acc" → arrow / enter → navigates to `/guides/accessibility`.

Stop dev server.

- [ ] **Step 3.12: Commit**

```bash
git add apps/learn/src/lib/guides/ apps/learn/src/routes/guides/
git rm apps/learn/src/lib/koan/components/GuidePage.svelte
git commit -m "feat(learn): scaffold /guides section (layout, search, registry, stub content)"
```

---

## Task 4: Migrate guide content into `src/lib/guides/<slug>/content.md`

Run the converter against each `guide-*/content.ts` (writing to the matching slug folder under `src/lib/guides/`), overwriting the stubs.

**Files:**
- Replace 11 files under `apps/learn/src/lib/guides/<slug>/content.md`

The mapping from old folder name to new slug:

| Old | New slug |
|---|---|
| `guide-getting-started` | `getting-started` |
| `guide-data-binding` | `data-binding` |
| `guide-composability` | `composability` |
| `guide-theming` | `theming` |
| `guide-accessibility` | `accessibility` |
| `guide-forms` | `forms` |
| `guide-charts` | `charts` |
| `guide-utilities` | `utilities` |
| `guide-toolkit` | `toolkit` |
| `guide-toolchain` | `toolchain` |
| `guide-ai-chatbots` | `ai-chatbots` |

- [ ] **Step 4.1: Migrate each guide**

For each row in the table above, run:

```bash
cd apps/learn && node scripts/ts-doc-to-md.mjs src/lib/koan/demos/<old>/content.ts && mv src/lib/koan/demos/<old>/content.md src/lib/guides/<new>/content.md
```

Concretely, for `getting-started`:

```bash
cd apps/learn && node scripts/ts-doc-to-md.mjs src/lib/koan/demos/guide-getting-started/content.ts && mv src/lib/koan/demos/guide-getting-started/content.md src/lib/guides/getting-started/content.md
```

Repeat for the other ten.

Verify:

```bash
ls apps/learn/src/lib/guides/*/content.md | wc -l
```

Expected: `11`.

```bash
grep -c '^# ' apps/learn/src/lib/guides/*/content.md
```

Expected: every file shows `1` (each starts with an H1).

- [ ] **Step 4.2: Build + smoke-test in browser**

```bash
cd apps/learn && bun run build && bun run dev
```

Visit `/guides/accessibility` — should now render real content (~500+ words, multiple sections, code blocks). Visit `/guides/forms` — same. Visit a long one like `/guides/theming` and confirm scroll works to the bottom on a small viewport.

- [ ] **Step 4.3: Re-run unit tests**

```bash
cd apps/learn && bun run test:unit -- guides/index.test.ts
```

Expected: 5/5 pass (with real content now backing the search).

- [ ] **Step 4.4: Commit**

```bash
git add apps/learn/src/lib/guides/*/content.md
git commit -m "content(learn): migrate 11 guide bodies from .ts template literals to .md"
```

---

## Task 5: Remove guides from chat-shell + add legacy-URL redirect

Strip the eleven guide entries from the `/app` catalog and demo type union, delete the old route folders and demo folders, add a catch-all redirect.

**Files:**
- Modify: `apps/learn/src/lib/koan/catalog.ts`
- Modify: `apps/learn/src/lib/koan/shell.svelte.ts`
- Create: `apps/learn/src/routes/app/guide-[slug]/+page.ts`
- Delete: `apps/learn/src/lib/koan/demos/guide-*/` × 11 folders
- Delete: `apps/learn/src/routes/app/guide-<each-slug>/` × 11 folders

- [ ] **Step 5.1: Add the redirect route**

Create `apps/learn/src/routes/app/guide-[slug]/+page.ts`:

```ts
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = ({ params }) => {
  redirect(301, `/guides/${params.slug}`)
}
```

This catch-all dynamic route handles `/app/guide-anything` and 301-redirects to `/guides/anything`. The 404 case for unknown guides is handled at the `/guides/[slug]` layer.

- [ ] **Step 5.2: Delete the 11 static `app/guide-*` route folders**

```bash
cd apps/learn && rm -rf \
  src/routes/app/guide-getting-started \
  src/routes/app/guide-data-binding \
  src/routes/app/guide-composability \
  src/routes/app/guide-theming \
  src/routes/app/guide-accessibility \
  src/routes/app/guide-forms \
  src/routes/app/guide-charts \
  src/routes/app/guide-utilities \
  src/routes/app/guide-toolkit \
  src/routes/app/guide-toolchain \
  src/routes/app/guide-ai-chatbots
```

(SvelteKit resolves the static route over the dynamic route, so we have to delete the static ones for the redirect to fire. After deletion, only the `guide-[slug]/` dynamic route remains.)

- [ ] **Step 5.3: Remove guide entries from the catalog**

Edit `apps/learn/src/lib/koan/catalog.ts`. Delete these 11 import lines (lines ~52–62):

```ts
import guideGettingStarted from './demos/guide-getting-started/meta'
import guideDataBinding from './demos/guide-data-binding/meta'
import guideComposability from './demos/guide-composability/meta'
import guideTheming from './demos/guide-theming/meta'
import guideAccessibility from './demos/guide-accessibility/meta'
import guideForms from './demos/guide-forms/meta'
import guideCharts from './demos/guide-charts/meta'
import guideUtilities from './demos/guide-utilities/meta'
import guideToolkit from './demos/guide-toolkit/meta'
import guideToolchain from './demos/guide-toolchain/meta'
import guideAiChatbots from './demos/guide-ai-chatbots/meta'
```

Then search the rest of `catalog.ts` for each identifier (`guideGettingStarted`, etc.) and the intent-map block (lines ~155–165, the `'guide-...': '/app/guide-...'` entries) and remove every reference. The catalog array literal and any intent maps must no longer mention these symbols.

Verify nothing remains:

```bash
cd apps/learn && grep -n "guide" src/lib/koan/catalog.ts
```

Expected: no output, or only matches that are clearly unrelated (e.g. "guidelines" in a comment).

- [ ] **Step 5.4: Remove `guide-*` literals from `ShellDemoType`**

Edit `apps/learn/src/lib/koan/shell.svelte.ts`. Find the `ShellDemoType` union (around line 11+) and delete every `| 'guide-...'` line (11 of them).

Verify:

```bash
cd apps/learn && grep -n "guide-" src/lib/koan/shell.svelte.ts
```

Expected: no output.

- [ ] **Step 5.5: Delete the 11 demo folders**

```bash
cd apps/learn && rm -rf src/lib/koan/demos/guide-*
```

Verify:

```bash
ls apps/learn/src/lib/koan/demos | grep ^guide- || echo "none"
```

Expected: `none`.

- [ ] **Step 5.6: Check for stray references to deleted symbols**

```bash
cd apps/learn && grep -rn "guide-\(getting-started\|data-binding\|composability\|theming\|accessibility\|forms\|charts\|utilities\|toolkit\|toolchain\|ai-chatbots\)" src/ 2>/dev/null
```

Expected: a small number of matches, all inside `src/lib/guides/index.ts` (the new manifest) or `src/routes/app/guide-[slug]/+page.ts` (the redirect). If anything else turns up — e.g. references in `match.svelte.ts`, conversation seed data, the welcome screen suggestions — remove them.

Common spots to double-check:
- `apps/learn/src/lib/koan/match.svelte.ts` — intent rules that mention guide demo IDs.
- `apps/learn/src/lib/koan/components/Welcome.svelte` and `ComposerSuggestions.svelte` — seeded suggestion chips.
- `apps/learn/src/lib/koan/conversations.svelte.ts` — any seed conversations referencing guide demos.

- [ ] **Step 5.7: Build**

```bash
cd apps/learn && bun run build
```

Expected: build completes. If TS complains about the narrowed `ShellDemoType`, fix the call sites that the compiler points to (usually a default-case `never` check).

- [ ] **Step 5.8: Lint**

```bash
cd /Users/Jerry/Developer/rokkit && bun run lint
```

Expected: 0 errors.

- [ ] **Step 5.9: Manual verification**

```bash
cd apps/learn && bun run dev
```

In a browser:
1. `http://localhost:5173/app/guide-accessibility` → should redirect to `/guides/accessibility`.
2. `http://localhost:5173/app` → search box / suggestions no longer surface "Accessibility & i18n" or other guide titles.
3. `http://localhost:5173/guides/accessibility` → renders correctly with full content, no chat shell, scroll works.
4. `http://localhost:5173/app/table` → still works, Docs tab still renders.

Stop dev server.

- [ ] **Step 5.10: Commit**

```bash
git add apps/learn/src/
git commit -m "refactor(learn): retire guide demos from /app, redirect to /guides"
```

---

## Task 6: Final verification + cleanup

Confirm the test suite passes, lint is clean, e2e tests still pass, and remove the converter script.

- [ ] **Step 6.1: Full unit test suite**

```bash
cd /Users/Jerry/Developer/rokkit && bun run test:ci
```

Expected: all tests pass. The 5 new guides tests are included.

- [ ] **Step 6.2: Lint**

```bash
cd /Users/Jerry/Developer/rokkit && bun run lint
```

Expected: 0 errors.

- [ ] **Step 6.3: Production build**

```bash
cd apps/learn && bun run build
```

Expected: clean build, no warnings related to this work.

- [ ] **Step 6.4: E2E smoke**

```bash
cd apps/learn && npx playwright test --grep-invert guide
```

Expected: all non-guide e2e tests pass. (If any e2e test references the old `/app/guide-*` URLs, update or remove it now — those URLs still work via the redirect, so existing tests should be fine.)

- [ ] **Step 6.5: Delete the throwaway converter**

```bash
cd /Users/Jerry/Developer/rokkit && rm apps/learn/scripts/ts-doc-to-md.mjs apps/learn/scripts/ts-doc-to-md.test.mjs
rmdir apps/learn/scripts 2>/dev/null || true
```

- [ ] **Step 6.6: Check for orphaned references in static content**

```bash
cd /Users/Jerry/Developer/rokkit && grep -rn "/app/guide-" docs/ apps/learn/static/ 2>/dev/null | head -20
```

If `docs/llms/` or `apps/learn/static/llms/` hardcode `/app/guide-*` URLs, update them to `/guides/*`. These files feed `llms.txt` consumers and should reflect the current URL shape, not rely on the redirect.

- [ ] **Step 6.7: Update `agents/journal.md`**

Append a brief entry summarising the change, in the style of existing entries (commit hashes from the work above, a one-paragraph summary).

- [ ] **Step 6.8: Mark backlog item complete**

Edit `docs/backlog/2026-06-01-guides-section-split.md` and change the `**Status:**` line to `Shipped (2026-06-01) — see agents/journal.md`.

- [ ] **Step 6.9: Final commit**

```bash
git add docs/backlog/2026-06-01-guides-section-split.md agents/journal.md docs/ apps/learn/static/
git commit -m "docs(learn): mark guides-section split complete, update llms references"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Implementing task(s) |
|---|---|
| URL: `/guides/<slug>` group | Task 3.8, 3.9 |
| Layout: top-bar + 240px TOC + content | Task 3.8 |
| Scroll containers (load-bearing) | Task 3.8 (CSS includes the `min-height: 0` chain) |
| `src/lib/guides/index.ts` manifest + `findGuide` + search | Task 3.4 |
| Content moves to `src/lib/guides/<slug>/content.md` | Task 4 |
| GuidePage moves to `src/lib/guides/` | Task 3.1 |
| Search component | Task 3.7 |
| Per-component `docs.ts` → `docs.md` (×48) | Task 2 |
| Chat-shell layout unchanged | Verified in Task 2.8, 5.9 |
| Catalog cleanup | Task 5.3 |
| `ShellDemoType` cleanup | Task 5.4 |
| Old route folders deleted | Task 5.2 (app) + 5.5 (demos) |
| Legacy redirect | Task 5.1 |
| Index page listing all guides | Task 3.10 |
| Acceptance: build / lint / tests clean | Task 6.1–6.3 |
| Acceptance: 1024×600 scroll works | Task 3.11, 4.2 |
| Acceptance: per-component Docs tab still works | Task 2.8 |
| Acceptance: legacy `/app/guide-*` redirects | Task 5.9 |
| llms.txt URL updates | Task 6.6 |
| Journal entry | Task 6.7 |
| Backlog status update | Task 6.8 |
| Discoverability link back to Koan | Task 3.9 (footer on `[slug]/+page.svelte`) |

No gaps.

**Placeholder scan:** no TBDs, no "implement later", no vague "handle edge cases".

**Type consistency:** `Guide`, `SearchResult`, `findGuide`, `searchGuides`, `guidesByCategory` are defined in 3.4 and consumed in 3.7–3.10 with the same names and shapes. The category union (`'basics' | 'data' | 'design' | 'workflows' | 'advanced'`) is used identically across 3.4, 3.8, 3.10.
