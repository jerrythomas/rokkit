<script>
	// @ts-nocheck
	import PlaySection from '$lib/components/PlaySection.svelte'
	import Shape from '@rokkit/chart/symbols/Shape.svelte'
	import {
		Brick,
		Checkerboard,
		CircleGrid,
		Circles,
		CrossDot,
		CrossHatch,
		CurvedWave,
		DiagonalLines,
		DiamondOutline,
		Diamonds,
		Dots,
		Hexagons,
		HorizontalLines,
		OutlineCircles,
		ScatteredTriangles,
		Tile,
		Triangles,
		VerticalLines,
		Waves,
		Zigzag
	} from '@rokkit/chart/patterns'

	const SYMBOL_NAMES = ['circle', 'square', 'triangle', 'diamond', 'plus', 'asterisk', 'cross', 'heart', 'star']

	const PATTERNS = [
		{ name: 'Dots', Component: Dots },
		{ name: 'CrossHatch', Component: CrossHatch },
		{ name: 'Waves', Component: Waves },
		{ name: 'Brick', Component: Brick },
		{ name: 'Triangles', Component: Triangles },
		{ name: 'Circles', Component: Circles },
		{ name: 'Tile', Component: Tile },
		{ name: 'OutlineCircles', Component: OutlineCircles },
		{ name: 'CurvedWave', Component: CurvedWave },
		{ name: 'DiagonalLines', Component: DiagonalLines },
		{ name: 'HorizontalLines', Component: HorizontalLines },
		{ name: 'VerticalLines', Component: VerticalLines },
		{ name: 'Zigzag', Component: Zigzag },
		{ name: 'Checkerboard', Component: Checkerboard },
		{ name: 'Diamonds', Component: Diamonds },
		{ name: 'Hexagons', Component: Hexagons },
		{ name: 'ScatteredTriangles', Component: ScatteredTriangles },
		{ name: 'CrossDot', Component: CrossDot },
		{ name: 'CircleGrid', Component: CircleGrid },
		{ name: 'DiamondOutline', Component: DiamondOutline }
	]

	// Sample palette colors (light mode)
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

	const PATTERN_SIZE = 40
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-10 p-6 w-full self-start">

			<!-- Symbols -->
			<section>
				<h4 class="text-surface-z5 m-0 mb-4 text-xs uppercase tracking-widest font-semibold">Symbols</h4>
				<div class="flex flex-wrap gap-6">
					{#each SYMBOL_NAMES as name, i}
						{@const color = COLORS[i % COLORS.length]}
						<div class="flex flex-col items-center gap-2">
							<svg width="48" height="48" viewBox="0 0 48 48">
								<!-- Solid fill -->
								<Shape x={12} y={24} size={1} {name} fill={color.fill} stroke={color.stroke} thickness={1} />
								<!-- Stroke only -->
								<Shape x={36} y={24} size={1} {name} fill="none" stroke={color.stroke} thickness={1.5} />
							</svg>
							<span class="text-surface-z5 text-xs">{name}</span>
						</div>
					{/each}
				</div>
			</section>

			<!-- Patterns — one color per pattern -->
			<section>
				<h4 class="text-surface-z5 m-0 mb-4 text-xs uppercase tracking-widest font-semibold">Patterns</h4>
				<div class="flex flex-wrap gap-6">
					{#each PATTERNS as { name, Component }, i}
						{@const color = COLORS[i % COLORS.length]}
						<div class="flex flex-col items-center gap-2">
							<svg width={PATTERN_SIZE} height={PATTERN_SIZE}>
								<defs>
									<pattern id="demo-pat-{name}" patternUnits="userSpaceOnUse" width="10" height="10">
										<rect width="10" height="10" fill={color.fill} />
										<Component fill={color.stroke} stroke={color.stroke} size={10} />
									</pattern>
								</defs>
								<rect width={PATTERN_SIZE} height={PATTERN_SIZE} fill="url(#demo-pat-{name})" rx="4" />
							</svg>
							<span class="text-surface-z5 text-xs">{name}</span>
						</div>
					{/each}
				</div>
			</section>

			<!-- Patterns × Colors grid -->
			<section>
				<h4 class="text-surface-z5 m-0 mb-4 text-xs uppercase tracking-widest font-semibold">Patterns × Colors</h4>
				<div class="overflow-x-auto">
					<table class="border-collapse text-xs text-surface-z5">
						<thead>
							<tr>
								<th class="pr-3 pb-2 text-left font-medium"></th>
								{#each COLORS as color}
									<th class="pb-2 px-1 font-medium text-center">{color.name}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each PATTERNS as { name, Component }, pi}
								<tr>
									<td class="pr-3 py-1 font-medium">{name}</td>
									{#each COLORS as color, ci}
										<td class="px-1 py-1">
											<svg width="24" height="24">
												<defs>
													<pattern id="grid-pat-{pi}-{ci}" patternUnits="userSpaceOnUse" width="8" height="8">
														<rect width="8" height="8" fill={color.fill} />
														<Component fill={color.stroke} stroke={color.stroke} size={8} />
													</pattern>
												</defs>
												<rect width="24" height="24" fill="url(#grid-pat-{pi}-{ci})" rx="3" />
											</svg>
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<!-- Color palette -->
			<section>
				<h4 class="text-surface-z5 m-0 mb-4 text-xs uppercase tracking-widest font-semibold">Color Palette</h4>
				<div class="flex flex-wrap gap-4">
					{#each COLORS as color}
						<div class="flex flex-col items-center gap-1">
							<div class="flex gap-1">
								<div class="w-8 h-8 rounded" style="background-color: {color.fill}; border: 1px solid {color.stroke}"></div>
								<div class="w-8 h-8 rounded" style="background-color: {color.stroke}"></div>
							</div>
							<span class="text-surface-z5 text-xs">{color.name}</span>
						</div>
					{/each}
				</div>
			</section>

		</div>
	{/snippet}
</PlaySection>
