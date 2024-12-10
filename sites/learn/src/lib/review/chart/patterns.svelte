<script>
	import { brewer, Swatch } from '@rokkit/charts'
	import ControlPanel from './ControlPanel.svelte'

	let variations = $state(brewer().pattern().brew())

	function changeHandler(event) {
		if (event.detail.mode === 'patterns') {
			variations = brewer()
				.pattern()
				.colors(event.detail.colors.items[event.detail.colors.index], true)
				.brew()
		} else if (event.detail.mode == 'colors') {
			variations = brewer()
				.pattern()
				.filter(event.detail.colors.items.map(() => event.detail.patterns.index))
				.colors(event.detail.colors.items)
				.brew()
		} else {
			variations = brewer()
				.pattern()
				.filter(event.detail.patterns.index)
				.colors(event.detail.colors.items[event.detail.colors.index], true)
				.variants(6)
				.brew()
		}
	}
</script>

<div class="flex h-full flex-row">
	<content class="flex-grow px-8">
		<h1>Patterns</h1>
		<Swatch items={variations} type="circle" size={60} columns={7} autoscale />
	</content>

	<ControlPanel
		modes={['patterns', 'colors', 'angles']}
		mode={'patterns'}
		on:change={changeHandler}
	/>
</div>
