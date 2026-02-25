<script lang="ts">
	import { ProgressBar } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let props = $state({ value: 65, max: 100 })

	const schema = {
		type: 'object',
		properties: {
			value: { type: 'number' },
			max: { type: 'number' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/value', label: 'Value' },
			{ scope: '#/max', label: 'Max' }
		]
	}
</script>

<Playground
	title="ProgressBar"
	description="Visual indicator of progress or loading state."
>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-8 w-full max-w-md mx-auto">
			<div class="flex flex-col gap-2">
				<span class="text-sm text-surface-z5">Determinate ({props.value}%)</span>
				<ProgressBar value={props.value} max={props.max} />
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-sm text-surface-z5">Indeterminate (loading)</span>
				<ProgressBar />
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</Playground>
