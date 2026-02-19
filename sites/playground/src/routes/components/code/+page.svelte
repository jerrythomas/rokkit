<script lang="ts">
	import { Code } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let props = $state({ language: 'typescript', codeTheme: 'light', showLineNumbers: false, showCopyButton: true })

	const schema = {
		type: 'object',
		properties: {
			language: { type: 'string' },
			codeTheme: { type: 'string' },
			showLineNumbers: { type: 'boolean' },
			showCopyButton: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/language', label: 'Language', props: { options: ['typescript', 'svelte', 'css', 'json'] } },
			{ scope: '#/codeTheme', label: 'Theme', props: { options: ['light', 'dark'] } },
			{ scope: '#/showLineNumbers', label: 'Line numbers' },
			{ scope: '#/showCopyButton', label: 'Copy button' }
		]
	}

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

	let code = $derived(samples[props.language] ?? samples.typescript)
</script>

<Playground
	title="Code"
	description="Syntax-highlighted code blocks via shiki with line numbers and copy button."
>
	{#snippet preview()}
		<Code {code} language={props.language} theme={props.codeTheme as any} showLineNumbers={props.showLineNumbers} showCopyButton={props.showCopyButton} />
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</Playground>
