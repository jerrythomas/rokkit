<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>ValidationReport - Utilities | Learn Rokkit</title>
	<meta
		name="description"
		content="Display validation results and status"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>✅</span>ValidationReport Component</h1>
				<p>
					Display validation results and status
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			The ValidationReport component is a versatile utility that displays the result for multiple validation rules on a data item. It provides a visual representation of the validation status and allows users to easily identify any validation errors or warnings associated with the data.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Visual status indicators for validation results</li>
			<li>Support for multiple validation states (pass, fail, warn)</li>
			<li>Clear text descriptions for each validation rule</li>
			<li>Optional validation rules with different styling</li>
			<li>Accessible design with proper status indicators</li>
			<li>Integration with form validation workflows</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's an example of a ValidationReport showing multiple validation rules with different statuses:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<p>
			The ValidationReport component uses a simple but powerful items array to display validation results.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Properties</h4>
				<ul>
					<li><strong>items</strong>: Array of validation rule objects</li>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>

			<div data-card>
				<h4>Item Properties</h4>
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
	</section>

	<!-- Validation States -->
	<section>
		<h2>Validation States</h2>
		<p>
			The ValidationReport supports three primary validation states, each with distinct visual styling to communicate the validation result clearly.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div data-card>
				<h4>Pass Status</h4>
				<p>Indicates successful validation with green styling and checkmark icon.</p>
				<ul>
					<li><strong>status:</strong> 'pass'</li>
					<li><strong>valid:</strong> true</li>
					<li><strong>styling:</strong> Green background, check icon</li>
				</ul>
			</div>

			<div data-card>
				<h4>Fail Status</h4>
				<p>Indicates failed validation with red styling and error icon.</p>
				<ul>
					<li><strong>status:</strong> 'fail'</li>
					<li><strong>valid:</strong> false</li>
					<li><strong>styling:</strong> Red background, X icon</li>
				</ul>
			</div>

			<div data-card>
				<h4>Warn Status</h4>
				<p>Indicates warning or optional validation with yellow styling.</p>
				<ul>
					<li><strong>status:</strong> 'warn'</li>
					<li><strong>optional:</strong> true</li>
					<li><strong>styling:</strong> Yellow background, warning icon</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Use Cases -->
	<section>
		<h2>Use Cases</h2>
		<p>
			The ValidationReport component is perfect for various validation scenarios where you need to show multiple validation rules and their results.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Form Validation</h4>
				<ul>
					<li>Password strength requirements</li>
					<li>Username availability checks</li>
					<li>Email format validation</li>
					<li>File upload requirements</li>
				</ul>
			</div>

			<div data-card>
				<h4>Data Quality</h4>
				<ul>
					<li>Data import validation reports</li>
					<li>Content quality assessments</li>
					<li>System health checks</li>
					<li>Configuration validation</li>
				</ul>
			</div>
		</div>

		<h3>Integration Examples</h3>
		<p>
			ValidationReport works seamlessly with form systems and validation libraries:
		</p>
		<Code {...storyBuilder.getFragment(1)} />
	</section>

	<!-- Best Practices -->
	<section>
		<h2>Best Practices</h2>
		<p>
			Follow these guidelines to create effective validation reports that enhance user experience.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Clear Messaging</h4>
				<ul>
					<li>Use specific, actionable validation messages</li>
					<li>Avoid technical jargon in user-facing text</li>
					<li>Provide clear success indicators</li>
					<li>Group related validation rules logically</li>
				</ul>
			</div>

			<div data-card>
				<h4>Visual Design</h4>
				<ul>
					<li>Use consistent status colors and icons</li>
					<li>Ensure sufficient color contrast</li>
					<li>Consider colorblind accessibility</li>
					<li>Provide text alternatives to color coding</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
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
	</section>
</article>