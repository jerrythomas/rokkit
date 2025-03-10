<script>
	import { getContext } from 'svelte'
	import { Icon } from '@rokkit/ui'
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props()
	let site = getContext('site')()
	/**
	 * @type {HTMLElement}
	 */
	let sidebar = $state(null)
	let search = $state('')

	function toggle(site) {
		sidebar.classList.add('duration-200')
		if (site.sidebar) {
			sidebar.classList.remove('-translate-x-full')
		} else {
			sidebar.classList.add('-translate-x-full')
		}
		sidebar.classList.remove('duration-200')
	}
	$effect(() => {
		if (sidebar) toggle(site)
	})
</script>

<aside
	bind:this={sidebar}
	class="absolute left-0 top-0 flex w-full flex-shrink-0 -translate-x-full flex-col md:w-1/2 lg:w-80"
	class:lg:relative={site.sidebar}
>
	<nav class="border-b-neutral-inset flex h-10 w-full items-center gap-2 border-b">
		<Icon
			name="i-rokkit:action-cross"
			role="button"
			class="border-r-neutral-inset rounded-none border-r"
			on:click={() => (site.sidebar = false)}
		/>
		<input type="search" placeholder="search" bind:value={search} class="embedded" />
	</nav>
	{@render children?.()}
</aside>

<style>
	aside {
		@apply z-5 h-full overflow-auto text-xs;
		@apply border-neutral-inset bg-neutral-base border-r;
		@apply transform ease-in-out;
	}
</style>
