<script>
	import { Stepper, StepperSVG } from '@sparsh-ui/base'
	import ControlPanel from './ControlPanel.svelte'

	export let data = []
	export let stages = 5
	export let steps = 4
	export let showLabels = true
	export let formatString = '02'

	let clickData
	function handleClick(e) {
		clickData = e.detail
	}

	$: filtered = showLabels
		? data.slice(0, stages)
		: data.slice(0, stages).map((d) => ({ progress: d.progress }))
</script>

<section class="w-full flex flex-col p-8">
	<Stepper stages={filtered} {steps} {formatString} on:click={handleClick} />
	<!-- <StepperSVG size="8em" {steps} stages={filtered} /> -->
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
