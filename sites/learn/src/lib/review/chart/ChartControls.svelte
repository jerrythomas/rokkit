<script>
	import { run } from 'svelte/legacy';

	let { data } = $props();

	let fields = Object.keys(data[0])
	let plots = [
		{ name: 'Box', options: ['Fill'] },
		{ name: 'Violin', options: ['Fill'] },
		{ name: 'Scatter', options: ['Fill', 'Stroke', 'Shape', 'Size'] },
		{ name: 'Line', options: ['DashArray', 'Stroke', 'Size'] }
	]
	let plot = $state('Box')
	let aes = $state()

	function onPlotTypeChange(plot) {
		let currentPlot = plots.filter((x) => x.name === plot)[0]
		aes = ['X Axis', 'Y Axis', ...currentPlot.options].map((label) => ({
			label,
			value: null,
			fields
		}))
	}
	run(() => {
		onPlotTypeChange(plot)
	});
</script>

<control class="w-96 flex flex-col gap-4 border-gray-700 border-l bg-primary-100 p-8">
	<section class="flex flex-col gap-2">
		<p class="border-accent-600 border-b leading-loose">Plot Type</p>
		<div class="flex flex-col">
			{#each plots as { name }}
				<label class="p-0">
					<input type="radio" bind:group={plot} name="plot" value={name} />
					{name}
				</label>
			{/each}
		</div>
	</section>

	<section class="flex flex-col gap-2">
		<p class="border-accent-600 border-b leading-loose">Fields</p>
		{#each aes as attr}
			<label class="flex flex-col gap-2">
				{attr.label}
				<select bind:value={attr.value}>
					{#each attr.fields as name}
						<option>{name}</option>
					{/each}
				</select>
			</label>
		{/each}
	</section>
</control>

<style lang="postcss">
	select {
		@apply leading-loose p-2 border border-primary-500 rounded-md;
	}
</style>
