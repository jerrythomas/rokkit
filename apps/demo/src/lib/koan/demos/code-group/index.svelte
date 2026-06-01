<script lang="ts">
	import { CodeGroup } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const appSrc =
		'<' +
		`script>
  import Button from './lib/Button.svelte'
  let count = $state(0)
</script` +
		'>\n\n' +
		`<Button onclick={() => count++}>
  Clicked {count} times
</Button>`

	const buttonSrc =
		'<' +
		`script>
  let { children, onclick } = $props()
</script` +
		'>\n\n' +
		`<button onclick={onclick} class="btn">
  {@render children()}
</button>

<style>
  .btn {
    padding: 6px 14px;
    border: 1px solid var(--paper-edge);
    border-radius: 4px;
    background: var(--paper);
    cursor: pointer;
  }
</style>`

	const pkgSrc = `{
  "name": "demo-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  },
  "dependencies": {
    "@rokkit/ui": "^1.0.0"
  }
}`

	const appCss = `:root {
  --paper: #fff;
  --paper-edge: #e5e5e5;
  --ink: #1a1a1a;
}

body {
  font-family: system-ui;
  color: var(--ink);
  background: var(--paper);
}`

	const files = [
		{ path: 'src/App.svelte', language: 'svelte', code: appSrc },
		{ path: 'src/lib/Button.svelte', language: 'svelte', code: buttonSrc },
		{ path: 'src/app.css', language: 'css', code: appCss },
		{ path: 'package.json', language: 'json', code: pkgSrc }
	]
</script>

<div class="grid">
	<section>
		<header>Project skeleton — nested src/lib + root files</header>
		<CodeGroup {files} initialFile="src/App.svelte" {...spread} />
	</section>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
</style>
