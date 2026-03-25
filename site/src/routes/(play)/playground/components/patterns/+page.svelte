<script>
	// @ts-nocheck
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { FormRenderer, InputSwatch } from '@rokkit/forms'
	import { PatternDef, PATTERNS } from '@rokkit/chart/patterns'

	const PATTERN_NAMES = Object.keys(PATTERNS)

	const COLORS = [
		{ name: 'blue',    fill: '#93c5fd', stroke: '#1d4ed8' },
		{ name: 'emerald', fill: '#6ee7b7', stroke: '#065f46' },
		{ name: 'rose',    fill: '#fda4af', stroke: '#9f1239' },
		{ name: 'amber',   fill: '#fcd34d', stroke: '#92400e' },
		{ name: 'violet',  fill: '#c4b5fd', stroke: '#4c1d95' },
		{ name: 'sky',     fill: '#7dd3fc', stroke: '#0c4a6e' },
		{ name: 'teal',    fill: '#5eead4', stroke: '#134e4a' },
		{ name: 'orange',  fill: '#fdba74', stroke: '#7c2d12' },
		{ name: 'slate',   fill: '#cbd5e1', stroke: '#334155' }
	]

	let props = $state({ shape: 'rect', colorMode: 'single', pickedName: 'blue' })

	const schema = {
		type: 'object',
		properties: {
			shape:     { type: 'string' },
			colorMode: { type: 'string' },
			pickedName:{ type: 'string' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/shape',
				label: 'Shape',
				props: { renderer: 'toggle', options: [{ label: 'Square', value: 'rect' }, { label: 'Circle', value: 'circle' }], size: 'sm' }
			},
			{
				scope: '#/colorMode',
				label: 'Color',
				props: { renderer: 'toggle', options: [{ label: 'Single', value: 'single' }, { label: 'Spread', value: 'spread' }], size: 'sm' }
			},
			{
				scope: '#/pickedName',
				label: 'Pick color',
				showWhen: { field: 'colorMode', equals: 'single' },
				props: { renderer: 'swatch', options: COLORS, fields: { label: 'name', value: 'name' }, shape: 'circle' }
			}
		]
	}

	const SWATCH = 72
	const TILE   = 10

	const picked = $derived(COLORS.find(c => c.name === props.pickedName) ?? COLORS[0])

	function colorFor(index) {
		return props.colorMode === 'spread' ? COLORS[index % COLORS.length] : picked
	}
</script>

<PlaySection>
	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} renderers={{ swatch: InputSwatch }} />
	{/snippet}

	{#snippet preview()}
		<div class="flex flex-wrap gap-6 p-6 self-start">
			{#each PATTERN_NAMES as name, pi}
				{@const color = colorFor(pi)}
				<div class="flex flex-col items-center gap-2">
					<svg width={SWATCH} height={SWATCH}>
						<defs>
							<PatternDef id="p-{pi}" marks={PATTERNS[name]} fill={color.fill} stroke={color.stroke} size={TILE} />
						</defs>
						{#if props.shape === 'rect'}
							<rect width={SWATCH} height={SWATCH} fill="url(#p-{pi})" rx="5" />
						{:else}
							<circle cx={SWATCH/2} cy={SWATCH/2} r={SWATCH/2 - 1} fill="url(#p-{pi})" />
						{/if}
					</svg>
					<span class="text-surface-z7 text-xs">{name}</span>
				</div>
			{/each}
		</div>
	{/snippet}
</PlaySection>
