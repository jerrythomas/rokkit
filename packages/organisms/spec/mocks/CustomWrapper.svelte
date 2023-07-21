<script>
	export let title
	export let type
</script>

<field-layout class={type}>
	<h1>{title}</h1>
	<slot />
</field-layout>
