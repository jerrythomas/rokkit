<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		Rokkit provides a comprehensive set of input components that work seamlessly with different data
		types and structures. These components use field mapping to adapt to your data format, making
		them highly flexible and reusable.
	</p>

	<h1>Key Features:</h1>
	<ul>
		<li>Field mapping for flexible data binding</li>
		<li>Reactive state management</li>
		<li>Built-in validation support</li>
		<li>Accessibility features</li>
		<li>Custom rendering with snippets</li>
		<li>Dark mode support</li>
	</ul>
	<h1>Interactive Demo</h1>
	<p>
		This demo shows how different input components work together in a form. Notice how field mapping
		allows each component to work with different data structures while maintaining consistent
		behavior.
	</p>

	<StoryViewer {...storyBuilder.getExample('example')} />
	<h1>Component Details</h1>

	<div class="space-y-6">
		<div data-card>
			<h1><span>🗂️</span> List Component</h1>
			<p>
				Perfect for single-selection scenarios where you want to show all options visually. Uses
				field mapping to display text and icons from your data.
			</p>
			<p><strong>Field Mapping:</strong> <code>{"{ text: 'text', icon: 'icon' }"}</code></p>
		</div>

		<div data-card>
			<h1><span>📋</span> Select Component</h1>
			<p>
				Ideal for dropdown selections with rich content. Can display additional description text and
				supports search functionality.
			</p>
			<p>
				<strong>Field Mapping:</strong>
				<code>{"{ text: 'label', description: 'description' }"}</code>
			</p>
		</div>

		<div data-card>
			<h1><span>☑️</span> MultiSelect Component</h1>
			<p>
				Enables multiple selections with a clean, tag-based interface. Perfect for categories, tags,
				or team member assignments.
			</p>
			<p><strong>Field Mapping:</strong> <code>{"{ text: 'name', id: 'id' }"}</code></p>
		</div>
	</div>
	<h1>Best Practices</h1>

	<div class="space-y-4">
		<div class="flex items-start space-x-3">
			<div class="mt-1 text-green-500">✅</div>
			<div>
				<h1>Use descriptive field mappings</h1>
				<p>
					Map your data fields to component properties in a way that makes sense for your use case.
				</p>
			</div>
		</div>

		<div class="flex items-start space-x-3">
			<div class="mt-1 text-green-500">✅</div>
			<div>
				<h1>Provide meaningful labels</h1>
				<p>Always include proper labels for accessibility and user experience.</p>
			</div>
		</div>

		<div class="flex items-start space-x-3">
			<div class="mt-1 text-green-500">✅</div>
			<div>
				<h1>Use reactive state</h1>
				<p>Take advantage of Svelte's reactive state management for real-time updates.</p>
			</div>
		</div>

		<div class="flex items-start space-x-3">
			<div class="mt-1 text-red-500">❌</div>
			<div>
				<h1>Don't hardcode field names</h1>
				<p>Use field mapping instead of assuming specific property names in your data.</p>
			</div>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand input components, explore form building, validation, and advanced
			features.
		</p>
		<span>
			<a href="/forms/builder" class="button is-primary">
				FormBuilder
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
