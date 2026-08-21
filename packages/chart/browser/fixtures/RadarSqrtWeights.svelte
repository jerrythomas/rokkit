<script module lang="ts">
	// Module scope, so the spec can import these and assert against the same inputs the
	// fixture renders — an instance-script `export const` is not a module export in runes mode.
	export const SIZE = 320
	export const WEIGHTS = [3, 1, 2]
	export const VALUES = [8, 8, 2]
</script>

<script lang="ts">
	import Plot from '../../src/Plot.svelte'
	import Radar from '../../src/geoms/Radar.svelte'

	/**
	 * Unequal weights + the sqrt radius transform — the configuration the transform exists
	 * for. Each axis owns a wedge proportional to its weight, and under sqrt the sector area
	 * (½·θ·r²) comes out proportional to weight × value, so a heavily-weighted axis cannot
	 * dominate the shape purely by being wide.
	 *
	 * Weights 3/1/2 with values 8/8/2 on a shared [0, 8] domain give products 24 / 8 / 4 —
	 * all distinct, and deliberately NOT ordered the same as the weights alone (3,1,2) or the
	 * values alone (8,8,2), so a broken implementation that tracked only one of the two
	 * factors would produce a different ranking.
	 */
	const data = [
		{ metric: 'a', score: VALUES[0], team: 'T' },
		{ metric: 'b', score: VALUES[1], team: 'T' },
		{ metric: 'c', score: VALUES[2], team: 'T' }
	]

	const axes = [
		{ key: 'a', domain: [0, 8] as [number, number], weight: WEIGHTS[0] },
		{ key: 'b', domain: [0, 8] as [number, number], weight: WEIGHTS[1] },
		{ key: 'c', domain: [0, 8] as [number, number], weight: WEIGHTS[2] }
	]
</script>

<div data-radar-harness style="position: relative; width: {SIZE}px; height: {SIZE}px;">
	<Plot
		{data}
		width={SIZE}
		height={SIZE}
		axes={false}
		grid={false}
		legend={false}
		animate={false}
		margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	>
		<Radar axis="metric" value="score" series="team" {axes} options={{ radiusScale: 'sqrt' }} />
	</Plot>
</div>
