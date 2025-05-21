<script>
	import { id } from '@rokkit/core'
	// import { clsx } from 'clsx'

	let {
		color = 'var(--primary-500)',
		radius = 300,
		/** Depth of effect */
		depth = 1,
		/** Represents the height of the surface for a light filter primitive */
		surfaceScale = 2,
		/** The bigger the value the bigger the reflection */
		specularConstant = 0.75,
		/** controls the focus for the light source. The bigger the value the brighter the light */
		specularExponent = 120,
		children,
		...restProps
	} = $props()

	const filterId = id('filter')

	let mouse = $state({ x: 0, y: 0 })
	let wrapperBox = $state({ left: 0, top: 0 })
	/** @type {HTMLDivElement|null} */
	let wrapperEl = null

	/**
	 *
	 * @param {PointerEvent} e
	 */
	function onPointerMove(e) {
		wrapperBox = wrapperEl?.getBoundingClientRect() ?? { left: 0, top: 0 }
		mouse = { x: e.clientX, y: e.clientY }
	}

	function onScroll() {
		wrapperBox = wrapperEl?.getBoundingClientRect() ?? { left: 0, top: 0 }
	}
</script>

<svelte:window onpointermove={onPointerMove} onscroll={onScroll} />

<svg data-shine-filter class="pointer-events-none fixed inset-0">
	<filter id={filterId} color-interpolation-filters="sRGB">
		<feGaussianBlur in="SourceAlpha" stdDeviation={depth} />

		<feSpecularLighting
			result="light-source"
			{surfaceScale}
			{specularConstant}
			{specularExponent}
			lighting-color={color}
		>
			<fePointLight x={mouse.x - wrapperBox.left} y={mouse.y - wrapperBox.top} z={radius} />
		</feSpecularLighting>

		<feComposite result="reflections" in="light-source" in2="SourceAlpha" operator="in" />

		<feComposite
			in="SourceGraphic"
			in2="reflections"
			operator="arithmetic"
			k1="0"
			k2="1"
			k3="1"
			k4="0"
		/>
	</filter>
</svg>

<div
	data-shine-root
	style:filter="url(#{filterId})"
	{...restProps}
	class="inline-block"
	bind:this={wrapperEl}
>
	{@render children?.()}
</div>
