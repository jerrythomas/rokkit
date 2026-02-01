<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import ApiDocsLink from '$lib/components/ApiDocsLink.svelte'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<ApiDocsLink component="rating" />
	<h1>Introduction</h1>
	<p>
		An input to provide rating values. Recommended for use when values are less than 10. For larger
		values, use the range slider component.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Accessible with proper ARIA attributes and keyboard navigation</li>
		<li>Customizable icons (stars, hearts, thumbs up, etc.)</li>
		<li>Mouse and keyboard interaction support</li>
		<li>Support for number key selection and arrow key navigation</li>
		<li>Form integration with name and id attributes</li>
		<li>Flexible maximum rating values</li>
	</ul>

	<h1>Basic Example</h1>
	<p>
		Here's a simple example of a Rating component. Click on the stars or use number keys to set a
		rating:
	</p>

	<StoryViewer {...storyBuilder.getExample('properties')} />
	<h1>Properties</h1>
	<p>The Rating component provides several properties to customize its behavior and appearance.</p>

	<!-- Properties Documentation -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul>
				<li><strong>value</strong>: Current rating value (bindable)</li>
				<li><strong>max</strong>: Maximum value allowed (default: 5)</li>
				<li><strong>id</strong>: Unique identifier for the rating input</li>
				<li><strong>name</strong>: Name for form integration</li>
			</ul>
		</div>

		<div data-card>
			<h1>Customization</h1>
			<ul>
				<li><strong>stateIcons</strong>: Custom icons for filled/empty states</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>
	</div>

	<p>Here's the basic usage with properties:</p>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>Custom Icons</h1>
	<p>
		By default, the Rating component uses star icons. However, you can easily customize the icons to
		use hearts, thumbs up, or any other icon of your choice.
	</p>

	<StoryViewer {...storyBuilder.getExample('icons')} />

	<p>Configure custom icons using the stateIcons property:</p>
	<Code {...storyBuilder.getFragment(1)} />
	<h1>Accessibility</h1>
	<p>
		The Rating component is built with accessibility in mind and includes comprehensive keyboard and
		screen reader support.
	</p>

	<h1>Keyboard Navigation:</h1>
	<ul>
		<li><strong>Arrow Keys</strong>: Navigate between rating values</li>
		<li><strong>Number Keys (1-9)</strong>: Directly select a rating value</li>
		<li><strong>Space/Enter</strong>: Confirm selection</li>
	</ul>

	<h1>Screen Reader Support:</h1>
	<ul>
		<li>Each icon has proper ARIA roles and labels</li>
		<li>Current rating state is announced to assistive technologies</li>
		<li>Checked/unchecked states are properly conveyed</li>
	</ul>

	<!-- Next Steps -->
	<section>
		data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the Rating component works, explore other input components like
			Range and Calendar, or learn about form integration.
		</p>
		<span>
			<a href="/input/range" class="button is-primary">
				Range
				<span class="ml-2">→</span>
			</a>
			<a href="/input/calendar" class="button is-primary">
				Calendar
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
