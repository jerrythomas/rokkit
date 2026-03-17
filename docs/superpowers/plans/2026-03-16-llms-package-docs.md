# LLMs Package Documentation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `docs/llms/packages/*.txt` — one LLM-optimized reference file per non-UI Rokkit package.

**Architecture:** Each `.txt` file follows the same format as `docs/llms/components/list.txt` (description → install → key exports → usage examples → related packages). Content is sourced directly from each package's source files and existing tests. `forms.txt` receives expanded coverage due to its complexity.

**Tech Stack:** Plain text (`.txt`), sourced from package source files.

---

**Template (use for all files, scale sections to package complexity):**

```
# @rokkit/<package>

> <one-line description>

## Install

```bash
npm install @rokkit/<package>
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `name` | type | what it does |

## Usage

<minimal working example with Svelte 5 syntax>

## Related

- `@rokkit/<other>` — brief reason
```

**Reference template file:** `docs/llms/components/list.txt` — read this before starting to match tone and depth.

---

## Chunk 1: Core utility packages

### Task 1: actions.txt

**Files:**
- Create: `docs/llms/packages/actions.txt`
- Source: `packages/actions/src/index.js`, `packages/actions/src/` (all action files)

The `@rokkit/actions` package provides Svelte actions — functions used with the `use:` directive. Read the source to enumerate all exported actions and understand what events/behaviour each one adds.

- [ ] **Step 1: Read source files**

  ```
  packages/actions/src/index.js     — full export list
  packages/actions/src/navigable.svelte.js  — keyboard navigation action
  packages/actions/src/                     — scan remaining action files for exports
  ```

- [ ] **Step 2: Create docs/llms/packages/actions.txt**

  Cover:
  - What Svelte actions are and how to apply them (`use:actionName`)
  - Each exported action: what it does, what events it dispatches, any options
  - The `navigable` action in detail — it is the primary keyboard navigation mechanism. It dispatches: `previous`, `next`, `select`, `collapse`, `expand` on **keyup** (not keydown). Default orientation: vertical (ArrowUp/Down).
  - Usage example showing `use:navigable` on a container with event handlers

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/actions.txt
  git commit -m "docs(llms): add packages/actions.txt"
  ```

---

### Task 2: states.txt

**Files:**
- Create: `docs/llms/packages/states.txt`
- Source: `packages/states/src/index.js`, `packages/states/src/` (all state files)

- [ ] **Step 1: Read source files**

  ```
  packages/states/src/index.js   — full export list
  packages/states/src/           — scan for key classes/functions
  ```

- [ ] **Step 2: Create docs/llms/packages/states.txt**

  Cover:
  - `ProxyItem` — read-only view mapper for a single item; methods and properties
  - `ProxyTree` — hierarchical version of ProxyItem
  - `Wrapper` — reactive model wrapper; key methods
  - `ListController` — flat list navigation state (selected key, focused key)
  - `NestedController` — tree navigation state (expand/collapse, focus)
  - `vibe` store — reactive theming state (current palette/mode/density)
  - Brief usage example for the most commonly used export (ListController or ProxyItem)

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/states.txt
  git commit -m "docs(llms): add packages/states.txt"
  ```

---

### Task 3: core.txt

**Files:**
- Create: `docs/llms/packages/core.txt`
- Source: `packages/core/src/index.js`, `packages/core/src/`

- [ ] **Step 1: Read source files**

  ```
  packages/core/src/index.js   — full export list
  packages/core/src/           — scan key utility files
  ```

- [ ] **Step 2: Create docs/llms/packages/core.txt**

  Cover:
  - Field mapper utilities — `mapFields`, related helpers (used by all components to resolve field mappings)
  - Theme utilities
  - String utilities
  - Other exported utilities — enumerate with one-line descriptions
  - When to use `@rokkit/core` directly vs relying on components to use it internally

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/core.txt
  git commit -m "docs(llms): add packages/core.txt"
  ```

---

### Task 4: data.txt

**Files:**
- Create: `docs/llms/packages/data.txt`
- Source: `packages/data/src/index.js`, `packages/data/src/`

- [ ] **Step 1: Read source files**

  ```
  packages/data/src/index.js   — full export list
  packages/data/src/           — scan filter, formatter, dataset, hierarchy files
  ```

