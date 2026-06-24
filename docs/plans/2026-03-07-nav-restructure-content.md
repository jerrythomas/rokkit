# Nav Restructure & Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete nav restructuring cleanup, align playground with docs grouping, add comprehensive e2e coverage for docs and playground, and fill in missing content for implemented components and guide overviews.

**Architecture:** Docs nav uses `getSections()` with GROUPS config driving collapsible sidebar groups. Playground mirrors these groups via hardcoded data in `+layout.svelte`. E2e tests verify every page loads correctly. Missing content pages get real prose + API docs written directly in `+page.svelte`.

**Tech Stack:** SvelteKit, Svelte 5, Playwright (e2e), Bun (test runner)

---

## Task 1: Commit existing staged changes

**Files:**

- Modified: `solution/sites/learn/src/routes/(learn)/docs/forms/meta.json`
- Modified: `solution/sites/learn/src/routes/(learn)/docs/charts/meta.json`
- Deleted: `solution/sites/learn/src/routes/(learn)/docs/components/meta.json`

**Step 1: Stage and commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add solution/sites/learn/src/routes/\(learn\)/docs/forms/meta.json
git add solution/sites/learn/src/routes/\(learn\)/docs/charts/meta.json
git add solution/sites/learn/src/routes/\(learn\)/docs/components/meta.json
git commit -m "fix: move forms/charts groups after effects, remove orphaned components group"
```

Expected: clean commit, `git status` shows no pending changes for these files.

---

## Task 2: Remove redundant utilities/reveal|shine|tilt files

Each of `utilities/reveal`, `utilities/shine`, `utilities/tilt` has a `+page.js` redirect (keep) plus a now-dead `+page.svelte`, `meta.json`, and a `play/` subdirectory.

**Files to delete:**

- `solution/sites/learn/src/routes/(learn)/docs/utilities/reveal/+page.svelte`
- `solution/sites/learn/src/routes/(learn)/docs/utilities/reveal/meta.json`
- `solution/sites/learn/src/routes/(learn)/docs/utilities/reveal/+layout.svelte` (if exists)
- `solution/sites/learn/src/routes/(learn)/docs/utilities/reveal/play/` (if exists)
- Same for `shine` and `tilt`

**Step 1: Delete the dead files**

```bash
cd /Users/Jerry/Developer/rokkit/solution/sites/learn/src/routes/\(learn\)/docs/utilities
for dir in reveal shine tilt; do
  rm -f $dir/+page.svelte $dir/meta.json $dir/+layout.svelte
  rm -rf $dir/play
