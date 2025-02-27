<script>
	import { setContext } from 'svelte'
	import Preview from './Preview.svelte'
	import Notes from './Notes.svelte'

	let { data } = $props()
	let tutorial = $state(data.tutorial)
	setContext('tutorial', () => tutorial)
	$effect(() => {
		tutorial = data.tutorial
	})
</script>

<container class="flex h-full w-full flex-row">
	<Notes />
	<Preview />
</container>
