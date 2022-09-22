<script>
	import { createEventDispatcher } from 'svelte'
	import FormFields from './FormFields.svelte'
	import {Tabs} from '@jerrythomas/spice-list'

	const dispatch = createEventDispatcher()

	export let value
	export let fields
	export let allowAdd = false
	export let allowClose = false

	export let label

	function onChange() {
		value = [...value]
		dispatch('change', { value })
	}

	let item = value[0]
</script>

{#if Array.isArray(value)}
	<Tabs
		bind:items={value}
		bind:activeItem={item}
		title={label}
		{allowAdd}
		{allowClose}
	>
		<FormFields bind:data={item} {fields} on:change={onChange} />
	</Tabs>
{:else}
	<error>Property `value` should be an array of objects.</error>
{/if}
