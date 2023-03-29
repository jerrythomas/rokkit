<script>
	let className = ''
	export { className as class }
	export let vertical = false
</script>

<nav-content class="flex w-full h-full {className}" class:flex-col={vertical}>
	<slot name="nav" />
	<slot name="content" />
</nav-content>
