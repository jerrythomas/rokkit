<script>
	let { children } = $props()
</script>

<div data-playground-root class="flex min-h-0 flex-1 flex-col">
	<header class="bg-surface-z2 border-surface-z2 text-surface-z7 border-b px-6 py-8">
		<h1>Rokkit Component Playground</h1>
		<p>Interactive testing environment for Rokkit components</p>
	</header>

	<main data-playground-content class="bg-surface-z1 text-surface-z8 flex flex-col overflow-auto">
		{@render children()}
	</main>
</div>
