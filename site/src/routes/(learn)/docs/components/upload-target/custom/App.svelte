<script>
	// @ts-nocheck
	import { UploadTarget } from '@rokkit/ui'

	let fileNames = $state([])

	function handleFiles(files) {
		fileNames = files.map((f) => f.name)
	}
</script>

<UploadTarget onfiles={handleFiles} multiple>
	{#snippet content(dragging)}
		<div
			class="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors"
			class:border-blue-500={dragging}
			class:bg-blue-50={dragging}
		>
			<span class={dragging ? 'i-glyph:download' : 'i-glyph:cloud-upload'} class:text-2xl={true}
			></span>
			<p class="m-0 text-sm">
				{dragging ? 'Release to upload' : 'Drag files here or click to browse'}
			</p>
		</div>
	{/snippet}
</UploadTarget>

{#if fileNames.length}
	<p class="text-surface-z6 mt-3 text-sm">
		Received: <strong>{fileNames.join(', ')}</strong>
	</p>
{/if}
