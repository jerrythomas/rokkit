<script lang="ts">
	/**
	 * A clip path the size of the plot area, for geoms whose shapes can legitimately extend
	 * past the domain — a region polygon drawn beyond the axes, a density ring whose kernel
	 * reaches past the last point. Clipped, they stop at the axes instead of painting over them.
	 */
	import { getContext } from 'svelte'
	import type { PlotState } from '../../PlotState.svelte.js'

	let { id }: { id: string } = $props()
	const plotState = getContext<PlotState>('plot-state')
</script>

<defs>
	<clipPath {id}>
		<rect x="0" y="0" width={plotState.innerWidth} height={plotState.innerHeight} />
	</clipPath>
</defs>
