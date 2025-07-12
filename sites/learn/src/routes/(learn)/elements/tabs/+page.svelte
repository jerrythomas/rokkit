<script>
	import { StoryViewer } from '$lib/components/Story'
	import { stories } from './stories.js'
</script>

<svelte:head>
	<title>Tabs - Elements | Learn Rokkit</title>
	<meta
		name="description"
		content="Navigate between different content sections"
	/>
</svelte:head>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">📑</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Tabs Component</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Navigate between different content sections
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Overview</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The Tabs component is a highly extensible and versatile UI element that simplifies navigation within your application. Like other Rokkit components, Tabs shares similar features such as the ability to define custom items, map fields, and provide custom components.
		</p>

		<p class="text-neutral-floating mb-6 text-lg">
			This allows for seamless integration and customization to match your application's theme and requirements. With the Tabs component, you can effortlessly create interactive and dynamic navigation experiences, while maintaining the flexibility to extend the component's functionality as needed.
		</p>

		<div class="text-neutral-elevated mb-6 rounded-lg">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Notable features:</h3>
			<ul class="marker:text-primary-500 space-y-2 list-disc pl-6">
				<li>Get started with a simple string array</li>
				<li>Attributes like text, icon/images or URLs can be mapped to attributes in the data</li>
				<li>Default item components like Text & Link are available, however, custom components can also be used</li>
				<li>It is also possible to configure a different component to be used for different items based on an attribute in the data</li>
			</ul>
		</div>

		<div class="border-amber-subtle bg-amber-inset rounded-lg border p-6 mb-8">
			<div class="flex items-start space-x-3">
				<div class="text-2xl">💡</div>
				<div>
					<h3 class="text-amber-overlay mb-2 text-lg font-semibold">Design Consideration</h3>
					<p class="text-amber-floating">
						The Tabs component is designed with a horizontal layout, making it more suitable for a limited number of tabs. Including an excessive number of tabs may lead to a scrollable interface, which could negatively impact user-friendliness.
					</p>
				</div>
			</div>
		</div>

		<!-- Basic Example -->
		<div class="mb-8">
			<h3 class="mb-4 text-2xl font-bold">Basic Example</h3>
			<p class="mb-4">
				Get started with basic tabs using a simple string array:
			</p>

			{#await stories}
				<p>Loading...</p>
			{:then groupedStories}
				<StoryViewer {...groupedStories.intro} />
			{/await}
		</div>
	</section>

	<!-- Orientation -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Tab Orientation</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Learn how to control tab positioning and alignment with the `below` and `align` properties.
		</p>

		{#await stories}
			<p>Loading...</p>
		{:then groupedStories}
			<StoryViewer {...groupedStories.orientation} />
		{/await}
	</section>

	<!-- Object Data -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Object Data</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Use arrays of objects with the Tabs component, utilizing the built-in Text component for rendering.
		</p>

		{#await stories}
			<p>Loading...</p>
		{:then groupedStories}
			<StoryViewer {...groupedStories.object} />
		{/await}
	</section>

	<!-- Field Mapping -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Field Mapping</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Adapt the Tabs component to your data structure using the `fields` property for flexible attribute mapping.
		</p>

		{#await stories}
			<p>Loading...</p>
		{:then groupedStories}
			<StoryViewer {...groupedStories.fields} />
		{/await}

		<!-- Properties Documentation -->
		<div class="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Properties</h3>
				<ul class="space-y-2 text-sm">
					<li><strong>options</strong>: Supply the data for the tabs (array of strings or objects)</li>
					<li><strong>value</strong>: Current selected value of the tabs (bindable)</li>
					<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
					<li><strong>below</strong>: Position tabs below content (default: false)</li>
					<li><strong>align</strong>: Tab alignment - 'left', 'center', or 'right' (default: 'left')</li>
				</ul>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Advanced Properties</h3>
				<ul class="space-y-2 text-sm">
					<li><strong>using</strong>: Object containing components to be used for displaying data</li>
					<li><strong>class</strong>: Set custom class for style overrides</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Custom Components -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Custom Components</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Implement custom components with the `using` property for advanced tab functionality and styling.
		</p>

		{#await stories}
			<p>Loading...</p>
		{:then groupedStories}
			<StoryViewer {...groupedStories.using} />
		{/await}
	</section>

	<!-- Best Practices -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Best Practices</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-3 text-lg font-semibold">Design Guidelines</h3>
				<ul class="space-y-2 text-sm">
					<li>Keep the number of tabs to a minimum for optimal user experience</li>
					<li>Use descriptive tab labels that clearly indicate content</li>
					<li>Consider using icons or images to enhance visual appeal</li>
				</ul>
			</div>
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-3 text-lg font-semibold">Technical Considerations</h3>
				<ul class="space-y-2 text-sm">
					<li>Ensure proper keyboard navigation support</li>
					<li>Test with different screen sizes to ensure responsive behavior</li>
					<li>Consider using semantic HTML for accessibility</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-inset rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Explore More Components</h3>
		<p class="text-primary-floating mb-4">
			Now that you understand how the Tabs component works, explore other navigation and data-driven components.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/elements/list"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Lists
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/table"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Tables
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>