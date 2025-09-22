<script>
	import Code from './Code.svelte'
	import { Tabs } from '@rokkit/ui'
	let { files = [] } = $props()
	let current = $state(files[0])
	let fields = { text: 'name', icon: 'language' }
</script>

<Tabs options={files} {fields} bind:value={current} class="no-padding">
	{#snippet tabPanel(item)}
		<Code content={item.value.content} language={item.value.language} />
	{/snippet}
</Tabs>
