<script lang="ts">
	/**
	 * UploadProgress — File upload status viewer.
	 *
	 * Composition component that renders file upload status using a list or grid
	 * view. Includes header with file count, status summary, and clear button.
	 *
	 * Data attributes:
	 *   data-upload-progress   — root container
	 *   data-upload-view       — current view mode (list, grid)
	 *   data-upload-header     — header bar
	 *   data-upload-file       — individual file row/tile
	 *   data-upload-file-icon  — file type icon
	 *   data-upload-bar        — progress bar track
	 *   data-upload-fill       — progress bar fill
	 *   data-upload-status     — status badge
	 *   data-status            — status value on file row (for CSS theming)
	 *   data-upload-actions    — action buttons wrapper
	 *   data-upload-cancel     — cancel button
	 *   data-upload-remove     — remove button
	 *   data-upload-retry      — retry button
	 *   data-upload-clear      — clear all button
	 */
	import { inferIcon, formatSize } from './upload-utils.js'

	type UploadFile = Record<string, unknown>

	let {
		files = [] as UploadFile[],
		fields: userFields = {} as Record<string, string>,
		view = 'list' as 'list' | 'grid',
		oncancel,
		onremove,
		onretry,
		onclear,
		class: className = '',
	}: {
		files?: UploadFile[]
		fields?: Record<string, string>
		view?: 'list' | 'grid'
		oncancel?: (file: UploadFile) => void
		onremove?: (file: UploadFile) => void
		onretry?: (file: UploadFile) => void
		onclear?: () => void
		class?: string
	} = $props()

	// ─── Field resolution ─────────────────────────────────────────────────────

	const f = $derived({
		label: userFields.label ?? 'text',
		value: userFields.value ?? 'value',
		icon: userFields.icon ?? 'icon',
		status: userFields.status ?? 'status',
		progress: userFields.progress ?? 'progress',
		size: userFields.size ?? 'size',
		type: userFields.type ?? 'type',
		error: userFields.error ?? 'error',
	})

	// ─── Status summary ───────────────────────────────────────────────────────

	const statusSummary = $derived.by(() => {
		const counts: Record<string, number> = {}
		for (const file of files) {
			const s = String(file[f.status] || 'unknown')
			counts[s] = (counts[s] || 0) + 1
		}
		return Object.entries(counts)
			.map(([s, n]) => `${n} ${s}`)
			.join(', ')
	})

	// ─── Helpers ──────────────────────────────────────────────────────────────

	function getLabel(file: UploadFile): string {
		return String(file[f.label] ?? '')
	}

	function getStatus(file: UploadFile): string {
		return String(file[f.status] ?? 'unknown')
	}

	function getProgress(file: UploadFile): number {
		return Number(file[f.progress] ?? 0)
	}

	function getSize(file: UploadFile): number {
		return Number(file[f.size] ?? 0)
	}

	function getIcon(file: UploadFile): string {
		const explicit = file[f.icon]
		if (explicit) return String(explicit)
		const mimeType = file[f.type]
		return inferIcon(mimeType as string | undefined)
	}
</script>

<div
	data-upload-progress
	data-upload-view={view}
	class={className || undefined}
>
	<!-- Header -->
	<div data-upload-header>
		<span>{files.length} files — {statusSummary}</span>
		{#if onclear}
			<button type="button" data-upload-clear onclick={onclear}>Clear all</button>
		{/if}
	</div>

	<!-- File items -->
	{#if view === 'grid'}
		<div data-grid>
			{#each files as file (file[f.value] ?? file[f.label])}
				{@const status = getStatus(file)}
				<div data-upload-file data-status={status}>
					<span data-upload-file-icon class={getIcon(file)} aria-hidden="true"></span>
					<span data-upload-file-name>{getLabel(file)}</span>
					<span data-upload-file-size>{formatSize(getSize(file))}</span>
					{#if status === 'uploading'}
						<div data-upload-bar>
							<div data-upload-fill style:width="{getProgress(file)}%"></div>
						</div>
					{/if}
					<span data-upload-status>{status}</span>
					<div data-upload-actions>
						{#if status === 'uploading' && oncancel}
							<button
								type="button"
								data-upload-cancel
								aria-label="Cancel upload for {getLabel(file)}"
								onclick={() => oncancel(file)}
							>&#x2715;</button>
						{/if}
						{#if (status === 'done' || status === 'error') && onremove}
							<button
								type="button"
								data-upload-remove
								aria-label="Remove {getLabel(file)}"
								onclick={() => onremove(file)}
							>&#x2715;</button>
						{/if}
						{#if status === 'error' && onretry}
							<button
								type="button"
								data-upload-retry
								aria-label="Retry upload for {getLabel(file)}"
								onclick={() => onretry(file)}
							>&#x21bb;</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- List view (default) -->
		{#each files as file (file[f.value] ?? file[f.label])}
			{@const status = getStatus(file)}
			<div data-upload-file data-status={status}>
				<span data-upload-file-icon class={getIcon(file)} aria-hidden="true"></span>
				<span data-upload-file-name>{getLabel(file)}</span>
				<span data-upload-file-size>{formatSize(getSize(file))}</span>
				{#if status === 'uploading'}
					<div data-upload-bar>
						<div data-upload-fill style:width="{getProgress(file)}%"></div>
					</div>
				{/if}
				<span data-upload-status>{status}</span>
				<div data-upload-actions>
					{#if status === 'uploading' && oncancel}
						<button
							type="button"
							data-upload-cancel
							aria-label="Cancel upload for {getLabel(file)}"
							onclick={() => oncancel(file)}
						>&#x2715;</button>
					{/if}
					{#if (status === 'done' || status === 'error') && onremove}
						<button
							type="button"
							data-upload-remove
							aria-label="Remove {getLabel(file)}"
							onclick={() => onremove(file)}
						>&#x2715;</button>
					{/if}
					{#if status === 'error' && onretry}
						<button
							type="button"
							data-upload-retry
							aria-label="Retry upload for {getLabel(file)}"
							onclick={() => onretry(file)}
						>&#x21bb;</button>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>
