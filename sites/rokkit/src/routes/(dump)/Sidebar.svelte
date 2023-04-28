<script>
	import { getContext } from 'svelte'
	let site = getContext('site')
	/**
	 * @type {HTMLElement}
	 */
	let sidebar

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
	class="flex flex-col flex-shrink-0 bg-skin-50 w-80 p-4 absolute inset-y-0 left-0 -translate-x-full transform transition duration-200 ease-in-out z-10 border-r border-skin-base"
	class:lg:relative={$site.sidebar}
>
	<slot />
</aside>
