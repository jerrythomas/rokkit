<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Advanced Features - Forms | Learn Rokkit</title>
	<meta
		name="description"
		content="Remote integration, custom snippets, and complex form patterns with Rokkit forms"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>⚙️</span>Advanced Form Features</h1>
				<p>
					Remote integration, custom snippets, and complex form patterns
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Advanced form features enable sophisticated form interactions, remote data integration, and complex user workflows. These features build upon the foundation of basic forms to create enterprise-grade form experiences.
		</p>

		<h3>Advanced Capabilities:</h3>
		<ul>
			<li>Remote API integration for data submission and validation</li>
			<li>Custom snippet creation for specialized field types</li>
			<li>Multi-step form wizards and conditional logic</li>
			<li>Dynamic field generation and form structure</li>
			<li>Real-time data synchronization</li>
			<li>Complex validation and error handling</li>
		</ul>
	</section>

	<!-- Remote Integration -->
	<section>
		<h2>Remote API Integration</h2>
		<p>
			Integrate forms with remote APIs for data submission, server-side validation, and real-time data synchronization without disrupting the user experience.
		</p>

		<StoryViewer {...storyBuilder.getExample('remote')} />

		<h3>Remote Integration Features</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Data Operations</h4>
				<ul>
					<li>Submit form data to REST APIs</li>
					<li>Load initial data from remote sources</li>
					<li>Auto-save draft data periodically</li>
					<li>Sync changes across multiple users</li>
				</ul>
			</div>

			<div data-card>
				<h4>User Experience</h4>
				<ul>
					<li>Loading states during submissions</li>
					<li>Success feedback and redirects</li>
					<li>Error handling and retry mechanisms</li>
					<li>Offline support with queue management</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Custom Snippets -->
	<section>
		<h2>Custom Field Snippets</h2>
		<p>
			Create custom field renderers using Svelte snippets to handle specialized input types and complex field interactions.
		</p>

		<h3>Snippet Use Cases</h3>
		<ul>
			<li><strong>Rich Text Editors</strong>: WYSIWYG content editing fields</li>
			<li><strong>File Upload</strong>: Drag-and-drop file handling with progress</li>
			<li><strong>Color Pickers</strong>: Visual color selection interfaces</li>
			<li><strong>Date Ranges</strong>: Start and end date selection</li>
			<li><strong>Address Lookup</strong>: Geocoded address selection</li>
			<li><strong>Multi-step Fields</strong>: Complex data entry workflows</li>
		</ul>

		<h3>Snippet Integration</h3>
		<p>Custom snippets integrate seamlessly with form validation, data binding, and layout systems:</p>
		<ul>
			<li>Automatic validation integration</li>
			<li>Consistent styling and theming</li>
			<li>Accessibility features maintained</li>
			<li>Event handling and state management</li>
		</ul>
	</section>

	<!-- Dynamic Forms -->
	<section>
		<h2>Dynamic Form Generation</h2>
		<p>
			Generate form structures dynamically based on data schemas, user permissions, or application state for maximum flexibility.
		</p>

		<h3>Dynamic Generation Patterns</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Schema-Driven</h4>
				<ul>
					<li>Forms generated from JSON schemas</li>
					<li>API-driven form configurations</li>
					<li>Database schema to form mapping</li>
					<li>Conditional field visibility</li>
				</ul>
			</div>

			<div data-card>
				<h4>User-Driven</h4>
				<ul>
					<li>Role-based field access control</li>
					<li>Personalized form experiences</li>
					<li>Progressive disclosure of complexity</li>
					<li>User preference-driven layouts</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Multi-step Forms -->
	<section>
		<h2>Multi-step Form Wizards</h2>
		<p>
			Create guided form experiences that break complex data entry into manageable steps with progress tracking and navigation.
		</p>

		<h3>Wizard Features</h3>
		<ul>
			<li><strong>Step Navigation</strong>: Forward, backward, and jump-to-step navigation</li>
			<li><strong>Progress Tracking</strong>: Visual progress indicators and completion status</li>
			<li><strong>Data Persistence</strong>: Preserve data across steps and sessions</li>
			<li><strong>Conditional Steps</strong>: Skip or show steps based on previous answers</li>
			<li><strong>Validation Gates</strong>: Prevent progression until step requirements are met</li>
			<li><strong>Summary Views</strong>: Review all data before final submission</li>
		</ul>

		<h3>Wizard Design Patterns</h3>
		<ul>
			<li>Linear workflows for sequential data collection</li>
			<li>Branching workflows for conditional paths</li>
			<li>Hub-and-spoke for independent section completion</li>
			<li>Progressive disclosure for complex forms</li>
		</ul>
	</section>

	<!-- Conditional Logic -->
	<section>
		<h2>Conditional Form Logic</h2>
		<p>
			Implement sophisticated conditional logic that shows, hides, or modifies fields based on user input and business rules.
		</p>

		<h3>Conditional Patterns</h3>
		<ul>
			<li><strong>Show/Hide Fields</strong>: Display fields based on other field values</li>
			<li><strong>Required Conditions</strong>: Make fields required based on context</li>
			<li><strong>Value Dependencies</strong>: Update field options based on selections</li>
			<li><strong>Validation Rules</strong>: Apply different validation based on conditions</li>
			<li><strong>Layout Changes</strong>: Modify form layout dynamically</li>
		</ul>

		<h3>Performance Considerations</h3>
		<ul>
			<li>Optimize condition evaluation for large forms</li>
			<li>Use reactive programming patterns efficiently</li>
			<li>Minimize DOM manipulations for better performance</li>
			<li>Cache computed conditions when possible</li>
		</ul>
	</section>

	<!-- Error Handling -->
	<section>
		<h2>Advanced Error Handling</h2>
		<p>
			Implement robust error handling strategies for complex form scenarios including network failures, validation conflicts, and data consistency issues.
		</p>

		<h3>Error Handling Strategies</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Network Errors</h4>
				<ul>
					<li>Retry mechanisms with exponential backoff</li>
					<li>Offline queue for failed submissions</li>
					<li>Network status monitoring</li>
					<li>Graceful degradation of features</li>
				</ul>
			</div>

			<div data-card>
				<h4>Data Conflicts</h4>
				<ul>
					<li>Optimistic locking for concurrent edits</li>
					<li>Conflict resolution interfaces</li>
					<li>Version tracking and merge capabilities</li>
					<li>Rollback and recovery options</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Performance Optimization -->
	<section>
		<h2>Performance Optimization</h2>
		<p>
			Optimize form performance for large, complex forms with many fields, dynamic content, and real-time interactions.
		</p>

		<h3>Optimization Techniques</h3>
		<ul>
			<li><strong>Virtual Scrolling</strong>: Handle very long forms efficiently</li>
			<li><strong>Lazy Loading</strong>: Load form sections on demand</li>
			<li><strong>Field Virtualization</strong>: Render only visible fields</li>
			<li><strong>Debounced Validation</strong>: Reduce validation frequency</li>
			<li><strong>Memoization</strong>: Cache expensive computations</li>
			<li><strong>Bundle Splitting</strong>: Load form components as needed</li>
		</ul>
	</section>

	<!-- Testing Strategies -->
	<section>
		<h2>Form Testing Strategies</h2>
		<p>
			Implement comprehensive testing strategies for advanced form features to ensure reliability and user experience quality.
		</p>

		<h3>Testing Approaches</h3>
		<ul>
			<li><strong>Unit Testing</strong>: Test individual form components and validation logic</li>
			<li><strong>Integration Testing</strong>: Test form interactions with APIs and data sources</li>
			<li><strong>End-to-End Testing</strong>: Test complete user workflows and scenarios</li>
			<li><strong>Performance Testing</strong>: Test form performance under load</li>
			<li><strong>Accessibility Testing</strong>: Ensure forms work with assistive technologies</li>
			<li><strong>Cross-browser Testing</strong>: Verify compatibility across platforms</li>
		</ul>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			You've mastered advanced form features! Explore other components or dive into theming and customization to create polished applications.
		</p>
		<span>
			<a href="/input/inputfield" class="button is-primary">
				Input Components
				<span class="ml-2">→</span>
			</a>
			<a href="/theming/colors" class="button is-primary">
				Theming
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>