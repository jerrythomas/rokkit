<script>
	import { createEventDispatcher } from 'svelte'
	import Tabs from './Tabs.svelte'
	import FormFields from './FormFields.svelte'

	const dispatch = createEventDispatcher()

	export let id
	export let value
	export let fields
	export let allowAdd = false
	export let allowClose = false
	// export let limit
	export let label

	function onChange() {
		value = [...value]
		dispatch('change', { value })
	}

	let item = value[0]
</script>

{#if Array.isArray(value)}
	<tab-edit {id} class="flex flex-col w-full">
		{#if label}
			<label for={id}>{label}</label>
		{/if}
		<Tabs bind:items={value} {allowAdd} {allowClose} bind:activeItem={item} />
		<content>
			<FormFields bind:data={item} {fields} on:change={onChange} />
		</content>
	</tab-edit>
{:else}
	<error>Property `value` should be an array of objects.</error>
{/if}
