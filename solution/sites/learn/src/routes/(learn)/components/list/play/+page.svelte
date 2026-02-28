<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let navSelected = $state('#home')
	let buttonSelected = $state(undefined)
	let groupedSelected = $state(undefined)
	let descSelected = $state(undefined)

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
		{ label: 'Home', href: '#home', value: '#home', icon: 'i-lucide:home' },
		{ label: 'Settings', href: '#settings', value: '#settings', icon: 'i-lucide:settings' },
		{ label: 'Profile', href: '#profile', value: '#profile', icon: 'i-lucide:user' },
		{ label: 'Messages', href: '#messages', value: '#messages', icon: 'i-lucide:mail' }
	]

	const buttonItems = [
		{ label: 'Cut', value: 'cut', icon: 'i-lucide:scissors' },
		{ label: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
		{ label: 'Paste', value: 'paste', icon: 'i-lucide:clipboard' },
		{ label: 'Delete', value: 'delete', icon: 'i-lucide:trash', disabled: true }
	]

	const groupedItems = [
		{
			label: 'Favorites',
			expanded: true,
			children: [
				{ label: 'Dashboard', value: 'dashboard', icon: 'i-lucide:layout-grid' },
				{ label: 'Analytics', value: 'analytics', icon: 'i-lucide:bar-chart-2' }
			]
		},
		{
			label: 'Settings',
			expanded: true,
			children: [
				{ label: 'General', value: 'general', icon: 'i-lucide:settings' },
				{ label: 'Security', value: 'security', icon: 'i-lucide:shield' }
			]
		}
	]

	const withDescriptions = [
		{ label: 'Dashboard', value: 'dashboard', icon: 'i-lucide:layout-grid' },
		{ label: 'Reports', value: 'reports', icon: 'i-lucide:file-text' },
		{ label: 'Settings', value: 'settings', icon: 'i-lucide:settings' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-6">
			<div>
				<h4 class="m-0 mb-2 text-xs uppercase tracking-wide text-surface-z5">Navigation</h4>
				<div class="w-[240px]">
					<List
						items={navItems}
						value={navSelected}
						size={props.size}
						disabled={props.disabled}
						onselect={(v) => (navSelected = v)}
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs uppercase tracking-wide text-surface-z5">Button items</h4>
				<div class="w-[240px]">
					<List
						items={buttonItems}
						value={buttonSelected}
						size={props.size}
						disabled={props.disabled}
						onselect={(v) => (buttonSelected = v)}
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs uppercase tracking-wide text-surface-z5">Grouped</h4>
				<div class="w-[240px]">
					<List
						items={groupedItems}
						collapsible={props.collapsible}
						value={groupedSelected}
						size={props.size}
						disabled={props.disabled}
						onselect={(v) => (groupedSelected = v)}
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs uppercase tracking-wide text-surface-z5">Simple</h4>
				<div class="w-[240px]">
					<List
						items={withDescriptions}
						value={descSelected}
						size={props.size}
						disabled={props.disabled}
						onselect={(v) => (descSelected = v)}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Nav" value={navSelected} />
		<InfoField label="Button" value={buttonSelected} />
		<InfoField label="Grouped" value={groupedSelected} />
		<InfoField label="Simple" value={descSelected} />
	{/snippet}
</PlaySection>
