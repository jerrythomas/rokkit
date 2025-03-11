<script>
	let { class: className = '', children } = $props()
</script>

<rk-scroll class="flex h-full flex-col overflow-scroll {className}">
	{@render children?.()}
</rk-scroll>
