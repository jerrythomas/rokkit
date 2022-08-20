<script>
	// import { v4 as uuid } from '@lukeed/uuid'
	import {
		FieldSet,
		Rating,
		Alerts,
		alerts,
		Input,
		Tabs,
		Range,
		RangeSlider
	} from '@sparsh-ui/core'

	function add() {
		alerts.set([
			...$alerts,
			{
				type: 'info',
				message: 'This is an info message',
				id: $alerts.length + 1
			}
		])
	}
	let value = 'haha'
	let rValue
	let chkValue
	let items = [{ text: 'one' }, { text: 'two' }, { text: 'three' }]
	let activeItem
	let bounds = [0, 100]
	let bounds2 = [0, 20]
	let bounds3 = [0, 30]
	$: console.log(rValue, chkValue)
</script>

<content class="flex flex-col p-4 gap-4">
	<!-- <FieldSet label="group" class="p-4"> -->
	<Tabs {items} bind:activeItem title="[ data ]">
		{activeItem?.text}
		<!-- <Range min="0" max="100" />
		<Range min="0" max="100" count="0" /> -->
		<RangeSlider min={0} max={100} ticks={10} bind:value={bounds} />
		<RangeSlider min={0} max={100} ticks={10} bind:value={bounds2} step={5} />
		<RangeSlider min={0} max={100} ticks={10} bind:value={bounds3} single />
	</Tabs>
	<!-- </FieldSet> -->
	<FieldSet label="group" class="border">
		<icon class="rating-empty" />
		<Rating value="3" />
		<Rating
			value="3"
			stateIcons={{ empty: 'i-carbon-moon', filled: 'i-carbon-sun' }}
		/>
	</FieldSet>
	<Alerts />
</content>
