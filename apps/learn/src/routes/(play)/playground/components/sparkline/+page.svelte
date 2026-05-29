<script>
	// @ts-nocheck
	import { Sparkline } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const numericData = [12, 45, 23, 67, 34, 89, 56, 72, 41, 90]
	const objectData = [
		{ month: 'Jan', revenue: 42 },
		{ month: 'Feb', revenue: 85 },
		{ month: 'Mar', revenue: 61 },
		{ month: 'Apr', revenue: 93 },
		{ month: 'May', revenue: 38 },
		{ month: 'Jun', revenue: 77 }
	]

	let props = $state({
		type: 'line',
		curve: 'linear',
		color: 'primary',
		width: 80,
		height: 24
	})

	const schema = {
		type: 'object',
		properties: {
			type: { type: 'string' },
			curve: { type: 'string' },
			color: { type: 'string' },
			width: { type: 'number' },
			height: { type: 'number' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/type', label: 'Type', props: { options: ['line', 'bar', 'area'] } },
			{ scope: '#/curve', label: 'Curve', props: { options: ['linear', 'smooth'] } },
			{
				scope: '#/color',
				label: 'Color',
				props: { options: ['primary', 'danger', 'success', 'warning', 'accent'] }
			},
			{ scope: '#/width', label: 'Width' },
			{ scope: '#/height', label: 'Height' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
					Numeric Array
				</h4>
				<Sparkline
					data={numericData}
					type={props.type}
					curve={props.curve}
					color={props.color}
					width={props.width}
					height={props.height}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
					Object Array with field
				</h4>
				<Sparkline
					data={objectData}
					field="revenue"
					type={props.type}
					curve={props.curve}
					color={props.color}
					width={props.width}
					height={props.height}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
					Inline in text
				</h4>
				<p class="text-surface-z6 text-sm">
					Revenue <Sparkline
						data={numericData}
						width={60}
						height={16}
						type={props.type}
						curve={props.curve}
						color={props.color}
					/> trend
				</p>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Type" value={props.type} />
		<InfoField label="Color" value={props.color} />
	{/snippet}
</PlaySection>
