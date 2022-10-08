<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'

	import '../app.scss'
	import { menu } from '../config'
	import { Accordion, Link, Sidebar } from '@svelte-spice/core'
	import { page } from '$app/stores'

	const fields = { id: 'url' }
	const using = { default: Link }
	$: activeItem = menu.filter((m) => m.url == $page.url.pathname)[0]
</script>

<Sidebar>
	<div class="flex flex-col justify-center p-4" slot="header">Components</div>
	<scroll>
		<Accordion
			items={menu}
			{using}
			{fields}
			{activeItem}
			autoClose
			class="menu"
		/>
	</scroll>
</Sidebar>

<main class="flex flex-col w-full bg-grey-300 overflow-scroll">
	<slot />
</main>
