<script>
	// @ts-nocheck
	import CodeGroup from '$lib/components/CodeGroup.svelte'
	import { Button } from '@rokkit/ui'

	const files = [
		{
			path: 'src/lib/components/Button.svelte',
			language: 'svelte',
			code: `<script>
  let { label = 'Click me', onclick } = $props()
<\/script>

<button onclick={onclick}>{label}</button>

<style>
  button {
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid var(--paper-edge);
    background: var(--accent);
    color: var(--paper);
    cursor: pointer;
  }
</style>`
		},
		{
			path: 'src/lib/components/Input.svelte',
			language: 'svelte',
			code: `<script>
  let { value = $bindable(''), placeholder = '' } = $props()
<\/script>

<input type="text" bind:value placeholder={placeholder} />`
		},
		{
			path: 'src/lib/index.ts',
			language: 'ts',
			code: `export { default as Button } from './components/Button.svelte'
export { default as Input } from './components/Input.svelte'`
		},
		{
			path: 'src/routes/+page.svelte',
			language: 'svelte',
			code: `<script>
  import { Button } from '$lib'
  let count = $state(0)
<\/script>

<Button label="Count: {count}" onclick={() => count++} />`
		},
		{
			path: 'package.json',
			language: 'json',
			code: `{
  "name": "my-app",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}`
		}
	]
</script>

<svelte:head>
	<title>CodeGroup · Playground</title>
</svelte:head>

<div class="page">
	<header class="page-head">
		<h1>CodeGroup</h1>
		<p>
			Multi-file code display with a tree picker and an optional live preview.
			Tree-rail on the left at &ge; 768px; collapses to a top picker pill that
			opens a drawer overlay on narrower viewports. Try the browser dev tools
			responsive mode.
		</p>
	</header>

	<section>
		<h2>With preview</h2>
		<CodeGroup {files}>
			{#snippet preview()}
				<div class="preview-demo">
					<Button label="Hello from the preview pane" />
					<p>The preview snippet receives no props — render whatever exemplifies the code.</p>
				</div>
			{/snippet}
		</CodeGroup>
	</section>

	<section>
		<h2>Code only (no preview)</h2>
		<CodeGroup {files} />
	</section>
</div>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 32px 24px 80px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.page-head h1 {
		margin: 0 0 8px;
		font: 600 28px/1.2 var(--font-display, var(--font-ui));
	}

	.page-head p {
		margin: 0;
		font: 400 14.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
		max-width: 640px;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	section h2 {
		margin: 0;
		font: 500 16px var(--font-ui);
		color: var(--ink);
	}

	.preview-demo {
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	}

	.preview-demo p {
		margin: 0;
		font: 400 13px var(--font-ui);
		color: var(--ink-soft);
	}
</style>
