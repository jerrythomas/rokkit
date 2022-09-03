<script>
	let className = ''
	export { className as class }
</script>

<scroll class="flex flex-col h-full overflow-scroll {className}">
	<slot />
</scroll>
