<script>
	import { uniq } from 'ramda'

	let {
		size = 10,
		patternUnits = 'userSpaceOnUse',
		/** @type {Array<import('./types').Pattern>} */
		patterns = []
	} = $props()

	let names = $derived(uniq(patterns.map(({ id }) => id)))
</script>

{#if names.length < patterns.length}
	<error> Patterns should be an array and should have unique names for each pattern </error>
{:else if patterns.length > 0}
	<defs>
		{#each patterns as { id, component: Component, fill, stroke }, index (index)}
			<pattern {id} {patternUnits} width={size} height={size}>
				<Component {size} {fill} {stroke} />
			</pattern>
		{/each}
	</defs>
{/if}
