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
		errors = [...errors, `${err.file.name}: rejected (${err.reason})`]
	}
</script>

<UploadTarget accept="image/*,.pdf" multiple onfiles={handleFiles} onerror={handleError} />

{#if fileNames.length}
	<p class="text-surface-z6 mt-3 text-sm">
		Accepted: <strong>{fileNames.join(', ')}</strong>
	</p>
{/if}
{#if errors.length}
	<p class="text-red-500 mt-2 text-sm">{errors.join('; ')}</p>
{/if}
