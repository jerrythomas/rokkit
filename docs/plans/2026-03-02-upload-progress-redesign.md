# UploadProgress Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign UploadProgress to compose with List/Grid, extract UploadFileStatus sub-component, use semantic state icons, and replace hardcoded status logic with configurable status-to-action mapping.

**Architecture:** UploadProgress becomes a thin orchestrator (header + layout delegation). It renders a `<List>` or `<Grid>` internally, using `UploadFileStatus` as the default `itemContent` snippet. Action button visibility is driven by `cancelWhen`/`retryWhen`/`removeWhen` arrays. Status display text comes from the `labels` prop merged with `messages.current.uploadProgress`.

**Tech Stack:** Svelte 5, @rokkit/ui (List, Grid), @rokkit/states (ProxyItem, messages), @rokkit/core (DEFAULT_ICONS, resolveSnippet), @rokkit/icons

---

## Task 1: Add State Icons (`action-cancel`, `action-retry`)

**Files:**
- Modify: `packages/core/src/constants.js:88-151` — add to `DEFAULT_ICONS` array
- Create: `packages/icons/src/base/action-cancel.svg`
- Create: `packages/icons/src/base/action-retry.svg`

**Step 1: Add icon names to DEFAULT_ICONS**

In `packages/core/src/constants.js`, add `'action-cancel'` and `'action-retry'` after line 91 (`'action-remove'`):

```js
'action-remove',
'action-cancel',
'action-retry',
'action-add',
```

**Step 2: Create action-cancel.svg**

Create `packages/icons/src/base/action-cancel.svg` — an X/cross icon in a circle (24x24, fill="black", same style as action-remove.svg):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" fill="black"/>
<path d="M15.5355 8.46447C15.1449 8.07394 14.5118 8.07394 14.1213 8.46447L12 10.5858L9.87868 8.46447C9.48816 8.07394 8.85499 8.07394 8.46447 8.46447C8.07394 8.85499 8.07394 9.48816 8.46447 9.87868L10.5858 12L8.46447 14.1213C8.07394 14.5118 8.07394 15.1449 8.46447 15.5355C8.85499 15.926 9.48816 15.926 9.87868 15.5355L12 13.4142L14.1213 15.5355C14.5118 15.926 15.1449 15.926 15.5355 15.5355C15.926 15.1449 15.926 14.5118 15.5355 14.1213L13.4142 12L15.5355 9.87868C15.926 9.48816 15.926 8.85499 15.5355 8.46447Z" fill="black"/>
</svg>
```

**Step 3: Create action-retry.svg**

Create `packages/icons/src/base/action-retry.svg` — a circular arrow/refresh icon (24x24, fill="black"):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 4C9.79 4 7.79 4.88 6.34 6.34L4 4V10H10L7.76 7.76C8.85 6.67 10.35 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C10.36 18 8.86 17.33 7.76 16.24L6.34 17.66C7.79 19.12 9.79 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4Z" fill="black"/>
</svg>
```

**Step 4: Build icons package**

Run: `cd solution && bun run build:icons`
Expected: Clean build, icons dist regenerated.

**Step 5: Run core tests**

Run: `cd solution && bun run test -- --project core`
Expected: All core tests pass (constants.spec.js verifies DEFAULT_ICONS exports).

**Step 6: Commit**

```bash
git add packages/core/src/constants.js packages/icons/src/base/action-cancel.svg packages/icons/src/base/action-retry.svg
git commit -m "feat(core): add action-cancel and action-retry state icons"
```

---

## Task 2: Add `uploadProgress` to Messages Store

**Files:**
- Modify: `packages/states/src/messages.svelte.js:5-29` — add `uploadProgress` entry
- Modify: `packages/states/spec/messages.spec.js` — verify new entry accessible

**Step 1: Add uploadProgress messages**

In `packages/states/src/messages.svelte.js`, add after the `grid` line (line 26):

```js
grid: { label: 'Grid' },
uploadProgress: { label: 'Upload progress', clear: 'Clear all', cancel: 'Cancel', retry: 'Retry', remove: 'Remove' },
```

**Step 2: Run states tests**

Run: `cd solution && bun run test -- --project states`
Expected: All states tests pass. The messages spec checks that `messages.current` has expected keys.

**Step 3: Commit**

```bash
git add packages/states/src/messages.svelte.js
git commit -m "feat(states): add uploadProgress to messages store"
```

---

## Task 3: Create UploadFileStatus Component (TDD)

