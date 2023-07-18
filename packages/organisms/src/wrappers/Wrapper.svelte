<script>
	let className = ''
	export { className as class }
	export let type = 'vertical'

</script>
<field-layout class="{type} {className}">
	<slot />
</field-layout>