- [ ] **Step 2: Create docs/llms/packages/data.txt**

  Cover:
  - Data manipulation helpers: filter, sort, group, rollup
  - `formatter` — value formatting utilities
  - `dataset` — dataset abstraction
  - `hierarchy` — tree/hierarchy data helpers
  - Usage examples showing typical data pipeline operations

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/data.txt
  git commit -m "docs(llms): add packages/data.txt"
  ```

---

## Chunk 2: Theme and styling packages

### Task 5: themes.txt

**Files:**
- Create: `docs/llms/packages/themes.txt`
- Source: `packages/themes/`, `packages/unocss/src/`

- [ ] **Step 1: Read source files**

  ```
  packages/themes/              — list available theme files (dist/ structure)
  packages/unocss/src/index.js  — presetRokkit export and options
  ```

- [ ] **Step 2: Create docs/llms/packages/themes.txt**

  Cover:
  - Available themes: `rokkit`, `minimal`, `material` — brief description of each personality
  - CSS import structure:
    ```css
    @import '@rokkit/themes/dist/base';      /* required */
    @import '@rokkit/themes/dist/rokkit';    /* one or more themes */
    ```
  - Custom palettes — how to override colors via `rokkit.config.js`
  - How themes relate to `data-style` attribute on `<body>`
  - **Boundary with index.txt theming section:** This file documents what the theme system provides (which themes, how to import them, how to configure palettes). The data attributes and UnoCSS utility class system are documented in `docs/llms/index.txt` — do not duplicate that content here; link to it instead.

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/themes.txt
  git commit -m "docs(llms): add packages/themes.txt"
  ```

---

### Task 6: unocss.txt

**Files:**
- Create: `docs/llms/packages/unocss.txt`
- Source: `packages/unocss/src/`, `packages/unocss/spec/`

- [ ] **Step 1: Read source files**

  ```
  packages/unocss/src/index.js     — presetRokkit export and options
  packages/unocss/spec/preset.spec.js  — understand what the preset sets up
  ```

