<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import ApiDocsLink from '$lib/components/ApiDocsLink.svelte'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<ApiDocsLink component="select" />
	<h1>Introduction</h1>
	<p>
		Input component that allows users to choose one value from a list of options. This component has
		properties and behavior similar to the List component, but designed specifically for form input.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Dropdown interface for space-efficient selection</li>
		<li>Field mapping to adapt to any data structure</li>
		<li>Placeholder text support for empty states</li>
		<li>Keyboard navigation and accessibility support</li>
		<li>Custom component rendering with `using` property</li>
		<li>Search and filtering capabilities</li>
	</ul>

	<h1>Basic Example</h1>
	<p>
		Here's a simple example of a Select component with placeholder text. Click to open the dropdown
		and select an option:
	</p>

	<StoryViewer {...storyBuilder.getExample('properties')} />
	<h1>Properties</h1>
	<p>
		The Select component provides comprehensive properties for form integration and data adaptation.
	</p>

	<!-- Properties Documentation -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul>
				<li><strong>options</strong>: Array of options to choose from</li>
				<li><strong>value</strong>: Current selected value (bindable)</li>
				<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
				<li><strong>placeholder</strong>: Text displayed when no value is selected</li>
			</ul>
		</div>

		<div data-card>
			<h1>Customization</h1>
			<ul>
				<li><strong>using</strong>: Object containing components for displaying data</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>
	</div>

	<p>Here's the basic usage with string options:</p>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>Field Mapping</h1>
	<p>
		Like other Rokkit components, Select can adapt to your data structure using field mappings. This
		allows you to use objects with custom property names instead of transforming your data.
	</p>

	<StoryViewer {...storyBuilder.getExample('fields')} />

	<p>Example of field mapping with objects:</p>
	<Code {...storyBuilder.getFragment(1)} />

	<h1>Common Field Mappings</h1>
	<p>You can map various properties to customize how your data is displayed:</p>
	<ul>
		<li><strong>text</strong>: The main display text</li>
		<li><strong>image</strong>: Optional image for each option</li>
		<li><strong>icon</strong>: Optional icon for each option</li>
		<li><strong>value</strong>: The actual value when selected (defaults to the object itself)</li>
	</ul>
	<h1>Advanced Usage</h1>
	<p>
		The Select component supports advanced features like custom rendering, search functionality, and
		complex data structures.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Search & Filtering</h1>
			<p>
				Enable search functionality to filter large option lists, making it easier for users to find
				specific items.
			</p>
		</div>

		<div data-card>
			<h1>Custom Rendering</h1>
			<p>
				Use the `using` property to provide custom components for rendering options, enabling rich
				displays with images, badges, or complex layouts.
			</p>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the Select component works, explore MultiSelect for multiple
			selections or learn about other form components.
		</p>
		<span>
			<a href="/elements/multi-select" class="button is-primary">
				MultiSelect
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/menu" class="button is-primary">
				Menu
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
