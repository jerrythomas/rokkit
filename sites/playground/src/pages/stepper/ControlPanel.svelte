<script>
	import { list, List } from '@sparsh-ui/list'
	import EditItem from './EditItem.svelte'

	export let stages = 2
	export let steps = 0
	export let showLabels = false
	export let formatString = ''
	export let data

	$: ticks = Array.from({ length: steps }, (v, i) => (i + 1) / steps)
</script>

<aside
	class="flex flex-col p-6 gap-6 h-full bg-skin-100 border-l w-80 flex-shrink-0 overflow-scroll-y"
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
			<fieldset id="data" class="flex flex-col gap-2 w-full list">
				{#each data as { label, progress }}
					<div
						class="flex flex-shrink-0 flex-grow-0 min-h-12 items-center cursor-pointer leading-loose w-full gap-2 item"
					>
						<EditItem bind:label bind:progress bind:steps />
					</div>
				{/each}
			</fieldset>
			<datalist id="progress-ticks">
				{#each ticks as tick, index}
					<option value={tick}>{index + 1}</option>
				{/each}
			</datalist>
		</label>
	{/if}
</aside>

<style lang="postcss">
	label {
		@apply flex flex-col w-full gap-2;
	}
	.row {
		@apply flex-row items-center;
	}
	:global(.list) {
		@apply p-0;
	}
</style>
