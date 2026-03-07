<script>
	// @ts-nocheck
	import { Shine } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({ radius: 300, depth: 1, surfaceScale: 2, specularConstant: 0.75, specularExponent: 120 })

	const schema = {
		type: 'object',
		properties: {
			radius: { type: 'number' },
			depth: { type: 'number' },
			surfaceScale: { type: 'number' },
			specularConstant: { type: 'number' },
			specularExponent: { type: 'number' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/radius', label: 'Radius (light height)' },
			{ scope: '#/depth', label: 'Depth (blur)' },
			{ scope: '#/surfaceScale', label: 'Surface Scale' },
			{ scope: '#/specularConstant', label: 'Specular Constant' },
			{ scope: '#/specularExponent', label: 'Specular Exponent' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex gap-8 items-center justify-center p-8">
			<Shine
				radius={props.radius}
				depth={props.depth}
				surfaceScale={props.surfaceScale}
				specularConstant={props.specularConstant}
				specularExponent={props.specularExponent}
			>
				<div class="w-48 h-32 rounded-xl bg-primary-z3 flex items-center justify-center text-on-primary">
					<span class="text-lg font-semibold">Shine effect</span>
				</div>
			</Shine>

			<Shine
				radius={props.radius}
				depth={props.depth}
				surfaceScale={props.surfaceScale}
				specularConstant={props.specularConstant}
				specularExponent={props.specularExponent}
				color="rgb(var(--accent-500))"
			>
				<div class="w-48 h-48 rounded-xl bg-surface-z2 flex items-center justify-center">
					<span class="i-lucide:diamond text-4xl text-surface-z5"></span>
				</div>
			</Shine>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
