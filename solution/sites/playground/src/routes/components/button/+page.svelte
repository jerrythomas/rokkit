<script lang="ts">
	import { Button } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let props = $state({
		variant: 'default',
		style: 'default',
		size: 'md',
		label: 'Click me',
		icon: '',
		disabled: false,
		loading: false,
		asLink: false
	})

	const schema = {
		type: 'object',
		properties: {
			variant: { type: 'string' },
			style: { type: 'string' },
			size: { type: 'string' },
			label: { type: 'string' },
			icon: { type: 'string' },
			disabled: { type: 'boolean' },
			loading: { type: 'boolean' },
			asLink: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/variant', label: 'Variant', props: { options: ['default', 'primary', 'secondary', 'danger'] } },
			{ scope: '#/style', label: 'Style', props: { options: ['default', 'outline', 'ghost', 'gradient', 'link'] } },
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/label', label: 'Label' },
			{ scope: '#/icon', label: 'Icon', props: { options: ['', 'i-lucide:star', 'i-lucide:heart', 'i-lucide:plus', 'i-lucide:settings', 'i-lucide:download'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ scope: '#/loading', label: 'Loading' },
			{ scope: '#/asLink', label: 'As link (href)' },
			{ type: 'separator' }
		]
	}

	let lastClicked = $state('')

	function handleClick() {
		lastClicked = new Date().toLocaleTimeString()
	}
</script>

<Playground
	title="Button"
	description="Buttons with variants, styles, sizes, loading states, and icon support."
>
	{#snippet preview()}
		<Button
			variant={props.variant as any}
			style={props.style as any}
			size={props.size as any}
			label={props.label}
			icon={props.icon || undefined}
			disabled={props.disabled}
			loading={props.loading}
			href={props.asLink ? 'https://example.com' : undefined}
			target={props.asLink ? '_blank' : undefined}
			onclick={handleClick}
		/>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Last clicked" value={lastClicked || '—'} />
	{/snippet}
</Playground>
