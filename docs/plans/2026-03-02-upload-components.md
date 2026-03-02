# Upload Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Grid, UploadTarget, and UploadProgress components following the existing Wrapper + Navigator architecture.

**Architecture:** Three independent components — Grid (general-purpose tile grid with keyboard navigation), UploadTarget (drag-and-drop file zone with validation), and UploadProgress (composition component delegating to List/Tree/Grid). A shared `upload-utils.js` provides file validation, icon inference, and size formatting.

**Tech Stack:** Svelte 5, @rokkit/states (ProxyTree + Wrapper), @rokkit/actions (Navigator + Trigger), @rokkit/core (BASE_FIELDS, resolveSnippet), vitest + @testing-library/svelte.

**References:**
- Requirements: `docs/requirements/012-upload.md`
- Design: `docs/design/012-upload.md`

---

## Task 1: Upload Utilities — Shared Helpers

Pure utility functions with no Svelte dependency. Foundation for both UploadTarget (validation) and UploadProgress (icon inference, size formatting, tree grouping).

**Files:**
- Create: `packages/ui/src/components/upload-utils.js`
- Test: `packages/ui/spec/upload-utils.spec.js`

### Step 1: Write failing tests for `matchesAccept`

```js
// packages/ui/spec/upload-utils.spec.js
import { describe, it, expect } from 'vitest'
import { matchesAccept } from '../src/components/upload-utils.js'

describe('matchesAccept', () => {
  it('returns true when accept is empty', () => {
    expect(matchesAccept({ type: 'image/png', name: 'a.png' }, '')).toBe(true)
  })

  it('matches wildcard MIME (image/*)', () => {
    expect(matchesAccept({ type: 'image/png', name: 'a.png' }, 'image/*')).toBe(true)
    expect(matchesAccept({ type: 'text/plain', name: 'a.txt' }, 'image/*')).toBe(false)
  })

  it('matches exact MIME', () => {
    expect(matchesAccept({ type: 'application/json', name: 'a.json' }, 'application/json')).toBe(true)
    expect(matchesAccept({ type: 'text/plain', name: 'a.txt' }, 'application/json')).toBe(false)
  })

  it('matches file extension (.pdf)', () => {
    expect(matchesAccept({ type: 'application/pdf', name: 'doc.pdf' }, '.pdf')).toBe(true)
    expect(matchesAccept({ type: 'image/png', name: 'pic.png' }, '.pdf')).toBe(false)
  })

  it('matches comma-separated accept string', () => {
    expect(matchesAccept({ type: 'image/png', name: 'a.png' }, 'image/*,.pdf')).toBe(true)
    expect(matchesAccept({ type: 'application/pdf', name: 'a.pdf' }, 'image/*,.pdf')).toBe(true)
    expect(matchesAccept({ type: 'text/plain', name: 'a.txt' }, 'image/*,.pdf')).toBe(false)
  })
})
```

### Step 2: Run tests — verify they fail

Run: `cd solution && bunx vitest run packages/ui/spec/upload-utils.spec.js`
Expected: FAIL (module not found)

### Step 3: Implement `matchesAccept`

```js
// packages/ui/src/components/upload-utils.js

/**
 * Check if a file matches an accept string (comma-separated MIME types and extensions).
 * @param {{ type: string, name: string }} file
 * @param {string} accept — e.g. 'image/*,.pdf,application/json'
 * @returns {boolean}
 */
export function matchesAccept(file, accept) {
  if (!accept) return true
  const tokens = accept.split(',').map((t) => t.trim()).filter(Boolean)
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return file.name.toLowerCase().endsWith(token.toLowerCase())
    }
    if (token.endsWith('/*')) {
      return file.type.startsWith(token.slice(0, -1))
    }
    return file.type === token
  })
}
```

### Step 4: Run tests — verify they pass

Run: `cd solution && bunx vitest run packages/ui/spec/upload-utils.spec.js`
Expected: PASS

### Step 5: Write failing tests for `validateFile`

Add to the same test file:

