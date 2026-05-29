<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
</script>

<article data-article-root>
	<p>
		The <code>FormRenderer</code> component renders forms from a JSON schema and layout descriptor. It
		handles input binding, validation, dirty tracking, conditional visibility, nested groups, and lookup
		fields — all driven by configuration, not code.
	</p>

	<h2>Quick Start</h2>
	<p>
		Import <code>FormRenderer</code> from <code>@rokkit/forms</code>. Provide a JSON Schema (<code
			>schema</code
		>), a layout descriptor (<code>layout</code>), and bind <code>data</code>
		for two-way sync.
	</p>
	<Code
		language="svelte"
		content={`<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', email: '' })

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' }
    },
    required: ['name', 'email']
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/name', label: 'Name' },
      { scope: '#/email', label: 'Email' }
    ]
  }
<\/script>

<FormRenderer bind:data {schema} {layout} validateOn="blur" />`}
	/>

	<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>data</strong> (bindable): The form data object — mutated in place</li>
				<li><strong>schema</strong>: JSON Schema describing field types and validation rules</li>
				<li><strong>layout</strong>: Layout descriptor — elements, groups, display components</li>
				<li>
					<strong>validateOn</strong>: When to validate — <code>"blur"</code>,
					<code>"change"</code>, <code>"submit"</code>
				</li>
				<li><strong>disabled</strong>: Disable all inputs</li>
				<li><strong>readonly</strong>: Render all fields as read-only display</li>
			</ul>
		</div>
		<div data-card>
			<h2>Events</h2>
			<ul>
				<li><strong>onchange(data, errors)</strong>: Fires on any field change</li>
				<li><strong>onsubmit(data)</strong>: Fires when form is submitted and valid</li>
				<li><strong>onerror(errors)</strong>: Fires when validation fails on submit</li>
			</ul>
		</div>
	</div>

	<div data-card class="mt-6">
		<h2>Layout Element Types</h2>
		<ul>
			<li>
				<strong>scope</strong>: JSON Pointer to a schema property (e.g. <code>#/address/city</code>)
			</li>
			<li><strong>type: "group"</strong>: Wraps children in a labelled section</li>
			<li><strong>type: "horizontal"</strong>: Side-by-side layout for multiple fields</li>
			<li><strong>type: "display"</strong>: Read-only display component (table, list, card)</li>
		</ul>
	</div>

	<p class="text-surface-z5 mt-6">
		See the <a href="/docs/forms">Forms guide</a> for conditional fields, lookup sources, and multi-step
		forms.
	</p>
</article>