**Files:**
- Create: `packages/ui/spec/UploadFileStatus.spec.svelte.ts`
- Create: `packages/ui/src/components/UploadFileStatus.svelte`
- Modify: `packages/ui/src/components/index.ts` — add export

**Step 1: Write failing tests**

Create `packages/ui/spec/UploadFileStatus.spec.svelte.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadFileStatus from '../src/components/UploadFileStatus.svelte'
import { ProxyItem } from '@rokkit/states'

function makeProxy(data: Record<string, unknown>, fields: Record<string, string> = {}) {
	const merged = {
		text: 'label', value: 'value', icon: 'icon', type: 'type',
		size: 'size', status: 'status', progress: 'progress', error: 'error',
		...fields,
	}
	return new ProxyItem(data, merged)
}

describe('UploadFileStatus', () => {
	it('renders a root element with data-upload-file-status', () => {
		const proxy = makeProxy({ label: 'photo.jpg', status: 'uploading', size: 1024, type: 'image/jpeg', progress: 45 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-file-status]')).toBeTruthy()
	})

	it('renders file name from proxy.label', () => {
		const proxy = makeProxy({ label: 'doc.pdf', status: 'done', size: 2048, type: 'application/pdf', progress: 100 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.textContent).toContain('doc.pdf')
	})

	it('renders formatted file size', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'pending', size: 1024, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.textContent).toContain('1.0 KB')
	})

	it('renders status text as-is when no label mapping', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'extracting', size: 100, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-status]')?.textContent).toBe('extracting')
	})

	it('renders mapped status label when provided', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'extracting', size: 100, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, { proxy, labels: { extracting: 'Extracting text…' } })
		expect(container.querySelector('[data-upload-status]')?.textContent).toBe('Extracting text…')
	})

	it('renders progress bar when 0 < progress < 100', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'uploading', size: 100, type: 'text/plain', progress: 45 })
		const { container } = render(UploadFileStatus, { proxy })
		const fill = container.querySelector('[data-upload-fill]') as HTMLElement
		expect(fill).toBeTruthy()
		expect(fill.style.width).toBe('45%')
	})

	it('does not render progress bar when progress is 0', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'pending', size: 100, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-bar]')).toBeFalsy()
	})

	it('does not render progress bar when progress is 100', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'done', size: 100, type: 'text/plain', progress: 100 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-bar]')).toBeFalsy()
	})

	it('renders cancel button when status is in cancelWhen and oncancel provided', () => {
		const oncancel = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'uploading', size: 100, type: 'text/plain', progress: 30 })
		const { container } = render(UploadFileStatus, {
			proxy, cancelWhen: ['uploading', 'queued'], oncancel,
		})
		const btn = container.querySelector('[data-upload-cancel]')
		expect(btn).toBeTruthy()
	})

	it('does not render cancel button when status not in cancelWhen', () => {
		const oncancel = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'done', size: 100, type: 'text/plain', progress: 100 })
		const { container } = render(UploadFileStatus, {
			proxy, cancelWhen: ['uploading'], oncancel,
		})
		expect(container.querySelector('[data-upload-cancel]')).toBeFalsy()
	})

	it('fires oncancel with proxy when cancel clicked', async () => {
		const oncancel = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'uploading', size: 100, type: 'text/plain', progress: 30 })
		const { container } = render(UploadFileStatus, {
			proxy, cancelWhen: ['uploading'], oncancel,
		})
		await fireEvent.click(container.querySelector('[data-upload-cancel]')!)
		expect(oncancel).toHaveBeenCalledWith(proxy)
	})

	it('renders retry button when status is in retryWhen and onretry provided', () => {
		const onretry = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'failed', size: 100, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, {
			proxy, retryWhen: ['failed'], onretry,
		})
		expect(container.querySelector('[data-upload-retry]')).toBeTruthy()
	})

	it('fires onretry with proxy when retry clicked', async () => {
		const onretry = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'failed', size: 100, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, {
			proxy, retryWhen: ['failed'], onretry,
		})
		await fireEvent.click(container.querySelector('[data-upload-retry]')!)
		expect(onretry).toHaveBeenCalledWith(proxy)
	})

	it('renders remove button when status is in removeWhen and onremove provided', () => {
		const onremove = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'done', size: 100, type: 'text/plain', progress: 100 })
		const { container } = render(UploadFileStatus, {
			proxy, removeWhen: ['done', 'failed'], onremove,
		})
		expect(container.querySelector('[data-upload-remove]')).toBeTruthy()
	})

	it('renders file icon inferred from MIME type', () => {
		const proxy = makeProxy({ label: 'photo.jpg', status: 'done', size: 100, type: 'image/jpeg', progress: 100 })
		const { container } = render(UploadFileStatus, { proxy })
		const icon = container.querySelector('[data-upload-file-icon]')
		expect(icon?.classList.contains('i-lucide:image')).toBe(true)
	})

	it('uses semantic icon classes for action buttons', () => {
		const oncancel = vi.fn()
		const onretry = vi.fn()
		const onremove = vi.fn()
		const proxy = makeProxy({ label: 'f.txt', status: 'failed', size: 100, type: 'text/plain', progress: 0 })
		const { container } = render(UploadFileStatus, {
			proxy,
			cancelWhen: ['failed'], oncancel,
			retryWhen: ['failed'], onretry,
			removeWhen: ['failed'], onremove,
		})
		expect(container.querySelector('[data-upload-cancel] span[aria-hidden]')).toBeTruthy()
		expect(container.querySelector('[data-upload-retry] span[aria-hidden]')).toBeTruthy()
		expect(container.querySelector('[data-upload-remove] span[aria-hidden]')).toBeTruthy()
	})

	it('sets data-status on root from proxy status', () => {
		const proxy = makeProxy({ label: 'f.txt', status: 'chunking', size: 100, type: 'text/plain', progress: 50 })
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-file-status]')?.getAttribute('data-status')).toBe('chunking')
	})
})
```

