<script>
	/** @type {{ score: number, size?: number }} */
	const { score, size = 100 } = $props()

	const cx = size / 2
	const cy = size / 2
	const r = (size - 16) / 2
	const circumference = 2 * Math.PI * r
	// Arc spans 300 degrees, starting at -150
	const arcLength = (300 / 360) * circumference
	const filledLength = (score / 100) * arcLength
	const dashArray = `${filledLength} ${circumference - filledLength}`
	const trackDashArray = `${arcLength} ${circumference - arcLength}`
	const dashOffset = -((360 - 300) / 2 / 360) * circumference
	const viewBox = `0 0 ${size} ${size}`
	const transform = `rotate(-90 ${cx} ${cy})`
</script>

<svg width={size} height={size} viewBox={viewBox} class="enso-ring">
	<defs>
		<filter id="brush-texture">
			<feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="2" />
			<feDisplacementMap in="SourceGraphic" scale="2" />
		</filter>
	</defs>

	<!-- Track -->
	<circle
		{cx} {cy} {r}
		fill="none"
		stroke="var(--color-surface-200)"
		stroke-width="8"
		stroke-linecap="round"
		stroke-dasharray={trackDashArray}
		stroke-dashoffset={dashOffset}
		{transform}
	/>

	<!-- Filled arc -->
	<circle
		{cx} {cy} {r}
		fill="none"
		stroke="var(--color-primary-500)"
		stroke-width="8"
		stroke-linecap="round"
		stroke-dasharray={dashArray}
		stroke-dashoffset={dashOffset}
		{transform}
		filter="url(#brush-texture)"
	/>

	<!-- Score text -->
	<text
		x={cx} y={cy}
		text-anchor="middle"
		dominant-baseline="central"
		font-family="var(--font-display)"
		font-size={size * 0.28}
		font-weight="300"
		fill="var(--color-surface-900)"
	>
		{score}
	</text>
</svg>
