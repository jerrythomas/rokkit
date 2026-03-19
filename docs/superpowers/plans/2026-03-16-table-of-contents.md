# TableOfContents Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the docs-site TableOfContents into a reusable `@rokkit/app` component with `data-*` attributes for styling, keyboard navigation via `navigable`, and a `rescan()` export so callers handle route changes.

**Architecture:** The component scans a container element for `h2`/`h3` headings, builds its own item list, and manages focus internally with roving tabindex. It uses `use:navigable` for ArrowUp/Down/Enter/Space keyboard handling. No SvelteKit dependencies — the caller is responsible for calling `rescan()` after navigation.

**Tech Stack:** Svelte 5, `@rokkit/actions` (navigable), `@testing-library/svelte`, vitest, IntersectionObserver mock from `@rokkit/helpers`

---

## Chunk 1: Register `packages/app` in vitest and write the spec

### Task 1: Add `packages/app` to vitest projects

**Files:**

- Modify: `vitest.config.ts`

- [ ] **Step 1: Add the app project entry**

  In `vitest.config.ts`, add after the `ui` project entry:

  ```ts
  {
    extends: true,
    test: {
      name: 'app',
      root: 'packages/app',
      setupFiles: ['../helpers/src/mocks/index.js']
    }
  },
  ```

- [ ] **Step 2: Verify the project loads (no tests yet)**

  Run from repo root:

  ```bash
  bun run test:ci --project=app
  ```

  Expected: "No test files found" — not a failure, just zero tests.

- [ ] **Step 3: Commit**

  ```bash
  git add vitest.config.ts
  git commit -m "chore: register packages/app in vitest"
  ```

---

### Task 2: Write the full spec (all failing)

**Files:**

- Create: `packages/app/spec/TableOfContents.spec.svelte.ts`