done
```

**Step 2: Verify redirects still work**

Each directory should only contain `+page.js`:

```bash
ls solution/sites/learn/src/routes/\(learn\)/docs/utilities/reveal/
# Expected: +page.js only
```

**Step 3: Commit**

```bash
git add -A solution/sites/learn/src/routes/\(learn\)/docs/utilities/reveal/
git add -A solution/sites/learn/src/routes/\(learn\)/docs/utilities/shine/
git add -A solution/sites/learn/src/routes/\(learn\)/docs/utilities/tilt/
git commit -m "chore: remove dead utilities/reveal|shine|tilt pages (now redirects only)"
```

---

## Task 3: Restructure playground home page

The playground home (`/playground`) currently shows a flat card grid. Replace with grouped sections matching the docs nav categories.

**File:** `solution/sites/learn/src/routes/(play)/playground/+page.svelte`

**Step 1: Replace the file content**

```svelte
<script>
  // @ts-nocheck
  import { goto } from '$app/navigation'
  import { Button, Card } from '@rokkit/ui'

  const GROUPS = [
    {
      title: 'Navigation & Selection',
      icon: 'i-solar:list-check-bold-duotone',
      components: [
        { name: 'Breadcrumbs', description: 'Navigation path with links', slug: 'breadcrumbs' },
        { name: 'Lazy Tree', description: 'Async-loaded tree component', slug: 'lazy-tree' },
        { name: 'List', description: 'Data-driven list with field mapping', slug: 'list' },
        { name: 'Menu', description: 'Popup menu with keyboard navigation', slug: 'menu' },
        {
          name: 'Multi Select',
          description: 'Multi-value dropdown selection',
          slug: 'multi-select'
        },
        { name: 'Select', description: 'Single-value dropdown selection', slug: 'select' },
        { name: 'Tabs', description: 'Tabbed content panels', slug: 'tabs' },
        {
          name: 'Toggle',
          description: 'Toggle group for mutually exclusive options',
          slug: 'toggle'
        },
        { name: 'Tree', description: 'Collapsible hierarchical tree', slug: 'tree' }
      ]
    },
    {
      title: 'Inputs',
      icon: 'i-solar:keyboard-bold-duotone',
      components: [
        { name: 'Button', description: 'Action button with variants', slug: 'button' },
        { name: 'Range', description: 'Numeric range slider', slug: 'range' },
        { name: 'Rating', description: 'Star rating input', slug: 'rating' },
        { name: 'Stepper', description: 'Step-by-step progress input', slug: 'stepper' },
        { name: 'Switch', description: 'On/off toggle switch', slug: 'switch' },
        {
          name: 'Upload Progress',
          description: 'File upload progress indicator',
          slug: 'upload-progress'
        },
        { name: 'Upload Target', description: 'Drag-and-drop upload zone', slug: 'upload-target' }
      ]
    },
    {
      title: 'Display',
      icon: 'i-solar:gallery-wide-bold-duotone',
      components: [
        {
          name: 'Card',
          description: 'Content container with optional header/footer',
          slug: 'card'
        },
        { name: 'Code', description: 'Syntax-highlighted code block', slug: 'code' },
        { name: 'Forms', description: 'Schema-driven form renderer', slug: 'forms' },
        { name: 'Pill', description: 'Compact tag or badge element', slug: 'pill' },
        { name: 'Table', description: 'Sortable tabular data display', slug: 'table' },
        { name: 'Timeline', description: 'Chronological event display', slug: 'timeline' }
      ]
    },
    {
      title: 'Layout',
      icon: 'i-solar:layers-minimalistic-bold-duotone',
      components: [
        { name: 'Carousel', description: 'Horizontally scrolling item carousel', slug: 'carousel' },
        {
          name: 'Floating Action',
          description: 'Floating action button overlay',
          slug: 'floating-action'
        },
        {
          name: 'Floating Navigation',
          description: 'Floating navigation overlay',
          slug: 'floating-navigation'
        },
        {
          name: 'Palette Manager',
          description: 'Color palette selection UI',
          slug: 'palette-manager'
        },
        { name: 'Progress', description: 'Progress bar indicator', slug: 'progress' }
      ]
    }
  ]
</script>

<div class="p-8">
  <div class="mb-8">
    <h2 class="text-surface-z8 mb-1 text-2xl font-semibold">Component Playground</h2>
    <p class="text-surface-z5">Select a component to open its interactive playground.</p>
  </div>

  {#each GROUPS as group}
    <section class="mb-10">
      <div class="mb-4 flex items-center gap-2">
        <span class="{group.icon} text-secondary-z7 text-xl" aria-hidden="true"></span>
        <h3 class="text-surface-z7 m-0 text-base font-semibold">{group.title}</h3>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each group.components as component (component.slug)}
          <Card
            class="hover:border-primary-z5 cursor-pointer transition-colors"
            onclick={() => goto(`/playground/components/${component.slug}`)}
          >
            <h4 class="text-surface-z8 mb-1 text-sm font-semibold">{component.name}</h4>
            <p class="text-surface-z5 mb-3 text-xs leading-relaxed">{component.description}</p>
            <Button
              size="sm"
              variant="ghost"
              onclick={() => goto(`/playground/components/${component.slug}`)}
            >
              Open
            </Button>
          </Card>
        {/each}
      </div>
    </section>
  {/each}
