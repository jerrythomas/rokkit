<script>
	/** @type {{ score: number, size?: number }} */
	const { score, size = 100 } = $props()

	const cx = $derived(size / 2)
	const cy = $derived(size / 2)
	const r = $derived((size - 16) / 2)
	const circumference = $derived(2 * Math.PI * r)
	// Arc spans 300 degrees, starting at -150
	const arcLength = $derived((300 / 360) * circumference)
	const filledLength = $derived((score / 100) * arcLength)
	const dashArray = $derived(`${filledLength} ${circumference - filledLength}`)
	const trackDashArray = $derived(`${arcLength} ${circumference - arcLength}`)
	const dashOffset = $derived(-((360 - 300) / 2 / 360) * circumference)
	const viewBox = $derived(`0 0 ${size} ${size}`)
	const transform = $derived(`rotate(-90 ${cx} ${cy})`)
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
		stroke="var(--color-surface-z2)"
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
		stroke="var(--color-primary-z5)"
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
		fill="var(--color-ink-z1)"
	>
		{score}
	</text>
</svg>