- [ ] **Step 1: Create the spec file**

  ```ts
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
  import { render, fireEvent, waitFor } from '@testing-library/svelte'
  import { flushSync } from 'svelte'
  import TableOfContents from '../src/components/TableOfContents.svelte'

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function makeContainer(id = 'main-content') {
    const el = document.createElement('div')
    el.id = id
    document.body.appendChild(el)
    return el
  }

  function clearChildren(el: HTMLElement) {
    while (el.firstChild) el.removeChild(el.firstChild)
  }

  function addHeading(container: HTMLElement, tag: 'h2' | 'h3', text: string, id?: string) {
    const el = document.createElement(tag)
    el.textContent = text
    if (id) el.id = id
    container.appendChild(el)
    return el
  }

  function triggerIntersection(observer: any, elements: HTMLElement[]) {
    observer.simulateIntersection(
      elements.map((target) => ({
        target,
        isIntersecting: true,
        boundingClientRect: { top: 0 }
      }))
    )
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  describe('TableOfContents — rendering', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('renders nothing when container has no headings', () => {
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc]')).toBeNull()
    })

    it('renders nothing when container has only one heading', () => {
      addHeading(container, 'h2', 'Only one')
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc]')).toBeNull()
    })

    it('renders [data-toc] nav with two or more headings', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc]')).toBeTruthy()
    })

    it('nav has aria-label "On this page"', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc]')?.getAttribute('aria-label')).toBe('On this page')
    })

    it('renders [data-toc-label]', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc-label]')).toBeTruthy()
    })

    it('renders [data-toc-list]', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc-list]')).toBeTruthy()
    })

    it('renders one [data-toc-item] per heading', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      addHeading(container, 'h3', 'Third')
      const { container: host } = render(TableOfContents)
      expect(host.querySelectorAll('[data-toc-item]').length).toBe(3)
    })

    it('sets data-toc-level to the heading tag on each item', () => {
      addHeading(container, 'h2', 'Section')
      addHeading(container, 'h3', 'Sub-section')
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      expect(items[0].getAttribute('data-toc-level')).toBe('h2')
      expect(items[1].getAttribute('data-toc-level')).toBe('h3')
    })

    it('renders item text content from heading text', () => {
      addHeading(container, 'h2', 'Getting started')
      addHeading(container, 'h2', 'Installation')
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      expect(items[0].textContent?.trim()).toBe('Getting started')
      expect(items[1].textContent?.trim()).toBe('Installation')
    })
  })

  // ─── DOM Scanning ─────────────────────────────────────────────────────────

  describe('TableOfContents — DOM scanning', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('uses existing IDs on headings', () => {
      addHeading(container, 'h2', 'First', 'my-first-id')
      addHeading(container, 'h2', 'Second', 'my-second-id')
      render(TableOfContents)
      expect(document.getElementById('my-first-id')).toBeTruthy()
      expect(document.getElementById('my-second-id')).toBeTruthy()
    })

    it('auto-generates slug IDs for headings without IDs', () => {
      addHeading(container, 'h2', 'Getting Started')
      addHeading(container, 'h2', 'API Reference')
      render(TableOfContents)
      expect(document.getElementById('getting-started')).toBeTruthy()
      expect(document.getElementById('api-reference')).toBeTruthy()
    })

    it('uses fallback section-N ID for headings with empty text', () => {
      const h = addHeading(container, 'h2', '')
      addHeading(container, 'h2', 'Second')
      render(TableOfContents)
      expect(h.id).toMatch(/^section-\d+$/)
    })

    it('only scans h2 and h3, ignores h1 and h4', () => {
      const h1 = document.createElement('h1')
      h1.textContent = 'Title'
      container.appendChild(h1)
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h3', 'Sub')
      const h4 = document.createElement('h4')
      h4.textContent = 'Minor'
      container.appendChild(h4)
      const { container: host } = render(TableOfContents)
      expect(host.querySelectorAll('[data-toc-item]').length).toBe(2)
    })

    it('uses custom container ID prop', () => {
      const custom = makeContainer('article-body')
      addHeading(custom, 'h2', 'First')
      addHeading(custom, 'h2', 'Second')
      const { container: host } = render(TableOfContents, { props: { container: 'article-body' } })
      expect(host.querySelectorAll('[data-toc-item]').length).toBe(2)
      custom.remove()
    })

    it('renders nothing when container element does not exist', () => {
      const { container: host } = render(TableOfContents, {
        props: { container: 'nonexistent-id' }
      })
      expect(host.querySelector('[data-toc]')).toBeNull()
    })
  })

  // ─── Active State ─────────────────────────────────────────────────────────

  describe('TableOfContents — active state', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('no item has data-toc-active initially', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      expect(host.querySelector('[data-toc-active]')).toBeNull()
    })

    it('sets data-toc-active on the item whose heading intersects', async () => {
      const h1 = addHeading(container, 'h2', 'First', 'first')
      addHeading(container, 'h2', 'Second', 'second')
      const { container: host } = render(TableOfContents)

      const instances = (globalThis as any).IntersectionObserver.instances ?? []
      const observer = instances[instances.length - 1]
      triggerIntersection(observer, [h1])
      flushSync()

      await waitFor(() => {
        const active = host.querySelector('[data-toc-active]')
        expect(active?.textContent?.trim()).toBe('First')
      })
    })

    it('moves data-toc-active when a different heading intersects', async () => {
      const h1 = addHeading(container, 'h2', 'First', 'first')
      const h2 = addHeading(container, 'h2', 'Second', 'second')
      const { container: host } = render(TableOfContents)

      const instances = (globalThis as any).IntersectionObserver.instances ?? []
      const observer = instances[instances.length - 1]
      triggerIntersection(observer, [h1])
      flushSync()
      triggerIntersection(observer, [h2])
      flushSync()

      await waitFor(() => {
        const active = host.querySelector('[data-toc-active]')
        expect(active?.textContent?.trim()).toBe('Second')
      })
    })
  })

  // ─── Focus / Roving Tabindex ──────────────────────────────────────────────

  describe('TableOfContents — roving tabindex', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('first item has tabindex 0 by default', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      expect(items[0].getAttribute('tabindex')).toBe('0')
      expect(items[1].getAttribute('tabindex')).toBe('-1')
    })

    it('sets data-toc-focused on the focused item', () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      expect(items[0].hasAttribute('data-toc-focused')).toBe(true)
      expect(items[1].hasAttribute('data-toc-focused')).toBe(false)
    })

    it('updates tabindex and focused attribute on focusin', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      await fireEvent.focusIn(items[1])
      expect(items[1].getAttribute('tabindex')).toBe('0')
      expect(items[0].getAttribute('tabindex')).toBe('-1')
      expect(items[1].hasAttribute('data-toc-focused')).toBe(true)
      expect(items[0].hasAttribute('data-toc-focused')).toBe(false)
    })
  })

  // ─── Keyboard Navigation ──────────────────────────────────────────────────

  describe('TableOfContents — keyboard navigation', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('ArrowDown moves focus to next item', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      addHeading(container, 'h3', 'Third')
      const { container: host } = render(TableOfContents)
      const nav = host.querySelector('[data-toc]')!
      const items = host.querySelectorAll('[data-toc-item]')
      items[0].focus()
      await fireEvent.keyUp(nav, { key: 'ArrowDown' })
      await waitFor(() => expect(document.activeElement).toBe(items[1]))
    })

    it('ArrowUp moves focus to previous item', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      const nav = host.querySelector('[data-toc]')!
      const items = host.querySelectorAll('[data-toc-item]')
      items[1].focus()
      await fireEvent.keyUp(nav, { key: 'ArrowUp' })
      await waitFor(() => expect(document.activeElement).toBe(items[0]))
    })

    it('ArrowDown does not move past last item', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      const nav = host.querySelector('[data-toc]')!
      const items = host.querySelectorAll('[data-toc-item]')
      items[0].focus()
      await fireEvent.keyUp(nav, { key: 'ArrowDown' })
      await fireEvent.keyUp(nav, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(items[1])
    })

    it('ArrowUp does not move before first item', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const { container: host } = render(TableOfContents)
      const nav = host.querySelector('[data-toc]')!
      const items = host.querySelectorAll('[data-toc-item]')
      items[0].focus()
      await fireEvent.keyUp(nav, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(items[0])
    })

    it('Enter calls scrollTo on the container for the focused heading', async () => {
      addHeading(container, 'h2', 'First', 'first')
      addHeading(container, 'h2', 'Second', 'second')
      const scrollSpy = vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
      const { container: host } = render(TableOfContents)
      const nav = host.querySelector('[data-toc]')!
      const items = host.querySelectorAll('[data-toc-item]')
      items[0].focus()
      await fireEvent.keyUp(nav, { key: 'Enter' })
      expect(scrollSpy).toHaveBeenCalled()
    })

    it('Space calls scrollTo on the container for the focused heading', async () => {
      addHeading(container, 'h2', 'First', 'first')
      addHeading(container, 'h2', 'Second', 'second')
      const scrollSpy = vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
      const { container: host } = render(TableOfContents)
      const nav = host.querySelector('[data-toc]')!
      const items = host.querySelectorAll('[data-toc-item]')
      items[0].focus()
      await fireEvent.keyUp(nav, { key: ' ' })
      expect(scrollSpy).toHaveBeenCalled()
    })
  })

  // ─── Click Handling ───────────────────────────────────────────────────────

  describe('TableOfContents — click handling', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('clicking an item calls scrollTo on the container', async () => {
      addHeading(container, 'h2', 'First', 'first')
      addHeading(container, 'h2', 'Second', 'second')
      const scrollSpy = vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      await fireEvent.click(items[1])
      expect(scrollSpy).toHaveBeenCalled()
    })

    it('clicking an item updates focusedIndex (tabindex and data-toc-focused)', async () => {
      addHeading(container, 'h2', 'First', 'first')
      addHeading(container, 'h2', 'Second', 'second')
      vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
      const { container: host } = render(TableOfContents)
      const items = host.querySelectorAll('[data-toc-item]')
      await fireEvent.click(items[1])
      await waitFor(() => {
        expect(items[1].getAttribute('tabindex')).toBe('0')
        expect(items[0].getAttribute('tabindex')).toBe('-1')
        expect(items[1].hasAttribute('data-toc-focused')).toBe(true)
        expect(items[0].hasAttribute('data-toc-focused')).toBe(false)
      })
    })
  })

  // ─── rescan() ─────────────────────────────────────────────────────────────

  describe('TableOfContents — rescan()', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = makeContainer()
    })
    afterEach(() => {
      container.remove()
    })

    it('rescan() picks up new headings added after mount', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const result = render(TableOfContents)
      expect(result.container.querySelectorAll('[data-toc-item]').length).toBe(2)

      addHeading(container, 'h2', 'Third')
      const toc = result.component as any
      toc.rescan()
      flushSync()

      await waitFor(() => {
        expect(result.container.querySelectorAll('[data-toc-item]').length).toBe(3)
      })
    })

    it('rescan() resets focusedIndex to first item', async () => {
      addHeading(container, 'h2', 'First')
      addHeading(container, 'h2', 'Second')
      const result = render(TableOfContents)
      const items = result.container.querySelectorAll('[data-toc-item]')
      await fireEvent.focusIn(items[1])

      const toc = result.component as any
      toc.rescan()
      flushSync()

      await waitFor(() => {
        const updated = result.container.querySelectorAll('[data-toc-item]')
        expect(updated[0].getAttribute('tabindex')).toBe('0')
      })
    })

    it('rescan() picks up a completely replaced heading set', async () => {
      addHeading(container, 'h2', 'Old First')
      addHeading(container, 'h2', 'Old Second')
      const result = render(TableOfContents)

      // Remove old headings and add new ones using safe DOM methods
      clearChildren(container)
      addHeading(container, 'h2', 'New First')
      addHeading(container, 'h2', 'New Second')
      addHeading(container, 'h3', 'New Sub')

      const toc = result.component as any
      toc.rescan()
      flushSync()

      await waitFor(() => {
        expect(result.container.querySelectorAll('[data-toc-item]').length).toBe(3)
        expect(result.container.querySelectorAll('[data-toc-item]')[0].textContent?.trim()).toBe(
          'New First'
        )
      })
    })
  })
  ```

