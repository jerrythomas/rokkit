<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Schema - Forms | Learn Rokkit</title>
	<meta
		name="description"
		content="Define form structure and validation with schemas in Rokkit forms"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>📐</span>Form Schema</h1>
				<p>
					Define form structure and validation with schemas
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Form schemas provide a powerful way to define the structure, validation rules, and display properties of your forms. By using schemas, you can progressively enhance basic forms with sophisticated validation, custom input types, and field-specific configurations.
		</p>

		<h3>Key Benefits:</h3>
		<ul>
			<li>Declarative form structure definition</li>
			<li>Built-in validation rule management</li>
			<li>Type-safe form field configuration</li>
			<li>Reusable schema patterns</li>
			<li>Automatic error handling and display</li>
			<li>Progressive enhancement of basic forms</li>
		</ul>

		<h3>Schema Example</h3>
		<p>
			Here's how schemas enhance basic forms with validation and field configuration:
		</p>

		<StoryViewer {...storyBuilder.getExample('schema')} />
	</section>

	<!-- Basic Schema -->
	<section>
		<h2>Basic Schema Structure</h2>
		<p>
			A form schema is an object that maps field names to their configuration. Each field can specify its type, validation rules, display properties, and behavior.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<h3>Schema Properties</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Field Configuration</h4>
				<ul>
					<li><strong>type</strong>: Input type (text, email, number, etc.)</li>
					<li><strong>label</strong>: Display label for the field</li>
					<li><strong>placeholder</strong>: Placeholder text</li>
					<li><strong>required</strong>: Whether field is required</li>
				</ul>
			</div>

			<div data-card>
				<h4>Validation Rules</h4>
				<ul>
					<li><strong>min/max</strong>: Length or value constraints</li>
					<li><strong>pattern</strong>: Regular expression validation</li>
					<li><strong>custom</strong>: Custom validation functions</li>
					<li><strong>messages</strong>: Custom error messages</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Field Types -->
	<section>
		<h2>Supported Field Types</h2>
		<p>
			Rokkit forms support a wide variety of field types, each with specific validation and display behaviors.
		</p>

		<h3>Text Input Types</h3>
		<ul>
			<li><strong>text</strong>: Basic text input</li>
			<li><strong>email</strong>: Email address with validation</li>
			<li><strong>password</strong>: Password input with masking</li>
			<li><strong>tel</strong>: Telephone number input</li>
			<li><strong>url</strong>: URL input with validation</li>
			<li><strong>textarea</strong>: Multi-line text input</li>
		</ul>

		<h3>Numeric and Date Types</h3>
		<ul>
			<li><strong>number</strong>: Numeric input with step controls</li>
			<li><strong>range</strong>: Slider input for numeric ranges</li>
			<li><strong>date</strong>: Date picker input</li>
			<li><strong>time</strong>: Time selection input</li>
			<li><strong>datetime-local</strong>: Combined date and time</li>
		</ul>

		<h3>Selection Types</h3>
		<ul>
			<li><strong>select</strong>: Dropdown selection</li>
			<li><strong>radio</strong>: Radio button groups</li>
			<li><strong>checkbox</strong>: Individual checkboxes</li>
			<li><strong>checkboxes</strong>: Checkbox groups</li>
		</ul>
	</section>

	<!-- Validation Rules -->
	<section>
		<h2>Validation Rules</h2>
		<p>
			Schema validation rules provide comprehensive input validation with real-time feedback and customizable error messages.
		</p>

		<h3>Built-in Validators</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Basic Validation</h4>
				<ul>
					<li><strong>required</strong>: Field must have a value</li>
					<li><strong>min/max</strong>: Minimum/maximum length or value</li>
					<li><strong>pattern</strong>: Regular expression matching</li>
					<li><strong>step</strong>: Numeric step validation</li>
				</ul>
			</div>

			<div data-card>
				<h4>Advanced Validation</h4>
				<ul>
					<li><strong>custom</strong>: Custom validation functions</li>
					<li><strong>async</strong>: Asynchronous validation</li>
					<li><strong>conditional</strong>: Dependent field validation</li>
					<li><strong>cross-field</strong>: Multi-field validation</li>
				</ul>
			</div>
		</div>

		<h3>Custom Validation Functions</h3>
		<p>
			Create custom validation logic for complex business rules and domain-specific requirements.
		</p>
	</section>

	<!-- Dynamic Schemas -->
	<section>
		<h2>Dynamic Schema Generation</h2>
		<p>
			Schemas can be generated dynamically based on data, user permissions, or application state, enabling flexible form creation.
		</p>

		<h3>Dynamic Schema Use Cases</h3>
		<ul>
			<li><strong>User Roles</strong>: Different fields based on user permissions</li>
			<li><strong>Data-Driven</strong>: Forms generated from API responses</li>
			<li><strong>Conditional</strong>: Fields that appear based on other field values</li>
			<li><strong>Wizard Steps</strong>: Different schemas for multi-step forms</li>
			<li><strong>Localization</strong>: Schema translations for international forms</li>
		</ul>
	</section>

	<!-- Best Practices -->
	<section>
		<h2>Schema Best Practices</h2>
		<p>
			Follow these guidelines to create effective, maintainable form schemas that provide excellent user experience.
		</p>

		<h3>Design Guidelines</h3>
		<ul>
			<li>Start with basic forms and progressively enhance with schemas</li>
			<li>Group related fields using consistent naming conventions</li>
			<li>Provide clear, helpful validation messages</li>
			<li>Use appropriate input types for better UX and validation</li>
			<li>Consider accessibility in field labels and descriptions</li>
			<li>Test schemas with real data and edge cases</li>
		</ul>

		<h3>Performance Considerations</h3>
		<ul>
			<li>Cache compiled schemas for reuse across form instances</li>
			<li>Use lazy validation for complex or expensive rules</li>
			<li>Consider schema splitting for very large forms</li>
			<li>Optimize conditional logic to avoid unnecessary computations</li>
		</ul>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
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
	</section>
</article>