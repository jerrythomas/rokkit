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

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">📝</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Input Components</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Explore different input types and their properties
				</p>
			</div>
		</div>
		<div class="mt-4">
			<span class="bg-primary-inset text-primary-overlay rounded-full px-3 py-1 text-sm font-medium">
				Forms
			</span>
		</div>
	</header>

	<!-- Main Content -->
	<div class="prose text-neutral-elevated max-w-none">
		<section class="mb-12">
			<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Overview</h2>
			<p class="text-neutral-floating mb-4 text-lg">
				Rokkit provides a comprehensive set of input components that work seamlessly with different
				data types and structures. These components use field mapping to adapt to your data format,
				making them highly flexible and reusable.
			</p>

			<div class="bg-neutral-subtle mb-6 rounded-lg p-6">
				<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Key Features:</h3>
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
			<h3 class="text-neutral-overlay mb-6 text-2xl font-bold">Interactive Demo</h3>
			<p class="text-neutral-floating mb-4">
				This demo shows how different input components work together in a form. Notice how field
				mapping allows each component to work with different data structures while maintaining
				consistent behavior.
			</p>

			<StoryViewer {...storyBuilder.getExample('example')} />
		</section>

		<!-- Component Details -->
		<section class="mb-12">
			<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Component Details</h2>

			<div class="space-y-6">
				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">
						🗂️ List Component
					</h3>
					<p class="text-neutral-floating mb-3">
						Perfect for single-selection scenarios where you want to show all options visually. Uses
						field mapping to display text and icons from your data.
					</p>
					<div class="text-neutral-floating text-sm">
						<strong>Field Mapping:</strong> <code>{"{ text: 'text', icon: 'icon' }"}</code>
					</div>
				</div>

				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">
						📋 Select Component
					</h3>
					<p class="text-neutral-floating mb-3">
						Ideal for dropdown selections with rich content. Can display additional description text
						and supports search functionality.
					</p>
					<div class="text-neutral-floating text-sm">
						<strong>Field Mapping:</strong>
						<code>{"{ text: 'label', description: 'description' }"}</code>
					</div>
				</div>

				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">
						☑️ MultiSelect Component
					</h3>
					<p class="text-neutral-floating mb-3">
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
			<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Best Practices</h2>

			<div class="space-y-4">
				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong class="text-neutral-overlay">Use descriptive field mappings:</strong>
						<p class="text-neutral-floating">
							Map your data fields to component properties in a way that makes sense for your use
							case.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong class="text-neutral-overlay">Provide meaningful labels:</strong>
						<p class="text-neutral-floating">
							Always include proper labels for accessibility and user experience.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong class="text-neutral-overlay">Use reactive state:</strong>
						<p class="text-neutral-floating">
							Take advantage of Svelte's reactive state management for real-time updates.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-red-500">❌</div>
					<div>
						<strong class="text-neutral-overlay">Don't hardcode field names:</strong>
						<p class="text-neutral-floating">
							Use field mapping instead of assuming specific property names in your data.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- What's Next -->
		<section class="bg-primary-inset rounded-lg p-6">
			<h3 class="text-primary-overlay mb-3 text-xl font-semibold">What's Next?</h3>
			<p class="text-primary-floating mb-6">
				Now that you understand how input components work, explore more advanced form features:
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<a
					href="/tutorial/forms/builder"
					class="border-primary-subtle bg-neutral-base rounded-lg border p-4 transition-shadow hover:shadow-md"
				>
					<div class="mb-2 text-2xl">🏗️</div>
					<h4 class="text-primary-overlay font-semibold">FormBuilder</h4>
					<p class="text-primary-floating text-sm">
						Generate forms automatically from data schemas
					</p>
				</a>

				<a
					href="/tutorial/forms/validation"
					class="border-primary-subtle bg-neutral-base rounded-lg border p-4 transition-shadow hover:shadow-md"
				>
					<div class="mb-2 text-2xl">✅</div>
					<h4 class="text-primary-overlay font-semibold">Validation</h4>
					<p class="text-primary-floating text-sm">
						Add real-time validation to your forms
					</p>
				</a>
			</div>
		</section>
	</div>
</div>