- [ ] **Step 2: Run tests — all should fail (component doesn't exist yet)**

  ```bash
  bun run test:ci --project=app
  ```

  Expected: import error or all tests failing — confirms spec is wired up correctly.

- [ ] **Step 3: Commit the spec**

  ```bash
  git add packages/app/spec/TableOfContents.spec.svelte.ts
  git commit -m "test(app): add TableOfContents spec (all failing)"
  ```

---

## Chunk 2: Implement the component

### Task 3: Create TableOfContents.svelte

**Files:**

- Create: `packages/app/src/components/TableOfContents.svelte`

- [ ] **Step 1: Write the component**

  ```svelte
  <script>
    // @ts-nocheck
    import { navigable } from '@rokkit/actions'
    import { onMount } from 'svelte'

    let { container = 'main-content' } = $props()

    let headings = $state([])
    let activeId = $state('')
    let focusedIndex = $state(0)
    let navEl = $state(null)
    let observer = null

    function slugify(text) {
      return (text ?? '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }

    function getContainer() {
      return document.getElementById(container)
    }

    function scan() {
      const main = getContainer()
      if (!main) return
      const els = [...main.querySelectorAll('h2, h3')]
      headings = els.map((el, i) => {
        if (!el.id) el.id = slugify(el.textContent) || `section-${i}`
        return { id: el.id, text: el.textContent?.trim() ?? '', level: el.tagName.toLowerCase() }
      })
    }

    function observe() {
      observer?.disconnect()
      const main = getContainer()
      if (!main || headings.length === 0) return
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          if (visible.length > 0) activeId = visible[0].target.id
        },
        { root: main, rootMargin: '-5% 0px -70% 0px' }
      )
      headings.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      })
    }

    function scrollToHeading(id) {
      const el = document.getElementById(id)
      const main = getContainer()
      if (!el || !main) return
      main.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
    }

    export function rescan() {
      activeId = ''
      focusedIndex = 0
      scan()
      observe()
    }

    function getItems() {
      return navEl?.querySelectorAll('[data-toc-item]') ?? []
    }

    function handlePrevious() {
      if (focusedIndex > 0) {
        focusedIndex -= 1
        getItems()[focusedIndex]?.focus()
      }
    }

    function handleNext() {
      if (focusedIndex < headings.length - 1) {
        focusedIndex += 1
        getItems()[focusedIndex]?.focus()
      }
    }

    function handleSelect() {
      scrollToHeading(headings[focusedIndex]?.id)
    }

    function handleClick(event) {
      const btn = event.target.closest('[data-toc-item]')
      if (!btn) return
      const index = parseInt(btn.dataset.tocIndex ?? '0', 10)
      focusedIndex = index
      scrollToHeading(headings[index]?.id)
    }

    onMount(() => {
      scan()
      observe()
      return () => observer?.disconnect()
    })
  </script>

  {#if headings.length > 1}
    <nav
      bind:this={navEl}
      data-toc
      aria-label="On this page"
      use:navigable
      onclick={handleClick}
      onprevious={handlePrevious}
      onnext={handleNext}
      onselect={handleSelect}
    >
      <p data-toc-label>On this page</p>
      <ul data-toc-list>
        {#each headings as h, i}
          <li>
            <button
              data-toc-item
              data-toc-level={h.level}
              data-toc-index={i}
              data-toc-active={activeId === h.id ? '' : undefined}
              data-toc-focused={focusedIndex === i ? '' : undefined}
              tabindex={focusedIndex === i ? 0 : -1}
              onfocusin={() => (focusedIndex = i)}
            >
              {h.text}
            </button>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
  ```

- [ ] **Step 2: Run the tests**

  ```bash
  bun run test:ci --project=app
  ```

  Expected: most tests passing. Fix any failures before continuing.

- [ ] **Step 3: Commit**

  ```bash
  git add packages/app/src/components/TableOfContents.svelte
  git commit -m "feat(app): add TableOfContents component with navigable keyboard support"
  ```

---

### Task 4: Export from `@rokkit/app`

**Files:**

- Modify: `packages/app/src/components/index.ts`
- Modify: `packages/app/src/index.ts`

- [ ] **Step 1: Add export to components/index.ts**

  Add to `packages/app/src/components/index.ts`:

  ```ts
  export { default as TableOfContents } from './TableOfContents.svelte'
  ```

- [ ] **Step 2: Update index.ts to include TableOfContents**

  In `packages/app/src/index.ts`, update the components export line to include `TableOfContents`:

  ```ts
  export { ThemeSwitcherToggle, TableOfContents } from './components/index.js'
  ```

- [ ] **Step 3: Run all tests to confirm nothing broken**

  ```bash
  bun run test:ci
  ```

  Expected: all tests pass, 0 errors.

- [ ] **Step 4: Commit**

  ```bash
  git add packages/app/src/components/index.ts packages/app/src/index.ts
  git commit -m "feat(app): export TableOfContents from @rokkit/app"
  ```

---

## Chunk 3: Wire up in the site and clean up

### Task 5: Replace site TableOfContents usage

**Files:**

- Modify: `site/src/routes/(learn)/docs/+layout.svelte`
- Delete: `site/src/lib/components/TableOfContents.svelte` (after verifying no other usages)

- [ ] **Step 1: Find all usages of the old component**

  ```bash
  grep -r "TableOfContents" site/src --include="*.svelte" --include="*.ts" -l
  ```

- [ ] **Step 2: Update the layout import and usage**

  In `site/src/routes/(learn)/docs/+layout.svelte`:
  - Remove: `import TableOfContents from '$lib/components/TableOfContents.svelte'`
  - Add: `import { TableOfContents } from '@rokkit/app'`
  - Add: `import { afterNavigate } from '$app/navigation'`
  - Add: `let toc = $state(null)`
  - Add: `afterNavigate(() => toc?.rescan())`
  - Change: `<TableOfContents />` to `<TableOfContents bind:this={toc} />`

- [ ] **Step 3: Delete the old component (only if no other usages found in step 1)**

  Verify step 1 found only the layout file, then:

  ```bash
  git rm site/src/lib/components/TableOfContents.svelte
  ```

- [ ] **Step 4: Run lint**

  ```bash
  bun run lint
  ```

  Expected: 0 errors.

- [ ] **Step 5: Run all tests**

  ```bash
  bun run test:ci
  ```

  Expected: all pass.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "refactor(site): use @rokkit/app TableOfContents in docs layout"
  ```

---

## Final Verification

- [ ] Run `bun run test:ci` — all tests pass, 0 errors
- [ ] Run `bun run lint` — 0 errors
- [ ] Manual check: open site docs page, verify TOC appears and keyboard navigation works (ArrowUp/Down, Enter)
