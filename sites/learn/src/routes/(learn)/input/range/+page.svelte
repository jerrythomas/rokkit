<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Range - Input | Learn Rokkit</title>
	<meta
		name="description"
		content="A range input that allows users to select a value from a range"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🎚️</span>Range Component</h1>
				<p>
					A range input that allows users to select a value from a range
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Range input can be used to select a value between two values. The value can be changed by using the mouse or keyboard navigation.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Mouse and keyboard interaction support</li>
			<li>Customizable min, max, and step values</li>
			<li>Optional tick marks and labels</li>
			<li>Accessible with proper ARIA attributes</li>
			<li>Smooth animations and visual feedback</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's a simple example of a Range component. Drag the handle or use arrow keys to change the value:
		</p>

		<StoryViewer {...storyBuilder.getExample('properties')} />
	</section>

	<!-- Properties -->
	<section>
		<h2>Properties</h2>
		<p>
			The Range component provides several properties to customize its behavior and appearance.
		</p>

		<!-- Properties Documentation -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Core Properties</h4>
				<ul>
					<li><strong>value</strong>: Current selected value of the range</li>
					<li><strong>min</strong>: Minimum value of the range (default: 0)</li>
					<li><strong>max</strong>: Maximum value of the range (default: 100)</li>
					<li><strong>steps</strong>: Step size of the range (default: 0 for continuous)</li>
				</ul>
			</div>

			<div data-card>
				<h4>Visual Properties</h4>
				<ul>
					<li><strong>tickStep</strong>: Step size of tick marks (default: no ticks)</li>
					<li><strong>labelSkip</strong>: Number of labels to skip (default: 0)</li>
					<li><strong>class</strong>: Custom CSS classes for styling</li>
				</ul>
			</div>
		</div>

		<p>Here's the basic property configuration:</p>
		<Code {...storyBuilder.getFragment(0)} />
	</section>

	<!-- Tick Marks -->
	<section>
		<h2>Tick Marks</h2>
		<p>
			You can add visual tick marks to help users understand the scale of the range. Tick marks can be configured with custom step sizes.
		</p>

		<StoryViewer {...storyBuilder.getExample('ticks')} />

		<p>Configure tick marks using the tickStep property:</p>
		<Code {...storyBuilder.getFragment(1)} />
	</section>

	<!-- Labels -->
	<section>
		<h2>Labels</h2>
		<p>
			Labels can be displayed at regular intervals to show specific values along the range. You can control label frequency with the labelSkip property.
		</p>

		<StoryViewer {...storyBuilder.getExample('labels')} />

		<p>Configure labels with appropriate skipping:</p>
		<Code {...storyBuilder.getFragment(2)} />
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand how the Range component works, explore other input components like Rating and Calendar, or learn about form integration.
		</p>
		<span>
			<a href="/input/rating" class="button is-primary">
				Rating
				<span class="ml-2">→</span>
			</a>
			<a href="/input/inputfield" class="button is-primary">
				Input Field
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>