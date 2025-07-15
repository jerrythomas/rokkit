<script>
	import Code from './Code.svelte'
	import { Tabs } from '@rokkit/ui'
	let { files = [] } = $props()
	let current = $state(files[0])
	let fields = { text: 'name', icon: 'language' }
</script>

<Tabs items={files} {fields} bind:value={current} class="no-padding">
	<Code content={current?.content} language={current?.language} />
</Tabs>
