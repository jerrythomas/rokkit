<script>
	let { children } = $props()
</script>

<div data-playground-root class="flex min-h-0 flex-1 flex-col">
	<header class="bg-neutral-z2 border-neutral-z2 text-neutral-z7 border-b px-6 py-8">
		<h1>Rokkit Component Playground</h1>
		<p>Interactive testing environment for Rokkit components</p>
	</header>

	<main data-playground-content class="bg-neutral-z1 text-neutral-z8 flex flex-col overflow-auto">
		{@render children()}
	</main>
</div>
