<script>
	import { createEventDispatcher } from 'svelte'
	import { elapsed, timer } from '../lib/timer.js'

	const dispatch = createEventDispatcher()

	export let isEnabled = false
	export let currentKeyframe = 0
	export let keyframeCount = 0
	export let duration = 1000

	$: if (isEnabled) currentKeyframe = Math.floor($elapsed / duration)
	$: if (currentKeyframe === keyframeCount) dispatch('end')
	$: isEnabled && currentKeyframe < keyframeCount ? timer.start() : timer.stop()

	function onReset() {
		timer.reset()
		isEnabled = false
		currentKeyframe = 0
	}
</script>

<div class="flex flex-row gap-2 timer">
	<button on:click|preventDefault={() => (isEnabled = true)}>play</button>
	<button on:click|preventDefault={() => (isEnabled = false)}>pause</button>
	<button on:click|preventDefault={onReset}>reset</button>
</div>
