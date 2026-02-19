<script>
	import { scaleLinear } from 'd3-scale'
	import { clsx } from 'clsx'

	let {
		maxRotation = 10,
		setBrightness = false,
		perspective = 600,
		class: classNames = undefined,
		children
	} = $props()

	let width = $state(0)
	let height = $state(0)

	let rotateX = $state(0)
	let rotateY = $state(0)
	let brightness = $state(1)

	let scaleX = $derived(scaleLinear().domain([0, height]).range([-maxRotation, maxRotation]))
	let scaleY = $derived(scaleLinear().domain([0, width]).range([maxRotation, -maxRotation]))
	let scaleBrightness = $derived(scaleLinear().domain([0, height]).range([2.0, 1.0]))

	/**
	 *
	 * @param {MouseEvent} e
	 */
	function onMouseMove(e) {
		rotateY = scaleY(e.offsetX)
		rotateX = scaleX(e.offsetY)

		if (setBrightness) {
			brightness = scaleBrightness(e.offsetY)
		}
	}

	/**
	 *
	 */
	function onMouseLeave() {
		rotateX = 0
		rotateY = 0
		brightness = 1
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	data-tilt-root
	style:--perspective="{perspective}px"
	style:--rotateX="{rotateX}deg"
	style:--rotateY="{rotateY}deg"
	style:--brightness={brightness}
	class={clsx(
		'[perspective:var(--perspective)]',
		'[&>*]:[transform:rotateX(var(--rotateX))_rotateY(var(--rotateY))]',
		'[&>*]:brightness-[var(--brightness)]',
		classNames
	)}
	bind:clientWidth={width}
	bind:clientHeight={height}
	onmousemove={onMouseMove}
	onmouseleave={onMouseLeave}
>
	{@render children?.()}
</div>
