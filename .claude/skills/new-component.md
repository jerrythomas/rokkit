---
name: new-component
description: Use when adding a new UI component to @rokkit/ui. Covers component file, exports, theme CSS (+ build), vitest unit tests, Playwright e2e tests, playground page, and live doc page. Includes the full pattern library — data attributes, icons, proxy/fields, controller+navigator, ARIA — with tier selection guidance.
---

# Writing a New Component

Every new component ships with two things simultaneously: working code and a live doc page. The doc page is the verification tool — you build it alongside the component so you can see it in action, catch bugs early, and hand the user a playground in the same commit.

## Step 1: Choose the Right Tier

Pick the tier before writing a single line. Wrong tier = wrong architecture.

| Tier | Pattern | When to Use | Examples |
|------|---------|-------------|----------|
| **1** | Simple display | No `items`, no keyboard nav, display only | Button, Card, Badge, Message, Pill |
| **2** | Data-driven display | `items` array rendered via ProxyItem, click handlers but no keyboard nav | BreadCrumbs, PaletteManager |
| **3** | Interactive list | `items` + keyboard nav, persistent on-screen container | List, Tree, Tabs, Toggle, Toolbar |
| **4** | Complex interactive | Dropdowns, lazy-loading, multi-select, nested controllers | Menu, Select, MultiSelect, LazyTree |

**How to decide:**
- Does it show a list of `items` the user navigates with arrow keys? → Tier 3
- Does it show a dropdown of `items`? → Tier 4
- Does it render an array of data without keyboard nav? → Tier 2
- Everything else → Tier 1

---

## Step 2: Implement the Component

### Data-Attribute Naming Conventions

Data attributes are the only CSS hooks. Never use scoped classes.

**Root element:** `data-<name>-root` or `data-<name>` (check existing components for precedent)

**Child elements:** `data-<name>-<element>`
```
data-list              — root nav element
data-list-item         — leaf item button
data-list-item-icon    — icon span inside item
data-list-group        — group header button
data-list-separator    — <hr> divider
```

**State attributes:** use `attr={value || undefined}` — `undefined` omits the attribute, keeping HTML clean
```svelte
data-active={isActive || undefined}       <!-- present when true, absent when false -->
data-disabled={disabled || undefined}
data-selected={selected || undefined}
data-open={isOpen || undefined}
data-variant="primary"                    <!-- enum: always present -->
data-orientation="horizontal"             <!-- enum: always present -->
```

**Required for navigation:** `data-path={key}` on every interactive element that should receive keyboard focus and click handling. Elements without `data-path` are invisible to the Navigator (use this for separators and spacers).

### State Icons Pattern

Icons are UnoCSS shortcuts (e.g. `state-error` → `i-rokkit:state-error`). Applied as CSS class on `<span aria-hidden="true">`.

```svelte
<script lang="ts">
  import { DEFAULT_STATE_ICONS } from '@rokkit/core'

  interface MyProps {
    icons?: { opened?: string; closed?: string }
  }
  // Pull from the right group, merge with user overrides
  const { icons: userIcons = {} }: MyProps = $props()
  const icons = $derived({ ...DEFAULT_STATE_ICONS.accordion, ...userIcons })
</script>

<span class={isExpanded ? icons.opened : icons.closed} aria-hidden="true"></span>
```

**UnoCSS safelist:** Dynamic icon classes won't be detected by the scanner. If your component uses `state-error`, `state-info`, etc. as dynamic CSS classes, they must be in `site/uno.config.js` safelist — `stateIcons` array already covers `state-error/warning/success/info/unknown`. For other dynamically-applied shortcuts, add them to the safelist.

**Available icon groups in `DEFAULT_STATE_ICONS`:**

| Group | Keys | Use for |
|-------|------|---------|
| `accordion` | opened, closed | List groups, collapsible sections |
| `folder` | opened, closed | Tree nodes |
| `selector` | opened, closed | Select/Menu dropdowns |
| `node` | opened, closed | Tree leaf nodes |
| `checkbox` | checked, unchecked, unknown | Checkbox state |
| `radio` | on, off | Radio state |
| `rating` | filled, empty, half | Star ratings |
| `state` | error, warning, success, info | Status/message types |
| `sort` | none, ascending, descending | Table sort |
| `action` | remove, cancel, add, copy, close, search… | Action buttons |
| `navigate` | left, right, up, down | Navigation arrows |
| `mode` | dark, light, system | Theme toggle |

