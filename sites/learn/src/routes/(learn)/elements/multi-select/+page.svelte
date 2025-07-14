<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root><h1>Introduction</h1>
		<p>
			Input component that allows users to choose multiple values from a list of options. This component has properties and behavior similar to the List component, but designed for multi-selection scenarios.
		</p>

		<h1>Notable features:</h1>
		<ul>
			<li>Multiple value selection with checkboxes</li>
			<li>Field mapping to adapt to any data structure</li>
			<li>Placeholder text support for empty states</li>
			<li>Keyboard navigation and accessibility support</li>
			<li>Custom component rendering with `using` property</li>
			<li>Search and filtering capabilities</li>
		</ul>

		<h1>Basic Example</h1>
		<p>
			Here's a simple example of a MultiSelect component. Select multiple options to see how the selection works:
		</p>

		<StoryViewer {...storyBuilder.getExample('properties')} />
<h1>Properties</h1>
		<p>
			The MultiSelect component provides comprehensive properties for multi-value form integration.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Core Properties</h1>
				<ul>
					<li><strong>options</strong>: Array of options to choose from</li>
					<li><strong>value</strong>: Array of selected values (bindable)</li>
					<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
					<li><strong>placeholder</strong>: Text displayed when no values are selected</li>
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

		<Code {...storyBuilder.getFragment(0)} />
<h1>Field Mapping</h1>
		<p>
			Like other Rokkit components, MultiSelect can adapt to your data structure using field mappings for complex objects.
		</p>

		<StoryViewer {...storyBuilder.getExample('fields')} />

		<Code {...storyBuilder.getFragment(1)} />
	
<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the MultiSelect component works, explore other selection components or learn about form integration.
		</p>
		<span>
			<a href="/elements/select" class="button is-primary">
				Select
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/switch" class="button is-primary">
				Switch
				<span class="ml-2">→</span>
			</a>
		</span>
	
</article>