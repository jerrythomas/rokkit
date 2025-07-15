<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root><h1>Introduction</h1>
		<p>
			The ValidationReport component is a versatile utility that displays the result for multiple validation rules on a data item. It provides a visual representation of the validation status and allows users to easily identify any validation errors or warnings associated with the data.
		</p>

		<h1>Notable features:</h1>
		<ul>
			<li>Visual status indicators for validation results</li>
			<li>Support for multiple validation states (pass, fail, warn)</li>
			<li>Clear text descriptions for each validation rule</li>
			<li>Optional validation rules with different styling</li>
			<li>Accessible design with proper status indicators</li>
			<li>Integration with form validation workflows</li>
		</ul>

		<h1>Basic Example</h1>
		<p>
			Here's an example of a ValidationReport showing multiple validation rules with different statuses:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
<h1>Properties</h1>
		<p>
			The ValidationReport component uses a simple but powerful items array to display validation results.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Core Properties</h1>
				<ul>
					<li><strong>items</strong>: Array of validation rule objects</li>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>

			<div data-card>
				<h1>Item Properties</h1>
				<ul>
					<li><strong>text</strong>: Description of the validation rule</li>
					<li><strong>valid</strong>: Boolean indicating if rule passed</li>
					<li><strong>status</strong>: Visual status ('pass', 'fail', 'warn')</li>
					<li><strong>optional</strong>: Whether the rule is optional</li>
				</ul>
			</div>
		</div>

		<p>Basic usage with validation items:</p>
		<Code {...storyBuilder.getFragment(0)} />
<h1>Validation States</h1>
		<p>
			The ValidationReport supports three primary validation states, each with distinct visual styling to communicate the validation result clearly.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div data-card>
				<h1>Pass Status</h1>
				<p>Indicates successful validation with green styling and checkmark icon.</p>
				<ul>
					<li><strong>status:</strong> 'pass'</li>
					<li><strong>valid:</strong> true</li>
					<li><strong>styling:</strong> Green background, check icon</li>
				</ul>
			</div>

			<div data-card>
				<h1>Fail Status</h1>
				<p>Indicates failed validation with red styling and error icon.</p>
				<ul>
					<li><strong>status:</strong> 'fail'</li>
					<li><strong>valid:</strong> false</li>
					<li><strong>styling:</strong> Red background, X icon</li>
				</ul>
			</div>

			<div data-card>
				<h1>Warn Status</h1>
				<p>Indicates warning or optional validation with yellow styling.</p>
				<ul>
					<li><strong>status:</strong> 'warn'</li>
					<li><strong>optional:</strong> true</li>
					<li><strong>styling:</strong> Yellow background, warning icon</li>
				</ul>
			</div>
		</div>
<h1>Use Cases</h1>
		<p>
			The ValidationReport component is perfect for various validation scenarios where you need to show multiple validation rules and their results.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Form Validation</h1>
				<ul>
					<li>Password strength requirements</li>
					<li>Username availability checks</li>
					<li>Email format validation</li>
					<li>File upload requirements</li>
				</ul>
			</div>

			<div data-card>
				<h1>Data Quality</h1>
				<ul>
					<li>Data import validation reports</li>
					<li>Content quality assessments</li>
					<li>System health checks</li>
					<li>Configuration validation</li>
				</ul>
			</div>
		</div>

		<h1>Integration Examples</h1>
		<p>
			ValidationReport works seamlessly with form systems and validation libraries:
		</p>
		<Code {...storyBuilder.getFragment(1)} />
<h1>Best Practices</h1>
		<p>
			Follow these guidelines to create effective validation reports that enhance user experience.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Clear Messaging</h1>
				<ul>
					<li>Use specific, actionable validation messages</li>
					<li>Avoid technical jargon in user-facing text</li>
					<li>Provide clear success indicators</li>
					<li>Group related validation rules logically</li>
				</ul>
			</div>

			<div data-card>
				<h1>Visual Design</h1>
				<ul>
					<li>Use consistent status colors and icons</li>
					<li>Ensure sufficient color contrast</li>
					<li>Consider colorblind accessibility</li>
					<li>Provide text alternatives to color coding</li>
				</ul>
			</div>
		</div>
	
<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how ValidationReport works, explore other utility components like Connector, or learn about form validation patterns.
		</p>
		<span>
			<a href="/utilities/connector" class="button is-primary">
				Connector
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/validation" class="button is-primary">
				Form Validation
				<span class="ml-2">→</span>
			</a>
		</span>
	
</article>