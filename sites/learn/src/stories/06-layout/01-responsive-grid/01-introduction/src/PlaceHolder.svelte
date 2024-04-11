<script>
	let className
	export let content
	export { className as class }
</script>

<div class="w-full h-full flex items-center justify-center text-white {className}">
	{content}
</div>
