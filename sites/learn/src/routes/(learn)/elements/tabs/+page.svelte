<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Tabs - Elements | Learn Rokkit</title>
	<meta name="description" content="Navigate between different content sections" />
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>📑</span>Tabs Component</h1>
				<p>
					Navigate between different content sections
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Overview</h2>
		<p>
			The Tabs component is a highly extensible and versatile UI element that simplifies navigation
			within your application. Like other Rokkit components, Tabs shares similar features such as
			the ability to define custom items, map fields, and provide custom components.
		</p>

		<p>
			This allows for seamless integration and customization to match your application's theme and
			requirements. With the Tabs component, you can effortlessly create interactive and dynamic
			navigation experiences, while maintaining the flexibility to extend the component's
			functionality as needed.
		</p>

		<div>
			<h3>Notable features:</h3>
			<ul>
				<li>Get started with a simple string array</li>
				<li>Attributes like text, icon/images or URLs can be mapped to attributes in the data</li>
				<li>
					Default item components like Text & Link are available, however, custom components can
					also be used
				</li>
				<li>
					It is also possible to configure a different component to be used for different items
					based on an attribute in the data
				</li>
			</ul>
		</div>

		<div data-content-block>
			<div class="flex items-start space-x-3">
				<div class="text-2xl">💡</div>
				<div>
					<h3>Design Consideration</h3>
					<p>
						The Tabs component is designed with a horizontal layout, making it more suitable for a
						limited number of tabs. Including an excessive number of tabs may lead to a scrollable
						interface, which could negatively impact user-friendliness.
					</p>
				</div>
			</div>
		</div>

		<!-- Basic Example -->
		<div class="mb-8">
			<h3>Basic Example</h3>
			<p>Get started with basic tabs using a simple string array:</p>

			<StoryViewer {...storyBuilder.getExample('intro')} />
		</div>
	</section>

	<!-- Orientation -->
	<section class="mb-12">
		<h2>Tab Orientation</h2>
		<p>
			Learn how to control tab positioning and alignment with the `below` and `align` properties.
		</p>

		<StoryViewer {...storyBuilder.getExample('orientation')} />
	</section>

	<!-- Object Data -->
	<section class="mb-12">
		<h2>Object Data</h2>
		<p>
			Use arrays of objects with the Tabs component, utilizing the built-in Text component for
			rendering.
		</p>

		<StoryViewer {...storyBuilder.getExample('object')} />
	</section>

	<!-- Field Mapping -->
	<section class="mb-12">
		<h2>Field Mapping</h2>
		<p>
			Adapt the Tabs component to your data structure using the `fields` property for flexible
			attribute mapping.
		</p>

		<StoryViewer {...storyBuilder.getExample('fields')} />

		<!-- Properties Documentation -->
		<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h3>Properties</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<strong>options</strong>: Supply the data for the tabs (array of strings or objects)
					</li>
					<li><strong>value</strong>: Current selected value of the tabs (bindable)</li>
					<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
					<li><strong>below</strong>: Position tabs below content (default: false)</li>
					<li>
						<strong>align</strong>: Tab alignment - 'left', 'center', or 'right' (default: 'left')
					</li>
				</ul>
			</div>

			<div data-card>
				<h3>Advanced Properties</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<strong>using</strong>: Object containing components to be used for displaying data
					</li>
					<li><strong>class</strong>: Set custom class for style overrides</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Custom Components -->
	<section class="mb-12">
		<h2>Custom Components</h2>
		<p>
			Implement custom components with the `using` property for advanced tab functionality and
			styling.
		</p>

		<StoryViewer {...storyBuilder.getExample('using')} />
	</section>

	<!-- Best Practices -->
	<section class="mb-12">
		<h2>Best Practices</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div data-card>
				<h3>Design Guidelines</h3>
				<ul class="space-y-2 text-sm">
					<li>Keep the number of tabs to a minimum for optimal user experience</li>
					<li>Use descriptive tab labels that clearly indicate content</li>
					<li>Consider using icons or images to enhance visual appeal</li>
				</ul>
			</div>
			<div data-card>
				<h3>Technical Considerations</h3>
				<ul class="space-y-2 text-sm">
					<li>Ensure proper keyboard navigation support</li>
					<li>Test with different screen sizes to ensure responsive behavior</li>
					<li>Consider using semantic HTML for accessibility</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Explore More Components</h3>
		<p>
			Now that you understand how the Tabs component works, explore other navigation and data-driven
			components.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/elements/list"
				class="button is-primary"
			>
				Lists
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/table"
				class="button is-primary"
			>
				Tables
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>
