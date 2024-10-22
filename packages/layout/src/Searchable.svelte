<script>
	import Scrollable from './Scrollable.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [search]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { search = $bindable(''), children } = $props();
</script>

<div class="searchable h-full w-full flex flex-col overflow-hidden">
	<div class="quick-search flex flex-shrink-0 flex-grow flex-col px-4 py-2">
		<input
			type="search"
			bind:value={search}
			class="rounded-full px-3 leading-loose"
			placeholder="search"
		/>
	</div>
	<Scrollable>
		{@render children?.()}
	</Scrollable>
</div>
