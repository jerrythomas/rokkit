<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'

	import '../app.scss'
	import { menu } from '../config'
	import { Accordion, Link, Sidebar } from '@sparsh-ui/core'
	import { page } from '$app/stores'

	const fields = { id: 'url' }
	const using = { default: Link }
	$: activeItem = menu.filter((m) => m.url == $page.url.pathname)[0]
</script>

<Sidebar>
	<div class="flex flex-col justify-center" slot="header">Components</div>
	<scroll class="flex flex-col flex-shrink-0 overflow-hidden">
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

<main class="flex flex-col flex-grow bg-grey-300">
	<slot />
</main>
