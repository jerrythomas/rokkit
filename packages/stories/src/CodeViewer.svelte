<script>
	import { Tabs } from '@rokkit/ui'
	import Code from './Code.svelte'
	let { files = [] } = $props()
	let current = $state()
	$effect(() => {
		if (files.length > 0 && current === undefined) current = files[0]
	})
	let fields = { label: 'name', icon: 'language' }
</script>

<Tabs options={files} {fields} bind:value={current} class="no-padding">
	{#snippet tabPanel(item)}
		<Code content={item.content} language={item.language} />
	{/snippet}
</Tabs>
