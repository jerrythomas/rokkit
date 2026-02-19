<script lang="ts">
	import { List } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropInfo } from '$lib/controls'

	let selected = $state<unknown>(undefined)
	let size = $state('md')
	let disabled = $state(false)
	let collapsible = $state(true)

	const navItems = [
		{ text: 'Home', href: '#home', icon: 'i-lucide:home' },
		{ text: 'Settings', href: '#settings', icon: 'i-lucide:settings' },
		{ text: 'Profile', href: '#profile', icon: 'i-lucide:user' },
		{ text: 'Messages', href: '#messages', icon: 'i-lucide:mail', badge: '3' }
	]

	const buttonItems = [
		{ text: 'Cut', value: 'cut', icon: 'i-lucide:scissors' },
		{ text: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
		{ text: 'Paste', value: 'paste', icon: 'i-lucide:clipboard' },
		{ text: 'Delete', value: 'delete', icon: 'i-lucide:trash', disabled: true }
	]

	const groupedItems = [
		{
			text: 'Favorites',
			children: [
				{ text: 'Dashboard', value: 'dashboard', icon: 'i-lucide:layout-grid' },
				{ text: 'Analytics', value: 'analytics', icon: 'i-lucide:star' }
			]
		},
		{
			text: 'Settings',
			children: [
				{ text: 'General', value: 'general', icon: 'i-lucide:settings' },
				{ text: 'Security', value: 'security', icon: 'i-lucide:heart' }
			]
		}
	]

	const withDescriptions = [
		{
			text: 'Dashboard',
			value: 'dashboard',
			icon: 'i-lucide:layout-grid',
			description: 'Overview of all metrics'
		},
		{
			text: 'Reports',
			value: 'reports',
			icon: 'i-lucide:file-text',
			description: 'Download generated reports'
		},
		{
			text: 'Settings',
			value: 'settings',
			icon: 'i-lucide:settings',
			description: 'Configure preferences'
		}
	]

	function handleSelect(value: unknown) {
		selected = value
	}
</script>

<Playground
	title="List"
	description="Navigation or button list with collapsible groups, active tracking, and badges."
>
	{#snippet preview()}
		<div class="demos">
			<div>
				<h4>Navigation</h4>
				<div class="constrained">
					<List items={navItems} active="#home" size={size as any} {disabled} />
				</div>
			</div>
			<div>
				<h4>Button items</h4>
				<div class="constrained">
					<List
						items={buttonItems}
						value={selected}
						size={size as any}
						{disabled}
						onselect={handleSelect}
					/>
				</div>
			</div>
			<div>
				<h4>Grouped</h4>
				<div class="constrained">
					<List
						items={groupedItems}
						{collapsible}
						value={selected}
						size={size as any}
						{disabled}
						onselect={handleSelect}
					/>
				</div>
			</div>
			<div>
				<h4>Descriptions</h4>
				<div class="constrained">
					<List
						items={withDescriptions}
						value={selected}
						size={size as any}
						{disabled}
						onselect={handleSelect}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropCheckbox label="Collapsible groups" bind:checked={collapsible} />
		<PropCheckbox label="Disabled" bind:checked={disabled} />
		<hr />
		<PropInfo label="Selected" value={selected} />
	{/snippet}
</Playground>

<style>
	.demos {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	.demos h4 {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		color: rgb(var(--color-surface-500));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.constrained {
		width: 240px;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
