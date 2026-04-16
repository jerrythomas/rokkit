<script>
	import { buildSymbolPath } from './lib/brewing/marks/points.js'

	/**
	 * Standalone chart legend — HTML-based, usable outside of Plot context.
	 * Accepts `groups` from a chart's brewer or from multiple charts for shared legends.
	 *
	 * @type {{
	 *   groups: Array<{
	 *     type?: 'color' | 'pattern' | 'symbol',
	 *     label?: string,
	 *     items: Array<{
	 *       key: string,
	 *       label: string,
	 *       fill?: string,
	 *       stroke?: string,
	 *       patternId?: string,
	 *       shape?: string,
	 *     }>
	 *   }>,
	 *   orientation?: 'horizontal' | 'vertical' | 'wrap',
	 *   gradient?: { style: string, min: string, max: string } | null,
	 *   swatchStyle?: 'fill' | 'line' | 'point',
	 * }}
	 */
	let {
		groups = [],
		orientation = 'horizontal',
		gradient = null,
		swatchStyle = 'fill'
	} = $props()
</script>

<div
	class="chart-legend"
	class:vertical={orientation === 'vertical'}
	class:horizontal={orientation === 'horizontal' || orientation === 'wrap'}
	data-chart-legend
>
	{#if gradient}
		<div class="gradient-section">
			<div class="gradient-bar" style={gradient.style} data-chart-legend-gradient></div>
			<div class="gradient-labels">
				<span>{gradient.min}</span>
				<span>{gradient.max}</span>
			</div>
		</div>
	{:else}
		{#each groups as group, gi (gi)}
			{#if group.label}
				<div class="group-label" data-chart-legend-group-label>{group.label}</div>
			{/if}
			<div class="legend-items" class:vertical={orientation === 'vertical'}>
				{#each group.items as item (item.key)}
					<div class="legend-item" data-chart-legend-item>
						{#if swatchStyle === 'line'}
							<svg width="24" height="14" data-chart-legend-swatch>
								<line
									x1="2" y1="7" x2="22" y2="7"
									stroke={item.stroke ?? item.fill}
									stroke-width="2"
									stroke-linecap="round"
								/>
								{#if item.shape}
									<path
										transform="translate(12,7)"
										d={buildSymbolPath(item.shape, 4)}
										fill={item.stroke ?? item.fill}
									/>
								{/if}
							</svg>
						{:else if swatchStyle === 'point' && item.shape}
							<svg width="14" height="14" data-chart-legend-swatch>
								<path
									transform="translate(7,7)"
									d={buildSymbolPath(item.shape, 5)}
									fill={item.fill}
								/>
							</svg>
						{:else if item.patternId}
							<svg width="14" height="14" data-chart-legend-swatch>
								<rect width="14" height="14" fill={item.fill} />
								<rect width="14" height="14" fill="url(#{item.patternId})" />
							</svg>
						{:else}
							<span class="swatch" style:background-color={item.fill} data-chart-legend-swatch></span>
						{/if}
						<span class="label" data-chart-legend-label>{item.label}</span>
					</div>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.chart-legend {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 12px;
		overflow-y: auto;
	}
	.legend-items {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.legend-items.vertical {
		flex-direction: column;
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.swatch {
		display: inline-block;
		width: 14px;
		height: 14px;
		border-radius: 2px;
		flex-shrink: 0;
	}
	.group-label {
		font-weight: 600;
		font-size: 11px;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.gradient-section {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.gradient-bar {
		width: 180px;
		height: 14px;
		border-radius: 2px;
	}
	.gradient-labels {
		display: flex;
		justify-content: space-between;
		width: 180px;
		font-size: 11px;
		opacity: 0.8;
	}
</style>
