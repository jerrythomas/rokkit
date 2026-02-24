<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The ProgressBar component displays progress feedback. It supports both determinate (with a
		specific value) and indeterminate (loading) states.
	</p>

	<h2>Basic Example</h2>
	<p>Drag the slider to change the progress value:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Indeterminate State</h2>
	<p>
		When no <code>value</code> is provided, the progress bar shows an indeterminate loading animation:
	</p>

	<StoryViewer {...storyBuilder.getExample('indeterminate')} />

	<h2>Properties</h2>
	<div data-card>
		<h3>Properties</h3>
		<ul>
			<li><strong>value</strong>: Current progress (null for indeterminate)</li>
			<li><strong>max</strong>: Maximum value (default: 100)</li>
			<li><strong>class</strong>: Additional CSS classes</li>
		</ul>
	</div>

	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Progress indicators work alongside other layout components for complete page structures.</p>
		<span>
			<a href="/elements/carousel" class="button is-primary">
				Carousel
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
