<script>
	let { value, name, label, type, ...extraProps } = $props()
</script>

<h1>{type}:{label}</h1>
<p>{name}:{JSON.stringify(value)}</p>
<p>{JSON.stringify(Object.keys(extraProps))}</p>
