<script>
	import { Stepper, Range, ProgressDots } from '@rokkit/ui'
	import ControlPanel from './ControlPanel.svelte'
	import { data } from './data'

	let {
		stages = 5,
		steps = 4,
		showLabels = true,
		formatString = '02',
		currentStage = 0,
		currentStep = 0
	} = $props()

	/**
	 * @typedef {Object} ClickData
	 * @property {number} stage
	 * @property {number} progress
	 * @property {number} step
	 */
	let clickData = {}

	/**
	 * @param {CustomEvent<ClickData>} e
	 */
	function handleClick(e) {
		clickData = e.detail
	}

	let filtered = $derived(
		showLabels
			? data.slice(0, stages)
			: data.slice(0, stages).map((d) => ({ progress: d.progress }))
	)
</script>

<section class="flex flex-grow flex-col p-8">
	<ProgressDots count={5} value={-1} current={-1} />
	<Stepper data={filtered} {steps} {currentStage} {currentStep} onclick={handleClick} />
	<div class="flex p-6" style:width="100px">
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
<ControlPanel bind:stages bind:steps bind:showLabels data={filtered} bind:formatString />