</div>
```

**Step 2: Verify the page compiles**

Start the dev server and navigate to `/playground`. Confirm four group sections render with the correct component cards.

---

## Task 4: Restructure playground sidebar

The sidebar in `+layout.svelte` has one flat "Components" group. Replace with grouped sections matching the docs nav.

**File:** `solution/sites/learn/src/routes/(play)/playground/+layout.svelte`

**Step 1: Replace `sections` and `fields` in the script block**

Replace the `const components = [...]` and `const sections = [...]` with:

```js
const sections = [
  {
    title: 'Navigation & Selection',
    icon: 'i-solar:list-check-bold-duotone',
    children: [
      {
        title: 'Breadcrumbs',
        slug: '/playground/components/breadcrumbs',
        icon: 'i-component:breadcrumbs'
      },
      {
        title: 'Lazy Tree',
        slug: '/playground/components/lazy-tree',
        icon: 'i-component:lazy-tree'
      },
      { title: 'List', slug: '/playground/components/list', icon: 'i-component:list' },
      { title: 'Menu', slug: '/playground/components/menu', icon: 'i-component:menu' },
      {
        title: 'Multi Select',
        slug: '/playground/components/multi-select',
        icon: 'i-component:multi-select'
      },
      { title: 'Select', slug: '/playground/components/select', icon: 'i-component:select' },
      { title: 'Tabs', slug: '/playground/components/tabs', icon: 'i-component:tabs' },
      { title: 'Toggle', slug: '/playground/components/toggle', icon: 'i-component:toggle' },
      { title: 'Tree', slug: '/playground/components/tree', icon: 'i-component:tree' }
    ]
  },
  {
    title: 'Inputs',
    icon: 'i-solar:keyboard-bold-duotone',
    children: [
      { title: 'Button', slug: '/playground/components/button', icon: 'i-component:button' },
      { title: 'Range', slug: '/playground/components/range', icon: 'i-component:range' },
      { title: 'Rating', slug: '/playground/components/rating', icon: 'i-component:rating' },
      { title: 'Stepper', slug: '/playground/components/stepper', icon: 'i-component:stepper' },
      { title: 'Switch', slug: '/playground/components/switch', icon: 'i-component:switch' },
      {
        title: 'Upload Progress',
        slug: '/playground/components/upload-progress',
        icon: 'i-component:upload-progress'
      },
      {
        title: 'Upload Target',
        slug: '/playground/components/upload-target',
        icon: 'i-component:upload-target'
      }
    ]
  },
  {
    title: 'Display',
    icon: 'i-solar:gallery-wide-bold-duotone',
    children: [
      { title: 'Card', slug: '/playground/components/card', icon: 'i-component:card' },
      { title: 'Code', slug: '/playground/components/code', icon: 'i-component:code' },
      { title: 'Forms', slug: '/playground/components/forms', icon: 'i-component:forms' },
      { title: 'Pill', slug: '/playground/components/pill', icon: 'i-component:pill' },
      { title: 'Table', slug: '/playground/components/table', icon: 'i-component:table' },
      { title: 'Timeline', slug: '/playground/components/timeline', icon: 'i-component:timeline' }
    ]
  },
  {
    title: 'Layout',
    icon: 'i-solar:layers-minimalistic-bold-duotone',
    children: [
      { title: 'Carousel', slug: '/playground/components/carousel', icon: 'i-component:carousel' },
      {
        title: 'Floating Action',
        slug: '/playground/components/floating-action',
        icon: 'i-component:floating-action'
      },
      {
        title: 'Floating Navigation',
        slug: '/playground/components/floating-navigation',
        icon: 'i-component:floating-navigation'
      },
      {
        title: 'Palette Manager',
        slug: '/playground/components/palette-manager',
        icon: 'i-component:palette-manager'
      },
      { title: 'Progress', slug: '/playground/components/progress', icon: 'i-component:progress' }
    ]
  }
]

