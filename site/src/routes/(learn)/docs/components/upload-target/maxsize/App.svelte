<script>
	// @ts-nocheck
	import { UploadTarget } from '@rokkit/ui'

	let fileNames = $state([])
	let errors = $state([])

	function handleFiles(files) {
		fileNames = files.map(f => f.name)
		errors = []
	}

	function handleError(err) {
		errors = [...errors, `${err.file.name}: too large (${err.reason})`]
	}
</script>

<p class="text-surface-z5 mb-2 text-sm">Max file size: 100 KB</p>

<UploadTarget maxSize={102400} multiple onfiles={handleFiles} onerror={handleError} />

{#if fileNames.length}
	<p class="text-surface-z6 mt-3 text-sm">
		Accepted: <strong>{fileNames.join(', ')}</strong>
	</p>
{/if}
{#if errors.length}
	<p class="text-red-500 mt-2 text-sm">{errors.join('; ')}</p>
{/if}
