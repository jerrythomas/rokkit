<script>
	import { StoryRoot } from '$lib/components/Story'
</script>

<svelte:head>
	<title>Input Components - Forms | Learn Rokkit</title>
	<meta
		name="description"
		content="Explore different input types and their properties in Rokkit forms"
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<header class="border-b border-neutral-200 pb-8 dark:border-neutral-700">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">📝</div>
			<div>
				<h1 class="text-4xl font-bold text-neutral-900 dark:text-white">Input Components</h1>
				<p class="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
					Explore different input types and their properties
				</p>
			</div>
		</div>
		<div class="mt-4">
			<span
				class="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full px-3 py-1 text-sm font-medium"
			>
				Forms
			</span>
		</div>
	</header>

	<!-- Main Content -->
	<div class="prose prose-neutral dark:prose-invert max-w-none">
		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Overview</h2>
			<p class="mb-4 text-lg text-neutral-700 dark:text-neutral-300">
				Rokkit provides a comprehensive set of input components that work seamlessly with different
				data types and structures. These components use field mapping to adapt to your data format,
				making them highly flexible and reusable.
			</p>

			<div class="mb-6 rounded-lg bg-neutral-50 p-6 dark:bg-neutral-800">
				<h3 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Key Features:</h3>
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
			<h3 class="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Interactive Demo</h3>
			<p class="mb-4 text-neutral-700 dark:text-neutral-300">
				This demo shows how different input components work together in a form. Notice how field
				mapping allows each component to work with different data structures while maintaining
				consistent behavior.
			</p>

			<StoryRoot
				slug="forms/inputs"
				title="Issue Tracker Form"
				description="A practical example using List, Select, and MultiSelect components with field mapping"
				ontoggle={(event) => console.log('Code toggled:', event.showCode)}
				oncopy={(event) =>
					console.log('Code copied:', event.code?.length || event.content?.length, 'characters')}
			/>
		</section>

		<!-- Component Details -->
		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Component Details</h2>

			<div class="space-y-6">
				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						🗂️ List Component
					</h3>
					<p class="mb-3 text-neutral-700 dark:text-neutral-300">
						Perfect for single-selection scenarios where you want to show all options visually. Uses
						field mapping to display text and icons from your data.
					</p>
					<div class="text-sm text-neutral-600 dark:text-neutral-400">
						<strong>Field Mapping:</strong> <code>{"{ text: 'text', icon: 'icon' }"}</code>
					</div>
				</div>

				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						📋 Select Component
					</h3>
					<p class="mb-3 text-neutral-700 dark:text-neutral-300">
						Ideal for dropdown selections with rich content. Can display additional description text
						and supports search functionality.
					</p>
					<div class="text-sm text-neutral-600 dark:text-neutral-400">
						<strong>Field Mapping:</strong>
						<code>{"{ text: 'label', description: 'description' }"}</code>
					</div>
				</div>

				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						☑️ MultiSelect Component
					</h3>
					<p class="mb-3 text-neutral-700 dark:text-neutral-300">
						Enables multiple selections with a clean, tag-based interface. Perfect for categories,
						tags, or team member assignments.
					</p>
					<div class="text-sm text-neutral-600 dark:text-neutral-400">
						<strong>Field Mapping:</strong> <code>{"{ text: 'name', id: 'id' }"}</code>
					</div>
				</div>
			</div>
		</section>

		<!-- Best Practices -->
		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Best Practices</h2>

			<div class="space-y-4">
				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong class="text-neutral-900 dark:text-white">Use descriptive field mappings:</strong
						>
						<p class="text-neutral-700 dark:text-neutral-300">
							Map your data fields to component properties in a way that makes sense for your use
							case.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong class="text-neutral-900 dark:text-white">Provide meaningful labels:</strong>
						<p class="text-neutral-700 dark:text-neutral-300">
							Always include proper labels for accessibility and user experience.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-green-500">✅</div>
					<div>
						<strong class="text-neutral-900 dark:text-white">Use reactive state:</strong>
						<p class="text-neutral-700 dark:text-neutral-300">
							Take advantage of Svelte's reactive state management for real-time updates.
						</p>
					</div>
				</div>

				<div class="flex items-start space-x-3">
					<div class="mt-1 text-red-500">❌</div>
					<div>
						<strong class="text-neutral-900 dark:text-white">Don't hardcode field names:</strong>
						<p class="text-neutral-700 dark:text-neutral-300">
							Use field mapping instead of assuming specific property names in your data.
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>

	<!-- Navigation -->
	<nav
		class="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-700"
	>
		<div class="flex-1">
			<a
				href="/tutorial/getting-started"
				class="inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
			>
				← Getting Started
			</a>
		</div>
		<div class="flex-1 text-right">
			<a
				href="/tutorial/forms/builder"
				class="inline-flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
			>
				FormBuilder →
			</a>
		</div>
	</nav>
</div>
