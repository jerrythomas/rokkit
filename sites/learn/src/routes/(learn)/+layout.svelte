<script>
	import Sidebar from './Sidebar.svelte'
	import { Tree } from '@rokkit/ui'

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 * @property {import('svelte').Component}  children
	 */
	/** @type {Props} */
	let { data, children } = $props()
	let items = $state(data.menu)
	let value = $state(null)
	function handleSelect(data) {
		console.log('Selected item:', data)
	}
</script>

<svelte:head>
	<title>Learn to use Rokkit</title>
</svelte:head>
<main class="relative flex h-full w-full overflow-hidden">
	<Sidebar>
		<Tree bind:items bind:value mapping={data.mapping} onselect={handleSelect} />
	</Sidebar>
	<content class="relative flex w-full flex-col">
		{@render children?.()}
	</content>
</main>
