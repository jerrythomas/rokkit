<script>
	// @ts-nocheck
	import ContentNavigator from './ContentNavigator.svelte'
	import { Tabs } from '@rokkit/ui'

	const items = ['Dashboard', 'Analytics', 'Reports', 'Settings']
	let value = $state('Dashboard')

	const contentData = {
		'Dashboard': {
			title: 'Dashboard Overview',
			description: 'Welcome to your main dashboard. Here you can see key metrics and recent activity.',
			metrics: ['Users: 1,234', 'Revenue: $45,678', 'Growth: +12%']
		},
		'Analytics': {
			title: 'Analytics & Insights',
			description: 'Deep dive into your data with comprehensive analytics.',
			metrics: ['Page Views: 89,012', 'Bounce Rate: 23%', 'Conversion: 4.5%']
		},
		'Reports': {
			title: 'Reports & Exports',
			description: 'Generate and download various reports for your data.',
			metrics: ['Monthly Reports: 12', 'Custom Reports: 5', 'Scheduled: 3']
		},
		'Settings': {
			title: 'Application Settings',
			description: 'Configure your application preferences and account settings.',
			metrics: ['Profile Complete: 85%', 'Notifications: 7', 'Integrations: 3']
		}
	}

	let currentContent = $derived(contentData[value] || contentData['Dashboard'])
</script>

<div class="h-64 border border-gray-200 rounded-lg overflow-hidden">
	<ContentNavigator vertical>
		{#snippet nav()}
			<div class="bg-gray-50 p-4 border-b">
				<Tabs options={items} bind:value />
			</div>
		{/snippet}
		{#snippet content()}
			<div class="flex-grow p-6">
				<div>
					<h3 class="text-lg font-semibold mb-2">{currentContent.title}</h3>
					<p class="text-gray-600 mb-4">{currentContent.description}</p>
					<div class="space-y-2">
						{#each currentContent.metrics as metric}
							<div class="text-sm bg-blue-50 p-2 rounded">{metric}</div>
						{/each}
					</div>
				</div>
			</div>
		{/snippet}
	</ContentNavigator>
</div>

<div class="mt-4 text-sm">
	<strong>Selected:</strong> {value}
</div>