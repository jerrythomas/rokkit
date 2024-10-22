<script>
	import { run } from 'svelte/legacy';

	import { Stepper, Range, ProgressDots } from '@rokkit/ui'
	import ControlPanel from './ControlPanel.svelte'
	import { data } from './data'

	/**
	 * @typedef {Object} Props
	 * @property {number} [stages]
	 * @property {number} [steps]
	 * @property {boolean} [showLabels]
	 * @property {string} [formatString]
	 * @property {number} [currentStage]
	 * @property {number} [currentStep]
	 */

	/** @type {Props} */
	let {
		stages = $bindable(5),
		steps = $bindable(4),
		showLabels = $bindable(true),
		formatString = $bindable('02'),
		currentStage = 2,
		currentStep = 2
	} = $props();

	let clickData = $state()
	function handleClick(e) {
		clickData = e.detail
	}

	let filtered;
	run(() => {
		filtered = showLabels
			? data.slice(0, stages)
			: data.slice(0, stages).map((d) => ({ progress: d.progress }))
	});
</script>

<section class="flex flex-grow flex-col p-8">
	<ProgressDots count={5} value={-1} current={-1} />
	<Stepper data={filtered} {steps} {currentStage} {currentStep} on:click={handleClick} />
	<div class="flex p-6" width="100px">
		<Range />
	</div>

	{#if clickData}
		<div class="flex flex-col gap-4 p-4">
			{#if clickData.step}
				<p>You clicked on a stage</p>
			{:else}
				<p>You clicked on a step</p>
			{/if}
			<p>Stage: {clickData.stage}</p>
			<p>Progress: {clickData.progress}</p>
			{#if clickData.step}
				<p>Step: {clickData.step}</p>
			{/if}
		</div>
	{/if}
</section>
<ControlPanel bind:stages bind:steps bind:showLabels bind:data={filtered} bind:formatString />
