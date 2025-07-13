<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Rating - Input | Learn Rokkit</title>
	<meta
		name="description"
		content="An input component that allows selection of a rating value using icons"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>⭐</span>Rating Component</h1>
				<p>
					An input component that allows selection of a rating value using icons
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			An input to provide rating values. Recommended for use when values are less than 10. For larger values, use the range slider component.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Accessible with proper ARIA attributes and keyboard navigation</li>
			<li>Customizable icons (stars, hearts, thumbs up, etc.)</li>
			<li>Mouse and keyboard interaction support</li>
			<li>Support for number key selection and arrow key navigation</li>
			<li>Form integration with name and id attributes</li>
			<li>Flexible maximum rating values</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's a simple example of a Rating component. Click on the stars or use number keys to set a rating:
		</p>

		<StoryViewer {...storyBuilder.getExample('properties')} />
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<p>
			The Rating component provides several properties to customize its behavior and appearance.
		</p>

		<!-- Properties Documentation -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Properties</h4>
				<ul>
					<li><strong>value</strong>: Current rating value (bindable)</li>
					<li><strong>max</strong>: Maximum value allowed (default: 5)</li>
					<li><strong>id</strong>: Unique identifier for the rating input</li>
					<li><strong>name</strong>: Name for form integration</li>
				</ul>
			</div>

			<div data-card>
				<h4>Customization</h4>
				<ul>
					<li><strong>stateIcons</strong>: Custom icons for filled/empty states</li>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>
		</div>

		<p>Here's the basic usage with properties:</p>
		<Code {...storyBuilder.getFragment(0)} />
	</section>

	<!-- Custom Icons -->
	<section>
		<h2>Custom Icons</h2>
		<p>
			By default, the Rating component uses star icons. However, you can easily customize the icons to use hearts, thumbs up, or any other icon of your choice.
		</p>

		<StoryViewer {...storyBuilder.getExample('icons')} />

		<p>Configure custom icons using the stateIcons property:</p>
		<Code {...storyBuilder.getFragment(1)} />
	</section>

	<!-- Accessibility -->
	<section>
		<h2>Accessibility</h2>
		<p>
			The Rating component is built with accessibility in mind and includes comprehensive keyboard and screen reader support.
		</p>

		<h3>Keyboard Navigation:</h3>
		<ul>
			<li><strong>Arrow Keys</strong>: Navigate between rating values</li>
			<li><strong>Number Keys (1-9)</strong>: Directly select a rating value</li>
			<li><strong>Space/Enter</strong>: Confirm selection</li>
		</ul>

		<h3>Screen Reader Support:</h3>
		<ul>
			<li>Each icon has proper ARIA roles and labels</li>
			<li>Current rating state is announced to assistive technologies</li>
			<li>Checked/unchecked states are properly conveyed</li>
		</ul>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand how the Rating component works, explore other input components like Range and Calendar, or learn about form integration.
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