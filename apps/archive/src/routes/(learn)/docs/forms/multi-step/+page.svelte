<script>
	import { Code } from '$lib/components/Story'
	import basic from './snippets/01-basic.svelte?raw'
	import stepIndicator from './snippets/02-step-indicator.svelte?raw'
	import programmatic from './snippets/03-programmatic.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Multi-step forms break a long form into sequential steps. Each step validates independently
		before the user can advance. The built-in Prev / Next / Submit buttons are rendered
		automatically, or you can supply a custom <code>actions</code> snippet.
	</p>

	<h2>Step Layout</h2>
	<p>
		Declare steps by adding <code>type: 'step'</code> elements at the top level of your layout.
		Each step has a <code>label</code> and an <code>elements</code> array of fields:
	</p>
	<Code content={basic} language="svelte" />
	<p>
		<code>FormRenderer</code> automatically detects the step layout and renders only the active
		step's fields. Required fields block advancement to the next step.
	</p>

	<h2>StepIndicator</h2>
	<p>
		<code>StepIndicator</code> is a standalone presentational component. Place it anywhere on the
		page and wire it to a <code>FormBuilder</code> instance:
	</p>
	<Code content={stepIndicator} language="svelte" />
	<p>
		Each step is shown as <code>complete</code>, <code>current</code>, or <code>upcoming</code>.
		Clicking a completed step calls <code>onclick(index)</code> — wire this to
		<code>builder.goToStep()</code> to allow backward navigation.
	</p>

	<h2>Programmatic Control</h2>
	<p>
		Use <code>FormBuilder</code> directly when you need to drive the wizard from your own UI or
		trigger navigation from external buttons:
	</p>
	<Code content={programmatic} language="svelte" />

	<h2>Validation</h2>
	<p>
		<code>next()</code> calls <code>validateStep(currentStep)</code> before advancing. Required
		fields on the current step must pass before the user can proceed. Calling
		<code>validate()</code> on submit checks <em>all</em> steps at once, so any missed fields
		across earlier steps are caught.
	</p>
	<p>Mark individual fields as required in the schema with <code>required: true</code>:</p>
	<pre><code
			>{'{ type: "string", required: true }'}</code
		></pre>

	<h2>Data Attributes</h2>
	<table>
		<thead>
			<tr><th>Attribute</th><th>Element</th><th>Value</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>data-form-step</code></td><td>Form root</td><td
					>Current step index (0-based)</td
				></tr
			>
			<tr
				><td><code>data-form-step-content</code></td><td>Step fields wrapper</td><td
					>Present when multi-step</td
				></tr
			>
			<tr><td><code>data-form-prev</code></td><td>Previous button</td><td>—</td></tr>
			<tr><td><code>data-form-next</code></td><td>Next button</td><td>—</td></tr>
			<tr
				><td><code>data-step-indicator</code></td><td><code>StepIndicator</code> root</td><td
					>—</td
				></tr
			>
			<tr
				><td><code>data-step-item</code></td><td>Each step <code>&lt;li&gt;</code></td><td>—</td
				></tr
			>
			<tr
				><td><code>data-step-state</code></td><td><code>data-step-item</code></td><td
					><code>complete</code> | <code>current</code> | <code>upcoming</code></td
				></tr
			>
		</tbody>
	</table>
</article>
