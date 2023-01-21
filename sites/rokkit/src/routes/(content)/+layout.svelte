<script>
	import { page } from '$app/stores'
	import { Accordion, Link } from '@rokkit/core'
	import { list } from '@rokkit/utils'

	/** @type {import('./$types').PageData} */
	export let data

	const menu = list(data.components).groupBy('category')

	const filtered = menu.filtered
	const fields = { text: 'name', isOpen: 'open' }
	const using = { link: Link }

	let selected

	function matchPath(path, items) {
		let current = items.filter((x) => x.url === path)
		// if (typeof window !== 'undefined') {
		selected = current.length ? current[0] : null
		let group = $filtered.find(
			(x) => x.data.findIndex((y) => y === selected) > -1
		)
		group['open'] = true
	}

	$: matchPath($page.url.pathname, data.components)
	// $: items = getMenuItems(data.params.slug)
</script>

<section class="flex w-full flex-grow px-2 pb-2 gap-1 overflow-hidden">
	<!-- {JSON.stringify($filtered, null, 2)} -->
	<aside class="flex flex-col w-80 p-4 h-full overflow-hidden rounded-lg">
		<Accordion
			items={$filtered}
			{fields}
			{using}
			bind:value={selected}
			class="gap-1"
		/>
	</aside>
	<content
		class="flex flex-col items-center flex-grow px-4 overflow-hidden rounded-lg"
		><slot /></content
	>
</section>
<!-- <Sidebar {items} /> -->
