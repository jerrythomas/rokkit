<script lang="ts">
	import { List } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let selected = $state<unknown>(undefined)

	let props = $state({ size: 'md', collapsible: true, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			collapsible: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/collapsible', label: 'Collapsible groups' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

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
		<div class="flex gap-6 flex-wrap">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Navigation</h4>
				<div class="w-[240px]">
					<List items={navItems} active="#home" size={props.size as any} disabled={props.disabled} />
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Button items</h4>
				<div class="w-[240px]">
					<List
						items={buttonItems}
						value={selected}
						size={props.size as any}
						disabled={props.disabled}
						onselect={handleSelect}
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Grouped</h4>
				<div class="w-[240px]">
					<List
						items={groupedItems}
						collapsible={props.collapsible}
						value={selected}
						size={props.size as any}
						disabled={props.disabled}
						onselect={handleSelect}
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Descriptions</h4>
				<div class="w-[240px]">
					<List
						items={withDescriptions}
						value={selected}
						size={props.size as any}
						disabled={props.disabled}
						onselect={handleSelect}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={selected} />
	{/snippet}
</Playground>
