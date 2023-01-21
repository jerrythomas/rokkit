<script>
	import { ComponentExamples } from '@rokkit/markdown'

	export let data

	let fields = { text: 'title' }
</script>

<!-- {JSON.stringify(example)} -->
{#if data.examples.length > 0}
	<ComponentExamples items={data.examples} {fields} class="w-300 h-150 card" />
{/if}