```js
import { validateFile } from '../src/components/upload-utils.js'

describe('validateFile', () => {
  it('returns true for valid file', () => {
    const file = { type: 'image/png', name: 'a.png', size: 1000 }
    expect(validateFile(file, { accept: 'image/*', maxSize: 5000 })).toBe(true)
  })

  it('returns { reason: "type" } for wrong type', () => {
    const file = { type: 'text/plain', name: 'a.txt', size: 100 }
    expect(validateFile(file, { accept: 'image/*', maxSize: 5000 })).toEqual({ reason: 'type' })
  })

  it('returns { reason: "size" } for oversized file', () => {
    const file = { type: 'image/png', name: 'a.png', size: 10000 }
    expect(validateFile(file, { accept: 'image/*', maxSize: 5000 })).toEqual({ reason: 'size' })
  })

  it('checks type before size', () => {
    const file = { type: 'text/plain', name: 'a.txt', size: 10000 }
    expect(validateFile(file, { accept: 'image/*', maxSize: 5000 })).toEqual({ reason: 'type' })
  })

  it('passes when no constraints', () => {
    const file = { type: 'text/plain', name: 'a.txt', size: 10000 }
    expect(validateFile(file, { accept: '', maxSize: Infinity })).toBe(true)
  })
})
```

### Step 6: Implement `validateFile`

```js
/**
 * Validate a file against accept and maxSize constraints.
 * @param {{ type: string, name: string, size: number }} file
 * @param {{ accept: string, maxSize: number }} constraints
 * @returns {true | { reason: 'type' | 'size' }}
 */
export function validateFile(file, { accept, maxSize }) {
  if (accept && !matchesAccept(file, accept)) return { reason: 'type' }
  if (file.size > maxSize) return { reason: 'size' }
  return true
}
```

### Step 7: Run tests — verify they pass

### Step 8: Write failing tests for `inferIcon`

```js
import { inferIcon } from '../src/components/upload-utils.js'

describe('inferIcon', () => {
  it('returns image icon for image/*', () => {
    expect(inferIcon('image/png')).toBe('i-lucide:image')
  })

  it('returns video icon for video/*', () => {
    expect(inferIcon('video/mp4')).toBe('i-lucide:video')
  })

  it('returns music icon for audio/*', () => {
    expect(inferIcon('audio/mpeg')).toBe('i-lucide:music')
  })

  it('returns file-text for application/pdf', () => {
    expect(inferIcon('application/pdf')).toBe('i-lucide:file-text')
  })

  it('returns file-text for text/*', () => {
    expect(inferIcon('text/plain')).toBe('i-lucide:file-text')
  })

  it('returns archive for zip types', () => {
    expect(inferIcon('application/zip')).toBe('i-lucide:archive')
    expect(inferIcon('application/gzip')).toBe('i-lucide:archive')
  })

  it('returns generic file for unknown type', () => {
    expect(inferIcon('application/octet-stream')).toBe('i-lucide:file')
  })

  it('returns generic file for undefined/null', () => {
    expect(inferIcon(undefined)).toBe('i-lucide:file')
    expect(inferIcon(null)).toBe('i-lucide:file')
  })
})
```

### Step 9: Implement `inferIcon`

```js
const MIME_ICONS = [
  ['image/', 'i-lucide:image'],
  ['video/', 'i-lucide:video'],
  ['audio/', 'i-lucide:music'],
  ['application/pdf', 'i-lucide:file-text'],
  ['text/', 'i-lucide:file-text'],
  ['application/zip', 'i-lucide:archive'],
  ['application/gzip', 'i-lucide:archive'],
  ['application/x-tar', 'i-lucide:archive'],
]

/**
 * Infer an icon class from a MIME type string.
 * @param {string | undefined | null} mimeType
 * @returns {string}
 */
export function inferIcon(mimeType) {
  if (!mimeType) return 'i-lucide:file'
  for (const [prefix, icon] of MIME_ICONS) {
    if (mimeType.startsWith(prefix) || mimeType === prefix) return icon
  }
  return 'i-lucide:file'
}
```

### Step 10: Run tests — verify they pass