**Step 2: Run tests to verify they fail**

Run: `cd solution && bun run test -- --project ui -- UploadFileStatus`
Expected: FAIL — module not found.

**Step 3: Write UploadFileStatus.svelte**

Create `packages/ui/src/components/UploadFileStatus.svelte`:

```svelte
<script lang="ts">
	/**
	 * UploadFileStatus — Renders a single file's upload status and action buttons.
	 *
	 * Data attributes:
	 *   data-upload-file-status — root
	 *   data-upload-file-icon   — file type icon
	 *   data-upload-status      — status text badge
	 *   data-upload-bar         — progress bar track
	 *   data-upload-fill        — progress bar fill
	 *   data-upload-actions     — action buttons wrapper
	 *   data-upload-cancel      — cancel button
	 *   data-upload-retry       — retry button
	 *   data-upload-remove      — remove button
	 *   data-status             — status value on root (for CSS theming)
	 */
	import type { ProxyItem } from '@rokkit/states'
	import { messages } from '@rokkit/states'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { inferIcon, formatSize } from './upload-utils.js'

	let {
		proxy,
		cancelWhen = [] as string[],
		retryWhen = [] as string[],
		removeWhen = [] as string[],
		oncancel,
		onretry,
		onremove,
		labels: userLabels = {} as Record<string, string>,
		icons: userIcons = {} as Record<string, string>,
	}: {
		proxy: ProxyItem
		cancelWhen?: string[]
		retryWhen?: string[]
		removeWhen?: string[]
		oncancel?: (proxy: ProxyItem) => void
		onretry?: (proxy: ProxyItem) => void
		onremove?: (proxy: ProxyItem) => void
		labels?: Record<string, string>
		icons?: Record<string, string>
	} = $props()

	const labels = $derived({ ...messages.current.uploadProgress, ...userLabels })
	const icons = $derived({
		cancel: DEFAULT_STATE_ICONS.action.cancel,
		retry: DEFAULT_STATE_ICONS.action.retry,
		remove: DEFAULT_STATE_ICONS.action.remove,
		...userIcons,
	})

	const status = $derived(String(proxy.get('status') ?? 'unknown'))
	const progress = $derived(Number(proxy.get('progress') ?? 0))
	const size = $derived(Number(proxy.get('size') ?? 0))
	const fileIcon = $derived(proxy.get('icon') ? String(proxy.get('icon')) : inferIcon(proxy.get('type') as string | undefined))
	const statusLabel = $derived(labels[status] ?? status)

	const showBar = $derived(progress > 0 && progress < 100)
	const showCancel = $derived(cancelWhen.includes(status) && !!oncancel)
	const showRetry = $derived(retryWhen.includes(status) && !!onretry)
	const showRemove = $derived(removeWhen.includes(status) && !!onremove)
</script>

<div data-upload-file-status data-status={status}>
	<span data-upload-file-icon class={fileIcon} aria-hidden="true"></span>
	<span data-upload-file-name>{proxy.label}</span>
	<span data-upload-file-size>{formatSize(size)}</span>
	{#if showBar}
		<div data-upload-bar>
			<div data-upload-fill style:width="{progress}%"></div>
		</div>
	{/if}
	<span data-upload-status>{statusLabel}</span>
	{#if showCancel || showRetry || showRemove}
		<div data-upload-actions>
			{#if showCancel}
				<button type="button" data-upload-cancel aria-label="{labels.cancel} {proxy.label}" onclick={() => oncancel?.(proxy)}>
					<span class={icons.cancel} aria-hidden="true"></span>
				</button>
			{/if}
			{#if showRetry}
				<button type="button" data-upload-retry aria-label="{labels.retry} {proxy.label}" onclick={() => onretry?.(proxy)}>
					<span class={icons.retry} aria-hidden="true"></span>
				</button>
			{/if}
			{#if showRemove}
				<button type="button" data-upload-remove aria-label="{labels.remove} {proxy.label}" onclick={() => onremove?.(proxy)}>
					<span class={icons.remove} aria-hidden="true"></span>
				</button>
			{/if}
		</div>
	{/if}
</div>
```

