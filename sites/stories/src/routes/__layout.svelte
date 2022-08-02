<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'

	import '../app.scss'
	import { menu } from '../config'
	import { List, Link } from '@sparsh-ui/core'
	import { page } from '$app/stores'

	const fields = { id: 'url' }
	const using = { default: Link }
	$: activeItem = menu.filter((m) => m.url == $page.url.pathname)[0]
</script>

<aside class="flex flex-col flex-shrink-0 flex-grow-0 w-60 sidebar">
	<header class="flex flex-col justify-center">Components</header>
	<List items={menu} {using} {fields} {activeItem} class="menu" />
</aside>
<main class="flex flex-col flex-grow bg-grey-300">
	<slot />
</main>
