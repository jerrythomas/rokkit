<script>
	import { Tabs } from '@rokkit/ui'
	
	let items = $state([])
	let value = $state(null)
	let lastEvent = $state(null)
	let tabCounter = $state(0)

	const sampleContent = [
		{ emoji: '🎨', title: 'Design', description: 'Create beautiful user interfaces' },
		{ emoji: '💻', title: 'Code', description: 'Build robust applications' },
		{ emoji: '🚀', title: 'Deploy', description: 'Ship to production' },
		{ emoji: '📊', title: 'Analytics', description: 'Monitor performance' },
		{ emoji: '🔧', title: 'Settings', description: 'Configure your app' },
		{ emoji: '👥', title: 'Team', description: 'Collaborate with others' }
	]

	function handleAddTab() {
		tabCounter++
		const sample = sampleContent[Math.floor(Math.random() * sampleContent.length)]
		
		const newTab = {
			id: `tab-${tabCounter}`,
			text: `${sample.title} ${tabCounter}`,
			description: sample.description,
			emoji: sample.emoji
		}
		
		items = [...items, newTab]
		value = newTab
		lastEvent = { type: 'add', tab: newTab, timestamp: new Date().toLocaleTimeString() }
	}

	function handleRemoveTab(tab) {
		items = items.filter(item => item.id !== tab.id)
		
		// Reset selection if removed tab was selected
		if (value?.id === tab.id) {
			value = items[0] || null
		}
		
		lastEvent = { type: 'remove', tab: tab, timestamp: new Date().toLocaleTimeString() }
	}
	
	function handleTabChange(newValue) {
		lastEvent = { type: 'change', tab: newValue, timestamp: new Date().toLocaleTimeString() }
	}
</script>

<div data-card>
	<h3>Editable Tabs</h3>
	<p>Click the + button to add new tabs, or the × button to remove them. Start with an empty tab set!</p>
	
	<Tabs 
		{items} 
		bind:value 
		editable={true}
		placeholder="Add your first tab using the + button"
		onadd={handleAddTab}
		onremove={handleRemoveTab}
		onchange={handleTabChange}
	>
		{#snippet child(item)}
			<span>{item.get('emoji')}</span>
			<span>{item.get('text')}</span>
		{/snippet}
		
		<div>
			{#if value}
				<span>{value.emoji}</span>
				<h4>{value.text}</h4>
				<p>{value.description}</p>
			{/if}
		</div>
	</Tabs>
</div>

<div data-card>
	<h3>Event Log</h3>
	<div>
		<div>
			<strong>Selected Tab:</strong> {value?.text || 'None'}
		</div>
		<div>
			<strong>Total Tabs:</strong> {items.length}
		</div>
	</div>
	
	{#if lastEvent}
		<div>
			<span>{lastEvent.type}</span>
			<span>•</span>
			<span>{lastEvent.tab.text}</span>
			<span>•</span>
			<span>{lastEvent.timestamp}</span>
		</div>
	{/if}
</div>