const fields = { label: 'title', href: 'slug', icon: 'icon', value: 'slug' }
```

Also remove the `<h3>Components</h3>` heading from the aside since groups now have their own headings.

**Step 2: Verify sidebar**

Navigate to any `/playground/components/*` page. Confirm sidebar shows four collapsible groups.

**Step 3: Commit tasks 3+4**

```bash
git add solution/sites/learn/src/routes/\(play\)/playground/+page.svelte
git add solution/sites/learn/src/routes/\(play\)/playground/+layout.svelte
git commit -m "feat: restructure playground home and sidebar to match docs nav groups"
```

---

## Task 5: Update docs e2e page coverage

**File:** `solution/sites/learn/e2e/pages.e2e.ts`

**Step 1: Update UTILITIES array** — remove redirected entries, add effects

Replace the `UTILITIES` constant:

```ts
const UTILITIES = [
  '/docs/utilities/overview',
  '/docs/utilities/state-management',
  '/docs/utilities/navigator',
  '/docs/utilities/controllers',
  '/docs/utilities/icons',
  '/docs/utilities/connector',
  '/docs/utilities/custom-primitives'
]

const EFFECTS = ['/docs/effects/reveal', '/docs/effects/shine', '/docs/effects/tilt']
```

**Step 2: Add combined section pages**

Add a new constant after the existing ones:

```ts
const COMBINED_SECTIONS = [
  '/docs/getting-started',
  '/docs/data-binding',
  '/docs/composability',
  '/docs/theming',
  '/docs/accessibility',
  '/docs/utilities',
  '/docs/toolchain'
]
```

**Step 3: Add test suites for new constants**

After the existing `Utilities pages` describe block, add:

```ts
test.describe('Effects pages', () => {
  for (const url of EFFECTS) {
    test(`${url} has content and navigation`, async ({ page }) => {
      await checkPage(page, url)
    })
  }
})

test.describe('Combined section pages', () => {
  for (const url of COMBINED_SECTIONS) {
    test(`${url} has content and navigation`, async ({ page }) => {
      await checkPage(page, url)
    })
  }
})
```

**Step 4: Verify page count**

Count the total URLs across all constants — should be ~90 pages now.

---

## Task 6: Add playground e2e tests

**File:** `solution/sites/learn/e2e/playground.e2e.ts` (new file)

**Step 1: Create the file**

```ts
/**
 * Playground page coverage tests — every playground page must:
 *   1. Load without error
 *   2. Show the playground content area
 *   3. Show the sidebar navigation
 */
import { test, expect } from '@playwright/test'

const PLAYGROUND_COMPONENTS = [
  'breadcrumbs',
  'button',
  'card',
  'carousel',
  'code',
  'floating-action',
  'floating-navigation',
  'forms',
  'lazy-tree',
  'list',
  'menu',
  'multi-select',
  'palette-manager',
  'pill',
  'progress',
  'range',
  'rating',
  'select',
  'stepper',
  'switch',
  'table',
  'tabs',
  'timeline',
  'toggle',
  'tree',
  'upload-progress',
  'upload-target'
]

async function checkPlaygroundPage(page: any, slug: string) {
  await page.goto(`/playground/components/${slug}`)
  await page.waitForLoadState('networkidle')

  // Playground content area must be present
  await expect(page.locator('[data-playground-content]')).toBeVisible()

  // Sidebar must be rendered with nav groups
  const sidebar = page.locator('aside').first()
  await expect(sidebar).toBeVisible()
  const navList = sidebar.locator('[data-list]')
  await expect(navList).toBeVisible()
}

test.describe('Playground home', () => {
  test('shows grouped sections', async ({ page }) => {
    await page.goto('/playground')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Navigation & Selection')).toBeVisible()
    await expect(page.locator('text=Inputs')).toBeVisible()
    await expect(page.locator('text=Display')).toBeVisible()
    await expect(page.locator('text=Layout')).toBeVisible()
  })
})

test.describe('Playground component pages', () => {
  for (const slug of PLAYGROUND_COMPONENTS) {
    test(`/playground/components/${slug} loads`, async ({ page }) => {
      await checkPlaygroundPage(page, slug)
    })
  }
})
```

**Step 2: Commit tasks 5+6**

```bash
git add solution/sites/learn/e2e/pages.e2e.ts
git add solution/sites/learn/e2e/playground.e2e.ts
git commit -m "test(e2e): add effects/combined-section pages, add playground e2e coverage"
```

---

## Task 7: Fix forms component doc import

**File:** `solution/sites/learn/src/routes/(learn)/docs/components/forms/+page.svelte`

**Problem:** Uses `import { Code } from '@rokkit/ui'` — should use `Code` from `$lib/components/Story` and the forms content is minimal.

**Step 1: Rewrite the page**

```svelte
<script>
  // @ts-nocheck
  import { Code } from '$lib/components/Story'
</script>

