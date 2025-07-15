<script>
	import { Tabs } from '@rokkit/ui'

	let items = [
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
	let fields = { text: 'label', icon: 'emoji' }
	let value = $state(items[0])
</script>

<Tabs {items} bind:value {fields}>
	{#snippet child(item)}
		<span>{item.get('icon')}</span>
		<span>{item.get('label')}</span>
	{/snippet}

	<div data-card>
		<div>
			<span>{value.emoji}</span>
			<h3>{value.label}</h3>
			<p>{value.info}</p>
		</div>
		<p>{value.detail}</p>
	</div>
</Tabs>