### Step 11: Write failing tests for `formatSize`

```js
import { formatSize } from '../src/components/upload-utils.js'

describe('formatSize', () => {
  it('formats bytes', () => {
    expect(formatSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatSize(1048576)).toBe('1.0 MB')
  })

  it('formats gigabytes', () => {
    expect(formatSize(1073741824)).toBe('1.0 GB')
  })

  it('formats 0 bytes', () => {
    expect(formatSize(0)).toBe('0 B')
  })
})
```

### Step 12: Implement `formatSize`

```js
/**
 * Format byte count to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}
```

### Step 13: Run tests — verify they pass

### Step 14: Write failing tests for `groupByPath`

```js
import { groupByPath } from '../src/components/upload-utils.js'

describe('groupByPath', () => {
  const files = [
    { name: 'photo.jpg', path: 'images/' },
    { name: 'banner.png', path: 'images/' },
    { name: 'doc.pdf', path: 'docs/' },
    { name: 'readme.md', path: '' }
  ]

  it('groups files by path into nested structure', () => {
    const result = groupByPath(files, 'path', 'children')
    expect(result).toHaveLength(3) // images group, docs group, readme (root)
  })

  it('creates group nodes with children', () => {
    const result = groupByPath(files, 'path', 'children')
    const imagesGroup = result.find((r) => r.text === 'images')
    expect(imagesGroup.children).toHaveLength(2)
  })

  it('keeps root-level files ungrouped', () => {
    const result = groupByPath(files, 'path', 'children')
    const readme = result.find((r) => r.name === 'readme.md')
    expect(readme).toBeTruthy()
    expect(readme.children).toBeUndefined()
  })

  it('handles nested paths', () => {
    const nested = [
      { name: 'thumb.jpg', path: 'images/thumbnails/' }
    ]
    const result = groupByPath(nested, 'path', 'children')
    expect(result[0].text).toBe('images')
    expect(result[0].children[0].text).toBe('thumbnails')
    expect(result[0].children[0].children[0].name).toBe('thumb.jpg')
  })

  it('returns empty array for empty input', () => {
    expect(groupByPath([], 'path', 'children')).toEqual([])
  })
})
```

### Step 15: Implement `groupByPath`

```js
/**
 * Group a flat file array by a path field into a nested tree structure.
 * @param {unknown[]} items — flat file array
 * @param {string} pathField — field name containing the path (e.g. 'path')
 * @param {string} childrenField — field name for children array (e.g. 'children')
 * @returns {unknown[]} — nested tree structure
 */
export function groupByPath(items, pathField, childrenField) {
  if (items.length === 0) return []

  const root = []

  for (const item of items) {
    const rawPath = item[pathField] || ''
    const segments = rawPath.split('/').filter(Boolean)

    if (segments.length === 0) {
      root.push(item)
      continue
    }

    let current = root
    for (const segment of segments) {
      let group = current.find((n) => n.text === segment && n[childrenField])
      if (!group) {
        group = { text: segment, [childrenField]: [] }
        current.push(group)
      }
      current = group[childrenField]
    }
    current.push(item)
  }

  return root
}
```

### Step 16: Run all upload-utils tests — verify pass

Run: `cd solution && bunx vitest run packages/ui/spec/upload-utils.spec.js`
Expected: All tests PASS

### Step 17: Commit

```bash
git add packages/ui/src/components/upload-utils.js packages/ui/spec/upload-utils.spec.js
git commit -m "feat(ui): add upload utility functions (matchesAccept, validateFile, inferIcon, formatSize, groupByPath)"
```

---

## Task 2: Grid Component

General-purpose responsive tile grid with Wrapper + Navigator horizontal navigation. Independent of upload — can render any item collection.

**Files:**
- Create: `packages/ui/src/components/Grid.svelte`
- Create: `packages/ui/spec/Grid.spec.svelte.ts`
- Modify: `packages/ui/src/components/index.ts` — add Grid export

**References:**
- `packages/ui/src/components/List.svelte` — Wrapper + Navigator pattern
- `packages/ui/src/components/Toggle.svelte` — horizontal orientation
- `docs/design/012-upload.md` — Grid section

