<script>
	import { scaleMark, resolveMarkAttrs } from './scale.js'

	/** @type {{ id: string, marks?: import('./patterns.js').PatternMark[], size?: number, fill?: string, stroke?: string, thickness?: number }} */
	let { id, marks = [], size = 10, fill = '#888', stroke = '#444', thickness = 0.5 } = $props()

	const resolvedMarks = $derived(
		marks.map((m) => resolveMarkAttrs(scaleMark(m, size), { fill: stroke, stroke, thickness }))
	)
</script>

<pattern {id} patternUnits="userSpaceOnUse" width={size} height={size}>
	<rect width={size} height={size} fill={fill} />
	{#each resolvedMarks as { type, attrs }}
		{#if type === 'line'}
			<line {...attrs} />
		{:else if type === 'circle'}
			<circle {...attrs} />
		{:else if type === 'rect'}
			<rect {...attrs} />
		{:else if type === 'polygon'}
			<polygon {...attrs} />
		{:else if type === 'path'}
			<path {...attrs} />
		{/if}
	{/each}
</pattern>
