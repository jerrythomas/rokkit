# LLMs Entry Point & CLI Reference Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `docs/llms/index.txt` as a navigational entry point with CLI-first setup workflow and correct theming docs, and create `docs/llms/cli.txt` as a full CLI reference.

**Architecture:** Two content files are written using information sourced directly from `packages/cli/src/init.js`, `packages/cli/src/doctor.js`, and the existing theming spec. The existing component index and keyboard nav sections are preserved. No code changes — this is documentation only.

**Tech Stack:** Plain text (`.txt`), sourced from existing Svelte/JS source files.

---

## Chunk 1: Rewrite docs/llms/index.txt

### Task 1: Rewrite index.txt

**Files:**
- Modify: `docs/llms/index.txt`
- Source references (read these before writing):
  - `packages/cli/src/init.js` — PROMPTS_CONFIG array (all prompts)
  - `packages/cli/src/doctor.js` — check IDs, labels, fixability
  - `docs/superpowers/specs/2026-03-16-llms-txt-theming-docs.md` — correct theming content

There are no automated tests for content files. Verification is done by cross-checking the written content against source files.

- [ ] **Step 1: Read source files**

  Read these files to gather accurate information before writing:
  ```
  packages/cli/src/init.js        — PROMPTS_CONFIG array (prompts list)
  packages/cli/src/doctor.js      — CHECKS array (check IDs, labels, autofix flags)
  docs/superpowers/specs/2026-03-16-llms-txt-theming-docs.md — theming content
  docs/llms/index.txt             — current file (to preserve component index and keyboard nav)
  ```

