<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let navSelected = $state('#home')
	let buttonSelected = $state(undefined)
	let groupedSelected = $state(undefined)
	let descSelected = $state(undefined)
	let multiSelected = $state([])

	let props = $state({ size: 'md', collapsible: true, disabled: false, multiselect: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			collapsible: { type: 'boolean' },
			disabled: { type: 'boolean' },
			multiselect: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/collapsible', label: 'Collapsible groups' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ scope: '#/multiselect', label: 'Multi-select' },
			{ type: 'separator' }
		]
	}

	const navItems = [
		{ label: 'Home', href: '#home', value: '#home', icon: 'i-glyph:home' },
		{ label: 'Settings', href: '#settings', value: '#settings', icon: 'i-glyph:settings' },
		{ label: 'Profile', href: '#profile', value: '#profile', icon: 'i-glyph:user' },
		{ label: 'Messages', href: '#messages', value: '#messages', icon: 'i-glyph:letter', badge: '3' }
	]

	const buttonItems = [
		{ label: 'Cut', value: 'cut', icon: 'i-glyph:scissors' },
		{ label: 'Copy', value: 'copy', icon: 'i-glyph:copy' },
		{ label: 'Paste', value: 'paste', icon: 'i-glyph:clipboard' },
		{ label: 'Delete', value: 'delete', icon: 'i-glyph:trash-bin', disabled: true }
	]

	const groupedItems = [
		{
			label: 'Favorites',
			children: [
				{ label: 'Dashboard', value: 'dashboard', icon: 'i-glyph:grid' },
				{ label: 'Analytics', value: 'analytics', icon: 'i-glyph:star' }
			]
		},
		{
			label: 'Settings',
			children: [
				{ label: 'General', value: 'general', icon: 'i-glyph:settings' },
				{ label: 'Security', value: 'security', icon: 'i-glyph:heart' }
			]
		}
	]

	const withDescriptions = [
		{
			label: 'Dashboard',
			value: 'dashboard',
			icon: 'i-glyph:grid',
			description: 'Overview of all metrics'
		},
		{
			label: 'Reports',
			value: 'reports',
			icon: 'i-glyph:file-text',
			description: 'Download generated reports'
		},
		{
			label: 'Settings',
			value: 'settings',
			icon: 'i-glyph:settings',
			description: 'Configure preferences'
		}
	]

	function handleButtonSelect(value) {
		buttonSelected = value
	}
	function handleGroupedSelect(value) {
		groupedSelected = value
	}
	function handleDescSelect(value) {
		descSelected = value
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Navigation</h4>
				<div class="w-[240px]">
					<List items={navItems} active="#home" size={props.size} disabled={props.disabled} />
				</div>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Button items</h4>
				<div class="w-[240px]">
					<List
						items={buttonItems}
						value={buttonSelected}
						size={props.size}
						disabled={props.disabled}
						multiselect={props.multiselect}
						bind:selected={multiSelected}
						onselect={handleButtonSelect}
					/>
				</div>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Grouped</h4>
				<div class="w-[240px]">
					<List
						items={groupedItems}
						collapsible={props.collapsible}
						value={groupedSelected}
						size={props.size}
						disabled={props.disabled}
						onselect={handleGroupedSelect}
					/>
				</div>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Descriptions</h4>
				<div class="w-[240px]">
					<List
						items={withDescriptions}
						value={descSelected}
						size={props.size}
						disabled={props.disabled}
						onselect={handleDescSelect}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Button" value={buttonSelected} />
		<InfoField label="Grouped" value={groupedSelected} />
		<InfoField label="Descriptions" value={descSelected} />
		{#if props.multiselect}
			<InfoField label="Selected" value={multiSelected.join(', ')} />
		{/if}
	{/snippet}
</PlaySection>
