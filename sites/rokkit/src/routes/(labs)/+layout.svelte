<script>
	import { goto } from '$app/navigation'
	import Sidebar from './Sidebar.svelte'
	import { Tree } from '@rokkit/core'
	export let data

	function handleSelect(event) {
		if (!event.detail.children && event.detail.route) {
			goto('/lab/' + event.detail.route)
			// console.log(event.detail.route)
		}
	}
	const fields = { text: 'title', children: 'children' }
	// $: console.log(data.menu)
</script>

<main class="flex w-full h-full flex-grow overflow-hidden relative">
	<Sidebar>
		<Tree items={data.menu} {fields} on:select={handleSelect} />
	</Sidebar>
	<content class="flex flex-col w-full">
		<slot />
	</content>
</main>
<!-- <main class="flex w-full">
	<aside class="min-w-80 border-r border-r-skin-subtle">
		<Tree items={data.menu} {fields} on:select={handleSelect} />
	</aside>
	<slot />
</main> -->
