<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'

	let options = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			emoji: '📊',
			info: 'Analytics and key metrics overview',
			detail:
				'Monitor your website performance, user engagement, and conversion rates in real-time with comprehensive dashboards.'
		},
		{
			id: 'users',
			label: 'Users',
			emoji: '👥',
			info: 'User accounts and permissions',
			detail:
				'View user profiles, manage access levels, and track user activity across your platform with advanced user management tools.'
		},
		{
			id: 'settings',
			label: 'Settings',
			emoji: '⚙️',
			info: 'Application preferences',
			detail:
				'Customize notifications, security settings, and application behavior to suit your specific needs and workflow.'
		}
	]
	let fields = { label: 'label', icon: 'emoji' }
	let value = $state(options[0])
</script>

<Tabs {options} bind:value {fields}>
	{#snippet child(item)}
		<span>{item.get('icon')}</span>
		<span>{item.get('label')}</span>
	{/snippet}

	{#snippet tabPanel(item)}
		<div data-card>
			<div>
				<span>{item.value.emoji}</span>
				<h3>{item.value.label}</h3>
				<p>{item.value.info}</p>
			</div>
			<p>{item.value.detail}</p>
		</div>
	{/snippet}
</Tabs>
