<script>
	// import { v4 as uuid } from '@lukeed/uuid'
	import {
		FieldSet,
		Rating,
		Alerts,
		alerts,
		Input,
		Tabs,
		Range
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
	$: console.log(rValue, chkValue)
</script>

<content class="flex flex-col p-4 gap-4">
	<!-- <FieldSet label="group" class="p-4"> -->
	<Tabs {items} bind:activeItem title="[ data ]">
		{activeItem?.text}
		<Range min="0" max="100" />
		<Range min="0" max="100" count="0" />
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
