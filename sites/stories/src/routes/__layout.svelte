<script>
	import 'uno.css';
	import '@unocss/reset/tailwind.css';
	import '../app.css';
	import { menu } from '../config';
	import { List, Link } from '@sparsh-ui/list';
	import { page } from '$app/stores';

	const fields = { id: 'url' };
	const using = { default: Link };
	$: activeItem = menu.filter((m) => m.url == $page.url.pathname)[0];
</script>

<aside class="flex flex-col flex-shrink-0 flex-grow-0 w-80 sidebar">
	<header
		class="flex flex-col h-14 justify-center px-4 text-lg border-b bg-gray-200 border-gray-300 text-xl"
	>
		Components
	</header>
	<List items={menu} {using} {fields} {activeItem} class="menu" />
</aside>
<main class="flex flex-grow bg-grey-300">
	<slot />
</main>
