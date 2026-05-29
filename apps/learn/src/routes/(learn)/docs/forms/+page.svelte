<script>
	import { Code } from '$lib/components/Story'
	import schemaDriven from './snippets/00-schema-driven.svelte?raw'
	import autoDerived from './snippets/01-auto-derived.svelte?raw'
	import validateOn from './snippets/02-validate-on.svelte?raw'
	import customValidation from './snippets/03-custom-validation.svelte?raw'
	import lookups from './snippets/04-lookups.svelte?raw'
	import fieldDependencies from './snippets/05-field-dependencies.js?raw'
	import formBuilder from './snippets/06-form-builder.svelte?raw'
	import customActions from './snippets/07-custom-actions.svelte?raw'
	import customRenderers from './snippets/08-custom-renderers.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit Forms let you build complex forms from a JSON schema. Define fields, validation rules,
		and dependencies declaratively — the form builder handles rendering, validation, dirty tracking,
		and dynamic lookups.
	</p>

	<h2>Schema-Driven Forms</h2>
	<p>
		Define your form as a schema with typed properties. If you skip the schema, Rokkit auto-derives
		one from your data:
	</p>
	<Code content={schemaDriven} language="svelte" />

	<h2>Auto-Derived Schema</h2>
	<p>Pass just data — Rokkit infers the schema and layout automatically:</p>
	<Code content={autoDerived} language="svelte" />

	<h2>Validation</h2>
	<p>Add validation rules directly in the schema. Built-in validators handle common patterns:</p>
	<table>
		<thead>
			<tr><th>Rule</th><th>Applies To</th><th>Example</th></tr>
		</thead>
		<tbody>
			<tr><td><code>required</code></td><td>All types</td><td><code>required: true</code></td></tr>
			<tr
				><td><code>min</code> / <code>max</code></td><td>Numbers</td><td
					><code>min: 18, max: 120</code></td
				></tr
			>
			<tr
				><td><code>minLength</code> / <code>maxLength</code></td><td>Strings</td><td
					><code>minLength: 8</code></td
				></tr
			>
			<tr><td><code>pattern</code></td><td>Strings</td><td><code>pattern: '^[A-Z]'</code></td></tr>
			<tr><td><code>format</code></td><td>Strings</td><td><code>format: 'email'</code></td></tr>
			<tr><td><code>enum</code></td><td>Strings</td><td><code>enum: ['a', 'b']</code></td></tr>
		</tbody>
	</table>
	<p>
		Control when validation triggers with the <code>validateOn</code> prop:
	</p>
	<Code content={validateOn} language="svelte" />
	<p>
		Add custom validation logic with the <code>onvalidate</code> callback:
	</p>
	<Code content={customValidation} language="svelte" />

	<h2>Lookups</h2>
	<p>Populate select fields dynamically using lookups. Three patterns are supported:</p>
	<Code content={lookups} language="svelte" />

	<h2>Field Dependencies</h2>
	<p>
		When a lookup declares <code>dependsOn</code>, changing the dependency field automatically
		clears the dependent field's value and re-fetches its options. Fields with unmet dependencies
		are disabled until all required values are set.
	</p>
	<Code content={fieldDependencies} language="javascript" />

	<h2>FormBuilder</h2>
	<p>
		For programmatic control, use <code>FormBuilder</code> directly:
	</p>
	<Code content={formBuilder} language="svelte" />

	<h2>Custom Actions</h2>
	<p>
		Override the default Submit/Reset buttons with a custom <code>actions</code> snippet:
	</p>
	<Code content={customActions} language="svelte" />

	<h2>Custom Renderers</h2>
	<p>
		Replace any built-in control by passing a custom component via the <code>renderers</code> prop.
		Each entry maps a key to a Svelte component. Reference it in the layout element's
		<code>props.renderer</code>:
	</p>
	<Code content={customRenderers} language="svelte" />
	<p>
		Any custom renderer receives <code>bind:value</code>, <code>onchange</code>,
		<code>disabled</code>, and all props defined in the layout element's <code>props</code> object.
		Built-in keys like <code>toggle</code>, <code>switch</code>, <code>swatch</code> are already registered
		— pass your own key to add new ones or override existing ones.
	</p>
	<table>
		<thead>
			<tr><th>Use case</th><th>renderer key</th><th>Replaces</th></tr>
		</thead>
		<tbody>
			<tr
				><td>Color / pattern swatch</td><td><code>swatch</code></td><td><code>select</code></td></tr
			>
			<tr
				><td>Segmented toggle</td><td><code>toggle</code></td><td
					><code>select</code> / <code>radio</code></td
				></tr
			>
			<tr><td>Boolean switch</td><td><code>switch</code></td><td><code>checkbox</code></td></tr>
			<tr><td>Any custom component</td><td>your key</td><td>any built-in</td></tr>
		</tbody>
	</table>

	<h2>Related</h2>
	<ul>
		<li><a href="/field-mapping">Field Mapping</a> — How fields map data to component props</li>
		<li><a href="/state-management">State Management</a> — Value binding and change events</li>
		<li><a href="/components/select">Select</a> — Dropdown component used in form selects</li>
	</ul>
</article>
