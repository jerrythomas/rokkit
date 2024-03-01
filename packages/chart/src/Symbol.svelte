<script>
	import { components } from './symbols'

	export let x = 0
	export let y = 0
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'
	export let name = 'circle'
	/** @type Object<string, any> */
	export let using = components

	$: component = using[name] || using.default
	$: props = using[name] ? $$restProps : { name, ...$$restProps }
</script>

<svelte:component this={component} {x} {y} {size} {fill} {stroke} {...props} />
