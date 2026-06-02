<script lang="ts">
	import { id } from '@rokkit/core'
	import type { ShineProps } from '../types/shine.js'

	const {
		color = 'rgb(var(--primary-500))',
		radius = 300,
		depth = 1,
		surfaceScale = 2,
		specularConstant = 0.75,
		specularExponent = 120,
		class: className = '',
		children
	}: ShineProps = $props()

	const filterId = id('filter')

	let mouse = $state({ x: 0, y: 0 })
	let wrapperBox = $state({ left: 0, top: 0 })
	let wrapperEl: HTMLDivElement | null = $state(null)

	function onPointerMove(e: PointerEvent) {
		wrapperBox = wrapperEl?.getBoundingClientRect() ?? { left: 0, top: 0 }
		mouse = { x: e.clientX, y: e.clientY }
	}

	function onScroll() {
		wrapperBox = wrapperEl?.getBoundingClientRect() ?? { left: 0, top: 0 }
	}
</script>

<svelte:window onpointermove={onPointerMove} onscroll={onScroll} />

<svg data-shine-filter>
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
	data-shine
	style:filter="url(#{filterId})"
	class={className || undefined}
	bind:this={wrapperEl}
>
	{@render children?.()}
</div>