**Step 4: Add export to index.ts**

In `packages/ui/src/components/index.ts`, add after the UploadTarget export:

```typescript
export { default as UploadFileStatus } from './UploadFileStatus.svelte'
```

**Step 5: Run tests to verify they pass**

Run: `cd solution && bun run test -- --project ui -- UploadFileStatus`
Expected: All tests pass.

**Step 6: Commit**

```bash
git add packages/ui/spec/UploadFileStatus.spec.svelte.ts packages/ui/src/components/UploadFileStatus.svelte packages/ui/src/components/index.ts
git commit -m "feat(ui): add UploadFileStatus component with configurable status-action mapping"
```

---

## Task 4: Rewrite UploadProgress to Compose with List/Grid (TDD)

**Files:**
- Rewrite: `packages/ui/spec/UploadProgress.spec.svelte.ts`
- Rewrite: `packages/ui/src/components/UploadProgress.svelte`

**Step 1: Write new tests**

Replace `packages/ui/spec/UploadProgress.spec.svelte.ts` entirely:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadProgress from '../src/components/UploadProgress.svelte'

const files = [
	{ id: '1', text: 'photo.jpg', value: '1', size: 1024, type: 'image/jpeg', status: 'uploading', progress: 45 },
	{ id: '2', text: 'doc.pdf', value: '2', size: 2048, type: 'application/pdf', status: 'done', progress: 100 },
	{ id: '3', text: 'readme.md', value: '3', size: 512, type: 'text/plain', status: 'pending', progress: 0 },
]

