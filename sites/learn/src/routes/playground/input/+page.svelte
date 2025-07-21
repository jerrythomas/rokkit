<script>
	import { InputField } from '@rokkit/forms'

	// List of input types to showcase
	let inputTypes = [
		{ type: 'text', label: 'Text', placeholder: 'Enter text...' },
		{ type: 'email', label: 'Email', placeholder: 'your@email.com' },
		{ type: 'password', label: 'Password', placeholder: '••••••••' },
		{ type: 'number', label: 'Number', placeholder: '42' },
		{ type: 'search', label: 'Search', placeholder: 'Search...' },
		{ type: 'tel', label: 'Telephone', placeholder: '+1 555 123 4567' },
		{ type: 'url', label: 'URL', placeholder: 'https://example.com' },
		{ type: 'date', label: 'Date' },
		{ type: 'time', label: 'Time' },
		{ type: 'color', label: 'Color' },
		{ type: 'checkbox', label: 'Checkbox', variant: 'custom' },
		{ type: 'switch', label: 'Switch' },
		{ type: 'textarea', label: 'Textarea', placeholder: 'Multiline text...' }
	]

	// State for each input
	let values = $state(inputTypes.reduce((acc, input) => ({ ...acc, [input.type]: null }), {}))
	let messages = $state({})

	function getDescription(input) {
		const val = values[input.type]
		if (input.type === 'checkbox' || input.type === 'switch') {
			return val === true
				? 'Current value: true'
				: val === false
					? 'Current value: false'
					: 'Set me!'
		}
		return val && val !== '' ? `Current value: ${val}` : 'Set me!'
	}

	function handleChange(type, event) {
		// values[type] =
		// 	event?.target?.type === 'checkbox' || event?.target?.type === 'switch'
		// 		? event.target.checked
		// 		: event.target.value
		// Example: show error for empty required fields
		if (['text', 'email', 'password', 'number'].includes(type) && !values[type]) {
			messages[type] = 'This field is required.'
		} else {
			messages[type] = ''
		}
	}
</script>

<div class="input-playground flex flex-col gap-8 p-8">
	<h1 class="mb-4 text-2xl font-bold">InputField Theme Playground</h1>
	<p class="text-neutral-z7 mb-8">
		Test Rokkit theme and layout styles for all supported input types below.
	</p>
	<div class="bg-neutral-z3 grid grid-cols-1 gap-8 rounded-md p-4 md:grid-cols-2">
		{#each inputTypes as input, idx (idx)}
			<div class=" flex flex-col gap-2">
				<!-- {#if input.type !== 'checkbox'} -->
				<InputField
					name={input.type}
					type={input.type}
					label={input.label}
					variant={input.variant}
					description={getDescription(input)}
					placeholder={input.placeholder}
					bind:value={values[input.type]}
					required={['text', 'email', 'password', 'number'].includes(input.type)}
					message={messages[input.type]}
					on:change={(e) => handleChange(input.type, e)}
					class="w-full"
				/>
				<!-- {/if} -->
			</div>
		{/each}
	</div>
</div>
