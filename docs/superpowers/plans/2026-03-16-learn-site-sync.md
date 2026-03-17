# Learn Site Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix inconsistencies in existing learn site pages and add new reference-style utility pages for all non-UI Rokkit packages.

**Architecture:** Two sub-projects — targeted fixes to existing pages, then new utility reference pages following the established `state-management` page pattern (article + Code components + snippets/ files).

**Tech Stack:** SvelteKit, Svelte 5, `$lib/components/Story` Code component, snippet files imported with `?raw`.

**Reference pattern:** `site/src/routes/(learn)/docs/utilities/state-management/+page.svelte` and its `snippets/` folder.

---

## Chunk 1: Targeted Fixes to Existing Pages

### Task 1: Fix `data-palette` → `data-style` in theming pages

**Files:**
- Modify: `site/src/routes/(learn)/docs/theming/overview/+page.svelte`
- Modify: `site/src/routes/(learn)/docs/theming/+page.svelte`

- [ ] **Step 1: Fix `theming/overview/+page.svelte`**

  Change line 9 from:
  ```html
  <pre><code>&lt;html data-palette="rokkit" data-mode="dark"&gt;</code></pre>
  ```
  To:
  ```html
  <pre><code>&lt;html data-style="rokkit" data-mode="dark"&gt;</code></pre>
  ```

- [ ] **Step 2: Fix `theming/+page.svelte`**

  Change line 24 from:
  ```html
  <pre><code>&lt;html data-palette="rokkit" data-mode="dark"&gt;</code></pre>
  ```
  To:
  ```html
  <pre><code>&lt;html data-style="rokkit" data-mode="dark"&gt;</code></pre>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/theming/overview/+page.svelte
  git add site/src/routes/\(learn\)/docs/theming/+page.svelte
  git commit -m "fix(site): correct data-style attribute in theming pages (was data-palette)"
  ```

---

### Task 2: Expand `theming/overview` with UnoCSS guidance

**Files:**
- Modify: `site/src/routes/(learn)/docs/theming/overview/+page.svelte`
- Create: `site/src/routes/(learn)/docs/theming/overview/snippets/00-activate-theme.html`
- Create: `site/src/routes/(learn)/docs/theming/overview/snippets/01-utility-classes.svelte`

The overview page is currently a stub. Expand it to cover the full theming model.

- [ ] **Step 1: Create snippet `00-activate-theme.html`**

  ```html
  <!-- Activate a style (visual personality) -->
  <html data-style="rokkit" data-mode="dark">

  <!-- Available styles: rokkit | minimal | material -->
  <!-- Available modes: light | dark (omit for system default) -->
  ```

- [ ] **Step 2: Create snippet `01-utility-classes.svelte`**

  ```svelte
  <!-- Use UnoCSS utility classes for color tokens, not inline CSS variables -->
  <!-- Pattern: {bg|text|border}-{role}-z{n} -->

  <!-- Backgrounds -->
  <div class="bg-surface-z1">Subtle background</div>
  <div class="bg-surface-z2">Card background</div>

  <!-- Text -->
  <p class="text-surface-z6">Body text</p>
  <p class="text-surface-z8">Heading text</p>
  <p class="text-surface-z5">Muted text</p>

  <!-- Borders -->
  <div class="border-surface-z2 border">Bordered element</div>

  <!-- Accent colors -->
  <span class="text-primary-z7">Primary action</span>
  <span class="text-secondary-z7">Active indicator</span>
  ```

