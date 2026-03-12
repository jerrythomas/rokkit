<script>
	// @ts-nocheck
	import { UploadTarget, UploadProgress } from '@rokkit/ui'

	let files = $state([])
	let nextId = $state(1)

	function handleFiles(newFiles) {
		for (const file of newFiles) {
			const id = String(nextId++)
			const entry = {
				text: file.name,
				value: id,
				size: file.size,
				type: file.type,
				status: 'uploading',
				progress: 0
			}
			files = [...files, entry]
			simulateUpload(id)
		}
	}

	function simulateUpload(id) {
		const interval = setInterval(() => {
			const idx = files.findIndex(f => f.value === id)
			if (idx === -1) { clearInterval(interval); return }
			const file = files[idx]
			if (file.status !== 'uploading') { clearInterval(interval); return }
			const next = Math.min(file.progress + Math.floor(Math.random() * 20) + 5, 100)
			if (next >= 100) {
				files[idx] = { ...file, status: 'done', progress: 100 }
				clearInterval(interval)
			} else {
				files[idx] = { ...file, progress: next }
			}
		}, 300)
	}

	function handleCancel(file) {
		const idx = files.findIndex(f => f.value === file.value)
		if (idx !== -1) files[idx] = { ...files[idx], status: 'cancelled' }
	}

	function handleRemove(file) {
		files = files.filter(f => f.value !== file.value)
	}

	function handleClear() {
		files = []
	}
</script>

<UploadTarget onfiles={handleFiles} multiple />

{#if files.length}
	<div class="mt-4">
		<UploadProgress
			{files}
			cancelWhen={['uploading']}
			removeWhen={['done', 'cancelled']}
			oncancel={handleCancel}
			onremove={handleRemove}
			onclear={handleClear}
		/>
	</div>
{/if}
