<script>
	import Preview from './Preview.svelte'
	import Notes from './Notes.svelte'

	let { data } = $props()
	let story = $derived(data.tutorial)
</script>

<container class="flex h-full w-full flex-row">
	<Notes {story} />
	<Preview {story} />
</container>