describe('UploadProgress', () => {
	it('renders root with data-upload-progress', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-progress]')).toBeTruthy()
	})

	it('renders data-upload-view attribute', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')).toBe('list')
	})

	it('shows file count in header', () => {
		const { container } = render(UploadProgress, { files })
		const header = container.querySelector('[data-upload-header]')
		expect(header?.textContent).toContain('3')
	})

	it('shows status summary in header', () => {
		const { container } = render(UploadProgress, { files })
		const header = container.querySelector('[data-upload-header]')!
		expect(header.textContent).toContain('uploading')
		expect(header.textContent).toContain('done')
		expect(header.textContent).toContain('pending')
	})

	it('uses labels for status summary when provided', () => {
		const { container } = render(UploadProgress, {
			files,
			labels: { uploading: 'En cours', done: 'Terminé', pending: 'En attente' },
		})
		const header = container.querySelector('[data-upload-header]')!
		expect(header.textContent).toContain('En cours')
		expect(header.textContent).toContain('Terminé')
	})

	it('renders a List component internally (default view)', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-list]')).toBeTruthy()
	})

	it('renders a Grid component when view=grid', () => {
		const { container } = render(UploadProgress, { files, view: 'grid' })
		expect(container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')).toBe('grid')
		expect(container.querySelector('[data-grid]')).toBeTruthy()
	})

	it('renders UploadFileStatus for each file (default snippet)', () => {
		const { container } = render(UploadProgress, { files })
		const statuses = container.querySelectorAll('[data-upload-file-status]')
		expect(statuses.length).toBe(3)
	})

	it('shows clear button when onclear provided', () => {
		const onclear = vi.fn()
		const { container } = render(UploadProgress, { files, onclear })
		expect(container.querySelector('[data-upload-clear]')).toBeTruthy()
	})

	it('fires onclear when clear button clicked', async () => {
		const onclear = vi.fn()
		const { container } = render(UploadProgress, { files, onclear })
		await fireEvent.click(container.querySelector('[data-upload-clear]')!)
		expect(onclear).toHaveBeenCalled()
	})

	it('does not show clear button when onclear not provided', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-clear]')).toBeFalsy()
	})

	it('forwards cancelWhen/retryWhen/removeWhen to UploadFileStatus', () => {
		const oncancel = vi.fn()
		const { container } = render(UploadProgress, {
			files, cancelWhen: ['uploading'], oncancel,
		})
		// The uploading file should have a cancel button
		const cancelBtns = container.querySelectorAll('[data-upload-cancel]')
		expect(cancelBtns.length).toBe(1)
	})

	it('renders empty state when no files', () => {
		const { container } = render(UploadProgress, { files: [] })
		expect(container.querySelectorAll('[data-upload-file-status]').length).toBe(0)
	})

	it('passes fields mapping through to inner components', () => {
		const customFiles = [
			{ id: '1', filename: 'test.txt', val: '1', bytes: 512, mime: 'text/plain', stage: 'active', pct: 50 },
		]
		const { container } = render(UploadProgress, {
			files: customFiles,
			fields: { label: 'filename', value: 'val', size: 'bytes', type: 'mime', status: 'stage', progress: 'pct' },
		})
		expect(container.textContent).toContain('test.txt')
		expect(container.querySelector('[data-upload-file-status]')?.getAttribute('data-status')).toBe('active')
	})
})
```

**Step 2: Run tests to verify they fail**

Run: `cd solution && bun run test -- --project ui -- UploadProgress`
Expected: FAIL — component still uses old implementation.

**Step 3: Rewrite UploadProgress.svelte**

Replace `packages/ui/src/components/UploadProgress.svelte` entirely:

```svelte
<script lang="ts">
	/**
	 * UploadProgress — File upload status orchestrator.
	 *
	 * Thin composition layer: header + List or Grid layout.
	 * Default itemContent snippet renders UploadFileStatus for each file.
	 * Consumer can override with custom itemContent snippet.
	 *
	 * Data attributes:
	 *   data-upload-progress — root container
	 *   data-upload-view     — current view mode (list, grid)
	 *   data-upload-header   — header bar
	 *   data-upload-clear    — clear all button
	 */
	import type { ProxyItem } from '@rokkit/states'
	import { messages } from '@rokkit/states'
	import { ITEM_SNIPPET } from '@rokkit/core'
	import List from './List.svelte'
	import Grid from './Grid.svelte'
	import UploadFileStatus from './UploadFileStatus.svelte'

	type UploadItem = Record<string, unknown>

	let {
		files = [] as UploadItem[],
		fields: userFields = {} as Record<string, string>,
		view = 'list' as 'list' | 'grid',
		cancelWhen = [] as string[],
		retryWhen = [] as string[],
		removeWhen = [] as string[],
		oncancel,
		onretry,
		onremove,
		onclear,
		labels: userLabels = {} as Record<string, string>,
		class: className = '',
		...snippets
	}: {
		files?: UploadItem[]
		fields?: Record<string, string>
		view?: 'list' | 'grid'
		cancelWhen?: string[]
		retryWhen?: string[]
		removeWhen?: string[]
		oncancel?: (file: UploadItem) => void
		onretry?: (file: UploadItem) => void
		onremove?: (file: UploadItem) => void
		onclear?: () => void
		labels?: Record<string, string>
		class?: string
		[key: string]: unknown
	} = $props()

	// ─── Labels ──────────────────────────────────────────────────────────────

	const labels = $derived({ ...messages.current.uploadProgress, ...userLabels })

	// ─── Field resolution ────────────────────────────────────────────────────

	const fieldMap = $derived({
		text: userFields.label ?? userFields.text ?? 'text',
		value: userFields.value ?? 'value',
		icon: userFields.icon ?? 'icon',
		status: userFields.status ?? 'status',
		progress: userFields.progress ?? 'progress',
		size: userFields.size ?? 'size',
		type: userFields.type ?? 'type',
		error: userFields.error ?? 'error',
	})

	// ─── Status summary ──────────────────────────────────────────────────────

	const statusField = $derived(userFields.status ?? 'status')

	const statusSummary = $derived.by(() => {
		const counts: Record<string, number> = {}
		for (const file of files) {
			const s = String(file[statusField] || 'unknown')
			counts[s] = (counts[s] || 0) + 1
		}
		return Object.entries(counts)
			.map(([s, n]) => `${n} ${labels[s] ?? s}`)
			.join(', ')
	})

	// ─── Snippet resolution ──────────────────────────────────────────────────

	const hasCustomItemSnippet = $derived(ITEM_SNIPPET in snippets && typeof snippets[ITEM_SNIPPET] === 'function')

	// ─── Action callbacks (unwrap proxy → raw item) ──────────────────────────

	function handleCancel(proxy: ProxyItem) {
		oncancel?.(proxy.raw as UploadItem)
	}

	function handleRetry(proxy: ProxyItem) {
		onretry?.(proxy.raw as UploadItem)
	}

	function handleRemove(proxy: ProxyItem) {
		onremove?.(proxy.raw as UploadItem)
	}
