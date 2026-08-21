<script lang="ts">
	import Plot from '../../src/Plot.svelte'
	import Radar from '../../src/geoms/Radar.svelte'

	/**
	 * Two nested series: 'outer' is strictly larger than 'inner' on every axis. This is the
	 * configuration paint order exists for — if fills and strokes were paired up per series,
	 * the inner polygon's outline would be buried under the outer polygon's fill. With
	 * fills-then-strokes across the whole set, both outlines stay visible.
	 *
	 * Also the fixture for the alpha check: overlapping fills at full opacity would hide
	 * every series but the topmost, so `preset.opacity.radar` (0.25) must actually reach the
	 * rendered fill.
	 */
	const SIZE = 300

	const data = [
		{ metric: 'a', score: 10, team: 'outer' },
		{ metric: 'b', score: 10, team: 'outer' },
		{ metric: 'c', score: 10, team: 'outer' },
		{ metric: 'a', score: 3, team: 'inner' },
		{ metric: 'b', score: 3, team: 'inner' },
		{ metric: 'c', score: 3, team: 'inner' }
	]

	const axes = [
		{ key: 'a', domain: [0, 10] as [number, number] },
		{ key: 'b', domain: [0, 10] as [number, number] },
		{ key: 'c', domain: [0, 10] as [number, number] }
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
		<Radar axis="metric" value="score" series="team" {axes} />
	</Plot>
</div>
