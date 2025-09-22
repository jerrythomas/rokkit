<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		A simple Calendar component that provides an intuitive interface for date selection. This
		component is currently in development (labs) and provides basic calendar functionality.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Intuitive month and year navigation</li>
		<li>Keyboard navigation support</li>
		<li>Accessible design with proper ARIA attributes</li>
		<li>Clean, minimal styling that adapts to your theme</li>
		<li>Date selection with visual feedback</li>
	</ul>

	<h1>Basic Example</h1>
	<p>Here's a simple example of a Calendar component. Click on any date to select it:</p>

	<StoryViewer {...storyBuilder.getExample('basic')} />
	<h1>Basic Usage</h1>
	<p>
		The Calendar component can be used in its simplest form without any configuration. It provides a
		standard calendar view with month navigation.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<div data-card>
		<h1>Development Status</h1>
		<p>
			This component is currently in <strong>labs</strong> status, meaning it's under active development.
			Features and API may change as we gather feedback and improve the component.
		</p>
	</div>
	<h1>Coming Soon</h1>
	<p>We're actively working on expanding the Calendar component with additional features:</p>

	<ul>
		<li><strong>Date range selection</strong>: Select start and end dates</li>
		<li><strong>Value binding</strong>: Reactive date value with two-way binding</li>
		<li><strong>Min/max dates</strong>: Restrict selectable date ranges</li>
		<li><strong>Disabled dates</strong>: Disable specific dates or patterns</li>
		<li><strong>Custom formatting</strong>: Customize date display formats</li>
		<li><strong>Localization</strong>: Support for different locales and languages</li>
		<li><strong>Event markers</strong>: Highlight dates with events or special significance</li>
	</ul>

	<!-- Next Steps -->
	<section>
		data-card-cta>
		<h2>Ready for more?</h2>
		<p>Explore other input components or learn about form integration and validation patterns.</p>
		<span>
			<a href="/input/range" class="button is-primary">
				Range
				<span class="ml-2">→</span>
			</a>
			<a href="/input/rating" class="button is-primary">
				Rating
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