<article data-article-root>
  <p>
    The <code>FormRenderer</code> component renders forms from a JSON schema and layout descriptor. It
    handles input binding, validation, dirty tracking, conditional visibility, nested groups, and lookup
    fields — all driven by configuration, not code.
  </p>

  <h2>Quick Start</h2>
  <p>
    Import <code>FormRenderer</code> from <code>@rokkit/forms</code>. Provide a JSON Schema (<code
      >schema</code
    >), a layout descriptor (<code>layout</code>), and bind <code>data</code>
    for two-way sync.
  </p>
  <Code
    language="svelte"
    content={`<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', email: '' })

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' }
    },
    required: ['name', 'email']
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/name', label: 'Name' },
      { scope: '#/email', label: 'Email' }
    ]
  }
<\/script>

<FormRenderer bind:data {schema} {layout} validateOn="blur" />`}
  />

  <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
    <div data-card>
      <h2>Props</h2>
      <ul>
        <li><strong>data</strong> (bindable): The form data object — mutated in place</li>
        <li><strong>schema</strong>: JSON Schema describing field types and validation rules</li>
        <li><strong>layout</strong>: Layout descriptor — elements, groups, display components</li>
        <li>
          <strong>validateOn</strong>: When to validate — <code>"blur"</code>,
          <code>"change"</code>, <code>"submit"</code>
        </li>
        <li><strong>disabled</strong>: Disable all inputs</li>
        <li><strong>readonly</strong>: Render all fields as read-only display</li>
      </ul>
    </div>
    <div data-card>
      <h2>Events</h2>
      <ul>
        <li><strong>onchange(data, errors)</strong>: Fires on any field change</li>
        <li><strong>onsubmit(data)</strong>: Fires when form is submitted and valid</li>
        <li><strong>onerror(errors)</strong>: Fires when validation fails on submit</li>
      </ul>
    </div>
  </div>

  <div data-card class="mt-6">
    <h2>Layout Element Types</h2>
    <ul>
      <li>
        <strong>scope</strong>: JSON Pointer to a schema property (e.g. <code>#/address/city</code>)
      </li>
      <li><strong>type: "group"</strong>: Wraps children in a labelled section</li>
      <li><strong>type: "horizontal"</strong>: Side-by-side layout for multiple fields</li>
      <li><strong>type: "display"</strong>: Read-only display component (table, list, card)</li>
    </ul>
  </div>

  <p class="text-surface-z5 mt-6">
    See the <a href="/docs/forms">Forms guide</a> for conditional fields, lookup sources, and multi-step
    forms.
  </p>
</article>
```

**Step 2: Commit**

```bash
git add solution/sites/learn/src/routes/\(learn\)/docs/components/forms/+page.svelte
git commit -m "fix: rewrite forms component doc with correct Code import and real content"
```

---

## Task 8: Write Grid component doc

**File:** `solution/sites/learn/src/routes/(learn)/docs/components/grid/+page.svelte`

The `Grid` component is a responsive tile grid. Props: `items`, `fields`, `value` (bindable), `size`, `disabled`, `minSize`, `gap`, `label`, `onselect`. Snippets: `itemContent(proxy)`, named per-item snippets.

**Step 1: Replace the stub**

```svelte
<article data-article-root>
  <p>
    A responsive tile grid for displaying and selecting from a collection of items. Uses CSS
    <code>grid</code> with <code>auto-fill</code> columns so tiles flow naturally at any viewport
    width. Keyboard navigation moves focus between tiles with arrow keys. Accepts the same field
    mapping and snippet patterns as <code>List</code>.
  </p>

  <h2>Basic Example</h2>
  <p>
    Pass an array of objects. The <code>label</code> and <code>icon</code> fields are displayed in
    each tile by default. Bind <code>value</code> to track the selected item.
  </p>

  <div data-card>
    <pre><code
        >{`<script>
  import { Grid } from '@rokkit/ui'

  const items = [
    { label: 'Dashboard', icon: 'i-solar:home-bold-duotone' },
    { label: 'Reports', icon: 'i-solar:chart-bold-duotone' },
    { label: 'Settings', icon: 'i-solar:settings-bold-duotone' }
  ]

  let selected = $state(null)
<\/script>

<Grid {items} bind:value={selected} />`}</code
      ></pre>
  </div>

  <h2>Tile Size Control</h2>
  <p>
    Use <code>minSize</code> to control the minimum tile width. The grid fills available columns
    automatically. Use <code>size</code> for the content size variant (<code>sm</code>,
    <code>md</code>, <code>lg</code>).
  </p>

  <div data-card>
    <pre><code>{`<Grid {items} minSize="80px" size="sm" bind:value />`}</code></pre>
  </div>

  <h2>Custom Tile Content</h2>
  <p>
    Use the <code>itemContent</code> snippet to replace what renders inside each tile. The snippet
    receives a <code>ProxyItem</code> — use <code>proxy.label</code>,
    <code>proxy.icon</code>, and <code>proxy.get('field')</code>.
  </p>

  <div data-card>
    <pre><code
        >{`{#snippet itemContent(proxy)}
  <div class="flex flex-col items-center gap-1 p-2">
    <span class="{proxy.icon} text-2xl text-secondary-z7"></span>
    <span class="text-xs font-medium">{proxy.label}</span>
    <span class="text-xs text-surface-z5">{proxy.get('count')} items</span>
  </div>
{/snippet}

<Grid {items} {itemContent} bind:value />`}</code
      ></pre>
  </div>

  <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
    <div data-card>
      <h2>Props</h2>
      <ul>
        <li><strong>items</strong>: Array of objects</li>
        <li><strong>fields</strong>: Remap data keys to component fields</li>
        <li><strong>value</strong> (bindable): Currently selected item value</li>
        <li>
          <strong>size</strong>: Content size — <code>sm</code>, <code>md</code>, <code>lg</code>
        </li>
        <li>
          <strong>minSize</strong>: Minimum tile width (CSS value, default <code>120px</code>)
        </li>
        <li><strong>gap</strong>: Grid gap (CSS value, default <code>1rem</code>)</li>
        <li><strong>disabled</strong>: Disable all tiles</li>
        <li><strong>label</strong>: ARIA label for the grid container</li>
        <li><strong>class</strong>: Additional CSS classes</li>
      </ul>
    </div>
    <div data-card>
      <h2>Snippets</h2>
      <ul>
        <li><strong>itemContent(proxy)</strong>: Custom content inside each tile button</li>
        <li>
          <strong>[name](proxy)</strong>: Per-item snippet — set <code>item.snippet = 'name'</code>
        </li>
      </ul>
      <h2>Events</h2>
      <ul>
        <li><strong>onselect(value, proxy)</strong>: Fired when a tile is selected</li>
      </ul>
    </div>
  </div>
</article>
```

**Step 2: Commit**

```bash
git add solution/sites/learn/src/routes/\(learn\)/docs/components/grid/+page.svelte
git commit -m "docs: write Grid component documentation"
```

---

## Task 9: Write guide overview pages

Four guide sub-sections have "Coming soon" overview pages. Write real introductory prose for each.

### 9a: data-binding/overview

**File:** `solution/sites/learn/src/routes/(learn)/docs/data-binding/overview/+page.svelte`

The overview at `data-binding/overview` already has substantial content (checked earlier). Verify it's complete — if it still shows "Coming soon", replace the `<p>Coming soon.</p>` lines with the existing intro prose from the parent page.

**Step:** Read the file and confirm it is not a "Coming soon" stub. If it is, copy content from `data-binding/+page.svelte`'s Overview section into it.

```bash
head -5 solution/sites/learn/src/routes/\(learn\)/docs/data-binding/overview/+page.svelte
# If output shows "Coming soon", rewrite the page
```

### 9b: utilities/overview

**File:** `solution/sites/learn/src/routes/(learn)/docs/utilities/overview/+page.svelte`

Same check — the overview already has intro content about controllers + navigator. Verify and ensure the page is complete.

### 9c: toolchain/overview

**File:** `solution/sites/learn/src/routes/(learn)/docs/toolchain/overview/+page.svelte`

```bash
cat solution/sites/learn/src/routes/\(learn\)/docs/toolchain/overview/+page.svelte
```

If "Coming soon", replace with:

```svelte
<article data-article-root>
  <p>
    Rokkit's toolchain covers everything outside the component library itself: the CLI for
    scaffolding and upgrading projects, curated icon sets with tree-shaking, and a custom primitive
    guide for building new components on top of Rokkit's controller and navigator patterns.
  </p>

  <h2>CLI</h2>
  <p>
    The Rokkit CLI (<code>npx rokkit</code>) automates common project tasks — adding Rokkit to a new
    project, upgrading between versions, generating custom skin scaffolds, and creating new
    component themes. See <a href="/docs/toolchain/cli">CLI reference</a> for full usage.
  </p>

  <h2>Icon Sets</h2>
  <p>
    Rokkit ships curated icon sets (navigation, status, action, object) that are fully tree-shaken —
    only imported icons enter your bundle. You can also register a global icon override snippet to
    replace all component icons with any icon system at once. See
    <a href="/docs/toolchain/icon-sets">Icon sets</a> for details.
  </p>
</article>
```

### 9d: accessibility/overview

**File:** `solution/sites/learn/src/routes/(learn)/docs/accessibility/overview/+page.svelte`

```bash
cat solution/sites/learn/src/routes/\(learn\)/docs/accessibility/overview/+page.svelte
```

If "Coming soon", replace with:

```svelte
<article data-article-root>
  <p>
    Rokkit components are accessible by default. Keyboard navigation, focus management, and ARIA
    attributes are built into every interactive component via the controller + navigator pattern —
    no configuration required.
  </p>

  <h2>Keyboard Navigation</h2>
  <p>
    All selection components (List, Tree, Select, Menu, Tabs, Toggle) support full keyboard
    navigation. Arrow keys move between items, Enter/Space activate, Escape closes dropdowns.
    Navigation adapts to orientation (horizontal/vertical) and RTL layouts automatically. See <a
      href="/docs/accessibility/keyboard-navigation">Keyboard navigation</a
    > for the full key mapping.
  </p>

  <h2>ARIA</h2>
  <p>
    The navigator action applies <code>role</code>, <code>aria-selected</code>,
    <code>aria-expanded</code>, <code>aria-disabled</code>, and <code>aria-label</code>
    to every component automatically. Custom labels are set via the <code>label</code> /
    <code>labels</code> prop and fall back to the <code>MessagesStore</code> defaults.
  </p>

  <h2>Tooltips &amp; i18n</h2>
  <p>
    Tooltip support and full internationalisation (translatable built-in strings, locale-aware
    formatting, RTL layout) are on the roadmap. See
    <a href="/docs/accessibility/tooltips">Tooltips</a> and
    <a href="/docs/accessibility/i18n">i18n</a> for planned specs.
  </p>
</article>
```

**Step: Commit task 9**

```bash
git add solution/sites/learn/src/routes/\(learn\)/docs/toolchain/overview/+page.svelte
git add solution/sites/learn/src/routes/\(learn\)/docs/accessibility/overview/+page.svelte
# add any other changed overview files
git commit -m "docs: write toolchain and accessibility overview pages"
```

---

## Task 10: Update journal

**File:** `agents/journal.md`

Add a new entry at the top (after the heading) for today's session:

```markdown
## 2026-03-07

### Nav Restructure & Playground Alignment COMPLETE

**What was done:**

- Deleted orphaned `components/meta.json` (was creating empty collapsible group)
- Moved forms group order 6 → 20, charts group order 8 → 21 (both now appear after Effects)
- Removed dead `+page.svelte` and `meta.json` from `utilities/reveal|shine|tilt` (keep `+page.js` redirects)
- Deleted untracked `sites/quick-start/` and `sites/sample/` from filesystem
- Restructured playground home page into four grouped sections (Navigation & Selection, Inputs, Display, Layout)
- Restructured playground sidebar to match same four collapsible groups
- Updated `pages.e2e.ts`: removed redirected utilities URLs, added effects pages + 7 combined section pages
- Added `playground.e2e.ts`: home group headings + all 27 component pages
- Fixed `components/forms/+page.svelte`: wrong `Code` import, rewrote with real content
- Wrote Grid component documentation
- Wrote toolchain/overview and accessibility/overview pages

**Final nav group order:**
Navigation & Selection (10) → Inputs (11) → Display (12) → Layout (13) → Effects (14) → Forms (20) → Charts (21)
```

**Commit:**

```bash
git add agents/journal.md docs/plans/
git commit -m "chore: journal entry and design docs for nav restructure + playground alignment"
```

---

## Verification

After all tasks:

```bash
cd /Users/Jerry/Developer/rokkit/solution
bun run lint
# Expected: 0 errors

cd sites/learn
npx playwright test e2e/pages.e2e.ts --reporter=dot
npx playwright test e2e/playground.e2e.ts --reporter=dot
# Expected: all pass (or known pre-existing failures only)
```