### Step 1: Write failing tests

```ts
// packages/ui/spec/Grid.spec.svelte.ts
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Grid from '../src/components/Grid.svelte'

const items = [
  { text: 'Apple', value: 'apple', icon: 'i-lucide:apple' },
  { text: 'Banana', value: 'banana', icon: 'i-lucide:banana' },
  { text: 'Cherry', value: 'cherry', icon: 'i-lucide:cherry' },
]

describe('Grid', () => {
  it('renders a container with data-grid', () => {
    const { container } = render(Grid, { items })
    expect(container.querySelector('[data-grid]')).toBeTruthy()
  })

  it('renders one tile per item with data-grid-item', () => {
    const { container } = render(Grid, { items })
    const tiles = container.querySelectorAll('[data-grid-item]')
    expect(tiles).toHaveLength(3)
  })

  it('sets data-path on each tile', () => {
    const { container } = render(Grid, { items })
    const tiles = container.querySelectorAll('[data-grid-item]')
    expect(tiles[0].getAttribute('data-path')).toBe('0')
    expect(tiles[1].getAttribute('data-path')).toBe('1')
  })

  it('marks selected tile with data-active', () => {
    const { container } = render(Grid, { items, value: 'banana' })
    const tiles = container.querySelectorAll('[data-grid-item]')
    expect(tiles[1].hasAttribute('data-active')).toBe(true)
    expect(tiles[0].hasAttribute('data-active')).toBe(false)
  })

  it('sets role="grid" on container and role="gridcell" on tiles', () => {
    const { container } = render(Grid, { items })
    expect(container.querySelector('[data-grid]').getAttribute('role')).toBe('grid')
    const tiles = container.querySelectorAll('[data-grid-item]')
    expect(tiles[0].getAttribute('role')).toBe('gridcell')
  })

  it('fires onselect when tile is clicked', async () => {
    const onselect = vi.fn()
    const { container } = render(Grid, { items, onselect })
    const tiles = container.querySelectorAll('[data-grid-item]')
    await fireEvent.click(tiles[1])
    expect(onselect).toHaveBeenCalledWith('banana', expect.anything())
  })

  it('sets --grid-min-size and --grid-gap CSS variables', () => {
    const { container } = render(Grid, { items, minSize: '150px', gap: '0.5rem' })
    const grid = container.querySelector('[data-grid]')
    expect(grid.style.getPropertyValue('--grid-min-size')).toBe('150px')
    expect(grid.style.getPropertyValue('--grid-gap')).toBe('0.5rem')
  })

  it('disables all tiles when disabled is true', () => {
    const { container } = render(Grid, { items, disabled: true })
    const tiles = container.querySelectorAll('[data-grid-item]')
    for (const tile of tiles) {
      expect(tile.disabled).toBe(true)
    }
  })

  it('renders default ItemContent when no snippet provided', () => {
    const { container } = render(Grid, { items })
    const labels = container.querySelectorAll('[data-item-label]')
    expect(labels).toHaveLength(3)
    expect(labels[0].textContent).toBe('Apple')
  })
})
```

### Step 2: Run tests — verify they fail

Run: `cd solution && bunx vitest run packages/ui/spec/Grid.spec.svelte.ts`
Expected: FAIL (component not found)

### Step 3: Implement Grid.svelte