- [ ] **Step 3: Rewrite `+page.svelte`**

  ```svelte
  <script>
  	import { Code } from '$lib/components/Story'
  	import activateTheme from './snippets/00-activate-theme.html?raw'
  	import utilityClasses from './snippets/01-utility-classes.svelte?raw'
  </script>

  <article data-article-root>
  	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
  		Rokkit separates layout CSS (structural) from theme CSS (visual). Components ship unstyled
  		with <code>data-*</code> attribute hooks. Themes provide the visual layer — colors, radii,
  		shadows — without touching structure.
  	</p>

  	<h2>Activating a theme</h2>
  	<p>
  		Add <code>data-style</code> to your <code>&lt;html&gt;</code> element and import the theme CSS.
  		The style attribute selects the visual personality:
  	</p>
  	<Code content={activateTheme} language="html" />
  	<p>
  		Three built-in styles are available: <strong>rokkit</strong> (the default, opinionated design),
  		<strong>minimal</strong> (clean, low-contrast), and <strong>material</strong> (Material
  		Design-inspired).
  	</p>

  	<h2>Data attributes</h2>
  	<p>Four data attributes control the visual presentation:</p>
  	<table>
  		<thead>
  			<tr><th>Attribute</th><th>Values</th><th>Purpose</th></tr>
  		</thead>
  		<tbody>
  			<tr><td><code>data-style</code></td><td><code>rokkit</code>, <code>minimal</code>, <code>material</code></td><td>Visual personality</td></tr>
  			<tr><td><code>data-mode</code></td><td><code>light</code>, <code>dark</code></td><td>Light/dark mode</td></tr>
  			<tr><td><code>data-palette</code></td><td>color variant name</td><td>Color skin override</td></tr>
  			<tr><td><code>data-density</code></td><td><code>compact</code>, <code>default</code>, <code>comfortable</code></td><td>Spacing density (planned)</td></tr>
  		</tbody>
  	</table>

  	<h2>UnoCSS utility classes</h2>
  	<p>
  		Use UnoCSS utility classes to apply theme colors — not inline CSS variables. The pattern is
  		<code>&#123;bg|text|border&#125;-&#123;role&#125;-z&#123;n&#125;</code>, where <code>role</code> is a semantic color
  		group and <code>n</code> is a z-depth token (1–10):
  	</p>
  	<Code content={utilityClasses} language="svelte" />
  	<p>
  		Z-depth tokens automatically invert between light and dark mode. See
  		<a href="/docs/theming/color-system">Color System</a> for the full z-depth reference.
  	</p>

  	<h2>Related</h2>
  	<ul>
  		<li><a href="/docs/theming/color-system">Color System</a> — z-depth tokens, palettes, dark mode</li>
  		<li><a href="/docs/theming/styling">Styling</a> — theme CSS architecture, data-attribute hooks, custom themes</li>
  		<li><a href="/docs/utilities/unocss">UnoCSS</a> — <code>presetRokkit</code> setup</li>
  	</ul>
  </article>
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/theming/overview/
  git commit -m "feat(site): expand theming/overview with data-attrs and UnoCSS utility class guidance"
  ```

---

### Task 3: Fix `utilities/controllers` — remove NestedController

**Files:**
- Modify: `site/src/routes/(learn)/docs/utilities/controllers/+page.svelte`

`NestedController` does not exist in `@rokkit/states`. The actual controller for tree navigation
is `ListController` with `nested: true` via the navigator action.

- [ ] **Step 1: Update `+page.svelte`**

  Replace the controllers list to match actual exports:

  ```svelte
  <article data-article-root>
  	<p>
  		Controllers are plain JavaScript objects that manage interaction state — which item is focused,
  		what is selected, whether groups are expanded. They have no DOM dependency and can be tested
  		without a browser.
  	</p>
  	<h2>Available controllers</h2>
  	<ul>
  		<li>
  			<strong>ListController</strong> — flat and grouped list navigation with single/multi-select;
  			supports nested tree navigation when used with the <code>navigator</code> action
  		</li>
  		<li><strong>TableController</strong> — row/column navigation for data tables</li>
  	</ul>
  	<p>
  		See <a href="/docs/utilities/states">@rokkit/states</a> for full API reference.
  	</p>
  </article>
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/controllers/+page.svelte
  git commit -m "fix(site): remove NestedController reference (doesn't exist); link to states page"
  ```

---

