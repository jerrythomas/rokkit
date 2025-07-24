<script>
	import { Tabs } from '@rokkit/ui'
	import Code from './Code.svelte'
	let { files = [] } = $props()
	let current = $state(files[0])
	let fields = { text: 'name', icon: 'language' }
</script>

<Tabs items={files} {fields} bind:value={current} class="no-padding">
	<Code content={current?.content} language={current?.language} />
</Tabs>
