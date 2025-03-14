<script>
	let className
	export let content
	export { className as class }
</script>

<div class="flex h-full w-full items-center justify-center text-white {className}">
	{content}
</div>
