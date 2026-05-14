<script lang="ts">
	type Direction = 'right' | 'left' | 'down' | 'up' | 'curve-tl' | 'curve-tr' | 'curve-bl' | 'curve-br'

	let {
		direction = 'right',
		curve = 40,
		label = '',
		stroke = 'var(--color-accent-z5)',
		width = 160,
		height = 80
	}: {
		direction?: Direction
		curve?: number
		label?: string
		stroke?: string
		width?: number
		height?: number
	} = $props()

	const paths: Record<Direction, string> = {
		right:    `M 10 ${height / 2} Q ${width / 2} ${height / 2 - curve} ${width - 20} ${height / 2}`,
		left:     `M ${width - 10} ${height / 2} Q ${width / 2} ${height / 2 - curve} 20 ${height / 2}`,
		down:     `M ${width / 2} 10 Q ${width / 2 + curve} ${height / 2} ${width / 2} ${height - 20}`,
		up:       `M ${width / 2} ${height - 10} Q ${width / 2 - curve} ${height / 2} ${width / 2} 20`,
		'curve-tl': `M ${width - 20} 20 Q ${width / 2} ${height} 20 ${height / 2}`,
		'curve-tr': `M 20 20 Q ${width / 2} ${height} ${width - 20} ${height / 2}`,
		'curve-bl': `M ${width - 20} ${height - 20} Q ${width / 2} 0 20 ${height / 2}`,
		'curve-br': `M 20 ${height - 20} Q ${width / 2} 0 ${width - 20} ${height / 2}`
	}

	const arrowTip = $derived(() => {
		const path = paths[direction]
		const match = path.match(/([\d.]+) ([\d.]+)$/)
		return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 }
	})
</script>

<div class="annotation" aria-hidden="true">
	<svg {width} {height} viewBox="0 0 {width} {height}" fill="none">
		<path d={paths[direction]} {stroke} stroke-width="2" stroke-linecap="round" fill="none" />
		<polygon
			points="-6,-4 0,0 -6,4"
			fill={stroke}
			transform="translate({arrowTip().x}, {arrowTip().y})"
		/>
	</svg>
	{#if label}
		<span class="label" style="color: {stroke}">{label}</span>
	{/if}
</div>

<style>
	.annotation {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.label {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 18px;
		font-weight: 500;
		white-space: nowrap;
	}
</style>
