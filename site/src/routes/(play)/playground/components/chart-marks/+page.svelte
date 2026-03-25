<script>
	// @ts-nocheck
	import PlaySection from '$lib/components/PlaySection.svelte'
	import Shape from '@rokkit/chart/symbols/Shape.svelte'

	const SYMBOL_NAMES = ['circle', 'square', 'triangle', 'diamond', 'plus', 'asterisk', 'cross', 'heart', 'star']

	const COLORS = [
		{ name: 'blue',    fill: '#93c5fd', stroke: '#1d4ed8' },
		{ name: 'emerald', fill: '#6ee7b7', stroke: '#065f46' },
		{ name: 'rose',    fill: '#fda4af', stroke: '#9f1239' },
		{ name: 'amber',   fill: '#fcd34d', stroke: '#92400e' },
		{ name: 'violet',  fill: '#c4b5fd', stroke: '#4c1d95' },
		{ name: 'sky',     fill: '#7dd3fc', stroke: '#0c4a6e' },
		{ name: 'pink',    fill: '#f9a8d4', stroke: '#831843' },
		{ name: 'teal',    fill: '#5eead4', stroke: '#134e4a' },
		{ name: 'orange',  fill: '#fdba74', stroke: '#7c2d12' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-10 p-6 w-full self-start">

			<!-- ── Symbols ──────────────────────────────────────────── -->
			<section>
				<h4 class="text-surface-z5 m-0 mb-4 text-xs uppercase tracking-widest font-semibold">Symbols</h4>
				<div class="flex flex-wrap gap-6">
					{#each SYMBOL_NAMES as name, i}
						{@const color = COLORS[i % COLORS.length]}
						<div class="flex flex-col items-center gap-2">
							<svg width="48" height="48" viewBox="0 0 48 48">
								<Shape x={12} y={24} size={1} {name} fill={color.fill} stroke={color.stroke} thickness={1} />
								<Shape x={36} y={24} size={1} {name} fill="none" stroke={color.stroke} thickness={1.5} />
							</svg>
							<span class="text-surface-z5 text-xs">{name}</span>
						</div>
					{/each}
				</div>
			</section>

		</div>
	{/snippet}
</PlaySection>