### Task 4: Add CLI setup path to `getting-started/installation`

**Files:**
- Modify: `site/src/routes/(learn)/docs/getting-started/installation/+page.svelte`
- Create: `site/src/routes/(learn)/docs/getting-started/snippets/06-cli-init.sh`

- [ ] **Step 1: Create snippet `06-cli-init.sh`**

  ```sh
  npx @rokkit/cli@latest init
  ```

- [ ] **Step 2: Add CLI section to `+page.svelte`**

  Read the file first, then add a "CLI Setup (Recommended)" section before the existing
  "Installation" section:

  ```svelte
  <!-- Add at the top of the article, after the intro paragraph, before <h2>Installation</h2> -->

  <h2>CLI Setup (Recommended)</h2>
  <p>
  	The fastest way to set up Rokkit is the CLI. It runs interactive prompts to configure your
  	palette, theme style, icons, and switcher mode, then writes all necessary config files:
  </p>
  <Code content={cliInit} language="bash" />
  <p>
  	This generates: <code>rokkit.config.js</code>, <code>uno.config.js</code>,
  	<code>src/app.css</code>, and <code>src/app.html</code>. See the
  	<a href="/docs/toolchain/cli">CLI reference</a> for all options.
  </p>
  ```

  Also add the import at the top of the `<script>` block:
  ```js
  import cliInit from '../snippets/06-cli-init.sh?raw'
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/getting-started/snippets/06-cli-init.sh
  git add site/src/routes/\(learn\)/docs/getting-started/installation/+page.svelte
  git commit -m "feat(site): add CLI setup path to installation page"
  ```

---

### Task 5: Fill `toolchain/cli` — replace "Coming soon"

**Files:**
- Modify: `site/src/routes/(learn)/docs/toolchain/cli/+page.svelte`
- Create: `site/src/routes/(learn)/docs/toolchain/cli/snippets/` (multiple files)

Content source: `docs/llms/cli.txt`

- [ ] **Step 1: Create snippets**

  `snippets/00-init.sh`:
  ```sh
  npx @rokkit/cli@latest init
  ```

  `snippets/01-doctor.sh`:
  ```sh
  # Check all 4 doctor checks
  npx @rokkit/cli@latest doctor

  # Auto-fix 3 of 4 checks
  npx @rokkit/cli@latest doctor --fix
  ```

  `snippets/02-doctor-manual-fix.js`:
  ```js
  // uno.config.js — manual fix for uno-uses-preset check
  // Replace any existing Rokkit preset import with:
  import { defineConfig } from 'unocss'
  import { presetRokkit } from '@rokkit/unocss'

  export default defineConfig({
    presets: [presetRokkit()]
  })
  ```

  `snippets/03-icon-tools.sh`:
  ```sh
  # Bundle a custom icon collection
  npx @rokkit/cli@latest bundle --input ./src/icons --output ./dist

  # Build icon metadata
  npx @rokkit/cli@latest build --input ./src/icons
  ```

