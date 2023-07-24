<script>
	import { ValidationReport } from '@rokkit/molecules'

	let items = [
		{ text: 'Should be a number', valid: true, status: 'passed' },
		{ text: 'Should be > 5', valid: false, status: 'failed' },
		{ text: 'Should be < 15', valid: false, optional: true, status: 'warning' }
	]
</script>

<ValidationReport {items} />
