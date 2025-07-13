<script>
	import { InputField } from '@rokkit/ui'

	let value = $state('')
</script>

<InputField 
	bind:value 
	label="Search" 
	nolabel 
	placeholder="Type to search..."
/>
<p>Search Value: <b>{value || 'Empty'}</b></p>