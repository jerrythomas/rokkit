<script>
	// @ts-nocheck
	import { UploadProgress } from '@rokkit/ui'

	let files = $state([
		{
			label: 'photo.jpg',
			value: '1',
			size: 245760,
			type: 'image/jpeg',
			status: 'uploading',
			progress: 65
		},
		{
			label: 'document.pdf',
			value: '2',
			size: 1048576,
			type: 'application/pdf',
			status: 'done',
			progress: 100
		},
		{
			label: 'report.xlsx',
			value: '3',
			size: 524288,
			type: 'application/vnd.ms-excel',
			status: 'error',
			progress: 30
		},
		{
			label: 'readme.md',
			value: '4',
			size: 2048,
			type: 'text/plain',
			status: 'pending',
			progress: 0
		},
		{
			label: 'backup.zip',
			value: '5',
			size: 10485760,
			type: 'application/zip',
			status: 'cancelled',
			progress: 50
		}
	])

	let lastAction = $state('')

	function handleCancel(file) {
		const idx = files.findIndex((f) => f.value === file.value)
		if (idx !== -1) {
			files[idx] = { ...files[idx], status: 'cancelled' }
			lastAction = `Cancelled ${file.text}`
		}
	}

	function handleRetry(file) {
		const idx = files.findIndex((f) => f.value === file.value)
		if (idx !== -1) {
			files[idx] = { ...files[idx], status: 'uploading', progress: 0 }
			lastAction = `Retrying ${file.text}`
		}
	}

	function handleRemove(file) {
		files = files.filter((f) => f.value !== file.value)
		lastAction = `Removed ${file.text}`
	}

	function handleClear() {
		files = []
		lastAction = 'Cleared all'
	}
</script>

<UploadProgress
	{files}
	cancelWhen={['uploading']}
	retryWhen={['error']}
	removeWhen={['done', 'error', 'cancelled']}
	oncancel={handleCancel}
	onretry={handleRetry}
	onremove={handleRemove}
	onclear={handleClear}
/>

{#if lastAction}
	<p class="text-surface-z6 mt-3 text-sm">Last action: <strong>{lastAction}</strong></p>
{/if}
