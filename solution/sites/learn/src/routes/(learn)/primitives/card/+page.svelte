<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The Card component provides a container with structured layout zones for header, body, and
		footer content. It can render as a plain container, a clickable element, or a link.
	</p>

	<h2>Basic Example</h2>
	<p>Cards can hold any content, link to URLs, or handle click events:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Header & Footer Snippets</h2>
	<p>
		Use the <code>header</code> and <code>footer</code> snippets to add structured sections with
		consistent spacing and dividers.
	</p>

	<StoryViewer {...storyBuilder.getExample('snippets')} />

	<Code {...storyBuilder.getFragment(1)} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>href</strong>: Render as a link</li>
				<li><strong>onclick</strong>: Click handler</li>
				<li><strong>class</strong>: Custom CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h3>Snippets</h3>
			<ul>
				<li><strong>header</strong>: Card header area</li>
				<li><strong>footer</strong>: Card footer area</li>
				<li><strong>children</strong>: Card body (default slot)</li>
			</ul>
		</div>
	</div>

	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Cards work well with other layout and display components.</p>
		<span>
			<a href="/primitives/button" class="button is-primary">
				Button
				<span class="ml-2">→</span>
			</a>
			<a href="/primitives/pill" class="button is-primary">
				Pill
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
