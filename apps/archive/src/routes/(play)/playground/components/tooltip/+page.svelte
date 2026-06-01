<script>
	// @ts-nocheck
	import { Tooltip, Button } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		content: 'This is a tooltip',
		position: 'top',
		delay: 300
	})

	const schema = {
		type: 'object',
		properties: {
			content: { type: 'string' },
			position: { type: 'string' },
			delay: { type: 'number' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/content', label: 'Content' },
			{
				scope: '#/position',
				label: 'Position',
				props: { options: ['top', 'bottom', 'left', 'right'] }
			},
			{ scope: '#/delay', label: 'Delay (ms)' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col items-center justify-center gap-12 p-12">
			<div class="flex flex-wrap items-center justify-center gap-8">
				<Tooltip content={props.content} position={props.position} delay={props.delay}>
					<Button>Hover or focus me</Button>
				</Tooltip>

				<Tooltip content="Always on top" position="top">
					<Button variant="primary">Top</Button>
				</Tooltip>

				<Tooltip content="Always on bottom" position="bottom">
					<Button variant="primary">Bottom</Button>
				</Tooltip>

				<Tooltip content="Always on left" position="left">
					<Button variant="primary">Left</Button>
				</Tooltip>

				<Tooltip content="Always on right" position="right">
					<Button variant="primary">Right</Button>
				</Tooltip>
			</div>

			<div>
				<Tooltip position="top">
					{#snippet tooltipContent()}
						<strong>Rich content:</strong> supports snippets
					{/snippet}
					<Button variant="secondary">Rich tooltip</Button>
				</Tooltip>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
