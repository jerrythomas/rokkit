<script lang="ts">
	import { Tilt } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let props = $state({ maxRotation: 10, perspective: 600, setBrightness: false })

	const schema = {
		type: 'object',
		properties: {
			maxRotation: { type: 'number' },
			perspective: { type: 'number' },
			setBrightness: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/maxRotation', label: 'Max Rotation (°)' },
			{ scope: '#/perspective', label: 'Perspective (px)' },
			{ scope: '#/setBrightness', label: 'Adjust Brightness' }
		]
	}
</script>

<Playground
	title="Tilt"
	description="Parallax 3D tilt effect that responds to mouse movement."
>
	{#snippet preview()}
		<div class="flex gap-8 items-center justify-center p-8">
			<Tilt
				maxRotation={props.maxRotation}
				perspective={props.perspective}
				setBrightness={props.setBrightness}
			>
				<div class="w-48 h-32 rounded-xl bg-primary-z3 flex items-center justify-center text-on-primary shadow-lg">
					<span class="text-lg font-semibold">Hover me</span>
				</div>
			</Tilt>

			<Tilt
				maxRotation={props.maxRotation}
				perspective={props.perspective}
				setBrightness={props.setBrightness}
			>
				<div class="w-48 h-48 rounded-xl bg-surface-z2 flex items-center justify-center shadow-lg">
					<span class="i-lucide:image text-4xl text-surface-z5"></span>
				</div>
			</Tilt>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</Playground>
