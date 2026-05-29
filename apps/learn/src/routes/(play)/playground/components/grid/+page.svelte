<script>
	// @ts-nocheck
	import { Grid } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({ size: 'md', minSize: '120px', gap: '1rem', disabled: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			minSize: { type: 'string' },
			gap: { type: 'string' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{
				scope: '#/minSize',
				label: 'Min tile size',
				props: { options: ['80px', '120px', '160px', '200px'] }
			},
			{ scope: '#/gap', label: 'Gap', props: { options: ['0.5rem', '1rem', '1.5rem', '2rem'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const items = [
		{ label: 'Dashboard', icon: 'i-glyph:widget', value: 'dashboard' },
		{ label: 'Analytics', icon: 'i-glyph:chart-2', value: 'analytics' },
		{ label: 'Users', icon: 'i-glyph:users', value: 'users' },
		{ label: 'Settings', icon: 'i-glyph:settings', value: 'settings' },
		{ label: 'Messages', icon: 'i-glyph:message', value: 'messages' },
		{ label: 'Files', icon: 'i-glyph:folder', value: 'files' },
		{ label: 'Calendar', icon: 'i-glyph:calendar', value: 'calendar' },
		{ label: 'Reports', icon: 'i-glyph:file-text', value: 'reports' }
	]

	let selected = $state('dashboard')
</script>

<PlaySection>
	{#snippet preview()}
		<div class="w-full">
			<Grid
				{items}
				bind:value={selected}
				size={props.size}
				minSize={props.minSize}
				gap={props.gap}
				disabled={props.disabled}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={selected || '—'} />
	{/snippet}
</PlaySection>