```svelte
<!-- packages/ui/src/components/Grid.svelte -->
<script lang="ts">
  /**
   * Grid — General-purpose responsive tile grid.
   *
   * Uses Wrapper + Navigator (horizontal) for keyboard navigation.
   * CSS grid with auto-fill for responsive tile sizing.
   *
   * Data attributes:
   *   data-grid          — root container
   *   data-grid-item     — individual tile
   *   data-grid-min-size — min tile width
   *   data-path          — navigator path key
   *   data-active        — selected tile
   *   data-disabled      — disabled tile
   *   data-size          — size variant
   */
  // @ts-nocheck
  import type { ProxyItem } from '@rokkit/states'
  import { Wrapper, ProxyTree } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'
  import { resolveSnippet, ITEM_SNIPPET } from '@rokkit/core'
  import ItemContent from './ItemContent.svelte'

  let {
    items = [],
    fields = {},
    value = $bindable(undefined),
    size = 'md',
    disabled = false,
    minSize = '120px',
    gap = '1rem',
    onselect,
    class: className = '',
    ...snippets
  }: {
    items?: unknown[]
    fields?: Record<string, string>
    value?: unknown
    size?: string
    disabled?: boolean
    minSize?: string
    gap?: string
    onselect?: (value: unknown, proxy: ProxyItem) => void
    class?: string
    [key: string]: unknown
  } = $props()

  let gridRef = $state<HTMLElement | null>(null)

  function handleSelect(selectedValue: unknown, proxy: ProxyItem) {
    value = selectedValue
    onselect?.(selectedValue, proxy)
  }

  const proxyTree = $derived(new ProxyTree(items, fields))
  const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

  $effect(() => {
    if (!gridRef || disabled) return
    const dir = getComputedStyle(gridRef).direction || 'ltr'
    const nav = new Navigator(gridRef, wrapper, { orientation: 'horizontal', dir })
    return () => nav.destroy()
  })

  // DOM focus sync
  $effect(() => {
    const key = wrapper.focusedKey
    if (!gridRef || !key) return
    requestAnimationFrame(() => {
      const target = gridRef?.querySelector(`[data-path="${key}"]`)
      if (target && target !== document.activeElement) {
        target.focus()
        target.scrollIntoView?.({ block: 'nearest' })
      }
    })
  })
</script>

<div
  bind:this={gridRef}
  data-grid
  data-grid-min-size={minSize}
  data-size={size}
  data-disabled={disabled || undefined}
  role="grid"
  class={className || undefined}
  style:--grid-min-size={minSize}
  style:--grid-gap={gap}
>
  {#each wrapper.flatView as node (node.key)}
    {@const proxy = node.proxy}
    {@const sel = String(proxy.value) === String(value)}
    {@const content = resolveSnippet(snippets as Record<string, unknown>, proxy, ITEM_SNIPPET)}

    <button
      type="button"
      data-grid-item
      data-path={node.key}
      data-active={sel || undefined}
      data-disabled={proxy.disabled || undefined}
      role="gridcell"
      aria-selected={sel}
      aria-label={proxy.label}
      disabled={proxy.disabled || disabled}
      tabindex="-1"
    >
      {#if content}
        {@render content(proxy)}
      {:else}
        <ItemContent {proxy} />
      {/if}
    </button>
  {/each}
</div>
```

### Step 4: Run tests — verify they pass

Run: `cd solution && bunx vitest run packages/ui/spec/Grid.spec.svelte.ts`
Expected: All PASS

### Step 5: Add Grid export to index

In `packages/ui/src/components/index.ts`, add:
```ts
export { default as Grid } from './Grid.svelte'
```

Also add to `packages/ui/src/index.ts` if not re-exported from components.

### Step 6: Run full UI test suite

Run: `cd solution && bun run test:ui`
Expected: All existing tests still pass + Grid tests pass

### Step 7: Commit

```bash
git add packages/ui/src/components/Grid.svelte packages/ui/spec/Grid.spec.svelte.ts packages/ui/src/components/index.ts
git commit -m "feat(ui): add Grid component with Wrapper + Navigator horizontal navigation"
```

---

## Task 3: UploadTarget Component

Drag-and-drop file zone with MIME/size validation. No Wrapper/Navigator needed — simple interactive zone.

**Files:**
- Create: `packages/ui/src/components/UploadTarget.svelte`
- Create: `packages/ui/spec/UploadTarget.spec.svelte.ts`
- Modify: `packages/ui/src/components/index.ts` — add export

### Step 1: Write failing tests

