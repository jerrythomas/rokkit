<script>
	let className = 'flex flex-col'
	export { className as class }
	export let layout = 'vertical'
</script>

<field-layout class="{layout} {className}">
	<slot />
</field-layout>
