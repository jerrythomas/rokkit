<script>
	// import Icon from '../layout/Icon.svelte'
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from 'rokkit/utils'

	const dispatch = createEventDispatcher()

	export let search
	export let searchable = true
	export let editable = false

	const actionIcons = defaultStateIcons.action
</script>

<toolbar class="w-full flex flex-row items-center">
	{#if searchable}
		<search class="flex flex-grow flex-row">
			<icon class={actionIcons.search} />
			<input
				type="search"
				bind:value={search}
				class="rounded-r-full px-3 leading-loose"
				placeholder="search"
			/>
		</search>
	{/if}
	{#if editable}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<icon class={actionIcons.clear} on:click={() => dispatch('clear')} />
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<icon class={actionIcons.remove} on:click={() => dispatch('remove')} />
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<icon class={actionIcons.add} on:click={() => dispatch('add')} />
	{/if}
</toolbar>
