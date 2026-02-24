<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The Button component provides a flexible interactive element with support for icons, loading
		states, and link behavior.
	</p>

	<h2>Basic Example</h2>
	<p>Buttons support labels, icons, disabled and loading states:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<p>Basic button usage:</p>
	<Code {...storyBuilder.getFragment(0)} />

	<h2>Variants</h2>
	<p>
		Buttons can render as icon-only, with left or right icons, or as links using the
		<code>href</code> prop.
	</p>

	<StoryViewer {...storyBuilder.getExample('variants')} />

	<Code {...storyBuilder.getFragment(1)} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>label</strong>: Button text</li>
				<li><strong>icon</strong>: Left icon class</li>
				<li><strong>iconRight</strong>: Right icon class</li>
				<li><strong>onclick</strong>: Click handler</li>
				<li><strong>type</strong>: Button type (default: 'button')</li>
			</ul>
		</div>

		<div data-card>
			<h3>States & Links</h3>
			<ul>
				<li><strong>disabled</strong>: Disable interaction</li>
				<li><strong>loading</strong>: Show loading spinner</li>
				<li><strong>href</strong>: Render as link</li>
				<li><strong>target</strong>: Link target attribute</li>
				<li><strong>class</strong>: Custom CSS classes</li>
			</ul>
		</div>
	</div>

	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Buttons are used throughout other components. Explore toolbar for grouped button actions.</p>
		<span>
			<a href="/elements/toolbar" class="button is-primary">
				Toolbar
				<span class="ml-2">→</span>
			</a>
			<a href="/primitives/card" class="button is-primary">
				Card
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
