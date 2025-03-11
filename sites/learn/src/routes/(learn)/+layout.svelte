<script>
	import Sidebar from './Sidebar.svelte'
	import { Tree } from '@rokkit/ui'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { findItemInMenu } from '$lib'
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 * @property {import('svelte').Component}  children
	 */
	/** @type {Props} */
	let { data, children } = $props()
	let items = $state(data.menu)
	let value = $derived(findItemInMenu(data.menu, page.url))

	function handleSelect(detail) {
		if (detail.node.route) goto(`/${data.params.segment}/${detail.node.route}`)
	}
</script>

<svelte:head>
	<title>Learn to use Rokkit</title>
</svelte:head>
<main class="relative flex h-full w-full overflow-hidden">
	<Sidebar>
		<Tree
			bind:items
			{value}
			mapping={data.mapping}
			onselect={handleSelect}
			keys={['key', 'route']}
		/>
	</Sidebar>
	<content class="relative flex w-full flex-col">
		{@render children?.()}
	</content>
</main>
