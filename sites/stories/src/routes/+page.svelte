<script>
	// import { v4 as uuid } from '@lukeed/uuid'
	import {
		FieldSet,
		Calendar,
		Rating,
		Alerts,
		alerts,
		Input,
		Tabs,
		Range,
		RangeSlider,
		Select
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
	let x
	let options = [
		{ text: 'one' },
		{ text: 'two' },
		{ text: 'three' },
		{ text: 'four' },
		{ text: 'five' },
		{ text: 'six' }
	]
</script>

<content class="flex flex-col p-4 gap-4">
	<span class="flex gap-2 text-secondary">
		<icon class="i-sparsh:input-text" />
		<icon class="i-sparsh:input-date" />
		<icon class="i-sparsh:input-time" />
	</span>

	<span class="flex justify-center">
		<Calendar />
	</span>
	<Rating />
	<!-- <FieldSet label="group" class="p-4"> -->
	<Select bind:value={x} {options} searchable />
	<!-- <Tabs {items} bind:activeItem title="[ data ]">
		{activeItem?.text}
		<Range min={10} max={100} tickStep={10} step={1} />
		<Range min={0} max={100} step={10} />
		<RangeSlider
			min={0}
			max={100}
			tickStep={2}
			labelSkip={4}
			bind:value={bounds}
		/>
		<RangeSlider
			min={10}
			max={100}
			tickStep={10}
			bind:value={bounds2}
			step={5}
			class="bookend"
		/>
		<RangeSlider min={0} max={100} tickStep={10} bind:value={bounds3} single />
	</Tabs> -->
	<!-- </FieldSet> -->
	<!-- <FieldSet label="group" class="border">
		<icon class="rating-empty" />
		<Rating value="3" />
		<Rating
			value="3"
			stateIcons={{ empty: 'i-carbon-moon', filled: 'i-carbon-sun' }}
		/>
	</FieldSet>
	<Alerts /> -->
</content>
