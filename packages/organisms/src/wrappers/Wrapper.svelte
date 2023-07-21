<script>
	let className = ''
	export { className as class }
	export let type = 'vertical'
	export let title = ''
</script>

<field-layout class="{type} {className}" aria-label={title}>
	<slot />
</field-layout>
