<script lang="ts">
	/**
	 * UploadTarget — Drop zone with file validation.
	 *
	 * Accepts drag-and-drop or click-to-browse. Validates files against
	 * accept (MIME/extension) and maxSize constraints via upload-utils.
	 *
	 * Data attributes:
	 *   data-upload-target  — root container / drop zone
	 *   data-upload-icon    — upload icon
	 *   data-upload-button  — browse button
	 *   data-dragging       — present when files dragged over
	 *   data-disabled       — when disabled
	 */
	import type { UploadTargetProps } from '../types/upload-target.js'
	import { messages } from '@rokkit/states'
	import { matchesAccept } from '../utils/upload.js'

	let {
		accept = '',
		maxSize = Infinity,
		multiple = false,
		disabled = false,
		size = 'full',
		labels = {} as Record<string, string>,
		onfiles,
		onerror,
		class: className = '',
		...snippets
	}: UploadTargetProps & { [key: string]: unknown } = $props()

	const content = $derived(snippets.content as ((dragging: boolean) => unknown) | undefined)

	const resolvedLabels = $derived({
		...messages.uploadTarget,
		...labels
	})

	let inputRef = $state<HTMLInputElement | null>(null)
	let dragging = $state(false)

	function validateFile(file: File): 'type' | 'size' | null {
		if (accept && !matchesAccept(file, accept)) return 'type'
		if (file.size > maxSize) return 'size'
		return null
	}

	function processFile(file: File, valid: File[]) {
		const reason = validateFile(file)
		if (reason) onerror?.({ file, reason })
		else valid.push(file)
	}

	function handleFiles(fileList: FileList | File[]) {
		const valid: File[] = []
		for (const file of Array.from(fileList)) processFile(file, valid)
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

<div
	data-upload-target
	data-size={size}
	data-disabled={disabled || undefined}
	data-dragging={dragging || undefined}
	role="button"
	tabindex="0"
	aria-label={resolvedLabels.dropzone ?? 'File upload drop zone'}
	aria-disabled={disabled}
	class={className || undefined}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={() => {
		if (!disabled) inputRef?.click()
	}}
	onkeydown={handleKeydown}
>
	{#if content}
		{@render content(dragging)}
	{:else}
		<span data-upload-icon class="i-lucide:upload" aria-hidden="true"></span>
		{#if size !== 'small'}
			<p>Drop files here or click to browse</p>
			<button type="button" data-upload-button {disabled}>Browse</button>
		{/if}
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
