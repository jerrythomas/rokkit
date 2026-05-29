<script>
	import { FormBuilder, StepIndicator, FormRenderer } from '@rokkit/forms'

	const schema = { /* ... */ }
	const layout = { /* ... step layout ... */ }

	const builder = new FormBuilder({}, schema, layout)
</script>

<!-- StepIndicator is a standalone presentational component -->
<StepIndicator
	steps={layout.elements.map((el) => el.label)}
	current={builder.currentStep}
	onclick={(i) => builder.goToStep(i)}
/>

<!-- FormRenderer uses the same builder instance -->
<FormRenderer {builder} onsubmit={(data) => console.log(data)} />
