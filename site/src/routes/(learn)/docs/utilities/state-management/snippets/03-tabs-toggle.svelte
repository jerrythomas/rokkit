<script>
	import { Tabs, Toggle } from '@rokkit/ui'

	let activeTab = $state('overview')
	let viewMode = $state('grid')
</script>

<Tabs items={tabs} {fields} bind:value={activeTab} />
<Toggle options={viewOptions} bind:value={viewMode} />
