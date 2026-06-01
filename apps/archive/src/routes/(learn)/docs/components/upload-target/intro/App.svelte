<script>
	// @ts-nocheck
	import { UploadTarget } from '@rokkit/ui'

	let fileNames = $state([])

	function handleFiles(files) {
		fileNames = files.map((f) => f.name)
	}
</script>

<UploadTarget onfiles={handleFiles} multiple />

{#if fileNames.length}
	<p class="text-surface-z6 mt-3 text-sm">
		Received: <strong>{fileNames.join(', ')}</strong>
	</p>
{/if}
