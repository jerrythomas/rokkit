<script>
	let {
		class: className = '',
		title = 'Section',
		open = true,
		type = 'vertical',
		children
	} = $props()
</script>

<details bind:open class={className}>
	<summary>{title}</summary>
	<field-layout class={type}>
		{@render children?.()}
	</field-layout>
</details>
