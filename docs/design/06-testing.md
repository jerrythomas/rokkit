# Testing Design

Rokkit uses two testing layers with distinct purposes and toolchains: unit tests for component and controller logic, and E2E tests for full user flows on the learn site.

---

## 1. Unit Tests (Vitest + @testing-library/svelte)

### Toolchain

| Tool | Role |
|------|------|
| Vitest | Test runner and assertion library |
| @testing-library/svelte | Component mounting, querying, and interaction |
| JSDOM | DOM simulation environment |
| `flushSync` (Svelte) | Force synchronous reactive updates in tests |

### Test location

Each package has a `spec/` directory at its root:

```
solution/packages/
  ui/spec/
    List.spec.svelte.ts
    Select.spec.svelte.ts
    Menu.spec.svelte.ts
    Tree.spec.svelte.ts
    ...
  states/spec/
    list-controller.spec.svelte.js
    proxy-item.spec.svelte.js
    wrapper.spec.svelte.js
    ...
  actions/spec/
    navigator.spec.js
    navigable.spec.js
    ...
  forms/spec/
    form-builder.spec.svelte.js
    ...
```

Test files use the `.spec.svelte.ts` or `.spec.svelte.js` extension for files that use Svelte runes (`$state`, `$derived`) directly in test code. Plain `.spec.ts` / `.spec.js` is used for pure logic tests with no rune usage.

### What to test

Unit tests target **observable behavior through the component's public interface**, not internal implementation details.

**Test these:**

- Controller logic — navigation, selection, expansion, boundary conditions
- Component rendering — correct data-attributes, ARIA roles, item counts
- Keyboard interaction — key events produce the expected state changes
- Field mapping — components read from the correct fields when `fields` is provided
- Snippet dispatch — per-item `snippet` field routes to the correct named snippet
- Callback firing — `onchange`, `onselect` called with the correct arguments
- Disabled state — disabled items are skipped in navigation and cannot be selected
- Edge cases — empty arrays, primitive items, null values

**Do not test these:**

- Visual appearance — colors, font sizes, spacing (tested by E2E visual snapshots)
- CSS class names — subject to UnoCSS purging, unreliable in JSDOM
- Internal `$state` variables — test behavior, not implementation
- Exact DOM structure depth — query by semantic attributes, not DOM nesting
- Animation timing — JSDOM does not run CSS transitions

### Patterns

#### Mount and interact

```typescript
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import List from '../src/components/List.svelte'

const items = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' }
]

it('renders items as buttons', () => {
  const { container } = render(List, { items })
  const rendered = container.querySelectorAll('[data-list-item]')
  expect(rendered.length).toBe(2)
})

it('selects item on Enter key', async () => {
  const { container } = render(List, { items })
  const first = container.querySelector('[data-list-item]') as HTMLElement
  first.focus()
  await fireEvent.keyDown(first, { key: 'Enter' })
  flushSync()
  expect(first).toHaveAttribute('data-active', 'true')
})
```

#### Testing callbacks

```typescript
it('calls onselect with the selected item', async () => {
  const onselect = vi.fn()
  const { container } = render(List, { items, onselect })
  const first = container.querySelector('[data-list-item]') as HTMLElement
  await fireEvent.click(first)
  flushSync()
  expect(onselect).toHaveBeenCalledWith(items[0].value, expect.anything())
})
```

#### Testing controller logic directly

Controllers are pure class instances and can be tested without mounting a component:

```javascript
import { ListController } from '../src/list-controller.svelte.js'

it('moves focus to next item', () => {
  const items = $state([{ label: 'A' }, { label: 'B' }, { label: 'C' }])
  const controller = new ListController(items)
  controller.moveFirst()
  expect(controller.currentIndex).toBe(0)
  controller.moveNext()
  expect(controller.currentIndex).toBe(1)
})
```

#### Testing field mapping

```typescript
it('uses custom label field when fields.label is set', () => {
  const data = [{ fullName: 'Alice' }, { fullName: 'Bob' }]
  const { container } = render(List, { items: data, fields: { label: 'fullName' } })
  expect(container.querySelector('[data-list-item]')?.textContent).toContain('Alice')
})
```

### Mocking: JSDOM limitations

JSDOM does not implement all browser APIs. The following require mocking or defensive coding:

| API | Problem | Solution |
|-----|---------|---------|
| `element.scrollIntoView()` | Not implemented | Use optional chaining: `element.scrollIntoView?.()` |
| `ResizeObserver` | Not defined | Mock in `spec/setup.ts` or `vitest.config.ts` |
| `IntersectionObserver` | Not defined | Mock in setup if used |
| CSS transitions | No animation engine | Use `flushSync()` to advance reactive state |
| `getBoundingClientRect()` | Returns all zeros | Mock if position-dependent logic is tested |

Setup file (`spec/setup.ts`) registers any global mocks:

```typescript
// spec/setup.ts
import '@testing-library/svelte/vitest'
```

Additional mocks are added to this file as needed. The `vitest.config.ts` points to the setup file via `setupFiles`.

### Component checklist

Every UI component must have unit tests covering:

- [ ] Renders the root element with the correct `data-[component]` attribute
- [ ] Renders the correct number of items
- [ ] Applies `data-active` to the currently selected item
- [ ] Applies `data-disabled` to disabled items
- [ ] Keyboard: ArrowDown/Up moves focus
- [ ] Keyboard: Home/End jumps to first/last
- [ ] Keyboard: Enter/Space selects the focused item
- [ ] Calls `onselect` / `onchange` with correct arguments
- [ ] Respects `fields` mapping for at least the `text` field
- [ ] Dispatches to named snippet when item has a `snippet` field
- [ ] Does not select disabled items via keyboard or click

---

## 2. E2E Tests (Playwright)

### Toolchain

| Tool | Role |
|------|------|
| Playwright | Browser automation, assertions, screenshots |
| Chromium | Primary test browser |
| `bun run build && bun run preview` | Production build served on port 4173 |

### Configuration

```
sites/learn/playwright.config.ts
```

Key settings:

- `testDir: 'e2e'` — test files live in `sites/learn/e2e/`
- `testMatch: /.*\.e2e\.ts/` — only files named `*.e2e.ts` are collected
- `fullyParallel: true` — all tests run concurrently
- `retries: 2` on CI — flakiness mitigation
- Chromium only — single browser for consistent visual snapshots
- `baseURL: 'http://localhost:4173'` — preview server

### Test location

```
sites/learn/e2e/
  helpers.ts              ← shared utilities: goToPlayPage, setTheme, setMode
  list.e2e.ts
  select.e2e.ts
  multi-select.e2e.ts
  menu.e2e.ts
  tree.e2e.ts
  tabs.e2e.ts
  toggle.e2e.ts
  toolbar.e2e.ts
  upload-target.e2e.ts
  upload-progress.e2e.ts
  home.e2e.ts
  introduction.e2e.ts
  [component].e2e.ts-snapshots/   ← generated visual snapshots
```

### Test file structure

Each component E2E file is organized into two sections:

```
describe('[Component] — play page')  ← tests against /playground/components/[slug]
  describe('keyboard navigation')
  describe('mouse interaction')
  describe('visual snapshots')

describe('[Component] — learn page') ← tests against /docs/components/[slug]
  tests against StoryViewer examples
```

### Shared helpers

```typescript
// e2e/helpers.ts
export const themes = ['rokkit', 'minimal', 'material', 'glass']
export const modes = ['light', 'dark']

// Navigate to playground and wait for idle
export async function goToPlayPage(page: Page, component: string)

// Click the theme button in the playground sidebar
export async function setTheme(page: Page, theme: Theme)

// Set data-mode attribute directly on <html>
export async function setMode(page: Page, mode: Mode)
```

`setTheme` clicks the theme button in the component's playground page sidebar. `setMode` uses `page.evaluate()` to set `document.documentElement.setAttribute('data-mode', mode)` directly — faster than navigating the UI.

### What to test in E2E

**User flows:**

- Full keyboard navigation sequences (not just single keypresses)
- Open → navigate → select → close sequences for dropdowns
- Expand/collapse cycles for trees and grouped lists
- Multi-step interactions that depend on prior state (e.g., reopen focuses previously selected item)

**Interactions that can't be unit-tested:**

- Focus management (`toBeFocused()` requires real DOM focus)
- Scroll behavior after keyboard navigation
- Click outside to dismiss dropdowns
- Drag interactions

**Visual snapshots:**

- Every component with meaningful visual state must have snapshots for all `themes × modes` combinations
- Snapshot states: at minimum `default/closed` and, for components with open states, `open/focused`
- Snapshots are element-scoped (the component root, not the full page) to avoid background noise

**Learn page tests:**

