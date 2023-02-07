<script>
	import MultiFileViewer from '$lib/MultiFileViewer.svelte'
	import { getContext } from 'svelte'

	const story = getContext('story')
</script>

<content class="flex flex-col overflow-hidden">
	<MultiFileViewer
		items={$story.current.files}
		fields={{ text: 'file' }}
		class="file-viewer"
		value={$story.current.files[0]}
	/>
</content>
