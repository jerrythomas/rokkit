<script lang="ts">
	import type { Snippet } from 'svelte'

	interface TiltProps {
		/** Maximum rotation angle in degrees (default: 10) */
		maxRotation?: number
		/** Whether to adjust brightness based on mouse Y position */
		setBrightness?: boolean
		/** CSS perspective value in pixels (default: 600) */
		perspective?: number
		/** Additional CSS class */
		class?: string
		children?: Snippet
	}

	const {
		maxRotation = 10,
		setBrightness = false,
		perspective = 600,
		class: className = '',
		children
	}: TiltProps = $props()

	let width = $state(0)
	let height = $state(0)

	let rotateX = $state(0)
	let rotateY = $state(0)
	let brightness = $state(1)

	/** Linear interpolation: maps value from [0, max] to [rangeMin, rangeMax] */
	function lerp(value: number, max: number, rangeMin: number, rangeMax: number): number {
		if (max === 0) return rangeMin
		return rangeMin + (value / max) * (rangeMax - rangeMin)
	}

	function onMouseMove(e: MouseEvent) {
		rotateY = lerp(e.offsetX, width, maxRotation, -maxRotation)
		rotateX = lerp(e.offsetY, height, -maxRotation, maxRotation)

		if (setBrightness) {
			brightness = lerp(e.offsetY, height, 2.0, 1.0)
		}
	}

	function onMouseLeave() {
		rotateX = 0
		rotateY = 0
		brightness = 1
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	data-tilt
	data-tilt-brightness={setBrightness || undefined}
	class={className || undefined}
	style:--tilt-perspective="{perspective}px"
	style:--tilt-rotate-x="{rotateX}deg"
	style:--tilt-rotate-y="{rotateY}deg"
	style:--tilt-brightness={brightness}
	bind:clientWidth={width}
	bind:clientHeight={height}
	onmousemove={onMouseMove}
	onmouseleave={onMouseLeave}
>
	{@render children?.()}
</div>
