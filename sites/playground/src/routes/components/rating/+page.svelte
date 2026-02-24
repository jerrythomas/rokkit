<script lang="ts">
	import { Rating } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let props = $state({
		value: 3,
		max: 5,
		disabled: false
	})

	const schema = {
		type: 'object',
		properties: {
			value: { type: 'number' },
			max: { type: 'number' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/value', label: 'Value' },
			{ scope: '#/max', label: 'Max Stars' },
			{ scope: '#/disabled', label: 'Disabled' }
		]
	}
</script>

<Playground title="Rating" description="Star/icon rating input with keyboard navigation and hover preview.">
	{#snippet preview()}
		<div class="flex flex-col items-center gap-6 p-4">
			<Rating
				bind:value={props.value}
				max={props.max}
				disabled={props.disabled}
			/>
			<span class="text-sm opacity-60">{props.value} / {props.max}</span>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</Playground>
