<script>
	// import { v4 as uuid } from '@lukeed/uuid'
	import {
		// FieldSet,
		Calendar,
		Rating,
		// Alerts
		Input,
		CheckBox
		// Tabs,
		// Range,
		// RangeSlider,
		// Select,
		// SpinList
	} from '@rokkit/input'
	// import { FormFields } from '@rokkit/form'
	import { alerts } from '@rokkit/core/stores'

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
	let data = { a: 'one', b: 'two', x: 10, c: { d: 'three', e: 'four' } }
	const fields = [
		{ key: 'a', type: 'input', props: { type: 'text', label: 'a' } },
		{ key: 'b', type: 'input', props: { type: 'textarea', label: 'b' } },
		{ key: 'x', type: 'input', props: { type: 'number', label: 'x' } },
		{
			key: 'c',
			type: 'object',
			props: {
				label: 'c',
				mapping: [
					{ key: 'd', type: 'input', props: { type: 'text', label: 'd' } },
					{ key: 'e', type: 'input', props: { type: 'textarea', label: 'e' } }
				]
			}
		}
	]
</script>

<content class="flex flex-col p-4 gap-4 h-full overflow-scroll">
	<span class="flex justify-center">
		<Calendar />
	</span>
	<Rating />
	<!-- <FormFields mapping={fields} bind:data /> -->
	<Input type="text" value={false} />
	<CheckBox value="false" />
	<!-- <FieldSet label="group" class="p-4"> -->
	<!-- <Select bind:value={x} {options} searchable /> -->
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
