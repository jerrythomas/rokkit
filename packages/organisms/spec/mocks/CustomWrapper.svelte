<script>
	export let title
	export let type
	export let using
</script>
<field-layout class={type}>
	<h1>{title}</h1>
	<h2>{JSON.stringify(Object.keys(using))}</h2>
	<slot />
</field-layout>