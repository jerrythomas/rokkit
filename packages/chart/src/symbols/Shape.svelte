<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'
	import { namedShapes } from './constants'

	type Props = {
		x?: number
		y?: number
		size?: number
		fill?: string
		stroke?: string
		thickness?: number
		name?: string
		onclick?: SVGAttributes<SVGPathElement>['onclick']
		onmouseover?: SVGAttributes<SVGPathElement>['onmouseover']
		onmouseleave?: SVGAttributes<SVGPathElement>['onmouseleave']
		onfocus?: SVGAttributes<SVGPathElement>['onfocus']
		onblur?: SVGAttributes<SVGPathElement>['onblur']
	}

	let {
		x = 0,
		y = 0,
		size = 1,
		fill = 'none',
		stroke = 'currentColor',
		thickness = 1,
		name = 'circle',
		onclick,
		onmouseover,
		onmouseleave,
		onfocus,
		onblur
	}: Props = $props()

	let d = $derived(
		String(name in namedShapes ? namedShapes[name](size) : namedShapes['circle'](size))
	)
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<path
	{d}
	{fill}
	{stroke}
	transform="translate({x},{y})"
	stroke-width={thickness}
	fill-rule="nonzero"
	role="button"
	{onclick}
	{onmouseover}
	{onmouseleave}
	{onfocus}
	{onblur}
	tabindex="0"
/>
