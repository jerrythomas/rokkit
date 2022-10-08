<script>
	import Scrollable from './Scrollable.svelte'

	export let search = ''
</script>

<div class="flex flex-col overflow-hidden w-full searchable">
	<div class="flex flex-col flex-shrink-0 flex-grow px-4 py-2 quick-search">
		<input
			type="search"
			bind:value={search}
			class="rounded-full px-3 leading-loose"
			placeholder="search"
		/>
	</div>
	<Scrollable>
		<slot />
	</Scrollable>
</div>
