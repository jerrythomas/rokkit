<script>
	export let value
	export let name = null
	export let label = null
	export let type = null
	$: extraProps = $$restProps
</script>

<h1>{type}:{label}</h1>
<p>{name}:{JSON.stringify(value)}</p>
<p>{JSON.stringify(Object.keys(extraProps))}</p>
