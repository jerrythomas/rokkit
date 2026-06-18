<script lang="ts">
	import type { Component } from 'svelte'
	import type { SVGAttributes } from 'svelte/elements'
	import { uniq } from 'ramda'

	type PatternComponentProps = {
		size?: number
		fill?: string
		stroke?: string
	}

	type Pattern = {
		id: string
		component: Component<PatternComponentProps>
		fill?: string
		stroke?: string
	}

	type Props = {
		size?: number
		patternUnits?: SVGAttributes<SVGPatternElement>['patternUnits']
		patterns?: Pattern[]
	}

	let { size = 10, patternUnits = 'userSpaceOnUse', patterns = [] }: Props = $props()

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