```ts
// packages/ui/spec/UploadTarget.spec.svelte.ts
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadTarget from '../src/components/UploadTarget.svelte'

describe('UploadTarget', () => {
  it('renders a container with data-upload-target', () => {
    const { container } = render(UploadTarget)
    expect(container.querySelector('[data-upload-target]')).toBeTruthy()
  })

  it('renders a hidden file input', () => {
    const { container } = render(UploadTarget)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
    expect(input.hidden).toBe(true)
  })

  it('sets accept and multiple on the input', () => {
    const { container } = render(UploadTarget, { accept: 'image/*', multiple: true })
    const input = container.querySelector('input[type="file"]')
    expect(input.getAttribute('accept')).toBe('image/*')
    expect(input.multiple).toBe(true)
  })

  it('sets data-disabled when disabled', () => {
    const { container } = render(UploadTarget, { disabled: true })
    expect(container.querySelector('[data-upload-target]').hasAttribute('data-disabled')).toBe(true)
  })

  it('has role="button" and tabindex', () => {
    const { container } = render(UploadTarget)
    const zone = container.querySelector('[data-upload-target]')
    expect(zone.getAttribute('role')).toBe('button')
    expect(zone.getAttribute('tabindex')).toBe('0')
  })

  it('fires onfiles with valid files from input change', async () => {
    const onfiles = vi.fn()
    const { container } = render(UploadTarget, { onfiles, accept: '' })
    const input = container.querySelector('input[type="file"]')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { value: [file] })
    await fireEvent.change(input)
    expect(onfiles).toHaveBeenCalledWith([file])
  })

  it('fires onerror for files that fail type validation', async () => {
    const onfiles = vi.fn()
    const onerror = vi.fn()
    const { container } = render(UploadTarget, { onfiles, onerror, accept: 'image/*' })
    const input = container.querySelector('input[type="file"]')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { value: [file] })
    await fireEvent.change(input)
    expect(onerror).toHaveBeenCalledWith({ file, reason: 'type' })
    expect(onfiles).not.toHaveBeenCalled()
  })

  it('fires onerror for files that fail size validation', async () => {
    const onerror = vi.fn()
    const { container } = render(UploadTarget, { onerror, maxSize: 5 })
    const input = container.querySelector('input[type="file"]')
    const file = new File(['a'.repeat(100)], 'big.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { value: [file] })
    await fireEvent.change(input)
    expect(onerror).toHaveBeenCalledWith({ file, reason: 'size' })
  })
})
```

### Step 2: Run tests — verify they fail

Run: `cd solution && bunx vitest run packages/ui/spec/UploadTarget.spec.svelte.ts`

### Step 3: Implement UploadTarget.svelte

```svelte
<!-- packages/ui/src/components/UploadTarget.svelte -->
<script lang="ts">
  /**
   * UploadTarget — Drop zone with file validation.
   *
   * Accepts drag-and-drop or browse button. Validates files against
   * accept (MIME/extension) and maxSize constraints.
   *
   * Data attributes:
   *   data-upload-target  — root container / drop zone
   *   data-upload-icon    — upload icon
   *   data-upload-button  — browse button
   *   data-dragging       — present when files dragged over
   *   data-disabled       — when disabled
   */
  import { matchesAccept } from './upload-utils.js'

  interface UploadError {
    file: File
    reason: 'type' | 'size'
  }

  let {
    accept = '',
    maxSize = Infinity,
    multiple = false,
    disabled = false,
    onfiles,
    onerror,
    class: className = '',
    ...snippets
  }: {
    accept?: string
    maxSize?: number
    multiple?: boolean
    disabled?: boolean
    onfiles?: (files: File[]) => void
    onerror?: (err: UploadError) => void
    class?: string
    [key: string]: unknown
  } = $props()

  const content = snippets.content as ((dragging: boolean) => unknown) | undefined

  let inputRef = $state<HTMLInputElement | null>(null)
  let dragging = $state(false)

  function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    const valid: File[] = []

    for (const file of files) {
      if (accept && !matchesAccept(file, accept)) {
        onerror?.({ file, reason: 'type' })
        continue
      }
      if (file.size > maxSize) {
        onerror?.({ file, reason: 'size' })
        continue
      }
      valid.push(file)
    }

    if (valid.length > 0) onfiles?.(valid)
  }

  function handleInputChange() {
    if (inputRef?.files) handleFiles(inputRef.files)
    if (inputRef) inputRef.value = ''
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragging = false
    if (disabled || !event.dataTransfer?.files.length) return
    handleFiles(event.dataTransfer.files)
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    if (!disabled) dragging = true
  }

  function handleDragLeave() {
    dragging = false
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!disabled) inputRef?.click()
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  data-upload-target
  data-disabled={disabled || undefined}
  data-dragging={dragging || undefined}
  role="button"
  tabindex="0"
  aria-disabled={disabled}
  class={className || undefined}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={() => { if (!disabled) inputRef?.click() }}
  onkeydown={handleKeydown}
>
  {#if content}
    {@render content(dragging)}
  {:else}
    <span data-upload-icon class="i-lucide:upload" aria-hidden="true"></span>
    <p>Drop files here or click to browse</p>
  {/if}

  <input
    bind:this={inputRef}
    type="file"
    {accept}
    {multiple}
    {disabled}
    hidden
    onchange={handleInputChange}
  />
</div>
```

