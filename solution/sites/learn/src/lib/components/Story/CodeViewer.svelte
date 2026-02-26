<script>
	// @ts-nocheck
	import Code from './Code.svelte'
	import { Tabs } from '@rokkit/ui'
	let { files = [] } = $props()
	let current = $state()
	let fields = { text: 'name', icon: 'language' }

	$effect(() => {
		current = files[0]
	})
</script>

<Tabs options={files} {fields} bind:value={current} class="no-padding">
	{#snippet tabPanel(item)}
		<Code content={item.content} language={item.language} />
	{/snippet}
</Tabs>
