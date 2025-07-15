<script>
	import { ValidationReport } from '@rokkit/ui'

	let items = $state([
		{ text: 'Should be a number', valid: true, status: 'pass' },
		{ text: 'Should be greater than 5', valid: false, status: 'fail' },
		{ text: 'Should be less than 15', valid: false, optional: true, status: 'warn' },
		{ text: 'Must contain at least 8 characters', valid: true, status: 'pass' },
		{ text: 'Should include special characters', valid: false, optional: true, status: 'warn' }
	])
	
	// Example of dynamic validation
	let inputValue = $state('123')
	
	$: dynamicValidation = [
		{ 
			text: 'Is a number', 
			valid: !isNaN(Number(inputValue)), 
			status: !isNaN(Number(inputValue)) ? 'pass' : 'fail' 
		},
		{ 
			text: 'Greater than 5', 
			valid: Number(inputValue) > 5, 
			status: Number(inputValue) > 5 ? 'pass' : 'fail' 
		},
		{ 
			text: 'Less than 100', 
			valid: Number(inputValue) < 100, 
			status: Number(inputValue) < 100 ? 'pass' : Number(inputValue) < 1000 ? 'warn' : 'fail',
			optional: Number(inputValue) >= 100 && Number(inputValue) < 1000
		}
	]
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium mb-3">Static Validation Report</h3>
		<ValidationReport {items} />
	</div>
	
	<div>
		<h3 class="text-lg font-medium mb-3">Dynamic Validation Example</h3>
		<div class="mb-4">
			<label class="block text-sm font-medium mb-2">Enter a number:</label>
			<input 
				bind:value={inputValue}
				class="border rounded px-3 py-2 w-32"
				placeholder="Enter number"
			/>
		</div>
		<ValidationReport items={dynamicValidation} />
	</div>
</div>