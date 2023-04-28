<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { Tree, findValueFromPath } from '@rokkit/core'
	import Sidebar from './Sidebar.svelte'

	const fields = {
		text: 'title',
		children: 'children',
		isOpen: 'isOpen',
		key: 'key'
	}
	const icons = { opened: 'accordion-opened', closed: 'accordion-closed' }

	export let data
	/** @type {any} */
	let value

	function handleSelect(event) {
		if (!event.detail.children && event.detail.route) {
			goto('/tutorial/' + event.detail.route)
		}
	}
	$: value = value ?? findValueFromPath($page.params.slug, data.menu, fields)
</script>

<main class="flex w-full h-full flex-grow overflow-hidden relative">
	<Sidebar>
		<Tree
			items={data.menu}
			{fields}
			{icons}
			bind:value
			on:select={handleSelect}
		/>
	</Sidebar>
	<content class="flex flex-col w-full">
		<slot />
	</content>
</main>
