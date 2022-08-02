<script>
	import { InputRating, RadioGroup, CheckBox, Rating } from '@sparsh-ui/core'
</script>

<content class="flex flex-col p-4 gap-4">
	<error> this is an error</error>
	<!-- <icon class="rating-empty" /> -->
	<!-- <icon class="rating-filled" /> -->
	<CheckBox value={null} />
	<CheckBox value={false} />
	<CheckBox value={true} />
	<Rating value="3" />
	<Rating
		value="3"
		stateIcons={{ empty: 'i-carbon-moon', filled: 'i-carbon-sun' }}
	/>
	<!-- <CheckBox value={true} label="simple checkbox" /> -->
	<RadioGroup options={[{ label: 'A' }, { label: 'B' }]} />
</content>
