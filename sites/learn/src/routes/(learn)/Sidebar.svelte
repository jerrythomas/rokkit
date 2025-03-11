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
	class="lg:w-90 absolute left-0 top-0 block w-full -translate-x-full overflow-hidden md:w-1/2"
	class:lg:relative={site.sidebar}
>
	<!-- <nav
		class="border-b-neutral-inset flex h-10 w-full flex-shrink-0 flex-row items-center gap-2 border-b px-2 py-0 text-sm"
	>
		<Icon
			name="i-rokkit:action-cross"
			role="button"
			class="square rounded-none border-r border-none"
			onclick={() => (site.sidebar = false)}
		/>
		<input type="search" placeholder="search" bind:value={search} class="embedded" />
	</nav> -->
	{@render children?.()}
</aside>

<style>
	aside {
		@apply z-5 h-full overflow-hidden text-xs;
		@apply border-neutral-inset bg-neutral-base border-r;
		@apply transform ease-in-out;
	}
</style>
