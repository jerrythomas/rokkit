<script>
	import { uniq } from 'ramda'

	export let size = 10
	export let patternUnits = 'userSpaceOnUse'
	/** @type {Array<import('./types').Pattern>} */
	export let patterns = []

	$: names = uniq(patterns.map(({ name }) => name))
</script>

{#if names.length < patterns.length}
	<error>
		Patterns should be an array and should have unique names for each pattern
	</error>
{:else if patterns.length > 0}
	<defs>
		{#each patterns as { name, component, fill, stroke }}
			<pattern id={name} {patternUnits} width={size} height={size}>
				<svelte:component this={component} {size} {fill} {stroke} />
			</pattern>
		{/each}
	</defs>
{/if}
