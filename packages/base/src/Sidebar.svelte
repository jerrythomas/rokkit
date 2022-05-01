<script>
	import Menu from './Menu.svelte'

	export let items
</script>

<aside
	class="bg-accent-200 text-accent-500 p-8 h-full w-80 space-y-6 flex-shrink-0"
>
	<slot name="header" />
	<Menu {items} />
	<slot name="footer" />
</aside>
