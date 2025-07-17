<script>
	let { children } = $props()
</script>

<div data-playground-root class="flex flex-1 flex-col">
	<header class="bg-neutral-z2 border-neutral-z2 text-neutral-z7 border-b px-6 py-8">
		<h1>Rokkit Component Playground</h1>
		<p>Interactive testing environment for Rokkit components</p>
	</header>

	<main
		data-playground-content
		class="bg-neutral-z1 text-neutral-z8 flex flex-1 flex-col overflow-hidden"
	>
		{@render children()}
	</main>
</div>

<style>
	[data-playground-root] > header {
		@apply border-neutral-z2 bg-neutral-z2 space-y-2 border-b px-6 py-8;
	}
</style>
