<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import ApiDocsLink from '$lib/components/ApiDocsLink.svelte'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<ApiDocsLink component="range" />
	<h1>Introduction</h1>
	<p>
		Range input can be used to select a value between two values. The value can be changed by using
		the mouse or keyboard navigation.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Mouse and keyboard interaction support</li>
		<li>Customizable min, max, and step values</li>
		<li>Optional tick marks and labels</li>
		<li>Accessible with proper ARIA attributes</li>
		<li>Smooth animations and visual feedback</li>
	</ul>

	<h1>Basic Example</h1>
	<p>
		Here's a simple example of a Range component. Drag the handle or use arrow keys to change the
		value:
	</p>

	<StoryViewer {...storyBuilder.getExample('properties')} />
	<h1>Properties</h1>
	<p>The Range component provides several properties to customize its behavior and appearance.</p>

	<!-- Properties Documentation -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul>
				<li><strong>value</strong>: Current selected value of the range</li>
				<li><strong>min</strong>: Minimum value of the range (default: 0)</li>
				<li><strong>max</strong>: Maximum value of the range (default: 100)</li>
				<li><strong>steps</strong>: Step size of the range (default: 0 for continuous)</li>
			</ul>
		</div>

		<div data-card>
			<h1>Visual Properties</h1>
			<ul>
				<li><strong>tickStep</strong>: Step size of tick marks (default: no ticks)</li>
				<li><strong>labelSkip</strong>: Number of labels to skip (default: 0)</li>
				<li><strong>class</strong>: Custom CSS classes for styling</li>
			</ul>
		</div>
	</div>

	<p>Here's the basic property configuration:</p>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>Tick Marks</h1>
	<p>
		You can add visual tick marks to help users understand the scale of the range. Tick marks can be
		configured with custom step sizes.
	</p>

	<StoryViewer {...storyBuilder.getExample('ticks')} />

	<p>Configure tick marks using the tickStep property:</p>
	<Code {...storyBuilder.getFragment(1)} />
	<h1>Labels</h1>
	<p>
		Labels can be displayed at regular intervals to show specific values along the range. You can
		control label frequency with the labelSkip property.
	</p>

	<StoryViewer {...storyBuilder.getExample('labels')} />

	<p>Configure labels with appropriate skipping:</p>
	<Code {...storyBuilder.getFragment(2)} />

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the Range component works, explore other input components like
			Rating and Calendar, or learn about form integration.
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
