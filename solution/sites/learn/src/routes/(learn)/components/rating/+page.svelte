<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		An input to provide rating values. Recommended for use when values are less than 10. For larger
		values, use the range slider component.
	</p>

	<h2>Basic Example</h2>
	<p>
		Click on the stars or use number keys to set a rating:
	</p>

	<StoryViewer {...storyBuilder.getExample('properties')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Custom Icons</h2>
	<p>
		By default, the Rating component uses star icons. You can customize them to use hearts, thumbs
		up, or any other icon.
	</p>

	<StoryViewer {...storyBuilder.getExample('icons')} />

	<Code {...storyBuilder.getFragment(1)} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>value</strong>: Current rating value (bindable)</li>
				<li><strong>max</strong>: Maximum value allowed (default: 5)</li>
				<li><strong>id</strong>: Unique identifier for the rating input</li>
				<li><strong>name</strong>: Name for form integration</li>
			</ul>
		</div>

		<div data-card>
			<h3>Customization</h3>
			<ul>
				<li><strong>stateIcons</strong>: Custom icons for filled/empty states</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>
	</div>

	<h2>Keyboard Navigation</h2>
	<ul>
		<li><strong>Arrow Keys</strong>: Navigate between rating values</li>
		<li><strong>Number Keys (1-9)</strong>: Directly select a rating value</li>
		<li><strong>Space/Enter</strong>: Confirm selection</li>
	</ul>

</article>
