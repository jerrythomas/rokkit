<script>
	import EditItem from './EditItem.svelte'

	export let stages = 2
	export let steps = 0
	export let showLabels = false
	export let formatString = ''
	export let data

	$: ticks = Array.from({ length: steps }, (v, i) => (i + 1) / steps)
</script>

<aside
	class="h-full w-80 flex flex-shrink-0 flex-grow-0 flex-col gap-6 bg-skin-100 p-6"
>
	<label for="stages">
		Number of Stages
		<input type="range" id="stages" bind:value={stages} min="2" max="5" />
	</label>
	<label for="format">
		Format String
		<input type="text" id="format" bind:value={formatString} />
	</label>
	<label for="steps">
		Number of Steps
		<input
			type="range"
			id="steps"
			name="volume"
			bind:value={steps}
			min="0"
			max="8"
		/>
	</label>

	<label for="labels" class="row">
		<input
			type="checkbox"
			id="labels"
			name="labels"
			bind:checked={showLabels}
		/>
		Show Labels
	</label>

	{#if showLabels || steps > 0}
		<label for="data">
			Edit data
			<fieldset id="data">
				{#each data as { label, progress }}
					<EditItem bind:label bind:progress bind:steps />
				{/each}
			</fieldset>
		</label>
		<datalist id="progress-ticks">
			{#each ticks as tick, index}
				<option value={tick}>{index + 1}</option>
			{/each}
		</datalist>
	{/if}
</aside>

<style lang="postcss">
	label {
		@apply flex flex-col gap-2;
	}
	fieldset {
		@apply flex flex-col flex-shrink w-full gap-2 min-w-0;
	}
	.row {
		@apply flex-row items-center;
	}
	:global(.list) {
		@apply p-0;
	}
</style>
