<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root><h1>Introduction</h1>
		<p>
			InputField wraps input, label and instructions/validation messages together, providing a complete form input solution.
		</p>

		<h1>Notable features:</h1>
		<ul>
			<li>Wraps standard HTML inputs with labels, status, and validations</li>
			<li>Handles various HTML input types with consistent styling</li>
			<li>Supports custom components like select & rating</li>
			<li>Extensible with custom input components</li>
			<li>Comprehensive validation support including password requirements</li>
			<li>Accessibility built-in with proper ARIA attributes</li>
		</ul>

		<h1>Basic Example</h1>
		<p>
			Here's a simple example of an InputField component with label and validation:
		</p>

		<StoryViewer {...storyBuilder.getExample('properties')} />
<h1>Properties</h1>
		<p>
			The InputField component provides comprehensive properties for form integration and customization.
		</p>

		<!-- Properties Documentation -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Core Properties</h1>
				<ul>
					<li><strong>value</strong>: Current value of the input (bindable)</li>
					<li><strong>name</strong>: Name used for the input element</li>
					<li><strong>label</strong>: Label text for the input</li>
					<li><strong>type</strong>: Input type (text, email, password, etc.)</li>
				</ul>
			</div>

			<div data-card>
				<h1>Validation & Status</h1>
				<ul>
					<li><strong>required</strong>: Whether the input is required</li>
					<li><strong>status</strong>: Validation status ('pass', 'fail', 'warn')</li>
					<li><strong>message</strong>: Validation or help message</li>
					<li><strong>disabled</strong>: Whether the input is disabled</li>
				</ul>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Customization</h1>
				<ul>
					<li><strong>description</strong>: ARIA description text</li>
					<li><strong>icon</strong>: Optional icon for presentation</li>
					<li><strong>nolabel</strong>: Hide label visually (still available for screen readers)</li>
					<li><strong>using</strong>: Custom input component mappings</li>
				</ul>
			</div>

			<div data-card>
				<h1>Styling</h1>
				<ul>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>
		</div>

		<p>Here's the basic usage with properties:</p>
		<Code {...storyBuilder.getFragment(0)} />
<h1>Hidden Labels</h1>
		<p>
			Sometimes you may want to hide the visual label while maintaining accessibility. The `nolabel` property hides the label visually but keeps it available for screen readers.
		</p>

		<StoryViewer {...storyBuilder.getExample('nolabel')} />

		<p>Use the nolabel property for compact layouts:</p>
		<Code {...storyBuilder.getFragment(1)} />
<h1>Input Variants</h1>
		<p>
			InputField supports all standard HTML input types and can be extended with custom components.
		</p>

		<StoryViewer {...storyBuilder.getExample('variants')} />

		<p>Examples of different input types:</p>
		<Code {...storyBuilder.getFragment(2)} />
<h1>Validation</h1>
		<p>
			InputField provides comprehensive validation support with visual feedback and status messages. This is particularly useful for password fields and other inputs requiring specific criteria.
		</p>

		<StoryViewer {...storyBuilder.getExample('validation')} />

		<p>Configure validation with status and messages:</p>
		<Code {...storyBuilder.getFragment(3)} />

		<h1>Validation States:</h1>
		<ul>
			<li><strong>pass</strong>: Validation successful (green styling)</li>
			<li><strong>fail</strong>: Validation failed (red styling)</li>
			<li><strong>warn</strong>: Warning state (yellow styling)</li>
		</ul>
<h1>Custom Components</h1>
		<p>
			InputField can be extended with custom input components using the `using` property. This allows integration of specialized inputs like rating, select, or completely custom components.
		</p>

		<div data-card>
			<h1>Extending with Custom Inputs</h1>
			<p>
				You can provide a mapping of input types to custom components, allowing InputField to render Rating, Select, or any other custom input component while maintaining consistent labeling and validation.
			</p>
		</div>
	
<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the InputField component works, explore form templates or learn about other input components.
		</p>
		<span>
			<a href="/templates/form" class="button is-primary">
				Form Templates
				<span class="ml-2">→</span>
			</a>
			<a href="/input/rating" class="button is-primary">
				Rating
				<span class="ml-2">→</span>
			</a>
		</span>
	
</article>