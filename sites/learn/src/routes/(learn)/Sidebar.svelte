<script>
	import { run } from 'svelte/legacy';

	import { getContext } from 'svelte'
	import { Icon } from '@rokkit/ui'
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
	let site = getContext('site')
	/**
	 * @type {HTMLElement}
	 */
	let sidebar = $state()
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
	run(() => {
		if (sidebar) toggle($site)
	});
</script>

<aside
	bind:this={sidebar}
	class="-translate-x-full absolute left-0 top-0 w-full flex flex-shrink-0 flex-col md:w-1/2 lg:w-80"
	class:lg:relative={$site.sidebar}
>
	<nav class="h-10 w-full flex items-center gap-2 border-b border-b-neutral-inset">
		<Icon
			name="i-rokkit:action-cross"
			role="button"
			class="border-r border-r-neutral-inset rounded-none"
			on:click={() => ($site.sidebar = false)}
		/>
		<input type="search" placeholder="search" bind:value={search} class="embedded" />
	</nav>
	{@render children?.()}
</aside>

<style>
	aside {
		@apply h-full z-5 overflow-auto text-xs;
		@apply border-r border-neutral-inset bg-neutral-base;
		@apply transform ease-in-out;
	}
</style>
