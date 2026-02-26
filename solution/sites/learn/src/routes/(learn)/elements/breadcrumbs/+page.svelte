<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The BreadCrumbs component displays a navigation trail showing the user's current location within
		a hierarchy. Each crumb is clickable to navigate back to a parent level.
	</p>

	<h2>Basic Example</h2>
	<p>A breadcrumb trail with icons on the first two items:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>items</strong>: Array of breadcrumb items</li>
				<li><strong>fields</strong>: Custom field mappings</li>
				<li><strong>onclick</strong>: Callback when a crumb is clicked</li>
				<li><strong>separator</strong>: Separator icon (default: chevron-right)</li>
			</ul>
		</div>

		<div data-card>
			<h3>Customization</h3>
			<ul>
				<li><strong>crumb</strong>: Custom snippet for rendering each crumb</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>
	</div>

	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>BreadCrumbs pairs well with Toolbar for navigation bars and Menu for contextual actions.</p>
		<span>
			<a href="/elements/toolbar" class="button is-primary">
				Toolbar
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/menu" class="button is-primary">
				Menu
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
