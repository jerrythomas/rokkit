<script>
	// import { v4 as uuid } from '@lukeed/uuid'
	import {
		FieldSet,
		CheckBox,
		Rating,
		IconButton,
		Icon,
		Alerts,
		alerts,
		Input
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

	$: console.log(rValue, chkValue)
</script>

<content class="flex flex-col p-4 gap-4">
	<Input
		icon="i-iconoir-input-field"
		label="some text"
		name="ff1"
		type="color"
		bind:value
		maxlength="4"
		state="disabled"
	/>

	<IconButton label="sta icon button" leftIcon="i-carbon-star" on:click={add} />

	<Icon name="rating-empty" />

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
