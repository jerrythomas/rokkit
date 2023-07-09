<script>
	import { ValidationReport } from '@rokkit/atoms'

	let items = [
		{ text: 'Should be a number', valid: true },
		{ text: 'Should be > 5', valid: false },
		{ text: 'Should be < 15', valid: false, optional: true }
	]
</script>

<ValidationReport {items} />
