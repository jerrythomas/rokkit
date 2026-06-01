<script lang="ts">
	import { Code } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const jsExample = `function greet(name) {
  return \`Hello, \${name}!\`
}

greet('Rokkit')`

	const svelteExample =
		'<' +
		`script>
  import { Button } from '@rokkit/ui'
  let count = $state(0)
</script` +
		'>\n\n' +
		`<Button onclick={() => count++}>
  Clicked {count} times
</Button>`

	const jsonExample = `{
  "name": "rokkit",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}`
</script>

<div class="grid">
	<section>
		<header>JavaScript — dark (default)</header>
		<Code code={jsExample} language="javascript" {...spread} />
	</section>

	<section>
		<header>Svelte — with line numbers</header>
		<Code code={svelteExample} language="svelte" showLineNumbers {...spread} />
	</section>

	<section>
		<header>JSON — light theme</header>
		<Code code={jsonExample} language="json" theme="light" {...spread} />
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