</script>

{#snippet defaultItemContent(proxy: ProxyItem)}
	<UploadFileStatus
		{proxy}
		{cancelWhen}
		{retryWhen}
		{removeWhen}
		oncancel={handleCancel}
		onretry={handleRetry}
		onremove={handleRemove}
		labels={userLabels}
	/>
{/snippet}

<div
	data-upload-progress
	data-upload-view={view}
	class={className || undefined}
>
	<!-- Header -->
	<div data-upload-header>
		<span>{files.length} files — {statusSummary}</span>
		{#if onclear}
			<button type="button" data-upload-clear onclick={onclear}>{labels.clear}</button>
		{/if}
	</div>

	<!-- Layout delegation -->
	{#if view === 'grid'}
		<Grid items={files} fields={fieldMap}>
			{#snippet itemContent(proxy: ProxyItem)}
				{#if hasCustomItemSnippet}
					{@render (snippets[ITEM_SNIPPET] as (p: ProxyItem) => unknown)(proxy)}
				{:else}
					{@render defaultItemContent(proxy)}
				{/if}
			{/snippet}
		</Grid>
	{:else}
		<List items={files} fields={fieldMap}>
			{#snippet itemContent(proxy: ProxyItem)}
				{#if hasCustomItemSnippet}
					{@render (snippets[ITEM_SNIPPET] as (p: ProxyItem) => unknown)(proxy)}
				{:else}
					{@render defaultItemContent(proxy)}
				{/if}
			{/snippet}
		</List>
	{/if}
</div>
```

**Step 4: Run tests to verify they pass**

Run: `cd solution && bun run test -- --project ui -- UploadProgress`
Expected: All new tests pass.

**Step 5: Run full UI test suite**

Run: `cd solution && bun run test:ui`
Expected: All UI tests pass (no regressions).

**Step 6: Commit**

```bash
git add packages/ui/spec/UploadProgress.spec.svelte.ts packages/ui/src/components/UploadProgress.svelte
git commit -m "feat(ui): rewrite UploadProgress to compose with List/Grid and UploadFileStatus"
```

---

## Task 5: Update Theme CSS

**Files:**
- Modify: `packages/themes/src/base/upload-progress.css` — update selectors for new data attributes
- Modify: `packages/themes/src/rokkit/upload-progress.css` — update selectors

**Step 1: Update base upload-progress.css**

The structural layout is mostly the same. Key changes:
- `[data-upload-file]` selectors become `[data-upload-file-status]` (the new root element name)
- Grid view selectors update accordingly
- Remove the `[data-upload-progress][data-upload-view='grid'] [data-upload-file]` selectors (Grid component handles tile layout)

Replace the "File Row" section selector `[data-upload-file]` with `[data-upload-file-status]`. Replace `[data-upload-progress][data-upload-view='grid'] [data-upload-file]` with `[data-upload-file-status]` nested under `[data-grid]`.

**Step 2: Update rokkit upload-progress.css**

Same selector updates: `[data-upload-file]` → `[data-upload-file-status]` throughout.

**Step 3: Build themes**

Run: `cd solution && bun run build:themes`
Expected: Clean build.

**Step 4: Commit**

```bash
git add packages/themes/src/base/upload-progress.css packages/themes/src/rokkit/upload-progress.css
git commit -m "fix(themes): update upload-progress selectors for UploadFileStatus"
```

---

## Task 6: Final Verification

**Step 1: Run full test suite**

Run: `cd solution && bun run test:ci`
Expected: All tests pass (2644+).

**Step 2: Run lint**

Run: `cd solution && bun run lint`
Expected: 0 errors.

**Step 3: Build all packages**

Run: `cd solution && bun run build:icons && bun run build:themes`
Expected: Clean builds.

**Step 4: Commit any remaining fixes**

If any tests/lint issues found, fix and commit.
