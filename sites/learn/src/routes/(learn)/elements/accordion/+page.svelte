<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<!-- <svelte:head>
	<title>Accordion - Elements | Learn Rokkit</title>
	<meta
		name="description"
		content="A collection of items that can be expanded and collapsed"
	/>
</svelte:head> -->

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🪗</span>Accordion Component</h1>
				<p>A collection of items that can be expanded and collapsed</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			An accordion consists of multiple sections, each section contains a heading and content. Users
			can click on the headings to expand or collapse a section revealing the content within.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Get started with a nested object array using sane defaults</li>
			<li>Attributes like text, icon, image or url can be mapped to data attributes</li>
			<li>
				Default item components like Text & Link are available, with support for custom components
			</li>
			<li>Configure different components for different items based on data attributes</li>
			<li>Automatic closing of previous sections (optional)</li>
			<li>Keyboard navigation and accessibility support</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's a simple example of an Accordion component with nested data. Click on sections to
			expand/collapse them:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<p>
			The Accordion component provides several properties to customize its behavior and adapt to
			your data structure.
		</p>

		<!-- Properties Documentation -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Properties</h4>
				<ul>
					<li><strong>items</strong>: Supply the nested data for the accordion</li>
					<li><strong>value</strong>: Current selected value of the accordion (bindable)</li>
					<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
					<li>
						<strong>autoClose</strong>: Enable automatic closing of other sections (default: false)
					</li>
				</ul>
			</div>

			<div data-card>
				<h4>Customization</h4>
				<ul>
					<li><strong>using</strong>: Object containing components for displaying data</li>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>
		</div>

		<p>Here's the basic usage with nested data:</p>
		<Code {...storyBuilder.getFragment(0)} />
	</section>

	<!-- Field Mapping -->
	<section>
		<h2>Field Mapping</h2>
		<p>
			The accordion displays content using the Text component, expecting `text` attributes and
			optional `icon` or `image` attributes. However, API data may not match this structure. Use the
			fields attribute to adapt the accordion to your data.
		</p>

		<p>
			Since accordion is a nested structure, it expects a nested array. If your data doesn't have
			nested elements, consider using a List component instead.
		</p>

		<StoryViewer {...storyBuilder.getExample('fields')} />

		<p>Example of mapping custom field names:</p>
		<Code {...storyBuilder.getFragment(1)} />

		<h3>Nested Field Mapping</h3>
		<p>
			The accordion supports nested field mapping for complex data structures. You can map both the
			outer section fields and the inner content fields:
		</p>
		<Code {...storyBuilder.getFragment(2)} />
	</section>

	<!-- Custom Components -->
	<section>
		<h2>Custom Components</h2>
		<p>
			You can use custom components to render accordion content. This allows for rich content
			display with images, links, and interactive elements.
		</p>

		<StoryViewer {...storyBuilder.getExample('using')} />

		<p>Configure custom components using the `using` property:</p>
		<Code {...storyBuilder.getFragment(3)} />
	</section>

	<!-- Mixed Components -->
	<section>
		<h2>Mixed Components</h2>
		<p>
			For advanced use cases, you can configure different components for different items based on
			data attributes. This enables rich, varied content within a single accordion.
		</p>

		<StoryViewer {...storyBuilder.getExample('mixed')} />

		<p>Configure component selection based on data attributes:</p>
		<Code {...storyBuilder.getFragment(4)} />
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand how the Accordion component works, explore other data-driven
			components like Tables and Trees, or learn about form components.
		</p>
		<span>
			<a href="/elements/table" class="button is-primary">
				Table
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/tree" class="button is-primary">
				Tree
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