- [ ] **Step 2: Write `+page.svelte`**

  ```svelte
  <script>
  	import { Code } from '$lib/components/Story'
  	import initCmd from './snippets/00-init.sh?raw'
  	import doctorCmd from './snippets/01-doctor.sh?raw'
  	import doctorManualFix from './snippets/02-doctor-manual-fix.js?raw'
  	import iconTools from './snippets/03-icon-tools.sh?raw'
  </script>

  <article data-article-root>
  	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
  		The Rokkit CLI automates project setup and ongoing maintenance. It handles config file generation,
  		dependency verification, and icon bundling.
  	</p>

  	<h2>rokkit init</h2>
  	<p>
  		Interactive setup for new projects. Run once after creating your SvelteKit app:
  	</p>
  	<Code content={initCmd} language="bash" />
  	<p>The init command runs interactive prompts for:</p>
  	<ul>
  		<li><strong>Color palette</strong> — built-in or custom primary/secondary/accent/surface colors</li>
  		<li><strong>Icon collection</strong> — which icon set to use (e.g., Solar icons)</li>
  		<li><strong>Theme styles</strong> — which styles to include: <code>rokkit</code>, <code>minimal</code>, <code>material</code></li>
  		<li><strong>Switcher mode</strong> — <code>system</code> (follows OS), <code>manual</code>, or <code>full</code> (all options)</li>
  	</ul>
  	<p>Files written by <code>rokkit init</code>:</p>
  	<ul>
  		<li><code>rokkit.config.js</code> — palette and style configuration</li>
  		<li><code>uno.config.js</code> — UnoCSS config with <code>presetRokkit()</code></li>
  		<li><code>src/app.css</code> — theme CSS imports</li>
  		<li><code>src/app.html</code> — <code>data-style</code> and <code>data-mode</code> attributes on <code>&lt;html&gt;</code></li>
  	</ul>

  	<h2>rokkit doctor</h2>
  	<p>
  		Verifies your Rokkit setup is correctly configured. Run when something looks broken or after
  		manual changes:
  	</p>
  	<Code content={doctorCmd} language="bash" />
  	<p>Doctor checks:</p>
  	<table>
  		<thead>
  			<tr><th>Check</th><th>What it verifies</th><th>Auto-fixable</th></tr>
  		</thead>
  		<tbody>
  			<tr><td><code>config-exists</code></td><td><code>rokkit.config.js</code> present</td><td>Yes</td></tr>
  			<tr><td><code>css-imported</code></td><td>Theme CSS imported in <code>app.css</code></td><td>Yes</td></tr>
  			<tr><td><code>html-has-attrs</code></td><td><code>data-style</code> on <code>&lt;html&gt;</code> in <code>app.html</code></td><td>Yes</td></tr>
  			<tr><td><code>uno-uses-preset</code></td><td><code>presetRokkit()</code> in <code>uno.config.js</code></td><td>No — manual fix required</td></tr>
  		</tbody>
  	</table>
  	<p>
  		Exit codes: <code>0</code> = all checks pass, <code>1</code> = one or more failures.
  	</p>
  	<p>
  		The <code>uno-uses-preset</code> check cannot be auto-fixed because UnoCSS config files vary
  		too much in structure. Manual fix:
  	</p>
  	<Code content={doctorManualFix} language="javascript" />

  	<h2>Icon tools</h2>
  	<p>
  		For icon library authors. Bundle and build custom icon collections for use with Rokkit:
  	</p>
  	<Code content={iconTools} language="bash" />
  	<ul>
  		<li><strong>bundle</strong> — Packages SVG icons into a distributable icon collection</li>
  		<li><strong>build</strong> — Generates icon metadata (names, categories) from SVG source files</li>
  	</ul>

  	<h2>Related</h2>
  	<ul>
  		<li><a href="/docs/getting-started/installation">Installation</a> — Setting up a new project with the CLI</li>
  		<li><a href="/docs/utilities/unocss">UnoCSS</a> — <code>presetRokkit</code> reference</li>
  	</ul>
  </article>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/toolchain/cli/
  git commit -m "feat(site): fill toolchain/cli with full CLI reference (init, doctor, icon tools)"
  ```

---

### Task 6: Fix `docs/llms/components/select.txt` — `options` → `items`

**Files:**
- Modify: `docs/llms/components/select.txt`

The actual Select component prop is `items` (confirmed from source). The llms doc consistently
uses `options` — wrong throughout.

- [ ] **Step 1: Replace all `options` prop references**

  In `docs/llms/components/select.txt`, replace:
  - `{options}` → `{items}` (in code examples)
  - `options={...}` → `items={...}`
  - `| \`options\` | \`SelectItem[]\`...` → `| \`items\` | \`SelectItem[]\`...`
  - `let options = ...` → `let items = ...` (in usage examples)
  - `options?: SelectItem[]` → `items?: SelectItem[]` (in TypeScript type)

  Be careful NOT to change:
  - Uses of "options" as a plain English word (e.g., "dropdown options", "grouped options")
  - The `options` key inside `SelectItem` if it appears (grouped items children field)

