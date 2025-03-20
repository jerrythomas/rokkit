<script>
	let { class: className = '', type = 'vertical', title = '', children } = $props()
</script>

<field-layout
	class={className}
	class:vertical={type === 'vertical'}
	class:horizontal={type === 'horizontal'}
	aria-label={title}
>
	{@render children?.()}
</field-layout>
