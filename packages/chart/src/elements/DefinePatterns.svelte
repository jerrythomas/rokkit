<script>
	import { uniq } from 'ramda'

	
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [patternUnits]
	 * @property {Array<import('./types').Pattern>} [patterns]
	 */

	/** @type {Props} */
	let { size = 10, patternUnits = 'userSpaceOnUse', patterns = [] } = $props();

	let names = $derived(uniq(patterns.map(({ id }) => id)))
</script>

{#if names.length < patterns.length}
	<error> Patterns should be an array and should have unique names for each pattern </error>
{:else if patterns.length > 0}
	<defs>
		{#each patterns as { id, component, fill, stroke }}
			{@const SvelteComponent = component}
			<pattern {id} {patternUnits} width={size} height={size}>
				<SvelteComponent {size} {fill} {stroke} />
			</pattern>
		{/each}
	</defs>
{/if}
