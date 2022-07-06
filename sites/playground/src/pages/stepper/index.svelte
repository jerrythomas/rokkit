<script>
	import { Stepper, Range, ProgressDots } from '@sparsh-ui/base'
	import ControlPanel from './ControlPanel.svelte'

	export let data = []
	export let stages = 5
	export let steps = 4
	export let showLabels = true
	export let formatString = '02'
	export let currentStage = 2
	export let currentStep = 2

	let clickData
	function handleClick(e) {
		clickData = e.detail
	}

	$: filtered = showLabels
		? data.slice(0, stages)
		: data.slice(0, stages).map((d) => ({ progress: d.progress }))
</script>

<section class="flex flex-col flex-grow p-8">
	<ProgressDots count={5} value={-1} current={-1} />
	<Stepper
		data={filtered}
		{steps}
		{currentStage}
		{currentStep}
		on:click={handleClick}
	/>
	<div class="flex p-6" width="100px">
		<Range />
	</div>

	{#if clickData}
		<div class="flex flex-col p-4 gap-4">
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
<ControlPanel
	bind:stages
	bind:steps
	bind:showLabels
	bind:data={filtered}
	bind:formatString
/>
