<script>
	import 'uno.css';
	import '@unocss/reset/tailwind.css';
	import '../app.css';
	import '../config';
	import { List, Link } from '@sparsh-ui/list';
	import { page } from '$app/stores';

	let items = [
		{
			text: 'Home',
			url: '/'
		},
		{
			text: 'List',
			url: '/list'
		},
		{
			text: 'Tree',
			url: '/tree'
		},
		{
			text: 'Nested List',
			url: '/nested'
		},
		{
			text: 'Accordion',
			url: '/accordion'
		}
	];
	const fields = { id: 'url' };
	const using = { default: Link };
</script>

<aside class="flex flex-col flex-shrink-0 flex-grow-0 w-80 sidebar">
	<header
		class="flex flex-col h-14 justify-center px-4 text-lg border-b bg-gray-200 border-gray-300 text-xl"
	>
		Components
	</header>
	<List {items} {using} {fields} activeId={$page.url.pathname} class="menu" />
</aside>
<main class="flex flex-grow bg-grey-300">
	<slot />
</main>
