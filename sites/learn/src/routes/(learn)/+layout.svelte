<script>
	import Sidebar from './Sidebar.svelte'
	import { Tree } from '@rokkit/elements'

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 * @property {import('svelte').Component}  children
	 */
	/** @type {Props} */
	let { data, children } = $props()
	let value = $state(null)
	function handleSelect(event) {
		console.log('Selected item:', event.detail)
	}
</script>

<svelte:head>
	<title>Learn to use Rokkit</title>
</svelte:head>
<main class="relative flex h-full w-full flex-grow overflow-hidden">
	<Sidebar>
		<Tree items={data.menu} mapping={data.mapping} bind:value on:select={handleSelect} />
	</Sidebar>
	<content class="relative flex w-full flex-col">
		{@render children?.()}
	</content>
</main>
