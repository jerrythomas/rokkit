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
	import type { UploadFileStatusProps } from '../types/upload-file-status.js'
	import { messages } from '@rokkit/states'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { inferIcon, formatSize } from '../utils/upload.js'

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
	}: UploadFileStatusProps = $props()

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
	const showCancel = $derived(cancelWhen.includes(status) && Boolean(oncancel))
	const showRetry = $derived(retryWhen.includes(status) && Boolean(onretry))
	const showRemove = $derived(removeWhen.includes(status) && Boolean(onremove))
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
