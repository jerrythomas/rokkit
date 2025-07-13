<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Input Components - Forms | Learn Rokkit</title>
	<meta
		name="description"
		content="Explore different input types and their properties in Rokkit forms"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<h1><span>📝</span>Input Components</h1>
		<p>Explore different input types and their properties</p>
	</header>

	<!-- Overview -->
	<section>
		<h2>Overview</h2>
		<p>
			Rokkit provides a comprehensive set of input components that work seamlessly with different
			data types and structures. These components use field mapping to adapt to your data format,
			making them highly flexible and reusable.
		</p>

		<h3>Key Features:</h3>
		<ul>
			<li>Field mapping for flexible data binding</li>
			<li>Reactive state management</li>
			<li>Built-in validation support</li>
			<li>Accessibility features</li>
			<li>Custom rendering with snippets</li>
			<li>Dark mode support</li>
		</ul>
	</section>

	<!-- Interactive Demo -->
	<section>
		<h2>Interactive Demo</h2>
		<p>
			This demo shows how different input components work together in a form. Notice how field
			mapping allows each component to work with different data structures while maintaining
			consistent behavior.
		</p>

		<StoryViewer {...storyBuilder.getExample('example')} />
	</section>

	<!-- Component Details -->
	<section>
		<h2>Component Details</h2>

		<div class="space-y-6">
			<div data-card>
				<h4><span>🗂️</span> List Component</h4>
				<p>
					Perfect for single-selection scenarios where you want to show all options visually. Uses
					field mapping to display text and icons from your data.
				</p>
				<p><strong>Field Mapping:</strong> <code>{"{ text: 'text', icon: 'icon' }"}</code></p>
			</div>

			<div data-card>
				<h4><span>📋</span> Select Component</h4>
				<p>
					Ideal for dropdown selections with rich content. Can display additional description text
					and supports search functionality.
				</p>
				<p><strong>Field Mapping:</strong> <code>{"{ text: 'label', description: 'description' }"}</code></p>
			</div>

			<div data-card>
				<h4><span>☑️</span> MultiSelect Component</h4>
				<p>
					Enables multiple selections with a clean, tag-based interface. Perfect for categories,
					tags, or team member assignments.
				</p>
				<p><strong>Field Mapping:</strong> <code>{"{ text: 'name', id: 'id' }"}</code></p>
			</div>
		</div>
	</section>

	<!-- Best Practices -->
	<section>
		<h2>Best Practices</h2>

		<div class="space-y-4">
			<div class="flex items-start space-x-3">
				<div class="mt-1 text-green-500">✅</div>
				<div>
					<h4>Use descriptive field mappings</h4>
					<p>
						Map your data fields to component properties in a way that makes sense for your use
						case.
					</p>
				</div>
			</div>

			<div class="flex items-start space-x-3">
				<div class="mt-1 text-green-500">✅</div>
				<div>
					<h4>Provide meaningful labels</h4>
					<p>
						Always include proper labels for accessibility and user experience.
					</p>
				</div>
			</div>

			<div class="flex items-start space-x-3">
				<div class="mt-1 text-green-500">✅</div>
				<div>
					<h4>Use reactive state</h4>
					<p>
						Take advantage of Svelte's reactive state management for real-time updates.
					</p>
				</div>
			</div>

			<div class="flex items-start space-x-3">
				<div class="mt-1 text-red-500">❌</div>
				<div>
					<h4>Don't hardcode field names</h4>
					<p>
						Use field mapping instead of assuming specific property names in your data.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand input components, explore form building, validation, and advanced features.
		</p>
		<span>
			<a href="/tutorial/forms/builder" class="button is-primary">
				FormBuilder
				<span class="ml-2">→</span>
			</a>
			<a href="/tutorial/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>