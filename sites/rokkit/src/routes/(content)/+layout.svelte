<script>
	import { page } from '$app/stores'
	import { Accordion, Link } from '@rokkit/core'
	import { list } from '@rokkit/utils'

	export let data

	let prefix = $page.url.pathname.split('/')[1]
	const menu = list(
		data.components.map((m) => ({
			...m,
			url: '/' + prefix + '/' + m.name.toLowerCase(),
			component: 'link'
		}))
	).groupBy('category')

	const filtered = menu.filtered
	const fields = { text: 'name' }
	const using = { link: Link }
	// $: items = getMenuItems(data.params.slug)
</script>

<section class="flex w-full h-full overflow-hidden">
	<!-- {JSON.stringify($filtered)} -->
	<aside class="flex flex-col w-80 px-4 h-full overflow-y-scroll">
		<Accordion items={$filtered} {fields} {using} />
	</aside>
	<content><slot /></content>
</section>
<!-- <Sidebar {items} /> -->
