<script>
	import { StoryRoot } from '$lib/components/Story'
</script>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">👋</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Welcome to Rokkit!</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					This will teach you everything you need to know to simplify your workflow of building
					data-driven web applications.
				</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="prose text-neutral-elevated max-w-none">
		<section class="mb-12">
			<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">What is Rokkit?</h2>
			<p class="text-neutral-floating mb-4 text-lg">
				Rokkit is a Svelte UI library designed to simplify the way we create data-driven
				applications. With its intuitive design and an extensive collection of actions, stores,
				utility functions, and composable components, Rokkit empowers developers to create stunning
				user interfaces with unmatched ease and flexibility.
			</p>

			<div class="text-neutral-elevated mb-6 rounded-lg">
				<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">The library includes:</h3>
				<ul class="marker:text-primary-500 list-disc">
					<li>Data-Driven Components</li>
					<li>Form Elements & Generators</li>
					<li>Grouped Components</li>
					<li>Composable components</li>
					<li>Actions</li>
					<li>Stores</li>
					<li>Useful Utility Functions</li>
				</ul>
			</div>

			<p class="text-lg">
				At the heart of Rokkit's design is a commitment to consistency and ease of use. We wanted to
				make it easier to use components and extend them if needed to achieve the application
				objectives.
			</p>
		</section>

		<!-- Interactive Demo -->
		<section class="mb-12">
			<h3 class="mb-6 text-2xl font-bold">Try it yourself</h3>
			<p class="mb-4">
				Here's a simple example of a Rokkit List component. Click on any item to see how data-driven
				components work:
			</p>

			<StoryRoot
				slug="welcome/introduction"
				title="Interactive List Demo"
				description="A data-driven List component with field mapping and custom rendering"
			/>
		</section>

		<!-- Why Rokkit -->
		<section class="mb-12">
			<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Why Rokkit?</h2>
			<p class="text-neutral-floating mb-6 text-lg">
				The following are some key challenges developers encounter when building applications that
				interact with APIs for data retrieval and storage:
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="border-primary-subtle rounded-lg border p-6">
					<h3 class="mb-3 font-semibold">Common Challenges</h3>
					<ul class="marker:text-primary-overlay space-y-2 text-sm">
						<li>Converting API data to component-compatible formats</li>
						<li>Additional coding effort for composable components</li>
						<li>Theme misalignment with existing libraries</li>
						<li>Inconsistent iconography across components</li>
						<li>Limited component extensibility</li>
					</ul>
				</div>

				<div class="border-primary-subtle rounded-lg border p-6">
					<h3 class="mb-3 font-semibold">Rokkit Solutions</h3>
					<ul class="marker:text-primary-overlay space-y-2 text-sm">
						<li>Efficient data transformation out of the box</li>
						<li>Improved component reusability</li>
						<li>Flexible library integration with theming</li>
						<li>Unified iconography system</li>
						<li>Adaptable components designed for extensibility</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- How Rokkit Addresses Challenges -->
		<section class="mb-12">
			<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">
				How Rokkit Addresses These Challenges
			</h2>

			<div class="space-y-6">
				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">
						🚀 Efficient Data Transformation
					</h3>
					<p>
						Rokkit streamlines the conversion of data from APIs into structures compatible with
						components, allowing UI developers to concentrate on other aspects of the application.
					</p>
				</div>

				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">
						🔄 Improved Component Reusability
					</h3>
					<p>
						Rokkit enables developers to utilize data-driven components, reducing the need for
						custom components and enhancing the efficiency of the development process.
					</p>
				</div>

				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">
						🎨 Flexible Library Integration
					</h3>
					<p>
						By default, Rokkit's components are unstyled. A collection of pre-built themes is
						available for use as a foundation, which can be extended to align with the application's
						theme and color scheme.
					</p>
				</div>

				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">🎯 Unified Iconography</h3>
					<p>
						Rokkit employs UnoCSS for icons, offering a predefined set of customizable icons.
						Alternative icons can be supplied for the aliases used, and icons can be passed as
						parameters to components for further customization.
					</p>
				</div>

				<div class="border-neutral-subtle rounded-lg border p-6">
					<h3 class="text-primary-overlay mb-3 text-lg font-semibold">⚙️ Adaptable Components</h3>
					<p>
						Rokkit's components are designed with extensibility in mind, empowering developers to
						address a wide range of application requirements without being constrained by the
						limitations of standard components.
					</p>
				</div>
			</div>
		</section>

		<!-- Next Steps -->
		<section class="rounded-lg p-6">
			<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Ready to get started?</h3>
			<p class="text-primary-floating mb-4">
				Now that you understand what Rokkit is and how it can help you, let's set up your first
				project and start building!
			</p>
			<a
				href="/tutorial/welcome/getting-started"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Getting Started
				<span class="ml-2">→</span>
			</a>
		</section>
	</div>
</div>