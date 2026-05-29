<script>
	import { FormBuilder } from '@rokkit/forms'
	import { flushSync } from 'svelte'

	const builder = new FormBuilder({}, schema, stepLayout)

	// Navigation
	builder.next()         // advance if current step is valid → true/false
	builder.prev()         // go back → true/false
	builder.goToStep(0)    // jump to a completed step (throws if forward)

	// Inspection
	builder.isMultiStep    // true
	builder.totalSteps     // 3
	builder.currentStep    // 0
	builder.canAdvance     // true if not on last step
	builder.elements       // only the current step's fields

	// Validation
	builder.validateStep(0)   // validates a single step → true/false
	builder.validate()        // validates all steps → error map
</script>
