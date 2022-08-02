<script>
	import Icon from '../layout/Icon.svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let search
	export let searchable = true
	export let editable = false
</script>

<toolbar class="flex flex-row w-full items-center">
	{#if searchable}
		<search class="flex flex-row flex-grow">
			<Icon name="search" />
			<input
				type="search"
				bind:value={search}
				class="rounded-r-full px-3 leading-loose"
				placeholder="search"
			/>
		</search>
	{/if}
	{#if editable}
		<Icon name="clear" on:click={() => dispatch('clear')} />
		<Icon name="delete" on:click={() => dispatch('delete')} />
		<Icon name="add" on:click={() => dispatch('add')} />
	{/if}
</toolbar>