- [ ] **Step 2: Verify**

  After edits, grep for `options=` or `{options}` (prop usage) to confirm all fixed.
  Check that "options" as English prose (like "grouped options", "dropdown options") is untouched.

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/components/select.txt
  git commit -m "fix(llms): correct Select prop name from options to items"
  ```

---

## Chunk 2: New Utility Reference Pages

**Pattern for each page:**
1. Create `utilities/<name>/meta.json` — `category: "utilities"`, assigned order
2. Create `utilities/<name>/snippets/` — code examples as separate files
3. Create `utilities/<name>/+page.svelte` — article with Code components
4. Commit per page (or group small ones)

**Content sources:** `docs/llms/packages/<name>.txt` for each page.

**Before starting:** Read `docs/llms/packages/<name>.txt` in full before writing each page.

---

### Task 7: `utilities/actions` — @rokkit/actions reference

**Files:**
- Create: `site/src/routes/(learn)/docs/utilities/actions/meta.json`
- Create: `site/src/routes/(learn)/docs/utilities/actions/snippets/00-navigable.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/actions/snippets/01-other-actions.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/actions/+page.svelte`

- [ ] **Step 1: Create `meta.json`**

  ```json
  {
    "title": "Actions",
    "description": "Svelte actions for keyboard navigation, drag, gestures, and visual effects",
    "icon": "i-solar:keyboard-bold-duotone",
    "category": "utilities",
    "order": 7,
    "tags": ["actions", "navigable", "keyboard", "navigation", "drag", "gesture"]
  }
  ```

- [ ] **Step 2: Create snippets**

  `snippets/00-navigable.svelte` — navigable action usage with all events:
  ```svelte
  <script>
    import { navigable } from '@rokkit/actions'

    let items = ['Apple', 'Banana', 'Cherry']
    let focusedIndex = $state(0)
  </script>

  <!-- navigable fires events on keyup (not keydown) -->
  <!-- Default orientation: vertical (ArrowUp/Down = previous/next) -->
  <ul
    use:navigable
    onprevious={() => focusedIndex = Math.max(0, focusedIndex - 1)}
    onnext={() => focusedIndex = Math.min(items.length - 1, focusedIndex + 1)}
    onselect={() => console.log('selected', items[focusedIndex])}
  >
    {#each items as item, i}
      <li tabindex={focusedIndex === i ? 0 : -1}>{item}</li>
    {/each}
  </ul>
  ```

  `snippets/01-other-actions.svelte` — showcase of other actions:
  ```svelte
  <script>
    import { ripple, hoverLift, reveal, magnetic } from '@rokkit/actions'
  </script>

  <!-- Ripple effect on click -->
  <button use:ripple>Click me</button>

  <!-- Hover lift animation -->
  <div use:hoverLift>Card content</div>

  <!-- Scroll-triggered reveal animation -->
  <section use:reveal>Revealed on scroll</section>

  <!-- Magnetic cursor attraction -->
  <button use:magnetic>Magnetic button</button>
  ```

- [ ] **Step 3: Write `+page.svelte`**

  Source: `docs/llms/packages/actions.txt`

  Cover:
  - What Svelte actions are and how to apply them (`use:actionName`)
  - `navigable` — the primary keyboard nav action; events fire on **keyup**; dispatches `previous`, `next`, `select`, `collapse`, `expand`; default orientation is vertical
  - All other exported actions: `navigator`, `keyboard`, `pannable`, `swipeable`, `themable`, `skinnable`, `dismissable`, `fillable`, `reveal`, `hoverLift`, `magnetic`, `ripple`
  - Usage examples

  Structure:
  ```
  intro para
  h2: How actions work
  h2: navigable — keyboard navigation
    Code: 00-navigable.svelte
  h2: Visual and interaction actions
    Code: 01-other-actions.svelte
  h2: All actions (table: name | purpose | events)
  h2: Related
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/actions/
  git commit -m "feat(site): add utilities/actions reference page (@rokkit/actions)"
  ```

---

### Task 8: `utilities/states` — @rokkit/states reference

**Files:**
- Create: `site/src/routes/(learn)/docs/utilities/states/meta.json`
- Create: `site/src/routes/(learn)/docs/utilities/states/snippets/00-proxy-item.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/states/snippets/01-list-controller.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/states/snippets/02-vibe.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/states/+page.svelte`

- [ ] **Step 1: Create `meta.json`**

  ```json
  {
    "title": "States",
    "description": "State primitives, controllers, and reactive stores from @rokkit/states",
    "icon": "i-solar:layers-minimalistic-bold-duotone",
    "category": "utilities",
    "order": 8,
    "tags": ["states", "ProxyItem", "ListController", "vibe", "controller", "reactive"]
  }
  ```

- [ ] **Step 2: Create snippets**

  `snippets/00-proxy-item.svelte`:
  ```svelte
  <script>
    import { ProxyItem } from '@rokkit/states'

    const fields = { label: 'name', value: 'id' }
    const item = { id: 1, name: 'Alice', role: 'admin' }
    const proxy = new ProxyItem(item, fields)

    // proxy.label → 'Alice'
    // proxy.value → 1
    // proxy.raw → { id: 1, name: 'Alice', role: 'admin' }
  </script>
  ```

  `snippets/01-list-controller.svelte`:
  ```svelte
  <script>
    import { ListController } from '@rokkit/states'

    const items = ['a', 'b', 'c']
    const controller = new ListController(items)

    controller.select('a')
    // controller.selectedKey → 'a'
    // controller.focusedKey → 'a'

    controller.moveNext()
    // controller.focusedKey → 'b'
  </script>
  ```

  `snippets/02-vibe.svelte`:
  ```svelte
  <script>
    import { vibe } from '@rokkit/states'

    // vibe.style — current data-style value ('rokkit' | 'minimal' | 'material')
    // vibe.mode — current data-mode value ('light' | 'dark')
    // vibe.palette — current data-palette value
  </script>

  <p>Current style: {vibe.style}</p>
  <p>Current mode: {vibe.mode}</p>
  ```

- [ ] **Step 3: Write `+page.svelte`**

  Source: `docs/llms/packages/states.txt`

  Cover: ProxyItem (read-only view mapper), ProxyTree (hierarchical), Wrapper (reactive model),
  LazyWrapper (lazy-loading), ListController (flat nav state), TableController (row/col nav),
  vibe (reactive theming store), messages (notification store), watchMedia/defaultBreakpoints

  Structure:
  ```
  intro para
  h2: ProxyItem — view mapping
    Code: 00-proxy-item.svelte
  h2: ListController — navigation state
    Code: 01-list-controller.svelte
  h2: vibe — reactive theming
    Code: 02-vibe.svelte
  h2: All exports (table: export | type | purpose)
  h2: Related
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/states/
  git commit -m "feat(site): add utilities/states reference page (@rokkit/states)"
  ```

---

### Task 9: `utilities/core` — @rokkit/core reference

**Files:**
- Create: `site/src/routes/(learn)/docs/utilities/core/meta.json`
- Create: `site/src/routes/(learn)/docs/utilities/core/snippets/00-field-mapper.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/core/+page.svelte`

- [ ] **Step 1: Create `meta.json`**

  ```json
  {
    "title": "Core",
    "description": "Field mapping utilities, theme helpers, and string utilities",
    "icon": "i-solar:settings-bold-duotone",
    "category": "utilities",
    "order": 9,
    "tags": ["core", "field-mapping", "FieldMapper", "mapFields", "utilities"]
  }
  ```

- [ ] **Step 2: Create snippet `00-field-mapper.svelte`**

  ```svelte
  <script>
    import { mapFields } from '@rokkit/core'

    const fields = { label: 'name', value: 'id' }
    const item = { id: 42, name: 'Widget', category: 'tools' }

    const mapped = mapFields(item, fields)
    // mapped.label → 'Widget'
    // mapped.value → 42
  </script>
  ```

- [ ] **Step 3: Write `+page.svelte`**

  Source: `docs/llms/packages/core.txt`

  Cover: `mapFields`, `FieldMapper` class, theme utilities, string utilities, when to use
  `@rokkit/core` directly (rarely — mostly used internally by components).

  Structure:
  ```
  intro para
  h2: Field mapping
    Code: 00-field-mapper.svelte
  h2: Theme utilities (brief — resolveStyle, etc.)
  h2: String utilities (brief — slugify, truncate, etc.)
  h2: When to use @rokkit/core directly
  h2: Related
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/core/
  git commit -m "feat(site): add utilities/core reference page (@rokkit/core)"
  ```

---

### Task 10: `utilities/data` — @rokkit/data reference

**Files:**
- Create: `site/src/routes/(learn)/docs/utilities/data/meta.json`
- Create: `site/src/routes/(learn)/docs/utilities/data/snippets/00-dataset.js`
- Create: `site/src/routes/(learn)/docs/utilities/data/snippets/01-filter.js`
- Create: `site/src/routes/(learn)/docs/utilities/data/+page.svelte`

- [ ] **Step 1: Create `meta.json`**

  ```json
  {
    "title": "Data",
    "description": "Dataset pipeline, filtering, formatting, and hierarchy utilities",
    "icon": "i-solar:database-bold-duotone",
    "category": "utilities",
    "order": 10,
    "tags": ["data", "dataset", "filter", "formatter", "hierarchy", "pipeline"]
  }
  ```

- [ ] **Step 2: Create snippets**

  Read `docs/llms/packages/data.txt` to get accurate API signatures for the snippets.
  Create two snippets showing the key usage patterns:
  - `00-dataset.js` — dataset creation and pipeline
  - `01-filter.js` — filter and sort usage

- [ ] **Step 3: Write `+page.svelte`**

  Source: `docs/llms/packages/data.txt`

  Cover: `createDataset`, pipeline operations (filter, sort, group, rollup), formatter utilities,
  hierarchy helpers for tree data.

  Structure:
  ```
  intro para
  h2: Dataset pipeline
    Code: 00-dataset.js
  h2: Filtering and sorting
    Code: 01-filter.js
  h2: Formatter — value formatting
  h2: Hierarchy — tree data
  h2: All exports (table)
  h2: Related
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/data/
  git commit -m "feat(site): add utilities/data reference page (@rokkit/data)"
  ```

---

### Task 11: `utilities/unocss` — @rokkit/unocss reference

**Files:**
- Create: `site/src/routes/(learn)/docs/utilities/unocss/meta.json`
- Create: `site/src/routes/(learn)/docs/utilities/unocss/snippets/00-setup.js`
- Create: `site/src/routes/(learn)/docs/utilities/unocss/snippets/01-options.js`
- Create: `site/src/routes/(learn)/docs/utilities/unocss/+page.svelte`

- [ ] **Step 1: Create `meta.json`**

  ```json
  {
    "title": "UnoCSS",
    "description": "presetRokkit setup and configuration for Rokkit's color and utility system",
    "icon": "i-solar:palette-bold-duotone",
    "category": "utilities",
    "order": 11,
    "tags": ["unocss", "presetRokkit", "preset", "colors", "utility-classes", "css"]
  }
  ```

- [ ] **Step 2: Create snippets**

  `snippets/00-setup.js`:
  ```js
  // uno.config.js
  import { defineConfig } from 'unocss'
  import { presetRokkit } from '@rokkit/unocss'

  export default defineConfig({
    presets: [presetRokkit()]
  })
  ```

  `snippets/01-options.js` — show presetRokkit options (read `docs/llms/packages/unocss.txt`
  for the actual options; create snippet showing key configuration):

- [ ] **Step 3: Write `+page.svelte`**

  Source: `docs/llms/packages/unocss.txt`

  Cover: `presetRokkit` (the one export), what it configures (color tokens, shortcuts, icon
  integration, dark mode), all available options, link to theming overview for utility class
  usage guide.

  Structure:
  ```
  intro para
  h2: Setup
    Code: 00-setup.js
  h2: What presetRokkit adds
  h2: Configuration options
    Code: 01-options.js
  h2: presetBackgrounds (if exists)
  h2: Related
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/unocss/
  git commit -m "feat(site): add utilities/unocss reference page (@rokkit/unocss)"
  ```

---

### Task 12: `utilities/app` — @rokkit/app reference

**Files:**
- Create: `site/src/routes/(learn)/docs/utilities/app/meta.json`
- Create: `site/src/routes/(learn)/docs/utilities/app/snippets/00-theme-switcher.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/app/snippets/01-table-of-contents.svelte`
- Create: `site/src/routes/(learn)/docs/utilities/app/+page.svelte`

- [ ] **Step 1: Create `meta.json`**

  ```json
  {
    "title": "App",
    "description": "ThemeSwitcherToggle and TableOfContents app-level components",
    "icon": "i-solar:widget-bold-duotone",
    "category": "utilities",
    "order": 12,
    "tags": ["app", "ThemeSwitcherToggle", "TableOfContents", "theme", "navigation"]
  }
  ```

- [ ] **Step 2: Create snippets**

  `snippets/00-theme-switcher.svelte`:
  ```svelte
  <script>
    import { ThemeSwitcherToggle } from '@rokkit/app'
  </script>

  <!-- Icon-button theme switcher: cycles light → dark → system -->
  <!-- Reads/writes vibe store from @rokkit/states -->
  <ThemeSwitcherToggle />

  <!-- With explicit mode options -->
  <ThemeSwitcherToggle modes={['light', 'dark']} />
  ```

  `snippets/01-table-of-contents.svelte`:
  ```svelte
  <script>
    import { TableOfContents } from '@rokkit/app'
    import { afterNavigate } from '$app/navigation'

    let toc

    // Rescan on route change (SvelteKit)
    afterNavigate(() => toc?.rescan())
  </script>

  <!-- Scans headings inside element with id="main-content" -->
  <TableOfContents bind:this={toc} container="main-content" />

  <!-- Custom container id -->
  <TableOfContents bind:this={toc} container="article-body" />
  ```

- [ ] **Step 3: Write `+page.svelte`**

  Source: `docs/llms/packages/app.txt`

  Cover:
  - `ThemeSwitcherToggle` — props (`modes`, `styles`, `config`), integrates with `vibe` store
  - `TableOfContents` — props (`container`), `rescan()` method, SvelteKit `afterNavigate` pattern,
    data attributes on rendered elements (`data-toc-active`, `data-toc-level`, etc.)

  Structure:
  ```
  intro para
  h2: ThemeSwitcherToggle
    Code: 00-theme-switcher.svelte
    props table
  h2: TableOfContents
    Code: 01-table-of-contents.svelte
    props table + rescan() method
  h2: Related
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add site/src/routes/\(learn\)/docs/utilities/app/
  git commit -m "feat(site): add utilities/app reference page (@rokkit/app)"
  ```

---

## Final Verification

- [ ] All 6 targeted fixes are applied and committed
- [ ] All 6 new utility pages exist with meta.json + +page.svelte + snippets/
- [ ] `data-style` is used correctly throughout (not `data-palette` for style selection)
- [ ] `NestedController` reference removed from controllers page
- [ ] Select llms doc uses `items` (not `options`)
- [ ] New pages appear in sidebar under Utilities (check meta.json category and order values)
- [ ] `docs/superpowers/2026-03-16-llms-learn-site-gap-analysis.md` — update completed items
