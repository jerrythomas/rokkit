<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		The Toggle component is a segmented control that lets users switch between a fixed set of
		options. It provides a compact, visually clear way to select one option from a small group.
	</p>

	<h2>Notable features:</h2>
	<ul>
		<li>Works with string arrays or object arrays</li>
		<li>Field mapping for custom data structures</li>
		<li>Icon and label display</li>
		<li>Full keyboard navigation (Arrow keys, Home, End)</li>
		<li>Accessible with proper ARIA attributes</li>
	</ul>

	<h2>Basic Example</h2>
	<p>Pass an array of strings and bind the selected value:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<p>Basic usage with string options:</p>
	<Code {...storyBuilder.getFragment(0)} />

	<h2>Field Mapping</h2>
	<p>
		Use objects with field mapping to display icons alongside labels. The <code>fields</code> prop maps
		your data attributes to the component's expectations.
	</p>

	<StoryViewer {...storyBuilder.getExample('fields')} />

	<p>Example with icon and label mapping:</p>
	<Code {...storyBuilder.getFragment(1)} />

	<h2>Configuration</h2>
	<p>The Toggle component supports several configuration options for customizing its behavior.</p>

	<StoryViewer {...storyBuilder.getExample('configuration')} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>options</strong>: Array of strings or objects</li>
				<li><strong>value</strong>: Currently selected option (bindable)</li>
				<li><strong>fields</strong>: Field mapping for custom data</li>
				<li><strong>onchange</strong>: Callback when selection changes</li>
			</ul>
		</div>

		<div data-card>
			<h3>Display Options</h3>
			<ul>
				<li><strong>showLabels</strong>: Show text labels (default: true)</li>
				<li><strong>size</strong>: Size variant (default: 'md')</li>
				<li><strong>disabled</strong>: Disable interaction</li>
				<li><strong>class</strong>: Custom CSS classes</li>
			</ul>
		</div>
	</div>

</article>