- [ ] **Step 2: Write the new index.txt**

  Replace the entire contents of `docs/llms/index.txt` with the following. The component index and keyboard nav table are preserved from the current file. Insert correct content for all new sections.

  ```
  # Rokkit — LLM Reference Index

  > Data-driven, accessible UI components for Svelte 5

  ## Quick Setup

  **Always use the CLI — manual setup leads to configuration errors.**

  1. Create a SvelteKit project:
     ```bash
     npm create svelte@latest myapp
     cd myapp
     npm install
     ```

  2. Initialize Rokkit:
     ```bash
     npx @rokkit/cli@latest init
     ```

     The `init` command is interactive. It prompts for:
     - **Color palette:** `default` (orange/pink/sky) | `vibrant` (blue/purple) | `seaweed` (sky/green) | `custom`
     - If `custom`: primary, secondary, accent, surface colors (hex)
     - **Icon collection:** Rokkit built-in | custom
     - If custom: path to icon folder
     - **Theme styles** (multi-select, min 1): `rokkit` | `minimal` | `material`
     - **Switcher mode:** `system` (prefers-color-scheme) | `manual` (user toggles) | `full` (light/dark + style variants)

     Files written: `rokkit.config.js`, `uno.config.js`, `src/app.css`, `src/app.html`

     See [cli.txt](/llms/cli.txt) for full CLI reference.

  ## Verify & Fix

  After setup, or when things seem broken:

  ```bash
  npx @rokkit/cli@latest doctor
  ```

  Runs 4 checks:
  - `rokkit.config.js` exists
  - `uno.config.js` uses `presetRokkit()`
  - `src/app.css` has theme imports
  - `src/app.html` has theme init script

  Auto-fix 3 of 4 checks:
  ```bash
  npx @rokkit/cli@latest doctor --fix
  ```

  Exit codes: `0` = all pass, `1` = any failures.

  ## Troubleshooting

  ### `uno.config.js` does not use `presetRokkit()` (not auto-fixable)

  `doctor --fix` cannot overwrite an existing `uno.config.js`. Add the preset manually:

  ```js
  // uno.config.js
  import { defineConfig } from 'unocss'
  import { presetRokkit } from '@rokkit/unocss'

  export default defineConfig({
    presets: [presetRokkit()]
  })
  ```

  ### `rokkit.config.js` missing

  If `doctor --fix` was not run, or the file was deleted:
  ```js
  // rokkit.config.js — minimal valid config
  export default {}
  ```

  ### `app.css` missing theme imports

  Prepend the missing lines to `src/app.css`:
  ```css
  @import '@unocss/reset/tailwind.css';
  @import '@rokkit/themes/dist/base';
  @import '@rokkit/themes/dist/rokkit';  /* also minimal, material if needed */
  ```

  ### Theme init script missing after --fix

  Verify that `<body>` is on its own line in `src/app.html`. The script is injected immediately after `<body>`.

  ### Components render without styles

  Verify `src/app.css` has all three imports (see above). Also confirm `uno.config.js` uses `presetRokkit()` (see below).

  ## Packages

  | Package | Description |
  |---------|-------------|
  | `@rokkit/ui` | Main UI components (30+ components) |
  | `@rokkit/forms` | Dynamic form generation from JSON schema |
  | `@rokkit/states` | State management (ProxyItem, ProxyTree, Wrapper, ListController, NestedController) |
  | `@rokkit/actions` | Svelte actions (navigable, hoverLift, magnetic, ripple) |
  | `@rokkit/core` | Core utilities and field mapping |
  | `@rokkit/data` | Data manipulation utilities |
  | `@rokkit/themes` | CSS themes (rokkit, minimal, material) |
  | `@rokkit/unocss` | UnoCSS preset (`presetRokkit`) |
  | `@rokkit/app` | App-level UI chrome (ThemeSwitcher, TableOfContents) |
  | `@rokkit/icons` | Icon system with Iconify integration |

  Package reference: [packages/](/llms/packages/)

  ## Standard API Pattern

  Most selection components share this pattern:

  ```svelte
  <Component
    options={data}              <!-- or items= -->
    bind:value                  <!-- selected value (bindable) -->
    fields={{ text: 'name' }}   <!-- map data fields to component expectations -->
    onchange={(v, item) => {}}  <!-- selection callback -->
  />
  ```

  ## Field Mapping System

  Map any data structure without transforming data:

  ```svelte
  <script>
    const users = [
      { userId: 1, fullName: 'Alice', avatarUrl: '/alice.jpg' }
    ]
    const fields = {
      value: 'userId',
      text: 'fullName',
      icon: 'avatarUrl'
    }
  </script>

  <Select options={users} {fields} bind:value />
  ```

  ## Theming

  ### Data Attributes

  ```html
  <body
    data-style="rokkit"         <!-- visual personality: rokkit | material | minimal -->
    data-mode="dark"            <!-- light | dark -->
    data-density="comfortable"  <!-- compact | default | comfortable -->
  >
  ```

  `data-palette` sets the active color skin (e.g. `skin-vibrant-orange`). Managed reactively by the `vibe` store (`@rokkit/states`) and `themable` action (`@rokkit/actions`).

  ### UnoCSS Utility Classes (primary authoring model)

  Do NOT use CSS variables in `<style>` blocks — they are not theme-aware. Use utility classes:

  ```svelte
  <!-- ✅ Correct: theme-aware, responds to data-mode switching -->
  <div class="bg-surface-z1 border border-surface-z3 text-surface-z8 rounded-lg p-4">
    <h2 class="text-primary-z6 font-semibold">Title</h2>
    <p class="text-surface-z5 text-sm">Subtitle</p>
  </div>

  <!-- ❌ Wrong: not theme-aware -->
  <div style="background: var(--color-surface-z1)">...</div>
  ```

  ### Z-Scale Color System

  Each semantic role (`surface`, `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`) has 10 z-levels:

  | Level | Light      | Dark       | Use                        |
  |-------|-----------|-----------|----------------------------|
  | `z1`  | shade-50  | shade-950 | Page background            |
  | `z2`  | shade-100 | shade-900 | Card / panel background    |
  | `z3`  | shade-200 | shade-800 | Subtle borders, dividers   |
  | `z4`  | shade-300 | shade-700 | Input backgrounds          |
  | `z5`  | shade-500 | shade-600 | Muted text, placeholders   |
  | `z6`  | shade-600 | shade-500 | Interactive / link color   |
  | `z7`  | shade-700 | shade-300 | Secondary text             |
  | `z8`  | shade-800 | shade-200 | Body text                  |
  | `z9`  | shade-900 | shade-100 | Primary text               |
  | `z10` | shade-950 | shade-50  | Maximum contrast           |

  Utility class pattern: `{prefix}-{role}-z{n}`

  | Prefix    | Example             | Use             |
  |-----------|---------------------|-----------------|
  | `bg-`     | `bg-surface-z1`     | Background      |
  | `text-`   | `text-surface-z8`   | Text color      |
  | `border-` | `border-surface-z3` | Border color    |

  ### Common Patterns

  ```svelte
  <!-- Page background -->
  <div class="bg-surface-z1 text-surface-z8">

  <!-- Card -->
  <div class="bg-surface-z1 border border-surface-z3 rounded-lg p-4">

  <!-- Section header -->
  <h2 class="text-xs font-semibold text-surface-z5 uppercase tracking-wider">

  <!-- Primary link -->
  <a class="text-primary-z6 hover:text-primary-z7 transition-colors">

  <!-- Input field -->
  <input class="bg-surface-z2 border border-surface-z3 text-surface-z8 focus:border-primary-z5 focus:outline-none rounded px-3 py-2">

  <!-- Status indicators -->
  <span class="text-warning-z6">Stale</span>
  <span class="text-success-z6">Active</span>
  <span class="text-error-z6">Failed</span>

  <!-- Table row separator -->
  <tr class="border-b border-surface-z2 last:border-b-0">
    <td class="px-4 py-2.5 text-surface-z7">...</td>
  </tr>
  ```

  ### Inline styles: only for dynamic computed values

  ```svelte
  <!-- ✅ OK: computed in JS, can't be a static class -->
  <div style="background: {color}22; color: {color}">

  <!-- ❌ Not OK: use utility class instead -->
  <div style="background: var(--color-surface-z1)">
  ```

  ## Reference

  - [cli.txt](/llms/cli.txt) — CLI reference (`rokkit init`, `rokkit doctor`, icon tools)
  - [packages/](/llms/packages/) — per-package documentation
  - [components/](/llms/components/) — component reference (30+ components)

  ## Component Index

  [PRESERVE VERBATIM from current `docs/llms/index.txt`: copy from the `## Component Index` heading through the last bullet in the Layout & Display section. Include all sub-headings: Selection & Navigation, Menus & Actions, Form Inputs, Upload, Layout & Display.]

  ## Keyboard Navigation

  [PRESERVE VERBATIM from current `docs/llms/index.txt`: copy the `## Keyboard Navigation` heading, the introductory sentence, and the full key/action table.]

  ## Import

  ```javascript
  import { List, Tree, Select, MultiSelect, Tabs, Toggle, Table, Toolbar, Menu } from '@rokkit/ui'
  import { UploadTarget, UploadProgress } from '@rokkit/ui'
  import { FloatingAction } from '@rokkit/ui'
  import { Form, FormRenderer } from '@rokkit/forms'
  ```
  ```

  **Important:** Replace the two `[PRESERVE VERBATIM ...]` placeholders by copying verbatim from the current `docs/llms/index.txt` — do not rewrite or reformat them. Read the current file to get the exact text.

- [ ] **Step 3: Verify accuracy**

  Cross-check these facts against source files:
  - Prompt list matches `PROMPTS_CONFIG` in `packages/cli/src/init.js`
  - Check IDs and fixability match `packages/cli/src/doctor.js`
  - Theming attributes (`data-style`, not `data-theme`) are correct
  - `@rokkit/actions` exports — verify correct action names (e.g. `navigable` vs `navigator`) by reading `packages/actions/src/index.js`
  - Component index links all have corresponding `.txt` files in `docs/llms/components/`

- [ ] **Step 4: Commit**

  ```bash
  git add docs/llms/index.txt
  git commit -m "docs(llms): rewrite index.txt as entry point with CLI setup and correct theming"
  ```

---

## Chunk 2: Create docs/llms/cli.txt

### Task 2: Create cli.txt

**Files:**
- Create: `docs/llms/cli.txt`
- Source references (read these before writing):
  - `packages/cli/src/init.js` — full PROMPTS_CONFIG, generateConfig, file writing logic
  - `packages/cli/src/doctor.js` — CHECKS array, fix handlers
  - `packages/cli/src/index.js` — command registration, bundle/build commands

- [ ] **Step 1: Read source files**

  Read these files for accurate content:
  ```
  packages/cli/src/init.js     — full prompt list, generated files, conditional logic
  packages/cli/src/doctor.js   — check IDs, labels, fix behaviour
  packages/cli/src/index.js    — bundle/build command signatures and flags
  ```

- [ ] **Step 2: Write docs/llms/cli.txt**

  Create `docs/llms/cli.txt` with this content (verify all details against source files):

  ```
  # Rokkit CLI

  > Command-line tools for setting up and validating Rokkit projects

  Package: `@rokkit/cli`

  ## Usage

  Run without installing:
  ```bash
  npx @rokkit/cli@latest <command>
  ```

  Or install globally:
  ```bash
  npm install -g @rokkit/cli
  rokkit <command>
  ```

  ## rokkit init

  Interactive setup for an existing SvelteKit project. Run from the project root.

  ```bash
  npx @rokkit/cli@latest init
  ```

  ### Prompts

  1. **Color palette**
     - `default` — orange / pink / sky
     - `vibrant` — blue / purple
     - `seaweed` — sky / green
     - `custom` — specify your own colors

  2. **Custom colors** (only shown if palette = `custom`)
     - Primary (hex)
     - Secondary (hex)
     - Accent (hex)
     - Surface (hex)

  3. **Icon collection**
     - Rokkit built-in icons
     - Custom icon collection

  4. **Custom icon path** (only shown if custom icons selected)
     - Relative path to your SVG icon folder

  5. **Theme styles** (multi-select, at least 1 required)
     - `rokkit` — default Rokkit personality
     - `minimal` — clean, understated
     - `material` — Material Design-inspired

  6. **Switcher mode**
     - `system` — follows `prefers-color-scheme`; no init script needed
     - `manual` — user-controlled light/dark; adds flash-prevention script
     - `full` — light/dark + style variants; adds flash-prevention script

  ### Files Written

  | File | Notes |
  |------|-------|
  | `rokkit.config.js` | Color palette and theme config. Skipped if already exists. |
  | `uno.config.js` | UnoCSS config with `presetRokkit()`. Skipped if already exists (manual migration hint printed). |
  | `src/app.css` | Prepends reset, base, and per-theme `@import` lines. Skipped if imports already present. |
  | `src/app.html` | Injects theme init script after `<body>`. Only for `manual` and `full` modes. |

  ### After init

  ```
  Done! Run 'rokkit doctor' to verify your setup.
  ```

  ## rokkit doctor

  Validates Rokkit project configuration. Run from the project root.

  ```bash
  npx @rokkit/cli@latest doctor        # check only
  npx @rokkit/cli@latest doctor --fix  # check and auto-fix where possible
  ```

  ### Checks

  | Check ID | Description | Auto-fixable |
  |----------|-------------|-------------|
  | `config-exists` | `rokkit.config.js` exists in project root | ✓ generates empty config |
  | `uno-uses-preset` | `uno.config.js` imports and uses `presetRokkit()` | ✗ manual |
  | `css-imports` | `src/app.css` has required `@import` lines | ✓ appends missing imports |
  | `html-init-script` | `src/app.html` has theme init script in `<body>` | ✓ injects script |

  ### Exit codes

  | Code | Meaning |
  |------|---------|
  | `0` | All checks passed |
  | `1` | One or more checks failed |

  ### Manual fix: `uno-uses-preset`

  `doctor --fix` will not overwrite an existing `uno.config.js`. Add `presetRokkit` manually:

  ```js
  import { defineConfig } from 'unocss'
  import { presetRokkit } from '@rokkit/unocss'

  export default defineConfig({
    presets: [presetRokkit()]
  })
  ```

  ## Icon Tools

  For icon library authors only. Not required for standard Rokkit projects.

  ### rokkit bundle

  Scans SVG subfolders and outputs Iconify-compatible JSON files — one per subfolder.

  ```bash
  npx @rokkit/cli@latest bundle -i ./src -o ./lib
  ```

  | Flag | Alias | Default | Description |
  |------|-------|---------|-------------|
  | `--input` | `-i` | `./src` | Source folder containing SVG subfolders |
  | `--output` | `-o` | `./lib` | Output folder for JSON bundles |

  ### rokkit build

  Builds a complete Iconify JSON package from SVG folders.

  ```bash
  npx @rokkit/cli@latest build -i ./src -o ./lib
  ```

  Same flags as `bundle`. Produces full Iconify package structure with prefix, icons, width, height metadata.
  ```

- [ ] **Step 3: Verify accuracy**

  Cross-check against source:
  - All 6 prompt groups match `PROMPTS_CONFIG` in `packages/cli/src/init.js` (some are conditional — verify which appear/disappear based on prior answers)
  - 4 file rows in the "Files Written" table match the actual write operations in `init.js`
  - Check IDs and auto-fixable flags match `packages/cli/src/doctor.js`
  - `bundle` and `build` flags match `packages/cli/src/index.js` command registration

- [ ] **Step 4: Commit**

  ```bash
  git add docs/llms/cli.txt
  git commit -m "docs(llms): add cli.txt with rokkit init and doctor reference"
  ```

---

## Final Verification

- [ ] `docs/llms/index.txt` — `data-theme` no longer appears; `data-style` is used throughout
- [ ] `docs/llms/index.txt` — Quick Setup section references `npx @rokkit/cli@latest init`
- [ ] `docs/llms/index.txt` — Theming section has full z-scale table and utility class patterns
- [ ] `docs/llms/index.txt` — Component index and keyboard nav sections are intact
- [ ] `docs/llms/cli.txt` — Exists with init, doctor, and icon tool sections
- [ ] All prompt names and check IDs verified against CLI source
