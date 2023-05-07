<script>
	import { getContext } from 'svelte'
	import { Icon } from '@rokkit/core'
	let site = getContext('site')
	/**
	 * @type {HTMLElement}
	 */
	let sidebar
	let search

	function toggle(site) {
		if (site.sidebar) {
			sidebar.classList.remove('-translate-x-full')
		} else {
			sidebar.classList.add('-translate-x-full')
		}
	}
	$: if (sidebar) toggle($site)
</script>

<aside
	bind:this={sidebar}
	class="flex flex-col gap-4 bg-skin-base h-full flex-shrink-0 w-full md:w-1/2 lg:w-80 bg-skin-base absolute top-0 left-0 -translate-x-full transform transition duration-200 ease-in-out z-5 border-r border-skin-subtle overflow-auto"
	class:lg:relative={$site.sidebar}
>
	<nav
		class="flex h-10 items-center w-full gap-2 border-b border-b-skin-subtle"
	>
		<Icon
			name="i-rokkit:action-cross"
			role="button"
			class="border-r border-r-skin-subtle"
			on:click={() => ($site.sidebar = false)}
		/>
		<input
			type="search"
			placeholder="search"
			bind:value={search}
			class="embedded"
		/>
	</nav>
	<slot />
</aside>
