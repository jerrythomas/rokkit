<script>
	import FormFields from './FormFields.svelte'

	export let id
	export let value
	export let fields
	export let label
</script>

{#if typeof value === 'object'}
	<edit-obj {id} class="flex flex-col w-full">
		{#if label}
			<label for={id}>{label}</label>
		{/if}
		<content {id}>
			<FormFields bind:data={value} {fields} />
		</content>
	</edit-obj>
{:else}
	<error>Property `value` should be an object.</error>
{/if}
