<script>
	import { ValidationReport } from '@rokkit/molecules'

	let items = [
		{ text: 'Should be a number', valid: true, status: 'pass' },
		{ text: 'Should be > 5', valid: false, status: 'fail' },
		{ text: 'Should be < 15', valid: false, optional: true, status: 'warn' }
	]
</script>

<ValidationReport {items} />
