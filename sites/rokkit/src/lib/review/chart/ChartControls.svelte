<script>
	export let data

	let fields = Object.keys(data[0])
	let plots = [
		{ name: 'Box', options: ['Fill'] },
		{ name: 'Violin', options: ['Fill'] },
		{ name: 'Scatter', options: ['Fill', 'Stroke', 'Shape', 'Size'] },
		{ name: 'Line', options: ['DashArray', 'Stroke', 'Size'] }
	]
	let plot = 'Box'
	let aes
	$: onPlotTypeChange(plot)
	$: update(aes)
	function onPlotTypeChange(plot) {
		let currentPlot = plots.filter((x) => x.name === plot)[0]
		aes = ['X Axis', 'Y Axis', ...currentPlot.options].map((label) => ({
			label,
			value: null,
			fields
		}))
	}
	// Exclude X Axis
	function update(aes) {
		// console.log('Aesthetics updated', aes)
	}
</script>

<control
	class="flex flex-col border-l border-gray-700 p-8 bg-primary-100 gap-4 w-96"
>
	<section class="flex flex-col gap-2">
		<p class="leading-loose border-b border-accent-600">Plot Type</p>
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
		<p class="leading-loose border-b border-accent-600">Fields</p>
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
