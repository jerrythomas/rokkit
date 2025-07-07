<script>
	import { List } from '@rokkit/ui'

	let items = $state([
		{ text: 'Fruits' },
		{ text: 'Vegetables' },
		{ text: 'Nuts' },
		{ text: 'Spices' }
	])
	let value = $state(null)
</script>

<svelte:head>
	<title>Introduction - Welcome to Rokkit | Learn Rokkit</title>
	<meta
		name="description"
		content="Learn what Rokkit is and how it simplifies building data-driven web applications"
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<header class="border-b border-neutral-200 pb-8 dark:border-neutral-700">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">👋</div>
			<div>
				<h1 class="text-4xl font-bold text-neutral-900 dark:text-white">Welcome to Rokkit!</h1>
				<p class="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
					This will teach you everything you need to know to simplify your workflow of building
					data-driven web applications.
				</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="prose prose-neutral dark:prose-invert max-w-none">
		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">What is Rokkit?</h2>
			<p class="mb-4 text-lg text-neutral-700 dark:text-neutral-300">
				Rokkit is a cutting-edge Svelte UI library designed to simplify the way we create
				data-driven applications. With its intuitive design and an extensive collection of actions,
				stores, utility functions, and composable components, Rokkit empowers developers to create
				stunning user interfaces with unmatched ease and flexibility.
			</p>

			<div class="mb-6 rounded-lg bg-neutral-50 p-6 dark:bg-neutral-800">
				<h3 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
					The library includes:
				</h3>
				<ul class="grid grid-cols-1 gap-2 md:grid-cols-2">
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Data-Driven Components</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Form Elements & Generators</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Grouped Components</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Composable components</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Actions</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Stores</span>
					</li>
					<li class="flex items-center space-x-2">
						<span class="text-primary-500">•</span>
						<span>Useful Utility Functions</span>
					</li>
				</ul>
			</div>

			<p class="text-lg text-neutral-700 dark:text-neutral-300">
				At the heart of Rokkit's design is a commitment to consistency and ease of use. We wanted to
				make it easier to use components and extend them if needed to achieve the application
				objectives.
			</p>
		</section>

		<!-- Interactive Demo -->
		<section class="mb-12">
			<h3 class="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Try it yourself</h3>
			<p class="mb-4 text-neutral-700 dark:text-neutral-300">
				Here's a simple example of a Rokkit List component. Click on any item to see how data-driven
				components work:
			</p>

			<div
				class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
			>
				<div class="mb-4">
					<List bind:items bind:value />
				</div>
				<p class="text-sm text-neutral-600 dark:text-neutral-400">
					Selected Value: <strong class="text-neutral-900 dark:text-white"
						>{value?.text || 'None'}</strong
					>
				</p>
			</div>
		</section>

		<!-- Why Rokkit -->
		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Why Rokkit?</h2>
			<p class="mb-6 text-lg text-neutral-700 dark:text-neutral-300">
				The following are some key challenges developers encounter when building applications that
				interact with APIs for data retrieval and storage:
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div
					class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
				>
					<h3 class="mb-3 font-semibold text-red-900 dark:text-red-100">Common Challenges</h3>
					<ul class="space-y-2 text-sm text-red-800 dark:text-red-200">
						<li>• Converting API data to component-compatible formats</li>
						<li>• Additional coding effort for composable components</li>
						<li>• Theme misalignment with existing libraries</li>
						<li>• Inconsistent iconography across components</li>
						<li>• Limited component extensibility</li>
					</ul>
				</div>

				<div
					class="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20"
				>
					<h3 class="mb-3 font-semibold text-green-900 dark:text-green-100">Rokkit Solutions</h3>
					<ul class="space-y-2 text-sm text-green-800 dark:text-green-200">
						<li>• Efficient data transformation out of the box</li>
						<li>• Improved component reusability</li>
						<li>• Flexible library integration with theming</li>
						<li>• Unified iconography system</li>
						<li>• Adaptable components designed for extensibility</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- How Rokkit Addresses Challenges -->
		<section class="mb-12">
			<h2 class="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">
				How Rokkit Addresses These Challenges
			</h2>

			<div class="space-y-6">
				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						🚀 Efficient Data Transformation
					</h3>
					<p class="text-neutral-700 dark:text-neutral-300">
						Rokkit streamlines the conversion of data from APIs into structures compatible with
						components, allowing UI developers to concentrate on other aspects of the application.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						🔄 Improved Component Reusability
					</h3>
					<p class="text-neutral-700 dark:text-neutral-300">
						Rokkit enables developers to utilize data-driven components, reducing the need for
						custom components and enhancing the efficiency of the development process.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						🎨 Flexible Library Integration
					</h3>
					<p class="text-neutral-700 dark:text-neutral-300">
						By default, Rokkit's components are unstyled. A collection of pre-built themes is
						available for use as a foundation, which can be extended to align with the application's
						theme and color scheme.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						🎯 Unified Iconography
					</h3>
					<p class="text-neutral-700 dark:text-neutral-300">
						Rokkit employs UnoCSS for icons, offering a predefined set of customizable icons.
						Alternative icons can be supplied for the aliases used, and icons can be passed as
						parameters to components for further customization.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
					<h3 class="text-primary-600 dark:text-primary-400 mb-3 text-lg font-semibold">
						⚙️ Adaptable Components
					</h3>
					<p class="text-neutral-700 dark:text-neutral-300">
						Rokkit's components are designed with extensibility in mind, empowering developers to
						address a wide range of application requirements without being constrained by the
						limitations of standard components.
					</p>
				</div>
			</div>
		</section>

		<!-- Next Steps -->
		<section class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
			<h3 class="text-primary-900 dark:text-primary-100 mb-3 text-xl font-semibold">
				Ready to get started?
			</h3>
			<p class="text-primary-800 dark:text-primary-200 mb-4">
				Now that you understand what Rokkit is and how it can help you, let's set up your first
				project and start building!
			</p>
			<a
				href="/tutorial/getting-started"
				class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Getting Started
				<span class="ml-2">→</span>
			</a>
		</section>
	</div>
</div>
