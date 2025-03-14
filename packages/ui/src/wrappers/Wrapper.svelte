<script>
	let { class: className = '', type = 'vertical', title = '', children } = $props()
</script>

<field-layout class="{type} {className}" aria-label={title}>
	{@render children?.()}
</field-layout>
