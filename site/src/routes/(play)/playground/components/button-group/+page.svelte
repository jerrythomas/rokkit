<script>
	// @ts-nocheck
	import { Button, ButtonGroup } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({ size: 'md', style: 'default', disabled: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			style: { type: 'string' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{
				scope: '#/style',
				label: 'Button style',
				props: { options: ['default', 'outline', 'ghost'] }
			},
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	let lastClicked = $state('')
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Action group</h4>
				<ButtonGroup size={props.size}>
					<Button
						label="Cut"
						icon="i-lucide:scissors"
						style={props.style}
						size={props.size}
						disabled={props.disabled}
						onclick={() => (lastClicked = 'cut')}
					/>
					<Button
						label="Copy"
						icon="i-lucide:copy"
						style={props.style}
						size={props.size}
						disabled={props.disabled}
						onclick={() => (lastClicked = 'copy')}
					/>
					<Button
						label="Paste"
						icon="i-lucide:clipboard"
						style={props.style}
						size={props.size}
						disabled={props.disabled}
						onclick={() => (lastClicked = 'paste')}
					/>
				</ButtonGroup>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Navigation</h4>
				<ButtonGroup size={props.size}>
					<Button
						label="Previous"
						icon="i-lucide:chevron-left"
						style={props.style}
						size={props.size}
						disabled={props.disabled}
						onclick={() => (lastClicked = 'prev')}
					/>
					<Button
						label="Next"
						icon="i-lucide:chevron-right"
						style={props.style}
						size={props.size}
						disabled={props.disabled}
						onclick={() => (lastClicked = 'next')}
					/>
				</ButtonGroup>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Last clicked" value={lastClicked || '—'} />
	{/snippet}
</PlaySection>
