<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
	import { resolve } from '$app/paths'
</script>

<article data-article-root>
	<h2>Notable features:</h2>
	<ul>
		<li>Multiple value selection with checkboxes</li>
		<li>Field mapping to adapt to any data structure</li>
		<li>Placeholder text support for empty states</li>
		<li>Keyboard navigation and accessibility support</li>
		<li>Custom component rendering with `using` property</li>
		<li>Search and filtering capabilities</li>
	</ul>

	<h2>Basic Example</h2>
	<p>
		Here's a simple example of a MultiSelect component. Select multiple options to see how the
		selection works:
	</p>

	<StoryViewer {...storyBuilder.getExample('properties')} />
	<h2>Properties</h2>
	<p>
		The MultiSelect component provides comprehensive properties for multi-value form integration.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>options</strong>: Array of options to choose from</li>
				<li><strong>value</strong>: Array of selected values (bindable)</li>
				<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
				<li><strong>placeholder</strong>: Text displayed when no values are selected</li>
			</ul>
		</div>

		<div data-card>
			<h3>Customization</h3>
			<ul>
				<li><strong>using</strong>: Object containing components for displaying data</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>
	</div>

	<Code {...storyBuilder.getFragment(0)} />
	<h2>Field Mapping</h2>
	<p>
		Like other Rokkit components, MultiSelect can adapt to your data structure using field mappings
		for complex objects.
	</p>

	<StoryViewer {...storyBuilder.getExample('fields')} />

	<Code {...storyBuilder.getFragment(1)} />

</article>
