<script>
	import AppContent from '../../(learn)/tutorial/multi-file-demo/src/App.svelte?raw'
	import CounterContent from '../../(learn)/tutorial/multi-file-demo/src/counter.js?raw'
	import StylesContent from '../../(learn)/tutorial/multi-file-demo/src/styles.css?raw'

	// Test that the imports work
	console.log('App content length:', AppContent.length)
	console.log('Counter content length:', CounterContent.length)
	console.log('Styles content length:', StylesContent.length)

	let selectedContent = $state('app')

	let contents = {
		app: { name: 'App.svelte', content: AppContent },
		counter: { name: 'counter.js', content: CounterContent },
		styles: { name: 'styles.css', content: StylesContent }
	}
</script>

<svelte:head>
	<title>Raw Import Test | Learn Rokkit</title>
	<meta name="description" content="Testing ?raw imports for file content" />
</svelte:head>

<div class="container mx-auto space-y-8 px-4 py-8">
	<header>
		<h1 class="text-neutral-overlay mb-2 text-3xl font-bold">Raw Import Test</h1>
		<p class="text-neutral-floating">
			Testing that ?raw imports work correctly for loading file content.
		</p>
	</header>

	<!-- File Selector -->
	<div class="space-y-4">
		<h2 class="text-neutral-overlay text-xl font-semibold">Select File to View</h2>
		<div class="flex gap-2">
			{#each Object.entries(contents) as [key, file]}
				<button
					onclick={() => selectedContent = key}
					class="px-3 py-2 rounded border transition-colors {selectedContent === key
						? 'bg-primary-overlay text-white border-primary-overlay'
						: 'bg-neutral-base text-neutral-overlay border-neutral-subtle hover:bg-neutral-subtle'}"
				>
					{file.name}
				</button>
			{/each}
		</div>
	</div>

	<!-- Content Display -->
	<div class="space-y-4">
		<h3 class="text-neutral-overlay text-lg font-semibold">
			Content: {contents[selectedContent].name}
		</h3>
		<div class="border-neutral-subtle bg-neutral-base rounded-lg border">
			<div class="border-b border-neutral-subtle bg-neutral-elevated px-4 py-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-neutral-overlay">
						{contents[selectedContent].name}
					</span>
					<span class="text-xs text-neutral-floating">
						{contents[selectedContent].content.split('\n').length} lines
					</span>
				</div>
			</div>
			<div class="p-4">
				<pre class="text-sm text-neutral-floating overflow-x-auto"><code>{contents[selectedContent].content}</code></pre>
			</div>
		</div>
	</div>

	<!-- Test Results -->
	<div class="space-y-4">
		<h3 class="text-neutral-overlay text-lg font-semibold">Import Test Results</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			{#each Object.entries(contents) as [key, file]}
				<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
					<h4 class="font-semibold mb-2">{file.name}</h4>
					<div class="text-sm text-neutral-floating space-y-1">
						<div>Status: {file.content ? '✅ Loaded' : '❌ Failed'}</div>
						<div>Length: {file.content.length} characters</div>
						<div>Lines: {file.content.split('\n').length}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