### Step 4: Run tests — verify they pass

### Step 5: Add export to index

In `packages/ui/src/components/index.ts`:
```ts
export { default as UploadTarget } from './UploadTarget.svelte'
```

### Step 6: Run full UI test suite — verify no regressions

### Step 7: Commit

```bash
git add packages/ui/src/components/UploadTarget.svelte packages/ui/spec/UploadTarget.spec.svelte.ts packages/ui/src/components/index.ts
git commit -m "feat(ui): add UploadTarget component with drag-and-drop and file validation"
```

---

## Task 4: UploadProgress Component

Composition component that displays file upload status using List, Tree, or Grid depending on view mode. Includes header with file count, view toggle, and clear button.

**Files:**
- Create: `packages/ui/src/components/UploadProgress.svelte`
- Create: `packages/ui/spec/UploadProgress.spec.svelte.ts`
- Modify: `packages/ui/src/components/index.ts` — add export

**References:**
- `docs/design/012-upload.md` — UploadProgress section
- `packages/ui/src/components/List.svelte` — List composition pattern
- `packages/ui/src/components/Tree.svelte` — Tree composition pattern

### Step 1: Write failing tests

```ts
// packages/ui/spec/UploadProgress.spec.svelte.ts
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import UploadProgress from '../src/components/UploadProgress.svelte'

const files = [
  { id: '1', name: 'photo.jpg', size: 1024, type: 'image/jpeg', status: 'uploading', progress: 45, path: '' },
  { id: '2', name: 'doc.pdf', size: 2048, type: 'application/pdf', status: 'done', progress: 100, path: '' },
  { id: '3', name: 'readme.md', size: 512, type: 'text/plain', status: 'pending', progress: 0, path: '' },
]

describe('UploadProgress', () => {
  it('renders a container with data-upload-progress', () => {
    const { container } = render(UploadProgress, { files })
    expect(container.querySelector('[data-upload-progress]')).toBeTruthy()
  })

  it('shows file count in header', () => {
    const { container } = render(UploadProgress, { files })
    const header = container.querySelector('[data-upload-header]')
    expect(header?.textContent).toContain('3')
  })

  it('renders list view by default', () => {
    const { container } = render(UploadProgress, { files })
    expect(container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')).toBe('list')
  })

  it('renders file items with status', () => {
    const { container } = render(UploadProgress, { files })
    const items = container.querySelectorAll('[data-upload-file]')
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  it('shows progress bar for uploading files', () => {
    const { container } = render(UploadProgress, { files })
    const bars = container.querySelectorAll('[data-upload-bar]')
    expect(bars.length).toBeGreaterThan(0)
  })
})
```

### Step 2: Run tests — verify they fail

### Step 3: Implement UploadProgress.svelte

