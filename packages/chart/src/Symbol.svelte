<script>
	import { components } from './symbols'

	export let x = 0
	export let y = 0
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'
	export let shape = 'circle'
	/** @type Object<string, any> */
	export let using = components

	$: component = using[shape] || using.default
	$: props = using[shape] ? $$restProps : { name: shape, ...$$restProps }
</script>

<svelte:component this={component} {x} {y} {size} {fill} {stroke} {...props} />
