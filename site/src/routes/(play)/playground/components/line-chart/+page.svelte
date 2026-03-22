<script>
	// @ts-nocheck
	import { LineChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// Multi-region monthly data for multi-series demos
	const multiData = [
		{ month: 'Jan', value: 32000, region: 'North' },
		{ month: 'Feb', value: 41000, region: 'North' },
		{ month: 'Mar', value: 38000, region: 'North' },
		{ month: 'Apr', value: 52000, region: 'North' },
		{ month: 'May', value: 61000, region: 'North' },
		{ month: 'Jun', value: 58000, region: 'North' },
		{ month: 'Jan', value: 25000, region: 'South' },
		{ month: 'Feb', value: 31000, region: 'South' },
		{ month: 'Mar', value: 45000, region: 'South' },
		{ month: 'Apr', value: 38000, region: 'South' },
		{ month: 'May', value: 47000, region: 'South' },
		{ month: 'Jun', value: 53000, region: 'South' },
		{ month: 'Jan', value: 18000, region: 'East' },
		{ month: 'Feb', value: 22000, region: 'East' },
		{ month: 'Mar', value: 19000, region: 'East' },
		{ month: 'Apr', value: 28000, region: 'East' },
		{ month: 'May', value: 35000, region: 'East' },
		{ month: 'Jun', value: 31000, region: 'East' }
	]

	let props = $state({
		colorField: '',
		curve: 'linear',
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			curve: { type: 'string' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'region'] }
			},
			{
				scope: '#/curve',
				label: 'Curve',
				props: { options: ['linear', 'smooth', 'step'] }
			},
			{ scope: '#/grid', label: 'Grid' },
			{ scope: '#/legend', label: 'Legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Regional Revenue by Month
				</h4>
				<LineChart
					data={multiData}
					x="month"
					y="value"
					color={props.colorField || undefined}
					curve={props.curve}
					grid={props.grid}
					legend={props.legend}
					width={560}
					height={320}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Curve" value={props.curve} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
