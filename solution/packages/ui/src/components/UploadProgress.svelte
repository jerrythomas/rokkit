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
	// Pass upload-specific field mappings through to List/Grid so ProxyItem
	// can resolve them via proxy.get(). BASE_FIELDS handles label/value/icon;
	// we add status, progress, size, type, error for UploadFileStatus.

	const fieldMap = $derived({
		...userFields,
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

	let itemSnippet = $derived(snippets[ITEM_SNIPPET] as typeof defaultItemContent | undefined)

	// ─── Action callbacks (unwrap proxy → raw item) ──────────────────────────

	function handleCancel(proxy: ProxyItem) {
		oncancel?.(proxy.original as UploadItem)
	}

	function handleRetry(proxy: ProxyItem) {
		onretry?.(proxy.original as UploadItem)
	}

	function handleRemove(proxy: ProxyItem) {
		onremove?.(proxy.original as UploadItem)
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
				{@render (itemSnippet ?? defaultItemContent)(proxy)}
			{/snippet}
		</Grid>
	{:else}
		<List items={files} fields={fieldMap}>
			{#snippet itemContent(proxy: ProxyItem)}
				{@render (itemSnippet ?? defaultItemContent)(proxy)}
			{/snippet}
		</List>
	{/if}
</div>
