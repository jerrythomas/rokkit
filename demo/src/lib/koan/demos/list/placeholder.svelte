<script lang="ts">
	import { List } from '@rokkit/ui'

	const items = [
		{
			label: 'General',
			children: [
				{ label: 'Profile' },
				{ label: 'Account' },
				{ label: 'Notifications' }
			]
		},
		{
			label: 'Appearance',
			children: [
				{ label: 'Theme' },
				{ label: 'Density' },
				{ label: 'Typography' }
			]
		}
	]
	let value = $state<unknown>(null)
</script>

<List {items} collapsible bind:value />
