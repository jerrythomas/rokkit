<script>
	import { Code } from '@rokkit/ui'

	const example = `import { onMount } from 'svelte'

function greet(name) {
  return \`Hello, \${name}!\`
}

onMount(() => {
  console.log(greet('World'))
})`
</script>

<div class="w-full max-w-lg">
	<Code code={example} language="javascript" />
</div>

<p class="text-surface-z6 mt-4 text-sm">Hover over the code block to reveal the copy button.</p>
