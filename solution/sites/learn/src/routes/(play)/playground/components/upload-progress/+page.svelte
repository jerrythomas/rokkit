<script>
	// @ts-nocheck
	import { UploadProgress } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let files = $state([
		{ text: 'photo.jpg', value: '1', size: 245760, type: 'image/jpeg', status: 'uploading', progress: 65 },
		{ text: 'document.pdf', value: '2', size: 1048576, type: 'application/pdf', status: 'done', progress: 100 },
		{ text: 'report.xlsx', value: '3', size: 524288, type: 'application/vnd.ms-excel', status: 'error', progress: 30 },
		{ text: 'readme.md', value: '4', size: 2048, type: 'text/plain', status: 'pending', progress: 0 },
		{ text: 'backup.zip', value: '5', size: 10485760, type: 'application/zip', status: 'cancelled', progress: 50 }
	])

	let lastAction = $state('')
	let props = $state({ view: 'list' })

	const schema = {
		type: 'object',
		properties: {
			view: { type: 'string' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/view', label: 'View', props: { options: ['list', 'grid'] } },
			{ type: 'separator' }
		]
	}

	function handleCancel(file) {
		const idx = files.findIndex(f => f.value === file.value)
		if (idx !== -1) {
			files[idx] = { ...files[idx], status: 'cancelled' }
			lastAction = `Cancelled ${file.text}`
		}
	}

	function handleRetry(file) {
		const idx = files.findIndex(f => f.value === file.value)
		if (idx !== -1) {
			files[idx] = { ...files[idx], status: 'uploading', progress: 0 }
			lastAction = `Retrying ${file.text}`
		}
	}

	function handleRemove(file) {
		files = files.filter(f => f.value !== file.value)
		lastAction = `Removed ${file.text}`
	}

	function handleClear() {
		files = []
		lastAction = 'Cleared all'
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="max-w-[600px]">
			<UploadProgress
				{files}
				view={props.view}
				cancelWhen={['uploading']}
				retryWhen={['error']}
				removeWhen={['done', 'error', 'cancelled']}
				oncancel={handleCancel}
				onretry={handleRetry}
				onremove={handleRemove}
				onclear={handleClear}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Files" value={`${files.length  } files`} />
		<InfoField label="Action" value={lastAction} />
	{/snippet}
</PlaySection>
