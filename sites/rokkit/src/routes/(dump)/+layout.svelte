<script>
	import Sidebar from './Sidebar.svelte'
	import { Accordion, Link } from '@rokkit/core'
	import { page } from '$app/stores'
	import { menu } from './data'

	let value
	let using = { default: Link }
	let items

	function filterMenu(menu, prefix) {
		let result = menu
			.map((x) => ({
				...x,
				data: x.data.filter((y) => y.url.startsWith('/' + prefix))
			}))
			.filter((x) => x.data.length > 0)
		// console.log('prefix', prefix, result)
		return result
	}
	function setValueFromPath(url) {
		let i = 0
		while (i < items.length) {
			const matchIndex = items[i].data.findIndex(
				(item) => item.url === url.pathname
			)
			if (matchIndex > -1) {
				value = items[i].data[matchIndex]
				items[i]._open = true
			}
			i += 1
		}
	}
	$: prefix = $page.url.pathname.split('/')[1]
	$: items = filterMenu(menu, prefix)
	$: setValueFromPath($page.url)
</script>

<main class="flex w-full h-full flex-grow overflow-hidden relative">
	<Sidebar>
		<Accordion {items} bind:value {using} />
	</Sidebar>
	<content class="flex flex-col w-full">
		<slot />
	</content>
</main>
