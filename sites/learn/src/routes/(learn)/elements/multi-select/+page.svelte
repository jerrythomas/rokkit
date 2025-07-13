<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>MultiSelect - Elements | Learn Rokkit</title>
	<meta
		name="description"
		content="Input component that allows users to choose multiple values from a list of options"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>☑️</span>MultiSelect Component</h1>
				<p>
					Input component that allows users to choose multiple values from a list of options
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Input component that allows users to choose multiple values from a list of options. This component has properties and behavior similar to the List component, but designed for multi-selection scenarios.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Multiple value selection with checkboxes</li>
			<li>Field mapping to adapt to any data structure</li>
			<li>Placeholder text support for empty states</li>
			<li>Keyboard navigation and accessibility support</li>
			<li>Custom component rendering with `using` property</li>
			<li>Search and filtering capabilities</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's a simple example of a MultiSelect component. Select multiple options to see how the selection works:
		</p>

		<StoryViewer {...storyBuilder.getExample('properties')} />
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<p>
			The MultiSelect component provides comprehensive properties for multi-value form integration.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Properties</h4>
				<ul>
					<li><strong>options</strong>: Array of options to choose from</li>
					<li><strong>value</strong>: Array of selected values (bindable)</li>
					<li><strong>fields</strong>: Adapt to your data by customizing field mappings</li>
					<li><strong>placeholder</strong>: Text displayed when no values are selected</li>
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

		<Code {...storyBuilder.getFragment(0)} />
	</section>

	<!-- Field Mapping -->
	<section>
		<h2>Field Mapping</h2>
		<p>
			Like other Rokkit components, MultiSelect can adapt to your data structure using field mappings for complex objects.
		</p>

		<StoryViewer {...storyBuilder.getExample('fields')} />

		<Code {...storyBuilder.getFragment(1)} />
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
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
	</section>
</article>