<script>
	let { title, type, children } = $props()
</script>

<field-layout class={type}>
	<h1>{title}</h1>
	{@render children?.()}
</field-layout>
