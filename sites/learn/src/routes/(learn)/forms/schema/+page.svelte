<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root><h1>Introduction</h1>
		<p>
			Form schemas provide a powerful way to define the structure, validation rules, and display properties of your forms. By using schemas, you can progressively enhance basic forms with sophisticated validation, custom input types, and field-specific configurations.
		</p>

		<h1>Key Benefits:</h1>
		<ul>
			<li>Declarative form structure definition</li>
			<li>Built-in validation rule management</li>
			<li>Type-safe form field configuration</li>
			<li>Reusable schema patterns</li>
			<li>Automatic error handling and display</li>
			<li>Progressive enhancement of basic forms</li>
		</ul>

		<h1>Schema Example</h1>
		<p>
			Here's how schemas enhance basic forms with validation and field configuration:
		</p>

		<StoryViewer {...storyBuilder.getExample('schema')} />
<h1>Basic Schema Structure</h1>
		<p>
			A form schema is an object that maps field names to their configuration. Each field can specify its type, validation rules, display properties, and behavior.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<h1>Schema Properties</h1>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Field Configuration</h1>
				<ul>
					<li><strong>type</strong>: Input type (text, email, number, etc.)</li>
					<li><strong>label</strong>: Display label for the field</li>
					<li><strong>placeholder</strong>: Placeholder text</li>
					<li><strong>required</strong>: Whether field is required</li>
				</ul>
			</div>

			<div data-card>
				<h1>Validation Rules</h1>
				<ul>
					<li><strong>min/max</strong>: Length or value constraints</li>
					<li><strong>pattern</strong>: Regular expression validation</li>
					<li><strong>custom</strong>: Custom validation functions</li>
					<li><strong>messages</strong>: Custom error messages</li>
				</ul>
			</div>
		</div>
<h1>Supported Field Types</h1>
		<p>
			Rokkit forms support a wide variety of field types, each with specific validation and display behaviors.
		</p>

		<h1>Text Input Types</h1>
		<ul>
			<li><strong>text</strong>: Basic text input</li>
			<li><strong>email</strong>: Email address with validation</li>
			<li><strong>password</strong>: Password input with masking</li>
			<li><strong>tel</strong>: Telephone number input</li>
			<li><strong>url</strong>: URL input with validation</li>
			<li><strong>textarea</strong>: Multi-line text input</li>
		</ul>

		<h1>Numeric and Date Types</h1>
		<ul>
			<li><strong>number</strong>: Numeric input with step controls</li>
			<li><strong>range</strong>: Slider input for numeric ranges</li>
			<li><strong>date</strong>: Date picker input</li>
			<li><strong>time</strong>: Time selection input</li>
			<li><strong>datetime-local</strong>: Combined date and time</li>
		</ul>

		<h1>Selection Types</h1>
		<ul>
			<li><strong>select</strong>: Dropdown selection</li>
			<li><strong>radio</strong>: Radio button groups</li>
			<li><strong>checkbox</strong>: Individual checkboxes</li>
			<li><strong>checkboxes</strong>: Checkbox groups</li>
		</ul>
<h1>Validation Rules</h1>
		<p>
			Schema validation rules provide comprehensive input validation with real-time feedback and customizable error messages.
		</p>

		<h1>Built-in Validators</h1>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Basic Validation</h1>
				<ul>
					<li><strong>required</strong>: Field must have a value</li>
					<li><strong>min/max</strong>: Minimum/maximum length or value</li>
					<li><strong>pattern</strong>: Regular expression matching</li>
					<li><strong>step</strong>: Numeric step validation</li>
				</ul>
			</div>

			<div data-card>
				<h1>Advanced Validation</h1>
				<ul>
					<li><strong>custom</strong>: Custom validation functions</li>
					<li><strong>async</strong>: Asynchronous validation</li>
					<li><strong>conditional</strong>: Dependent field validation</li>
					<li><strong>cross-field</strong>: Multi-field validation</li>
				</ul>
			</div>
		</div>

		<h1>Custom Validation Functions</h1>
		<p>
			Create custom validation logic for complex business rules and domain-specific requirements.
		</p>
<h1>Dynamic Schema Generation</h1>
		<p>
			Schemas can be generated dynamically based on data, user permissions, or application state, enabling flexible form creation.
		</p>

		<h1>Dynamic Schema Use Cases</h1>
		<ul>
			<li><strong>User Roles</strong>: Different fields based on user permissions</li>
			<li><strong>Data-Driven</strong>: Forms generated from API responses</li>
			<li><strong>Conditional</strong>: Fields that appear based on other field values</li>
			<li><strong>Wizard Steps</strong>: Different schemas for multi-step forms</li>
			<li><strong>Localization</strong>: Schema translations for international forms</li>
		</ul>
<h1>Schema Best Practices</h1>
		<p>
			Follow these guidelines to create effective, maintainable form schemas that provide excellent user experience.
		</p>

		<h1>Design Guidelines</h1>
		<ul>
			<li>Start with basic forms and progressively enhance with schemas</li>
			<li>Group related fields using consistent naming conventions</li>
			<li>Provide clear, helpful validation messages</li>
			<li>Use appropriate input types for better UX and validation</li>
			<li>Consider accessibility in field labels and descriptions</li>
			<li>Test schemas with real data and edge cases</li>
		</ul>

		<h1>Performance Considerations</h1>
		<ul>
			<li>Cache compiled schemas for reuse across form instances</li>
			<li>Use lazy validation for complex or expensive rules</li>
			<li>Consider schema splitting for very large forms</li>
			<li>Optimize conditional logic to avoid unnecessary computations</li>
		</ul>
	
<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand form schemas, explore validation techniques, form layout options, or dive into advanced form features.
		</p>
		<span>
			<a href="/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/layout" class="button is-primary">
				Layout
				<span class="ml-2">→</span>
			</a>
		</span>
	
</article>