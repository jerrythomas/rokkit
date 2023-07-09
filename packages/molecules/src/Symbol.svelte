<script>
	import { Shape } from '@rokkit/atoms/symbols'

	export let x = 0
	export let y = 0
	export let r = 10
	export let fill
	export let stroke
	export let shape = 'circle'
	export let using = { default: Shape }

	$: component = using[shape] || Shape
	$: props = using[shape] ? $$restProps : { name: shape, ...$$restProps }
</script>

<svelte:component this={component} {x} {y} {r} {fill} {stroke} {...props} />