---

### Tier 1: Simple Display Component

No `items` prop. Data comes as direct props or children. No Navigator.

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'

  interface BadgeProps {
    type?: 'error' | 'warning' | 'success' | 'info'
    text?: string
    children?: Snippet
    class?: string
  }

  const {
    type = 'info',
    text,
    children,
    class: className = ''
  }: BadgeProps = $props()
</script>

<span data-badge data-type={type} class={className || undefined}>
  {#if children}{@render children()}{:else}{text}{/if}
</span>
```

**ARIA for Tier 1:** Use semantic HTML (`<button>`, `<a>`) where appropriate. Add `role` only when overriding semantics. Decorative icons always `aria-hidden="true"`.

---

### Tier 2: Data-Driven Display Component

`items` array rendered via `ProxyItem`. Click handlers but no keyboard navigation.

```svelte
<script lang="ts">
  import { ProxyItem } from '@rokkit/states'

  interface BreadCrumbsProps {
    items?: unknown[]
    fields?: Record<string, string>
    onselect?: (value: unknown) => void
  }

  const { items = [], fields = {}, onselect }: BreadCrumbsProps = $props()
</script>

<nav data-breadcrumbs aria-label="Breadcrumb">
  {#each items as raw, i}
    {@const proxy = new ProxyItem(raw, fields, String(i), 1)}
    {@const isLast = i === items.length - 1}

    {#if i > 0}
      <span data-breadcrumbs-separator aria-hidden="true"></span>
    {/if}

    <button
      data-breadcrumbs-item
      data-active={isLast || undefined}
      aria-current={isLast ? 'page' : undefined}
      onclick={() => onselect?.(proxy.value)}
      disabled={isLast}
    >
      {#if proxy.get('icon')}
        <span class={proxy.get('icon')} aria-hidden="true"></span>
      {/if}
      <span data-breadcrumbs-label>{proxy.label}</span>
    </button>
  {/each}
</nav>
```

**ProxyItem field access:**
```svelte
proxy.label              // display text (→ item[fields.label ?? 'label'])
proxy.value              // semantic value (→ item[fields.value ?? 'value'])
proxy.key                // path-based key ('0', '0-1', etc.)
proxy.level              // nesting depth
proxy.disabled           // boolean
proxy.get('icon')        // mapped field access: item[fields.icon ?? 'icon']
proxy.get('subtext')     // → item[fields.subtext ?? 'description']
proxy.get('badge')       // → item[fields.badge ?? 'badge']
proxy.get('avatar')      // → item[fields.avatar ?? 'image']
proxy.get('shortcut')    // → item[fields.shortcut ?? 'shortcut']
proxy.get('href')        // → item[fields.href ?? 'href']
```

**Fields prop usage:**
```svelte
<!-- Data: { name: 'Home', url: '/', img: '/logo.png' } -->
<BreadCrumbs
  {items}
  fields={{ label: 'name', href: 'url', avatar: 'img' }}
/>
```

**ARIA for Tier 2:** `<nav aria-label="...">` wrapping. `aria-current="page"` on active item. Disabled via HTML `disabled` attribute on buttons.

---

### Tier 3: Interactive List Component

`items` + `ProxyTree` + `Wrapper` + `Navigator`. Persistent on-screen. Keyboard navigable.

```svelte
<script lang="ts">
  import { ProxyTree, Wrapper } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'
  import { DEFAULT_STATE_ICONS } from '@rokkit/core'

  interface ToggleProps {
    items?: unknown[]
    fields?: Record<string, string>
    value?: unknown
    onchange?: (value: unknown) => void
    icons?: { opened?: string; closed?: string }
    class?: string
  }

  const {
    items = [],
    fields = {},
    value = $bindable(),
    onchange,
    icons: userIcons = {},
    class: className = ''
  }: ToggleProps = $props()

  const icons = $derived({ ...DEFAULT_STATE_ICONS.accordion, ...userIcons })

  // Data layer: wraps raw items in reactive proxies
  const tree = $derived(new ProxyTree(items, fields))

  // Navigation layer: owns focusedKey, handles select/expand/collapse
  const wrapper = $derived(
    new Wrapper(tree, {
      onselect: (v) => {
        value = v
        onchange?.(v)
      }
    })
  )

  let el: HTMLElement | undefined = $state()

  // Wire Navigator to DOM element — handles Arrow keys, Enter, Space, Escape
  $effect(() => {
    if (!el) return
    const nav = new Navigator(el, wrapper)
    return () => nav.destroy()
  })

  // Sync external value changes to keyboard focus
  $effect(() => {
    wrapper.moveToValue(value)
  })
</script>

<div
  bind:this={el}
  data-toggle
  role="radiogroup"
  class={className || undefined}
>
  {#each wrapper.flatView as node (node.key)}
    {@const proxy = node.proxy}
    {@const isSelected = proxy.value === value}

    {#if node.type === 'separator'}
      <hr data-toggle-separator aria-hidden="true" />
    {:else if node.type === 'spacer'}
      <div data-toggle-spacer aria-hidden="true"></div>
    {:else}
      <button
        type="button"
        data-toggle-item
        data-path={node.key}
        data-selected={isSelected || undefined}
        data-disabled={proxy.disabled || undefined}
        role="radio"
        aria-checked={isSelected}
        disabled={proxy.disabled}
      >
        {#if proxy.get('icon')}
          <span class={proxy.get('icon')} aria-hidden="true"></span>
        {/if}
        <span data-toggle-label>{proxy.label}</span>
      </button>
    {/if}
  {/each}
</div>
```

**For collapsible groups** (like List), add `data-accordion-trigger` to group headers — Navigator calls `wrapper.toggle()` instead of `wrapper.select()`:

```svelte
{#if node.hasChildren}
  <button
    data-list-group
    data-path={node.key}
    data-accordion-trigger
    aria-expanded={proxy.expanded}
  >
    <span class={proxy.expanded ? icons.opened : icons.closed} aria-hidden="true"></span>
    {proxy.label}
  </button>
{:else}
  <button data-list-item data-path={node.key} data-active={isActive || undefined}>
    {proxy.label}
  </button>
{/if}
```

**Navigator options:**
```typescript
new Navigator(el, wrapper, {
  orientation: 'horizontal',  // default: 'vertical' — affects Arrow key bindings
  collapsible: true,          // enables expand/collapse via Arrow keys
  nested: true,               // enables ArrowRight into children, ArrowLeft to parent
})
```

**ARIA for Tier 3:**
- Persistent list/nav: `role="listbox"` or `role="navigation"` on root, `role="option"` on items
- Toggle group: `role="radiogroup"` on root, `role="radio"` + `aria-checked` on items
- Tab list: `role="tablist"` on container, `role="tab"` + `aria-selected` on tabs, `role="tabpanel"` on panels
- All icons: `aria-hidden="true"`
- Expanded groups: `aria-expanded={proxy.expanded}` on group header
- Active/selected: `aria-selected` or `aria-current` depending on component type

---

### Tier 4: Complex Interactive Component

Extends Tier 3 with dropdown management, lazy-loading, or multi-select. Override `wrapper.cancel` and `wrapper.blur` to control dropdown lifecycle.

```svelte
<script lang="ts">
  import { ProxyTree, Wrapper } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'

  const {
    items = [],
    fields = {},
    value = $bindable(),
    onchange
  }: DropdownProps = $props()

  let isOpen = $state(false)
  let triggerEl: HTMLElement | undefined = $state()
  let dropdownEl: HTMLElement | undefined = $state()

  const tree = $derived(new ProxyTree(items, fields))
  const wrapper = $derived(
    new Wrapper(tree, {
      onselect: (v) => {
        value = v
        onchange?.(v)
        isOpen = false
        triggerEl?.focus()  // return focus to trigger after selection
      }
    })
  )

  // Override for dropdown: Escape closes and returns focus
  $effect(() => {
    wrapper.cancel = () => {
      isOpen = false
      triggerEl?.focus()
    }
    wrapper.blur = () => {
      isOpen = false
    }
  })

  // Navigator only active when dropdown is open
  $effect(() => {
    if (!isOpen || !dropdownEl) return
    const nav = new Navigator(dropdownEl, wrapper, { collapsible: true })
    // Focus first item when dropdown opens
    requestAnimationFrame(() => wrapper.first(null))
    return () => nav.destroy()
  })

  function toggleOpen() {
    isOpen = !isOpen
  }
</script>

<div data-dropdown data-open={isOpen || undefined}>
  <button
    bind:this={triggerEl}
    data-dropdown-trigger
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    onclick={toggleOpen}
  >
    {value ?? 'Select...'}
  </button>

  {#if isOpen}
    <div
      bind:this={dropdownEl}
      data-dropdown-list
      role="listbox"
    >
      {#each wrapper.flatView as node (node.key)}
        {@const proxy = node.proxy}
        <button
          data-dropdown-item
          data-path={node.key}
          data-selected={proxy.value === value || undefined}
          role="option"
          aria-selected={proxy.value === value}
        >
          {proxy.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
```

**ARIA for Tier 4:**
- Trigger: `aria-haspopup="listbox"` (or `"menu"`), `aria-expanded={isOpen}`
- Dropdown: `role="listbox"` or `role="menu"` on container
- Items: `role="option"` + `aria-selected` (listbox) or `role="menuitem"` (menu)
- Close on outside click: add a document-level `pointerdown` listener
- Escape: handled by `wrapper.cancel` override above

---

## Step 3: Exports

Add to `packages/ui/src/components/index.ts`:
```typescript
export { default as MyComponent } from './MyComponent.svelte'
```

Add to `packages/ui/src/index.ts`:
```typescript
export { MyComponent } from './components/index.js'
```

---

## Step 4: Theme CSS

**Base structural styles** (`packages/themes/src/base/<name>.css`):
```css
/* Layout and structure only — no colors */
[data-mycomponent] {
  display: flex;
  gap: 0.5rem;
}
[data-mycomponent-item] {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}
```

Import in `packages/themes/src/base/index.css`:
```css
@import './<name>.css';
```

**Theme visual styles** (`packages/themes/src/<theme>/<name>.css` for each theme):
```css
/* rokkit: gradients and glows */
[data-style='rokkit'] [data-mycomponent-item] {
  @apply bg-surface-z2 border-surface-z4 text-surface-z7;
}
[data-style='rokkit'] [data-mycomponent-item][data-selected] {
  @apply bg-primary-z5 text-on-primary border-primary-z6;
}

/* minimal, glass, material follow same structure with theme-appropriate tokens */
```

Common color token patterns:
```
bg-<color>-z<1-3>       light background
border-<color>-z<3-5>   subtle to visible border
text-<color>-z<6-9>     readable text
text-on-<color>         text on solid colored background
shadow-sm / shadow      elevation
backdrop-blur-sm        glass effect
```

Import in each `packages/themes/src/<theme>/index.css`.

**MANDATORY: rebuild after every CSS change:**
```bash
cd packages/themes && bun run build
```

The build outputs `dist/*.css` bundles consumed by the site. Without running this, your styles won't appear — not even in dev mode.

---

## Step 5: Unit Tests (Vitest)

Location: `packages/ui/spec/<Name>.spec.svelte.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import MyComponent from '../src/components/MyComponent.svelte'

describe('MyComponent', () => {
  beforeEach(() => cleanup())

  it('renders root element', () => {
    const { container } = render(MyComponent)
    expect(container.querySelector('[data-mycomponent]')).toBeTruthy()
  })

  // Test each meaningful prop
  // Test interactions (click, keyboard) for Tier 3/4
})
```

**What to cover in unit tests:**
- Renders root element with correct data attribute
- Renders with default props
- Renders each meaningful prop variant
- Opens/closes for Tier 3/4 (click, Enter, Space, ArrowDown/Up)
- Calls callback (onchange/onselect) with correct value
- Marks active/selected state correctly
- Handles disabled items (not-called, not-focused)
- Separators render correctly
- Custom field mapping works
- Custom class applied

**JSDOM notes for animation-driven tests:**
- CSS transitions never fire — dispatch `TransitionEvent` manually with `{ propertyName: '...' }`
- `element.getAnimations` is already mocked via `packages/helpers/src/mocks/animate.js`

Run after writing: `bun run test:ui`

---

## Step 6: Playground Page

Location: `site/src/routes/(play)/playground/components/<name>/+page.svelte`

The playground page uses `PlaySection`, which provides:
- **Line-grid preview area** — full height, centered content
- **Toolbar** (top-right overlay) — doc/llms links auto-derived from URL, `props` toggle button (if `controls` provided), `data` toggle button (if `data` provided), `style` dropdown for theme switching
- **Props overlay panel** — slides in from the right over the preview when toggled
- **Data panel** — appears at the bottom when toggled (for "create and send" interactions)

**Three snippets:**

| Snippet | Purpose | When to provide |
|---------|---------|----------------|
| `preview` | Live component in the grid area | Always |
| `controls` | FormRenderer(s) for component props | When component has configurable props |
| `data` | Composer/sender forms (type + submit action) | When component has an async/push interaction (toasts, API calls) |

```svelte
<script>
  // @ts-nocheck
  import { MyComponent } from '@rokkit/ui'
  import { FormRenderer } from '@rokkit/forms'
  import PlaySection from '$lib/components/PlaySection.svelte'

  let props = $state({ variant: 'default', label: 'Hello' })
  let composerData = $state({ text: 'New item' })

  const schema = { type: 'object', properties: { variant: { type: 'string' }, label: { type: 'string' } } }
  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/variant', label: 'Variant', props: { options: ['default', 'primary'] } },
      { scope: '#/label', label: 'Label' },
      { type: 'separator' }
    ]
  }
</script>

<PlaySection>
  {#snippet preview()}
    <MyComponent variant={props.variant} label={props.label} />
  {/snippet}

  {#snippet controls()}
    <FormRenderer bind:data={props} {schema} {layout} />
  {/snippet}

  {#snippet data()}
    <div class="flex flex-col gap-3">
      <p class="text-surface-z5 text-xs font-semibold uppercase tracking-widest">Create</p>
      <!-- composer form + action button -->
      <button data-button data-variant="primary" onclick={handleCreate}>Submit</button>
    </div>
  {/snippet}
</PlaySection>
```

**`bind:data` must point to a `$state` variable, never an object literal:**
```svelte
// ✅ correct
let props = $state({ type: 'info', text: 'Hello' })
<FormRenderer bind:data={props} {schema} {layout} />

// ❌ invalid — object literal is not bindable
<FormRenderer bind:data={{ type, text }} {schema} {layout} />
```

**Register in both nav files** or the link 404s:

1. `site/src/routes/(play)/playground/+page.svelte` — add to the appropriate GROUPS array:
```js
{ name: 'My Component', description: 'Short description', slug: 'my-component' }
```

2. `site/src/routes/(play)/playground/+layout.svelte` — add to the sidebar children array:
```js
{ title: 'My Component', slug: '/playground/components/my-component', icon: 'i-glyph:my-component' }
```

---

## Step 6b: Playwright E2E Tests

Location: `site/e2e/<name>.e2e.ts`

E2E tests run against the playground page in a real browser. They test keyboard navigation, mouse interaction, and visual appearance across all themes and modes.

```typescript
import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes, openDropdownViaKeyboard } from './helpers'
import type { Page } from '@playwright/test'

// For dropdown-style components (Tier 4), use the openDropdownViaKeyboard helper:
function openComponent(page: Page) {
  return openDropdownViaKeyboard(
    page,
    '[data-mycomponent-trigger]',
    '[data-mycomponent-panel]',
    '[data-mycomponent-option]'
  )
}

test.describe('MyComponent', () => {
  test.beforeEach(async ({ page }) => {
    await goToPlayPage(page, 'my-component')
  })

  // ─── Keyboard navigation ─────────────────────────────────────────

  test.describe('keyboard navigation', () => {
    test('ArrowDown opens and focuses first item', async ({ page }) => {
      const { dropdown, items } = await openComponent(page)
      await expect(dropdown).toBeVisible()
      await expect(items.first()).toBeFocused()
    })

    test('ArrowDown/Up navigates items', async ({ page }) => {
      const { items } = await openComponent(page)
      await page.keyboard.press('ArrowDown')
      await expect(items.nth(1)).toBeFocused()
      await page.keyboard.press('ArrowUp')
      await expect(items.first()).toBeFocused()
    })

    test('Enter selects and closes', async ({ page }) => {
      const { dropdown, items } = await openComponent(page)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expect(dropdown).not.toBeVisible()
    })

    test('Escape closes and returns focus to trigger', async ({ page }) => {
      const { trigger, dropdown } = await openComponent(page)
      await page.keyboard.press('Escape')
      await expect(dropdown).not.toBeVisible()
      await expect(trigger).toBeFocused()
    })
  })

  // ─── Mouse interaction ───────────────────────────────────────────

  test.describe('mouse interaction', () => {
    test('click trigger opens', async ({ page }) => {
      const trigger = page.locator('[data-mycomponent-trigger]').first()
      await trigger.click()
      await expect(page.locator('[data-mycomponent-panel]').first()).toBeVisible()
    })

    test('click option selects and closes', async ({ page }) => {
      const trigger = page.locator('[data-mycomponent-trigger]').first()
      await trigger.click()
      const options = page.locator('[data-mycomponent-panel] [data-mycomponent-option]')
      await options.nth(1).click()
      await expect(page.locator('[data-mycomponent-panel]').first()).not.toBeVisible()
    })

    test('click outside closes', async ({ page }) => {
      const trigger = page.locator('[data-mycomponent-trigger]').first()
      await trigger.click()
      await page.locator('body').click({ position: { x: 10, y: 10 } })
      await expect(page.locator('[data-mycomponent-panel]').first()).not.toBeVisible()
    })
  })

  // ─── Visual snapshots ────────────────────────────────────────────

  test.describe('visual snapshots', () => {
    for (const theme of themes) {
      for (const mode of modes) {
        test(`${theme}/${mode} - closed state`, async ({ page }) => {
          await setTheme(page, theme)
          await setMode(page, mode)
          const el = page.locator('[data-mycomponent]').first()
          await expect(el).toHaveScreenshot(`mycomponent-${theme}-${mode}-closed.png`)
        })

        test(`${theme}/${mode} - open state`, async ({ page }) => {
          await setTheme(page, theme)
          await setMode(page, mode)
          await page.locator('[data-mycomponent-trigger]').first().click()
          const el = page.locator('[data-mycomponent]').first()
          await expect(el).toHaveScreenshot(`mycomponent-${theme}-${mode}-open.png`)
        })
      }
    }
  })
})
```

**Key rules:**
- Always use `goToPlayPage(page, 'slug')` in `beforeEach`
- Use `setTheme` and `setMode` helpers for cross-theme snapshots — `setTheme` opens the Dropdown in `[data-toolbar]` to switch themes
- Use `openDropdownViaKeyboard` helper for Tier 4 keyboard open flows
- The playground page's first instance of the component is used for tests — make sure the first example in the preview is representative
- Visual snapshot tests require a baseline run first: `cd site && npx playwright test e2e/<name>.e2e.ts --update-snapshots`

**Data field convention:** Items in playground examples must use `label` and `value` as default field names (ProxyItem defaults). If your component uses different defaults, specify `fields` prop explicitly.

---

## Step 7: Doc Page — Live Interactive Documentation

Location: `site/src/routes/(learn)/docs/components/<name>/+page.svelte`
Also create: `site/src/routes/(learn)/docs/components/<name>/meta.json`

The doc page serves as documentation AND visual verification. Build it alongside the component so you can see what you're building.

**Key rules:**
- The layout renders the `h1` title from `meta.json` — do NOT add another `h1` in the page
- Use `h2` for all top-level sections — the `TableOfContents` in the docs layout scans for `h2` to build the TOC
- Use `h3` inside `data-card` divs or for sub-sections
- Use the `Code` component (not `<pre><code>`) for all code snippets — it provides syntax highlighting and a copy button
- `Code` takes `content` (string) and `language` props; escape `</script>` as `<\/script>` inside template literals

```svelte
<script>
  // @ts-nocheck
  import { MyComponent } from '@rokkit/ui'
  import { Code } from '$lib/components/Story'

  // Interactive state for the demo
  let selected = $state(null)
  const items = [
    { label: 'Alpha', value: 'a', icon: 'state-info' },
    { label: 'Beta',  value: 'b', icon: 'state-success' },
    { label: 'Gamma', value: 'c', icon: 'state-warning', disabled: true }
  ]
</script>

<article data-article-root>
  <p>One-sentence description of what it does and when to use it.</p>

  <h2>Live Demo</h2>
  <!-- Interactive controls — live, not static -->
  <MyComponent {items} bind:value={selected} />
  {#if selected}<p>Selected: <code>{selected}</code></p>{/if}

  <h2>Quick Start</h2>
  <Code content={`import { MyComponent } from '@rokkit/ui'

<MyComponent {items} bind:value={selected} />`} language="svelte" />

  <h2>All Variants</h2>
  <!-- Show every meaningful visual variant inline -->

  <h2>Props</h2>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div data-card>
      <h3>items</h3>
      <ul>
        <li><strong>label</strong>: Display text</li>
        <li><strong>value</strong>: Semantic value returned on select</li>
        <li><strong>icon</strong>: Icon class (optional)</li>
        <li><strong>disabled</strong>: Disable item</li>
      </ul>
    </div>
    <div data-card>
      <h3>fields</h3>
      <ul>
        <li>Remap data keys to component expectations</li>
        <li><code>fields={{ label: 'name', value: 'id' }}</code></li>
      </ul>
    </div>
  </div>
</article>
```

**meta.json** — set `"llms": true` to enable the llms.txt button in the docs header:
```json
{
  "title": "Component Name",
  "description": "Short description for nav tooltip",
  "icon": "i-glyph:<name>",
  "category": "display",
  "sequence": 70,
  "llms": true
}
```

Categories: `"inputs"`, `"display"`, `"navigation"`, `"layout"`, `"data"`, `"feedback"`

---

## Step 7b: llms.txt — Machine-Readable Documentation

Location: `site/static/llms/components/<name>.txt`

An LLM-optimized markdown file for the component. Omit prose; focus on API, props, usage examples, and data attributes. Follow the pattern from existing files like `list.txt` or `message.txt`.

```markdown
# Rokkit MyComponent

> One-sentence description.

## Quick Start

\`\`\`svelte
<script>
  import { MyComponent } from '@rokkit/ui'
  let value = $state(null)
</script>
<MyComponent {items} bind:value />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `unknown[]` | `[]` | Data array |
| `value` | `unknown` | — | Selected value (bindable) |
| `fields` | `Record<string,string>` | `{}` | Remap data keys |

## Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-mycomponent` | root | Root container |
| `data-mycomponent-item` | button | Selectable item |
```

---

## Step 8: Verify

```bash
# Unit tests
bun run test:ui              # all UI tests pass

# Lint
bun run lint                 # zero errors

# E2E tests — generate baseline snapshots on first run, then verify on subsequent runs
cd site && npx playwright test e2e/<name>.e2e.ts --update-snapshots   # first run: create baselines
cd site && npx playwright test e2e/<name>.e2e.ts                       # subsequent: verify
```

Visual verification checklist:
- `http://localhost:5175/docs/components/<name>` — check TOC, live demo, code snippets render
- `http://localhost:5175/playground/components/<name>` — check interactive controls, props panel, all themes look correct
- Open the theme Dropdown in the PlaySection toolbar and cycle through all 4 themes — verify styles apply correctly in each

The doc page + e2e screenshots are the complete verification. If both look right and tests pass, the component is done.
