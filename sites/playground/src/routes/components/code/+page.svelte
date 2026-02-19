<script lang="ts">
	import { Code } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox } from '$lib/controls'

	let language = $state('typescript')
	let codeTheme = $state('light')
	let showLineNumbers = $state(false)
	let showCopyButton = $state(true)

	const samples: Record<string, string> = {
		typescript: `interface User {
  name: string
  email: string
  roles: string[]
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`
}`,
		svelte: `<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
<\/script>

<button onclick={() => count++}>
  {count} x 2 = {doubled}
</button>`,
		css: `[data-menu] {
  position: relative;
  display: inline-flex;
}

[data-menu-dropdown] {
  position: absolute;
  min-width: 12rem;
  border-radius: 0.5rem;
}`,
		json: `{
  "name": "@rokkit/ui",
  "version": "0.0.1",
  "type": "module",
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}`
	}

	let code = $derived(samples[language] ?? samples.typescript)
</script>

<Playground
	title="Code"
	description="Syntax-highlighted code blocks via shiki with line numbers and copy button."
>
	{#snippet preview()}
		<Code {code} {language} theme={codeTheme as any} {showLineNumbers} {showCopyButton} />
	{/snippet}

	{#snippet controls()}
		<PropSelect
			label="Language"
			bind:value={language}
			options={['typescript', 'svelte', 'css', 'json']}
		/>
		<PropSelect label="Theme" bind:value={codeTheme} options={['light', 'dark']} />
		<PropCheckbox label="Line numbers" bind:checked={showLineNumbers} />
		<PropCheckbox label="Copy button" bind:checked={showCopyButton} />
	{/snippet}
</Playground>
