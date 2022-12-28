<script>
	import { FieldSet } from '@rokkit/input'
	import FormFields from './FormFields.svelte'

	let className = ''
	export { className as class }
	export let value
	export let mapping
	export let label
	export let using
</script>

{#if typeof value === 'object'}
	<FieldSet {label} class={className}>
		<FormFields bind:data={value} {mapping} {using} />
	</FieldSet>
{:else}
	<error>Property `value` should be an object.</error>
{/if}
