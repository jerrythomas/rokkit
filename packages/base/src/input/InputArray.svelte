<script>
	import Tabs from './Tabs.svelte'
	import FormFields from './FormFields.svelte'

	export let id
	export let value
	export let fields
	export let add = false
	export let closeable = false
	// export let limit
	export let label

	let item = value[0]
	// $: console.log('input array', value)
</script>

{#if Array.isArray(value)}
	<tab-edit {id} class="flex flex-col w-full">
		{#if label}
			<label for={id}>{label}</label>
		{/if}
		<Tabs bind:items={value} {add} {closeable} bind:activeItem={item} />
		<content>
			<FormFields bind:data={item} {fields} />
		</content>
	</tab-edit>
{:else}
	<error>Property `value` should be an array of objects.</error>
{/if}