- [ ] **Step 2: Create docs/llms/packages/unocss.txt**

  Cover:
  - `presetRokkit` — the one export; what it configures (colors, shortcuts, icons, dark mode)
  - Setup in `uno.config.js`:
    ```js
    import { defineConfig } from 'unocss'
    import { presetRokkit } from '@rokkit/unocss'
    export default defineConfig({ presets: [presetRokkit()] })
    ```
  - What `presetRokkit` adds: color palette tokens, utility class shortcuts, icon integration, dark mode handling
  - Any options `presetRokkit()` accepts
  - **Note:** The full utility class authoring guide (z-scale, common patterns) is in `docs/llms/index.txt` — link to it rather than duplicating

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/unocss.txt
  git commit -m "docs(llms): add packages/unocss.txt"
  ```

---

## Chunk 3: App and forms packages

### Task 7: app.txt

**Files:**
- Create: `docs/llms/packages/app.txt`
- Source: `packages/app/src/index.ts`, `packages/app/src/components/`

- [ ] **Step 1: Read source files**

  ```
  packages/app/src/index.ts           — full export list
  packages/app/src/components/        — list component files
  ```

- [ ] **Step 2: Create docs/llms/packages/app.txt**

  Cover:
  - `ThemeSwitcher` — full theme switcher UI; props (`modes`, `styles`, `config`)
  - `ThemeSwitcherToggle` — compact icon-button version of ThemeSwitcher
  - `TableOfContents` — on-page nav from DOM headings; props (`container`); exported `rescan()` method (call from `afterNavigate` in SvelteKit layouts)
  - Usage example for each component
  - How `ThemeSwitcher` integrates with the `vibe` store from `@rokkit/states`

- [ ] **Step 3: Commit**

  ```bash
  git add docs/llms/packages/app.txt
  git commit -m "docs(llms): add packages/app.txt"
  ```

---

### Task 8: forms.txt (expanded)

**Files:**
- Create: `docs/llms/packages/forms.txt`
- Source:
  - `packages/forms/src/index.js` — exports
  - `packages/forms/src/lib/builder.svelte.js` — FormBuilder API
  - `packages/forms/src/lib/schema.js` — field type definitions
  - `packages/forms/src/lib/lookup.js` — lookup system
  - `packages/forms/src/lib/validation.js` — validation rules
  - `packages/forms/src/components/FormRenderer.svelte` (or equivalent) — FormRenderer props
  - `packages/forms/spec/lib/builder.spec.svelte.js` — examples of builder usage
  - `packages/forms/spec/lib/lookup.spec.js` — examples of lookup modes

This is the most complex package. Take time to read all source files before writing.

- [ ] **Step 1: Read source files**

  ```
  packages/forms/src/index.js
  packages/forms/src/lib/builder.svelte.js   — createForm(), updateField(), isFieldDisabled(), refreshLookup()
  packages/forms/src/lib/schema.js           — all supported field types
  packages/forms/src/lib/lookup.js           — url, fetch, source+filter modes
  packages/forms/src/lib/validation.js       — validation rule format
  packages/forms/src/components/             — FormRenderer component (find the file)
  packages/forms/spec/lib/builder.spec.svelte.js  — builder usage examples
  packages/forms/spec/lib/lookup.spec.js          — lookup mode examples
  ```

- [ ] **Step 2: Create docs/llms/packages/forms.txt**

  This file must cover all of the following in detail:

  **createForm()**
  - Schema definition format
  - All supported field types (enumerate each with its options — read `schema.js` for the canonical list)

  **FormBuilder API**
  - `updateField(path, changes)` — update a field definition reactively
  - `isFieldDisabled(path)` — check if a field is disabled (e.g. dependent lookup not yet ready)
  - `refreshLookup(path)` — manually trigger a lookup re-fetch

  **FormRenderer**
  - Props: schema, builder instance, any others
  - Snippet/slot customization — how to override individual field rendering

  **Field types** (read `schema.js` — document every type)
  - For each type: name, purpose, type-specific options, example

  **Validation**
  - How to define validation rules in the schema
  - How errors are surfaced to the user
  - Example: required field, min/max, custom validator

  **Lookups — three modes**

  Mode 1: `url` — server fetch from URL template
  ```js
  lookup: {
    url: '/api/cities?country={country}',
    // {country} is replaced with the current value of the 'country' field
  }
  ```

  Mode 2: `fetch` — custom async function
  ```js
  lookup: {
    fetch: async ({ values }) => {
      if (!values.country) return { disabled: true, options: [] }
      const res = await fetch(`/api/cities?country=${values.country}`)
      return { options: await res.json() }
    }
  }
  ```

  Mode 3: `source + filter` — client-side filter
  ```js
  lookup: {
    source: allCities,
    filter: (item, values) => item.country === values.country
  }
  ```

  **Dependent fields**
  - How `disabled` state works: set `disabled: true` inside `fetch()` when dependencies are unmet
  - `initialize()` calls `fetch()` for all lookups — `disabled` state is set on first load
  - `updateField()` clears dependent field values before re-fetching lookup

  **Dynamic forms**
  - Showing/hiding fields based on other field values using `updateField()`
  - Changing a field's options or type in response to another field's change
  - Example: selecting a "type" field that changes which fields are visible or required

  **Full end-to-end example**
  Include a complete working example: a form with at least two fields where the second is a dependent lookup, plus validation on one field. Show `createForm()`, `FormRenderer`, and how to handle the submit.

- [ ] **Step 3: Verify accuracy**

  Cross-check:
  - Every field type listed matches `packages/forms/src/lib/schema.js` (no omissions)
  - Lookup mode signatures match `packages/forms/src/lib/lookup.js`
  - `FormBuilder` method names and signatures match `packages/forms/src/lib/builder.svelte.js`
  - End-to-end example uses correct API (verify against a test in `spec/lib/builder.spec.svelte.js`)

- [ ] **Step 4: Commit**

  ```bash
  git add docs/llms/packages/forms.txt
  git commit -m "docs(llms): add packages/forms.txt with full forms reference"
  ```

---

## Final Verification

- [ ] `docs/llms/packages/` contains 8 files: `actions.txt`, `states.txt`, `core.txt`, `data.txt`, `themes.txt`, `unocss.txt`, `app.txt`, `forms.txt`
- [ ] Each file follows the template format (description → install → key exports → usage → related)
- [ ] `forms.txt` covers all field types from `schema.js` with no omissions
- [ ] `themes.txt` does not duplicate theming content from `index.txt` (links instead)
- [ ] `unocss.txt` does not duplicate utility class guide from `index.txt` (links instead)
- [ ] All source file cross-checks in Task 8 Step 3 pass
