<script>
	import 'uno.css';
	import '../app.css';

	import Background from './Background.svelte';
	import Header from './Header.svelte';
	import { themable } from '@rokkit/core/actions';
</script>

<main use:themable class="flex flex-col w-full h-full relative">
	<Background />
	<Header />
	<slot />
</main>
