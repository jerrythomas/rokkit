<script>
	import { createEventDispatcher } from 'svelte'
	import { brewer, Swatch, initCap } from '@rokkit/chart'

	const dispatch = createEventDispatcher()

	export let modes = ['symbols', 'colors', 'patterns']
	export let mode = 'symbols'
	let status = modes.reduce(
		(acc, key) => (
			(acc[key] = {
				index: key === mode ? -1 : 0,
				active: key === mode
			}),
			acc
		),
		{}
	)
	let swatches = {
		symbols: { items: brewer().shape().brew(), type: 'symbol' },
		colors: {
			items: [
				brewer().color().gray(),
				...brewer().color().brew(),
				...brewer().color().dark().brew()
			],
			type: 'square'
		},
		patterns: {
			items: brewer().pattern().brew(),
			type: 'square'
		}
	}

	$: onModeChange(mode)
	$: onStatusChange(status)

	function onModeChange(mode) {
		modes.map((key) => {
			status[key].active = !(key === mode)
			status[key].index = key === mode ? -1 : 0
		})
	}
	function onStatusChange(status) {
		let result = {
			mode
		}
		modes.map((key) => {
			result[key] = { ...status[key], ...swatches[key] }
		})

		dispatch('change', result)
	}
</script>

<control class="flex flex-col border-l border-gray-700 p-8 bg-primary-100">
	<div class="flex flex-col gap-2">
		<p>Show All Variations for</p>
		{#each modes as label}
			<label class="pl-4">
				<input type="radio" bind:group={mode} name="mode" value={label} />
				{initCap(label)}
			</label>
		{/each}
	</div>
	{#each modes as label}
		{#if label in swatches && status[label].active}
			<Swatch
				label={initCap(label)}
				items={swatches[label].items}
				type={swatches[label].type}
				columns={5}
				interactive={status[label].active}
				bind:activeIndex={status[label].index}
			/>
		{/if}
	{/each}
</control>
