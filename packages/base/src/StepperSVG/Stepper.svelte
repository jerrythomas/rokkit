<script>
	import Stage from './Stage.svelte'
	import Separator from './Separator.svelte'

	export let size = '10em'
	export let steps = 3
	export let stages

	const stepSize = 6

	$: hasLabels = stages[0].hasOwnProperty('label')
	$: count = stages.length
	$: gap = Math.max(steps || 5, 5) * 3 * stepSize + 2 * stepSize
	$: stageSize = 100
	$: width = (count + 2) * stageSize + (count - 1) * gap
	$: height = stageSize + (hasLabels ? 20 : 0)
</script>

<div class="flex flex-col w-full justify-center border rounded shadow">
	<svg
		viewBox="0 0 {width} {height}"
		height={size}
		class="m-auto flex flex-shrink flex-grow-0"
	>
		{#each stages as { label, progress }, index}
			{@const cx = stageSize + (gap + stageSize) * index}
			<Stage {steps} {cx} cy={stageSize / 2} {progress} number={index + 1} />
			{#if index < stages.length - 1}
				<Separator
					count={steps}
					size={stepSize}
					x={cx + stageSize / 2}
					y={stageSize / 2}
					{progress}
				/>
			{/if}
			{#if hasLabels}
				<text
					x={cx}
					y={stageSize + 5}
					text-anchor="middle"
					alignment-baseline="top"
					font-size=".8em">{label}</text
				>
			{/if}
		{/each}
	</svg>
</div>
