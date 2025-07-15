<script>
	import { InputField } from '@rokkit/ui'

	let value = $state('')
</script>

<InputField 
	bind:value 
	label="Full Name" 
	name="fullname"
	description="Enter your complete name"
	required
/>
<p>Current Value: <b>{value || 'Empty'}</b></p>