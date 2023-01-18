<script>
	import { page } from '$app/stores'
	import { Accordion, Link } from '@rokkit/core'
	import { list } from '@rokkit/utils'

	export let data

	const menu = list(data.menu).groupBy('category')

	const filtered = menu.filtered
	const fields = { text: 'name' }
	const using = { link: Link }
	// $: items = getMenuItems(data.params.slug)
</script>

<section
	class="flex flex-col w-full h-full items-center justify-center overflow-hidden"
>
	<!-- {JSON.stringify($filtered)} -->
	<!-- <aside class="flex flex-col w-80 px-4 h-full overflow-y-scroll">
		<Accordion items={$filtered} {fields} {using} />
	</aside> -->
	<!-- <content class="flex flex-col flex-grow px-4"><slot /></content> -->
	<slot />
</section>
<!-- <Sidebar {items} /> -->
