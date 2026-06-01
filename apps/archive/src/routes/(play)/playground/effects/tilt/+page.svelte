<script>
	// @ts-nocheck
	import { Tilt } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

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

<PlaySection>
	{#snippet preview()}
		<div class="flex items-center justify-center gap-8 p-8">
			<Tilt
				maxRotation={props.maxRotation}
				perspective={props.perspective}
				setBrightness={props.setBrightness}
			>
				<div
					class="bg-primary-z3 text-on-primary flex h-32 w-48 items-center justify-center rounded-xl shadow-lg"
				>
					<span class="text-lg font-semibold">Hover me</span>
				</div>
			</Tilt>

			<Tilt
				maxRotation={props.maxRotation}
				perspective={props.perspective}
				setBrightness={props.setBrightness}
			>
				<div class="bg-surface-z2 flex h-48 w-48 items-center justify-center rounded-xl shadow-lg">
					<span class="i-glyph:gallery text-surface-z5 text-4xl"></span>
				</div>
			</Tilt>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