Build the composition component following the design doc. Key elements:
- Header with status summary, view Toggle, and clear button
- Switch on `view` prop to render List, Tree, or Grid
- For tree view: use `groupByPath()` to transform flat files into nested structure
- Default row/tile rendering with progress bar, status badge, and action buttons
- Icon inference via `inferIcon()` when no explicit icon field
- Size formatting via `formatSize()`
- Pass through snippet customization per view mode

The component template and logic should closely follow `docs/design/012-upload.md` "Component 3: UploadProgress" section.

### Step 4: Run tests — verify they pass

### Step 5: Add export to index

In `packages/ui/src/components/index.ts`:
```ts
export { default as UploadProgress } from './UploadProgress.svelte'
```

### Step 6: Run full UI test suite

Run: `cd solution && bun run test:ui`
Expected: All pass

### Step 7: Commit

```bash
git add packages/ui/src/components/UploadProgress.svelte packages/ui/spec/UploadProgress.spec.svelte.ts packages/ui/src/components/index.ts
git commit -m "feat(ui): add UploadProgress composition component with list/tree/grid views"
```

---

## Task 5: Theme CSS — Base Layout + Rokkit Theme

Create the CSS layer for all three components: structural layout (base) and visual theme (rokkit).

**Files:**
- Create: `packages/themes/src/base/upload-target.css`
- Create: `packages/themes/src/base/grid.css`
- Create: `packages/themes/src/base/upload-progress.css`
- Create: `packages/themes/src/rokkit/upload-target.css`
- Create: `packages/themes/src/rokkit/grid.css`
- Create: `packages/themes/src/rokkit/upload-progress.css`
- Modify: `packages/themes/src/base/index.css` — add @import for new files
- Modify: `packages/themes/src/rokkit/index.css` — add @import for new files

**References:**
- `packages/themes/src/base/list.css` — layout pattern reference
- `packages/themes/src/rokkit/list.css` — theme pattern reference
- `docs/design/012-upload.md` — CSS section

### Step 1: Implement base layout CSS

**upload-target.css** — Layout: flex centering, dashed border, sizing, transitions
**grid.css** — Layout: CSS grid with auto-fill, tile padding/sizing, size variants
**upload-progress.css** — Layout: header flex, progress bar track, row/tile structure, action positioning

### Step 2: Implement rokkit theme CSS

**upload-target.css** — Colors, drag-over highlight, hover/focus rings
**grid.css** — Tile borders, hover/focus effects, selection highlight
**upload-progress.css** — Status colors (uploading=blue, done=green, error=red, pending=muted), progress fill gradient, action button styles

### Step 3: Add @imports to index files

In `packages/themes/src/base/index.css`:
```css
@import './upload-target.css';
@import './grid.css';
@import './upload-progress.css';
```

In `packages/themes/src/rokkit/index.css`:
```css
@import './upload-target.css';
@import './grid.css';
@import './upload-progress.css';
```

### Step 4: Build themes

Run: `cd solution/packages/themes && bun run build`
Expected: Build succeeds

### Step 5: Commit

```bash
git add packages/themes/src/base/upload-target.css packages/themes/src/base/grid.css packages/themes/src/base/upload-progress.css packages/themes/src/rokkit/upload-target.css packages/themes/src/rokkit/grid.css packages/themes/src/rokkit/upload-progress.css packages/themes/src/base/index.css packages/themes/src/rokkit/index.css
git commit -m "feat(themes): add base layout and rokkit theme CSS for Grid, UploadTarget, UploadProgress"
```

---

## Task 6: Final Verification

Run full test suite and lint to ensure everything is clean.

**Steps:**

### Step 1: Run full test suite

Run: `cd solution && bun run test:ci`
Expected: All tests pass (previous ~2536 + new tests)

### Step 2: Run lint

Run: `cd solution && bun run lint`
Expected: 0 errors

### Step 3: Build themes

Run: `cd solution/packages/themes && bun run build`
Expected: Build succeeds

### Step 4: Update docs

Update `docs/plans/README.md` to note upload components are done.
Update `agents/journal.md` with what was completed and commit hashes.

### Step 5: Final commit if any doc updates

```bash
git add docs/plans/README.md agents/journal.md
git commit -m "docs: update journal and plan for upload components"
```
