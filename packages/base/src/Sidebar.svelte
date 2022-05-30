<script>
	import Menu from './Menu.svelte'

	export let items
	export let activePage
</script>

<aside class="sidebar">
	<slot name="header" />
	<Menu {items} {activePage} />
	<slot name="footer" />
</aside>

<style lang="postcss">
	aside {
		@apply flex flex-col p-8 h-full w-80 flex-shrink-0;
	}
</style>
