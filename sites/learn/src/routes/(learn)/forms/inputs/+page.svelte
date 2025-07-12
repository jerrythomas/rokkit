<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Input Components - Forms | Learn Rokkit</title>
	<meta
		name="description"
		content="Explore different input types and their properties"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<h1><span>📝</span> Input Components</h1>
		<p>Explore different input types and their properties</p>
		<div class="mt-4">
			<span class="bg-primary-inset text-primary-overlay rounded-full px-3 py-1 text-sm font-medium">
				Forms
			</span>
		</div>
	</header>

	<!-- Main Content -->
	<div>
		<section class="mb-12">
			<h2>Overview</h2>
			<p>
				Rokkit provides a comprehensive set of input components that work seamlessly with different
				data types and structures. These components use field mapping to adapt to your data format,
				making them highly flexible and reusable.
			</p>

			<div data-card>
				<h3>Key Features:</h3>
				<ul class="grid grid-cols-1 gap-2 md:grid-cols-2">
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Field mapping for flexible data binding</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Reactive state management</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Built-in validation support</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Accessibility features</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Custom rendering with snippets</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Dark mode support</span>
					</li>
				</ul>
			</div>
		</section>

		<!-- Interactive Demo -->
		<section class="mb-12">
			<h3>Interactive Demo</h3>
			<p>
				This demo shows how different input components work together in a form. Notice how field
				mapping allows each component to work with different data structures while maintaining
				consistent behavior.
			</p>

			<StoryViewer {...storyBuilder.getExample('example')} />
		</section>

		<!-- Component Details -->
		<section class="mb-12">
			<h2>Component Details</h2>

			<div class="space-y-6">
				<div data-content-block>
					<h3>
						🗂️ List Component
					</h3>
					<p>
						Perfect for single-selection scenarios where you want to show all options visually. Uses
						field mapping to display text and icons from your data.
					</p>
					<div class="text-neutral-floating text-sm">
						<strong>Field Mapping:</strong> <code>{"{ text: 'text', icon: 'icon' }"}</code>
					</div>
				</div>

				<div data-content-block>
					<h3>
						📋 Select Component
					</h3>
					<p>
						Ideal for dropdown selections with rich content. Can display additional description text
						and supports search functionality.
					</p>
					<div class="text-neutral-floating text-sm">
						<strong>Field Mapping:</strong>
						<code>{"{ text: 'label', description: 'description' }"}</code>
					</div>
				</div>

				<div data-content-block>
					<h3>
						☑️ MultiSelect Component
					</h3>
					<p>
						Enables multiple selections with a clean, tag-based interface. Perfect for categories,
						tags, or team member assignments.
					</p>
					<div class="text-neutral-floating text-sm">
						<strong>Field Mapping:</strong> <code>{"{ text: 'name', id: 'id' }"}</code>
					</div>
				</div>
			</div>
		</section>

		<!-- Best Practices -->
		<section class="mb-12">
			<h2>Best Practices</h2>

			<div class="space-y-4">
				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong>Use descriptive field mappings:</strong>
						<p>
							Map your data fields to component properties in a way that makes sense for your use
							case.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong>Provide meaningful labels:</strong>
						<p>
							Always include proper labels for accessibility and user experience.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong>Use reactive state:</strong>
						<p>
							Take advantage of Svelte's reactive state management for real-time updates.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-red-500">❌</div>
					<div>
						<strong>Don't hardcode field names:</strong>
						<p>
							Use field mapping instead of assuming specific property names in your data.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- What's Next -->
		<section data-card-cta>
			<h3>What's Next?</h3>
			<p>
				Now that you understand how input components work, explore more advanced form features:
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<a href="/tutorial/forms/builder" class="button is-primary">
					<div class="mb-2 text-2xl">🏗️</div>
					<h4>FormBuilder</h4>
					<p>
						Generate forms automatically from data schemas
					</p>
				</a>

				<a href="/tutorial/forms/validation" class="button is-primary">
					<div class="mb-2 text-2xl">✅</div>
					<h4>Validation</h4>
					<p>
						Add real-time validation to your forms
					</p>
				</a>
			</div>
		</section>
	</div>
</article>