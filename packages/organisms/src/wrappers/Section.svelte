<script>
	let className = ''
	export { className as class }
	export let title = 'Section'
	export let open = true
	export let type = 'vertical'
</script>

<details bind:open class={className}>
	<summary>{title}</summary>
	<field-layout class={type}>
		<slot />
	</field-layout>
</details>