- Each `StoryViewer` on the docs page is tested to verify it renders and responds to interaction
- These tests catch regressions in the example code, not just the component
- They also verify the docs site itself works (story loading, code display)

### Visual snapshot convention

```typescript
test.describe('visual snapshots', () => {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`${theme}/${mode} - closed state`, async ({ page }) => {
        await setTheme(page, theme)
        await setMode(page, mode)
        const component = page.locator('[data-select]').first()
        await expect(component).toHaveScreenshot(`select-${theme}-${mode}-closed.png`)
      })

      test(`${theme}/${mode} - open state`, async ({ page }) => {
        await setTheme(page, theme)
        await setMode(page, mode)
        await page.locator('[data-select-trigger]').first().click()
        const component = page.locator('[data-select]').first()
        await expect(component).toHaveScreenshot(`select-${theme}-${mode}-open.png`)
      })
    }
  }
})
```

Snapshots are stored in `[file].e2e.ts-snapshots/` alongside the test file. They are committed to the repository and updated with `--update-snapshots` when intentional visual changes are made.

### Targeting elements

E2E tests target elements via data-attributes, not CSS classes or text content. This matches the theming contract and is stable across visual changes:

```typescript
// Good — targets semantic data attributes
page.locator('[data-select-trigger]')
page.locator('[data-list-item][data-disabled]')
page.locator('[data-tree-node][aria-expanded="true"]')

// Acceptable — text content for verifying display
expect(items.nth(1)).toContainText('Banana')

// Avoid — CSS class names are purged/transformed
page.locator('.list-item-selected')
```

### Learn page test targeting

Learn page tests use `[data-story-viewer]` as the scoping container:

```typescript
const storyViewers = page.locator('[data-story-viewer]')
const firstViewer = storyViewers.first()
const list = firstViewer.locator('[data-list]')
```

This scopes assertions to a specific example on the page and prevents interference between multiple story viewers.

---

## 3. Testing Conventions

### Test naming

Test names describe **behavior and outcome**, not implementation:

```typescript
// Good — describes what should happen
'ArrowDown moves focus to next item'
'Enter selects the focused option and closes the dropdown'
'disabled items are skipped during keyboard navigation'
'clicking outside dismisses the dropdown'

// Avoid — describes implementation
'calls controller.moveNext()'
'sets focusedKey state'
'toggles open class'
```

### describe nesting

Group tests by feature area, not by method:

```typescript
describe('List', () => {
  describe('keyboard navigation', () => { ... })
  describe('mouse interaction', () => { ... })
  describe('field mapping', () => { ... })
  describe('snippet dispatch', () => { ... })
  describe('disabled state', () => { ... })
})
```

### Reactive state in tests

When testing Svelte 5 reactive behavior, use `flushSync()` after interactions that mutate state:

```typescript
await fireEvent.click(item)
flushSync()  // flush pending reactive updates
expect(item).toHaveAttribute('data-active', 'true')
```

In E2E tests, Playwright automatically waits for DOM changes — no manual flushing required.

### Test isolation

Each unit test renders a fresh component instance. Shared fixtures (item arrays, field mappings) are defined outside `describe` blocks at the file level so they are not accidentally mutated between tests. If a test needs mutable state, define it inside `beforeEach`.

### Running tests

```bash
# All unit tests
cd solution && bun run test:ci

# UI package tests only
cd solution && bun run test:ui

# E2E tests (requires build)
cd solution/sites/learn && npx playwright test

# Update visual snapshots
cd solution/sites/learn && npx playwright test --update-snapshots
```

### Coverage targets

The target is behavioral coverage, not line coverage. A component is considered adequately tested when:

| Category | Requirement |
|----------|-------------|
| Selection behavior | All selection modes tested (single, multi if applicable) |
| Keyboard navigation | All key bindings have at least one test |
| Field mapping | At least one custom `fields` test per component |
| Snippets | At least one snippet dispatch test if component supports snippets |
| Disabled state | Disabled items/component behavior tested |
| Callbacks | All `on*` callbacks verified to fire with correct arguments |
| Visual | All `themes × modes` snapshot combinations for components with visual states |

### What does not need a test

- CSS output — the `data-*` attributes are the contract; CSS is not tested
- Exact DOM structure — test by attribute selector, not XPath or deep DOM traversal
- Internal reactive variables — test the DOM output, not `$state` internals
- Default prop values in isolation — test what the component renders, not what values are set
